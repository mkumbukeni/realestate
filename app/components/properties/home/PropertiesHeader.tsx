
import React from "react";
import { Text, View } from "react-native";

import PropertyFilters, {
  type ListingFilter,
  type PropertyTypeFilter,
  type DetailedPropertyFilters,
} from "./PropertyFilters";

import type { Property } from "@/app/types/properties/property";

type Props = {
  isDark: boolean;
  screenTitle: string;
  isAllPropertiesMode: boolean;
  listingFilter: ListingFilter;
  propertyTypeFilter: PropertyTypeFilter;
  propertyCount: number;
  availableProperties: Property[];
  onListingFilterPress: (filter: ListingFilter) => void;
  onPropertyTypeSelect: (type: PropertyTypeFilter) => void;
  onDetailedFiltersChange: (filters: DetailedPropertyFilters) => void;
};

export default function PropertiesHeader({
  isDark,
  screenTitle,
  isAllPropertiesMode,
  listingFilter,
  propertyTypeFilter,
  propertyCount,
  availableProperties,
  onListingFilterPress,
  onPropertyTypeSelect,
  onDetailedFiltersChange,
}: Props) {
  return (
    <View className={isDark ? "bg-[#0d0d0d]" : "bg-white"}>
      <View
        className={`border-b px-5 pb-3.5 pt-2.5 ${
          isDark ? "border-[#222]" : "border-gray-200"
        }`}
      >
        <Text
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          {screenTitle}
        </Text>

        {isAllPropertiesMode && (
          <Text
            className={`mt-1 text-sm ${
              isDark ? "text-gray-500" : "text-gray-600"
            }`}
          >
            Explore all available properties
          </Text>
        )}
      </View>

      <PropertyFilters
        section="listing"
        isDark={isDark}
        listingFilter={listingFilter}
        propertyTypeFilter={propertyTypeFilter}
        propertyCount={propertyCount}
        availableProperties={availableProperties}
        onListingFilterPress={onListingFilterPress}
        onPropertyTypeSelect={onPropertyTypeSelect}
        onFiltersChange={onDetailedFiltersChange}
      />
    </View>
  );
}
