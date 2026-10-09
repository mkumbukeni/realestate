
import React from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface PropertyInformationData {
  title?: string | null;
  listingType?: string | null;
  status?: string | null;
  location?: string | null;
  zone?: string | null;
  price?: string | number | null;
  propertyType?: string | null;
  bedrooms?: string | number | null;
  bathrooms?: string | number | null;
  buildingSize?: string | number | null;
  yearBuilt?: string | number | null;
  titleDeed?: string | null;
  masterBedroom?: string | null;
  views?: string | number | null;
}

interface PropertyInformationProps {
  information: PropertyInformationData;
  isDark: boolean;
}

interface InformationRowProps {
  label: string;
  value?: string | number | null;
  isDark: boolean;
}

export function InformationRow({
  label,
  value,
  isDark,
}: InformationRowProps) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  return (
    <View
      className={`flex-row items-start justify-between border-b px-4 py-3 ${
        isDark ? "border-[#292929]" : "border-gray-200"
      }`}
    >
      <Text className={`mr-4 flex-1 text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
        {label}
      </Text>
      <Text
        className={`flex-1 text-right text-sm font-semibold ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {String(value)}
      </Text>
    </View>
  );
}

export default function PropertyInformation({
  information,
  isDark,
}: PropertyInformationProps) {
  const {
    title,
    listingType,
    status,
    location,
    zone,
    price,
    propertyType,
    bedrooms,
    bathrooms,
    buildingSize,
    yearBuilt,
    titleDeed,
    masterBedroom,
    views,
  } = information;

  return (
    <View className="px-4 pt-5">
      <View className="flex-row items-center justify-between">
        <View className="rounded-md bg-red-600 px-3 py-1.5">
          <Text className="text-xs font-bold text-white">
            {listingType || "For Sale"}
          </Text>
        </View>

        {status ? (
          <Text className={`text-sm font-medium ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
            {status}
          </Text>
        ) : null}
      </View>

      <Text
        className={`mt-4 text-2xl font-bold ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {title || location || "Property"}
      </Text>

      {location ? (
        <View className="mt-3 flex-row items-start">
          <Ionicons name="location-outline" size={20} color="#ef4444" />
          <View className="ml-2 flex-1">
            <Text className={`text-base font-semibold ${isDark ? "text-zinc-300" : "text-gray-700"}`}>
              {location}
            </Text>
            {zone ? (
              <Text className={`mt-1 text-sm ${isDark ? "text-zinc-500" : "text-gray-500"}`}>
                Zone: {zone}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <Text className={`mt-5 text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
        {price || "Price on request"}
      </Text>

      <View className="mt-8">
        <Text className={`mb-4 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Property Details
        </Text>

        <View
          className={`overflow-hidden rounded-xl border ${
            isDark ? "border-[#292929] bg-[#171717]" : "border-gray-200 bg-white"
          }`}
        >
          <InformationRow label="Property Type" value={propertyType} isDark={isDark} />
          <InformationRow label="Bedrooms" value={bedrooms} isDark={isDark} />
          <InformationRow label="Bathrooms" value={bathrooms} isDark={isDark} />
          <InformationRow label="Building Size" value={buildingSize} isDark={isDark} />
          <InformationRow label="Year Built" value={yearBuilt} isDark={isDark} />
          <InformationRow label="Zone" value={zone} isDark={isDark} />
          <InformationRow label="Master Bedroom" value={masterBedroom} isDark={isDark} />
          <InformationRow label="Title Deed" value={titleDeed} isDark={isDark} />
          <InformationRow label="Views" value={views} isDark={isDark} />
        </View>
      </View>
    </View>
  );
}
