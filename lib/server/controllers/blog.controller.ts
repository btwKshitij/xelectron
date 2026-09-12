import * as blogDal from "@/lib/server/dal/blog.dal";
import { defaultBlogPosts, findDefaultBlogPost } from "@/lib/shared/default-blog-posts";

export async function listBlogPosts(activeOnly: boolean = false) {
  try {
    await blogDal.seedDefaultBlogPostsIfEmpty();
    const posts = await blogDal.getAllBlogPosts(activeOnly);
    if (posts && posts.length > 0) return posts;
  } catch (error) {
    console.error("Error listing blog posts:", error);
  }
  return defaultBlogPosts;
}

export async function getBlogPost(identifier: string) {
  try {
    await blogDal.seedDefaultBlogPostsIfEmpty();
    const bySlug = await blogDal.getBlogPostBySlug(identifier);
    if (bySlug) return bySlug;
    const byId = await blogDal.getBlogPostById(identifier);
    if (byId) return byId;
  } catch (error) {
    console.error("Error getting blog post:", error);
  }
  return findDefaultBlogPost(identifier);
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
