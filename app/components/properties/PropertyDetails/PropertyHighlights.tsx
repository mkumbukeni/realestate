
import React from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type HighlightIcon =
  | "eye-outline"
  | "bed-outline"
  | "water-outline"
  | "resize-outline"
  | "document-text-outline";

interface HighlightItem {
  icon: HighlightIcon;
  value: string | number;
  label: string;
  wide?: boolean;
}

interface PropertyHighlightsProps {
  views?: string | number;
  bedrooms?: string | number;
  bathrooms?: string | number;
  buildingSize?: string | number;
  masterBedroom?: string;
  titleDeed?: string;
  isDark: boolean;
}

function HighlightCard({
  icon,
  value,
  label,
  wide,
  isDark,
}: HighlightItem & { isDark: boolean }) {
  return (
    <View
      className={`mb-3 mr-3 min-h-[92px] rounded-xl border p-3 ${
        wide ? "w-full" : "w-[46%]"
      } ${
        isDark
          ? "border-[#292929] bg-[#171717]"
          : "border-gray-200 bg-white"
      }`}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon} size={20} color="#ef4444" />
        <Text
          className={`ml-2 flex-1 text-sm font-semibold ${
            isDark ? "text-zinc-400" : "text-gray-500"
          }`}
        >
          {label || "Details"}
        </Text>
      </View>

      <Text
        className={`mt-3 text-base font-bold ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {String(value)}
      </Text>
    </View>
  );
}

export default function PropertyHighlights({
  views,
  bedrooms,
  bathrooms,
  buildingSize,
  masterBedroom,
  titleDeed,
  isDark,
}: PropertyHighlightsProps) {
  const items: HighlightItem[] = [];

  if (views) {
    items.push({ icon: "eye-outline", value: views, label: "Views" });
  }
  if (bedrooms) {
    items.push({ icon: "bed-outline", value: bedrooms, label: "Beds" });
  }
  if (bathrooms) {
    items.push({ icon: "water-outline", value: bathrooms, label: "Baths" });
  }
  if (buildingSize) {
    const size = String(buildingSize);
    items.push({
      icon: "resize-outline",
      value: /m²|sq\.?\s*m/i.test(size) ? size : `${size}m²`,
      label: "Area",
    });
  }
  if (masterBedroom) {
    items.push({
      icon: "bed-outline",
      value: masterBedroom,
      label: "Master Bedroom",
      wide: true,
    });
  }
  if (titleDeed) {
    items.push({
      icon: "document-text-outline",
      value: titleDeed,
      label: "Title Deed",
      wide: true,
    });
  }

  return (
    <View className="mt-7">
      <Text
        className={`mb-4 text-xl font-bold ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Property Highlights
      </Text>

      {items.length > 0 ? (
        <View className="flex-row flex-wrap">
          {items.map((item, index) => (
            <HighlightCard
              key={`${item.label}-${index}`}
              {...item}
              isDark={isDark}
            />
          ))}
        </View>
      ) : (
        <Text className={isDark ? "text-sm text-zinc-500" : "text-sm text-gray-500"}>
          No property highlights available.
        </Text>
      )}
    </View>
  );
}
