import { useCallback, useEffect, useMemo, useState } from "react";

import {
  fetchFeaturedProperties,
  fetchMostViewedProperties,
  fetchProperties,
} from "@/app/services/propertyApi";

import type { Property } from "@/app/types/properties/property";

import {
  filterProperties,
  getCategory,
  removeDuplicateProperties,
  type ListingFilter,
  type PropertyCategory,
  type PropertyTypeFilter,
} from "@/app/utils/properties/propertiesScreen.utils";

type UsePropertiesScreenOptions = {
  category?: string | string[];
};

export function usePropertiesScreen({
  category,
}: UsePropertiesScreenOptions) {
  const selectedCategory = getCategory(category);
  const isAllPropertiesMode = selectedCategory === null;

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [listingFilter, setListingFilter] =
    useState<ListingFilter>("all");
  const [propertyTypeFilter, setPropertyTypeFilter] =
    useState<PropertyTypeFilter>("all");
  const [openDropdown, setOpenDropdown] =
    useState<ListingFilter | null>(null);

  const loadProperties = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      let result: Property[];

      if (selectedCategory === "Featured Properties") {
        result = await fetchFeaturedProperties();
      } else if (selectedCategory === "Most Viewed") {
        result = await fetchMostViewedProperties();
      } else if (selectedCategory === "Open Houses") {
        const allProperties = await fetchProperties();

        result = allProperties.filter(
          (property) => property.isOpenHouse === true,
        );
      } else if (selectedCategory === "New to Market") {
        result = await fetchProperties();
      } else {
        const [newToMarket, featured, mostViewed] =
          await Promise.all([
            fetchProperties(),
            fetchFeaturedProperties(),
            fetchMostViewedProperties(),
          ]);

        const openHouses = newToMarket.filter(
          (property) => property.isOpenHouse === true,
        );

        result = [
          ...featured,
          ...newToMarket,
          ...openHouses,
          ...mostViewed,
        ];
      }

      setProperties(removeDuplicateProperties(result));
    } catch (requestError) {
      console.error("Failed to load properties:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load properties. Please try again.",
      );

      setProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    void loadProperties();
  }, [loadProperties]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadProperties();
  }, [loadProperties]);

  const filteredProperties = useMemo(
    () =>
      filterProperties(
        properties,
        searchQuery,
        listingFilter,
        propertyTypeFilter,
      ),
    [properties, searchQuery, listingFilter, propertyTypeFilter],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleListingFilterPress = useCallback(
    (filter: ListingFilter) => {
      setOpenDropdown((current) =>
        current === filter ? null : filter,
      );
      setListingFilter(filter);
    },
    [],
  );

  const handlePropertyTypeSelect = useCallback(
    (type: PropertyTypeFilter) => {
      setPropertyTypeFilter(type);
      setOpenDropdown(null);
    },
    [],
  );

  return {
    selectedCategory,
    isAllPropertiesMode,
    properties,
    loading,
    refreshing,
    error,
    searchQuery,
    setSearchQuery,
    listingFilter,
    propertyTypeFilter,
    openDropdown,
    setOpenDropdown,
    filteredProperties,
    handleRefresh,
    clearSearch,
    handleListingFilterPress,
    handlePropertyTypeSelect,
    loadProperties,
  };
}