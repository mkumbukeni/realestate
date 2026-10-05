
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useAuth } from "./AuthContext";

interface LoginModalProps {
  visible: boolean;
  onLogin?: (
    email: string,
    response: Record<string, unknown>,
  ) => void;
  onRegister?: () => void;
  onForgotPassword?: () => void;
  onClose: () => void;
}

export default function LoginModal({
  visible,
  onLogin,
  onRegister,
  onForgotPassword,
  onClose,
}: LoginModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loginSuccessful, setLoginSuccessful] = useState(false);

  const resetMessages = () => {
    setError("");
    setSuccessMessage("");
    setLoginSuccessful(false);
  };

  const handleLogin = async () => {
    resetMessages();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(trimmedEmail, password);

      if (!result.success) {
        setLoginSuccessful(false);
        setError(result.message || "Unable to sign in. Please try again.");
        return;
      }

      setLoginSuccessful(true);
      setSuccessMessage(
        result.message || "You have logged in successfully.",
      );

      /*
       * AuthContext has now:
       * 1. Saved the JWT securely.
       * 2. Updated isLoggedIn globally.
       * 3. Stored the authenticated user.
       *
       * The optional callback allows the parent screen to perform
       * additional actions after successful authentication.
       */
      onLogin?.(trimmedEmail, {
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Login modal error:", error);

      setLoginSuccessful(false);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    resetMessages();
    setEmail("");
    setPassword("");
    setShowPassword(false);

    onClose();
  };

  const handleRegister = () => {
    if (loading) {
      return;
    }

    resetMessages();
    onRegister?.();
  };

  const handleForgotPassword = () => {
    if (loading) {
      return;
    }

    resetMessages();
    onForgotPassword?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          className={`flex-1 justify-center px-5 ${
            isDark ? "bg-black/70" : "bg-black/50"
          }`}
        >
          <View
            className={`max-h-[90%] overflow-hidden rounded-2xl border ${
              isDark
                ? "border-[#2a2a2a] bg-[#111111]"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Header */}
            <View
              className={`flex-row items-center justify-between border-b px-5 py-4 ${
                isDark ? "border-[#2a2a2a]" : "border-gray-200"
              }`}
            >
              <View className="flex-1">
                <Text
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Welcome Back
                </Text>

                <Text
                  className={`mt-1 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Sign in to continue
                </Text>
              </View>

              <Pressable
                onPress={handleClose}
                disabled={loading}
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  isDark ? "bg-[#1d1d1d]" : "bg-gray-100"
                }`}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? "#d1d5db" : "#4b5563"}
                />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 24,
              }}
            >
              <View className="px-5 pt-5">
                {/* Success message */}
                {loginSuccessful && successMessage ? (
                  <View
                    className={`mb-4 rounded-xl border px-4 py-3 ${
                      isDark
                        ? "border-green-900 bg-green-950/40"
                        : "border-green-200 bg-green-50"
                    }`}
                  >
                    <View className="flex-row items-start">
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#22c55e"
                      />

                      <Text
                        className={`ml-2 flex-1 text-sm ${
                          isDark ? "text-green-400" : "text-green-700"
                        }`}
                      >
                        {successMessage}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* Error message */}
                {error ? (
                  <View
                    className={`mb-4 rounded-xl border px-4 py-3 ${
                      isDark
                        ? "border-red-900 bg-red-950/40"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <View className="flex-row items-start">
                      <Ionicons
                        name="alert-circle"
                        size={20}
                        color="#ef4444"
                      />

                      <Text
                        className={`ml-2 flex-1 text-sm ${
                          isDark ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        {error}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* Email */}
                <View className="mb-4">
                  <Text
                    className={`mb-2 text-sm font-medium ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Email Address
                  </Text>

                  <View
                    className={`flex-row items-center rounded-xl border px-4 ${
                      isDark
                        ? "border-[#303030] bg-[#1b1b1b]"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />

                    <TextInput
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        if (error) setError("");
                      }}
                      placeholder="Enter your email"
                      placeholderTextColor={
                        isDark ? "#6b7280" : "#9ca3af"
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      className={`ml-3 flex-1 py-3.5 text-base ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    />
                  </View>
                </View>

                {/* Password */}
                <View className="mb-3">
                  <Text
                    className={`mb-2 text-sm font-medium ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Password
                  </Text>

                  <View
                    className={`flex-row items-center rounded-xl border px-4 ${
                      isDark
                        ? "border-[#303030] bg-[#1b1b1b]"
                        : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />

                    <TextInput
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        if (error) setError("");
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor={
                        isDark ? "#6b7280" : "#9ca3af"
                      }
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      className={`ml-3 flex-1 py-3.5 text-base ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    />

                    <Pressable
                      onPress={() => setShowPassword((previous) => !previous)}
                      disabled={loading}
                      className="ml-2 p-1"
                    >
                      <Ionicons
                        name={
                          showPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={21}
                        color={isDark ? "#9ca3af" : "#6b7280"}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Forgot password */}
                <View className="mb-5 items-end">
                  <Pressable
                    onPress={handleForgotPassword}
                    disabled={loading}
                  >
                    <Text className="text-sm font-semibold text-red-500">
                      Forgot Password?
                    </Text>
                  </Pressable>
                </View>

                {/* Login button */}
                <Pressable
                  onPress={handleLogin}
                  disabled={loading}
                  className={`items-center justify-center rounded-xl py-3.5 ${
                    loading ? "bg-red-800" : "bg-red-600"
                  }`}
                >
                  {loading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator
                        size="small"
                        color="#ffffff"
                      />

                      <Text className="ml-2 text-base font-bold text-white">
                        Signing In...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-base font-bold text-white">
                      Sign In
                    </Text>
                  )}
                </Pressable>

                {/* Register */}
                <View className="mt-5 flex-row items-center justify-center">
                  <Text
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Don't have an account?
                  </Text>

                  <Pressable
                    onPress={handleRegister}
                    disabled={loading}
                    className="ml-1"
                  >
                    <Text className="text-sm font-bold text-red-500">
                      Register
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

