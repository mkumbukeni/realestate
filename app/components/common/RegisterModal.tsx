
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
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/app/components/common/AuthContext";

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onRegister?: (
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    confirmPassword: string
  ) => void;
  onSignIn?: () => void;
}

export default function RegisterModal({
  visible,
  onClose,
  onRegister,
  onSignIn,
}: RegisterModalProps) {
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) {
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError("");
    }
  }, [visible]);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    passwordsMatch;

  const handleRegister = () => {
    if (!isFormValid) {
      setError(
        "Please complete all fields and make sure the passwords match."
      );
      return;
    }

    setError("");

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhoneNumber = phoneNumber.trim();

    const result = register(
      trimmedFullName,
      trimmedEmail,
      trimmedPhoneNumber,
      password,
      confirmPassword
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    onRegister?.(
      trimmedFullName,
      trimmedEmail,
      trimmedPhoneNumber,
      password,
      confirmPassword
    );

    // Registration automatically signs the user in.
    onClose();
  };

  const handleSignIn = () => {
    setError("");

    onClose();

    if (onSignIn) {
      setTimeout(() => {
        onSignIn();
      }, 250);
    }
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
        {/* BACKDROP */}
        <Pressable
          className="absolute inset-0 bg-black/70"
          onPress={onClose}
        />

        {/* BOTTOM SHEET */}
        <View className="max-h-[92%] w-full rounded-t-3xl border-t border-[#292929] bg-[#111111]">
          {/* DRAG HANDLE */}
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
              {/* HEADER */}
              <View className="mb-5 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-white">
                    Create Account
                  </Text>

                  <Text className="mt-1 text-sm text-gray-400">
                    Create your iMORRCS account.
                  </Text>
                </View>

                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close register"
                  className="ml-4 h-10 w-10 items-center justify-center rounded-full bg-[#222222] active:opacity-70"
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color="#ffffff"
                  />
                </Pressable>
              </View>

              {/* ERROR */}
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

              {/* ACCOUNT ICON */}
              <View className="mb-5 items-center">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-red-950/50">
                  <Ionicons
                    name="person-add-outline"
                    size={30}
                    color="#ef4444"
                  />
                </View>
              </View>

              {/* FULL NAME */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-gray-300">
                  Full Name
                </Text>

                <View className="flex-row items-center rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#9ca3af"
                  />

                  <TextInput
                    value={fullName}
                    onChangeText={(value) => {
                      setFullName(value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                    className="ml-3 flex-1 py-4 text-[15px] text-white"
                  />
                </View>
              </View>

              {/* EMAIL */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-gray-300">
                  Email
                </Text>

                <View className="flex-row items-center rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#9ca3af"
                  />

                  <TextInput
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#6b7280"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    className="ml-3 flex-1 py-4 text-[15px] text-white"
                  />
                </View>
              </View>

              {/* PHONE NUMBER */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-gray-300">
                  Phone Number
                </Text>

                <View className="flex-row items-center rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#9ca3af"
                  />

                  <TextInput
                    value={phoneNumber}
                    onChangeText={(value) => {
                      setPhoneNumber(value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#6b7280"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    className="ml-3 flex-1 py-4 text-[15px] text-white"
                  />
                </View>
              </View>

              {/* PASSWORD */}
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-gray-300">
                  Password
                </Text>

                <View className="flex-row items-center rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#9ca3af"
                  />

                  <TextInput
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="#6b7280"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    className="ml-3 flex-1 py-4 text-[15px] text-white"
                  />

                  <Pressable
                    onPress={() =>
                      setShowPassword((previous) => !previous)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="ml-2 h-10 w-10 items-center justify-center active:opacity-70"
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={21}
                      color="#9ca3af"
                    />
                  </Pressable>
                </View>
              </View>

              {/* CONFIRM PASSWORD */}
              <View className="mb-2">
                <Text className="mb-2 text-sm font-semibold text-gray-300">
                  Confirm Password
                </Text>

                <View
                  className={`flex-row items-center rounded-xl border bg-[#1b1b1b] px-4 ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-green-600"
                        : "border-red-600"
                      : "border-[#303030]"
                  }`}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#9ca3af"
                  />

                  <TextInput
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      if (error) setError("");
                    }}
                    placeholder="Confirm your password"
                    placeholderTextColor="#6b7280"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                    className="ml-3 flex-1 py-4 text-[15px] text-white"
                  />

                  <Pressable
                    onPress={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="ml-2 h-10 w-10 items-center justify-center active:opacity-70"
                  >
                    <Ionicons
                      name={
                        showConfirmPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={21}
                      color="#9ca3af"
                    />
                  </Pressable>
                </View>
              </View>

              {/* PASSWORD STATUS */}
              {confirmPassword.length > 0 && (
                <View className="mb-4 mt-2 flex-row items-center">
                  <Ionicons
                    name={
                      passwordsMatch
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={16}
                    color={
                      passwordsMatch
                        ? "#22c55e"
                        : "#ef4444"
                    }
                  />

                  <Text
                    className={`ml-1.5 text-xs font-medium ${
                      passwordsMatch
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </Text>
                </View>
              )}

              {/* REGISTER BUTTON */}
              <Pressable
                onPress={handleRegister}
                disabled={!isFormValid}
                accessibilityRole="button"
                accessibilityLabel="Create account"
                className={`mt-2 h-13 items-center justify-center rounded-xl bg-red-600 active:opacity-70 ${
                  !isFormValid ? "opacity-50" : ""
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color="#ffffff"
                  />

                  <Text className="ml-2 text-[15px] font-bold text-white">
                    Create Account
                  </Text>
                </View>
              </Pressable>

              {/* SIGN IN */}
              <View className="mt-5 flex-row items-center justify-center">
                <Text className="text-sm text-gray-400">
                  Already have an account?
                </Text>

                <Pressable
                  onPress={handleSignIn}
                  className="ml-1.5 active:opacity-70"
                >
                  <Text className="text-sm font-bold text-red-500">
                    Sign In
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

