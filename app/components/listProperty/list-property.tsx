import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  Pressable,
  View,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

// ============================================================
// TYPES
// ============================================================

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  worthCheck: "yes" | "no" | null;
  listingType: string | null;
  propertyType: string | null;
  region: string | null;
  district: string | null;
  area: string | null;
  visibility: string | null;
  description: string;
};

// ============================================================
// REUSABLE INPUT FIELD
// ============================================================

const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  multiline = false,
  isDark,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?:
    | "default"
    | "email-address"
    | "phone-pad"
    | "numeric";
  multiline?: boolean;
  isDark: boolean;
}) => (
  <View className="mb-4 w-full">
    <Text
      className={
        isDark
          ? "mb-2 text-sm font-medium text-gray-400"
          : "mb-2 text-sm font-medium text-gray-700"
      }
    >
      {label}
    </Text>

    <TextInput
      className={`w-full rounded-xl border px-4 ${
        multiline ? "h-32 pt-4" : "h-14"
      } ${
        isDark
          ? "border-[#292929] bg-[#171717] text-white"
          : "border-gray-300 bg-white text-gray-900"
      }`}
      placeholder={placeholder}
      placeholderTextColor={
        isDark ? "#666666" : "#999999"
      }
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      textAlignVertical={
        multiline ? "top" : "center"
      }
    />
  </View>
);

// ============================================================
// REUSABLE SELECT FIELD
// ============================================================

const SelectField = ({
  label,
  placeholder,
  value,
  onPress,
  isDark,
}: {
  label: string;
  placeholder: string;
  value: string | null;
  onPress: () => void;
  isDark: boolean;
}) => (
  <View className="mb-4 w-full">
    <Text
      className={
        isDark
          ? "mb-2 text-sm font-medium text-gray-400"
          : "mb-2 text-sm font-medium text-gray-700"
      }
    >
      {label}
    </Text>

    <Pressable
      onPress={onPress}
      className={`h-14 w-full flex-row items-center justify-between rounded-xl border px-4 ${
        isDark
          ? "border-[#292929] bg-[#171717]"
          : "border-gray-300 bg-white"
      }`}
    >
      <Text
        className={
          value
            ? isDark
              ? "flex-1 text-white"
              : "flex-1 text-gray-900"
            : isDark
              ? "flex-1 text-[#666]"
              : "flex-1 text-gray-400"
        }
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>

      <Ionicons
        name="chevron-down"
        size={20}
        color={isDark ? "#666" : "#777"}
      />
    </Pressable>
  </View>
);

// ============================================================
// RADIO BUTTON
// ============================================================

const RadioButton = ({
  selected,
  label,
  onPress,
  isDark,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  isDark: boolean;
}) => (
  <Pressable
    onPress={onPress}
    className="mr-6 flex-row items-center"
  >
    <View
      className={`mr-2 h-5 w-5 items-center justify-center rounded-full border-2 ${
        selected
          ? "border-red-500"
          : isDark
            ? "border-gray-600"
            : "border-gray-400"
      }`}
    >
      {selected && (
        <View className="h-2.5 w-2.5 rounded-full bg-red-500" />
      )}
    </View>

    <Text
      className={
        isDark
          ? "text-base text-white"
          : "text-base text-gray-800"
      }
    >
      {label}
    </Text>
  </Pressable>
);

// ============================================================
// MAIN SCREEN
// ============================================================

