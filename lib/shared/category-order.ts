export const orderedTopics = [
  { title: "Projectors", matches: /projector/i },
  { title: "Digital Photo Frame", matches: /photo.*frame|digital.*frame/i },
  { title: "Portable Monitors", matches: /monitor/i },
  { title: "Smart TVs", matches: /television|smart.*tv|smart.*display|\btvs?\b/i },
];

export function getCategoryOrder(category: { title: string; slug: string; sortOrder?: number | null }) {
  if (typeof category.sortOrder === "number") {
    return category.sortOrder;
  }
  const index = orderedTopics.findIndex(topic => topic.matches.test(`${category.title} ${category.slug}`));
  return index >= 0 ? index : orderedTopics.length;
}
