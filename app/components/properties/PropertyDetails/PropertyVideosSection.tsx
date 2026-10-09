
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import type { PropertyMedia } from "@/app/types/properties/property";
import type { PropertyMediaItem } from "@/app/types/properties/property";
import PropertyVideo from "@/app/components/properties/PropertyDetails/PropertyVideo";

interface PropertyVideosSectionProps {
  videos: PropertyMedia[];
  loading: boolean;
  isDark: boolean;
}

export default function PropertyVideosSection({
  videos,
  loading,
  isDark,
}: PropertyVideosSectionProps) {
  const videoItems: PropertyMediaItem[] = videos.map((video) => ({
    id: video.id,
    name: video.name,
    url: video.original_url,
    description: null,
    collection: null,
  }));

  return (
    <View className="mb-6">
      <Text
        className={`mb-3 text-lg font-bold ${
          isDark ? "text-white" : "text-black"
        }`}
      >
        Property Videos
      </Text>

      {loading ? (
        <ActivityIndicator
          size="small"
          color={isDark ? "#ef4444" : "#dc2626"}
        />
      ) : videoItems.length > 0 ? (
        videoItems.map((video, index) => (
          <PropertyVideo
            key={String(video.id ?? index)}
            video={video}
          />
        ))
      ) : (
        <Text className={isDark ? "text-gray-400" : "text-gray-600"}>
          No videos available for this property.
        </Text>
      )}
    </View>
  );
}
