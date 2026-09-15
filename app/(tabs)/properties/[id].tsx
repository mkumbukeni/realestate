
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

const PROPERTIES = [
  {
    id: "1",
    type: "Commercial",
    beds: 6,
    baths: 2,
    price: "MWK 400,000",
    period: "Over a year ago",
    location: "Mzuzu CBD, MZUZU",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=800&fit=crop",
    tag: "Rent",
    category: "Featured Properties",
    title: "Modern Commercial Property",
    description:
      "A spacious commercial property located in Mzuzu CBD. The property is suitable for offices, business operations, retail activities, or investment.",
  },
  {
    id: "2",
    type: "Residential",
    beds: 4,
    baths: 1,
    price: "MWK 200,000",
    period: "Over a year ago",
    location: "Blantyre CBD, BLANTYRE URBAN",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop",
    tag: "Rent",
    category: "New to Market",
    title: "Comfortable Residential Home",
    description:
      "A comfortable residential property in Blantyre CBD with convenient access to shops, services, transport, and other amenities.",
  },
  {
    id: "3",
    type: "Commercial",
    beds: 8,
    baths: 3,
    price: "MWK 750,000",
    period: "6 months ago",
    location: "Lilongwe CBD, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop",
    tag: "Sale",
    category: "Open Houses",
    title: "Prime Commercial Building",
    description:
      "A prime commercial property located in Lilongwe CBD, suitable for business, office space, investment, or other commercial purposes.",
  },
  {
    id: "4",
    type: "Residential",
    beds: 3,
    baths: 2,
    price: "MWK 150,000",
    period: "2 months ago",
    location: "Zomba Town, ZOMBA",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop",
    tag: "Rent",
    category: "Most Viewed",
    title: "Family Home in Zomba",
    description:
      "A residential family home located in Zomba Town. The property provides comfortable living space in a convenient location.",
  },
  {
    id: "5",
    type: "Commercial",
    beds: 10,
    baths: 4,
    price: "MWK 1,200,000",
    period: "1 month ago",
    location: "Mzuzu CBD, MZUZU",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
    tag: "Sale",
    category: "Featured Properties",
    title: "Large Commercial Property",
    description:
      "A large commercial property in Mzuzu CBD offering substantial space for offices, businesses, and investment opportunities.",
  },
  {
    id: "6",
    type: "Residential",
    beds: 5,
    baths: 3,
    price: "MWK 350,000",
    period: "3 weeks ago",
    location: "Blantyre CBD, BLANTYRE URBAN",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop",
    tag: "Rent",
    category: "Featured Properties",
    title: "Spacious Residential Property",
    description:
      "A spacious residential property in Blantyre CBD with five bedrooms and three bathrooms.",
  },
  {
    id: "7",
    type: "Residential",
    beds: 4,
    baths: 2,
    price: "MWK 280,000",
    period: "2 weeks ago",
    location: "Area 43, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
    tag: "Rent",
    category: "New to Market",
    title: "Modern Home in Area 43",
    description:
      "A modern residential home located in Area 43, Lilongwe. The property offers four bedrooms and two bathrooms.",
  },
  {
    id: "8",
    type: "Commercial",
    beds: 5,
    baths: 2,
    price: "MWK 900,000",
    period: "1 week ago",
    location: "Area 3, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=800&fit=crop",
    tag: "Sale",
    category: "Featured Properties",
    title: "Commercial Property in Area 3",
    description:
      "A commercial property in Area 3, Lilongwe, suitable for business operations and investment.",
  },
  {
    id: "9",
    type: "Residential",
    beds: 3,
    baths: 2,
    price: "MWK 180,000",
    period: "5 days ago",
    location: "Area 18, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop",
    tag: "Rent",
    category: "Most Viewed",
    title: "Beautiful Home in Area 18",
    description:
      "A residential property located in Area 18, Lilongwe, offering three bedrooms and two bathrooms.",
  },
  {
    id: "10",
    type: "Residential",
    beds: 6,
    baths: 3,
    price: "MWK 500,000",
    period: "3 days ago",
    location: "Nyambadwe, BLANTYRE URBAN",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop",
    tag: "Rent",
    category: "Properties in My Location",
    title: "Spacious Nyambadwe Home",
    description:
      "A spacious residential property in Nyambadwe, Blantyre, featuring six bedrooms and three bathrooms.",
  },
  {
    id: "11",
    type: "Commercial",
    beds: 8,
    baths: 4,
    price: "MWK 1,500,000",
    period: "1 month ago",
    location: "Blantyre CBD, BLANTYRE URBAN",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=800&fit=crop",
    tag: "Sale",
    category: "Open Houses",
    title: "Commercial Building in Blantyre",
    description:
      "A commercial property located in Blantyre CBD with eight rooms and four bathrooms.",
  },
  {
    id: "12",
    type: "Residential",
    beds: 2,
    baths: 1,
    price: "MWK 120,000",
    period: "4 days ago",
    location: "Area 25, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&h=800&fit=crop",
    tag: "Rent",
    category: "New to Market",
    title: "Affordable Home in Area 25",
    description:
      "An affordable residential property located in Area 25, Lilongwe.",
  },
  {
    id: "13",
    type: "Residential",
    beds: 5,
    baths: 3,
    price: "MWK 450,000",
    period: "2 months ago",
    location: "Kaunda Road, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop",
    tag: "Sale",
    category: "Featured Properties",
    title: "Premium Home on Kaunda Road",
    description:
      "A premium residential property located along Kaunda Road in Lilongwe.",
  },
  {
    id: "14",
    type: "Commercial",
    beds: 12,
    baths: 5,
    price: "MWK 2,000,000",
    period: "2 weeks ago",
    location: "Mzuzu CBD, MZUZU",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop",
    tag: "Sale",
    category: "Most Viewed",
    title: "Large Mzuzu Commercial Building",
    description:
      "A large commercial property in Mzuzu CBD with substantial space for business and investment purposes.",
  },
  {
    id: "15",
    type: "Residential",
    beds: 4,
    baths: 2,
    price: "MWK 300,000",
    period: "1 week ago",
    location: "Chilomoni, BLANTYRE URBAN",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop",
    tag: "Rent",
    category: "Open Houses",
    title: "Family Home in Chilomoni",
    description:
      "A residential family home located in Chilomoni, Blantyre.",
  },
  {
    id: "16",
    type: "Residential",
    beds: 7,
    baths: 4,
    price: "MWK 850,000",
    period: "3 weeks ago",
    location: "Area 47, LILONGWE",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop",
    tag: "Sale",
    category: "Properties in My Location",
    title: "Large Residential Property in Area 47",
    description:
      "A large residential property located in Area 47, Lilongwe, featuring seven bedrooms and four bathrooms.",
  },
];

