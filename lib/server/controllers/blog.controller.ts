import * as blogDal from "@/lib/server/dal/blog.dal";

export async function listBlogPosts(activeOnly: boolean = false) {
  await blogDal.seedDefaultBlogPostsIfEmpty();
  return blogDal.getAllBlogPosts(activeOnly);
}

export async function getBlogPost(id: string) {
  return blogDal.getBlogPostById(id);
}

export async function createBlogPost(input: blogDal.CreateBlogPostInput) {
  if (!input.title?.trim()) {
    throw new Error("Blog post title is required");
  }
  return blogDal.createBlogPost(input);
}

export async function updateBlogPost(id: string, input: blogDal.UpdateBlogPostInput) {
  const existing = await blogDal.getBlogPostById(id);
  if (!existing) {
    throw new Error("Blog post not found");
  }
  return blogDal.updateBlogPost(id, input);
}

export async function deleteBlogPost(id: string) {
  return blogDal.deleteBlogPost(id);
}
