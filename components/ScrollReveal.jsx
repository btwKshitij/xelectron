import { Children, cloneElement, isValidElement, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const renderWords = (text, keyPrefix) =>
  text.split(/(\s+)/).map((word, index) => {
    if (word.match(/^\s+$/)) return word;
    return (
      <span className="inline-block word" key={`${keyPrefix}-${index}`}>
        {word}
      </span>
    );
  });

const renderNodes = (node, keyPrefix = 'node') => {
  if (typeof node === 'string' || typeof node === 'number') {
    return renderWords(String(node), keyPrefix);
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <span key={`${keyPrefix}-${index}`} className="contents">
        {renderNodes(child, `${keyPrefix}-${index}`)}
      </span>
    ));
  }

  if (isValidElement(node)) {
    const children = node.props?.children;

    return cloneElement(node, {
      ...node.props,
      children: children !== undefined ? renderNodes(children, `${keyPrefix}-c`) : children,
    });
  }

  return node;
};

const ScrollReveal = ({
  children,
  scrollContainerRef = null,
  enableBlur = false,
  baseOpacity = 0.25,
  baseRotation = 0,
  blurStrength = 0,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom 45%',
  wordAnimationEnd = 'bottom 45%'
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => renderNodes(children), [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    const ctx = gsap.context(() => {
      const wordElements = el.querySelectorAll('.word');

      if (wordElements.length > 0) {
        wordElements.forEach((word) => {
          const isAccent =
            word.closest('.text-\\[\\#0a7ae6\\]') !== null ||
            word.closest('.text-blue-600') !== null ||
            word.classList.contains('text-[#0a7ae6]');
          word.setAttribute('data-accent', isAccent ? 'true' : 'false');
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top 80%',
            end: wordAnimationEnd || 'bottom 45%',
            scrub: 1,
          },
        });

        tl.fromTo(
          wordElements,
          {
            color: '#cbd5e1',
            opacity: baseOpacity,
          },
          {
            color: (index, target) => {
              return target.getAttribute('data-accent') === 'true' ? '#0a7ae6' : '#0f172a';
            },
            opacity: 1,
            stagger: 0.12,
            ease: 'none',
          }
        );
      }
    }, containerRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [scrollContainerRef, baseOpacity, wordAnimationEnd]);

  return (
    <div ref={containerRef} className={`my-5 w-full ${containerClassName}`}>
      <p className={`block w-full ${textClassName || "text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.1]"}`}>{splitText}</p>
    </div>
  );
};

export default ScrollReveal;

