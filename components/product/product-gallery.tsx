"use client";

import Image, { type ImageProps } from "next/image";
import { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

function ZoomableModalViewer({
  src,
  alt,
  onPrev,
  onNext,
  hasMultiple,
}: {
  src: string;
  alt: string;
  onPrev?: () => void;
  onNext?: () => void;
  hasMultiple?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Hardware-accelerated direct values for buttery 120fps tracking without React re-render jank
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });

  // Gesture tracking
  const initialPinchDistRef = useRef(0);
  const initialPinchScaleRef = useRef(1);
  const initialPinchPosRef = useRef({ x: 0, y: 0 });
  const isPinchingRef = useRef(false);
  const isPanningRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef(0);

  const setTransform = (scale: number, x: number, y: number, animate = false) => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    if (animate) {
      el.style.transition = "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)";
    } else {
      el.style.transition = "none";
    }
    el.style.transform = `translate3d(${x}px, ${y}px, 0px) scale(${scale})`;
    scaleRef.current = scale;
    posRef.current = { x, y };
  };

  const getBounds = (scale: number) => {
    const container = containerRef.current;
    if (!container) return { maxX: 0, maxY: 0 };
    const maxX = Math.max(0, (container.clientWidth * (scale - 1)) / 2);
    const maxY = Math.max(0, (container.clientHeight * (scale - 1)) / 2);
    return { maxX, maxY };
  };

  const clampPosition = (scale: number, x: number, y: number) => {
    const { maxX, maxY } = getBounds(scale);
    return {
      x: Math.min(Math.max(x, -maxX), maxX),
      y: Math.min(Math.max(y, -maxY), maxY),
    };
  };

  // Reset zoom on image change
  useEffect(() => {
    setTransform(1, 0, 0, false);
  }, [src]);

  const resetZoom = useCallback(() => {
    setTransform(1, 0, 0, true);
  }, []);

  const smoothZoomTo = useCallback((targetScale: number, clientX?: number, clientY?: number) => {
    const clampedScale = Math.min(Math.max(targetScale, 1), 4);
    if (clampedScale <= 1.08) {
      resetZoom();
      return;
    }

    const container = containerRef.current;
    if (container && clientX !== undefined && clientY !== undefined) {
      const rect = container.getBoundingClientRect();
      const originX = clientX - rect.left - rect.width / 2;
      const originY = clientY - rect.top - rect.height / 2;
      const targetX = -originX * 0.9;
      const targetY = -originY * 0.9;
      const clamped = clampPosition(clampedScale, targetX, targetY);
      setTransform(clampedScale, clamped.x, clamped.y, true);
    } else {
      const clamped = clampPosition(clampedScale, posRef.current.x, posRef.current.y);
      setTransform(clampedScale, clamped.x, clamped.y, true);
    }
  }, [resetZoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start
        e.preventDefault();
        isPinchingRef.current = true;
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialPinchDistRef.current = dist;
        initialPinchScaleRef.current = scaleRef.current;
        initialPinchPosRef.current = { x: posRef.current.x, y: posRef.current.y };
        if (contentRef.current) contentRef.current.style.transition = "none";
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        const now = Date.now();

        // Double-tap to zoom quickly and smoothly
        if (now - lastTapRef.current < 280) {
          e.preventDefault();
          if (scaleRef.current > 1.2) {
            resetZoom();
          } else {
            smoothZoomTo(2.8, touch.clientX, touch.clientY);
          }
          lastTapRef.current = 0;
          return;
        }
        lastTapRef.current = now;

        if (scaleRef.current > 1.05) {
          // Pan when zoomed
          e.preventDefault();
          isPanningRef.current = true;
          dragStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            posX: posRef.current.x,
            posY: posRef.current.y,
          };
          if (contentRef.current) contentRef.current.style.transition = "none";
        } else {
          // Swipe when unzoomed
          swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinchingRef.current) {
        // Pinching - fast increase & smooth return to center when zooming out
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (initialPinchDistRef.current > 0) {
          const rawRatio = dist / initialPinchDistRef.current;
          let nextScale: number;

          if (rawRatio >= 1) {
            // Increase fast! (2.6x multiplier for quick scale-up)
            const fastFactor = 1 + (rawRatio - 1) * 2.6;
            nextScale = Math.min(initialPinchScaleRef.current * fastFactor, 5);
          } else {
            // Zoom out fast!
            const shrinkFactor = Math.max(0.5, 1 - (1 - rawRatio) * 2.0);
            nextScale = initialPinchScaleRef.current * shrinkFactor;
          }

          // When zooming out: smoothly bring the image position back to center (0, 0)
          let nextX = posRef.current.x;
          let nextY = posRef.current.y;

          if (nextScale <= 1.05) {
            nextX = 0;
            nextY = 0;
          } else if (initialPinchScaleRef.current > 1.05) {
            const returnRatio = Math.min(1, Math.max(0, (nextScale - 1) / (initialPinchScaleRef.current - 1)));
            nextX = initialPinchPosRef.current.x * returnRatio;
            nextY = initialPinchPosRef.current.y * returnRatio;
          }

          const clamped = clampPosition(nextScale, nextX, nextY);
          setTransform(nextScale, clamped.x, clamped.y, false);
        }
      } else if (e.touches.length === 1 && isPanningRef.current && scaleRef.current > 1.05) {
        // Panning - direct 1:1 finger tracking
        e.preventDefault();
        const touch = e.touches[0];
        const dx = touch.clientX - dragStartRef.current.x;
        const dy = touch.clientY - dragStartRef.current.y;
        const nextX = dragStartRef.current.posX + dx;
        const nextY = dragStartRef.current.posY + dy;
        const clamped = clampPosition(scaleRef.current, nextX, nextY);
        setTransform(scaleRef.current, clamped.x, clamped.y, false);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      isPinchingRef.current = false;
      isPanningRef.current = false;

      // Spring back smoothly to 1x & center if released below 1.1x
      if (scaleRef.current <= 1.1) {
        setTransform(1, 0, 0, true);
      } else {
        const clamped = clampPosition(scaleRef.current, posRef.current.x, posRef.current.y);
        setTransform(scaleRef.current, clamped.x, clamped.y, true);
      }

      // Swipe navigation when at normal scale
      if (scaleRef.current <= 1.05 && swipeStartRef.current && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - swipeStartRef.current.x;
        const dy = touch.clientY - swipeStartRef.current.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0 && onPrev) onPrev();
          else if (dx < 0 && onNext) onNext();
        }
      }
      swipeStartRef.current = null;
    };

    let wheelTimeout: NodeJS.Timeout | null = null;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Fast, responsive wheel zoom
      const delta = -e.deltaY * 0.005;
      const nextScale = Math.min(Math.max(scaleRef.current * (1 + delta), 1), 4.5);
      if (nextScale <= 1.05) {
        setTransform(1, 0, 0, true);
      } else {
        // Pull back towards center when zooming out
        const factor = Math.min(1, Math.max(0, (nextScale - 1) / 3));
        const clamped = clampPosition(nextScale, posRef.current.x * factor, posRef.current.y * factor);
        setTransform(nextScale, clamped.x, clamped.y, false);
      }

      if (wheelTimeout) clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (scaleRef.current <= 1.05) {
          setTransform(1, 0, 0, true);
        } else {
          const clamped = clampPosition(scaleRef.current, posRef.current.x, posRef.current.y);
          setTransform(scaleRef.current, clamped.x, clamped.y, true);
        }
      }, 70);
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("wheel", handleWheel);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [onPrev, onNext, resetZoom, smoothZoomTo]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scaleRef.current <= 1.05) return;
    e.preventDefault();
    isPanningRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: posRef.current.x,
      posY: posRef.current.y,
    };
    if (contentRef.current) contentRef.current.style.transition = "none";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanningRef.current || scaleRef.current <= 1.05) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nextX = dragStartRef.current.posX + dx;
    const nextY = dragStartRef.current.posY + dy;
    const clamped = clampPosition(scaleRef.current, nextX, nextY);
    setTransform(scaleRef.current, clamped.x, clamped.y, false);
  };

  const handleMouseUp = () => {
    if (!isPanningRef.current) return;
    isPanningRef.current = false;
    const clamped = clampPosition(scaleRef.current, posRef.current.x, posRef.current.y);
    setTransform(scaleRef.current, clamped.x, clamped.y, true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (scaleRef.current > 1.2) {
      resetZoom();
    } else {
      smoothZoomTo(2.6, e.clientX, e.clientY);
    }
  };

  return (
    <div className="relative h-full w-full select-none overflow-hidden flex items-center justify-center">
      {/* ZOOMABLE IMAGE CONTAINER */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ touchAction: "none" }}
        className="relative h-full w-full overflow-hidden flex items-center justify-center cursor-zoom-in"
      >
        <div
          ref={contentRef}
          style={{
            transform: "translate3d(0px, 0px, 0px) scale(1)",
            transformOrigin: "center center",
            willChange: "transform",
          }}
          className="relative h-full w-full flex items-center justify-center"
        >
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            draggable={false}
            className="object-contain pointer-events-none select-none"
            sizes="100vw"
          />
        </div>
      </div>
    </div>
  );
}

