/*
|--------------------------------------------------------------------------
| Blog API Service
|--------------------------------------------------------------------------
*/

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not defined. Please check your .env file."
  );
}

/*
|--------------------------------------------------------------------------
| Blog Type
|--------------------------------------------------------------------------
*/

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_id: string;
  status: string;
  designation: string | null;
  view_count: number;
  allow_comments: number;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_email: string | null;
  author_twitter: string | null;
  author_website: string | null;
  author_linkedin: string | null;
}

interface BlogsResponse {
  data: Blog[];
}

/*
|--------------------------------------------------------------------------
| Get Blogs
|--------------------------------------------------------------------------
*/

export async function getBlogs(): Promise<Blog[]> {
  const url = `${API_URL}/blogs`;

  console.log("Fetching blogs from:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch blogs. Status: ${response.status}`
    );
  }

  const result: BlogsResponse = await response.json();

  console.log("Total blogs received:", result.data?.length ?? 0);

  if (!Array.isArray(result.data)) {
    return [];
  }

  /*
  |--------------------------------------------------------------------------
  | Only iMORRCS blogs
  |--------------------------------------------------------------------------
  |
  | The API value is:
  |
  | "imorccs"
  |
  | We normalize the value to protect against:
  | - IMORCCS
  | - Imorccs
  | - "imorccs "
  | - " imorccs"
  |
  */

  const imorccsBlogs = result.data.filter((blog) => {
    const designation =
      blog.designation?.trim().toLowerCase();

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