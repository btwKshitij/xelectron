import sharp from "sharp";

/** Convert once at ingestion; retain source resolution, alpha and animation. */
export async function optimizeUploadImage(body: Buffer, name: string, contentType: string) {
  if (!contentType.startsWith("image/") || contentType === "image/svg+xml") {
    return { body, name, contentType };
  }

  try {
    const image = sharp(body, { animated: true, failOn: "warning", limitInputPixels: 80_000_000 });
    const metadata = await image.metadata();
    // Existing WebP needs validation, but never another lossy encode.
    if (metadata.format === "webp") {
      await image.stats();
      return { body, name: name.replace(/\.[^.]+$/, "") + ".webp", contentType: "image/webp" };
    }
    const lossless = metadata.format === "png" || metadata.format === "gif";
    let converted = await image.clone().rotate().webp({
      quality: 92,
      alphaQuality: 100,
      // Keep text, line art and transparent PNGs pixel-perfect.
      lossless,
      smartSubsample: true,
      effort: 6,
    }).toBuffer();
    // Already-compressed photos can grow at quality 92. Try a bounded quality
    // range, never shrinking resolution or crushing quality to meet a byte target.
    if (!lossless) {
      for (const quality of [90, 88, 86]) {
        if (converted.length <= body.length) break;
        const candidate = await image.clone().rotate().webp({ quality, alphaQuality: 100, effort: 6, smartSubsample: true }).toBuffer();
        if (candidate.length < converted.length) converted = candidate;
      }
    }
    return {
      body: converted,
      name: name.replace(/\.[^.]+$/, "") + ".webp",
      contentType: "image/webp",
    };
  } catch {
    throw new Error("This image is damaged, unsupported, or too large to process. Please export it again and retry.");
  }
}
