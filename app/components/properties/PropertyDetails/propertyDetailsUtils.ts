
import type { Property } from "@/app/types/properties/property";

export type PropertyRecord = Record<string, unknown>;

export interface PropertyCoordinates {
  latitude: number;
  longitude: number;
}

function asRecord(value: unknown): PropertyRecord | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as PropertyRecord;
  }

  return null;
}

/**
 * Returns the first non-empty property field from the supplied keys.
 * Useful when API responses use different naming conventions.
 */
export function getPropertyValue(
  property: Property | PropertyRecord,
  ...keys: string[]
): string {
  const record = property as PropertyRecord;

  for (const key of keys) {
    const value = record[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }
  }

  return "";
}

/**
 * Formats a property's location whether it is a string
 * or a nested location object.
 */
export function getPropertyLocationText(
  property: Property | PropertyRecord,
): string {
  const record = property as PropertyRecord;
  const location = record.location;

  if (typeof location === "string") {
    return location.trim();
  }

  const locationRecord = asRecord(location);

  if (locationRecord) {
    const parts = [
      locationRecord.area,
      locationRecord.sub_area,
      locationRecord.city,
      locationRecord.district,
      locationRecord.region,
      locationRecord.country,
    ]
      .filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0,
      )
      .map((value) => value.trim());

    return [...new Set(parts)].join(", ");
  }

  const fallbackParts = [
    record.area,
    record.district,
    record.region,
  ].filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );

  return fallbackParts.join(", ");
}

/**
 * Returns valid latitude/longitude coordinates when both are available.
 * Returns null if either coordinate is absent or invalid.
 */
export function getPropertyCoordinates(
  property: Property | PropertyRecord,
): PropertyCoordinates | null {
  const record = property as PropertyRecord;
  const location = asRecord(record.location);

  const latitudeValue =
    location?.latitude ??
    location?.lat ??
    record.latitude ??
    record.lat;

  const longitudeValue =
    location?.longitude ??
    location?.lng ??
    location?.lon ??
    record.longitude ??
    record.lng;

  if (
    latitudeValue === null ||
    latitudeValue === undefined ||
    longitudeValue === null ||
    longitudeValue === undefined ||
    String(latitudeValue).trim() === "" ||
    String(longitudeValue).trim() === ""
  ) {
    return null;
  }

  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

/**
 * Gets the listing type using the possible field names
 * present in the API and normalized UI model.
 */
export function getPropertyListingType(
  property: Property | PropertyRecord,
): string {
  return getPropertyValue(
    property,
    "listingType",
    "listing_type",
    "tag",
    "status",
  );
}

/**
 * Gets the property type using the possible field names.
 */
export function getPropertyType(
  property: Property | PropertyRecord,
): string {
  return getPropertyValue(
    property,
    "propertyType",
    "property_type",
    "type",
    "category",
  );
}

/**
 * Returns a description string without throwing if it is missing.
 */
export function getPropertyDescription(
  property: Property | PropertyRecord,
): string {
  return getPropertyValue(property, "description");
}

/**
 * Returns amenities from supported field names.
 */
export function getPropertyAmenities(
  property: Property | PropertyRecord,
): unknown[] {
  const record = property as PropertyRecord;
  const amenities = record.amenities;

  if (Array.isArray(amenities)) {
    return amenities;
  }

  const attributes = record.attributes;

  if (Array.isArray(attributes)) {
    return attributes;
  }

  const attributeRecord = asRecord(attributes);

  if (attributeRecord && Array.isArray(attributeRecord.attributes)) {
    return attributeRecord.attributes;
  }

  return [];
}

/**
 * Returns open-house items when supplied as an array.
 */
export function getPropertyOpenHouses(
  property: Property | PropertyRecord,
): PropertyRecord[] {
  const record = property as PropertyRecord;
  const openHouses = record.open_houses ?? record.openHouses;

  if (!Array.isArray(openHouses)) {
    return [];
  }

  return openHouses
    .map(asRecord)
    .filter((item): item is PropertyRecord => item !== null);
}

/**
 * Formats a year or numeric property size while preserving
 * the original value if it is not a number.
 */
export function formatPropertyValue(
  value: unknown,
  suffix = "",
): string {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "";
  }

  return `${String(value)}${suffix}`;
}