function ZoomImage({ onZoom, ...props }: ImageProps & { onZoom: () => void }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [hovered, setHovered] = useState(false);
  return <button type="button" aria-label={`Zoom ${props.alt}`} onClick={onZoom}
    onPointerMove={event => {
      if (event.pointerType !== "mouse") return;
      const bounds = event.currentTarget.getBoundingClientRect();
      setOrigin(`${(event.clientX - bounds.left) / bounds.width * 100}% ${(event.clientY - bounds.top) / bounds.height * 100}%`);
      setHovered(true);
    }} onPointerLeave={() => setHovered(false)}
    className="absolute inset-0 h-full w-full cursor-zoom-in overflow-hidden rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500">
    <Image {...props} alt={props.alt} draggable={false} style={{ ...props.style, transformOrigin: origin, transform: hovered ? "scale(2)" : "scale(1)", transition: "transform 150ms ease-out" } as CSSProperties} />
  </button>;
}

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const productImages = images;
  const heroImage = images[0];
  const additionalImages = productImages.slice(1);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const galleryRef = useRef<HTMLDivElement>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [popupIndex, setPopupIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const showImage = (index: number) => { setPopupIndex(index); setOpen(true); };
  const move = (direction: number) => { setPopupIndex(index => (index + direction + images.length) % images.length); };

  // Pause on touch / drag interaction
  useEffect(() => {
    if (!api) return;

    const onPointerDown = () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      setIsPaused(true);
    };

    const onPointerUp = () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
      }, 1500);
    };

    api.on("pointerDown", onPointerDown);
    api.on("pointerUp", onPointerUp);

    return () => {
      api.off("pointerDown", onPointerDown);
      api.off("pointerUp", onPointerUp);
    };
  }, [api]);

  // Track slide index changes
  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setActiveImageIndex(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Auto-pause when not in viewport
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-pause when browser tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Auto-move gallery carousel timer
  useEffect(() => {
    if (!api || productImages.length <= 1 || isPaused || !isInView || open) return;

    const timer = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [api, productImages.length, isPaused, isInView, open, activeImageIndex]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  return <>
            {/* DESKTOP VIEW: ORIGINAL MULTI-IMAGE SHOWCASE */}
            <div className="hidden lg:block space-y-4 sm:space-y-6">
              {/* Primary Hero Feature Image */}
              <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden rounded-lg sm:rounded-xl flex items-center justify-center">
                <ZoomImage
                  onZoom={() => showImage(0)}
                  src={heroImage}
                  alt={name}
                  fill
                  priority
                  className="object-contain transition-transform duration-500 hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
              </div>

              {/* Gallery Grid Below Hero Image */}
              {additionalImages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {additionalImages.map((image, idx) => (
                    <div
                      key={`${image}-${idx}`}
                      className="relative aspect-square w-full overflow-hidden rounded-lg sm:rounded-xl flex items-center justify-center group"
                    >
                      <ZoomImage
                        onZoom={() => showImage(idx + 1)}
                        src={image}
                        alt={`${name} feature ${idx + 1}`}
                        fill
                        className="object-contain transition-transform duration-500 hover:scale-[1.02]"
                        sizes="(min-width: 1024px) 28vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MOBILE / PHONE VIEW: CAROUSEL WITH SWIPE, ARROWS & EXTENDED PILL INDICATOR */}
            <div
              ref={galleryRef}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="lg:hidden flex flex-col items-center w-full"
            >
              {/* Primary Product Image Carousel with Smooth Sliding & Touch Swipe Support */}
              <Carousel
                setApi={setApi}
                opts={{
                  loop: productImages.length > 1,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-0">
                  {productImages.map((image, idx) => (
                    <CarouselItem key={`${image}-${idx}`} className="pl-0 basis-full">
                      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white flex items-center justify-center select-none shadow-xs border border-slate-100">
                        <button
                          type="button"
                          aria-label={`Enlarge ${name} image ${idx + 1}`}
                          onClick={() => showImage(idx)}
                          className="relative h-full w-full flex items-center justify-center cursor-zoom-in"
                        >
                          <Image
                            src={image}
                            alt={`${name} image ${idx + 1}`}
                            fill
                            priority={idx === 0}
                            className="object-contain rounded-2xl"
                            sizes="100vw"
                          />
                        </button>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* GALLERY CONTROLS ROW: END-TO-END ARROWS WITH CENTERED PAGINATION */}
              {productImages.length > 1 && (
                <div className="flex items-center justify-between w-full px-2 pt-5 pb-2.5 select-none">
                  {/* PREV ARROW (FAR LEFT) */}
                  <button
                    type="button"
                    onClick={() => api?.scrollPrev()}
                    aria-label="Previous image"
                    className="p-2 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer active:scale-90"
                  >
                    <ArrowLeft className="size-5 stroke-[1.75]" />
                  </button>

                  {/* PAGINATION: EXTENDED ACTIVE PILL & ROUND DOTS (CENTERED) */}
                  <div className="flex items-center justify-center gap-2 mx-auto">
                    {productImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => api?.scrollTo(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          activeImageIndex === idx
                            ? "w-8 h-2 bg-[#0a7ae6]"
                            : "size-2 bg-slate-300 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>

                  {/* NEXT ARROW (FAR RIGHT) */}
                  <button
                    type="button"
                    onClick={() => api?.scrollNext()}
                    aria-label="Next image"
                    className="p-2 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer active:scale-90"
                  >
                    <ArrowRight className="size-5 stroke-[1.75]" />
                  </button>
                </div>
              )}
            </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="grid-rows-[minmax(0,1fr)] h-[95dvh] w-[96vw] max-w-none gap-2 p-2 sm:p-4 sm:max-w-none overflow-hidden"
          style={{ touchAction: "none" }}
          onKeyDown={event => {
            if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
            if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
          }}
        >
          <div className="sr-only">
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>Image {popupIndex + 1} of {images.length}.</DialogDescription>
          </div>
          <div className="min-h-0 h-full w-full overflow-hidden" data-lenis-prevent>
            <ZoomableModalViewer
              src={images[popupIndex]}
              alt={`${name} enlarged image ${popupIndex + 1}`}
              onPrev={() => move(-1)}
              onNext={() => move(1)}
              hasMultiple={images.length > 1}
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => move(-1)}
                className="absolute left-2 top-1/2 z-30 flex size-10 sm:size-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/40 bg-white/35 hover:bg-white/65 text-slate-700 hover:text-slate-950 shadow-xs backdrop-blur-md transition-all active:scale-90 cursor-pointer"
              >
                <ArrowLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => move(1)}
                className="absolute right-2 top-1/2 z-30 flex size-10 sm:size-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/40 bg-white/35 hover:bg-white/65 text-slate-700 hover:text-slate-950 shadow-xs backdrop-blur-md transition-all active:scale-90 cursor-pointer"
              >
                <ArrowRight className="size-5" aria-hidden="true" />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
  </>;
}