export default function ListPropertyForm() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    worthCheck: null,
    listingType: null,
    propertyType: null,
    region: null,
    district: null,
    area: null,
    visibility: null,
    description: "",
  });

  // ==========================================================
  // HANDLE FORM CHANGES
  // ==========================================================

  const handleChange = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // ==========================================================
  // SCREEN
  // ==========================================================

  return (
    <SafeAreaView
      className={
        isDark
          ? "flex-1 bg-[#0d0d0d]"
          : "flex-1 bg-gray-100"
      }
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={
          isDark
            ? "#0d0d0d"
            : "#f3f4f6"
        }
      />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        className={`flex-row items-center border-b px-5 pb-3.5 pt-2.5 ${
          isDark
            ? "border-[#222] bg-[#0d0d0d]"
            : "border-gray-200 bg-gray-100"
        }`}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
            isDark
              ? "bg-[#171717]"
              : "bg-white"
          }`}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#fff" : "#222"}
          />
        </Pressable>

        <View>
          <Text
            className={
              isDark
                ? "text-xl font-bold text-white"
                : "text-xl font-bold text-gray-900"
            }
          >
            List Property
          </Text>

          <Text
            className={
              isDark
                ? "mt-0.5 text-xs text-gray-500"
                : "mt-0.5 text-xs text-gray-600"
            }
          >
            Fill in the details below
          </Text>
        </View>
      </View>

      {/* ======================================================
          KEYBOARD AVOIDING VIEW
      ====================================================== */}

      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 60,
          }}
        >
          {/* ==================================================
              TOP AUTH SECTION
          ================================================== */}

          <View
            className={`mb-8 items-center rounded-2xl border p-6 ${
              isDark
                ? "border-[#292929] bg-[#171717]"
                : "border-gray-200 bg-white"
            }`}
          >
            <Text className="mb-5 text-center text-base font-bold leading-6 text-red-500">
              To List Your Property Please Sign In or Register
            </Text>

            <View className="w-full flex-row justify-center gap-4">
              {/* SIGN IN */}

              <Pressable
                onPress={() => router.push("/login")}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                className="flex-1 items-center justify-center rounded-xl bg-red-600 py-3 active:bg-red-700"
              >
                <Text className="text-base font-bold text-white">
                  Sign In
                </Text>
              </Pressable>

              {/* REGISTER */}

              <Pressable
                onPress={() => router.push("/register")}
                accessibilityRole="button"
                accessibilityLabel="Register"
                className={`flex-1 items-center justify-center rounded-xl border border-red-600 bg-transparent py-3 ${
                  isDark
                    ? "active:bg-red-900/20"
                    : "active:bg-red-50"
                }`}
              >
                <Text className="text-base font-bold text-red-500">
                  Register
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ==================================================
              SECTION TITLE
          ================================================== */}

          <View className="mb-4 flex-row items-center">
            <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

            <Text
              className={
                isDark
                  ? "text-lg font-bold text-white"
                  : "text-lg font-bold text-gray-900"
              }
            >
              Fill Your Details
            </Text>
          </View>

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <Text
            className={
              isDark
                ? "mb-4 text-base font-semibold text-gray-300"
                : "mb-4 text-base font-semibold text-gray-700"
            }
          >
            Personal Information
          </Text>

          {/* FIRST NAME */}

          <InputField
            label="First Name"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChangeText={(value) =>
              handleChange("firstName", value)
            }
            isDark={isDark}
          />

          {/* LAST NAME */}

          <InputField
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChangeText={(value) =>
              handleChange("lastName", value)
            }
            isDark={isDark}
          />

          {/* EMAIL */}

          <InputField
            label="Email"
            placeholder="Enter your email address"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(value) =>
              handleChange("email", value)
            }
            isDark={isDark}
          />

          {/* PHONE */}

          <View className="mb-4 w-full">
            <Text
              className={
                isDark
                  ? "mb-2 text-sm font-medium text-gray-400"
                  : "mb-2 text-sm font-medium text-gray-700"
              }
            >
              Phone
            </Text>

            <View
              className={`h-14 w-full flex-row items-center rounded-xl border px-3 ${
                isDark
                  ? "border-[#292929] bg-[#171717]"
                  : "border-gray-300 bg-white"
              }`}
            >
              <Text className="mr-2 text-xl">
                🇲🇼
              </Text>

              <TextInput
                className={
                  isDark
                    ? "h-full flex-1 text-white"
                    : "h-full flex-1 text-gray-900"
                }
                placeholder="+265"
                placeholderTextColor={
                  isDark ? "#666" : "#999"
                }
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(value) =>
                  handleChange("phone", value)
                }
              />
            </View>
          </View>

          {/* ==================================================
              PROPERTY DETAILS
          ================================================== */}

          <View className="mb-4 mt-4 flex-row items-center">
            <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

            <Text
              className={
                isDark
                  ? "text-lg font-bold text-white"
                  : "text-lg font-bold text-gray-900"
              }
            >
              Property Details
            </Text>
          </View>

          {/* LISTING TYPE */}

          <SelectField
            label="Listing Type"
            placeholder="Select listing type"
            value={formData.listingType}
            onPress={() => {}}
            isDark={isDark}
          />

          {/* PROPERTY TYPE */}

          <SelectField
            label="Property Type"
            placeholder="Select property type"
            value={formData.propertyType}
            onPress={() => {}}
            isDark={isDark}
          />

          {/* REGION */}

          <SelectField
            label="Region"
            placeholder="Select region"
            value={formData.region}
            onPress={() => {}}
            isDark={isDark}
          />

          {/* DISTRICT */}

          <SelectField
            label="District"
            placeholder="Select district"
            value={formData.district}
            onPress={() => {}}
            isDark={isDark}
          />

          {/* AREA */}

          <SelectField
            label="Area"
            placeholder="Select area"
            value={formData.area}
            onPress={() => {}}
            isDark={isDark}
          />

          {/* VISIBILITY */}

          <SelectField
            label="Visibility"
            placeholder="Select listing visibility"
            value={formData.visibility}
            onPress={() => {}}
            isDark={isDark}
          />

          {/* ==================================================
              PROPERTY DESCRIPTION
          ================================================== */}

          <InputField
            label="Property Description"
            placeholder="Describe your property..."
            multiline
            value={formData.description}
            onChangeText={(value) =>
              handleChange("description", value)
            }
            isDark={isDark}
          />

          {/* ==================================================
              PROPERTY VALUE / VALUATION QUESTION
          ================================================== */}

          <View
            className={`my-6 rounded-xl border p-4 ${
              isDark
                ? "border-[#292929] bg-[#171717]"
                : "border-gray-200 bg-white"
            }`}
          >
            <Text
              className={
                isDark
                  ? "mb-4 text-sm font-semibold leading-5 text-gray-300"
                  : "mb-4 text-sm font-semibold leading-5 text-gray-700"
              }
            >
              I want to know how much my property is worth
            </Text>

            <View className="flex-row items-center">
              <RadioButton
                label="Yes"
                selected={
                  formData.worthCheck === "yes"
                }
                onPress={() =>
                  handleChange("worthCheck", "yes")
                }
                isDark={isDark}
              />

              <RadioButton
                label="No"
                selected={
                  formData.worthCheck === "no"
                }
                onPress={() =>
                  handleChange("worthCheck", "no")
                }
                isDark={isDark}
              />
            </View>
          </View>

          {/* ==================================================
              SUBMIT BUTTON
          ================================================== */}

          <Pressable
            onPress={() => {
              console.log(
                "Property listing:",
                formData,
              );
            }}
            accessibilityRole="button"
            accessibilityLabel="Sign in to submit property"
            className={`mt-2 w-full items-center justify-center rounded-xl py-4 ${
              isDark
                ? "bg-red-900/40 active:bg-red-900/60"
                : "bg-red-100 active:bg-red-200"
            }`}
          >
            <Text
              className={
                isDark
                  ? "text-base font-bold text-gray-400"
                  : "text-base font-bold text-red-600"
              }
            >
              Sign in to submit
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

