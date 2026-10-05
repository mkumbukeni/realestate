
import React from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useTheme } from "@/app/components/theme/ThemeContext";

interface AuthRequiredModalProps {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export default function AuthRequiredModal({
  visible,
  onClose,
  onLogin,
  onRegister,
}: AuthRequiredModalProps) {
  const { isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className={`flex-1 items-center justify-center px-6 ${
          isDark
            ? "bg-black/70"
            : "bg-black/50"
        }`}
      >
        <View
          className={`w-full max-w-md rounded-3xl border p-6 ${
            isDark
              ? "border-[#292929] bg-[#171717]"
              : "border-gray-200 bg-white"
          }`}
          style={
            isDark
              ? undefined
              : {
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 8,
                }
          }
        >
          {/* CLOSE BUTTON */}

          <View className="items-end">
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className={`h-9 w-9 items-center justify-center rounded-full ${
                isDark
                  ? "bg-[#222]"
                  : "bg-gray-100"
              }`}
            >
              <Ionicons
                name="close"
                size={21}
                color={
                  isDark
                    ? "#d4d4d4"
                    : "#525252"
                }
              />
            </Pressable>
          </View>

          {/* ICON */}

          <View className="mt-1 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-red-600">
              <Ionicons
                name="lock-closed-outline"
                size={30}
                color="#fff"
              />
            </View>
          </View>

          {/* TITLE */}

          <Text
            className={`mt-5 text-center text-xl font-bold ${
              isDark
                ? "text-white"
                : "text-black"
            }`}
          >
            Sign in to view property details
          </Text>

          {/* DESCRIPTION */}

          <Text
            className={`mt-3 text-center text-sm leading-6 ${
              isDark
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          >
            Please sign in or create an account
            to view the full details of this
            property.
          </Text>

          {/* SIGN IN */}

          <Pressable
            onPress={onLogin}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            className="mt-6 w-full flex-row items-center justify-center rounded-xl bg-red-600 px-5 py-4 active:bg-red-700"
          >
            <Ionicons
              name="log-in-outline"
              size={21}
              color="#fff"
            />

            <Text className="ml-2 text-base font-bold text-white">
              Sign In
            </Text>
          </Pressable>

          {/* REGISTER */}

          <Pressable
            onPress={onRegister}
            accessibilityRole="button"
            accessibilityLabel="Register"
            className={`mt-3 w-full flex-row items-center justify-center rounded-xl border px-5 py-4 ${
              isDark
                ? "border-[#3a3a3a] bg-[#222]"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <Ionicons
              name="person-add-outline"
              size={21}
              color="#ef4444"
            />

            <Text
              className={`ml-2 text-base font-bold ${
                isDark
                  ? "text-white"
                  : "text-gray-800"
              }`}
            >
              Register
            </Text>
          </Pressable>

          {/* CANCEL */}

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            className="mt-4 items-center py-2"
          >
            <Text
              className={`text-sm font-medium ${
                isDark
                  ? "text-gray-500"
                  : "text-gray-600"
              }`}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

