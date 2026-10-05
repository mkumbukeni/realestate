import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Blog } from "@/app/services/blogs/blogApi";

interface BlogCardProps {
  blog: Blog;
  onPress: () => void;
}

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/*
|--------------------------------------------------------------------------
| Remove HTML
|--------------------------------------------------------------------------
*/

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/*
|--------------------------------------------------------------------------
| Normalize Image URL
|--------------------------------------------------------------------------
*/

function normalizeImageUrl(
  imageUrl: string | null
): string | null {
  if (!imageUrl) {
    return null;
  }

  let url = imageUrl.trim();

  /*
  |--------------------------------------------------------------------------
  | Handle Markdown image URLs
  |--------------------------------------------------------------------------
  */

  const markdownMatch = url.match(
    /^\[.*?\]\((.*?)\)$/
  );

  if (markdownMatch?.[1]) {
    url = markdownMatch[1];
  }

  return url;
}

/*
|--------------------------------------------------------------------------
| Blog Card
|--------------------------------------------------------------------------
*/

export default function BlogCard({
  blog,
  onPress,
}: BlogCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const imageUrl = normalizeImageUrl(
    blog.featured_image_url
  );

  const description =
    blog.excerpt?.trim() ||
    stripHtml(blog.content).slice(0, 130);

  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 overflow-hidden rounded-xl border active:opacity-90 ${
        isDark
          ? "border-[#383838] bg-[#202020]"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* =====================================================
          IMAGE
      ====================================================== */}

      {imageUrl ? (
        <Image
          source={{
            uri: imageUrl,
          }}
          className="h-[125px] w-full"
          resizeMode="cover"
        />
      ) : (
        <View
          className={`h-[125px] w-full items-center justify-center ${
            isDark ? "bg-[#292929]" : "bg-gray-100"
          }`}
        >
          <Ionicons
            name="newspaper-outline"
            size={38}
            color={isDark ? "#666666" : "#9ca3af"}
          />

          <Text
            className={`mt-1 text-xs ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            No image available
          </Text>
        </View>
      )}

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <View className="p-3">
        {/* Designation */}

        <View className="mb-2 self-start rounded-full bg-red-600/15 px-2.5 py-1">
          <Text className="text-[10px] font-semibold uppercase text-red-500">
            iMORRCS
          </Text>
        </View>

        {/* Title */}

        <Text
          numberOfLines={2}
          className={`text-[16px] font-bold leading-5 ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          {blog.title}
        </Text>

        {/* Excerpt */}

        <Text
          numberOfLines={2}
          className={`mt-1.5 text-[12px] leading-5 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {description}
        </Text>

        {/* =================================================
            AUTHOR / DATE / VIEWS
        ================================================== */}

        <View
          className={`mt-3 flex-row items-center border-t pt-2.5 ${
            isDark
              ? "border-[#363636]"
              : "border-gray-200"
          }`}
        >
          {/* Author */}

          <View
            className={`h-7 w-7 items-center justify-center rounded-full ${
              isDark ? "bg-[#303030]" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name="person-outline"
              size={14}
              color={isDark ? "#aaaaaa" : "#6b7280"}
            />
          </View>

          <View className="ml-2 flex-1">
            <Text
              numberOfLines={1}
              className={`text-xs font-medium ${
                isDark ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {blog.author_name || "iMORRCS"}
            </Text>

            <Text
              className={`mt-0.5 text-[10px] ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {formatDate(blog.created_at)}
            </Text>
          </View>

          {/* Views */}

          <View className="flex-row items-center">
            <Ionicons
              name="eye-outline"
              size={14}
              color={isDark ? "#777777" : "#6b7280"}
            />

            <Text
              className={`ml-1 text-[10px] ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {blog.view_count}
            </Text>
          </View>
        </View>

        {/* =================================================
            READ MORE
        ================================================== */}

        <View className="mt-2.5 flex-row items-center justify-end">
          <Text className="mr-1 text-xs font-semibold text-red-500">
            Read More
          </Text>

          <Ionicons
            name="arrow-forward"
            size={14}
            color="#ef4444"
          />
        </View>
      </View>
    </Pressable>
  );
}