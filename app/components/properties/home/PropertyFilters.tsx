import React from "react";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import {
  getPropertyTypeLabel,
  type ListingFilter,
  type PropertyTypeFilter,
} from "@/app/utils/properties/propertiesScreen.utils";

type Props = {
  isDark: boolean;
  listingFilter: ListingFilter;
  propertyTypeFilter: PropertyTypeFilter;
  openDropdown: ListingFilter | null;
  propertyCount: number;
  onListingFilterPress: (filter: ListingFilter) => void;
  onPropertyTypeSelect: (type: PropertyTypeFilter) => void;
  onClearPropertyType: () => void;
};

const options: { value: PropertyTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "agricultural", label: "Agricultural" },
];

export default function PropertyFilters({
  isDark,
  listingFilter,
  propertyTypeFilter,
  openDropdown,
  propertyCount,
  onListingFilterPress,
  onPropertyTypeSelect,
  onClearPropertyType,
}: Props) {
  const renderDropdown = (filter: ListingFilter) => {
    if (openDropdown !== filter) return null;

    return (
      <View
        className={`absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-xl border shadow-lg ${
          isDark
            ? "border-[#292929] bg-[#171717]"
            : "border-gray-200 bg-white"
        }`}
      >
        {options.map((option) => {
          const selected = propertyTypeFilter === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onPropertyTypeSelect(option.value)}
              className={`flex-row items-center justify-between border-b px-4 py-3.5 ${
                isDark ? "border-[#292929]" : "border-gray-200"
              } ${selected ? "bg-red-600" : isDark ? "bg-[#171717]" : "bg-white"}`}
            >
              <Text
                className={`text-sm font-medium ${
                  selected
                    ? "text-white"
                    : isDark
                      ? "text-gray-300"
                      : "text-gray-700"
                }`}
              >
                {option.label}
              </Text>

              {selected && (
                <Ionicons name="checkmark" size={18} color="#ffffff" />
              )}
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderButton = (
    filter: ListingFilter,
    label: string,
  ) => {
    const selected = listingFilter === filter;

    return (
      <View key={filter} className="relative flex-1">
        <Pressable
          onPress={() => onListingFilterPress(filter)}
          className={`flex-row items-center justify-center rounded-xl px-2 py-3 ${
            selected
              ? "bg-red-600"
              : isDark
                ? "bg-[#181818]"
                : "bg-gray-100"
          }`}
        >
          <Text
            numberOfLines={1}
            className={`text-sm font-semibold ${
              selected
                ? "text-white"
                : isDark
                  ? "text-gray-200"
                  : "text-gray-800"
            }`}
          >
            {label}
          </Text>

          <Ionicons
            name={openDropdown === filter ? "chevron-up" : "chevron-down"}
            size={16}
            color={
              selected
                ? "#ffffff"
                : isDark
                  ? "#d4d4d4"
                  : "#525252"
            }
            style={{ marginLeft: 5 }}
          />
        </Pressable>

        {renderDropdown(filter)}
      </View>
    );
  };

  return (
    <View className="px-5 pb-4 pt-3">
      <View className="flex-row gap-2">
        {renderButton("all", "All")}
        {renderButton("sale", "For Sale")}
        {renderButton("rent", "For Rent")}
      </View>

      {propertyTypeFilter !== "all" && (
        <View className="mt-2 items-center">
          <Pressable
            onPress={onClearPropertyType}
            className="flex-row items-center rounded-lg px-3 py-1.5"
          >
            <Text className="mr-1 text-sm font-semibold text-red-500">
              {getPropertyTypeLabel(propertyTypeFilter)}
            </Text>
            <Ionicons name="close-circle" size={17} color="#ef4444" />
          </Pressable>
        </View>
      )}

      <Text
        className={`mt-3 text-sm font-medium ${
          isDark ? "text-gray-500" : "text-gray-600"
        }`}
      >
        {propertyCount} {propertyCount === 1 ? "property" : "properties"}
      </Text>
    </View>
  );
}