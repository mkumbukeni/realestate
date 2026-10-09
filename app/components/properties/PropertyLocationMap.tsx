import React from "react";

import {
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";

export interface PropertyCoordinates {
  latitude: number;
  longitude: number;
}

interface PropertyLocationMapProps {
  coordinates: PropertyCoordinates | null;
  locationText: string;
  propertyTitle?: string | null;
  isDark: boolean;
}

export default function PropertyLocationMap({
  coordinates,
  locationText,
  propertyTitle,
  isDark,
}: PropertyLocationMapProps) {
  return (
    <View className="mt-8">
      <View className="mb-4 flex-row items-center justify-between">
        <Text
          className={
            isDark
              ? "text-xl font-bold text-white"
              : "text-xl font-bold text-black"
          }
        >
          Property Location
        </Text>

        {coordinates ? (
          <Ionicons
            name="location"
            size={22}
            color="#ef4444"
          />
        ) : null}
      </View>

      {coordinates ? (
        <View
          className={
            isDark
              ? "overflow-hidden rounded-xl border border-[#292929]"
              : "overflow-hidden rounded-xl border border-gray-200"
          }
        >
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{
              width: "100%",
              height: 280,
            }}
            initialRegion={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsCompass={false}
            zoomEnabled={false}
            scrollEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
          >
            <Marker
              coordinate={coordinates}
              title={propertyTitle || "Property"}
              description={
                locationText || "Property location"
              }
            />
          </MapView>

          <View
            className={
              isDark
                ? "border-t border-[#292929] bg-[#171717] px-4 py-3"
                : "border-t border-gray-200 bg-white px-4 py-3"
            }
          >
            <View className="flex-row items-center">
              <Ionicons
                name="location-outline"
                size={18}
                color="#ef4444"
              />

              <Text
                className={
                  isDark
                    ? "ml-2 flex-1 text-sm text-zinc-300"
                    : "ml-2 flex-1 text-sm text-gray-700"
                }
                numberOfLines={2}
              >
                {locationText || "Property location"}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View
          className={
            isDark
              ? "items-center rounded-xl border border-[#292929] bg-[#171717] px-5 py-10"
              : "items-center rounded-xl border border-gray-200 bg-white px-5 py-10"
          }
        >
          <Ionicons
            name="map-outline"
            size={50}
            color={isDark ? "#555" : "#9ca3af"}
          />

          <Text
            className={
              isDark
                ? "mt-3 text-center text-sm font-medium text-zinc-400"
                : "mt-3 text-center text-sm font-medium text-gray-600"
            }
          >
            Property coordinates unavailable
          </Text>

          <Text
            className={
              isDark
                ? "mt-2 text-center text-xs leading-5 text-zinc-600"
                : "mt-2 text-center text-xs leading-5 text-gray-500"
            }
          >
            This property does not currently have valid
            latitude and longitude coordinates.
          </Text>

          {locationText ? (
            <View className="mt-4 flex-row items-center">
              <Ionicons
                name="location-outline"
                size={16}
                color={isDark ? "#777" : "#6b7280"}
              />

              <Text
                className={
                  isDark
                    ? "ml-2 text-xs text-zinc-500"
                    : "ml-2 text-xs text-gray-500"
                }
              >
                {locationText}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}