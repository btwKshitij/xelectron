export const DEFAULT_SPEC_HEADINGS = {
  designHeading: "Design, Display & Performance",
  connectivityHeading: "Connectivity, Battery & Smart Features",
};

export type SpecHeadings = typeof DEFAULT_SPEC_HEADINGS;

export function normalizeSpecHeadingChanges(data: { designHeading?: unknown; connectivityHeading?: unknown }) {
  const changes: Partial<SpecHeadings> = {};
  for (const key of ["designHeading", "connectivityHeading"] as const) {
    if (data[key] === undefined) continue;
    if (typeof data[key] !== "string") throw new Error("Invalid specification heading");
    changes[key] = data[key].trim() || DEFAULT_SPEC_HEADINGS[key];
  }
  return changes;
}
