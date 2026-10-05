
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
  return (
    <View className="min-h-[110px] items-center justify-center bg-[#292929] px-5 py-5">
      <Ionicons name={icon} size={32} color="#666666" />

      <Text className="mt-2 text-center text-sm text-gray-400">
        {text}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("Payment History");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0d0d0d"
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

        <View className="absolute left-0 right-0 top-0 z-10 h-[110px] bg-[#0d0d0d]" />

        {/* =====================================================
            SCROLLABLE CONTENT

            The content begins below the fixed header area.
        ====================================================== */}

        <ScrollView
          className="flex-1 bg-[#0d0d0d]"
          contentContainerClassName="px-4 pt-[110px] pb-[350px]"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
        >
          {/* =====================================================
              PROFILE
          ====================================================== */}

          <View className="mb-4 items-center rounded-xl border border-[#3d3d3d] bg-[#242424] p-6">
            <View className="mb-5 h-[190px] w-[190px] items-center justify-center overflow-hidden rounded-full bg-[#dedede]">
              <Ionicons
                name="person"
                size={110}
                color="#a6a6a6"
              />
            </View>

            <Text className="mb-2 text-center text-[25px] font-bold text-gray-100">
              Mhone Mhone
            </Text>

            <Text className="mb-2 text-center text-[17px] font-semibold text-red-500">
              +265888016923
            </Text>

            <Text className="mb-5 text-center text-[15px] text-gray-400">
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

          <View className="mb-4 rounded-xl border border-[#3d3d3d] bg-[#242424] p-5">
            <Text className="mb-2 text-center text-base text-gray-200">
              Active Subscription Plan
            </Text>

            <Text className="mb-2 text-center text-3xl font-bold text-gray-100">
              Free
            </Text>

            <Text className="mb-3 text-center text-base text-gray-200">
              No active subscription
            </Text>

            <Pressable className="mb-7 self-center rounded-lg bg-red-600 px-5 py-2.5 active:bg-red-700">
              <Text className="text-sm font-medium text-white">
                Subscribe
              </Text>
            </Pressable>

            <View className="items-center">
              <Text className="mb-1 text-center text-base text-gray-200">
                Three Subscriptions Available
              </Text>

              <Text className="text-center text-base font-bold text-gray-100">
                Rent a Property & Buy a Property
              </Text>
            </View>
          </View>

          {/* =====================================================
              UPDATE PASSWORD
          ====================================================== */}

          <View className="mb-4 rounded-xl border border-[#3d3d3d] bg-[#242424] p-5">
            <Text className="mb-5 text-center text-[21px] font-bold text-gray-100">
              Update Password
            </Text>

            <Text className="mb-1.5 text-sm text-gray-200">
              New Password
            </Text>

            <View className="mb-4 h-12 flex-row items-center rounded-md border border-[#526071]">
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                className="h-full flex-1 px-3 text-[15px] text-white"
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
                  color="#7c8797"
                />
              </Pressable>
            </View>

            <Text className="mb-1.5 text-sm text-gray-200">
              Confirm Password
            </Text>

            <View className="mb-4 h-12 flex-row items-center rounded-md border border-[#526071]">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                className="h-full flex-1 px-3 text-[15px] text-white"
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
                  color="#7c8797"
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

          <View className="mb-4 overflow-hidden rounded-xl border border-[#3d3d3d] bg-[#242424]">
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
                          : "text-gray-400"
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
                  <View className="h-[46px] flex-row items-center border-t border-gray-700 bg-[#151519]">
                    <Text className="w-[50px] pl-4 text-[13px] font-bold text-gray-300">
                      No
                    </Text>

                    <Text className="w-[145px] text-[13px] font-bold text-gray-300">
                      Transaction ID
                    </Text>

                    <Text className="w-[160px] text-[13px] font-bold text-gray-300">
                      Subscription Name
                    </Text>

                    <Text className="w-[120px] text-[13px] font-bold text-gray-300">
                      Amount (MK)
                    </Text>

                    <Text className="w-[150px] text-[13px] font-bold text-gray-300">
                      Date of Payment
                    </Text>
                  </View>

                  <View className="min-h-[110px] items-center justify-center bg-[#292929] px-5 py-5">
                    <Text className="text-center text-sm text-gray-400">
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
