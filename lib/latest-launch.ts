export const LATEST_LAUNCH_LIMIT = 4;

export function selectLatestLaunchProducts<T extends { id: string; showInBestSellers?: boolean }>(products: T[], ids: string[] | null): T[] {
  if (ids === null) return products.filter((product) => !product.showInBestSellers).slice(0, LATEST_LAUNCH_LIMIT);
  const byId = new Map(products.map((product) => [product.id, product]));
  return ids.flatMap((id) => {
    const product = byId.get(id);
    return product ? [product] : [];
  }).slice(0, LATEST_LAUNCH_LIMIT);
}
