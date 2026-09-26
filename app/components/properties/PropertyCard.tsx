
// app/components/properties/PropertyCard.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
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
  return (
    <Pressable
      onPress={() => onPress(property)}
      accessibilityRole="button"
      accessibilityLabel={`View ${property.type} property in ${property.location}`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        transform: [
          {
            scale: pressed ? 0.98 : 1,
          },
        ],
      })}
    >
      <View className="mb-4 overflow-hidden rounded-xl border border-[#242424] bg-[#151515]">

        {/* ================================================== */}
        {/* TOP INFORMATION */}
        {/* ================================================== */}

        <View className="flex-row items-center justify-between px-3 py-3">
          <View className="flex-row items-center">
            <View className="mr-2 h-2 w-2 rounded-full bg-red-500" />

            <Text
              className="text-sm font-semibold text-red-400"
              numberOfLines={1}
            >
              {property.tag}
            </Text>
          </View>

          <Text
            className="ml-2 text-sm font-semibold text-gray-300"
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
            className={
              isFullWidth
                ? "h-40 w-full"
                : "h-28 w-full"
            }
            resizeMode="cover"
          />
        ) : (
          <View
            className={
              isFullWidth
                ? "h-40 w-full items-center justify-center bg-[#222]"
                : "h-28 w-full items-center justify-center bg-[#222]"
            }
          >
            <Ionicons
              name="image-outline"
              size={35}
              color="#555"
            />

            <Text className="mt-1 text-xs text-gray-500">
              No image
            </Text>
          </View>
        )}

        {/* ================================================== */}
        {/* CARD CONTENT */}
        {/* ================================================== */}

        <View className="px-3 pb-3 pt-2">

          {/* ================================================= */}
          {/* PROPERTY TYPE */}
          {/* ================================================= */}

          <View className="mb-2">
            <View className="w-full flex-row items-center rounded-md bg-[#242424] px-2.5 py-1.5">
              <Ionicons
                name="business-outline"
                size={15}
                color="#d1d1d1"
              />

              <Text
                className="ml-1 flex-1 text-xs text-gray-300"
                numberOfLines={1}
              >
                {property.type}
              </Text>
            </View>

            {/* ============================================== */}
            {/* BEDROOMS + BATHROOMS */}
            {/* ============================================== */}

            <View className="mt-1.5 flex-row gap-1.5">

              {/* BEDROOMS */}

              <View className="flex-1 flex-row items-center rounded-md bg-[#242424] px-2 py-1.5">
                <Ionicons
                  name="bed-outline"
                  size={15}
                  color="#d1d1d1"
                />

                <Text className="ml-1 text-xs text-gray-300">
                  {property.beds} Beds
                </Text>
              </View>

              {/* BATHROOMS */}

              <View className="flex-1 flex-row items-center rounded-md bg-[#242424] px-2 py-1.5">
                <Ionicons
                  name="water-outline"
                  size={15}
                  color="#d1d1d1"
                />

                <Text className="ml-1 text-xs text-gray-300">
                  {property.baths} Baths
                </Text>
              </View>
            </View>
          </View>

          {/* ================================================= */}
          {/* PRICE */}
          {/* ================================================= */}

          <Text
            className="mb-2 text-sm font-bold text-white"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {property.price}
          </Text>

          {/* ================================================= */}
          {/* LOCATION */}
          {/* ================================================= */}

          <View className="flex-row items-center">
            <Ionicons
              name="location-outline"
              size={17}
              color="#999"
            />

            <Text
              className="ml-1 flex-1 text-xs text-gray-400"
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

              {/* AREA */}

              <View className="mr-2 flex-1 flex-row items-center">
                <Ionicons
                  name="map-outline"
                  size={14}
                  color="#777"
                />

                <Text
                  className="ml-1 flex-1 text-xs text-gray-500"
                  numberOfLines={1}
                >
                  {property.area || "Area unavailable"}
                </Text>
              </View>

              {/* VIEWS */}

              <View className="flex-row items-center">
                <Ionicons
                  name="eye-outline"
                  size={14}
                  color="#777"
                />

                <Text className="ml-1 text-xs text-gray-500">
                  {property.views.toLocaleString()} views
                </Text>
              </View>
            </View>
          )}

          {/* ================================================= */}
          {/* OPEN HOUSE */}
          {/* ================================================= */}

          {property.isOpenHouse && (
            <View className="mt-3 flex-row items-center self-start rounded-md bg-red-600 px-2.5 py-1.5">
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#fff"
              />

              <Text className="ml-1 text-xs font-semibold text-white">
                Open House
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default PropertyCard;

