
// app/services/propertyApi.ts

// ============================================================
// API URL
// ============================================================

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured. Please add it to your .env file.",
  );
}

export const PROPERTIES_API_URL =
  `${API_URL}/properties`;

  console.log("PROPERTIES_API_URL:", PROPERTIES_API_URL);

// ============================================================
// API TYPES
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

export interface PropertyAttribute {
  name: string;
}

export interface PropertyAttributes {
  attributes: PropertyAttribute[];
}

export interface OpenHouse {
  id: number;
  property_id: number;
  start_date: string;
  end_date: string;
  description: string;
}

export interface ApiProperty {
  id: number;

  valuer_id: number | null;
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
// API RESPONSE
// ============================================================

interface PropertiesApiResponse {
  data: ApiProperty[];
}

// ============================================================
// UI PROPERTY TYPE
// ============================================================

export interface Property {
  id: string;

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
// PRICE FORMATTER
// ============================================================

export function formatPrice(
  price: number | null,
): string {
  if (price === null || Number.isNaN(price)) {
    return "Price on request";
  }

  return `MWK ${price.toLocaleString("en-US")}`;
}

// ============================================================
// LOCATION FORMATTER
// ============================================================

function getLocation(
  property: ApiProperty,
): string {
  const location = property.location;

  if (!location) {
    return "Location unavailable";
  }

  const parts = [
    location.area,
    location.district,
  ].filter(
    (value): value is string =>
      typeof value === "string" &&
      value.trim().length > 0,
  );

  return parts.length > 0
    ? parts.join(", ")
    : "Location unavailable";
}

// ============================================================
// IMAGE FORMATTER
// ============================================================

function getPropertyImage(
  property: ApiProperty,
): string {
  // First priority: API cover photo
  if (
    typeof property.cover_photo === "string" &&
    property.cover_photo.trim() !== ""
  ) {
    return property.cover_photo;
  }

  // Second priority: property_images
  const firstPropertyImage =
    property.property_images[0];

  if (
    firstPropertyImage &&
    typeof firstPropertyImage.original ===
      "string" &&
    firstPropertyImage.original.trim() !== ""
  ) {
    return firstPropertyImage.original;
  }

  // Third priority: media
  const firstMedia = property.media[0];

  if (
    firstMedia &&
    typeof firstMedia.original_url ===
      "string" &&
    firstMedia.original_url.trim() !== ""
  ) {
    return firstMedia.original_url;
  }

  return "";
}

// ============================================================
// PROPERTY MAPPER
// ============================================================

export function mapApiProperty(
  property: ApiProperty,
): Property {
  const location = property.location;

  const attributes =
    property.attributes?.attributes?.map(
      (attribute) => attribute.name,
    ) ?? [];

  const latitude =
    location?.latitude !== null &&
    location?.latitude !== undefined
      ? Number(location.latitude)
      : null;

  const longitude =
    location?.longitude !== null &&
    location?.longitude !== undefined
      ? Number(location.longitude)
      : null;

  const listingType =
    property.listing_type?.trim() ||
    "Property";

  const listingTypeLower =
    listingType.toLowerCase();

  const category =
    listingTypeLower === "sale"
      ? "For Sale"
      : listingTypeLower === "rent"
        ? "For Rent"
        : listingType;

  return {
    id: String(property.id),

    type:
      property.property_type ||
      "Property",

    beds:
      property.no_rooms ?? 0,

    baths:
      property.no_of_bathrooms ?? 0,

    price:
      formatPrice(property.price),

    priceValue:
      property.price ?? 0,

    location:
      getLocation(property),

    image:
      getPropertyImage(property),

    tag:
      listingType,

    period:
      listingTypeLower === "rent"
        ? "For Rent"
        : "For Sale",

    category,

    district:
      location?.district ?? "",

    region:
      location?.region ?? "",

    area:
      location?.area ?? "",

    description:
      property.description ?? "",

    propertyDesign:
      property.property_design ?? "",

    constructionStage:
      property.construction_stage ?? "",

    yearBuilt:
      property.year_built ?? "",

    age:
      property.age,

    buildingSize:
      property.building_size,

    buildingSizeUnit:
      property.bulding_size_unit ?? "",

    landSize:
      property.land_size,

    landSizeUnit:
      property.land_size_unit ?? "",

    views:
      property.views,

    attributes,

    isOpenHouse:
      property.open_houses.length > 0,

    latitude:
      latitude !== null &&
      !Number.isNaN(latitude)
        ? latitude
        : null,

    longitude:
      longitude !== null &&
      !Number.isNaN(longitude)
        ? longitude
        : null,

    googleMapLink:
      location?.google_map_link ?? null,

    createdAt:
      property.created_at,

    systemStatus:
      property.system_status ??
      "On Market",
  };
}

// ============================================================
// FETCH PROPERTIES
// ============================================================

export async function fetchProperties(): Promise<
  Property[]
> {
  const response = await fetch(
    PROPERTIES_API_URL,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load properties. Server returned ${response.status}.`,
    );
  }

  const json =
    (await response.json()) as PropertiesApiResponse;

  if (!Array.isArray(json.data)) {
    throw new Error(
      "Invalid API response: properties data is missing.",
    );
  }

  return json.data.map(mapApiProperty);
}

