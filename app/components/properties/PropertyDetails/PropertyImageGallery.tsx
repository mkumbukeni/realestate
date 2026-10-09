
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  View,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { PropertyMedia } from "@/app/types/properties/property";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_HEIGHT = Math.min(320, SCREEN_WIDTH * 0.7);

interface PropertyImageGalleryProps {
  images: PropertyMedia[];
  fallbackImage?: string | null;
  loading: boolean;
  imageIndex: number;
  isDark: boolean;
  onImageIndexChange: (index: number) => void;
}

export default function PropertyImageGallery({
  images,
  fallbackImage,
  loading,
  imageIndex,
  isDark,
  onImageIndexChange,
}: PropertyImageGalleryProps) {
  const displayImages: PropertyMedia[] =
    images.length > 0
      ? images
      : fallbackImage
        ? [
            {
              id: 0,
              name: "Property image",
              original_url: fallbackImage,
              preview_url: fallbackImage,
            },
          ]
        : [];

  return (
    <View className={isDark ? "bg-[#111]" : "bg-gray-100"}>
      {loading ? (
        <View
          style={{ height: IMAGE_HEIGHT }}
          className="items-center justify-center"
        >
          <ActivityIndicator size="large" color="#dc2626" />
          <Text
            className={
              isDark
                ? "mt-3 text-sm text-zinc-500"
                : "mt-3 text-sm text-gray-500"
            }
          >
            Loading property images...
          </Text>
        </View>
      ) : displayImages.length > 0 ? (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              onImageIndexChange(index);
            }}
          >
            {displayImages.map((image, index) => (
              <View
                key={`${image.id}-${index}`}
                style={{
                  width: SCREEN_WIDTH,
                  height: IMAGE_HEIGHT,
                }}
              >
                <Image
                  source={{
                    uri: image.original_url || image.preview_url,
                  }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          <View className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1.5">
            <Text className="text-xs font-semibold text-white">
              {Math.min(imageIndex + 1, displayImages.length)} /{" "}
              {displayImages.length}
            </Text>
          </View>

          {displayImages.length > 1 ? (
            <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center">
              {displayImages.map((image, index) => (
                <View
                  key={`dot-${image.id}-${index}`}
                  className={`mx-1 h-2 rounded-full ${
                    index === imageIndex
                      ? "w-5 bg-red-500"
                      : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </View>
          ) : null}
        </>
      ) : (
        <View
          style={{ height: IMAGE_HEIGHT }}
          className={
            isDark
              ? "items-center justify-center bg-[#222]"
              : "items-center justify-center bg-gray-200"
          }
        >
          <Ionicons
            name="image-outline"
            size={55}
            color={isDark ? "#555" : "#9ca3af"}
          />
          <Text
            className={
              isDark
                ? "mt-3 text-sm text-zinc-500"
                : "mt-3 text-sm text-gray-500"
            }
          >
            No property images
          </Text>
        </View>
      )}
    </View>
  );
}
