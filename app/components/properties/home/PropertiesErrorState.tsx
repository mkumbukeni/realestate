import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  isDark: boolean;
  screenTitle: string;
  error: string;
  refreshing: boolean;
  onRefresh: () => void;
};

export default function PropertiesErrorState({
  isDark,
  screenTitle,
  error,
  refreshing,
  onRefresh,
}: Props) {
  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#0d0d0d]" : "bg-white"}`}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0d0d0d" : "#ffffff"}
      />

      <View
        className={`border-b px-5 pb-3.5 pt-2.5 ${
          isDark ? "border-[#222]" : "border-gray-200"
        }`}
      >
        <Text
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          {screenTitle}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ef4444"
            colors={["#ef4444"]}
          />
        }
      >
        <View
          className={`items-center rounded-2xl border px-5 py-10 ${
            isDark
              ? "border-[#292929] bg-[#171717]"
              : "border-gray-200 bg-white"
          }`}
          style={
            isDark
              ? undefined
              : {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 5,
                  elevation: 3,
                }
          }
        >
          <Ionicons
            name="cloud-offline-outline"
            size={50}
            color={isDark ? "#555" : "#9ca3af"}
          />

          <Text
            className={`mt-4 text-center text-lg font-semibold ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            Unable to load properties
          </Text>

          <Text
            className={`mt-2 text-center text-sm leading-5 ${
              isDark ? "text-gray-500" : "text-gray-600"
            }`}
          >
            {error}
          </Text>

          <Pressable
            onPress={onRefresh}
            className="mt-6 rounded-xl bg-red-600 px-6 py-3.5 active:bg-red-700"
          >
            <Text className="font-bold text-white">
              Try Again
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}