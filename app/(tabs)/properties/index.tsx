
// app/(tabs)/properties/index.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthRequiredModal from "@/app/components/auth/AuthRequiredModal";
import PropertyCard from "@/app/components/properties/PropertyCard";
import SideMenu from "@/app/components/sidebar/SideMenu";

import {
  fetchProperties,
  type Property,
} from "@/app/services/propertyApi";

// ============================================================
// PROPERTY ROW HELPER
// ============================================================

function createPropertyRows(
  properties: Property[],
): Property[][] {
  const rows: Property[][] = [];

  for (
    let index = 0;
    index < properties.length;
    index += 2
  ) {
    rows.push(properties.slice(index, index + 2));
  }

  return rows;
}

// ============================================================
// SECTION TYPE
// ============================================================

interface PropertySection {
  title: string;
  data: Property[][];
}

// ============================================================
// APP
// ============================================================

const PropertiesScreen = () => {
  const router = useRouter();

  // ==========================================================
  // PROPERTIES
  // ==========================================================

  const [properties, setProperties] = useState<Property[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================================
  // SIDE MENU
  // ==========================================================

  const [menuVisible, setMenuVisible] = useState(false);

  // ==========================================================
  // AUTH MODAL
  // ==========================================================

  const [authModalVisible, setAuthModalVisible] =
    useState(false);

  /*
   * IMPORTANT:
   *
   * Replace this with your actual LoginContext/AuthContext.
   *
   * Example:
   *
   * const { isLoggedIn } = useLogin();
   */

  const isLoggedIn = false;

  // ==========================================================
  // FETCH PROPERTIES
  // ==========================================================

  const loadProperties = useCallback(async () => {
    try {
      setError(null);

      const result = await fetchProperties();

      setProperties(result);
    } catch (requestError) {
      console.error(
        "Failed to load properties:",
        requestError,
      );

      if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError(
          "Unable to load properties. Please try again.",
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadProperties();
  }, [loadProperties]);

  // ==========================================================
  // PULL TO REFRESH
  // ==========================================================

  const handleRefresh = () => {
    setRefreshing(true);
    void loadProperties();
  };

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredProperties = useMemo(() => {
    const searchText = searchQuery
      .toLowerCase()
      .trim();

    if (searchText === "") {
      return properties;
    }

    return properties.filter((property) => {
      const searchableText = [
        property.location,
        property.area,
        property.district,
        property.region,
        property.type,
        property.tag,
        property.category,
        property.propertyDesign,
        property.constructionStage,
        property.description,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchText);
    });
  }, [properties, searchQuery]);

  // ==========================================================
  // CLEAR SEARCH
  // ==========================================================

  const clearSearch = () => {
    setSearchQuery("");
  };

  // ==========================================================
  // PROPERTY PRESS
  // ==========================================================

  const handlePropertyPress = (
    property: Property,
  ) => {
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

  const propertySections = useMemo<
    PropertySection[]
  >(() => {
    const sections: PropertySection[] = [];

    const forSale = filteredProperties.filter(
      (property) =>
        property.category === "For Sale",
    );

    const forRent = filteredProperties.filter(
      (property) =>
        property.category === "For Rent",
    );

    if (forSale.length > 0) {
      sections.push({
        title: "For Sale",
        data: createPropertyRows(forSale),
      });
    }

    if (forRent.length > 0) {
      sections.push({
        title: "For Rent",
        data: createPropertyRows(forRent),
      });
    }

    return sections;
  }, [filteredProperties]);

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0d0d0d"
        />

        {/* HEADER */}

        <View className="flex-row items-center justify-between border-b border-[#222] bg-[#0d0d0d] px-5 pb-3.5 pt-2.5">
          <Text className="text-2xl font-bold text-white">
            Real Estate
          </Text>

          <Pressable
            onPress={() => setMenuVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Ionicons
              name="menu-outline"
              size={28}
              color="#fff"
            />
          </Pressable>
        </View>

        {/* LOADING */}

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#ef4444"
          />

          <Text className="mt-4 text-sm text-gray-400">
            Loading properties...
          </Text>
        </View>

        <SideMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
        />
      </SafeAreaView>
    );
  }

  // ==========================================================
  // ERROR SCREEN
  // ==========================================================

  if (error && properties.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0d0d0d"
        />

        {/* HEADER */}

        <View className="flex-row items-center justify-between border-b border-[#222] bg-[#0d0d0d] px-5 pb-3.5 pt-2.5">
          <Text className="text-2xl font-bold text-white">
            Real Estate
          </Text>

          <Pressable
            onPress={() => setMenuVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Ionicons
              name="menu-outline"
              size={28}
              color="#fff"
            />
          </Pressable>
        </View>

        {/* ERROR */}

        <View className="flex-1 items-center justify-center px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#241616]">
            <Ionicons
              name="cloud-offline-outline"
              size={32}
              color="#ef4444"
            />
          </View>

          <Text className="mt-5 text-center text-lg font-bold text-white">
            Unable to load properties
          </Text>

          <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
            {error}
          </Text>

          <Pressable
            onPress={() => {
              setLoading(true);
              void loadProperties();
            }}
            className="mt-6 rounded-xl bg-red-600 px-6 py-3"
          >
            <Text className="font-bold text-white">
              Try Again
            </Text>
          </Pressable>
        </View>

        <SideMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
        />
      </SafeAreaView>
    );
  }

  // ==========================================================
  // MAIN SCREEN
  // ==========================================================

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
        />

        <TextInput
          className="h-12 flex-1 px-2 text-base text-white"
          placeholder="Search by location, type, or tag..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
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
          const isFullWidth =
            propertyRow.length === 1;

          return (
            <View className="flex-row gap-3">
              {propertyRow.map((property) => (
                <View
                  key={property.id}
                  className="flex-1"
                >
                  <PropertyCard
                    property={property}
                    isFullWidth={isFullWidth}
                    onPress={handlePropertyPress}
                  />
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ef4444"
            colors={["#ef4444"]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}
        renderSectionHeader={({ section }) => {
          const listingCount =
            section.data.flat().length;

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
          const listingCount =
            section.data.flat().length;

          if (listingCount === 0) {
            return null;
          }

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

            <Text className="mt-1 text-center text-sm text-gray-600">
              Try adjusting your search or check back later.
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

export default PropertiesScreen;

