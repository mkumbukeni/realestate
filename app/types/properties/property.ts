
// app/types/property.ts

import type {
  Agent,
  ApiAgent,
} from "@/app/types/agents/agent";

// ============================================================
// PROPERTY MEDIA
// ============================================================

export interface PropertyMedia {
  id: number;
  name: string;
  original_url: string;
  preview_url: string;
}

export interface PropertyImage {
  id: number;
  name: string;
  original: string;
  thumbnail: string;
}

// ============================================================
// PROPERTY LOCATION
// ============================================================

export interface PropertyLocation {
  id: number;
  property_id: number;
  region: string;
  district: string;
  area: string;
  postcode: string | null;
  sub_area: string | null;
  google_map_link: string | null;
  latitude: string | null;
  longitude: string | null;
  zone_category: string | null;
  zoning: string | null;
}

// ============================================================
// PROPERTY ATTRIBUTES
// ============================================================

export interface PropertyAttribute {
  name: string;
}

export interface PropertyAttributes {
  attributes: PropertyAttribute[];
}

// ============================================================
// OPEN HOUSE
// ============================================================

export interface OpenHouse {
  id: number;
  property_id: number;
  start_date: string;
  end_date: string;
  description: string;
}

// ============================================================
// API PROPERTY
// ============================================================

export interface ApiProperty {
  id: number;

  /**
   * Legacy API valuer field.
   * This is not used to determine the assigned agent.
   */
  valuer_id: number | null;

  /**
   * Authoritative property-agent relationship.
   */
  agent: ApiAgent | null;

  property_number: string | null;
  parent_valuation: number | null;
  project_id: number | null;
  owner_name: string | null;
  property_type: string;
  property_design: string | null;
  construction_stage: string | null;
  year_built: string | null;
  age: number | null;
  eul: number | null;
  rel: number | null;
  measurements: string | null;
  no_rooms: number | null;
  no_of_bathrooms: number | null;
  occupancy: string | null;
  attributes: PropertyAttributes | null;
  title_deeds_available: string | null;
  certificate_of_search_available: string | null;
  encumbrances_available: string | null;
  defects: string | null;
  master_bedroom_ensuite: string | null;
  building_size: number | null;
  entry_type: string | null;
  price: number | null;

  /**
   * API listing type, such as sale or rent.
   */
  listing_type: string;

  created_by: number | null;
  is_approved: string | null;
  is_sale_completed: string | null;
  is_submitted: string | null;
  description: string | null;
  is_referred: string | null;
  has_accepted_offer: string | null;
  bulding_size_unit: string | null;
  land_size: number | null;
  land_size_unit: string | null;
  approved_at: string | null;
  visibility: string | null;
  created_at: string;
  updated_at: string;
  media: PropertyMedia[];
  location: PropertyLocation | null;
  coordinates_string: string | null;
  views: number;
  created_at_fmt: string;
  open_houses: OpenHouse[];
  system_status: string | null;
  property_videos: unknown[];
  cover_photo: string | null;
  property_images: PropertyImage[];
}

// ============================================================
// PROPERTIES API RESPONSE
// ============================================================

export interface PropertiesApiResponse {
  data: ApiProperty[];
}

// ============================================================
// AGENT DETAILS API RESPONSE
// ============================================================

export interface AgentDetailsApiResponse {
  msg?: string;
  data?: ApiAgent;
  properties?: ApiProperty[];
}

// ============================================================
// UI PROPERTY
// ============================================================

export interface Property {
  id: string;

  /**
   * Legacy valuer ID.
   * Do not use this field to determine the assigned agent.
   */
  valuerId: number | null;

  /**
   * Assigned agent associated with the property.
   */
  agent: Agent | null;

  type: string;
  beds: number;
  baths: number;
  price: string;
  priceValue: number;
  location: string;
  image: string;
  tag: string;
  period: string;
  category: string;
  district: string;
  region: string;
  area: string;
  description: string;
  propertyDesign: string;
  constructionStage: string;
  yearBuilt: string;
  age: number | null;
  buildingSize: number | null;
  buildingSizeUnit: string;
  landSize: number | null;
  landSizeUnit: string;
  views: number;
  attributes: string[];
  isOpenHouse: boolean;
  latitude: number | null;
  longitude: number | null;
  googleMapLink: string | null;
  createdAt: string;
  systemStatus: string;
}

// ============================================================
// PROPERTY MEDIA ITEM
//
// Used by the property images and videos endpoints.
// ============================================================

export interface PropertyMediaItem {
  id: number;
  name: string;
  url: string;
  description?: string | null;
  collection?: string | null;
}
