
import Ionicons from "@expo/vector-icons/Ionicons";
import React, {
  useEffect,
  useState,
} from "react";
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
} from "react-native";

import { loginUser } from "@/app/services/auth/authApi";

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;

  /**
   * Called after a successful login.
   */
  onLogin?: (
    email: string,
    response: Record<string, unknown>,
  ) => void;

  /**
   * Called when the user presses Register.
   */
  onRegister?: () => void;

  /**
   * Called when the user presses Forgot Password.
   */
  onForgotPassword?: () => void;
}

export default function LoginModal({
  visible,
  onClose,
  onLogin,
  onRegister,
  onForgotPassword,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [loginSuccessful, setLoginSuccessful] =
    useState(false);

  useEffect(() => {
    if (!visible) {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setLoading(false);
      setError("");
      setSuccessMessage("");
      setLoginSuccessful(false);
    }
  }, [visible]);

  const isEmailValid = (
    value: string,
  ): boolean => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(
      value.trim(),
    );
  };

  const loginFormValid =
    email.trim().length > 0 &&
    isEmailValid(email) &&
    password.length > 0;

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const handleEmailChange = (
    value: string,
  ) => {
    setEmail(value);
    clearMessages();
  };

  const handlePasswordChange = (
    value: string,
  ) => {
    setPassword(value);
    clearMessages();
  };

  const handleLogin = async () => {
    clearMessages();

    const trimmedEmail =
      email.trim();

    if (!trimmedEmail) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (!isEmailValid(trimmedEmail)) {
      setError(
        "Please enter a valid email address.",
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password.",
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await loginUser({
          email: trimmedEmail,
          password,
        });

      console.log(
        "Login successful:",
        response,
      );

      setLoginSuccessful(true);

      setSuccessMessage(
        "You have logged in successfully.",
      );

      onLogin?.(
        trimmedEmail,
        response as Record<
          string,
          unknown
        >,
      );
    } catch (err) {
      console.error(
        "Login failed:",
        err,
      );

      setLoginSuccessful(false);

      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (loading) {
      return;
    }

    clearMessages();

    onClose();

    if (onRegister) {
      setTimeout(() => {
        onRegister();
      }, 250);
    }
  };

  const handleForgotPassword = () => {
    if (loading) {
      return;
    }

    clearMessages();

    if (onForgotPassword) {
      onForgotPassword();
    }
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={
        handleClose
      }
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <Pressable
          className="absolute inset-0 bg-black/70"
          onPress={handleClose}
        />

        <View className="max-h-[92%] w-full rounded-t-3xl border-t border-[#292929] bg-[#111111]">
          {/* Drag indicator */}
          <View className="items-center pb-2 pt-3">
            <View className="h-1.5 w-12 rounded-full bg-[#3a3a3a]" />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios"
                ? "interactive"
                : "on-drag"
            }
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={{
              paddingBottom: 30,
            }}
          >
            <View className="px-6 pb-2 pt-3">
              {/* Header */}
              <View className="mb-7 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-white">
                    Welcome Back
                  </Text>

                  <Text className="mt-1 text-sm text-gray-400">
                    Sign in to your account.
                  </Text>
                </View>

                <Pressable
                  onPress={handleClose}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Close login"
                  className="ml-4 h-10 w-10 items-center justify-center rounded-full bg-[#222222]"
                  style={({
                    pressed,
                  }) => ({
                    opacity: loading
                      ? 0.4
                      : pressed
                        ? 0.7
                        : 1,
                  })}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color="#ffffff"
                  />
                </Pressable>
              </View>

              {/* Login Icon */}
              <View className="mb-7 items-center">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-red-950/50">
                  <Ionicons
                    name="person-outline"
                    size={36}
                    color="#ef4444"
                  />
                </View>

                <Text className="mt-4 text-center text-xl font-bold text-white">
                  Sign In
                </Text>

                <Text className="mt-2 text-center text-sm leading-5 text-neutral-400">
                  Enter your email and password
                  to continue.
                </Text>
              </View>

              {/* Error */}
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

              {/* Success */}
              {successMessage ? (
                <View className="mb-5 flex-row items-center rounded-xl border border-green-900/60 bg-green-950/30 px-4 py-3">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#22c55e"
                  />

                  <Text className="ml-2 flex-1 text-sm text-green-400">
                    {successMessage}
                  </Text>
                </View>
              ) : null}

              {!loginSuccessful ? (
                <>
                  {/* Email */}
                  <View className="mb-5">
                    <Text className="mb-2 text-sm font-semibold text-gray-300">
                      Email Address
                    </Text>

                    <View className="flex-row items-center rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color="#9ca3af"
                      />

                      <TextInput
                        value={email}
                        onChangeText={
                          handleEmailChange
                        }
                        placeholder="Enter your email"
                        placeholderTextColor="#6b7280"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                        returnKeyType="next"
                        className="ml-3 flex-1 py-4 text-[15px] text-white"
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View className="mb-3">
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
                        onChangeText={
                          handlePasswordChange
                        }
                        placeholder="Enter your password"
                        placeholderTextColor="#6b7280"
                        secureTextEntry={
                          !showPassword
                        }
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                        returnKeyType="done"
                        onSubmitEditing={
                          handleLogin
                        }
                        className="ml-3 flex-1 py-4 text-[15px] text-white"
                      />

                      <Pressable
                        onPress={() =>
                          setShowPassword(
                            (current) =>
                              !current,
                          )
                        }
                        disabled={loading}
                        className="ml-2 h-10 w-10 items-center justify-center"
                        accessibilityRole="button"
                        accessibilityLabel={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
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

                  {/* Forgot Password */}
                  <View className="mb-5 items-end">
                    <Pressable
                      onPress={
                        handleForgotPassword
                      }
                      disabled={loading}
                      style={({
                        pressed,
                      }) => ({
                        opacity: pressed
                          ? 0.7
                          : 1,
                      })}
                    >
                      <Text className="text-sm font-semibold text-red-500">
                        Forgot Password?
                      </Text>
                    </Pressable>
                  </View>

                  {/* Login Button */}
                  <Pressable
                    onPress={handleLogin}
                    disabled={
                      !loginFormValid ||
                      loading
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Login"
                    className={`h-13 items-center justify-center rounded-xl bg-red-600 ${
                      !loginFormValid ||
                      loading
                        ? "opacity-50"
                        : ""
                    }`}
                    style={({
                      pressed,
                    }) => ({
                      opacity:
                        !loginFormValid ||
                        loading
                          ? 0.5
                          : pressed
                            ? 0.7
                            : 1,
                    })}
                  >
                    {loading ? (
                      <ActivityIndicator
                        size="small"
                        color="#ffffff"
                      />
                    ) : (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="log-in-outline"
                          size={20}
                          color="#ffffff"
                        />

                        <Text className="ml-2 text-[15px] font-bold text-white">
                          Sign In
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </>
              ) : (
                /* Successful login */
                <View className="items-center rounded-2xl border border-green-900/60 bg-green-950/20 p-6">
                  <View className="h-20 w-20 items-center justify-center rounded-full bg-green-950/50">
                    <Ionicons
                      name="checkmark-circle"
                      size={50}
                      color="#22c55e"
                    />
                  </View>

                  <Text className="mt-5 text-center text-xl font-bold text-white">
                    Login Successful
                  </Text>

                  <Text className="mt-2 text-center text-sm leading-5 text-neutral-400">
                    Welcome back. You are now
                    signed in.
                  </Text>

                  <Text className="mt-2 text-center text-sm font-semibold text-green-400">
                    {email.trim()}
                  </Text>

                  <Pressable
                    onPress={onClose}
                    className="mt-5 w-full h-13 items-center justify-center rounded-xl bg-red-600"
                    style={({
                      pressed,
                    }) => ({
                      opacity: pressed
                        ? 0.7
                        : 1,
                    })}
                  >
                    <Text className="text-[15px] font-bold text-white">
                      Continue
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Register */}
              {!loginSuccessful ? (
                <View className="mt-7 flex-row items-center justify-center">
                  <Text className="text-sm text-gray-400">
                    Don't have an account?
                  </Text>

                  <Pressable
                    onPress={
                      handleRegister
                    }
                    disabled={loading}
                    className="ml-1.5"
                    style={({
                      pressed,
                    }) => ({
                      opacity: pressed
                        ? 0.7
                        : 1,
                    })}
                  >
                    <Text className="text-sm font-bold text-red-500">
                      Register
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