type Property = (typeof PROPERTIES)[number];

export default function PropertyDetails() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [imageLoading, setImageLoading] = useState(true);

  const property = PROPERTIES.find((item) => item.id === id);

  if (!property) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="home-outline" size={70} color="#555" />

          <Text className="mt-5 text-xl font-bold text-white">
            Property Not Found
          </Text>

          <Text className="mt-2 text-center text-sm text-gray-400">
            The property you are looking for could not be found.
          </Text>

          <Pressable
            onPress={() => router.back()}
            className="mt-6 rounded-xl bg-red-600 px-6 py-3"
          >
            <Text className="font-bold text-white">
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * The image is loaded before the property details are displayed.
   * The Image component is kept mounted while the loader is visible,
   * allowing React Native to download the image in the background.
   */
  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0d0d0d"
      />

      {/* Hidden image loader */}
      {imageLoading && (
        <View className="absolute inset-0 z-50 flex-1 items-center justify-center bg-[#0d0d0d]">
          <ActivityIndicator
            size="large"
            color="#ef4444"
          />

          <Text className="mt-4 text-base font-medium text-gray-300">
            Loading property...
          </Text>

          <Text className="mt-1 text-xs text-gray-500">
            Please wait
          </Text>

          <Image
            source={{ uri: property.image }}
            className="absolute h-0 w-0"
            onLoad={() => {
              setImageLoading(false);
            }}
            onError={(error) => {
              console.log(
                "PROPERTY IMAGE ERROR:",
                error.nativeEvent.error
              );

              /*
               * If the image cannot be loaded, don't leave the
               * user stuck on the loading screen.
               */
              setImageLoading(false);
            }}
          />
        </View>
      )}

      {/* ALL PROPERTY CONTENT APPEARS AFTER IMAGE LOAD */}
      {!imageLoading && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          {/* PROPERTY IMAGE */}
          <View className="relative h-72 w-full bg-[#171717]">
            <Image
              source={{ uri: property.image }}
              className="h-72 w-full"
              resizeMode="cover"
            />

            {/* BACK BUTTON */}
            <Pressable
              onPress={() => router.back()}
              className="absolute left-4 top-4 h-11 w-11 items-center justify-center rounded-full bg-black/70"
            >
              <Ionicons
                name="arrow-back"
                size={23}
                color="#fff"
              />
            </Pressable>

            {/* PROPERTY TAG */}
            <View className="absolute right-4 top-4 rounded-lg bg-red-600 px-4 py-2">
              <Text className="text-sm font-bold text-white">
                {property.tag}
              </Text>
            </View>

            {/* IMAGE LABEL */}
            <View className="absolute bottom-4 right-4 flex-row items-center rounded-lg bg-black/70 px-3 py-2">
              <Ionicons
                name="images-outline"
                size={17}
                color="#fff"
              />

              <Text className="ml-1.5 text-xs font-semibold text-white">
                Property Image
              </Text>
            </View>
          </View>

          {/* MAIN CONTENT */}
          <View className="px-5 pt-5">
            {/* TITLE */}
            <Text className="text-2xl font-bold leading-8 text-white">
              {property.title}
            </Text>

            {/* LOCATION */}
            <View className="mt-3 flex-row items-center">
              <Ionicons
                name="location-outline"
                size={20}
                color="#f87171"
              />

              <Text className="ml-2 flex-1 text-sm text-gray-400">
                {property.location}
              </Text>
            </View>

            {/* PRICE */}
            <View className="mt-5 rounded-xl border border-[#292929] bg-[#171717] p-4">
              <Text className="text-xs text-gray-500">
                PRICE
              </Text>

              <Text className="mt-1 text-2xl font-bold text-white">
                {property.price}
              </Text>

              <Text className="mt-1 text-xs text-gray-500">
                Listed {property.period}
              </Text>
            </View>

            {/* PROPERTY FEATURES */}
            <Text className="mb-3 mt-6 text-lg font-bold text-white">
              Property Details
            </Text>

            <View className="flex-row flex-wrap gap-3">
              {/* TYPE */}
              <View className="w-[48%] rounded-xl border border-[#292929] bg-[#171717] p-4">
                <Ionicons
                  name="business-outline"
                  size={24}
                  color="#f87171"
                />

                <Text className="mt-2 text-xs text-gray-500">
                  PROPERTY TYPE
                </Text>

                <Text className="mt-1 text-sm font-semibold text-white">
                  {property.type}
                </Text>
              </View>

              {/* BEDROOMS */}
              <View className="w-[48%] rounded-xl border border-[#292929] bg-[#171717] p-4">
                <Ionicons
                  name="bed-outline"
                  size={24}
                  color="#f87171"
                />

                <Text className="mt-2 text-xs text-gray-500">
                  BEDROOMS
                </Text>

                <Text className="mt-1 text-sm font-semibold text-white">
                  {property.beds} Bedrooms
                </Text>
              </View>

              {/* BATHROOMS */}
              <View className="w-[48%] rounded-xl border border-[#292929] bg-[#171717] p-4">
                <Ionicons
                  name="water-outline"
                  size={24}
                  color="#f87171"
                />

                <Text className="mt-2 text-xs text-gray-500">
                  BATHROOMS
                </Text>

                <Text className="mt-1 text-sm font-semibold text-white">
                  {property.baths} Bathrooms
                </Text>
              </View>

              {/* CATEGORY */}
              <View className="w-[48%] rounded-xl border border-[#292929] bg-[#171717] p-4">
                <Ionicons
                  name="pricetag-outline"
                  size={24}
                  color="#f87171"
                />

                <Text className="mt-2 text-xs text-gray-500">
                  CATEGORY
                </Text>

                <Text className="mt-1 text-sm font-semibold text-white">
                  {property.category}
                </Text>
              </View>
            </View>

            {/* DESCRIPTION */}
            <Text className="mb-3 mt-7 text-lg font-bold text-white">
              Description
            </Text>

            <View className="rounded-xl border border-[#292929] bg-[#171717] p-4">
              <Text className="text-sm leading-6 text-gray-300">
                {property.description}
              </Text>
            </View>

            {/* LOCATION */}
            <Text className="mb-3 mt-7 text-lg font-bold text-white">
              Location
            </Text>

            <View className="flex-row items-center rounded-xl border border-[#292929] bg-[#171717] p-4">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#241616]">
                <Ionicons
                  name="location"
                  size={22}
                  color="#f87171"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">
                  PROPERTY LOCATION
                </Text>

                <Text className="mt-1 text-sm font-semibold text-white">
                  {property.location}
                </Text>
              </View>
            </View>

            {/* CONTACT BUTTON */}
            <Pressable
              onPress={() => {
                console.log(
                  "Contact agent for property:",
                  property.id
                );
              }}
              className="mt-7 flex-row items-center justify-center rounded-xl bg-red-600 py-4"
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="#fff"
              />

              <Text className="ml-2 text-base font-bold text-white">
                Contact Agent
              </Text>
            </Pressable>

            {/* BACK BUTTON */}
            <Pressable
              onPress={() => router.back()}
              className="mt-3 flex-row items-center justify-center rounded-xl border border-[#383838] bg-[#171717] py-4"
            >
              <Ionicons
                name="arrow-back-outline"
                size={19}
                color="#f87171"
              />

              <Text className="ml-2 text-sm font-bold text-red-400">
                Back to Properties
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

