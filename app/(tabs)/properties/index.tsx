
import React, { useState } from "react";
import {
  Text,
  TextInput,
  SectionList,
  View,
  Image,
  Pressable,
  StatusBar,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import SideMenu from "@/app/components/common/SideMenu";
import AuthRequiredModal from "@/app/components/common/AuthRequiredModal";

// app/(tabs)/properties/index.tsx

// ============================================================
// PROPERTY DATA
// ============================================================

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
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Featured Properties",
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
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "New to Market",
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
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Open Houses",
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
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Most Viewed",
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
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Featured Properties",
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
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Featured Properties",
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
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "New to Market",
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
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Featured Properties",
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
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Most Viewed",
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
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Properties in My Location",
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
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Open Houses",
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
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "New to Market",
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
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Featured Properties",
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
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Most Viewed",
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
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    tag: "Rent",
    category: "Open Houses",
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
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
    tag: "Sale",
    category: "Properties in My Location",
  },
];

const PROPERTY_SECTIONS = [
  "Featured Properties",
  "New to Market",
  "Open Houses",
  "Most Viewed",
  "Properties in My Location",
];

type Property = (typeof PROPERTIES)[number];

function createPropertyRows(properties: Property[]) {
  const rows: Property[][] = [];

  for (let index = 0; index < properties.length; index += 2) {
    rows.push(properties.slice(index, index + 2));
  }

  return rows;
}

// ============================================================
// APP
// ============================================================

