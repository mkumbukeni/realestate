import React from "react";
import {
  ActivityIndicator,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  isDark: boolean;
  screenTitle: string;
};

export default function PropertiesLoadingState({
  isDark,
  screenTitle,
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

      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#ef4444" />
        <Text
          className={`mt-4 text-sm ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Loading properties...
        </Text>
      </View>
    </SafeAreaView>
  );
}