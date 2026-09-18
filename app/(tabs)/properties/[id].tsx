import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/app/components/auth/AuthContext";

type PropertyType = "Residential" | "Commercial";

type Property = {
  id: string;
  title: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  price: number;
  location: string;
  listingType: "Rent" | "Sale";
  category: string;
  image: string;
  description: string;
};

const PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Modern Commercial Property",
    type: "Commercial",
    bedrooms: 6,
    bathrooms: 2,
    price: 400000,
    location: "Mzuzu CBD",
    listingType: "Rent",
    category: "Featured",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    description:
      "A modern commercial property located in the heart of Mzuzu CBD. The property offers spacious rooms suitable for offices, retail businesses, and other commercial activities.",
  },
  {
    id: "2",
    title: "Comfortable Residential Home",
    type: "Residential",
    bedrooms: 4,
    bathrooms: 1,
    price: 200000,
    location: "Blantyre CBD",
    listingType: "Rent",
    category: "New to Market",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    description:
      "A comfortable residential home in Blantyre CBD with spacious living areas, bedrooms, and convenient access to shops, schools, and other amenities.",
  },
  {
    id: "3",
    title: "Prime Commercial Building",
    type: "Commercial",
    bedrooms: 8,
    bathrooms: 3,
    price: 750000,
    location: "Lilongwe CBD",
    listingType: "Sale",
    category: "Open Houses",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    description:
      "A prime commercial building in Lilongwe CBD. This property provides excellent space for businesses, offices, and investment purposes.",
  },
  {
    id: "4",
    title: "Family Home in Zomba",
    type: "Residential",
    bedrooms: 3,
    bathrooms: 2,
    price: 150000,
    location: "Zomba Town",
    listingType: "Rent",
    category: "Most Viewed",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    description:
      "A beautiful family home located in Zomba Town. The property offers a peaceful environment and practical living spaces for a family.",
  },
  {
    id: "5",
    title: "Large Commercial Property",
    type: "Commercial",
    bedrooms: 10,
    bathrooms: 4,
    price: 1200000,
    location: "Mzuzu CBD",
    listingType: "Sale",
    category: "Featured",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    description:
      "A large commercial property in Mzuzu CBD with multiple rooms and excellent potential for business operations or investment.",
  },
  {
    id: "6",
    title: "Spacious Residential Property",
    type: "Residential",
    bedrooms: 5,
    bathrooms: 3,
    price: 350000,
    location: "Blantyre CBD",
    listingType: "Rent",
    category: "Featured",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    description:
      "A spacious residential property in Blantyre CBD featuring comfortable bedrooms, bathrooms, and generous living spaces.",
  },
  {
    id: "7",
    title: "Modern Home in Area 43",
    type: "Residential",
    bedrooms: 4,
    bathrooms: 2,
    price: 280000,
    location: "Area 43 Lilongwe",
    listingType: "Rent",
    category: "New to Market",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    description:
      "A modern residential home in Area 43, Lilongwe. It offers comfortable accommodation in a desirable residential location.",
  },
  {
    id: "8",
    title: "Commercial Property in Area 3",
    type: "Commercial",
    bedrooms: 5,
    bathrooms: 2,
    price: 900000,
    location: "Area 3 Lilongwe",
    listingType: "Sale",
    category: "Featured",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
    description:
      "A commercial property located in Area 3, Lilongwe. The property is suitable for offices, business premises, and investment.",
  },
  {
    id: "9",
    title: "Beautiful Home in Area 18",
    type: "Residential",
    bedrooms: 3,
    bathrooms: 2,
    price: 180000,
    location: "Area 18 Lilongwe",
    listingType: "Rent",
    category: "Most Viewed",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
    description:
      "A beautiful residential home in Area 18, Lilongwe. The property provides a comfortable environment for individuals and families.",
  },
  {
    id: "10",
    title: "Spacious Nyambadwe Home",
    type: "Residential",
    bedrooms: 6,
    bathrooms: 3,
    price: 500000,
    location: "Nyambadwe Blantyre",
    listingType: "Rent",
    category: "Properties in My Location",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    description:
      "A spacious home in Nyambadwe, Blantyre. The property features large living areas and multiple bedrooms suitable for a family.",
  },
  {
    id: "11",
    title: "Commercial Building in Blantyre",
    type: "Commercial",
    bedrooms: 8,
    bathrooms: 4,
    price: 1500000,
    location: "Blantyre CBD",
    listingType: "Sale",
    category: "Open Houses",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    description:
      "A commercial building in Blantyre CBD offering substantial space for offices, retail, and other commercial activities.",
  },
  {
    id: "12",
    title: "Affordable Home in Area 25",
    type: "Residential",
    bedrooms: 2,
    bathrooms: 1,
    price: 120000,
    location: "Area 25 Lilongwe",
    listingType: "Rent",
    category: "New to Market",
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80",
    description:
      "An affordable residential home in Area 25, Lilongwe. It provides practical living space at an accessible rental price.",
  },
  {
    id: "13",
    title: "Premium Home on Kaunda Road",
    type: "Residential",
    bedrooms: 5,
    bathrooms: 3,
    price: 450000,
    location: "Kaunda Road Lilongwe",
    listingType: "Sale",
    category: "Featured",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    description:
      "A premium residential property situated along Kaunda Road in Lilongwe. The property offers quality accommodation and modern living spaces.",
  },
  {
    id: "14",
    title: "Large Mzuzu Commercial Building",
    type: "Commercial",
    bedrooms: 12,
    bathrooms: 5,
    price: 2000000,
    location: "Mzuzu CBD",
    listingType: "Sale",
    category: "Most Viewed",
    image:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80",
    description:
      "A large commercial building in Mzuzu CBD with extensive space and strong potential for commercial investment.",
  },
  {
    id: "15",
    title: "Family Home in Chilomoni",
    type: "Residential",
    bedrooms: 4,
    bathrooms: 2,
    price: 300000,
    location: "Chilomoni Blantyre",
    listingType: "Rent",
    category: "Open Houses",
    image:
      "https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1200&q=80",
    description:
      "A family-friendly residential property in Chilomoni, Blantyre. It provides comfortable accommodation with convenient access to local amenities.",
  },
  {
    id: "16",
    title: "Large Residential Property in Area 47",
    type: "Residential",
    bedrooms: 7,
    bathrooms: 4,
    price: 850000,
    location: "Area 47 Lilongwe",
    listingType: "Sale",
    category: "Properties in My Location",
    image:
      "https://images.unsplash.com/photo-1600047509782-20d39509f26d?auto=format&fit=crop&w=1200&q=80",
    description:
      "A large residential property in Area 47, Lilongwe. The home offers generous accommodation and is suitable for a large family.",
  },
];

