import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import PropertyCard from "@/app/components/properties/PropertyCard";

import type { Property } from "@/app/types/properties/property";

import {
  createPropertyRows,
  getPropertyId,
} from "@/app/utils/properties/propertiesScreen.utils";

type Props = {
  properties: Property[];
  numberOfColumns: number;
  isDark: boolean;
  searchQuery: string;
  onPropertyPress: (property: Property) => void;
  onClearSearch: () => void;
};

export default function PropertiesGrid({
  properties,
  numberOfColumns,
  isDark,
  searchQuery,
  onPropertyPress,
  onClearSearch,
}: Props) {
  const rows = useMemo(
    () => createPropertyRows(properties, numberOfColumns),
    [properties, numberOfColumns],
  );

  if (properties.length === 0) {
    return (
      <View
        className={`mt-8 items-center rounded-2xl border px-5 py-12 ${
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
                shadowOpacity: 0.08,
                shadowRadius: 5,
                elevation: 3,
              }
        }
      >
        <Ionicons
          name="home-outline"
          size={52}
          color={isDark ? "#444" : "#9ca3af"}
        />

        <Text
          className={`mt-4 text-lg font-semibold ${
            isDark ? "text-gray-400" : "text-gray-700"
          }`}
        >
          No properties found
        </Text>

        <Text
          className={`mt-1 text-center text-sm ${
            isDark ? "text-gray-600" : "text-gray-500"
          }`}
        >
          Try changing your search or listing filter.
        </Text>

        {searchQuery.length > 0 && (
          <Pressable
            onPress={onClearSearch}
            className="mt-5 rounded-xl bg-red-600 px-5 py-3"
          >
            <Text className="font-semibold text-white">
              Clear Search
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View
          key={`property-row-${rowIndex}`}
          className={
            numberOfColumns === 2
              ? "mb-5 flex-row gap-4"
              : "mb-5"
          }
        >
          {row.map((property, propertyIndex) => (
            <View
              key={`${getPropertyId(property)}-${propertyIndex}`}
              className={
                numberOfColumns === 2 ? "flex-1" : "w-full"
              }
            >
              <PropertyCard
                property={property}
                isFullWidth={numberOfColumns === 1}
                onPress={onPropertyPress}
              />
            </View>
          ))}

          {numberOfColumns === 2 && row.length === 1 && (
            <View className="flex-1" />
          )}
        </View>
      ))}
    </View>
  );
}