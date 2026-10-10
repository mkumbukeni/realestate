
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
  useColorScheme,
} from "react-native";

import type { Property } from "@/app/types/properties/property";

export type PropertyStatusType =
  | "featured"
  | "new"
  | "openHouse"
  | "mostViewed";

interface PropertyCardProps {
  property: Property;
  isFullWidth?: boolean;
  onPress: (property: Property) => void;
  statusType?: PropertyStatusType;
}

const PropertyCard = ({
  property,
  isFullWidth = false,
  onPress,
  statusType,
}: PropertyCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const handlePress = () => {
    onPress(property);
  };

  // ==========================================================
  // FORMAT PROPERTY STATUS BASED ON SECTION
  // ==========================================================

  const getPropertyStatus = (): string | null => {
    switch (statusType) {
      // Featured properties do not display a status.
      case "featured":
        return null;

      // New to Market: calculate age from creation date.
      case "new": {
        if (!property.createdAt) {
          return null;
        }

        const createdDate = new Date(property.createdAt);

        if (Number.isNaN(createdDate.getTime())) {
          return null;
        }

        const now = new Date();

        const years =
          now.getFullYear() - createdDate.getFullYear();

        const months =
          now.getMonth() - createdDate.getMonth();

        const days =
          now.getDate() - createdDate.getDate();

        let totalMonths = years * 12 + months;

        if (days < 0) {
          totalMonths -= 1;
        }

        if (totalMonths < 1) {
          return "Less than a month";
        }

        if (totalMonths < 12) {
          return totalMonths === 1
            ? "1 month ago"
            : `${totalMonths} months ago`;
        }

        const totalYears = Math.floor(totalMonths / 12);

        return totalYears === 1
          ? "Over a year"
          : `Over ${totalYears} years`;
      }

      // Open Houses: show the start date.
      case "openHouse": {
        if (!property.openHouseStartDate) {
          return null;
        }

        const startDate = new Date(
          property.openHouseStartDate,
        );

        if (Number.isNaN(startDate.getTime())) {
          return null;
        }

        return startDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }

      // Most Viewed: show the number of views.
      case "mostViewed": {
        const views = property.views;

        if (
          typeof views !== "number" ||
          !Number.isFinite(views)
        ) {
          return null;
        }

        return `${views.toLocaleString("en-US")} ${
          views === 1 ? "view" : "views"
        }`;
      }

      // Preserve the existing status for cards used elsewhere.
      default:
        return property.systemStatus || null;
    }
  };

  const propertyStatus = getPropertyStatus();

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View ${property.type} property in ${property.location}`}
      style={({ pressed }) => ({
        width: isFullWidth ? "100%" : 280,
        opacity: pressed ? 0.75 : 1,
        transform: [
          {
            scale: pressed ? 0.98 : 1,
          },
        ],
      })}
    >
      <View
        className={
          isDark
            ? "mb-4 w-full overflow-hidden rounded-xl border border-[#242424] bg-[#151515]"
            : "mb-4 w-full overflow-hidden rounded-xl border border-gray-200 bg-white"
        }
      >
        {/* ================================================== */}
        {/* TOP INFORMATION */}
        {/* ================================================== */}

        <View className="flex-row items-center justify-between px-3 py-3">
          <View className="mr-2 flex-1 flex-row items-center">
            <View className="mr-2 h-2 w-2 rounded-full" />

            <Text
              className="flex-1 text-sm font-semibold text-black dark:text-white"
              numberOfLines={1}
            >
              {property.tag}
            </Text>
          </View>

          {propertyStatus !== null && (
            <View className="ml-2 flex-row items-center">
              {/* Eye icon appears only in Most Viewed. */}
              {statusType === "mostViewed" && (
                <Ionicons
                  name="eye-outline"
                  size={16}
                  color={isDark ? "#d1d1d1" : "#4b5563"}
                  style={{ marginRight: 4 }}
                />
              )}

              <Text
                className={
                  isDark
                    ? "text-sm font-semibold text-gray-300"
                    : "text-sm font-semibold text-gray-700"
                }
                numberOfLines={1}
              >
                {propertyStatus}
              </Text>
            </View>
          )}
        </View>

        {/* ================================================== */}
        {/* PROPERTY IMAGE */}
        {/* ================================================== */}

        {property.image ? (
          <Image
            source={{
              uri: property.image,
            }}
            className="h-40 w-full"
            resizeMode="cover"
          />
        ) : (
          <View
            className={
              isDark
                ? "h-40 w-full items-center justify-center bg-[#222]"
                : "h-40 w-full items-center justify-center bg-gray-100"
            }
          >
            <Ionicons
              name="image-outline"
              size={35}
              color={isDark ? "#555" : "#999"}
            />

            <Text
              className={
                isDark
                  ? "mt-1 text-xs text-gray-500"
                  : "mt-1 text-xs text-gray-600"
              }
            >
              No image
            </Text>
          </View>
        )}

        {/* ================================================== */}
        {/* CARD CONTENT */}
        {/* ================================================== */}

        <View className="px-3 pb-3 pt-2">
          {/* PRICE */}

          <Text
            className={
              isDark
                ? "mb-2 text-sm font-bold text-white"
                : "mb-2 text-sm font-bold text-black"
            }
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {property.price}
          </Text>

          {/* ================================================= */}
          {/* PROPERTY TYPE + BEDS + BATHS */}
          {/* ================================================= */}

          <View className="mb-2 flex-row items-center">
            {/* PROPERTY TYPE */}

            <View
              className={
                isDark
                  ? "mr-2 flex-1 flex-row items-center rounded-md bg-[#242424] px-2.5 py-1.5"
                  : "mr-2 flex-1 flex-row items-center rounded-md bg-gray-100 px-2.5 py-1.5"
              }
            >
              <Ionicons
                name="business-outline"
                size={15}
                color={isDark ? "#d1d1d1" : "#333"}
              />

              <Text
                className={
                  isDark
                    ? "ml-1 flex-1 text-xs text-gray-300"
                    : "ml-1 flex-1 text-xs text-gray-800"
                }
                numberOfLines={1}
              >
                {property.type}
              </Text>
            </View>

            {/* BEDROOMS */}

            <View
              className={
                isDark
                  ? "mr-2 flex-row items-center rounded-md bg-[#242424] px-2 py-1.5"
                  : "mr-2 flex-row items-center rounded-md bg-gray-100 px-2 py-1.5"
              }
            >
              <Ionicons
                name="bed-outline"
                size={15}
                color={isDark ? "#d1d1d1" : "#333"}
              />

              <Text
                className={
                  isDark
                    ? "ml-1 text-xs text-gray-300"
                    : "ml-1 text-xs text-gray-800"
                }
              >
                {property.beds} Beds
              </Text>
            </View>

            {/* BATHROOMS */}

            <View
              className={
                isDark
                  ? "flex-row items-center rounded-md bg-[#242424] px-2 py-1.5"
                  : "flex-row items-center rounded-md bg-gray-100 px-2 py-1.5"
              }
            >
              <Ionicons
                name="water-outline"
                size={15}
                color={isDark ? "#d1d1d1" : "#333"}
              />

              <Text
                className={
                  isDark
                    ? "ml-1 text-xs text-gray-300"
                    : "ml-1 text-xs text-gray-800"
                }
              >
                {property.baths} Baths
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* LOCATION */}
          {/* ================================================= */}

          <View className="flex-row items-center">
            <Ionicons
              name="location-outline"
              size={17}
              color={isDark ? "#999" : "#555"}
            />

            <Text
              className={
                isDark
                  ? "ml-1 flex-1 text-xs text-gray-400"
                  : "ml-1 flex-1 text-xs text-gray-700"
              }
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {property.location}
            </Text>
          </View>

          {/* ================================================= */}
          {/* EXTRA INFORMATION */}
          {/* ================================================= */}

          {isFullWidth && (
            <View className="mt-2 flex-row items-center justify-between">
              <View className="mr-2 flex-1 flex-row items-center" />
            </View>
          )}

         
          
        </View>
      </View>
    </Pressable>
  );
};

export default PropertyCard;
