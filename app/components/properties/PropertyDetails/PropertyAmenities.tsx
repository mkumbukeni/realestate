
import React from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface PropertyAmenitiesProps {
  amenities: unknown[];
  isDark: boolean;
}

export default function PropertyAmenities({
  amenities,
  isDark,
}: PropertyAmenitiesProps) {
  const items = amenities
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return String(item).trim();
      }

      if (item && typeof item === "object") {
        const value = item as Record<string, unknown>;
        const name = value.name ?? value.title ?? value.label;
        return name == null ? "" : String(name).trim();
      }

      return "";
    })
    .filter((item) => item.length > 0);

  return (
    <View className="mt-8">
      <Text className={`mb-4 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
        Amenities
      </Text>

      {items.length > 0 ? (
        <View className="flex-row flex-wrap">
          {items.map((amenity, index) => (
            <View
              key={`${amenity}-${index}`}
              className={`mb-2 mr-2 flex-row items-center rounded-full border px-3 py-2 ${
                isDark
                  ? "border-[#333333] bg-[#171717]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#ef4444" />
              <Text className={`ml-2 text-sm ${isDark ? "text-zinc-300" : "text-gray-700"}`}>
                {amenity}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className={isDark ? "text-sm text-zinc-500" : "text-sm text-gray-500"}>
          No amenities listed for this property.
        </Text>
      )}
    </View>
  );
}
