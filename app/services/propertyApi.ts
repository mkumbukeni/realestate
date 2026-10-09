
import {
  mapApiAgent,
} from "./agentApi";

import type {
  Agent,
  ApiAgent,
} from "@/app/types/agents/agent";

import type {
  AgentDetailsApiResponse,
  ApiProperty,
  PropertiesApiResponse,
  Property,
  PropertyMediaItem,
} from "@/app/types/properties/property";

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
  // The normal properties API response contains property.agent.
  // We do not use valuer_id to determine the assigned agent.
  // ----------------------------------------------------------

  const agent =
    property.agent
      ? mapApiAgent(property.agent)
      : null;

  // ----------------------------------------------------------
  // Listing Type
  //
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
    await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

  if (!response.ok) {
    const errorText =
      await response.text().catch(
        () => "",
      );

    throw new Error(
      `Failed to load properties. Server returned ${response.status}.${errorText ? ` ${errorText}` : ""}`,
    );
  }

  const json: unknown =
    await response.json();

  const properties =
    validatePropertiesResponse(json);

  // The API already returns property.agent.
  // We do not make another /agents request or match valuer_id.

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
  const endpoint =
    `${BASE_API_URL}/v2/property/nearby`;

  const response =
    await fetch(endpoint, {
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
    });

  if (!response.ok) {
    const errorText =
      await response.text().catch(
        () => "",
      );

    throw new Error(
      `Nearby properties request failed: ${response.status}${errorText ? ` ${errorText}` : ""}`,
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
// FETCH AGENT DETAILS + ASSOCIATED PROPERTIES
//
// Endpoint:
// GET /v2/agents/{agentId}
//
// Expected response:
//
// {
//   "msg": "...",
//   "data": { ...agent },
//   "properties": [ ...properties ]
// }
//
// The details endpoint returns the agent and its properties.
// ============================================================

export async function fetchAgentDetails(
  agentId: string | number,
): Promise<{
  agent: Agent;
  properties: Property[];
}> {
  const endpoint =
    `${BASE_API_URL}/v2/agents/${encodeURIComponent(
      String(agentId),
    )}`;

  console.log(
    "Fetching agent details from:",
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
    const errorText =
      await response.text().catch(
        () => "",
      );

    throw new Error(
      `Agent request failed (${response.status}): ${errorText}`,
    );
  }

  const json: unknown =
    await response.json();

  // ----------------------------------------------------------
  // Validate basic response structure
  // ----------------------------------------------------------

  if (
    typeof json !== "object" ||
    json === null
  ) {
    throw new Error(
      "Invalid agent details API response.",
    );
  }

  const result =
    json as AgentDetailsApiResponse;

  // ----------------------------------------------------------
  // Validate agent
  // ----------------------------------------------------------

  if (
    !result.data ||
    typeof result.data !== "object"
  ) {
    throw new Error(
      "Agent details data is missing.",
    );
  }

  // ----------------------------------------------------------
  // Map the agent
  // ----------------------------------------------------------

  const agent =
    mapApiAgent(result.data);

  // ----------------------------------------------------------
  // Map associated properties
  //
  // The /v2/agents/{id} endpoint may return property objects
  // without their own agent field. Attach the returned agent
  // when the mapped property has no agent.
  // ----------------------------------------------------------

  const properties =
    Array.isArray(result.properties)
      ? result.properties.map(
          (property) => {
            const mappedProperty =
              mapApiProperty(
                property as ApiProperty,
              );

            if (
              mappedProperty.agent === null
            ) {
              mappedProperty.agent =
                agent;
            }

            return mappedProperty;
          },
        )
      : [];

  console.log(
    `Agent ${agent.id} loaded with ${properties.length} associated properties.`,
  );

  return {
    agent,
    properties,
  };
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
