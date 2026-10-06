import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const [activeTab, setActiveTab] = useState("Payment History");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* =====================================================
            FIXED HEADER AREA

            This area is NOT scrollable.

            The global buttons from _layout.tsx are positioned
            around top-14, so we reserve this space for them.
        ====================================================== */}

        <View
          className={`absolute left-0 right-0 top-0 z-10 h-[110px] ${
            isDark ? "bg-[#0d0d0d]" : "bg-gray-50"
          }`}
        />

        {/* =====================================================
            SCROLLABLE CONTENT
        ====================================================== */}

        <ScrollView
          className={`flex-1 ${
            isDark ? "bg-[#0d0d0d]" : "bg-gray-50"
          }`}
          contentContainerClassName="px-4 pt-[110px] pb-[350px]"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
        >
          {/* =====================================================
              PROFILE
          ====================================================== */}

          <View
            className={`mb-4 items-center rounded-xl border p-6 ${
              isDark
                ? "border-[#3d3d3d] bg-[#242424]"
                : "border-gray-200 bg-white"
            }`}
          >
            <View className="mb-5 h-[190px] w-[190px] items-center justify-center overflow-hidden rounded-full bg-[#dedede]">
              <Ionicons
                name="person"
                size={110}
                color="#a6a6a6"
              />
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
              mkumbukenimhone@gmail.com
            </Text>

            <Pressable className="rounded-lg bg-red-600 px-6 py-3 active:bg-red-700">
              <Text className="text-sm font-medium text-white">
                Update
              </Text>
            </Pressable>
          </View>

          {/* =====================================================
              SUBSCRIPTION
          ====================================================== */}

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

            <Pressable className="mb-7 self-center rounded-lg bg-red-600 px-5 py-2.5 active:bg-red-700">
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

          {/* =====================================================
              UPDATE PASSWORD
          ====================================================== */}

          <View
            className={`mb-4 rounded-xl border p-5 ${
              isDark
                ? "border-[#3d3d3d] bg-[#242424]"
                : "border-gray-200 bg-white"
            }`}
          >
            <Text
              className={`mb-5 text-center text-[21px] font-bold ${
                isDark ? "text-gray-100" : "text-black"
              }`}
            >
              Update Password
            </Text>

            <Text
              className={`mb-1.5 text-sm ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              New Password
            </Text>

            <View
              className={`mb-4 h-12 flex-row items-center rounded-md border ${
                isDark
                  ? "border-[#526071] bg-[#242424]"
                  : "border-gray-300 bg-white"
              }`}
            >
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                placeholderTextColor={
                  isDark ? "#7c8797" : "#9ca3af"
                }
                className={`h-full flex-1 px-3 text-[15px] ${
                  isDark ? "text-white" : "text-black"
                }`}
              />

              <Pressable
                onPress={() =>
                  setShowNewPassword(!showNewPassword)
                }
                className="h-full w-12 items-center justify-center"
              >
                <Ionicons
                  name={
                    showNewPassword
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={20}
                  color={isDark ? "#7c8797" : "#6b7280"}
                />
              </Pressable>
            </View>

            <Text
              className={`mb-1.5 text-sm ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Confirm Password
            </Text>

            <View
              className={`mb-4 h-12 flex-row items-center rounded-md border ${
                isDark
                  ? "border-[#526071] bg-[#242424]"
                  : "border-gray-300 bg-white"
              }`}
            >
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                placeholderTextColor={
                  isDark ? "#7c8797" : "#9ca3af"
                }
                className={`h-full flex-1 px-3 text-[15px] ${
                  isDark ? "text-white" : "text-black"
                }`}
              />

              <Pressable
                onPress={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="h-full w-12 items-center justify-center"
              >
                <Ionicons
                  name={
                    showConfirmPassword
                      ? "eye-outline"
                      : "eye-off-outline"
                  }
                  size={20}
                  color={isDark ? "#7c8797" : "#6b7280"}
                />
              </Pressable>
            </View>

            <Pressable
              className={`h-[42px] items-center justify-center rounded-md ${
                newPassword && confirmPassword
                  ? "bg-red-700"
                  : "bg-red-900"
              }`}
            >
              <Text className="text-sm font-medium text-white">
                Update Password
              </Text>
            </Pressable>
          </View>

          {/* =====================================================
              HISTORY
          ====================================================== */}

          <View
            className={`mb-4 overflow-hidden rounded-xl border ${
              isDark
                ? "border-[#3d3d3d] bg-[#242424]"
                : "border-gray-200 bg-white"
            }`}
          >
            <ScrollView
              horizontal
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
                    className={`min-h-[54px] justify-center border-b-2 px-[17px] ${
                      active
                        ? "border-red-500"
                        : "border-transparent"
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

            {/* Payment History */}

            {activeTab === "Payment History" && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
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
                        isDark
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      No
                    </Text>

                    <Text
                      className={`w-[145px] text-[13px] font-bold ${
                        isDark
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      Transaction ID
                    </Text>

                    <Text
                      className={`w-[160px] text-[13px] font-bold ${
                        isDark
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      Subscription Name
                    </Text>

                    <Text
                      className={`w-[120px] text-[13px] font-bold ${
                        isDark
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      Amount (MK)
                    </Text>

                    <Text
                      className={`w-[150px] text-[13px] font-bold ${
                        isDark
                          ? "text-gray-300"
                          : "text-gray-700"
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
                        isDark
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      No payment history available.
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Saved Listings */}

            {activeTab === "Saved Listings" && (
              <EmptyState
                icon="heart-outline"
                text="No saved listings available."
              />
            )}

            {/* Saved Agents */}

            {activeTab === "Saved Agents" && (
              <EmptyState
                icon="people-outline"
                text="No saved agents available."
              />
            )}

            {/* Inquiry History */}

            {activeTab === "Inquiry History" && (
              <EmptyState
                icon="chatbubble-ellipses-outline"
                text="No inquiry history available."
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}