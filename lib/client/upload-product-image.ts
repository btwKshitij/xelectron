export type UploadedProductImage = {
  key: string;
  url: string;
};

export async function uploadProductImage(file: File): Promise<UploadedProductImage> {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch("/api/media", { method: "POST", body: formData });
  const result = await response.json();
  if (!response.ok || !result.success || !result.data?.url || !result.data?.key) {
    throw new Error(result.error || "Unable to upload the product image.");
  }
  return result.data as UploadedProductImage;
}
