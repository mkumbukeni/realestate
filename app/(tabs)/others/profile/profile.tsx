
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
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

import { useAuth } from "@/app/components/auth/AuthContext";
import { updatePassword } from "@/app/services/auth/update-password";
import type { UpdatePasswordPayload } from "@/app/types/auth/update-password";

const tabs = [
  "Payment History",
  "Saved Listings",
  "Saved Agents",
  "Inquiry History",
];

type PasswordToast = {
  type: "success" | "error";
  message: string;
};

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
  const { user } = useAuth();
  const accountEmail =
    typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";

  const [activeTab, setActiveTab] = useState("Payment History");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordToast, setPasswordToast] = useState<PasswordToast | null>(null);
  const [confirmPasswordUpdateVisible, setConfirmPasswordUpdateVisible] =
    useState(false);

  useEffect(() => {
    if (!passwordToast) return;

    const timeout = setTimeout(() => setPasswordToast(null), 3800);
    return () => clearTimeout(timeout);
  }, [passwordToast]);

  const handleUpdatePassword = () => {
    setPasswordToast(null);

    if (!accountEmail) {
      setPasswordToast({
        type: "error",
        message: "We could not find the email for your signed-in account. Please sign in again.",
      });
      return;
    }

    if (!newPassword || !confirmPassword) {
      setPasswordToast({
        type: "error",
        message: "Please enter and confirm your new password.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordToast({
        type: "error",
        message: "Your new password must contain at least 8 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordToast({
        type: "error",
        message: "The passwords do not match.",
      });
      return;
    }

    // Show confirmation before submitting the password update request.
    setConfirmPasswordUpdateVisible(true);
  };

  const confirmUpdatePassword = async () => {
    if (passwordLoading) return;

    const payload: UpdatePasswordPayload = {
      email: accountEmail,
      password: newPassword,
      password_confirmation: confirmPassword,
    };

    try {
      setPasswordLoading(true);

      const result = await updatePassword(payload);

      setConfirmPasswordUpdateVisible(false);
      setNewPassword("");
      setConfirmPassword("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setPasswordToast({
        type: "success",
        message: result.message || "Your password has been updated successfully.",
      });
    } catch (error) {
      setConfirmPasswordUpdateVisible(false);

      setPasswordToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update your password. Please try again.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-[#0d0d0d]" : "bg-gray-50"}`}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0d0d0d" : "#f9fafb"}
      />

      {/* PASSWORD UPDATE CONFIRMATION MODAL */}
      <Modal
        visible={confirmPasswordUpdateVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!passwordLoading) {
            setConfirmPasswordUpdateVisible(false);
          }
        }}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close confirmation dialog"
            disabled={passwordLoading}
            onPress={() => setConfirmPasswordUpdateVisible(false)}
            className="absolute inset-0"
          />

          <View
            className={`w-full max-w-[420px] rounded-2xl border p-5 shadow-xl ${
              isDark
                ? "border-[#3d3d3d] bg-[#202020]"
                : "border-gray-200 bg-white"
            }`}
          >
            <View className="mb-4 h-12 w-12 items-center justify-center self-center rounded-full bg-red-600/10">
              <Ionicons
                name="lock-closed-outline"
                size={26}
                color="#ef4444"
              />
            </View>

            <Text
              className={`text-center text-xl font-bold ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Confirm Password Update
            </Text>

            <Text
              className={`mt-3 text-center text-sm leading-5 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to change your account password? You will
              need to use the new password the next time you sign in.
            </Text>

            <View className="mt-6 flex-row gap-3">
            <Pressable
  accessibilityRole="button"
  onPress={() => setConfirmPasswordUpdateVisible(false)}
  disabled={passwordLoading}
  className={`min-h-12 flex-1 items-center justify-center rounded-xl border px-3 ${
    isDark
      ? "border-[#525252] bg-[#2a2a2a]"
      : "border-gray-300 bg-gray-100"
  } ${
    passwordLoading ? "opacity-40" : ""
  }`}
>
  <Text
    className={`text-sm font-semibold ${
      isDark ? "text-gray-100" : "text-gray-700"
    }`}
  >
    Cancel
  </Text>
</Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={confirmUpdatePassword}
                disabled={passwordLoading}
                className={`min-h-12 flex-1 flex-row items-center justify-center rounded-xl px-3 ${
                  passwordLoading ? "bg-red-900" : "bg-red-600 active:bg-red-700"
                }`}
              >
                {passwordLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#ffffff"
                  />
                )}

                <Text className="ml-2 text-center text-sm font-semibold text-white">
                  {passwordLoading ? "Updating..." : "Yes, Update"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {passwordToast ? (
        <View
          accessibilityRole="alert"
          className={`absolute left-4 right-4 top-[112px] z-50 flex-row items-start rounded-xl border px-4 py-3 shadow-lg ${
            passwordToast.type === "success"
              ? isDark
                ? "border-green-800 bg-[#14251b]"
                : "border-green-200 bg-green-50"
              : isDark
                ? "border-red-900 bg-[#2b1717]"
                : "border-red-200 bg-red-50"
          }`}
        >
          <Ionicons
            name={passwordToast.type === "success" ? "checkmark-circle" : "alert-circle"}
            size={22}
            color={passwordToast.type === "success" ? "#22c55e" : "#ef4444"}
          />
          <Text
            className={`ml-3 flex-1 text-sm leading-5 ${
              isDark ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {passwordToast.message}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
            onPress={() => setPasswordToast(null)}
            className="ml-2 p-0.5"
          >
            <Ionicons name="close" size={18} color={isDark ? "#d1d5db" : "#4b5563"} />
          </Pressable>
        </View>
      ) : null}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
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
              className="mb-7 self-center rounded-lg bg-red-600 px-5 py-2.5 active:bg-red-700"
            >
              <Text className="text-sm font-medium text-white">Subscribe</Text>
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

          {/* UPDATE PASSWORD */}
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
                placeholder="Enter new password"
                placeholderTextColor={isDark ? "#7c8797" : "#9ca3af"}
                className={`h-full flex-1 px-3 text-[15px] ${
                  isDark ? "text-white" : "text-black"
                }`}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showNewPassword ? "Hide new password" : "Show new password"}
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="h-full w-12 items-center justify-center"
              >
                <Ionicons
                  name={showNewPassword ? "eye-outline" : "eye-off-outline"}
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
                placeholder="Confirm new password"
                placeholderTextColor={isDark ? "#7c8797" : "#9ca3af"}
                className={`h-full flex-1 px-3 text-[15px] ${
                  isDark ? "text-white" : "text-black"
                }`}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="h-full w-12 items-center justify-center"
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={isDark ? "#7c8797" : "#6b7280"}
                />
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Update account password"
              accessibilityState={{ disabled: passwordLoading }}
              onPress={handleUpdatePassword}
              disabled={passwordLoading}
              className={`h-[46px] flex-row items-center justify-center rounded-md ${
                passwordLoading ? "bg-red-900" : "bg-red-600 active:bg-red-700"
              }`}
            >
              {passwordLoading ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="ml-2 text-sm font-semibold text-white">
                    Updating Password...
                  </Text>
                </>
              ) : (
                <Text className="text-sm font-semibold text-white">
                  Update Password
                </Text>
              )}
            </Pressable>
          </View>

          {/* HISTORY */}
          <View
            className={`mb-0 overflow-hidden rounded-xl border ${
              isDark
                ? "border-[#3d3d3d] bg-[#242424]"
                : "border-gray-200 bg-white"
            }`}
          >
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

            {activeTab === "Saved Listings" && (
              <EmptyState icon="heart-outline" text="No saved listings available." />
            )}

            {activeTab === "Saved Agents" && (
              <EmptyState icon="people-outline" text="No saved agents available." />
            )}

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