const App = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProperties, setFilteredProperties] =
    useState(PROPERTIES);

  const [menuVisible, setMenuVisible] = useState(false);

  // ==========================================================
  // AUTH MODAL
  // ==========================================================

  const [authModalVisible, setAuthModalVisible] = useState(false);

  /*
   * IMPORTANT:
   *
   * Connect this value to your existing authentication state.
   *
   * For now this is false so the authentication popup will appear
   * when a user taps a property.
   *
   * Once your existing LoginContext/auth provider is connected,
   * replace this with your real `isLoggedIn` value.
   */
  const isLoggedIn = false;

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.trim() === "") {
      setFilteredProperties(PROPERTIES);
    } else {
      const searchText = text.toLowerCase();

      const filtered = PROPERTIES.filter(
        (item) =>
          item.location.toLowerCase().includes(searchText) ||
          item.type.toLowerCase().includes(searchText) ||
          item.tag.toLowerCase().includes(searchText),
      );

      setFilteredProperties(filtered);
    }
  };

  // ==========================================================
  // PROPERTY PRESS
  // ==========================================================

  const handlePropertyPress = (property: Property) => {
    if (!isLoggedIn) {
      setAuthModalVisible(true);
      return;
    }

    router.push({
      pathname: "/(tabs)/properties/[id]",
      params: {
        id: property.id,
      },
    });
  };

  // ==========================================================
  // SECTIONS
  // ==========================================================

  const propertySections = PROPERTY_SECTIONS.map((title) => ({
    title,
    data: createPropertyRows(
      filteredProperties.filter(
        (property) => property.category === title,
      ),
    ),
  }));

  // ==========================================================
  // PROPERTY CARD
  // ==========================================================

  const renderPropertyCard = (
    item: Property,
    isFullWidth: boolean = false,
  ) => (
    <Pressable
      onPress={() => handlePropertyPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.type} property in ${item.location}`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.75 : 1,
        transform: [
          {
            scale: pressed ? 0.98 : 1,
          },
        ],
      })}
    >
      <View className="mb-4 overflow-hidden rounded-xl border border-[#242424] bg-[#151515]">
        {/* TOP INFORMATION */}
        <View className="flex-row items-center justify-between px-3 py-3">
          <Text className="text-sm text-white">
            {item.tag}
          </Text>

          <Text className="text-sm font-semibold text-gray-300">
            {item.period}
          </Text>
        </View>

        {/* PROPERTY IMAGE */}
        <Image
          source={{ uri: item.image }}
          className={
            isFullWidth
              ? "h-40 w-full"
              : "h-28 w-full"
          }
          resizeMode="cover"
        />

        {/* CARD CONTENT */}
        <View className="px-3 pb-3 pt-2">
          {/* PROPERTY DETAILS */}
          <View className="mb-2">
            {/* PROPERTY TYPE */}
            <View className="w-full flex-row items-center rounded-md bg-[#242424] px-2.5 py-1.5">
              <Ionicons
                name="business-outline"
                size={15}
                color="#d1d1d1"
              />

              <Text className="ml-1 text-xs text-gray-300">
                {item.type}
              </Text>
            </View>

            <View className="mt-1.5 flex-row gap-1.5">
              {/* BEDROOMS */}
              <View className="flex-1 flex-row items-center rounded-md bg-[#242424] px-2 py-1.5">
                <Ionicons
                  name="bed-outline"
                  size={15}
                  color="#d1d1d1"
                />

                <Text className="ml-1 text-xs text-gray-300">
                  {item.beds} Beds
                </Text>
              </View>

              {/* BATHROOMS */}
              <View className="flex-1 flex-row items-center rounded-md bg-[#242424] px-2 py-1.5">
                <Ionicons
                  name="water-outline"
                  size={15}
                  color="#d1d1d1"
                />

                <Text className="ml-1 text-xs text-gray-300">
                  {item.baths} Baths
                </Text>
              </View>
            </View>
          </View>

          {/* PRICE + LOCATION */}
          {isFullWidth ? (
            <View className="mt-1 flex-row items-center justify-between">
              {/* PRICE */}
              <View className="mr-3 flex-1">
                <Text className="mb-0.5 text-xs text-gray-500">
                  Price
                </Text>

                <Text
                  className="text-sm font-bold text-white"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {item.price}
                </Text>
              </View>

              {/* LOCATION */}
              <View className="flex-1 flex-row items-center justify-end">
                <Ionicons
                  name="location-outline"
                  size={17}
                  color="#999"
                />

                <Text
                  className="ml-1 text-xs text-gray-400"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.location}
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* PRICE */}
              <Text className="mb-2 text-sm font-bold text-white">
                {item.price}
              </Text>

              {/* LOCATION */}
              <View className="flex-row items-center">
                <Ionicons
                  name="location-outline"
                  size={17}
                  color="#999"
                />

                <Text
                  className="ml-1 flex-1 text-xs text-gray-400"
                  numberOfLines={1}
                >
                  {item.location}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0d0d0d"
      />

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <View className="flex-row items-center justify-between border-b border-[#222] bg-[#0d0d0d] px-5 pb-3.5 pt-2.5">
        <Text className="text-2xl font-bold text-white">
          Real Estate
        </Text>

        <Pressable
          onPress={() => setMenuVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons
            name="menu-outline"
            size={28}
            color="#fff"
          />
        </Pressable>
      </View>

      {/* ====================================================== */}
      {/* SEARCH BAR */}
      {/* ====================================================== */}

      <View className="mx-4 mt-4 flex-row items-center rounded-xl border border-[#292929] bg-[#181818] px-3.5">
        <Ionicons
          name="search-outline"
          size={20}
          color="#999"
          className="mr-2.5"
        />

        <TextInput
          className="h-12 flex-1 text-base text-white"
          placeholder="Search by location, type, or tag..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => handleSearch("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#ef4444"
            />
          </Pressable>
        )}
      </View>

      {/* ====================================================== */}
      {/* RESULTS COUNT */}
      {/* ====================================================== */}

      <View className="px-5 pb-1.5 pt-3.5">
        <Text className="text-sm font-medium text-gray-400">
          {filteredProperties.length} properties found
        </Text>
      </View>

      {/* ====================================================== */}
      {/* PROPERTY LIST */}
      {/* ====================================================== */}

      <SectionList
        sections={propertySections}
        renderItem={({ item: propertyRow }) => {
          const isFullWidth =
            propertyRow.length === 1;

          return (
            <View className="flex-row gap-3">
              {propertyRow.map((property) => (
                <View
                  key={property.id}
                  className="flex-1"
                >
                  {renderPropertyCard(
                    property,
                    isFullWidth,
                  )}
                </View>
              ))}
            </View>
          );
        }}
        keyExtractor={(propertyRow) =>
          propertyRow
            .map((property) => property.id)
            .join("-")
        }
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}
        renderSectionHeader={({ section }) => (
          <View className="mb-2.5 mt-5 flex-row items-center justify-between border-l-[3px] border-red-500 pl-2.5">
            <Text className="text-lg font-bold text-white">
              {section.title}
            </Text>

            <Text className="text-xs font-semibold text-red-400">
              {section.data.flat().length}{" "}
              {section.data.flat().length === 1
                ? "listing"
                : "listings"}
            </Text>
          </View>
        )}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? (
            <View className="mb-2 flex-row items-center rounded-xl border border-[#303030] bg-[#181818] px-4 py-4">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#241616]">
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#f87171"
                />
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-white">
                  No properties in your location
                </Text>

                <Text className="mt-0.5 text-xs leading-4 text-gray-400">
                  Check back later or update your location
                  to see nearby listings.
                </Text>
              </View>
            </View>
          ) : (
            <Pressable
              accessibilityLabel={`View all ${section.title}`}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname:
                    "/(tabs)/properties/all-properties",
                  params: {
                    category: section.title,
                  },
                })
              }
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
              className="mb-2"
            >
              <View className="flex-row items-center justify-center rounded-xl border border-[#383838] bg-[#1a1a1a] px-4 py-3">
                <Text className="mr-1.5 text-sm font-bold text-red-400">
                  View All {section.title}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#f87171"
                />
              </View>
            </Pressable>
          )
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Ionicons
              name="home-outline"
              size={60}
              color="#444"
            />

            <Text className="mt-4 text-lg font-semibold text-gray-400">
              No properties found
            </Text>

            <Text className="mt-1 text-sm text-gray-600">
              Try adjusting your search
            </Text>
          </View>
        }
      />

      {/* ====================================================== */}
      {/* REUSABLE AUTH MODAL */}
      {/* ====================================================== */}

      <AuthRequiredModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      {/* ====================================================== */}
      {/* REUSABLE SIDE MENU */}
      {/* ====================================================== */}

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
};

export default App;

