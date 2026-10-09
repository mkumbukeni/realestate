
import React from "react";
import {
  Dimensions,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import type { PropertyMediaItem } from "@/app/types/properties/property";

const VIDEO_HEIGHT = Math.min(
  240,
  Dimensions.get("window").width * 0.56
);

interface PropertyVideoProps {
  video: PropertyMediaItem;
}

export default function PropertyVideo({ video }: PropertyVideoProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const player = useVideoPlayer(video.url, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  return (
    <View
      className={
        isDark
          ? "mb-4 overflow-hidden rounded-xl border border-[#292929] bg-black"
          : "mb-4 overflow-hidden rounded-xl border border-gray-200 bg-black"
      }
    >
      <VideoView
        player={player}
        style={{
          width: "100%",
          height: VIDEO_HEIGHT,
        }}
        nativeControls
        contentFit="contain"
      />

      {video.description ? (
        <View
          className={
            isDark
              ? "bg-[#171717] px-4 py-3"
              : "bg-gray-100 px-4 py-3"
          }
        >
          <Text
            className={
              isDark
                ? "text-sm text-zinc-300"
                : "text-sm text-gray-700"
            }
          >
            {video.description}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
