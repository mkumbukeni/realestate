
export interface PostCode {
  id: number;
  region: string;
  district_code: string;
  district_name: string;
  location_name: string;
  location_code: string;
  latitude: number | null;
  longitude: number | null;
  google_map_link: string | null;
  last_sync_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostCodesResponse {
  data: PostCode[];
}
