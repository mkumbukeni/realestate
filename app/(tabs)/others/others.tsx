// app/(tabs)/more.tsx

import React from "react";
import {
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

type MenuItem = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    title: "Blogs",
    description: "Read the latest real estate news, guides and insights.",
    icon: "newspaper-outline",
    route: "others/blogs/blog",
  },
  {
    title: "About",
    description: "Learn more about our real estate platform.",
    icon: "information-circle-outline",
    route: "others/about",
  },
  {
    title: "Privacy Policy",
    description: "Learn how we collect, use and protect your information.",
    icon: "shield-checkmark-outline",
    route: "/policy",
  },
  {
    title: "FAQs",
    description: "Find answers to frequently asked questions.",
    icon: "help-circle-outline",
    route: "/questions",
  },
  {
    title: "Services",
    description: "Explore the real estate services we provide.",
    icon: "business-outline",
    route: "/services",
  },
  {
    title: "Support",
    description: "Get help or contact our support team.",
    icon: "headset-outline",
    route: "/support",
  },
  {
    title: "Terms & Conditions",
    description: "Read the terms and conditions for using our platform.",
    icon: "document-text-outline",
    route: "/terms",
  },
];

export default function MoreScreen() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const handlePress = (item: MenuItem) => {
    router.push(item.route as never);
  };

  return (
    <SafeAreaView
      className={`flex-1 ${
        isDark ? "bg-[#0d0d0d]" : "bg-gray-50"
      }`}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0d0d0d" : "#f9fafb"}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View className="mb-6 pt-4">
          <Text
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            More
          </Text>

          <Text
            className={`mt-2 text-[15px] leading-6 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Explore our resources, services and information.
          </Text>
        </View>

        {/* Menu Cards */}

        <View>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => handlePress(item)}
              className={`mb-4 flex-row items-center rounded-2xl border p-5 ${
                isDark
                  ? "border-[#383838] bg-[#202020] active:bg-[#292929]"
                  : "border-gray-200 bg-white active:bg-gray-100"
              }`}
            >
              {/* Icon */}

              <View className="h-14 w-14 items-center justify-center rounded-xl bg-red-600/15">
                <Ionicons
                  name={item.icon}
                  size={28}
                  color="#ef4444"
                />
              </View>

              {/* Text */}

              <View className="ml-4 flex-1">
                <Text
                  className={`text-[18px] font-bold ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  {item.title}
                </Text>

                <Text
                  numberOfLines={2}
                  className={`mt-1 text-[13px] leading-5 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {item.description}
                </Text>
              </View>

              {/* Arrow */}

              <View className="ml-3">
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={isDark ? "#888888" : "#666666"}
                />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}