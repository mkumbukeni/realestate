import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function SpecialPropertyRequestScreen() {
  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Dropdown State
  |--------------------------------------------------------------------------
  */

  const [activeDropdown, setActiveDropdown] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Dropdown Options
  |--------------------------------------------------------------------------
  */

  const listingTypes = [
    "For Sale",
    "For Rent",
  ];

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

  /*
  |--------------------------------------------------------------------------
  | Dropdown Component
  |--------------------------------------------------------------------------
  */

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
        <Text className="mb-2 text-[14px] text-gray-200">
          {label}
        </Text>

        <Pressable
          disabled={disabled}
          onPress={() =>
            setActiveDropdown(
              isOpen ? null : name
            )
          }
          className={`h-[48px] flex-row items-center justify-between rounded-md border px-3 ${
            disabled
              ? "border-[#242424] bg-[#101010]"
              : "border-[#303030] bg-[#191919]"
          }`}
        >
          <Text
            numberOfLines={1}
            className={`flex-1 text-[14px] ${
              value
                ? "text-gray-100"
                : "text-gray-500"
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
              disabled ? "#444444" : "#777777"
            }
          />
        </Pressable>

        {isOpen && !disabled && (
          <View className="absolute left-0 right-0 top-[75px] z-50 overflow-hidden rounded-md border border-[#383838] bg-[#202020]">
            {options.map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  onSelect(option);
                  setActiveDropdown(null);
                }}
                className="border-b border-[#303030] px-3 py-3 active:bg-[#303030]"
              >
                <Text className="text-[14px] text-gray-200">
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

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

    if (!listingType || !propertyType || !region) {
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

  /*
  |--------------------------------------------------------------------------
  | Screen
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView className="flex-1 bg-[#080808]">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080808"
      />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 35,
        }}
      >
        <View className="mx-3 mt-2 overflow-visible rounded-xl border border-[#303030] bg-[#0b0b0b] px-4 pb-5 pt-4">
          {/* =================================================
              TITLE
          ================================================== */}

          <Text className="text-[20px] font-bold text-red-600">
            FILL YOUR DETAILS
          </Text>

          {/* =================================================
              CONTACT INFORMATION
          ================================================== */}

          <Text className="mb-5 mt-7 text-[18px] font-bold text-gray-200">
            Contact Information
          </Text>

          {/* First / Last Name */}

          <View className="flex-col gap-4 md:flex-row">
            <View className="flex-1">
              <Text className="mb-2 text-[14px] text-gray-200">
                First Name
              </Text>

              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder=""
                placeholderTextColor="#777777"
                className="h-[48px] rounded-md border border-[#303030] bg-[#191919] px-3 text-[14px] text-white"
              />
            </View>

            <View className="flex-1">
              <Text className="mb-2 text-[14px] text-gray-200">
                Last Name
              </Text>

              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder=""
                placeholderTextColor="#777777"
                className="h-[48px] rounded-md border border-[#303030] bg-[#191919] px-3 text-[14px] text-white"
              />
            </View>
          </View>

          {/* Email / Phone / WhatsApp */}

          <View className="mt-4 flex-col gap-4 md:flex-row">
            {/* Email */}

            <View className="flex-1">
              <Text className="mb-2 text-[14px] text-gray-200">
                Email
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="example@gmail.com"
                placeholderTextColor="#777777"
                className="h-[48px] rounded-md border border-[#303030] bg-[#191919] px-3 text-[14px] text-white"
              />
            </View>

            {/* Phone */}

            <View className="flex-1">
              <Text className="mb-2 text-[14px] text-gray-200">
                Phone
              </Text>

              <View className="h-[48px] flex-row items-center rounded-md border border-[#454545] bg-[#191919]">
                <View className="flex-row items-center border-r border-[#383838] px-3">
                  <Text className="text-[18px]">
                    🇲🇼
                  </Text>

                  <Text className="ml-1 text-[13px] text-gray-300">
                    +265
                  </Text>
                </View>

                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder=""
                  placeholderTextColor="#777777"
                  className="flex-1 px-3 text-[14px] text-white"
                />
              </View>
            </View>

            {/* WhatsApp */}

            <View className="flex-1">
              <View className="mb-2 flex-row items-center">
                <Pressable
                  onPress={() =>
                    setWhatsapp(!whatsapp)
                  }
                  className={`mr-2 h-5 w-5 items-center justify-center rounded border ${
                    whatsapp
                      ? "border-red-600 bg-red-600"
                      : "border-[#383838] bg-[#191919]"
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

                <Text className="text-[14px] text-gray-200">
                  Notify me via WhatsApp
                </Text>

                <Text className="ml-1 text-[13px]">
                  🟢
                </Text>
              </View>

              <View
                className={`h-[48px] flex-row items-center rounded-md border ${
                  whatsapp
                    ? "border-[#454545] bg-[#191919]"
                    : "border-[#242424] bg-[#101010]"
                }`}
              >
                <View className="flex-row items-center border-r border-[#383838] px-3">
                  <Text className="text-[18px]">
                    🇲🇼
                  </Text>

                  <Text className="ml-1 text-[13px] text-gray-300">
                    +265
                  </Text>
                </View>

                <TextInput
                  value={whatsappPhone}
                  onChangeText={setWhatsappPhone}
                  editable={whatsapp}
                  keyboardType="phone-pad"
                  placeholder=""
                  placeholderTextColor="#777777"
                  className="flex-1 px-3 text-[14px] text-white"
                />
              </View>
            </View>
          </View>

          {/* =================================================
              PROPERTY SPECIFICATIONS
          ================================================== */}

          <Text className="mb-5 mt-7 text-[18px] font-bold text-gray-200">
            Property Specifications
          </Text>

          {/* Listing / Property / Region */}

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

          {/* District / Areas */}

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

          {/* =================================================
              PRICE RANGE
          ================================================== */}

          <Text className="mb-2 text-[14px] text-gray-200">
            Price Range
          </Text>

          <View className="flex-row items-center">
            <TextInput
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="numeric"
              placeholder="min price"
              placeholderTextColor="#777777"
              className="h-[48px] flex-1 rounded-md border border-[#303030] bg-[#191919] px-3 text-[14px] text-white"
            />

            <Text className="mx-2 text-gray-400">
              -
            </Text>

            <TextInput
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
              placeholder="max price"
              placeholderTextColor="#777777"
              className="h-[48px] flex-1 rounded-md border border-[#303030] bg-[#191919] px-3 text-[14px] text-white"
            />
          </View>

          {/* =================================================
              SUBMIT
          ================================================== */}

          <Pressable
            onPress={handleSubmit}
            className="mt-4 h-[44px] items-center justify-center rounded-md bg-red-600 active:bg-red-700"
          >
            <Text className="text-[14px] font-medium text-white">
              Submit
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}