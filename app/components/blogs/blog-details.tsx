import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  useColorScheme,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useLocalSearchParams, useRouter } from "expo-router";

import {
  getBlogById,
  type Blog,
} from "@/app/services/blogs/blogApi";

/*
|--------------------------------------------------------------------------
| Facebook-Style Shimmer
|--------------------------------------------------------------------------
*/

function FacebookShimmer({
  isDark,
  style,
}: {
  isDark: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const shimmerAnimation = useRef(
    new Animated.Value(0)
  ).current;

  const [containerWidth, setContainerWidth] =
    useState(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmerAnimation]);

  const handleLayout = (
    event: LayoutChangeEvent
  ) => {
    setContainerWidth(
      event.nativeEvent.layout.width
    );
  };

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-110, containerWidth + 110],
  });

  return (
    <View
      onLayout={handleLayout}
      style={[
        {
          overflow: "hidden",
          backgroundColor: isDark
            ? "#292929"
            : "#e5e7eb",
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 110,
          transform: [{ translateX }],
          backgroundColor: isDark
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.65)",
        }}
      />
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Blog Details Loading Skeleton
|--------------------------------------------------------------------------
*/

function BlogDetailsLoadingSkeleton({
  isDark,
  screenBackground,
  headerBackground,
  borderColor,
  primaryText,
  onBack,
}: {
  isDark: boolean;
  screenBackground: string;
  headerBackground: string;
  borderColor: string;
  primaryText: string;
  onBack: () => void;
}) {
  return (
    <SafeAreaView
      className={`flex-1 ${
        isDark ? "bg-[#0d0d0d]" : "bg-gray-50"
      }`}
    >
      <StatusBar
        barStyle={
          isDark ? "light-content" : "dark-content"
        }
        backgroundColor={screenBackground}
      />

      {/* Header */}

      <View
        className={`flex-row items-center border-b px-4 py-3 ${borderColor}`}
        style={{
          backgroundColor: headerBackground,
        }}
      >
        <Pressable
          onPress={onBack}
          className={`h-10 w-10 items-center justify-center rounded-full ${
            isDark ? "bg-[#202020]" : "bg-gray-100"
          }`}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={isDark ? "#ffffff" : "#111827"}
          />
        </Pressable>

        <Text
          className={`ml-3 text-base font-semibold ${primaryText}`}
        >
          Blog
        </Text>
      </View>

      {/* Featured Image Skeleton */}

      <FacebookShimmer
        isDark={isDark}
        style={{
          width: "100%",
          height: 230,
        }}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {/* Designation */}

        <FacebookShimmer
          isDark={isDark}
          style={{
            width: 85,
            height: 25,
            borderRadius: 20,
          }}
        />

        {/* Title */}

        <FacebookShimmer
          isDark={isDark}
          style={{
            width: "95%",
            height: 23,
            borderRadius: 5,
            marginTop: 17,
          }}
        />

        <FacebookShimmer
          isDark={isDark}
          style={{
            width: "75%",
            height: 23,
            borderRadius: 5,
            marginTop: 9,
          }}
        />

        {/* Author / Date / Views */}

        <View
          className={`mt-5 flex-row items-center border-b pb-4 ${
            isDark
              ? "border-[#303030]"
              : "border-gray-200"
          }`}
        >
          <FacebookShimmer
            isDark={isDark}
            style={{
              width: 40,
              height: 40,
              borderRadius: 25,
            }}
          />

          <View className="ml-3 flex-1">
            <FacebookShimmer
              isDark={isDark}
              style={{
                width: 110,
                height: 13,
                borderRadius: 4,
              }}
            />

            <FacebookShimmer
              isDark={isDark}
              style={{
                width: 85,
                height: 11,
                borderRadius: 4,
                marginTop: 8,
              }}
            />
          </View>

          <FacebookShimmer
            isDark={isDark}
            style={{
              width: 40,
              height: 12,
              borderRadius: 4,
            }}
          />
        </View>

        {/* Article Content */}

        <View className="pt-6">
          {Array.from({ length: 5 }).map(
            (_, paragraphIndex) => (
              <View
                key={`paragraph-${paragraphIndex}`}
                className="mb-6"
              >
                <FacebookShimmer
                  isDark={isDark}
                  style={{
                    width: "100%",
                    height: 13,
                    borderRadius: 4,
                  }}
                />

                <FacebookShimmer
                  isDark={isDark}
                  style={{
                    width: "95%",
                    height: 13,
                    borderRadius: 4,
                    marginTop: 10,
                  }}
                />

                <FacebookShimmer
                  isDark={isDark}
                  style={{
                    width: "90%",
                    height: 13,
                    borderRadius: 4,
                    marginTop: 10,
                  }}
                />

                <FacebookShimmer
                  isDark={isDark}
                  style={{
                    width: "65%",
                    height: 13,
                    borderRadius: 4,
                    marginTop: 10,
                  }}
                />
              </View>
            )
          )}
        </View>

        {/* Footer */}

        <View
          className={`mt-3 border-t pt-5 ${
            isDark
              ? "border-[#303030]"
              : "border-gray-200"
          }`}
        >
          <FacebookShimmer
            isDark={isDark}
            style={{
              width: "80%",
              height: 12,
              borderRadius: 4,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    month: "long",
    year: "numeric",
  });
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
| Convert HTML Content To Readable Text
|--------------------------------------------------------------------------
*/

function cleanBlogContent(content: string): string {
  return content
    // Convert common HTML blocks to line breaks
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")

    // Convert list bullets
    .replace(/<li[^>]*>/gi, "• ")

    // Remove remaining HTML tags
    .replace(/<[^>]*>/g, "")

    // Decode common HTML entities
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")

    // Remove excessive spaces
    .replace(/[ \t]+/g, " ")

    // Remove excessive blank lines
    .replace(/\n{3,}/g, "\n\n")

    .trim();
}

/*
|--------------------------------------------------------------------------
| Blog Details Screen
|--------------------------------------------------------------------------
*/

export default function BlogDetailsScreen() {
  const router = useRouter();

  /*
  |--------------------------------------------------------------------------
  | Theme
  |--------------------------------------------------------------------------
  */

  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const params = useLocalSearchParams<{
    id?: string;
    slug?: string;
  }>();

  const blogId = params.id;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Theme Colors
  |--------------------------------------------------------------------------
  */

  const screenBackground = isDark
    ? "#0d0d0d"
    : "#f8f9fa";

  const headerBackground = isDark
    ? "#0d0d0d"
    : "#ffffff";

  const headerButtonBackground = isDark
    ? "#202020"
    : "#f3f4f6";

  const borderColor = isDark
    ? "border-[#292929]"
    : "border-gray-200";

  const sectionBorderColor = isDark
    ? "border-[#303030]"
    : "border-gray-200";

  const primaryText = isDark
    ? "text-white"
    : "text-black";

  const authorText = isDark
    ? "text-gray-200"
    : "text-gray-800";

  const bodyText = isDark
    ? "text-gray-300"
    : "text-gray-700";

  const mutedText = isDark
    ? "text-gray-500"
    : "text-gray-500";

  /*
  |--------------------------------------------------------------------------
  | Fetch Blog
  |--------------------------------------------------------------------------
  */

  const fetchBlog = useCallback(async () => {
    if (!blogId) {
      setError("Blog ID was not provided.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getBlogById(blogId);

      setBlog(data);
    } catch (err) {
      console.error("Failed to fetch blog:", err);

      setError(
        "Unable to load this blog. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <BlogDetailsLoadingSkeleton
        isDark={isDark}
        screenBackground={screenBackground}
        headerBackground={headerBackground}
        borderColor={borderColor}
        primaryText={primaryText}
        onBack={() => router.back()}
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !blog) {
    return (
      <SafeAreaView
        className={`flex-1 ${
          isDark ? "bg-[#0d0d0d]" : "bg-gray-50"
        }`}
      >
        <StatusBar
          barStyle={
            isDark ? "light-content" : "dark-content"
          }
          backgroundColor={screenBackground}
        />

        {/* Header */}

        <View
          className={`flex-row items-center border-b px-4 py-3 ${borderColor}`}
          style={{
            backgroundColor: headerBackground,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            className={`h-10 w-10 items-center justify-center rounded-full ${
              isDark ? "bg-[#202020]" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={isDark ? "#ffffff" : "#111827"}
            />
          </Pressable>

          <Text
            className={`ml-3 text-base font-semibold ${primaryText}`}
          >
            Blog
          </Text>
        </View>

        {/* Error */}

        <View className="flex-1 items-center justify-center px-6">
          <View
            className={`h-16 w-16 items-center justify-center rounded-full ${
              isDark
                ? "bg-[#291515]"
                : "bg-red-50"
            }`}
          >
            <Ionicons
              name="newspaper-outline"
              size={32}
              color="#ef4444"
            />
          </View>

          <Text
            className={`mt-4 text-center text-lg font-semibold ${primaryText}`}
          >
            Unable to Load Blog
          </Text>

          <Text
            className={`mt-2 text-center text-sm leading-5 ${
              isDark
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          >
            {error ||
              "The requested blog could not be found."}
          </Text>

          <Pressable
            onPress={fetchBlog}
            className="mt-5 rounded-lg bg-red-600 px-6 py-3 active:bg-red-700"
          >
            <Text className="text-sm font-semibold text-white">
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const imageUrl = normalizeImageUrl(
    blog.featured_image_url
  );

  const content = cleanBlogContent(blog.content);

  /*
  |--------------------------------------------------------------------------
  | Blog Details
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      className={`flex-1 ${
        isDark ? "bg-[#0d0d0d]" : "bg-gray-50"
      }`}
    >
      <StatusBar
        barStyle={
          isDark ? "light-content" : "dark-content"
        }
        backgroundColor={screenBackground}
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <View
        className={`flex-row items-center border-b px-4 py-3 ${borderColor}`}
        style={{
          backgroundColor: headerBackground,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          className={`h-10 w-10 items-center justify-center rounded-full ${
            isDark
              ? "bg-[#202020] active:bg-[#303030]"
              : "bg-gray-100 active:bg-gray-200"
          }`}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={isDark ? "#ffffff" : "#111827"}
          />
        </Pressable>

        <Text
          className={`ml-3 text-base font-semibold ${primaryText}`}
        >
          Blog Details
        </Text>
      </View>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* =================================================
            FEATURED IMAGE
        ================================================== */}

        {imageUrl ? (
          <Image
            source={{
              uri: imageUrl,
            }}
            className="h-[230px] w-full"
            resizeMode="cover"
          />
        ) : (
          <View
            className={`h-[230px] w-full items-center justify-center ${
              isDark
                ? "bg-[#202020]"
                : "bg-gray-100"
            }`}
          >
            <Ionicons
              name="newspaper-outline"
              size={55}
              color={isDark ? "#666666" : "#9ca3af"}
            />

            <Text
              className={`mt-2 text-sm ${mutedText}`}
            >
              No image available
            </Text>
          </View>
        )}

        {/* =================================================
            ARTICLE
        ================================================== */}

        <View className="px-5 pt-5">
          {/* Designation */}

          <View className="self-start rounded-full bg-red-600/15 px-3 py-1.5">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-red-500">
              iMORRCS
            </Text>
          </View>

          {/* Title */}

          <Text
            className={`mt-3 text-[25px] font-bold leading-8 ${primaryText}`}
          >
            {blog.title}
          </Text>

          {/* =================================================
              AUTHOR / DATE / VIEWS
          ================================================== */}

          <View
            className={`mt-5 flex-row items-center border-b pb-4 ${sectionBorderColor}`}
          >
            {/* Author Icon */}

            <View
              className={`h-10 w-10 items-center justify-center rounded-full ${
                isDark
                  ? "bg-[#292929]"
                  : "bg-gray-100"
              }`}
            >
              <Ionicons
                name="person-outline"
                size={19}
                color={isDark ? "#aaaaaa" : "#6b7280"}
              />
            </View>

            {/* Author */}

            <View className="ml-3 flex-1">
              <Text
                className={`text-sm font-semibold ${authorText}`}
              >
                {blog.author_name || "iMORRCS"}
              </Text>

              <Text
                className={`mt-0.5 text-xs ${mutedText}`}
              >
                {formatDate(blog.created_at)}
              </Text>
            </View>

            {/* Views */}

            <View className="flex-row items-center">
              <Ionicons
                name="eye-outline"
                size={17}
                color={isDark ? "#777777" : "#6b7280"}
              />

              <Text
                className={`ml-1.5 text-xs ${mutedText}`}
              >
                {blog.view_count}
              </Text>
            </View>
          </View>

          {/* =================================================
              BLOG CONTENT
          ================================================== */}

          <View className="pt-5">
            {content.split("\n\n").map(
              (paragraph, index) => {
                const trimmedParagraph =
                  paragraph.trim();

                if (!trimmedParagraph) {
                  return null;
                }

                return (
                  <Text
                    key={`${blog.id}-paragraph-${index}`}
                    className={`mb-5 text-[15px] leading-7 ${bodyText}`}
                  >
                    {trimmedParagraph}
                  </Text>
                );
              }
            )}
          </View>

          {/* =================================================
              FOOTER
          ================================================== */}

          <View
            className={`mt-3 border-t pt-5 ${sectionBorderColor}`}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="newspaper-outline"
                size={18}
                color="#ef4444"
              />

              <Text
                className={`ml-2 text-xs ${mutedText}`}
              >
                Published by Real Estate Africa on{" "}
                {formatDate(blog.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}