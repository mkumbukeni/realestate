
import Ionicons from "@expo/vector-icons/Ionicons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import CountryPicker, {
  type CountryCode,
} from "react-native-country-picker-modal";

import { useAuth } from "@/app/components/auth/AuthContext";
import { addClient } from "@/app/services/client/clientService";
import type {
  AddClientRequest,
  ListingType,
} from "@/app/types/client/client";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  phoneCountryIso: CountryCode;
  worthCheck: "yes" | "no" | null;
  listingType: ListingType | null;
  propertyType: string | null;
  region: string | null;
  district: string | null;
  area: string | null;
  visibility: "public" | "private" | null;
  description: string;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  maxBedrooms: string;
  waNotify: "yes" | "no";
  waNumber: string;
  waCountryCode: string;
  waCountryIso: CountryCode;
};

type PostCode = {
  id: number;
  region: string;
  district_code: string;
  district_name: string;
  location_name: string;
  location_code: string;
  latitude: number | null;
  longitude: number | null;
  google_map_link: string | null;
  last_sync_date: string | null;
  created_at: string;
  updated_at: string;
};

type SelectKey =
  | "propertyType"
  | "region"
  | "district"
  | "area";

type SubmitPayload = AddClientRequest & {
  visibility: "public" | "private";
  description?: string;
  worth_check?: "yes" | "no" | null;
};

interface ListPropertyFormProps {
  onClose?: () => void;
  onSignIn?: () => void;
  onRegister?: () => void;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Agricultural",
];

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  phoneCountryCode: "+265",
  phoneCountryIso: "MW",
  worthCheck: null,
  listingType: null,
  propertyType: null,
  region: null,
  district: null,
  area: null,
  visibility: null,
  description: "",
  minPrice: "0",
  maxPrice: "0",
  minBedrooms: "0",
  maxBedrooms: "0",
  waNotify: "no",
  waNumber: "",
  waCountryCode: "+265",
  waCountryIso: "MW",
};

/**
 * Builds the post-codes endpoint from EXPO_PUBLIC_API_URL.
 * Supports base URLs ending in /api/v2, /api, or the host alone.
 */
function getPostCodesUrl(): string {
  if (!API_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not defined. Check your environment configuration.",
    );
  }

  const baseUrl = API_URL.replace(/\/+$/, "");

  if (/\/api\/v\d+$/i.test(baseUrl)) {
    return `${baseUrl.replace(/\/api\/v\d+$/i, "/api")}/v1/post-codes`;
  }

  if (/\/api$/i.test(baseUrl)) {
    return `${baseUrl}/v1/post-codes`;
  }

  return `${baseUrl}/api/v1/post-codes`;
}

/**
 * Combines a country calling code and phone number.
 * Avoids duplicating the calling code if it is already included.
 */
function combinePhoneNumber(
  countryCode: string,
  phone: string,
): string {
  const digits = phone.replace(/\D/g, "");
  const codeDigits = countryCode.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (codeDigits && digits.startsWith(codeDigits)) {
    return `+${digits}`;
  }

  const localDigits = digits.replace(/^0+/, "");

  return `${countryCode}${localDigits}`;
}

/**
 * Converts an account phone number into the local number
 * displayed beside the country calling-code picker.
 *
 * The app defaults to Malawi (+265). If the saved number
 * starts with +265 or 0265, that prefix is removed from the
 * editable number field to avoid displaying it twice.
 */
function getInitialPhoneNumber(phone: string): string {
  const trimmedPhone = phone.trim();

  if (trimmedPhone.startsWith("+265")) {
    return trimmedPhone.slice(4).replace(/\D/g, "");
  }

  if (trimmedPhone.startsWith("0265")) {
    return trimmedPhone.slice(4).replace(/\D/g, "");
  }

  if (trimmedPhone.startsWith("265")) {
    return trimmedPhone.slice(3).replace(/\D/g, "");
  }

  return trimmedPhone;
}

