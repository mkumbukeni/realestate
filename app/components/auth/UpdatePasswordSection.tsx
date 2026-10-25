
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useAuth } from "@/app/components/auth/AuthContext";
import { updatePassword } from "@/app/services/auth/update-password";
import type { UpdatePasswordPayload } from "@/app/types/auth/update-password";

type PasswordToast = {
  type: "success" | "error";
  message: string;
};

export default function UpdatePasswordSection() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const { user } = useAuth();

  const accountEmail =
    typeof user?.email === "string"
      ? user.email.trim().toLowerCase()
      : "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [confirmPasswordUpdateVisible, setConfirmPasswordUpdateVisible] =
    useState(false);
  const [passwordToast, setPasswordToast] = useState<PasswordToast | null>(
    null,
  );

  useEffect(() => {
    if (!passwordToast) {
      return;
    }

    const timeout = setTimeout(() => {
      setPasswordToast(null);
    }, 3800);

    return () => clearTimeout(timeout);
  }, [passwordToast]);

  // Validate the form first, then ask the user to confirm before the API request.
  const requestPasswordUpdate = () => {
    setPasswordToast(null);

    if (!accountEmail) {
      setPasswordToast({
        type: "error",
        message:
          "We could not find the email for your signed-in account. Please sign in again.",
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

    setConfirmPasswordUpdateVisible(true);
  };

  // Called only after the user confirms in the confirmation modal.
  const submitPasswordUpdate = async () => {
    if (passwordLoading) {
      return;
    }

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
        message:
          result.message || "Your password has been updated successfully.",
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
    <>
      {/* UPDATE PASSWORD SECTION */}

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
            accessibilityLabel={
              showNewPassword ? "Hide new password" : "Show new password"
            }
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
            accessibilityLabel={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
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
          onPress={requestPasswordUpdate}
          disabled={passwordLoading}
          className={`h-[46px] flex-row items-center justify-center rounded-md ${
            passwordLoading
              ? "bg-red-900"
              : "bg-red-600 active:bg-red-700"
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
                onPress={submitPasswordUpdate}
                disabled={passwordLoading}
                className={`min-h-12 flex-1 flex-row items-center justify-center rounded-xl px-3 ${
                  passwordLoading
                    ? "bg-red-900"
                    : "bg-red-600 active:bg-red-700"
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

      {/* SUCCESS / ERROR NOTIFICATION */}

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
            name={
              passwordToast.type === "success"
                ? "checkmark-circle"
                : "alert-circle"
            }
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
            <Ionicons
              name="close"
              size={18}
              color={isDark ? "#d1d5db" : "#4b5563"}
            />
          </Pressable>
        </View>
      ) : null}
    </>
  );
}
