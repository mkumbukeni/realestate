
export type ListingType = "rent" | "sale";

export interface AddClientRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  listing_type: ListingType;
  region: string;
  district: string;
  area: string;
  min_price: number;
  max_price: number;
  min_bedrooms: number;
  max_bedrooms: number;
  property_type: string;
  wa_notify: string;
  wa_number: string;
}

export interface AddClientResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}
