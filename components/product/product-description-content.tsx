import React from "react";

type Specification = {
  label: string;
  value: string;
};

type ProductDescriptionContentProps = {
  description?: string;
  specs?: Array<{ label: string; value: string }>;
  title?: string;
};

const knownLabels = [
  "Product Type",
  "Motor Type",
  "Maximum Speed",
  "Fan Speed Levels",
  "Speed Adjustment",
  "Light Source",
  "Light Modes",
  "Number of Light Modes",
  "Rotation Angle",
  "Display Type",
  "Resolution",
  "Display resolution",
  "Brightness",
  "Brightness / Lumens",
  "Speaker / Audio",
  "Operating System",
  "Focus / Keystone",
  "Screen / Projection Size",
  "Battery Type",
  "Battery Life",
  "Charging Type",
  "Connectivity",
  "Connectivity Technology",
  "Special Feature",
  "Recommended Uses For Product",
  "Recommended Uses",
  "Warranty",
  "Brand",
];

function extractSpecsAndContent(description: string = "", providedSpecs?: Specification[]) {
  const specifications: Specification[] = [];
  const bulletFeatures: string[] = [];
  const textParagraphs: string[] = [];

  // If explicit specs are provided, use them first
  if (providedSpecs && providedSpecs.length > 0) {
    for (const s of providedSpecs) {
      if (s.label && s.value) {
        specifications.push({ label: s.label.trim(), value: s.value.trim() });
      }
    }
  }

  const lines = description
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.toLowerCase() === "about this item" || line.toLowerCase() === "specifications") {
      continue;
    }

    // Try matching [Label]: Value or [Label] - Value
    const bracketMatch = line.match(/^(?:[•*\-]\s*)?(?:✅\s*)?\[([^\]]+)\]\s*:?\s*[-–]?\s*(.+)$/);
    if (bracketMatch) {
      if (!specifications.some((s) => s.label.toLowerCase() === bracketMatch[1].trim().toLowerCase())) {
        specifications.push({ label: bracketMatch[1].trim(), value: bracketMatch[2].trim() });
      }
      continue;
    }

    // Try matching Label: Value
    const colonIndex = line.indexOf(":");
    if (colonIndex > 1 && colonIndex < 40) {
      const candidateLabel = line.slice(0, colonIndex).replace(/^[•*\-]\s*/, "").replace(/✅\s*/, "").trim();
      const candidateValue = line.slice(colonIndex + 1).trim();

      // Check if candidateLabel is reasonable (not a full sentence)
      if (candidateLabel.length > 0 && candidateValue.length > 0 && candidateLabel.split(" ").length <= 5) {
        if (!specifications.some((s) => s.label.toLowerCase() === candidateLabel.toLowerCase())) {
          specifications.push({ label: candidateLabel, value: candidateValue });
        }
        continue;
      }
    }

    // Try known specification prefixes
    let matchedKnown = false;
    for (const kl of knownLabels) {
      if (line.toLowerCase().startsWith(kl.toLowerCase())) {
        const valuePart = line.slice(kl.length).replace(/^[:\s\-–]+/, "").trim();
        if (valuePart) {
          if (!specifications.some((s) => s.label.toLowerCase() === kl.toLowerCase())) {
            specifications.push({ label: kl, value: valuePart });
          }
          matchedKnown = true;
          break;
        }
      }
    }
    if (matchedKnown) continue;

    // Bullet points
    if (/^[•*\-]\s*/.test(line) || /^✅\s*/.test(line)) {
      bulletFeatures.push(line.replace(/^[•*\-]\s*/, "").replace(/^✅\s*/, "").trim());
    } else {
      textParagraphs.push(line);
    }
  }

  return { specifications, bulletFeatures, textParagraphs };
}

export function ProductDescriptionContent({ description = "", specs, title }: ProductDescriptionContentProps) {
  const { specifications, bulletFeatures, textParagraphs } = extractSpecsAndContent(description, specs);

  return (
    <div className="space-y-6 text-xs sm:text-sm" aria-label="Product description">
      {/* KEY-VALUE SPECIFICATIONS SECTION (MATCHING USER REFERENCE) */}
      {specifications.length > 0 && (
        <div className="w-full">
          <h3 className="text-lg sm:text-lg font-bold text-slate-900 tracking-tight mb-3">
            {title || "Performance, Design & Lighting"}
          </h3>

          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {specifications.map((spec, idx) => {
              const formattedLabel = spec.label.endsWith(":") ? spec.label : `${spec.label}:`;
              return (
                <div
                  key={`${spec.label}-${idx}`}
                  className="grid grid-cols-[42%_58%] sm:grid-cols-[38%_62%] py-3.5 sm:py-4 items-baseline gap-3 sm:gap-6"
                >
                  <span className="text-[14px] sm:text-sm font-bold text-slate-400">
                    {formattedLabel}
                  </span>
                  <span className="text-[15px] sm:text-sm font-semibold text-slate-800 leading-snug whitespace-pre-line">
                    {spec.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADDITIONAL PARAGRAPHS */}
      {textParagraphs.length > 0 && (
        <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">
          {textParagraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      )}

      {/* ADDITIONAL BULLET FEATURES */}
      {bulletFeatures.length > 0 && (
        <div className="pt-2">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-2">Key Highlights</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            {bulletFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#0a7ae6]" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
