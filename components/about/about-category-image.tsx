"use client";

import Image from "next/image";
import { useState } from "react";

export function AboutCategoryImage({
  src,
  fallbackSrc,
  alt,
}: {
  src: string;
  fallbackSrc: string;
  alt: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  const currentSrc = hasError ? fallbackSrc : src;

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      unoptimized
      onError={() => setHasError(true)}
      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
      sizes="(min-width: 1024px) 25vw, 50vw"
    />
  );
}
