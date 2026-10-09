import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import PropertyFilters from "./PropertyFilters";

import type {
  ListingFilter,
  PropertyCategory,
  PropertyTypeFilter,
} from "@/app/utils/properties/propertiesScreen.utils";

type Props = {
  isDark: boolean;
  screenTitle: string;
  isAllPropertiesMode: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  listingFilter: ListingFilter;
  propertyTypeFilter: PropertyTypeFilter;
  openDropdown: ListingFilter | null;
  propertyCount: number;
  onListingFilterPress: (filter: ListingFilter) => void;
  onPropertyTypeSelect: (type: PropertyTypeFilter) => void;
  onClearPropertyType: () => void;
};

export default function PropertiesHeader({
  isDark,
  screenTitle,
  isAllPropertiesMode,
  searchQuery,
  onSearchChange,
  onClearSearch,
  listingFilter,
  propertyTypeFilter,
  openDropdown,
  propertyCount,
  onListingFilterPress,
  onPropertyTypeSelect,
  onClearPropertyType,
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

      <View className="px-5 pt-4">
        <View
          className={`flex-row items-center rounded-xl border px-4 ${
            isDark
              ? "border-[#292929] bg-[#171717]"
              : "border-gray-200 bg-white"
          }`}
          style={
            isDark
              ? undefined
              : {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }
          }
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={isDark ? "#777" : "#737373"}
          />

          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search properties..."
            placeholderTextColor={isDark ? "#666" : "#a3a3a3"}
            className={`ml-3 flex-1 py-3.5 text-sm ${
              isDark ? "text-white" : "text-black"
            }`}
            returnKeyType="search"
          />

          {searchQuery.length > 0 && (
            <Pressable
              onPress={onClearSearch}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#ef4444"
              />
            </Pressable>
          )}
        </View>
      </View>

      <PropertyFilters
        isDark={isDark}
        listingFilter={listingFilter}
        propertyTypeFilter={propertyTypeFilter}
        openDropdown={openDropdown}
        propertyCount={propertyCount}
        onListingFilterPress={onListingFilterPress}
        onPropertyTypeSelect={onPropertyTypeSelect}
        onClearPropertyType={onClearPropertyType}
      />
    </View>
  );
}