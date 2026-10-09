/*
|--------------------------------------------------------------------------
| Blog Types
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

export interface BlogsResponse {
  data: Blog[];
}