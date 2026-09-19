
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
}) => (
  <View className="mb-4 w-full">
    <Text className="mb-2 text-sm font-medium text-gray-400">
      {label}
    </Text>

    <TextInput
      className={`w-full rounded-xl border border-[#292929] bg-[#171717] px-4 text-white ${
        multiline ? "h-32 pt-4" : "h-14"
      }`}
      placeholder={placeholder}
      placeholderTextColor="#666"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
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
}: {
  label: string;
  placeholder: string;
  value: string | null;
  onPress: () => void;
}) => (
  <View className="mb-4 w-full">
    <Text className="mb-2 text-sm font-medium text-gray-400">
      {label}
    </Text>

    <Pressable
      onPress={onPress}
      className="h-14 w-full flex-row items-center justify-between rounded-xl border border-[#292929] bg-[#171717] px-4"
    >
      <Text
        className={
          value
            ? "flex-1 text-white"
            : "flex-1 text-[#666]"
        }
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>

      <Ionicons
        name="chevron-down"
        size={20}
        color="#666"
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
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className="mr-6 flex-row items-center"
  >
    <View
      className={`mr-2 h-5 w-5 items-center justify-center rounded-full border-2 ${
        selected
          ? "border-red-500"
          : "border-gray-600"
      }`}
    >
      {selected && (
        <View className="h-2.5 w-2.5 rounded-full bg-red-500" />
      )}
    </View>

    <Text className="text-base text-white">
      {label}
    </Text>
  </Pressable>
);

// ============================================================
// MAIN SCREEN
// ============================================================

export default function PropertyForm() {
  const router = useRouter();

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
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0d0d0d"
      />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View className="flex-row items-center border-b border-[#222] bg-[#0d0d0d] px-5 pb-3.5 pt-2.5">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#171717]"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
          />
        </Pressable>

        <View>
          <Text className="text-xl font-bold text-white">
            List Property
          </Text>

          <Text className="mt-0.5 text-xs text-gray-500">
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

          <View className="mb-8 items-center rounded-2xl border border-[#292929] bg-[#171717] p-6">
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
                className="flex-1 items-center justify-center rounded-xl border border-red-600 bg-transparent py-3 active:bg-red-900/20"
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

            <Text className="text-lg font-bold text-white">
              Fill Your Details
            </Text>
          </View>

          {/* ==================================================
              PERSONAL INFORMATION
              EACH FIELD IS FULL WIDTH
          ================================================== */}

          <Text className="mb-4 text-base font-semibold text-gray-300">
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
          />

          {/* LAST NAME */}

          <InputField
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChangeText={(value) =>
              handleChange("lastName", value)
            }
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
          />

          {/* PHONE */}

          <View className="mb-4 w-full">
            <Text className="mb-2 text-sm font-medium text-gray-400">
              Phone
            </Text>

            <View className="h-14 w-full flex-row items-center rounded-xl border border-[#292929] bg-[#171717] px-3">
              <Text className="mr-2 text-xl">
                🇲🇼
              </Text>

              <TextInput
                className="h-full flex-1 text-white"
                placeholder="+265"
                placeholderTextColor="#666"
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

            <Text className="text-lg font-bold text-white">
              Property Details
            </Text>
          </View>

          {/* LISTING TYPE */}

          <SelectField
            label="Listing Type"
            placeholder="Select listing type"
            value={formData.listingType}
            onPress={() => {}}
          />

          {/* PROPERTY TYPE */}

          <SelectField
            label="Property Type"
            placeholder="Select property type"
            value={formData.propertyType}
            onPress={() => {}}
          />

          {/* REGION */}

          <SelectField
            label="Region"
            placeholder="Select region"
            value={formData.region}
            onPress={() => {}}
          />

          {/* DISTRICT */}

          <SelectField
            label="District"
            placeholder="Select district"
            value={formData.district}
            onPress={() => {}}
          />

          {/* AREA */}

          <SelectField
            label="Area"
            placeholder="Select area"
            value={formData.area}
            onPress={() => {}}
          />

          {/* VISIBILITY */}

          <SelectField
            label="Visibility"
            placeholder="Select listing visibility"
            value={formData.visibility}
            onPress={() => {}}
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
          />

          {/* ==================================================
              PROPERTY VALUE / VALUATION QUESTION
              NOW AFTER DESCRIPTION
          ================================================== */}

          <View className="my-6 rounded-xl border border-[#292929] bg-[#171717] p-4">
            <Text className="mb-4 text-sm font-semibold leading-5 text-gray-300">
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
              />

              <RadioButton
                label="No"
                selected={
                  formData.worthCheck === "no"
                }
                onPress={() =>
                  handleChange("worthCheck", "no")
                }
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
            className="mt-2 w-full items-center justify-center rounded-xl bg-red-900/40 py-4 active:bg-red-900/60"
          >
            <Text className="text-base font-bold text-gray-400">
              Sign in to submit
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
