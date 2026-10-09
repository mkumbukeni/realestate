import type { Property } from "@/app/types/properties/property";

export type PropertyCategory =
  | "Featured Properties"
  | "New to Market"
  | "Open Houses"
  | "Most Viewed"
  | null;

export type ListingFilter = "all" | "sale" | "rent";

export type PropertyTypeFilter =
  | "all"
  | "residential"
  | "commercial"
  | "industrial"
  | "agricultural";

export function getCategory(
  category: string | string[] | undefined,
): PropertyCategory {
  const value = Array.isArray(category)
    ? category[0]
    : category;

  switch (value) {
    case "Featured Properties":
    case "New to Market":
    case "Open Houses":
    case "Most Viewed":
      return value;
    default:
      return null;
  }
}

export function getPropertyId(property: Property): string {
  return String(property.id);
}

export function removeDuplicateProperties(
  properties: Property[],
): Property[] {
  const seenIds = new Set<string>();

  return properties.filter((property) => {
    const id = getPropertyId(property);

    if (seenIds.has(id)) return false;

    seenIds.add(id);
    return true;
  });
}

export function createPropertyRows(
  properties: Property[],
  columns: number,
): Property[][] {
  const rows: Property[][] = [];

  for (let index = 0; index < properties.length; index += columns) {
    rows.push(properties.slice(index, index + columns));
  }

  return rows;
}

export function getPropertyTypeLabel(
  value: PropertyTypeFilter,
): string {
  switch (value) {
    case "residential":
      return "Residential";
    case "commercial":
      return "Commercial";
    case "industrial":
      return "Industrial";
    case "agricultural":
      return "Agricultural";
    default:
      return "All";
  }
}

export function filterProperties(
  properties: Property[],
  searchQuery: string,
  listingFilter: ListingFilter,
  propertyTypeFilter: PropertyTypeFilter,
): Property[] {
  const searchText = searchQuery.toLowerCase().trim();

  return properties.filter((property) => {
    const listingType = String(property.tag ?? "")
      .trim()
      .toLowerCase();

    const matchesListingFilter =
      listingFilter === "all" ||
      (listingFilter === "sale" &&
        ["sale", "for sale", "for_sale"].includes(listingType)) ||
      (listingFilter === "rent" &&
        ["rent", "for rent", "for_rent"].includes(listingType));

    if (!matchesListingFilter) return false;

    if (propertyTypeFilter !== "all") {
      const propertyType = String(
        property.type ?? property.category ?? "",
      ).trim().toLowerCase();

      const propertyDesign = String(
        property.propertyDesign ?? "",
      ).trim().toLowerCase();

      if (
        !`${propertyType} ${propertyDesign}`.includes(
          propertyTypeFilter,
        )
      ) {
        return false;
      }
    }

    if (!searchText) return true;

    const attributes = Array.isArray(property.attributes)
      ? property.attributes
      : [];

    const searchableText = [
      property.type,
      property.description,
      property.location,
      property.area,
      property.district,
      property.region,
      property.tag,
      property.category,
      property.propertyDesign,
      property.constructionStage,
      property.yearBuilt,
      property.buildingSizeUnit,
      property.landSizeUnit,
      property.systemStatus,
      ...attributes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchText);
  });
}