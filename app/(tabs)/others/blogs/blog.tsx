import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Pressable,
  RefreshControl,
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
import { useRouter } from "expo-router";

import BlogCard from "@/app/components/blogs/BlogCard";

import {
  getBlogs,
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
| Blog Card Skeleton
|--------------------------------------------------------------------------
*/

function BlogCardSkeleton({
  isDark,
}: {
  isDark: boolean;
}) {
  return (
    <View
      className={`mb-5 overflow-hidden rounded-xl border ${
        isDark
          ? "border-[#303030] bg-[#171717]"
          : "border-gray-200 bg-white"
      }`}
    >
      <FacebookShimmer
        isDark={isDark}
        style={{
          width: "100%",
          height: 190,
        }}
      />

      <View className="p-4">
        <FacebookShimmer
          isDark={isDark}
          style={{
            width: "85%",
            height: 19,
            borderRadius: 5,
          }}
        />

        <FacebookShimmer
          isDark={isDark}
          style={{
            width: "45%",
            height: 12,
            borderRadius: 4,
            marginTop: 12,
          }}
        />

        <FacebookShimmer
          isDark={isDark}
          style={{
            width: "100%",
            height: 12,
            borderRadius: 4,
            marginTop: 17,
          }}
        />

        <FacebookShimmer
          isDark={isDark}
          style={{
            width: "92%",
            height: 12,
            borderRadius: 4,
            marginTop: 8,
          }}
        />

        <FacebookShimmer
          isDark={isDark}
          style={{
            width: "65%",
            height: 12,
            borderRadius: 4,
            marginTop: 8,
          }}
        />

        <View className="mt-5 flex-row items-center justify-between">
          <FacebookShimmer
            isDark={isDark}
            style={{
              width: 85,
              height: 12,
              borderRadius: 4,
            }}
          />

          <FacebookShimmer
            isDark={isDark}
            style={{
              width: 65,
              height: 28,
              borderRadius: 7,
            }}
          />
        </View>
      </View>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| Blogs Loading Skeleton
|--------------------------------------------------------------------------
*/

function BlogsLoadingSkeleton({
  isDark,
}: {
  isDark: boolean;
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
        backgroundColor={
          isDark ? "#0d0d0d" : "#f8f9fa"
        }
      />

      <View className="px-5 pt-5">
        <FacebookShimmer
          isDark={isDark}
          style={{
            width: 190,
            height: 29,
            borderRadius: 5,
          }}
        />

        <FacebookShimmer
          isDark={isDark}
          style={{
            width: "95%",
            height: 12,
            borderRadius: 4,
            marginTop: 13,
          }}
        />

        <FacebookShimmer
          isDark={isDark}
          style={{
            width: "75%",
            height: 12,
            borderRadius: 4,
            marginTop: 7,
          }}
        />
      </View>

      <View className="mx-5 mb-2 mt-5 flex-row items-center">
        <FacebookShimmer
          isDark={isDark}
          style={{
            width: 17,
            height: 17,
            borderRadius: 4,
          }}
        />

        <FacebookShimmer
          isDark={isDark}
          style={{
            width: 115,
            height: 12,
            borderRadius: 4,
            marginLeft: 10,
          }}
        />
      </View>

      <FlatList
        data={[1, 2, 3]}
        keyExtractor={(item) => item.toString()}
        renderItem={() => (
          <BlogCardSkeleton isDark={isDark} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 5,
          paddingBottom: 25,
        }}
      />
    </SafeAreaView>
  );
}

export default function BlogsScreen() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Fetch Blogs
  |--------------------------------------------------------------------------
  */

  const fetchBlogs = useCallback(async () => {
    try {
      setError("");

      const data = await getBlogs();

      setBlogs(data);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);

      setError(
        "Unable to load blogs. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBlogs();
  };

  /*
  |--------------------------------------------------------------------------
  | Open Blog
  |--------------------------------------------------------------------------
  */

  const openBlog = (blog: Blog) => {
    router.push({
      pathname: "/others/blogs/[id]",
      params: {
        id: blog.id,
        slug: blog.slug,
      },
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Theme Colors
  |--------------------------------------------------------------------------
  */

  const screenBackground = isDark
    ? "#0d0d0d"
    : "#f8f9fa";

  const primaryText = isDark
    ? "text-white"
    : "text-black";

  const secondaryText = isDark
    ? "text-gray-400"
    : "text-gray-600";

  const iconSecondaryColor = isDark
    ? "#777777"
    : "#6b7280";

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <BlogsLoadingSkeleton isDark={isDark} />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Screen
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
          FIXED HEADER
      ====================================================== */}

      <View className="px-5 pt-5">
        <Text
          className={`text-2xl font-bold ${primaryText}`}
        >
          iMORRCS Blogs
        </Text>

        <Text
          className={`mt-1.5 text-[13px] leading-5 ${secondaryText}`}
        >
          Real estate news, property insights, investment
          advice and useful information.
        </Text>
      </View>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error ? (
        <View
          className={`mx-5 mt-5 rounded-xl border p-5 ${
            isDark
              ? "border-red-900 bg-[#291515]"
              : "border-red-200 bg-red-50"
          }`}
        >
          <View className="items-center">
            <Ionicons
              name="cloud-offline-outline"
              size={38}
              color="#ef4444"
            />

            <Text
              className={`mt-3 text-center text-sm leading-5 ${
                isDark
                  ? "text-gray-300"
                  : "text-gray-700"
              }`}
            >
              {error}
            </Text>

            <Pressable
              onPress={fetchBlogs}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 active:bg-red-700"
            >
              <Text className="text-sm font-semibold text-white">
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* =====================================================
          BLOG COUNT
      ====================================================== */}

      {!error && (
        <View className="mx-5 mb-2 mt-4 flex-row items-center">
          <Ionicons
            name="newspaper-outline"
            size={17}
            color="#ef4444"
          />

          <Text
            className={`ml-2 text-xs ${secondaryText}`}
          >
            {blogs.length}{" "}
            {blogs.length === 1 ? "blog" : "blogs"} available
          </Text>
        </View>
      )}

      {/* =====================================================
          BLOG LIST

          ONLY THIS SECTION SCROLLS
      ====================================================== */}

      {!error && blogs.length > 0 && (
        <FlatList
          data={blogs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BlogCard
              blog={item}
              onPress={() => openBlog(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 5,
            paddingBottom: 25,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#ef4444"
              colors={["#ef4444"]}
            />
          }
        />
      )}

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}

      {!error && blogs.length === 0 && (
        <View
          className={`mx-5 mt-4 items-center rounded-xl border px-5 py-10 ${
            isDark
              ? "border-[#383838] bg-[#202020]"
              : "border-gray-200 bg-white"
          }`}
        >
          <Ionicons
            name="newspaper-outline"
            size={45}
            color={iconSecondaryColor}
          />

          <Text
            className={`mt-3 text-base font-semibold ${
              isDark
                ? "text-gray-300"
                : "text-gray-800"
            }`}
          >
            No iMORRCS Blogs Available
          </Text>

          <Text
            className={`mt-2 text-center text-xs leading-5 ${
              isDark
                ? "text-gray-500"
                : "text-gray-500"
            }`}
          >
            There are currently no published iMORRCS blogs
            available.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}