
// app/components/properties/PropertyCard.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
  useColorScheme,
} from "react-native";

import type { Property } from "@/app/services/propertyApi";

interface PropertyCardProps {
  property: Property;
  isFullWidth?: boolean;
  onPress: (property: Property) => void;
}

const PropertyCard = ({
  property,
  isFullWidth = false,
  onPress,
}: PropertyCardProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  /**
   * Always send the property press to the parent.
   *
   * Authentication is handled by the parent screen
   * so that logged-out users can see the authentication
   * popup instead of having the press silently ignored.
   */
  const handlePress = () => {
    onPress(property);
  };

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
            <View className="mr-2 h-2 w-2 rounded-full bg-red-500" />

            <Text
              className="flex-1 text-sm font-semibold text-red-400"
              numberOfLines={1}
            >
              {property.tag}
            </Text>
          </View>

          <Text
            className={
              isDark
                ? "text-sm font-semibold text-gray-300"
                : "text-sm font-semibold text-gray-700"
            }
            numberOfLines={1}
          >
            {property.systemStatus}
          </Text>
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

          {/* ================================================= */}
          {/* LOGIN REQUIRED INDICATOR */}
          {/* ================================================= */}

          <View className="mt-3 flex-row items-center">
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />

            <Text
              className={
                isDark
                  ? "ml-1 text-xs text-gray-400"
                  : "ml-1 text-xs text-gray-600"
              }
            >
              Sign in to view full details
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default PropertyCard;

