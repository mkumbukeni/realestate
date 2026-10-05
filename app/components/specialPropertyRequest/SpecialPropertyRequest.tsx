
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function SpecialPropertyRequestScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [whatsapp, setWhatsapp] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");

  const [listingType, setListingType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [activeDropdown, setActiveDropdown] =
    useState<string | null>(null);

  const listingTypes = ["For Sale", "For Rent"];

  const propertyTypes = [
    "Residential",
    "Commercial",
    "Industrial",
    "Agricultural",
    "Land",
  ];

  const regions = [
    "Central Region",
    "Northern Region",
    "Southern Region",
  ];

  const districts = [
    "Lilongwe",
    "Blantyre",
    "Mzuzu",
    "Mchinji",
    "Dedza",
    "Salima",
    "Kasungu",
    "Nkhotakota",
  ];

  const areas = [
    "Area 1",
    "Area 2",
    "Area 3",
    "Area 10",
    "Area 12",
    "Area 18",
    "Area 25",
  ];

  const Dropdown = ({
    label,
    value,
    placeholder,
    options,
    name,
    disabled = false,
    onSelect,
  }: {
    label: string;
    value: string;
    placeholder: string;
    options: string[];
    name: string;
    disabled?: boolean;
    onSelect: (value: string) => void;
  }) => {
    const isOpen = activeDropdown === name;

    return (
      <View className="mb-4 flex-1">
        {/* LABEL */}
        <Text
          className={
            isDark
              ? "mb-2 text-[14px] text-gray-200"
              : "mb-2 text-[14px] text-gray-700"
          }
        >
          {label}
        </Text>

        {/* DROPDOWN BUTTON */}
        <Pressable
          disabled={disabled}
          onPress={() =>
            setActiveDropdown(isOpen ? null : name)
          }
          className={`h-[48px] flex-row items-center justify-between rounded-md border px-3 ${
            disabled
              ? isDark
                ? "border-[#242424] bg-[#101010]"
                : "border-gray-200 bg-gray-100"
              : isDark
                ? "border-[#303030] bg-[#191919]"
                : "border-gray-300 bg-white"
          }`}
        >
          <Text
            numberOfLines={1}
            className={`flex-1 text-[14px] ${
              value
                ? isDark
                  ? "text-gray-100"
                  : "text-gray-900"
                : isDark
                  ? "text-gray-500"
                  : "text-gray-400"
            }`}
          >
            {value || placeholder}
          </Text>

          <Ionicons
            name={
              isOpen
                ? "chevron-up"
                : "chevron-down"
            }
            size={17}
            color={
              disabled
                ? isDark
                  ? "#444444"
                  : "#aaaaaa"
                : isDark
                  ? "#777777"
                  : "#666666"
            }
          />
        </Pressable>

        {/* DROPDOWN OPTIONS */}
        {isOpen && !disabled && (
          <View
            className={`absolute left-0 right-0 top-[75px] z-50 overflow-hidden rounded-md border ${
              isDark
                ? "border-[#383838] bg-[#202020]"
                : "border-gray-200 bg-white"
            }`}
          >
            {options.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  onSelect(option);
                  setActiveDropdown(null);
                }}
                className={
                  isDark
                    ? "border-b border-[#303030] px-3 py-3 active:bg-[#303030]"
                    : "border-b border-gray-200 px-3 py-3 active:bg-gray-100"
                }
              >
                <Text
                  className={
                    isDark
                      ? "text-[14px] text-gray-200"
                      : "text-[14px] text-gray-800"
                  }
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleSubmit = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      Alert.alert(
        "Missing Details",
        "Please fill in your contact information."
      );
      return;
    }

    if (
      !listingType ||
      !propertyType ||
      !region
    ) {
      Alert.alert(
        "Missing Details",
        "Please select the listing type, property type and region."
      );
      return;
    }

    Alert.alert(
      "Request Submitted",
      "Your special property request has been submitted successfully."
    );
  };

  return (
    <SafeAreaView
      className={
        isDark
          ? "flex-1 bg-[#080808]"
          : "flex-1 bg-gray-100"
      }
    >
      {/* STATUS BAR */}
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={
          isDark
            ? "#080808"
            : "#f3f4f6"
        }
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 0 : 0
        }
      >
        {/* FORM CONTAINER */}
        <View
          className={`mx-3 mt-[78px] mb-2 flex-1 overflow-hidden rounded-xl border ${
            isDark
              ? "border-[#303030] bg-[#0b0b0b]"
              : "border-gray-200 bg-white"
          }`}
        >
          {/* FIXED TITLE */}
          <View
            className={`flex items-center border-b px-4 py-4 ${
              isDark
                ? "border-[#303030]"
                : "border-gray-200"
            }`}
          >
            <Text className="text-[20px] font-bold text-red-600">
              FILL YOUR DETAILS
            </Text>
          </View>

          {/* SCROLLABLE FORM */}
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios"
                ? "interactive"
                : "on-drag"
            }
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 4,
              paddingBottom: 120,
            }}
          >
            {/* CONTACT INFORMATION */}

            <Text
              className={
                isDark
                  ? "mb-5 mt-3 text-[18px] font-bold text-gray-200"
                  : "mb-5 mt-3 text-[18px] font-bold text-gray-800"
              }
            >
              Contact Information
            </Text>

            {/* FIRST / LAST NAME */}

            <View className="flex-col gap-4 md:flex-row">
              <View className="flex-1">
                <Text
                  className={
                    isDark
                      ? "mb-2 text-[14px] text-gray-200"
                      : "mb-2 text-[14px] text-gray-700"
                  }
                >
                  First Name
                </Text>

                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  returnKeyType="next"
                  placeholder=""
                  placeholderTextColor={
                    isDark ? "#777777" : "#999999"
                  }
                  className={`h-[48px] rounded-md border px-3 text-[14px] ${
                    isDark
                      ? "border-[#303030] bg-[#191919] text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </View>

              <View className="flex-1">
                <Text
                  className={
                    isDark
                      ? "mb-2 text-[14px] text-gray-200"
                      : "mb-2 text-[14px] text-gray-700"
                  }
                >
                  Last Name
                </Text>

                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  returnKeyType="next"
                  placeholder=""
                  placeholderTextColor={
                    isDark ? "#777777" : "#999999"
                  }
                  className={`h-[48px] rounded-md border px-3 text-[14px] ${
                    isDark
                      ? "border-[#303030] bg-[#191919] text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </View>
            </View>

            {/* EMAIL / PHONE / WHATSAPP */}

            <View className="mt-4 flex-col gap-4 md:flex-row">
              {/* EMAIL */}

              <View className="flex-1">
                <Text
                  className={
                    isDark
                      ? "mb-2 text-[14px] text-gray-200"
                      : "mb-2 text-[14px] text-gray-700"
                  }
                >
                  Email
                </Text>

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  placeholder="example@gmail.com"
                  placeholderTextColor={
                    isDark ? "#777777" : "#999999"
                  }
                  className={`h-[48px] rounded-md border px-3 text-[14px] ${
                    isDark
                      ? "border-[#303030] bg-[#191919] text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </View>

              {/* PHONE */}

              <View className="flex-1">
                <Text
                  className={
                    isDark
                      ? "mb-2 text-[14px] text-gray-200"
                      : "mb-2 text-[14px] text-gray-700"
                  }
                >
                  Phone
                </Text>

                <View
                  className={`h-[48px] flex-row items-center rounded-md border ${
                    isDark
                      ? "border-[#454545] bg-[#191919]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <View
                    className={`flex-row items-center border-r px-3 ${
                      isDark
                        ? "border-[#383838]"
                        : "border-gray-200"
                    }`}
                  >
                    <Text className="text-[18px]">
                      🇲🇼
                    </Text>

                    <Text
                      className={
                        isDark
                          ? "ml-1 text-[13px] text-gray-300"
                          : "ml-1 text-[13px] text-gray-600"
                      }
                    >
                      +265
                    </Text>
                  </View>

                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    placeholder=""
                    placeholderTextColor={
                      isDark ? "#777777" : "#999999"
                    }
                    className={`flex-1 px-3 text-[14px] ${
                      isDark
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  />
                </View>
              </View>

              {/* WHATSAPP */}

              <View className="flex-1">
                <View className="mb-2 flex-row items-center">
                  <Pressable
                    onPress={() =>
                      setWhatsapp(!whatsapp)
                    }
                    className={`mr-2 h-5 w-5 items-center justify-center rounded border ${
                      whatsapp
                        ? "border-red-600 bg-red-600"
                        : isDark
                          ? "border-[#383838] bg-[#191919]"
                          : "border-gray-300 bg-white"
                    }`}
                  >
                    {whatsapp && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="#ffffff"
                      />
                    )}
                  </Pressable>

                  <Text
                    className={
                      isDark
                        ? "text-[14px] text-gray-200"
                        : "text-[14px] text-gray-700"
                    }
                  >
                    Notify me via WhatsApp
                  </Text>

                  <Text className="ml-1 text-[13px]">
                    🟢
                  </Text>
                </View>

                <View
                  className={`h-[48px] flex-row items-center rounded-md border ${
                    whatsapp
                      ? isDark
                        ? "border-[#454545] bg-[#191919]"
                        : "border-gray-300 bg-white"
                      : isDark
                        ? "border-[#242424] bg-[#101010]"
                        : "border-gray-200 bg-gray-100"
                  }`}
                >
                  <View
                    className={`flex-row items-center border-r px-3 ${
                      isDark
                        ? "border-[#383838]"
                        : "border-gray-200"
                    }`}
                  >
                    <Text className="text-[18px]">
                      🇲🇼
                    </Text>

                    <Text
                      className={
                        isDark
                          ? "ml-1 text-[13px] text-gray-300"
                          : "ml-1 text-[13px] text-gray-600"
                      }
                    >
                      +265
                    </Text>
                  </View>

                  <TextInput
                    value={whatsappPhone}
                    onChangeText={setWhatsappPhone}
                    editable={whatsapp}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    placeholder=""
                    placeholderTextColor={
                      isDark ? "#777777" : "#999999"
                    }
                    className={`flex-1 px-3 text-[14px] ${
                      isDark
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  />
                </View>
              </View>
            </View>

            {/* PROPERTY SPECIFICATIONS */}

            <Text
              className={
                isDark
                  ? "mb-5 mt-7 text-[18px] font-bold text-gray-200"
                  : "mb-5 mt-7 text-[18px] font-bold text-gray-800"
              }
            >
              Property Specifications
            </Text>

            {/* LISTING / PROPERTY / REGION */}

            <View className="flex-col gap-4 md:flex-row">
              <Dropdown
                label="Listing Type"
                value={listingType}
                placeholder="Select listing type"
                options={listingTypes}
                name="listing"
                onSelect={setListingType}
              />

              <Dropdown
                label="Property Type"
                value={propertyType}
                placeholder="Select property type"
                options={propertyTypes}
                name="property"
                onSelect={setPropertyType}
              />

              <Dropdown
                label="Region"
                value={region}
                placeholder="Select region"
                options={regions}
                name="region"
                onSelect={(value) => {
                  setRegion(value);
                  setDistrict("");
                  setArea("");
                }}
              />
            </View>

            {/* DISTRICT / AREAS */}

            <View className="flex-col gap-4 md:flex-row">
              <Dropdown
                label="District"
                value={district}
                placeholder={
                  region
                    ? "Select District"
                    : "Select Region first"
                }
                options={districts}
                name="district"
                disabled={!region}
                onSelect={(value) => {
                  setDistrict(value);
                  setArea("");
                }}
              />

              <View className="flex-[2]">
                <Dropdown
                  label="Areas"
                  value={area}
                  placeholder={
                    district
                      ? "Select Areas..."
                      : "Select District first"
                  }
                  options={areas}
                  name="area"
                  disabled={!district}
                  onSelect={setArea}
                />
              </View>
            </View>

            {/* PRICE RANGE */}

            <Text
              className={
                isDark
                  ? "mb-2 text-[14px] text-gray-200"
                  : "mb-2 text-[14px] text-gray-700"
              }
            >
              Price Range
            </Text>

            <View className="flex-row items-center">
              <TextInput
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
                returnKeyType="next"
                placeholder="min price"
                placeholderTextColor={
                  isDark ? "#777777" : "#999999"
                }
                className={`h-[48px] flex-1 rounded-md border px-3 text-[14px] ${
                  isDark
                    ? "border-[#303030] bg-[#191919] text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              />

              <Text
                className={
                  isDark
                    ? "mx-2 text-gray-400"
                    : "mx-2 text-gray-500"
                }
              >
                -
              </Text>

              <TextInput
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                returnKeyType="done"
                placeholder="max price"
                placeholderTextColor={
                  isDark ? "#777777" : "#999999"
                }
                className={`h-[48px] flex-1 rounded-md border px-3 text-[14px] ${
                  isDark
                    ? "border-[#303030] bg-[#191919] text-white"
                    : "border-gray-300 bg-white text-gray-900"
                }`}
              />
            </View>

            {/* SUBMIT */}

            <Pressable
              onPress={handleSubmit}
              className="mt-4 h-[44px] items-center justify-center rounded-md bg-red-600 active:bg-red-700"
            >
              <Text className="text-[14px] font-medium text-white">
                Submit
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

