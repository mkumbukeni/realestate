import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StatusBar,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthRequiredModal from "@/app/components/auth/AuthRequiredModal";
import SideMenu from "@/app/components/sidebar/SideMenu";

// ============================================================
// TYPES
// ============================================================

type PropertyTag = "Sale" | "Rent";

type PropertyType =
  "Residential" | "Industrial" | "Commercial" | "Agricultural";

type Property = {
  id: string;
  title: string;
  location: string;
  price: string;
  period: string;
  image: string;
  tag: PropertyTag;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  category: string;
};

type FilterKey = "all" | "sale" | "rent";

type PropertyTypeFilter =
  "All Types" | "Residential" | "Industrial" | "Commercial" | "Agricultural";

// ============================================================
// PROPERTY DATA
// ============================================================

const PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Modern Family House",
    location: "Area 47, Lilongwe",
    price: "MWK 180,000,000",
    period: "",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900",
    tag: "Sale",
    type: "Residential",
    bedrooms: 4,
    bathrooms: 3,
    category: "Featured Properties",
  },
  {
    id: "2",
    title: "Luxury Apartment",
    location: "Area 10, Lilongwe",
    price: "MWK 850,000",
    period: "/month",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=900",
    tag: "Rent",
    type: "Residential",
    bedrooms: 3,
    bathrooms: 2,
    category: "New to Market",
  },
  {
    id: "3",
    title: "Industrial Warehouse",
    location: "Kanengo, Lilongwe",
    price: "MWK 250,000,000",
    period: "",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=900",
    tag: "Sale",
    type: "Industrial",
    bedrooms: 0,
    bathrooms: 2,
    category: "Most Viewed",
  },
  {
    id: "4",
    title: "Executive Villa",
    location: "Nyambadwe, Blantyre",
    price: "MWK 220,000,000",
    period: "",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900",
    tag: "Sale",
    type: "Residential",
    bedrooms: 5,
    bathrooms: 4,
    category: "Featured Properties",
  },
  {
    id: "5",
    title: "Commercial Office",
    location: "City Centre, Blantyre",
    price: "MWK 2,500,000",
    period: "/month",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900",
    tag: "Rent",
    type: "Commercial",
    bedrooms: 0,
    bathrooms: 2,
    category: "New to Market",
  },
  {
    id: "6",
    title: "Family Home",
    location: "Area 43, Lilongwe",
    price: "MWK 120,000,000",
    period: "",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900",
    tag: "Sale",
    type: "Residential",
    bedrooms: 3,
    bathrooms: 2,
    category: "Open Houses",
  },
  {
    id: "7",
    title: "Modern Townhouse",
    location: "Area 12, Lilongwe",
    price: "MWK 1,200,000",
    period: "/month",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900",
    tag: "Rent",
    type: "Residential",
    bedrooms: 4,
    bathrooms: 3,
    category: "Most Viewed",
  },
  {
    id: "8",
    title: "Business Complex",
    location: "Limbe, Blantyre",
    price: "MWK 450,000,000",
    period: "",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900",
    tag: "Sale",
    type: "Commercial",
    bedrooms: 0,
    bathrooms: 4,
    category: "Featured Properties",
  },
  {
    id: "9",
    title: "Modern Apartment",
    location: "Area 3, Lilongwe",
    price: "MWK 750,000",
    period: "/month",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900",
    tag: "Rent",
    type: "Residential",
    bedrooms: 2,
    bathrooms: 2,
    category: "Properties in My Location",
  },
  {
    id: "10",
    title: "Large Family House",
    location: "Area 25, Lilongwe",
    price: "MWK 150,000,000",
    period: "",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900",
    tag: "Sale",
    type: "Residential",
    bedrooms: 4,
    bathrooms: 3,
    category: "Open Houses",
  },
  {
    id: "11",
    title: "Office Building",
    location: "CBD, Lilongwe",
    price: "MWK 4,000,000",
    period: "/month",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900",
    tag: "Rent",
    type: "Commercial",
    bedrooms: 0,
    bathrooms: 5,
    category: "Most Viewed",
  },
  {
    id: "12",
    title: "Luxury Family Home",
    location: "Area 9, Lilongwe",
    price: "MWK 300,000,000",
    period: "",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900",
    tag: "Sale",
    type: "Residential",
    bedrooms: 5,
    bathrooms: 4,
    category: "Featured Properties",
  },
  {
    id: "13",
    title: "Agricultural Land",
    location: "Dedza",
    price: "MWK 80,000,000",
    period: "",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900",
    tag: "Sale",
    type: "Agricultural",
    bedrooms: 0,
    bathrooms: 0,
    category: "New to Market",
  },
  {
    id: "14",
    title: "City Apartment",
    location: "Area 18, Lilongwe",
    price: "MWK 650,000",
    period: "/month",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900",
    tag: "Rent",
    type: "Residential",
    bedrooms: 2,
    bathrooms: 1,
    category: "Properties in My Location",
  },
  {
    id: "15",
    title: "Retail Shop",
    location: "Blantyre CBD",
    price: "MWK 1,500,000",
    period: "/month",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900",
    tag: "Rent",
    type: "Commercial",
    bedrooms: 0,
    bathrooms: 1,
    category: "Most Viewed",
  },
  {
    id: "16",
    title: "Industrial Property",
    location: "Mchinji",
    price: "MWK 350,000,000",
    period: "",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=900",
    tag: "Sale",
    type: "Industrial",
    bedrooms: 0,
    bathrooms: 3,
    category: "New to Market",
  },
];

