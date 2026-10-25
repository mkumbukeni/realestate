
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const tabs = [
  "Payment History",
  "Saved Listings",
  "Saved Agents",
  "Inquiry History",
];

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

function EmptyState({ icon, text }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  return (
    <View
      className={`min-h-[110px] items-center justify-center px-5 py-5 ${
        isDark ? "bg-[#292929]" : "bg-gray-100"
      }`}
    >
      <Ionicons
        name={icon}
        size={32}
        color={isDark ? "#666666" : "#9ca3af"}
      />

      <Text
        className={`mt-2 text-center text-sm ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {text}
      </Text>
    </View>
  );
}

export default function ProfileHistorySection() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";
  const [activeTab, setActiveTab] = useState("Payment History");

  return (
    <View
      className={`mb-0 overflow-hidden rounded-xl border ${
        isDark
          ? "border-[#3d3d3d] bg-[#242424]"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* HISTORY TABS */}

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-1"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab;

          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              className={`min-h-[54px] justify-center border-b-2 px-[17px] ${
                active ? "border-red-500" : "border-transparent"
              }`}
            >
              <Text
                className={`text-center text-sm ${
                  active
                    ? "text-red-500"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* PAYMENT HISTORY */}

      {activeTab === "Payment History" && (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          <View className="min-w-[650px]">
            <View
              className={`h-[46px] flex-row items-center border-t ${
                isDark
                  ? "border-gray-700 bg-[#151519]"
                  : "border-gray-200 bg-gray-100"
              }`}
            >
              <Text
                className={`w-[50px] pl-4 text-[13px] font-bold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                No
              </Text>

              <Text
                className={`w-[145px] text-[13px] font-bold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Transaction ID
              </Text>

              <Text
                className={`w-[160px] text-[13px] font-bold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Subscription Name
              </Text>

              <Text
                className={`w-[120px] text-[13px] font-bold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Amount (MK)
              </Text>

              <Text
                className={`w-[150px] text-[13px] font-bold ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Date of Payment
              </Text>
            </View>

            <View
              className={`min-h-[110px] items-center justify-center px-5 py-5 ${
                isDark ? "bg-[#292929]" : "bg-gray-50"
              }`}
            >
              <Text
                className={`text-center text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No payment history available.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* SAVED LISTINGS */}

      {activeTab === "Saved Listings" && (
        <EmptyState
          icon="heart-outline"
          text="No saved listings available."
        />
      )}

      {/* SAVED AGENTS */}

      {activeTab === "Saved Agents" && (
        <EmptyState
          icon="people-outline"
          text="No saved agents available."
        />
      )}

      {/* INQUIRY HISTORY */}

      {activeTab === "Inquiry History" && (
        <EmptyState
          icon="chatbubble-ellipses-outline"
          text="No inquiry history available."
        />
      )}
    </View>
  );
}
