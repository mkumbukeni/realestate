
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface NewsletterSubscribeModalProps {
  visible: boolean;
  onClose: () => void;
}

type ApiResponse = {
  message?: string;
  error?: string;
  success?: boolean;
  [key: string]: unknown;
};

function getNewsletterEndpoint(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    throw new Error(
      "The API URL is not configured. Please set EXPO_PUBLIC_API_URL in your environment."
    );
  }

  const baseUrl = configuredUrl.replace(/\/+$/, "");

  if (/\/api\/v2$/i.test(baseUrl) || /\/v2$/i.test(baseUrl)) {
    return `${baseUrl}/newsletter/subscribe`;
  }

  if (/\/api$/i.test(baseUrl)) {
    return `${baseUrl}/v2/newsletter/subscribe`;
  }

  return `${baseUrl}/api/v2/newsletter/subscribe`;
}

export default function NewsletterSubscribeModal({
  visible,
  onClose,
}: NewsletterSubscribeModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  // Designation is intentionally handled in code, not shown to the user.
  const NEWSLETTER_DESIGNATION = "Client";

  useEffect(() => {
    if (!visible) {
      setLoading(false);
      setConfirmationVisible(false);
    }
  }, [visible]);

  const closeModal = () => {
    if (loading) return;

    setConfirmationVisible(false);
    onClose();
  };

  // Validate first, then ask the user to confirm before calling the API.
  const handleSubscribePress = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setConfirmationVisible(true);
  };

  const confirmSubscription = async () => {
    if (loading) return;

    const trimmedEmail = email.trim();

    // Revalidate in case the value changed before confirmation.
    if (!trimmedEmail) {
      setConfirmationVisible(false);

      Alert.alert("Email required", "Please enter your email address.");
      return;
    }

    /*
     * IMPORTANT:
     * Close ONLY the confirmation modal.
     *
     * The main newsletter modal remains visible, so the user can see
     * the Subscribe button change to "Subscribing...".
     */
    setConfirmationVisible(false);

    try {
      setLoading(true);

      const endpoint = getNewsletterEndpoint();

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          designation: NEWSLETTER_DESIGNATION,
        }),
      });

      let responseData: ApiResponse = {};

      try {
        responseData = (await response.json()) as ApiResponse;
      } catch {
        // Some servers return an empty response body.
      }

      if (!response.ok) {
        const serverMessage =
          (typeof responseData.message === "string" &&
            responseData.message) ||
          (typeof responseData.error === "string" && responseData.error) ||
          `Subscription failed (HTTP ${response.status}).`;

        throw new Error(serverMessage);
      }

      setEmail("");

      Alert.alert(
        "Subscription successful",
        (typeof responseData.message === "string" &&
          responseData.message) ||
          "Thank you for subscribing to our newsletter."
      );

      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      Alert.alert("Unable to subscribe", message);
    } finally {
      setLoading(false);
    }
  };

  const panelClass = isDark
    ? "rounded-t-3xl border border-[#292929] bg-[#171717]"
    : "rounded-t-3xl border border-gray-200 bg-white";

  const titleClass = isDark
    ? "text-xl font-bold text-white"
    : "text-xl font-bold text-black";

  const descriptionClass = isDark
    ? "mt-2 text-sm leading-5 text-gray-400"
    : "mt-2 text-sm leading-5 text-gray-600";

  const labelClass = isDark
    ? "mb-2 text-sm font-semibold text-gray-200"
    : "mb-2 text-sm font-semibold text-gray-800";

  const inputClass = isDark
    ? "rounded-xl border border-[#363636] bg-[#101010] px-4 py-3.5 text-base text-white"
    : "rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-base text-black";

  const confirmationPanelClass = isDark
    ? "w-full max-w-md rounded-3xl border border-[#303030] bg-[#171717] p-6"
    : "w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6";

  const secondaryButtonClass = isDark
    ? "flex-1 items-center justify-center rounded-xl border border-[#383838] px-4 py-3.5"
    : "flex-1 items-center justify-center rounded-xl border border-gray-300 px-4 py-3.5";

  return (
    <>
      {/* Main newsletter modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close newsletter subscription"
            onPress={closeModal}
            disabled={loading}
            className="absolute inset-0 bg-black/60"
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="w-full"
            keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
          >
            <View className={`${panelClass} min-h-[360px] w-full`}>
              <View className="items-center pb-2 pt-3">
                <View
                  className={
                    isDark
                      ? "h-1.5 w-12 rounded-full bg-gray-600"
                      : "h-1.5 w-12 rounded-full bg-gray-300"
                  }
                />
              </View>

              <View className="px-[22px] pb-7 pt-3">
                <View className="mb-5 flex-row items-start">
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-red-600">
                    <Ionicons
                      name="mail-outline"
                      size={25}
                      color="#fff"
                    />
                  </View>

                  <View className="flex-1 pr-2">
                    <Text className={titleClass}>
                      Subscribe to our newsletter
                    </Text>

                    <Text className={descriptionClass}>
                      Get the latest property news, listings, and updates
                      delivered to your inbox.
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close modal"
                    onPress={closeModal}
                    disabled={loading}
                    className={
                      isDark
                        ? "h-9 w-9 items-center justify-center rounded-full bg-[#252525]"
                        : "h-9 w-9 items-center justify-center rounded-full bg-gray-100"
                    }
                  >
                    <Ionicons
                      name="close"
                      size={22}
                      color={isDark ? "#fff" : "#111827"}
                    />
                  </Pressable>
                </View>

                <View className="mb-4">
                  <Text className={labelClass}>Email address</Text>

                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={
                      isDark ? "#737373" : "#9ca3af"
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    accessibilityLabel="Email address"
                    editable={!loading}
                    className={inputClass}
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={handleSubscribePress}
                  />
                </View>

                {/* ONLY THIS BUTTON shows the loading state */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Subscribe to newsletter"
                  onPress={handleSubscribePress}
                  disabled={loading}
                  className={`w-full flex-row items-center justify-center rounded-xl px-5 py-4 ${
                    loading
                      ? "bg-red-900"
                      : "bg-red-600 active:bg-red-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color="#fff"
                      />

                      <Text className="ml-3 text-base font-bold text-white">
                        Subscribing...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons
                        name="mail"
                        size={20}
                        color="#fff"
                      />

                      <Text className="ml-2 text-base font-bold text-white">
                        Subscribe
                      </Text>
                    </>
                  )}
                </Pressable>

                <Text className="mt-4 text-center text-xs leading-5 text-gray-500">
                  You can close this window at any time.
                </Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Confirmation modal */}
      <Modal
        visible={confirmationVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!loading) {
            setConfirmationVisible(false);
          }
        }}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel subscription confirmation"
            onPress={() => {
              if (!loading) {
                setConfirmationVisible(false);
              }
            }}
            className="absolute inset-0 bg-black/70"
          />

          <View className={confirmationPanelClass}>
            <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-red-600/15">
              <Ionicons
                name="mail-unread-outline"
                size={30}
                color="#ef4444"
              />
            </View>

            <Text className={titleClass}>
              Confirm subscription
            </Text>

            <Text className={descriptionClass}>
              Would you like to subscribe this email address to our
              newsletter?
            </Text>

            <View
              className={
                isDark
                  ? "mt-4 rounded-xl border border-[#303030] bg-[#101010] px-4 py-3"
                  : "mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
              }
            >
              <Text
                className={
                  isDark
                    ? "text-sm font-semibold text-white"
                    : "text-sm font-semibold text-gray-900"
                }
              >
                {email.trim()}
              </Text>
            </View>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirmationVisible(false)}
                disabled={loading}
                className={secondaryButtonClass}
              >
                <Text
                  className={
                    isDark
                      ? "text-base font-semibold text-white"
                      : "text-base font-semibold text-gray-800"
                  }
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={confirmSubscription}
                disabled={loading}
                className="flex-1 flex-row items-center justify-center rounded-xl bg-red-600 px-4 py-3.5 active:bg-red-700"
              >
                <Text className="text-base font-bold text-white">
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
