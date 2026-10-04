
// app/services/propertyApi.ts

import {
  mapApiAgent,
} from "./agentApi";

import type {
  Agent,
  ApiAgent,
} from "./agentApi";

// ============================================================
// API BASE URL
// ============================================================

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured. Please add it to your .env file.",
  );
}

export const BASE_API_URL = API_URL.replace(/\/+$/, "");

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

// ============================================================
// API PROPERTY
// ============================================================

export interface ApiProperty {
  id: number;

  /**
   * Legacy/API valuer field.
   *
   * This is NOT used to determine the assigned agent because
   * the API can return null even when an agent is assigned.
   */
  valuer_id: number | null;

  /**
   * Authoritative property-agent relationship.
   *
   * Example from the API:
   *
   * "agent": {
   *   "id": 7,
   *   "user_id": "8",
   *   "name": "Patricia Thonyiwa"
   * }
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
   * Authoritative listing field.
   *
   * Expected values include:
   * "sale"
   * "rent"
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

  /**
   * ID of the legacy valuer field.
   *
   * NOTE:
   * This should NOT be used to determine the assigned agent.
   * The API may return null while property.agent is populated.
   */
  valuerId: number | null;

  /**
   * Agent assigned/associated with this property.
   *
   * This comes directly from:
   *
   * ApiProperty.agent
   *
   * Example:
   *
   * property.agent.id === 7
   */
  agent: Agent | null;

  type: string;

  beds: number;

  baths: number;

  price: string;

  priceValue: number;

  location: string;

  image: string;

  /**
   * Normalized API listing_type.
   *
   * Examples:
   * "sale"
   * "rent"
   */
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
// Used by /media/images and /media/videos
// ============================================================

export interface PropertyMediaItem {
  id: number;

  url: string;

  description?: string | null;