// ============================================================
// PROPERTY TYPES
// ============================================================

const PROPERTY_TYPES: PropertyTypeFilter[] = [
  "All Types",
  "Residential",
  "Industrial",
  "Commercial",
  "Agricultural",
];

// ============================================================
// PROPERTY TYPE ICON
// ============================================================

const getPropertyTypeIcon = (
  type: PropertyType,
): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case "Residential":
      return "home-outline";

    case "Industrial":
      return "construct-outline";

    case "Commercial":
      return "business-outline";

    case "Agricultural":
      return "leaf-outline";

    default:
      return "home-outline";
  }
};

// ============================================================
// SCREEN
// ============================================================

export default function AllPropertiesScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    category?: string;
  }>();

  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  /*
   * Connect this to your existing authentication state.
   *
   * This is currently false so that you can test the reusable
   * authentication popup.
   *
   * When your real authentication state is available, replace
   * this value with your actual `isLoggedIn` value.
   */
  const isLoggedIn = false;

  const [authModalVisible, setAuthModalVisible] = useState(false);

  // ==========================================================
  // FILTER STATE
  // ==========================================================

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const [propertyType, setPropertyType] =
    useState<PropertyTypeFilter>("All Types");

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [menuVisible, setMenuVisible] = useState(false);

  // ==========================================================
  // PROPERTY CARD PRESS
  // ==========================================================

  const handlePropertyPress = (propertyId: string) => {
    if (!isLoggedIn) {
      setAuthModalVisible(true);
      return;
    }

    router.push({
      pathname: "/(tabs)/properties/[id]",
      params: {
        id: propertyId,
      },
    });
  };

  // ==========================================================
  // FILTERED PROPERTIES
  // ==========================================================

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return PROPERTIES.filter((property) => {
      const matchesMainFilter =
        activeFilter === "all" ||
        (activeFilter === "sale" && property.tag === "Sale") ||
        (activeFilter === "rent" && property.tag === "Rent");

      const matchesType =
        propertyType === "All Types" || property.type === propertyType;

      const matchesCategory =
        !params.category || property.category === params.category;

      const matchesSearch =
        !query ||
        property.location.toLowerCase().includes(query) ||
        property.type.toLowerCase().includes(query) ||
        property.tag.toLowerCase().includes(query) ||
        property.title.toLowerCase().includes(query);

      return (
        matchesMainFilter && matchesType && matchesCategory && matchesSearch
      );
    });
  }, [activeFilter, propertyType, searchQuery, params.category]);

  // ==========================================================
  // MAIN FILTER
  // ==========================================================

  const handleMainFilterPress = (filter: FilterKey) => {
    setActiveFilter(filter);
    setPropertyType("All Types");

    setShowTypeDropdown((previous) => !previous);
  };

  // ==========================================================
  // PROPERTY TYPE
  // ==========================================================

  const handlePropertyTypePress = (type: PropertyTypeFilter) => {
    setPropertyType(type);
    setShowTypeDropdown(false);
  };

  // ==========================================================
  // PROPERTY CARD
  // ==========================================================

  const renderPropertyCard = ({ item }: { item: Property; index: number }) => {
    return (
      <Pressable
        onPress={() => handlePropertyPress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.title}`}
        className="mb-3 flex-1 overflow-hidden rounded-xl border border-[#242424] bg-[#151515] active:opacity-80"
        style={({ pressed }) => ({
          minWidth: 0,
          transform: [
            {
              scale: pressed ? 0.98 : 1,
            },
          ],
        })}
      >
        {/* ================================================== */}
        {/* CARD TOP INFORMATION */}
        {/* ================================================== */}

        <View className="flex-row items-center justify-between px-3 pb-2 pt-3">
          <View
            className={`rounded-md px-2.5 py-1 ${
              item.tag === "Sale" ? "bg-red-600" : "bg-[#242424]"
            }`}
          >
            <Text className="text-xs font-bold text-white">{item.tag}</Text>
          </View>

          {item.period ? (
            <Text className="text-xs text-gray-400">{item.period}</Text>
          ) : null}
        </View>

        {/* ================================================== */}
        {/* PROPERTY IMAGE */}
        {/* ================================================== */}

        <Image
          source={{ uri: item.image }}
          className="h-32 w-full"
          resizeMode="cover"
        />

        {/* ================================================== */}
        {/* CARD CONTENT */}
        {/* ================================================== */}

        <View className="p-3">
          {/* PROPERTY TYPE */}

          <View className="mb-2 flex-row items-center rounded-md bg-[#242424] px-2.5 py-2">
            <Ionicons
              name={getPropertyTypeIcon(item.type)}
              size={15}
              color="#ffffff"
            />

            <Text
              className="ml-2 flex-1 text-xs font-medium text-white"
              numberOfLines={1}
            >
              {item.type}
            </Text>
          </View>

          {/* BEDROOMS / BATHROOMS */}

          <View className="mb-2 flex-row gap-2">
            <View className="flex-1 flex-row items-center rounded-md bg-[#242424] px-2 py-2">
              <Ionicons name="bed-outline" size={14} color="#ffffff" />

              <Text className="ml-1.5 text-xs text-gray-300">
                {item.bedrooms} Beds
              </Text>
            </View>

            <View className="flex-1 flex-row items-center rounded-md bg-[#242424] px-2 py-2">
              <Ionicons name="water-outline" size={14} color="#ffffff" />

              <Text className="ml-1.5 text-xs text-gray-300">
                {item.bathrooms} Baths
              </Text>
            </View>
          </View>

          {/* PRICE */}

          <Text className="mb-1 text-sm font-bold text-white" numberOfLines={1}>
            {item.price}
          </Text>

          {/* LOCATION */}

          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#9ca3af" />

            <Text
              className="ml-1 flex-1 text-xs text-gray-400"
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderPropertyCard}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            gap: 12,
            paddingHorizontal: 16,
          }}
          contentContainerStyle={{
            paddingBottom: 30,
          }}

          // ==================================================
          // HEADER
          // ==================================================

          ListHeaderComponent={
            <View className="px-4 pt-4">
              {/* HEADER */}

              <View className="mb-5 flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold text-white">
                    Properties
                  </Text>

                  <Text className="mt-1 text-sm text-gray-400">
                    Find your next property
                  </Text>
                </View>

                {/* MENU BUTTON */}

                <Pressable
                  onPress={() => setMenuVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open menu"
                  className="h-10 w-10 items-center justify-center rounded-full bg-[#1c1c1c] active:opacity-60"
                >
                  <Ionicons name="menu" size={21} color="#ffffff" />
                </Pressable>
              </View>

              {/* MAIN FILTERS */}

              <View className="mb-3 flex-row gap-2">
                {/* ALL */}

                <Pressable
                  onPress={() => handleMainFilterPress("all")}
                  className={`flex-1 flex-row items-center justify-center rounded-lg px-3 py-3 ${
                    activeFilter === "all" ? "bg-red-600" : "bg-[#1c1c1c]"
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">All</Text>

                  {activeFilter === "all" && (
                    <Ionicons
                      name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                      size={15}
                      color="#ffffff"
                      className="ml-1"
                    />
                  )}
                </Pressable>

                {/* FOR SALE */}

                <Pressable
                  onPress={() => handleMainFilterPress("sale")}
                  className={`flex-1 flex-row items-center justify-center rounded-lg px-3 py-3 ${
                    activeFilter === "sale" ? "bg-red-600" : "bg-[#1c1c1c]"
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">
                    For Sale
                  </Text>

                  {activeFilter === "sale" && (
                    <Ionicons
                      name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                      size={15}
                      color="#ffffff"
                      className="ml-1"
                    />
                  )}
                </Pressable>

                {/* FOR RENT */}

                <Pressable
                  onPress={() => handleMainFilterPress("rent")}
                  className={`flex-1 flex-row items-center justify-center rounded-lg px-3 py-3 ${
                    activeFilter === "rent" ? "bg-red-600" : "bg-[#1c1c1c]"
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">
                    For Rent
                  </Text>

                  {activeFilter === "rent" && (
                    <Ionicons
                      name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                      size={15}
                      color="#ffffff"
                      className="ml-1"
                    />
                  )}
                </Pressable>
              </View>

              {/* ================================================== */}
              {/* PROPERTY TYPE DROPDOWN */}
              {/* ================================================== */}

              {showTypeDropdown && (
                <View className="mb-3 overflow-hidden rounded-lg border border-[#2b2b2b] bg-[#181818]">
                  {PROPERTY_TYPES.map((type) => {
                    const selected = propertyType === type;

                    return (
                      <Pressable
                        key={type}
                        onPress={() => handlePropertyTypePress(type)}
                        className={`flex-row items-center justify-between px-4 py-3 ${
                          selected ? "bg-[#242424]" : ""
                        }`}
                      >
                        <View className="flex-row items-center">
                          <Ionicons
                            name={
                              type === "All Types"
                                ? "grid-outline"
                                : getPropertyTypeIcon(type as PropertyType)
                            }
                            size={17}
                            color={selected ? "#ef4444" : "#9ca3af"}
                          />

                          <Text
                            className={`ml-3 text-sm ${
                              selected
                                ? "font-semibold text-white"
                                : "text-gray-300"
                            }`}
                          >
                            {type}
                          </Text>
                        </View>

                        {selected && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color="#ef4444"
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {/* ================================================== */}
              {/* SEARCH */}
              {/* ================================================== */}

              <View className="mb-4 flex-row items-center rounded-xl bg-[#1c1c1c] px-4">
                <Ionicons name="search-outline" size={20} color="#9ca3af" />

                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by location, type, or tag..."
                  placeholderTextColor="#6b7280"
                  className="h-12 flex-1 px-3 text-base text-white"
                  returnKeyType="search"
                />

                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery("")}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                    className="active:opacity-60"
                  >
                    <Ionicons name="close-circle" size={19} color="#6b7280" />
                  </Pressable>
                )}
              </View>

              {/* ================================================== */}
              {/* ACTIVE PROPERTY TYPE */}
              {/* ================================================== */}

              {propertyType !== "All Types" && (
                <View className="mb-4 flex-row items-center">
                  <View className="flex-row items-center rounded-full bg-red-600/15 px-3 py-2">
                    <Ionicons
                      name={getPropertyTypeIcon(propertyType)}
                      size={15}
                      color="#ef4444"
                    />

                    <Text className="ml-2 text-xs font-medium text-red-500">
                      {propertyType}
                    </Text>

                    <Pressable
                      onPress={() => setPropertyType("All Types")}
                      className="ml-2 active:opacity-60"
                    >
                      <Ionicons name="close" size={15} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
              )}

              {/* ================================================== */}
              {/* RESULTS HEADER */}
              {/* ================================================== */}

              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-base font-semibold text-white">
                  Properties
                </Text>

                <Text className="text-sm text-gray-500">
                  {filteredProperties.length} found
                </Text>
              </View>
            </View>
          }

          // ==================================================
          // EMPTY STATE
          // ==================================================

          ListEmptyComponent={
            <View className="items-center justify-center px-8 py-16">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#1c1c1c]">
                <Ionicons name="search-outline" size={28} color="#6b7280" />
              </View>

              <Text className="text-center text-lg font-semibold text-white">
                No properties found
              </Text>

              <Text className="mt-2 text-center text-sm text-gray-500">
                Try changing your filters or search for another location.
              </Text>
            </View>
          }
        />
      </KeyboardAvoidingView>

      {/* ====================================================== */}
      {/* REUSABLE AUTH REQUIRED MODAL */}
      {/* ====================================================== */}

      <AuthRequiredModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      {/* ====================================================== */}
      {/* REUSABLE SIDE MENU */}
      {/* ====================================================== */}

      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}
