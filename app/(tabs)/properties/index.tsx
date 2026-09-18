import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  SectionList,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthRequiredModal from "@/app/components/auth/AuthRequiredModal";
import SideMenu from "@/app/components/sidebar/SideMenu";

import {
  PROPERTIES,
  PROPERTY_SECTIONS,
  type Property,
} from "@/app/data/data";

// ============================================================
// PROPERTY ROW HELPER
// ============================================================

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

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [searchQuery, setSearchQuery] = useState("");

  const [filteredProperties, setFilteredProperties] =
    useState<Property[]>(PROPERTIES);

  // ==========================================================
  // SIDE MENU
  // ==========================================================

  const [menuVisible, setMenuVisible] = useState(false);

  // ==========================================================
  // AUTH MODAL
  // ==========================================================

  const [authModalVisible, setAuthModalVisible] = useState(false);

  /*
   * IMPORTANT:
   *
   * Replace this with your actual authentication state
   * from your LoginContext/AuthContext.
   *
   * For example:
   *
   * const { isLoggedIn } = useLogin();
   */

  const isLoggedIn = false;

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.trim() === "") {
      setFilteredProperties(PROPERTIES);
      return;
    }

    const searchText = text.toLowerCase().trim();

    const filtered = PROPERTIES.filter(
      (item) =>
        item.location.toLowerCase().includes(searchText) ||
        item.type.toLowerCase().includes(searchText) ||
        item.tag.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText),
    );

    setFilteredProperties(filtered);
  };

  // ==========================================================
  // CLEAR SEARCH
  // ==========================================================

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredProperties(PROPERTIES);
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
  // PROPERTY SECTIONS
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
        {/* ================================================== */}
        {/* TOP INFORMATION */}
        {/* ================================================== */}

        <View className="flex-row items-center justify-between px-3 py-3">
          <Text className="text-sm text-white">{item.tag}</Text>

          <Text className="text-sm font-semibold text-gray-300">
            {item.period}
          </Text>
        </View>

        {/* ================================================== */}
        {/* PROPERTY IMAGE */}
        {/* ================================================== */}

        <Image
          source={{ uri: item.image }}
          className={isFullWidth ? "h-40 w-full" : "h-28 w-full"}
          resizeMode="cover"
        />

        {/* ================================================== */}
        {/* CARD CONTENT */}
        {/* ================================================== */}

        <View className="px-3 pb-3 pt-2">
          {/* ================================================= */}
          {/* PROPERTY DETAILS */}
          {/* ================================================= */}

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

            {/* BEDS + BATHS */}

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

          {/* ================================================= */}
          {/* PRICE + LOCATION */}
          {/* ================================================= */}

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
            onPress={clearSearch}
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
          {filteredProperties.length}{" "}
          {filteredProperties.length === 1
            ? "property"
            : "properties"}{" "}
          found
        </Text>
      </View>

      {/* ====================================================== */}
      {/* PROPERTY LIST */}
      {/* ====================================================== */}

      <SectionList
        sections={propertySections}
        renderItem={({ item: propertyRow }) => {
          const isFullWidth = propertyRow.length === 1;

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
        renderSectionHeader={({ section }) => {
          const listingCount = section.data.flat().length;

          return (
            <View className="mb-2.5 mt-5 flex-row items-center justify-between border-l-[3px] border-red-500 pl-2.5">
              <Text className="text-lg font-bold text-white">
                {section.title}
              </Text>

              <Text className="text-xs font-semibold text-red-400">
                {listingCount}{" "}
                {listingCount === 1
                  ? "listing"
                  : "listings"}
              </Text>
            </View>
          );
        }}
        renderSectionFooter={({ section }) => {
          const listingCount = section.data.flat().length;

          // ====================================================
          // NO PROPERTIES
          // ====================================================

          if (listingCount === 0) {
            return (
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
                    No properties in this section
                  </Text>

                  <Text className="mt-0.5 text-xs leading-4 text-gray-400">
                    Check back later for new listings.
                  </Text>
                </View>
              </View>
            );
          }

          // ====================================================
          // VIEW ALL
          // ====================================================

          return (
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
          );
        }}
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
      {/* AUTH MODAL */}
      {/* ====================================================== */}

      <AuthRequiredModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      {/* ====================================================== */}
      {/* SIDE MENU */}
      {/* ====================================================== */}

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
};

export default App;