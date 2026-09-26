
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import BlogCard from "@/app/components/blogs/BlogCard";

import {
  getBlogs,
  type Blog,
} from "@/app/services/blogs/blogApi";

export default function BlogsScreen() {
  const router = useRouter();

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
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0d0d0d"
        />

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#ef4444"
          />

          <Text className="mt-4 text-sm text-gray-400">
            Loading blogs...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Screen
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0d0d0d"
      />

      {/* =====================================================
          FIXED HEADER
      ====================================================== */}

      <View className="px-5 pt-5">
        <Text className="text-2xl font-bold text-white">
          iMORRCS Blogs
        </Text>

        <Text className="mt-1.5 text-[13px] leading-5 text-gray-400">
          Real estate news, property insights, investment
          advice and useful information.
        </Text>
      </View>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error ? (
        <View className="mx-5 mt-5 rounded-xl border border-red-900 bg-[#291515] p-5">
          <View className="items-center">
            <Ionicons
              name="cloud-offline-outline"
              size={38}
              color="#ef4444"
            />

            <Text className="mt-3 text-center text-sm leading-5 text-gray-300">
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

          <Text className="ml-2 text-xs text-gray-400">
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
        <View className="mx-5 mt-4 items-center rounded-xl border border-[#383838] bg-[#202020] px-5 py-10">
          <Ionicons
            name="newspaper-outline"
            size={45}
            color="#666666"
          />

          <Text className="mt-3 text-base font-semibold text-gray-300">
            No iMORRCS Blogs Available
          </Text>

          <Text className="mt-2 text-center text-xs leading-5 text-gray-500">
            There are currently no published iMORRCS blogs
            available.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

