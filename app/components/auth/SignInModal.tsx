import { useAuth } from "@/app/components/auth/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

interface SignInModalProps {
  visible: boolean;
  onClose: () => void;
  onSignIn?: (email: string, password: string) => void;
  onRegister?: () => void;
}

export default function SignInModal({
  visible,
  onClose,
  onSignIn,
  onRegister,
}: SignInModalProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setError("");
    }
  }, [visible]);

  const handleSignIn = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");

    const result = login(trimmedEmail, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    // Allow the parent component to know that sign in was successful.
    onSignIn?.(trimmedEmail, password);

    // Close the modal after successful login.
    onClose();
  };

  const handleRegister = () => {
    setError("");

    onClose();

    if (onRegister) {
      setTimeout(() => {
        onRegister();
      }, 250);

      return;
    }

    router.push("/register");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Dark background */}
        <Pressable className="absolute inset-0 bg-black/70" onPress={onClose} />

        {/* Bottom Sheet */}
        <View className="max-h-[90%] w-full rounded-t-3xl border-t border-[#292929] bg-[#111111]">
          {/* Drag Handle */}
          <View className="items-center pb-2 pt-3">
            <View className="h-1.5 w-12 rounded-full bg-[#3a3a3a]" />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 30,
            }}
          >
            <View className="px-6 pb-2 pt-3">
              {/* Header */}
              <View className="mb-6 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-white">Sign In</Text>

                  <Text className="mt-1 text-sm text-gray-400">
                    Sign in to view full property details.
                  </Text>
                </View>

                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close sign in"
                  className="ml-4 h-10 w-10 items-center justify-center rounded-full bg-[#222222] active:opacity-70"
                >
                  <Ionicons name="close" size={22} color="#ffffff" />
                </Pressable>
              </View>

              {/* Error Message */}
              {error ? (
                <View className="mb-5 flex-row items-center rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3">
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color="#ef4444"
                  />

                  <Text className="ml-2 flex-1 text-sm text-red-400">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Email */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-gray-300">
                  Email
                </Text>

                <View className="h-13 flex-row items-center rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                  <Ionicons name="mail-outline" size={20} color="#9ca3af" />

                  <TextInput
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#6b7280"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    className="ml-3 flex-1 py-3.5 text-[15px] text-white"
                  />
                </View>
              </View>

              {/* Password */}
              <View className="mb-5">
                <Text className="mb-2 text-sm font-semibold text-gray-300">
                  Password
                </Text>

                <View className="h-13 flex-row items-center rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9ca3af"
                  />

                  <TextInput
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="#6b7280"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSignIn}
                    className="ml-3 flex-1 py-3.5 text-[15px] text-white"
                  />

                  <Pressable
                    onPress={() => setShowPassword((previous) => !previous)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="ml-2 h-10 w-10 items-center justify-center active:opacity-70"
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={21}
                      color="#9ca3af"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Forgot Password */}
              <Pressable
                onPress={() => {
                  onClose();
                  router.push("/forgot-password");
                }}
                className="mb-5 self-end active:opacity-70"
              >
                <Text className="text-sm font-semibold text-red-500">
                  Forgot Password?
                </Text>
              </Pressable>

              {/* Sign In Button */}
              <Pressable
                onPress={handleSignIn}
                disabled={!email.trim() || !password}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                className={`h-13 items-center justify-center rounded-xl bg-red-600 active:opacity-70 ${
                  !email.trim() || !password ? "opacity-50" : ""
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons name="log-in-outline" size={20} color="#ffffff" />

                  <Text className="ml-2 text-[15px] font-bold text-white">
                    Sign In
                  </Text>
                </View>
              </Pressable>

              {/* Register */}
              <View className="mt-5 flex-row items-center justify-center">
                <Text className="text-sm text-gray-400">
                  Don't have an account?
                </Text>

                <Pressable
                  onPress={handleRegister}
                  className="ml-1.5 active:opacity-70"
                >
                  <Text className="text-sm font-bold text-red-500">
                    Register
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
