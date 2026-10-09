
/*
|--------------------------------------------------------------------------
| Blog API Service
|--------------------------------------------------------------------------
*/

import type { Blog, BlogsResponse } from "@/app/types/blogs/blog";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not defined. Please check your .env file."
  );
}

/*
|--------------------------------------------------------------------------
| Get Blogs
|--------------------------------------------------------------------------
*/

export async function getBlogs(): Promise<Blog[]> {
  const url = `${API_URL}/v2/blogs`;

  console.log("Fetching blogs from:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch blogs. Status: ${response.status}`
    );
  }

  const result: BlogsResponse = await response.json();

  console.log(
    "Total blogs received:",
    result.data?.length ?? 0
  );

  if (!Array.isArray(result.data)) {
    return [];
  }

  /*
  |--------------------------------------------------------------------------
  | Only iMORRCS blogs
  |--------------------------------------------------------------------------
  */

  const imorccsBlogs = result.data.filter((blog) => {
    const designation = blog.designation?.trim().toLowerCase();

    return designation === "imorccs";
  });

  console.log(
    "iMORRCS blogs found:",
    imorccsBlogs.length
  );

  /*
  |--------------------------------------------------------------------------
  | Debug: Show designations received from API
  |--------------------------------------------------------------------------
  */

  console.log(
    "Designations received:",
    result.data.map((blog) => blog.designation)
  );

  return imorccsBlogs;
}

/*
|--------------------------------------------------------------------------
| Get Blog By ID
|--------------------------------------------------------------------------
|
| The /blogs endpoint returns the complete blog object,
| including the full content.
|
*/

export async function getBlogById(
  id: string
): Promise<Blog> {
  if (!id) {
    throw new Error("Blog ID is required.");
  }

  const blogs = await getBlogs();

  const blog = blogs.find((item) => item.id === id);

  if (!blog) {
    throw new Error(
      `Blog with ID "${id}" was not found.`
    );
  }

  return blog;
}