const formatPrice = (price: number, listingType: Property["listingType"]) => {
  const formatted = new Intl.NumberFormat("en-MW").format(price);

  return listingType === "Rent"
    ? `MWK ${formatted} / month`
    : `MWK ${formatted}`;
};

export default function PropertyDetails() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  const { isLoggedIn } = useAuth();

  const [imageLoading, setImageLoading] = useState(true);

  const property = PROPERTIES.find((item) => item.id === id);

  /*
   * If the user is not logged in, do not show the property details.
   */
  if (!isLoggedIn) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />

        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-[#241616]">
            <Ionicons name="lock-closed-outline" size={40} color="#f87171" />
          </View>

          <Text className="mt-6 text-center text-2xl font-bold text-white">
            Login Required
          </Text>

          <Text className="mt-3 text-center text-sm leading-6 text-gray-400">
            Please login or register to view the full property information.
          </Text>

          <Pressable
            onPress={() => router.back()}
            className="mt-7 w-full rounded-xl bg-red-600 py-4"
          >
            <Text className="text-center text-base font-bold text-white">
              Back to Properties
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * If the property ID does not exist.
   */
  if (!property) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />

        <View className="flex-1 items-center justify-center px-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-[#241616]">
            <Ionicons name="home-outline" size={40} color="#f87171" />
          </View>

          <Text className="mt-6 text-center text-2xl font-bold text-white">
            Property Not Found
          </Text>

          <Text className="mt-3 text-center text-sm leading-6 text-gray-400">
            The property you are looking for could not be found.
          </Text>

          <Pressable
            onPress={() => router.back()}
            className="mt-7 w-full rounded-xl bg-red-600 py-4"
          >
            <Text className="text-center text-base font-bold text-white">
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
          >
            <Ionicons name="arrow-back" size={23} color="#ffffff" />
          </Pressable>

          <Text
            numberOfLines={1}
            className="mx-4 flex-1 text-center text-lg font-bold text-white"
          >
            Property Details
          </Text>

          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]">
            <Ionicons name="heart-outline" size={23} color="#ffffff" />
          </Pressable>
        </View>

        {/* Property Image */}
        <View className="mx-5 overflow-hidden rounded-2xl bg-[#171717]">
          <View className="relative h-72 w-full">
            <Image
              source={{ uri: property.image }}
              className="h-full w-full"
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />

            {imageLoading && (
              <View className="absolute inset-0 items-center justify-center bg-[#171717]">
                <ActivityIndicator size="large" color="#ef4444" />
              </View>
            )}

            {/* Listing Type */}
            <View className="absolute left-4 top-4 rounded-lg bg-red-600 px-3 py-2">
              <Text className="text-xs font-bold text-white">
                For {property.listingType}
              </Text>
            </View>

            {/* Category */}
            <View className="absolute bottom-4 left-4 rounded-lg bg-black/70 px-3 py-2">
              <Text className="text-xs font-semibold text-white">
                {property.category}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Information */}
        <View className="px-5 pt-6">
          <Text className="text-2xl font-bold leading-8 text-white">
            {property.title}
          </Text>

          <View className="mt-3 flex-row items-center">
            <Ionicons name="location-outline" size={18} color="#f87171" />

            <Text className="ml-2 flex-1 text-sm text-gray-400">
              {property.location}
            </Text>
          </View>

          {/* Price */}
          <View className="mt-5 rounded-2xl bg-[#171717] p-5">
            <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {property.listingType === "Rent"
                ? "Monthly Rent"
                : "Property Price"}
            </Text>

            <Text className="mt-1 text-2xl font-bold text-red-500">
              {formatPrice(property.price, property.listingType)}
            </Text>
          </View>

          {/* Property Stats */}
          <View className="mt-4 flex-row">
            <View className="mr-2 flex-1 rounded-2xl bg-[#171717] p-4">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#241616]">
                <Ionicons name="bed-outline" size={21} color="#f87171" />
              </View>

              <Text className="mt-3 text-lg font-bold text-white">
                {property.bedrooms}
              </Text>

              <Text className="mt-1 text-xs text-gray-500">Bedrooms</Text>
            </View>

            <View className="ml-2 flex-1 rounded-2xl bg-[#171717] p-4">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#241616]">
                <Ionicons name="water-outline" size={21} color="#f87171" />
              </View>

              <Text className="mt-3 text-lg font-bold text-white">
                {property.bathrooms}
              </Text>

              <Text className="mt-1 text-xs text-gray-500">Bathrooms</Text>
            </View>
          </View>

          {/* Property Type */}
          <View className="mt-4 flex-row rounded-2xl bg-[#171717] p-4">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-[#241616]">
              <Ionicons
                name={
                  property.type === "Commercial"
                    ? "business-outline"
                    : "home-outline"
                }
                size={22}
                color="#f87171"
              />
            </View>

            <View className="ml-4 justify-center">
              <Text className="text-xs text-gray-500">Property Type</Text>

              <Text className="mt-1 text-base font-semibold text-white">
                {property.type}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mt-7">
            <Text className="text-xl font-bold text-white">Description</Text>

            <Text className="mt-3 text-sm leading-7 text-gray-400">
              {property.description}
            </Text>
          </View>

          {/* Location */}
          <View className="mt-7">
            <Text className="text-xl font-bold text-white">Location</Text>

            <View className="mt-3 flex-row items-center rounded-2xl bg-[#171717] p-4">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#241616]">
                <Ionicons name="location" size={22} color="#f87171" />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-white">
                  {property.location}
                </Text>

                <Text className="mt-1 text-xs text-gray-500">Malawi</Text>
              </View>
            </View>
          </View>

          {/* Listing Information */}
          <View className="mt-7">
            <Text className="text-xl font-bold text-white">
              Listing Information
            </Text>

            <View className="mt-3 overflow-hidden rounded-2xl bg-[#171717]">
              <View className="flex-row items-center justify-between border-b border-[#252525] px-4 py-4">
                <Text className="text-sm text-gray-500">Listing Type</Text>

                <Text className="text-sm font-semibold text-white">
                  For {property.listingType}
                </Text>
              </View>

              <View className="flex-row items-center justify-between border-b border-[#252525] px-4 py-4">
                <Text className="text-sm text-gray-500">Property Type</Text>

                <Text className="text-sm font-semibold text-white">
                  {property.type}
                </Text>
              </View>

              <View className="flex-row items-center justify-between border-b border-[#252525] px-4 py-4">
                <Text className="text-sm text-gray-500">Category</Text>

                <Text className="text-sm font-semibold text-white">
                  {property.category}
                </Text>
              </View>

              <View className="flex-row items-center justify-between px-4 py-4">
                <Text className="text-sm text-gray-500">Location</Text>

                <Text className="max-w-[55%] text-right text-sm font-semibold text-white">
                  {property.location}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact / Action */}
          <View className="mt-8">
            <Pressable
              onPress={() => {
                // Add your contact/booking functionality here later.
              }}
              className="flex-row items-center justify-center rounded-xl bg-red-600 py-4"
            >
              <Ionicons name="call-outline" size={21} color="#ffffff" />

              <Text className="ml-2 text-base font-bold text-white">
                Contact Agent
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