  collection?: string | null;
}

// ============================================================
// PRICE FORMATTER
// ============================================================

export function formatPrice(
  price: number | null,
): string {
  if (
    price === null ||
    Number.isNaN(price)
  ) {
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
  // ----------------------------------------------------------
  // Most Viewed endpoint may provide cover_photo
  // ----------------------------------------------------------

  if (
    typeof property.cover_photo === "string" &&
    property.cover_photo.trim() !== ""
  ) {
    return property.cover_photo;
  }

  // ----------------------------------------------------------
  // Normal properties endpoint may provide property_images
  // ----------------------------------------------------------

  if (
    Array.isArray(property.property_images) &&
    property.property_images.length > 0
  ) {
    const firstImage =
      property.property_images[0];

    if (
      firstImage &&
      typeof firstImage.original === "string" &&
      firstImage.original.trim() !== ""
    ) {
      return firstImage.original;
    }

    if (
      firstImage &&
      typeof firstImage.thumbnail === "string" &&
      firstImage.thumbnail.trim() !== ""
    ) {
      return firstImage.thumbnail;
    }
  }

  // ----------------------------------------------------------
  // Some responses may provide media
  // ----------------------------------------------------------

  if (
    Array.isArray(property.media) &&
    property.media.length > 0
  ) {
    const firstMedia =
      property.media[0];

    if (
      firstMedia &&
      typeof firstMedia.original_url === "string" &&
      firstMedia.original_url.trim() !== ""
    ) {
      return firstMedia.original_url;
    }

    if (
      firstMedia &&
      typeof firstMedia.preview_url === "string" &&
      firstMedia.preview_url.trim() !== ""
    ) {
      return firstMedia.preview_url;
    }
  }

  return "";
}

// ============================================================
// NORMALIZE LISTING TYPE
// ============================================================

/**
 * Converts the API listing_type into a predictable value.
 *
 * Examples:
 *
 * "sale"      -> "sale"
 * "Sale"      -> "sale"
 * "for sale"  -> "for sale"
 * "rent"      -> "rent"
 * "Rent"      -> "rent"
 * "for rent"  -> "for rent"
 */
function normalizeListingType(
  listingType: string | null | undefined,
): string {
  return String(
    listingType ?? "",
  )
    .trim()
    .toLowerCase();
}

// ============================================================
// CHECK SALE LISTING
// ============================================================

function isSaleListing(
  listingType: string,
): boolean {
  return (
    listingType === "sale" ||
    listingType === "for sale" ||
    listingType === "for_sale"
  );
}

// ============================================================
// CHECK RENT LISTING
// ============================================================

function isRentListing(
  listingType: string,
): boolean {
  return (
    listingType === "rent" ||
    listingType === "for rent" ||
    listingType === "for_rent"
  );
}

// ============================================================
// PROPERTY MAPPER
// ============================================================

export function mapApiProperty(
  property: ApiProperty,
): Property {
  const location =
    property.location;

  const attributes =
    property.attributes?.attributes?.map(
      (attribute) => attribute.name,
    ) ?? [];

  // ----------------------------------------------------------
  // Latitude
  // ----------------------------------------------------------

  const latitude =
    location?.latitude !== null &&
    location?.latitude !== undefined
      ? Number(location.latitude)
      : null;

  // ----------------------------------------------------------
  // Longitude
  // ----------------------------------------------------------

  const longitude =
    location?.longitude !== null &&
    location?.longitude !== undefined
      ? Number(location.longitude)
      : null;

  // ----------------------------------------------------------
  // Assigned Agent
  //
  // IMPORTANT:
  //
  // The API property response contains the authoritative
  // relationship:
  //
  // property.agent.id
  //
  // We DO NOT use valuer_id here.
  // ----------------------------------------------------------

  const agent =
    property.agent
      ? mapApiAgent(property.agent)
      : null;

  // ----------------------------------------------------------
  // Listing Type
  //
  // IMPORTANT:
  // Only property.listing_type is used here.
  // ----------------------------------------------------------

  const listingType =
    property.listing_type?.trim() ||
    "Property";

  const listingTypeLower =
    normalizeListingType(
      property.listing_type,
    );

  // ----------------------------------------------------------
  // Category
  // ----------------------------------------------------------

  const category =
    isSaleListing(listingTypeLower)
      ? "For Sale"
      : isRentListing(listingTypeLower)
        ? "For Rent"
        : listingType;

  // ----------------------------------------------------------
  // Period
  // ----------------------------------------------------------

  const period =
    isRentListing(listingTypeLower)
      ? "For Rent"
      : isSaleListing(listingTypeLower)
        ? "For Sale"
        : "";

  // ----------------------------------------------------------
  // Return common Property type
  // ----------------------------------------------------------

  return {
    id: String(property.id),

    valuerId:
      property.valuer_id,

    agent,

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

    period,

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
      Array.isArray(property.open_houses) &&
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
// RESPONSE VALIDATION
// ============================================================

function validatePropertiesResponse(
  json: unknown,
): ApiProperty[] {
  if (
    typeof json !== "object" ||
    json === null ||
    !("data" in json)
  ) {
    throw new Error(
      "Invalid API response: properties data is missing.",
    );
  }

  const response =
    json as PropertiesApiResponse;

  if (!Array.isArray(response.data)) {
    throw new Error(
      "Invalid API response: properties data is not an array.",
    );
  }

  return response.data;
}

// ============================================================
// GENERIC PROPERTY FETCHER
// ============================================================

async function fetchPropertyEndpoint(
  endpoint: string,
): Promise<Property[]> {
  console.log(
    "Fetching properties from:",
    endpoint,
  );

  const response =
    await fetch(endpoint);

  if (!response.ok) {
    throw new Error(
      `Failed to load properties. Server returned ${response.status}.`,
    );
  }

  const json: unknown =
    await response.json();

  const properties =
    validatePropertiesResponse(json);

  // ----------------------------------------------------------
  // IMPORTANT:
  //
  // The API already returns property.agent.
  //
  // Therefore we do not make another /agents request and
  // do not try to match valuer_id.
  // ----------------------------------------------------------

  return properties.map(
    (property) =>
      mapApiProperty(property),
  );
}

// ============================================================
// FETCH ALL PROPERTIES
// ============================================================

export async function fetchProperties(): Promise<
  Property[]
> {
  return fetchPropertyEndpoint(
    `${BASE_API_URL}/v2/properties`,
  );
}

// ============================================================
// FETCH FEATURED PROPERTIES
// ============================================================

export async function fetchFeaturedProperties(): Promise<
  Property[]
> {
  return fetchPropertyEndpoint(
    `${BASE_API_URL}/v2/property/get-featured`,
  );
}

// ============================================================
// FETCH MOST VIEWED PROPERTIES
// ============================================================

export async function fetchMostViewedProperties(): Promise<
  Property[]
> {
  return fetchPropertyEndpoint(
    `${BASE_API_URL}/v2/property/get-most-viewed`,
  );
}

// ============================================================
// FETCH NEAREST PROPERTIES
// ============================================================

export async function fetchNearestProperties(): Promise<
  Property[]
> {
  return fetchPropertyEndpoint(
    `${BASE_API_URL}/v2/property/nearest`,
  );
}

// ============================================================
// FETCH NEARBY PROPERTIES
// ============================================================

export async function fetchNearbyProperties(
  latitude: number,
  longitude: number,
): Promise<Property[]> {
  const response =
    await fetch(
      `${BASE_API_URL}/v2/property/nearby`,
      {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          latitude,
          longitude,
          radius: 1,
          min_price: 0,
          max_price: 0,
          search: "",
        }),
      },
    );

  if (!response.ok) {
    throw new Error(
      `Nearby properties request failed: ${response.status}`,
    );
  }

  const result: unknown =
    await response.json();

  if (
    typeof result !== "object" ||
    result === null
  ) {
    return [];
  }

  const responseData =
    result as {
      success?: boolean;
      data?: unknown;
    };

  if (
    !responseData.success ||
    !Array.isArray(
      responseData.data,
    )
  ) {
    return [];
  }

  return responseData.data.map(
    (property) =>
      mapApiProperty(
        property as ApiProperty,
      ),
  );
}

// ============================================================
// PROPERTY IMAGES
// ============================================================

export const fetchPropertyImages =
  async (
    propertyId: string | number,
  ): Promise<PropertyMediaItem[]> => {
    const endpoint =
      `${BASE_API_URL}/v2/properties/${propertyId}/media/images`;

    console.log(
      "Fetching property images from:",
      endpoint,
    );

    const response =
      await fetch(endpoint, {
        method: "GET",

        headers: {
          Accept: "application/json",
        },
      });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch property images: ${response.status}`,
      );
    }

    const json: unknown =
      await response.json();

    if (
      typeof json !== "object" ||
      json === null
    ) {
      return [];
    }

    const responseData =
      json as {
        data?: unknown;
      };

    return Array.isArray(
      responseData.data,
    )
      ? (responseData.data as PropertyMediaItem[])
      : [];
  };

// ============================================================
// PROPERTY VIDEOS
// ============================================================

export const fetchPropertyVideos =
  async (
    propertyId: string | number,
  ): Promise<PropertyMediaItem[]> => {
    const endpoint =
      `${BASE_API_URL}/v2/properties/${propertyId}/media/videos`;

    console.log(
      "Fetching property videos from:",
      endpoint,
    );

    const response =
      await fetch(endpoint, {
        method: "GET",

        headers: {
          Accept: "application/json",
        },
      });

    // The API uses 404 when the property has no videos.
    if (response.status === 404) {
      console.log(
        "No videos found for property:",
        propertyId,
      );

      return [];
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch property videos: ${response.status}`,
      );
    }

    const data: unknown =
      await response.json();

    console.log(
      "Property videos response:",
      data,
    );

    if (Array.isArray(data)) {
      return data as PropertyMediaItem[];
    }

    if (
      typeof data === "object" &&
      data !== null
    ) {
      const responseData =
        data as {
          data?: unknown;
        };

      if (
        Array.isArray(
          responseData.data,
        )
      ) {
        return responseData.data as PropertyMediaItem[];
      }
    }

    return [];
  };

