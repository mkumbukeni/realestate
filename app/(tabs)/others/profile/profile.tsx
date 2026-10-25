
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import { useAuth } from "@/app/components/auth/AuthContext";
import UpdatePasswordSection from "@/app/components/auth/UpdatePasswordSection";
import ProfileHistorySection from "@/app/components/profileHistory/ProfileHistorySection";

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const { user } = useAuth();

  const accountEmail =
    typeof user?.email === "string"
      ? user.email.trim().toLowerCase()
      : "";

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#0d0d0d]" : "bg-gray-50"}`}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0d0d0d" : "#f9fafb"}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Reserve space for the global header without adding extra scroll height. */}

        <View
          className={`absolute left-0 right-0 top-0 z-10 h-[110px] ${
            isDark ? "bg-[#0d0d0d]" : "bg-gray-50"
          }`}
          pointerEvents="none"
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pt-[110px] pb-6"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          contentInsetAdjustmentBehavior="never"
          overScrollMode="never"
        >
          {/* PROFILE */}

          <View
            className={`mb-4 items-center rounded-xl border p-6 ${
              isDark
                ? "border-[#3d3d3d] bg-[#242424]"
                : "border-gray-200 bg-white"
            }`}
          >
            <View className="mb-5 h-[190px] w-[190px] items-center justify-center overflow-hidden rounded-full bg-[#dedede]">
              <Ionicons name="person" size={110} color="#a6a6a6" />
            </View>

            <Text
              className={`mb-2 text-center text-[25px] font-bold ${
                isDark ? "text-gray-100" : "text-black"
              }`}
            >
              Mhone Mhone
            </Text>

            <Text className="mb-2 text-center text-[17px] font-semibold text-red-500">
              +265888016923
            </Text>

            <Text
              className={`mb-5 text-center text-[15px] ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {accountEmail || "Email unavailable"}
            </Text>

            <Pressable
              accessibilityRole="button"
              className="rounded-lg bg-red-600 px-6 py-3 active:bg-red-700"
            >
              <Text className="text-sm font-medium text-white">Update</Text>
            </Pressable>
          </View>

          {/* SUBSCRIPTION */}

          <View
            className={`mb-4 rounded-xl border p-5 ${
              isDark
                ? "border-[#3d3d3d] bg-[#242424]"
                : "border-gray-200 bg-white"
            }`}
          >
            <Text
              className={`mb-2 text-center text-base ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Active Subscription Plan
            </Text>

            <Text
              className={`mb-2 text-center text-3xl font-bold ${
                isDark ? "text-gray-100" : "text-black"
              }`}
            >
              Free
            </Text>

            <Text
              className={`mb-3 text-center text-base ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              No active subscription
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/payments")}
              className="mb-7 self-center rounded-lg bg-red-600 px-5 py-2.5 active:bg-red-700"
            >
              <Text className="text-sm font-medium text-white">
                Subscribe
              </Text>
            </Pressable>

            <View className="items-center">
              <Text
                className={`mb-1 text-center text-base ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Three Subscriptions Available
              </Text>

              <Text
                className={`text-center text-base font-bold ${
                  isDark ? "text-gray-100" : "text-black"
                }`}
              >
                Rent a Property & Buy a Property
              </Text>
            </View>
          </View>

          {/* UPDATE PASSWORD - SEPARATE COMPONENT */}

          <UpdatePasswordSection />

          {/* HISTORY - SEPARATE COMPONENT */}

          <ProfileHistorySection />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