export default function ListPropertyForm({
  onClose,
  onSignIn,
  onRegister,
}: ListPropertyFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const { isLoggedIn, user } = useAuth();

  const colors = {
    screen: isDark ? "#0d0d0d" : "#f3f4f6",
    surface: isDark ? "#171717" : "#ffffff",
    surfaceSecondary: isDark ? "#111111" : "#ffffff",
    input: isDark ? "#171717" : "#ffffff",
    inputDisabled: isDark ? "#121212" : "#f3f4f6",
    border: isDark ? "#404040" : "#d1d5db",
    borderSubtle: isDark ? "#303030" : "#e5e7eb",
    text: isDark ? "#ffffff" : "#111827",
    textSecondary: isDark ? "#d4d4d4" : "#374151",
    textMuted: isDark ? "#a3a3a3" : "#6b7280",
    placeholder: isDark ? "#737373" : "#9ca3af",
    icon: isDark ? "#a3a3a3" : "#6b7280",
    modalOverlay: "rgba(0,0,0,0.65)",
    modalSurface: isDark ? "#111111" : "#ffffff",
    optionSelected: isDark ? "#450a0a" : "#fef2f2",
    optionBackground: isDark ? "#171717" : "#ffffff",
    disabledText: isDark ? "#525252" : "#9ca3af",
  };

  const [formData, setFormData] =
    useState<FormData>(initialFormData);

  /*
   * Personal details come from the authenticated account.
   * The form displays the names as read-only text.
   *
   * AuthContext may expose firstName/lastName directly,
   * or only the backend's full name in user.name.
   */
  const toTrimmedString = (value: unknown): string =>
    typeof value === "string" ? value.trim() : "";

  const authenticatedEmail = toTrimmedString(
    user?.email,
  ).toLowerCase();

  const authenticatedFullName = toTrimmedString(
    user?.fullName ?? user?.name,
  );

  const nameParts = authenticatedFullName
    .split(/\s+/)
    .filter(Boolean);

  const authenticatedFirstName =
    toTrimmedString(user?.firstName) ||
    nameParts[0] ||
    "";

  const authenticatedLastName =
    toTrimmedString(user?.lastName) ||
    nameParts.slice(1).join(" ");

  const authenticatedPhone = toTrimmedString(
    user?.phoneNumber ?? user?.phone,
  );

  /*
   * Synchronize the account details when the user signs in,
   * signs out, or the authenticated account changes.
   *
   * The phone field is initialized from the account but is
   * still editable afterwards.
   */
  useEffect(() => {
    const savedPhone = getInitialPhoneNumber(
      authenticatedPhone,
    );

    setFormData((previous) => ({
      ...previous,
      firstName: authenticatedFirstName,
      lastName: authenticatedLastName,
      email: authenticatedEmail,
      phone: savedPhone,
      phoneCountryCode: "+265",
      phoneCountryIso: "MW",
    }));
  }, [
    authenticatedFirstName,
    authenticatedLastName,
    authenticatedEmail,
    authenticatedPhone,
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingPayload, setPendingPayload] =
    useState<SubmitPayload | null>(null);

  const [postalCodes, setPostalCodes] = useState<PostCode[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [locationError, setLocationError] = useState("");

  const [activeSelect, setActiveSelect] =
    useState<SelectKey | null>(null);
  const [optionSearch, setOptionSearch] = useState("");

  /**
   * Loads the available locations from the backend.
   */
  const loadLocations = useCallback(async () => {
    try {
      setLoadingLocations(true);
      setLocationError("");

      const response = await fetch(getPostCodesUrl(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const responseText = await response.text();

      let result: { data?: PostCode[] };

      try {
        result = JSON.parse(responseText) as {
          data?: PostCode[];
        };
      } catch {
        throw new Error(
          "The server returned an invalid locations response.",
        );
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load locations (${response.status}).`,
        );
      }

      if (!Array.isArray(result.data)) {
        throw new Error(
          "The locations response does not contain a valid data list.",
        );
      }

      setPostalCodes(result.data);
    } catch (error) {
      setLocationError(
        error instanceof Error
          ? error.message
          : "Unable to load locations. Please try again.",
      );
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  const regions = useMemo(
    () =>
      Array.from(
        new Set(
          postalCodes
            .map((item) => item.region)
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [postalCodes],
  );

  const districts = useMemo(
    () =>
      Array.from(
        new Set(
          postalCodes
            .filter(
              (item) => item.region === formData.region,
            )
            .map((item) => item.district_name)
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [postalCodes, formData.region],
  );

  const areas = useMemo(
    () =>
      Array.from(
        new Set(
          postalCodes
            .filter(
              (item) =>
                item.region === formData.region &&
                item.district_name === formData.district,
            )
            .map((item) => item.location_name)
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [postalCodes, formData.region, formData.district],
  );

  const selectOptions = useMemo(() => {
    switch (activeSelect) {
      case "propertyType":
        return PROPERTY_TYPES;
      case "region":
        return regions;
      case "district":
        return districts;
      case "area":
        return areas;
      default:
        return [];
    }
  }, [activeSelect, regions, districts, areas]);

  const filteredOptions = useMemo(() => {
    const query = optionSearch.trim().toLowerCase();

    if (!query) {
      return selectOptions;
    }

    return selectOptions.filter((option) =>
      option.toLowerCase().includes(query),
    );
  }, [selectOptions, optionSearch]);

  const selectTitle = useMemo(() => {
    switch (activeSelect) {
      case "propertyType":
        return "Select Property Type";
      case "region":
        return "Select Region";
      case "district":
        return "Select District";
      case "area":
        return "Select Area";
      default:
        return "Select an Option";
    }
  }, [activeSelect]);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSubmitMessage("");
  };

  const openSelect = (field: SelectKey) => {
    if (field === "district" && !formData.region) {
      return;
    }

    if (field === "area" && !formData.district) {
      return;
    }

    setOptionSearch("");
    setActiveSelect(field);
  };

  const handleSelectOption = (value: string) => {
    switch (activeSelect) {
      case "propertyType":
        updateField("propertyType", value);
        break;

      case "region":
        setFormData((previous) => ({
          ...previous,
          region: value,
          district: null,
          area: null,
        }));
        setSubmitMessage("");
        break;

      case "district":
        setFormData((previous) => ({
          ...previous,
          district: value,
          area: null,
        }));
        setSubmitMessage("");
        break;

      case "area":
        updateField("area", value);
        break;
    }

    setActiveSelect(null);
    setOptionSearch("");
  };

  /**
   * Validates the form and prepares a payload.
   * Does not send the API request until confirmation.
   */
  const handleSubmit = () => {
    if (submitting || confirmVisible) {
      return;
    }

    if (!isLoggedIn) {
      setSubmitSuccess(false);
      setSubmitMessage(
        "Please sign in or register before submitting this request.",
      );
      return;
    }

    /*
     * Always use the authenticated name and email.
     * The user cannot modify those values in the UI.
     */
    const firstName = authenticatedFirstName;
    const lastName = authenticatedLastName;
    const email = authenticatedEmail;

    /*
     * The phone number comes from the editable input.
     */
    const phone = formData.phone.trim();

    if (!email) {
      setSubmitSuccess(false);
      setSubmitMessage(
        "Your signed-in account does not have an email address. Please sign out and sign in again.",
      );
      return;
    }

    if (!firstName || !lastName || !phone) {
      setSubmitSuccess(false);
      setSubmitMessage(
        "Your account must have a first name and last name, and you must provide a phone number.",
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitSuccess(false);
      setSubmitMessage("Your account email address is invalid.");
      return;
    }

    const fullPhone = combinePhoneNumber(
      formData.phoneCountryCode,
      phone,
    );

    if (!fullPhone) {
      setSubmitSuccess(false);
      setSubmitMessage("Please enter a valid phone number.");
      return;
    }

    if (
      !formData.listingType ||
      !formData.propertyType ||
      !formData.region ||
      !formData.district ||
      !formData.area
    ) {
      setSubmitSuccess(false);
      setSubmitMessage(
        "Please select the listing type, property type, region, district, and area.",
      );
      return;
    }

    if (!formData.visibility) {
      setSubmitSuccess(false);
      setSubmitMessage(
        "Please select whether this request is Public or Private.",
      );
      return;
    }

    if (
      formData.waNotify === "yes" &&
      !formData.waNumber.trim()
    ) {
      setSubmitSuccess(false);
      setSubmitMessage("Please enter your WhatsApp number.");
      return;
    }

    const minPrice = Number(formData.minPrice);
    const maxPrice = Number(formData.maxPrice);
    const minBedrooms = Number(formData.minBedrooms);
    const maxBedrooms = Number(formData.maxBedrooms);

    if (
      !Number.isFinite(minPrice) ||
      !Number.isFinite(maxPrice) ||
      !Number.isFinite(minBedrooms) ||
      !Number.isFinite(maxBedrooms) ||
      minPrice < 0 ||
      maxPrice < 0 ||
      minBedrooms < 0 ||
      maxBedrooms < 0
    ) {
      setSubmitSuccess(false);
      setSubmitMessage(
        "Prices and bedroom counts must be valid non-negative numbers.",
      );
      return;
    }

    if (maxPrice > 0 && minPrice > maxPrice) {
      setSubmitSuccess(false);
      setSubmitMessage(
        "Minimum price cannot be greater than maximum price.",
      );
      return;
    }

    if (
      maxBedrooms > 0 &&
      minBedrooms > maxBedrooms
    ) {
      setSubmitSuccess(false);
      setSubmitMessage(
        "Minimum bedrooms cannot be greater than maximum bedrooms.",
      );
      return;
    }

    const fullWhatsApp =
      formData.waNotify === "yes" &&
      formData.waNumber.trim()
        ? combinePhoneNumber(
            formData.waCountryCode,
            formData.waNumber,
          )
        : fullPhone;

    const payload: SubmitPayload = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone: fullPhone,
      listing_type: formData.listingType,
      region: formData.region,
      district: formData.district,
      area: formData.area,
      min_price: minPrice,
      max_price: maxPrice,
      min_bedrooms: minBedrooms,
      max_bedrooms: maxBedrooms,
      property_type: formData.propertyType,
      wa_notify: formData.waNotify,
      wa_number: fullWhatsApp,
      visibility: formData.visibility,
      description: formData.description.trim(),
      worth_check: formData.worthCheck,
    };

    setSubmitMessage("");
    setSubmitSuccess(false);
    setPendingPayload(payload);
    setConfirmVisible(true);
  };

  /**
   * Sends the request only after the user confirms.
   */
  const confirmSubmit = async () => {
    if (submitting || !pendingPayload) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitMessage("");
      setSubmitSuccess(false);
      setConfirmVisible(false);

      const response = await addClient(pendingPayload);

      setSubmitSuccess(true);
      setSubmitMessage(
        response.message ||
          "Your property request has been submitted successfully.",
      );

      setPendingPayload(null);

      /*
       * Reset property requirements while retaining the
       * authenticated user's details and editable phone.
       */
      setFormData((previous) => ({
        ...initialFormData,
        firstName: authenticatedFirstName,
        lastName: authenticatedLastName,
        email: authenticatedEmail,
        phone: previous.phone,
        phoneCountryCode: previous.phoneCountryCode,
        phoneCountryIso: previous.phoneCountryIso,
      }));
    } catch (error) {
      setSubmitSuccess(false);
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
      setPendingPayload(null);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelConfirmation = () => {
    if (submitting) {
      return;
    }

    setConfirmVisible(false);
    setPendingPayload(null);
  };

  const requestSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      Alert.alert(
        "Sign In",
        "Connect the onSignIn prop to your existing sign-in modal.",
      );
    }
  };

  const requestRegister = () => {
    if (onRegister) {
      onRegister();
    } else {
      Alert.alert(
        "Register",
        "Connect the onRegister prop to your existing registration modal.",
      );
    }
  };

  const formatPrice = (value: string) => {
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
      return "Not specified";
    }

    return amount.toLocaleString();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.screen }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      <View
        className="flex-1"
        style={{ backgroundColor: colors.screen }}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between border-b px-5 py-4"
          style={{ borderBottomColor: colors.borderSubtle }}
        >
          <View className="flex-1">
            <Text
              className="text-xl font-bold"
              style={{ color: colors.text }}
            >
              List a Property
            </Text>

            <Text
              className="mt-1 text-sm"
              style={{ color: colors.textMuted }}
            >
              Tell us what property you are looking for.
            </Text>
          </View>

          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close form"
              className="ml-3 h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons
                name="close"
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 36,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Account status */}
          <View
            className="mb-6 rounded-xl border p-4"
            style={{
              borderColor: colors.borderSubtle,
              backgroundColor: colors.surface,
            }}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: colors.text }}
            >
              {isLoggedIn ? "Your account" : "Sign in required"}
            </Text>

            <Text
              className="mt-1 text-sm leading-5"
              style={{ color: colors.textMuted }}
            >
              {isLoggedIn
                ? "Your name and email come from your signed-in account. You can update your phone number."
                : "Sign in or register before submitting your request."}
            </Text>

            {!isLoggedIn && (
              <View className="mt-4 flex-row gap-3">
                <TouchableOpacity
                  onPress={requestSignIn}
                  accessibilityRole="button"
                  className="flex-1 items-center rounded-lg border px-4 py-3"
                  style={{ borderColor: "#dc2626" }}
                >
                  <Text className="font-semibold text-red-600">
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={requestRegister}
                  accessibilityRole="button"
                  className="flex-1 items-center rounded-lg bg-red-600 px-4 py-3"
                >
                  <Text className="font-semibold text-white">
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Personal information: names are read-only */}
          <SectionTitle
            title="Personal Information"
            isDark={isDark}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text
                className="mb-2 text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                First Name
              </Text>

              <View
                className="min-h-[52px] justify-center rounded-xl border px-3 py-3"
                style={{
                  backgroundColor: colors.inputDisabled,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-base"
                  style={{ color: colors.text }}
                >
                  {authenticatedFirstName ||
                    "Sign in to load your name"}
                </Text>
              </View>
            </View>

            <View className="flex-1">
              <Text
                className="mb-2 text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Last Name
              </Text>

              <View
                className="min-h-[52px] justify-center rounded-xl border px-3 py-3"
                style={{
                  backgroundColor: colors.inputDisabled,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-base"
                  style={{ color: colors.text }}
                >
                  {authenticatedLastName ||
                    "Sign in to load your name"}
                </Text>
              </View>
            </View>
          </View>

          {/* Email is read-only */}
          <View
            className="mb-5 mt-5 rounded-lg border px-3 py-3"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.inputDisabled,
            }}
          >
            <Text
              className="mb-1 text-xs"
              style={{ color: colors.textMuted }}
            >
              Signed-in Email
            </Text>

            <Text
              className="text-sm"
              style={{ color: colors.text }}
            >
              {authenticatedEmail ||
                "Sign in to load your email address"}
            </Text>
          </View>

          {/* Phone is editable */}
          <PhoneField
            label="Phone Number"
            value={formData.phone}
            countryCode={formData.phoneCountryCode}
            countryIso={formData.phoneCountryIso}
            onChangeText={(value) => updateField("phone", value)}
            onCountryChange={(iso, callingCode) => {
              setFormData((previous) => ({
                ...previous,
                phoneCountryIso: iso,
                phoneCountryCode: callingCode,
              }));
              setSubmitMessage("");
            }}
            isDark={isDark}
          />

          {/* Property requirements */}
          <SectionTitle
            title="Property Requirements"
            isDark={isDark}
          />

          <Text
            className="mb-2 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Are you looking for a property?
          </Text>

          <View className="mb-5 flex-row gap-3">
            <RadioButton
              label="Yes"
              selected={formData.worthCheck === "yes"}
              onPress={() => updateField("worthCheck", "yes")}
              isDark={isDark}
            />

            <RadioButton
              label="No"
              selected={formData.worthCheck === "no"}
              onPress={() => updateField("worthCheck", "no")}
              isDark={isDark}
            />
          </View>

          <Text
            className="mb-2 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Listing Type
          </Text>

          <View className="mb-5 flex-row gap-3">
            <RadioButton
              label="For Rent"
              selected={formData.listingType === "rent"}
              onPress={() => updateField("listingType", "rent")}
              isDark={isDark}
            />

            <RadioButton
              label="For Sale"
              selected={formData.listingType === "sale"}
              onPress={() => updateField("listingType", "sale")}
              isDark={isDark}
            />
          </View>

          <SelectField
            label="Property Type"
            value={formData.propertyType}
            placeholder="Select property type"
            onPress={() => openSelect("propertyType")}
            isDark={isDark}
          />

          <SelectField
            label="Region"
            value={formData.region}
            placeholder={
              loadingLocations
                ? "Loading regions..."
                : "Select region"
            }
            onPress={() => openSelect("region")}
            disabled={
              loadingLocations || regions.length === 0
            }
            isDark={isDark}
          />

          <SelectField
            label="District"
            value={formData.district}
            placeholder={
              !formData.region
                ? "Select a region first"
                : loadingLocations
                  ? "Loading districts..."
                  : "Select district"
            }
            onPress={() => openSelect("district")}
            disabled={
              loadingLocations ||
              !formData.region ||
              districts.length === 0
            }
            isDark={isDark}
          />

          <SelectField
            label="Area"
            value={formData.area}
            placeholder={
              !formData.district
                ? "Select a district first"
                : loadingLocations
                  ? "Loading areas..."
                  : "Select area"
            }
            onPress={() => openSelect("area")}
            disabled={
              loadingLocations ||
              !formData.district ||
              areas.length === 0
            }
            isDark={isDark}
          />

          {loadingLocations && (
            <View className="mb-5 flex-row items-center">
              <ActivityIndicator
                size="small"
                color="#ef4444"
              />
              <Text
                className="ml-2 text-sm"
                style={{ color: colors.textMuted }}
              >
                Loading Malawi locations...
              </Text>
            </View>
          )}

          {!loadingLocations && locationError !== "" && (
            <View
              className="mb-5 rounded-xl border p-3"
              style={{
                borderColor: isDark ? "#7f1d1d" : "#fecaca",
                backgroundColor: isDark ? "#450a0a" : "#fef2f2",
              }}
            >
              <Text
                className="text-sm leading-5"
                style={{
                  color: isDark ? "#fca5a5" : "#b91c1c",
                }}
              >
                {locationError}
              </Text>

              <TouchableOpacity
                onPress={() => void loadLocations()}
                accessibilityRole="button"
                className="mt-3 self-start flex-row items-center rounded-lg border px-3 py-2"
                style={{
                  borderColor: isDark ? "#991b1b" : "#fca5a5",
                }}
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color={isDark ? "#fca5a5" : "#b91c1c"}
                />
                <Text
                  className="ml-2 text-sm font-semibold"
                  style={{
                    color: isDark ? "#fca5a5" : "#b91c1c",
                  }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Budget and bedrooms */}
          <SectionTitle
            title="Budget and Bedrooms"
            isDark={isDark}
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <InputField
                label="Minimum Price"
                placeholder="0"
                value={formData.minPrice}
                onChangeText={(value) =>
                  updateField("minPrice", value)
                }
                keyboardType="numeric"
                isDark={isDark}
              />
            </View>

            <View className="flex-1">
              <InputField
                label="Maximum Price"
                placeholder="0"
                value={formData.maxPrice}
                onChangeText={(value) =>
                  updateField("maxPrice", value)
                }
                keyboardType="numeric"
                isDark={isDark}
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <InputField
                label="Minimum Bedrooms"
                placeholder="0"
                value={formData.minBedrooms}
                onChangeText={(value) =>
                  updateField("minBedrooms", value)
                }
                keyboardType="numeric"
                isDark={isDark}
              />
            </View>

            <View className="flex-1">
              <InputField
                label="Maximum Bedrooms"
                placeholder="0"
                value={formData.maxBedrooms}
                onChangeText={(value) =>
                  updateField("maxBedrooms", value)
                }
                keyboardType="numeric"
                isDark={isDark}
              />
            </View>
          </View>

          {/* Visibility */}
          <SectionTitle
            title="Availability"
            isDark={isDark}
          />

          <Text
            className="mb-2 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Who can view this request?
          </Text>

          <View className="mb-5 flex-row gap-3">
            <RadioButton
              label="Public"
              selected={formData.visibility === "public"}
              onPress={() => updateField("visibility", "public")}
              isDark={isDark}
            />

            <RadioButton
              label="Private"
              selected={formData.visibility === "private"}
              onPress={() => updateField("visibility", "private")}
              isDark={isDark}
            />
          </View>

          <Text
            className="-mt-3 mb-5 text-xs leading-5"
            style={{ color: colors.textMuted }}
          >
            Public makes the request available for public viewing.
            Private access restrictions must also be enforced by the API.
          </Text>

          {/* WhatsApp preferences */}
          <SectionTitle
            title="WhatsApp Notifications"
            isDark={isDark}
          />

          <Text
            className="mb-2 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Receive notifications on WhatsApp?
          </Text>

          <View className="mb-5 flex-row gap-3">
            <RadioButton
              label="Yes"
              selected={formData.waNotify === "yes"}
              onPress={() => updateField("waNotify", "yes")}
              isDark={isDark}
            />

            <RadioButton
              label="No"
              selected={formData.waNotify === "no"}
              onPress={() => updateField("waNotify", "no")}
              isDark={isDark}
            />
          </View>

          {formData.waNotify === "yes" && (
            <PhoneField
              label="WhatsApp Number"
              value={formData.waNumber}
              countryCode={formData.waCountryCode}
              countryIso={formData.waCountryIso}
              onChangeText={(value) =>
                updateField("waNumber", value)
              }
              onCountryChange={(iso, callingCode) => {
                setFormData((previous) => ({
                  ...previous,
                  waCountryIso: iso,
                  waCountryCode: callingCode,
                }));
                setSubmitMessage("");
              }}
              isDark={isDark}
            />
          )}

          {/* Additional information */}
          <SectionTitle
            title="Additional Information"
            isDark={isDark}
          />

          <Text
            className="mb-2 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Description
          </Text>

          <TextInput
            className="mb-5 min-h-28 rounded-xl border px-4 py-3 text-base"
            style={{
              backgroundColor: colors.input,
              borderColor: colors.border,
              color: colors.text,
            }}
            placeholder="Enter any additional requirements"
            placeholderTextColor={colors.placeholder}
            value={formData.description}
            onChangeText={(value) =>
              updateField("description", value)
            }
            multiline
            textAlignVertical="top"
          />

          {/* Submission feedback */}
          {submitMessage !== "" && (
            <View
              className="mb-4 rounded-lg border p-3"
              style={{
                borderColor: submitSuccess
                  ? isDark
                    ? "#166534"
                    : "#86efac"
                  : isDark
                    ? "#7f1d1d"
                    : "#fca5a5",
                backgroundColor: submitSuccess
                  ? isDark
                    ? "#052e16"
                    : "#f0fdf4"
                  : isDark
                    ? "#450a0a"
                    : "#fef2f2",
              }}
            >
              <View className="flex-row items-start">
                <Ionicons
                  name={
                    submitSuccess
                      ? "checkmark-circle-outline"
                      : "alert-circle-outline"
                  }
                  size={19}
                  color={
                    submitSuccess
                      ? isDark
                        ? "#86efac"
                        : "#166534"
                      : isDark
                        ? "#fca5a5"
                        : "#b91c1c"
                  }
                  style={{
                    marginRight: 8,
                    marginTop: 1,
                  }}
                />

                <Text
                  className="flex-1 text-sm leading-5"
                  style={{
                    color: submitSuccess
                      ? isDark
                        ? "#86efac"
                        : "#166534"
                      : isDark
                        ? "#fca5a5"
                        : "#b91c1c",
                  }}
                >
                  {submitMessage}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              if (!isLoggedIn) {
                Alert.alert(
                  "Sign In Required",
                  "Please sign in or register before submitting this request.",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Sign In",
                      onPress: requestSignIn,
                    },
                    {
                      text: "Register",
                      onPress: requestRegister,
                    },
                  ],
                );
                return;
              }

              handleSubmit();
            }}
            disabled={submitting || confirmVisible}
            accessibilityRole="button"
            accessibilityLabel={
              isLoggedIn
                ? "Submit property request"
                : "Sign in to submit request"
            }
            className={`mb-4 min-h-14 flex-row items-center justify-center rounded-xl px-5 py-4 ${
              submitting || confirmVisible
                ? "bg-red-900"
                : "bg-red-600"
            }`}
          >
            {submitting ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                />
                <Text className="ml-2 font-semibold text-white">
                  Submitting...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="paper-plane-outline"
                  size={18}
                  color="#ffffff"
                  style={{ marginRight: 8 }}
                />
                <Text className="font-semibold text-white">
                  {isLoggedIn
                    ? "Submit Request"
                    : "Sign In to Submit"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Submission confirmation modal */}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelConfirmation}
        statusBarTranslucent
      >
        <View
          className="flex-1 items-center justify-center px-5"
          style={{ backgroundColor: colors.modalOverlay }}
        >
          <View
            className="w-full max-w-md rounded-3xl border p-5"
            style={{
              backgroundColor: colors.modalSurface,
              borderColor: colors.borderSubtle,
            }}
          >
            <View className="mb-4 items-center">
              <View
                className="mb-3 h-16 w-16 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark ? "#450a0a" : "#fef2f2",
                }}
              >
                <Ionicons
                  name="clipboard-outline"
                  size={32}
                  color="#ef4444"
                />
              </View>

              <Text
                className="text-center text-xl font-bold"
                style={{ color: colors.text }}
              >
                Confirm Property Request
              </Text>

              <Text
                className="mt-2 text-center text-sm leading-5"
                style={{ color: colors.textMuted }}
              >
                Please review your details before submitting.
                Do you want to continue?
              </Text>
            </View>

            <ScrollView
              className="max-h-72"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View
                className="rounded-2xl border p-4"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                }}
              >
                <ConfirmationRow
                  label="Name"
                  value={`${authenticatedFirstName} ${authenticatedLastName}`.trim()}
                  colors={colors}
                />

                <ConfirmationRow
                  label="Email"
                  value={authenticatedEmail || "Not available"}
                  colors={colors}
                />

                <ConfirmationRow
                  label="Phone"
                  value={combinePhoneNumber(
                    formData.phoneCountryCode,
                    formData.phone,
                  )}
                  colors={colors}
                />

                <ConfirmationRow
                  label="Listing Type"
                  value={
                    formData.listingType === "rent"
                      ? "For Rent"
                      : "For Sale"
                  }
                  colors={colors}
                />

                <ConfirmationRow
                  label="Property Type"
                  value={formData.propertyType || "Not selected"}
                  colors={colors}
                />

                <ConfirmationRow
                  label="Location"
                  value={[
                    formData.area,
                    formData.district,
                    formData.region,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  colors={colors}
                />

                <ConfirmationRow
                  label="Price Range"
                  value={`${formatPrice(
                    formData.minPrice,
                  )} – ${formatPrice(formData.maxPrice)}`}
                  colors={colors}
                />

                <ConfirmationRow
                  label="Bedrooms"
                  value={`${formData.minBedrooms || "0"} – ${
                    formData.maxBedrooms || "0"
                  }`}
                  colors={colors}
                />

                <ConfirmationRow
                  label="Visibility"
                  value={
                    formData.visibility === "public"
                      ? "Public"
                      : "Private"
                  }
                  colors={colors}
                />

                <ConfirmationRow
                  label="WhatsApp Alerts"
                  value={
                    formData.waNotify === "yes"
                      ? "Enabled"
                      : "Disabled"
                  }
                  colors={colors}
                  last
                />
              </View>

              {formData.description.trim() !== "" && (
                <View className="mt-3">
                  <Text
                    className="mb-1 text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    Additional Information
                  </Text>

                  <Text
                    className="text-sm leading-5"
                    style={{ color: colors.textMuted }}
                  >
                    {formData.description.trim()}
                  </Text>
                </View>
              )}

              <View
                className="mt-4 flex-row items-start rounded-xl border p-3"
                style={{
                  borderColor: isDark ? "#713f12" : "#fde68a",
                  backgroundColor: isDark ? "#29200b" : "#fffbeb",
                }}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={isDark ? "#fbbf24" : "#92400e"}
                  style={{
                    marginRight: 8,
                    marginTop: 1,
                  }}
                />

                <Text
                  className="flex-1 text-xs leading-5"
                  style={{
                    color: isDark ? "#fcd34d" : "#92400e",
                  }}
                >
                  Confirm only if these details are correct.
                  Your property request will be sent when you
                  select Confirm & Submit.
                </Text>
              </View>
            </ScrollView>

            <View className="mt-5 flex-row gap-3">
              <TouchableOpacity
                onPress={cancelConfirmation}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Cancel property request submission"
                className="min-h-12 flex-1 items-center justify-center rounded-xl border px-3 py-3"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                <Text
                  className="font-semibold"
                  style={{ color: colors.text }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => void confirmSubmit()}
                disabled={submitting || !pendingPayload}
                accessibilityRole="button"
                accessibilityLabel="Confirm and submit property request"
                className="min-h-12 flex-1 flex-row items-center justify-center rounded-xl bg-red-600 px-3 py-3"
                style={{
                  opacity:
                    submitting || !pendingPayload ? 0.6 : 1,
                }}
              >
                {submitting ? (
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                  />
                ) : (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={19}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                )}

                <Text className="font-semibold text-white">
                  {submitting
                    ? "Submitting..."
                    : "Confirm & Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Searchable selector modal */}
      <Modal
        visible={activeSelect !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveSelect(null)}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          style={{ backgroundColor: colors.modalOverlay }}
          behavior={
            Platform.OS === "ios" ? "padding" : undefined
          }
        >
          <View
            className="max-h-[82%] rounded-t-3xl border-t px-5 pb-6 pt-5"
            style={{
              backgroundColor: colors.modalSurface,
              borderTopColor: colors.border,
            }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text
                className="flex-1 text-lg font-bold"
                style={{ color: colors.text }}
              >
                {selectTitle}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setActiveSelect(null);
                  setOptionSearch("");
                }}
                accessibilityRole="button"
                accessibilityLabel="Close selection"
                className="ml-3 h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <View
              className="mb-4 flex-row items-center rounded-xl border px-3"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.input,
              }}
            >
              <Ionicons
                name="search"
                size={19}
                color={colors.icon}
              />

              <TextInput
                className="ml-2 flex-1 py-3 text-base"
                style={{ color: colors.text }}
                placeholder="Search options..."
                placeholderTextColor={colors.placeholder}
                value={optionSearch}
                onChangeText={setOptionSearch}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />

              {optionSearch.length > 0 && (
                <TouchableOpacity
                  onPress={() => setOptionSearch("")}
                  accessibilityRole="button"
                  accessibilityLabel="Clear option search"
                >
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              initialNumToRender={20}
              maxToRenderPerBatch={30}
              ListEmptyComponent={
                <View className="items-center py-10">
                  <Ionicons
                    name="list-outline"
                    size={30}
                    color={colors.icon}
                  />

                  <Text
                    className="mt-3 text-center text-sm"
                    style={{ color: colors.textMuted }}
                  >
                    No matching options found.
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const selected =
                  (activeSelect === "propertyType" &&
                    formData.propertyType === item) ||
                  (activeSelect === "region" &&
                    formData.region === item) ||
                  (activeSelect === "district" &&
                    formData.district === item) ||
                  (activeSelect === "area" &&
                    formData.area === item);

                return (
                  <TouchableOpacity
                    onPress={() => handleSelectOption(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className="mb-2 min-h-12 flex-row items-center justify-between rounded-xl border px-4 py-3"
                    style={{
                      borderColor: selected
                        ? "#dc2626"
                        : colors.borderSubtle,
                      backgroundColor: selected
                        ? colors.optionSelected
                        : colors.optionBackground,
                    }}
                  >
                    <Text
                      className="flex-1 text-base"
                      style={{
                        color: selected
                          ? colors.text
                          : colors.textSecondary,
                        fontWeight: selected ? "600" : "400",
                      }}
                    >
                      {item}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#ef4444"
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            {activeSelect === "region" &&
              locationError !== "" && (
                <TouchableOpacity
                  onPress={() => void loadLocations()}
                  accessibilityRole="button"
                  className="mt-3 items-center rounded-xl border py-3"
                  style={{ borderColor: "#dc2626" }}
                >
                  <Text
                    className="font-semibold"
                    style={{
                      color: isDark ? "#fca5a5" : "#b91c1c",
                    }}
                  >
                    Retry loading locations
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/**
 * Displays one label/value pair in the confirmation summary.
 */
function ConfirmationRow({
  label,
  value,
  colors,
  last = false,
}: {
  label: string;
  value: string;
  colors: {
    text: string;
    textMuted: string;
    borderSubtle: string;
  };
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-start justify-between py-2 ${
        last ? "" : "border-b"
      }`}
      style={{
        borderBottomColor: colors.borderSubtle,
      }}
    >
      <Text
        className="mr-3 flex-1 text-sm"
        style={{ color: colors.textMuted }}
      >
        {label}
      </Text>

      <Text
        className="flex-1 text-right text-sm font-semibold"
        style={{ color: colors.text }}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * Section heading.
 */
function SectionTitle({
  title,
  isDark,
}: {
  title: string;
  isDark: boolean;
}) {
  return (
    <Text
      className="mb-4 mt-2 text-lg font-bold"
      style={{
        color: isDark ? "#ffffff" : "#111827",
      }}
    >
      {title}
    </Text>
  );
}

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?:
    | "default"
    | "email-address"
    | "phone-pad"
    | "numeric";
  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";
  isDark: boolean;
}

/**
 * Reusable themed text input.
 */
function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "sentences",
  isDark,
}: InputFieldProps) {
  return (
    <View className="mb-5">
      <Text
        className="mb-2 text-sm font-medium"
        style={{
          color: isDark ? "#d4d4d4" : "#374151",
        }}
      >
        {label}
      </Text>

      <TextInput
        className="rounded-xl border px-4 py-3.5 text-base"
        style={{
          borderColor: isDark ? "#404040" : "#d1d5db",
          backgroundColor: isDark ? "#171717" : "#ffffff",
          color: isDark ? "#ffffff" : "#111827",
        }}
        placeholder={placeholder}
        placeholderTextColor={
          isDark ? "#737373" : "#9ca3af"
        }
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
  );
}

interface PhoneFieldProps {
  label: string;
  value: string;
  countryCode: string;
  countryIso: CountryCode;
  onChangeText: (value: string) => void;
  onCountryChange: (
    iso: CountryCode,
    callingCode: string,
  ) => void;
  isDark: boolean;
}

/**
 * Editable phone field with an international country picker.
 */
function PhoneField({
  label,
  value,
  countryCode,
  countryIso,
  onChangeText,
  onCountryChange,
  isDark,
}: PhoneFieldProps) {
  const [
    countryPickerVisible,
    setCountryPickerVisible,
  ] = useState(false);

  const formattedCountryCode = countryCode.startsWith("+")
    ? countryCode
    : `+${countryCode}`;

  const textColor = isDark ? "#ffffff" : "#111827";
  const mutedColor = isDark ? "#a3a3a3" : "#6b7280";

  return (
    <View className="mb-5">
      <Text
        className="mb-2 text-sm font-medium"
        style={{
          color: isDark ? "#d4d4d4" : "#374151",
        }}
      >
        {label}
      </Text>

      <View
        className="h-[52px] w-full flex-row items-center overflow-hidden rounded-xl border"
        style={{
          borderColor: isDark ? "#404040" : "#d1d5db",
          backgroundColor: isDark ? "#171717" : "#ffffff",
        }}
      >
        <TouchableOpacity
          onPress={() => setCountryPickerVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`Select country calling code, currently ${formattedCountryCode}`}
          accessibilityHint="Opens the country picker"
          className="h-full flex-row items-center pl-3 pr-2"
          style={{ flexShrink: 0 }}
        >
          <CountryPicker
            countryCode={countryIso}
            withFilter
            withFlag
            withEmoji
            withCallingCode
            withCountryNameButton={false}
            withCallingCodeButton={false}
            visible={countryPickerVisible}
            onClose={() => setCountryPickerVisible(false)}
            onSelect={(country) => {
              const callingCode = country.callingCode?.[0];

              if (callingCode) {
                onCountryChange(
                  country.cca2,
                  `+${callingCode.replace(/^\+/, "")}`,
                );
              }

              setCountryPickerVisible(false);
            }}
            theme={{
              backgroundColor: isDark ? "#171717" : "#ffffff",
              onBackgroundTextColor: textColor,
              fontSize: 16,
            }}
          />

          <Text
            className="ml-1 text-sm font-semibold"
            style={{ color: textColor }}
            numberOfLines={1}
          >
            {formattedCountryCode}
          </Text>

          <Ionicons
            name="chevron-down"
            size={14}
            color={mutedColor}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        <View
          className="h-7 w-px"
          style={{
            backgroundColor: isDark ? "#404040" : "#e5e7eb",
          }}
        />

        <TextInput
          className="h-full flex-1 px-3 py-0 text-base"
          style={{
            color: textColor,
            minWidth: 0,
            margin: 0,
            textAlignVertical: "center",
          }}
          placeholder="Phone number"
          placeholderTextColor={
            isDark ? "#737373" : "#9ca3af"
          }
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

interface SelectFieldProps {
  label: string;
  value: string | null;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
  isDark: boolean;
}

/**
 * Dropdown-style field whose options are shown in the selector modal.
 */
function SelectField({
  label,
  value,
  placeholder,
  onPress,
  disabled = false,
  isDark,
}: SelectFieldProps) {
  const textColor = isDark ? "#ffffff" : "#111827";
  const borderColor = isDark ? "#404040" : "#d1d5db";

  return (
    <View className="mb-5">
      <Text
        className="mb-2 text-sm font-medium"
        style={{
          color: isDark ? "#d4d4d4" : "#374151",
        }}
      >
        {label}
      </Text>

      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        accessibilityState={{ disabled }}
        className="min-h-12 flex-row items-center justify-between rounded-xl border px-4 py-3.5"
        style={{
          borderColor: disabled
            ? isDark
              ? "#303030"
              : "#e5e7eb"
            : borderColor,
          backgroundColor: disabled
            ? isDark
              ? "#121212"
              : "#f3f4f6"
            : isDark
              ? "#171717"
              : "#ffffff",
        }}
      >
        <Text
          className="flex-1 text-base"
          style={{
            color: value
              ? textColor
              : disabled
                ? isDark
                  ? "#525252"
                  : "#9ca3af"
                : isDark
                  ? "#737373"
                  : "#9ca3af",
          }}
        >
          {value || placeholder}
        </Text>

        <Ionicons
          name="chevron-down"
          size={18}
          color={
            disabled
              ? isDark
                ? "#525252"
                : "#9ca3af"
              : isDark
                ? "#a3a3a3"
                : "#6b7280"
          }
        />
      </TouchableOpacity>
    </View>
  );
}

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  isDark: boolean;
}

/**
 * Selectable radio-style button.
 */
function RadioButton({
  label,
  selected,
  onPress,
  isDark,
}: RadioButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      className="min-h-12 flex-1 flex-row items-center rounded-xl border px-3 py-3"
      style={{
        borderColor: selected
          ? "#dc2626"
          : isDark
            ? "#404040"
            : "#d1d5db",
        backgroundColor: selected
          ? isDark
            ? "#450a0a"
            : "#fef2f2"
          : isDark
            ? "#171717"
            : "#ffffff",
      }}
    >
      <View
        className="mr-2 h-5 w-5 items-center justify-center rounded-full border"
        style={{
          borderColor: selected
            ? "#ef4444"
            : isDark
              ? "#737373"
              : "#9ca3af",
        }}
      >
        {selected && (
          <View className="h-2.5 w-2.5 rounded-full bg-red-500" />
        )}
      </View>

      <Text
        className="flex-1 text-sm"
        style={{
          color: selected
            ? isDark
              ? "#ffffff"
              : "#991b1b"
            : isDark
              ? "#d4d4d4"
              : "#374151",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
