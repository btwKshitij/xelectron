"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 40;

  const handlePrevImage = () => {
    if (productImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
  };

  const handleNextImage = () => {
    if (productImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
  };


  const [popupIndex, setPopupIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const showImage = (index: number) => { setPopupIndex(index); setOpen(true); };
  const move = (direction: number) => { setPopupIndex(index => (index + direction + images.length) % images.length); };
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
            <div className="lg:hidden flex flex-col items-center">
              {/* Primary Product Image with Touch Swipe Support */}
              <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white flex items-center justify-center select-none shadow-xs border border-slate-100"
              >
                <ZoomImage
                  onZoom={() => { if (touchStart === null || touchEnd === null || Math.abs(touchStart - touchEnd) < minSwipeDistance) showImage(activeImageIndex); }}
                  src={productImages[activeImageIndex] || heroImage}
                  alt={`${name} image ${activeImageIndex + 1}`}
                  fill
                  priority
                  className="object-contain rounded-2xl transition-transform duration-300"
                  sizes="100vw"
                />
              </div>

              {/* GALLERY CONTROLS ROW: END-TO-END ARROWS WITH CENTERED PAGINATION */}
              {productImages.length > 1 && (
                <div className="flex items-center justify-between w-full px-2 pt-5 pb-2.5 select-none">
                  {/* PREV ARROW (FAR LEFT) */}
                  <button
                    type="button"
                    onClick={handlePrevImage}
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
                        onClick={() => setActiveImageIndex(idx)}
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
                    onClick={handleNextImage}
                    aria-label="Next image"
                    className="p-2 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer active:scale-90"
                  >
                    <ArrowRight className="size-5 stroke-[1.75]" />
                  </button>
                </div>
              )}
            </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="grid-rows-[minmax(0,1fr)] h-[95dvh] w-[96vw] max-w-none gap-2 p-4 sm:max-w-none" onKeyDown={event => { if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } if (event.key === "ArrowRight") { event.preventDefault(); move(1); } }}>
          <div className="sr-only"><DialogTitle>{name}</DialogTitle><DialogDescription>Image {popupIndex + 1} of {images.length}.</DialogDescription></div>
          <div className="min-h-0 overflow-auto" data-lenis-prevent>
            <div className="relative h-full w-full">
              <Image src={images[popupIndex]} alt={`${name} enlarged image ${popupIndex + 1}`} fill unoptimized draggable={false} className="object-contain" sizes="100vw" />
            </div>
          </div>
          {images.length > 1 && (
            <>
              <button type="button" aria-label="Previous image" onClick={() => move(-1)} className="absolute left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow-md transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500 sm:left-6 sm:size-12">
                <ArrowLeft className="size-5" aria-hidden="true" />
              </button>
              <button type="button" aria-label="Next image" onClick={() => move(1)} className="absolute right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow-md transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500 sm:right-6 sm:size-12">
                <ArrowRight className="size-5" aria-hidden="true" />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
  </>;
}
