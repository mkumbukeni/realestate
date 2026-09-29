// app/(tabs)/properties/index.tsx

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
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import SideMenu from "../../components/sidebar/SideMenu";
import PropertyCard from "../../components/properties/PropertyCard";

import {
  fetchFeaturedProperties,
  fetchMostViewedProperties,
  fetchProperties,
} from "../../services/propertyApi";

import type {
  Property,
} from "../../services/propertyApi";

// ============================================================
// TYPES
// ============================================================

type PropertyCategory =
  | "Featured Properties"
  | "New to Market"
  | "Open Houses"
  | "Most Viewed"
  | null;

type ListingFilter =
  | "all"
  | "sale"
  | "rent";

// ============================================================
// CREATE PROPERTY ROWS
// ============================================================

function createPropertyRows(
  properties: Property[],
  columns: number,
): Property[][] {
  const rows: Property[][] = [];

  for (
    let index = 0;
    index < properties.length;
    index += columns
  ) {
    rows.push(
      properties.slice(
        index,
        index + columns,
      ),
    );
  }

  return rows;
}

// ============================================================
// GET CATEGORY
// ============================================================

function getCategory(
  category:
    | string
    | string[]
    | undefined,
): PropertyCategory {
  if (!category) {
    return null;
  }

  const value = Array.isArray(category)
    ? category[0]
    : category;

  switch (value) {
    case "Featured Properties":
      return "Featured Properties";

    case "New to Market":
      return "New to Market";

    case "Open Houses":
      return "Open Houses";

    case "Most Viewed":
      return "Most Viewed";

    default:
      return null;
  }
}

// ============================================================
// GET PROPERTY ID
// ============================================================

function getPropertyId(
  property: Property,
): string {
  return String(property.id);
}

// ============================================================
// REMOVE DUPLICATE PROPERTIES
// ============================================================

/*
 * Removes duplicate property cards using
 * the property ID.
 *
 * First occurrence is kept.
 */
function removeDuplicateProperties(
  properties: Property[],
): Property[] {
  const seenIds =
    new Set<string>();

  return properties.filter(
    (property) => {
      const id =
        getPropertyId(property);

      if (seenIds.has(id)) {
        return false;
      }

      seenIds.add(id);

      return true;
    },
  );
}

// ============================================================
// MAIN SCREEN
// ============================================================

export default function PropertiesScreen() {
  const router = useRouter();

  const { width } =
    useWindowDimensions();

  const params =
    useLocalSearchParams<{
      category?:
        | string
        | string[];
    }>();

  // ==========================================================
  // CATEGORY
  // ==========================================================

  const selectedCategory =
    getCategory(
      params.category,
    );

  /*
   * When there is no category parameter,
   * the user is viewing the Properties tab
   * directly.
   *
   * In this mode we combine:
   *
   * Featured
   * New to Market
   * Open Houses
   * Most Viewed
   *
   * and remove duplicates.
   */
  const isAllPropertiesMode =
    selectedCategory === null;

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    properties,
    setProperties,
  ] = useState<Property[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    listingFilter,
    setListingFilter,
  ] = useState<ListingFilter>(
    "all",
  );

  const [
    menuVisible,
    setMenuVisible,
  ] = useState(false);

  const [
    authModalVisible,
    setAuthModalVisible,
  ] = useState(false);

  /*
   * Authentication can be connected
   * here later.
   */
  const isLoggedIn = true;

  // ==========================================================
  // NUMBER OF COLUMNS
  // ==========================================================

  const numberOfColumns =
    width >= 700
      ? 2
      : 1;

  // ==========================================================
  // LOAD PROPERTIES
  // ==========================================================

  const loadProperties =
    useCallback(async () => {
      try {
        setError(null);
        setLoading(true);

        // ====================================================
        // CATEGORY-SPECIFIC MODE
        // ====================================================

        if (
          !isAllPropertiesMode
        ) {
          let result: Property[] =
            [];

          switch (
            selectedCategory
          ) {
            // ----------------------------------------------
            // FEATURED
            // ----------------------------------------------

            case "Featured Properties":
              result =
                await fetchFeaturedProperties();
              break;

            // ----------------------------------------------
            // MOST VIEWED
            // ----------------------------------------------

            case "Most Viewed":
              result =
                await fetchMostViewedProperties();
              break;

            // ----------------------------------------------
            // OPEN HOUSES
            // ----------------------------------------------

            case "Open Houses": {
              const allProperties =
                await fetchProperties();

              result =
                allProperties.filter(
                  (property) =>
                    property.isOpenHouse ===
                    true,
                );

              break;
            }

            // ----------------------------------------------
            // NEW TO MARKET
            // ----------------------------------------------

            case "New to Market":
              result =
                await fetchProperties();
              break;

            default:
              result = [];
              break;
          }

          setProperties(
            removeDuplicateProperties(
              result,
            ),
          );

          return;
        }

        // ====================================================
        // ALL PROPERTIES MODE
        // ====================================================

        /*
         * Load all datasets used on Home.
         */

        const [
          newToMarket,
          featured,
          mostViewed,
        ] = await Promise.all([
          fetchProperties(),
          fetchFeaturedProperties(),
          fetchMostViewedProperties(),
        ]);

        // ====================================================
        // OPEN HOUSES
        // ====================================================

        const openHouses =
          newToMarket.filter(
            (property) =>
              property.isOpenHouse ===
              true,
          );

        // ====================================================
        // COMBINE ALL DATASETS
        // ====================================================

        const combinedProperties = [
          ...featured,
          ...newToMarket,
          ...openHouses,
          ...mostViewed,
        ];

        // ====================================================
        // REMOVE DUPLICATES
        // ====================================================

        const uniqueProperties =
          removeDuplicateProperties(
            combinedProperties,
          );

        setProperties(
          uniqueProperties,
        );
      } catch (
        requestError
      ) {
        console.error(
          "Failed to load properties:",
          requestError,
        );

        if (
          requestError instanceof Error
        ) {
          setError(
            requestError.message,
          );
        } else {
          setError(
            "Unable to load properties. Please try again.",
          );
        }

        setProperties([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [
      isAllPropertiesMode,
      selectedCategory,
    ]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadProperties();
  }, [
    loadProperties,
  ]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    useCallback(() => {
      setRefreshing(true);

      void loadProperties();
    }, [
      loadProperties,
    ]);

  // ==========================================================
  // FILTER PROPERTIES
  // ==========================================================

  const filteredProperties =
    useMemo(() => {
      const searchText =
        searchQuery
          .toLowerCase()
          .trim();

      return properties.filter(
        (property) => {
          // ==================================================
          // LISTING TYPE
          // ==================================================

          /*
           * IMPORTANT:
           *
           * Property.tag comes directly from
           * ApiProperty.listing_type inside
           * mapApiProperty().
           *
           * Therefore we ONLY use property.tag
           * for the Sale/Rent filter.
           *
           * We do NOT use:
           *
           * property.status
           * property.listingType
           * property.listing_type
           *
           * because those fields are not part of
           * the normalized Property interface.
           */

          const listingType =
            String(
              property.tag ?? "",
            )
              .trim()
              .toLowerCase();

          // ==================================================
          // LISTING FILTER
          // ==================================================

          const matchesListingFilter =
            listingFilter === "all" ||
            (
              listingFilter ===
                "sale" &&
              (
                listingType ===
                  "sale" ||
                listingType ===
                  "for sale" ||
                listingType ===
                  "for_sale"
              )
            ) ||
            (
              listingFilter ===
                "rent" &&
              (
                listingType ===
                  "rent" ||
                listingType ===
                  "for rent" ||
                listingType ===
                  "for_rent"
              )
            );

          // ==================================================
          // STOP IF LISTING TYPE DOES NOT MATCH
          // ==================================================

          if (
            !matchesListingFilter
          ) {
            return false;
          }

          // ==================================================
          // NO SEARCH
          // ==================================================

          if (
            searchText === ""
          ) {
            return true;
          }

          // ==================================================
          // SEARCHABLE TEXT
          // ==================================================

          const searchableText = [
            property.type,
            property.description,
            property.location,
            property.area,
            property.district,
            property.region,
            property.tag,
            property.category,
            property.propertyDesign,
            property.constructionStage,
            property.yearBuilt,
            property.buildingSizeUnit,
            property.landSizeUnit,
            property.systemStatus,

            ...(
              Array.isArray(
                property.attributes,
              )
                ? property.attributes
                : []
            ),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            searchText,
          );
        },
      );
    }, [
      properties,
      searchQuery,
      listingFilter,
    ]);

  // ==========================================================
  // CLEAR SEARCH
  // ==========================================================

  const clearSearch =
    useCallback(() => {
      setSearchQuery("");
    }, []);

  // ==========================================================
  // PROPERTY PRESS
  // ==========================================================

  const handlePropertyPress =
    useCallback(
      (property: Property) => {
        if (!isLoggedIn) {
          setAuthModalVisible(
            true,
          );

          return;
        }

        router.push({
          pathname:
            "/(tabs)/properties/[id]",

          params: {
            id: getPropertyId(
              property,
            ),
          },
        });
      },
      [
        router,
        isLoggedIn,
      ],
    );

  // ==========================================================
  // SCREEN TITLE
  // ==========================================================

  const screenTitle =
    selectedCategory ??
    "Properties";

  // ==========================================================
  // PROPERTY ROWS
  // ==========================================================

  const propertyRows =
    useMemo(() => {
      return createPropertyRows(
        filteredProperties,
        numberOfColumns,
      );
    }, [
      filteredProperties,
      numberOfColumns,
    ]);

  // ==========================================================
  // HEADER
  // ==========================================================

  const renderHeader = () => (
    <>
      {/* ====================================================
          HEADER
      ==================================================== */}

      <View className="flex-row items-center justify-between border-b border-[#222] bg-[#0d0d0d] px-5 pb-3.5 pt-2.5">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-white">
            {screenTitle}
          </Text>

          {isAllPropertiesMode && (
            <Text className="mt-1 text-sm text-gray-500">
              Explore all available
              properties
            </Text>
          )}
        </View>

        <Pressable
          onPress={() =>
            setMenuVisible(
              true,
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-[#181818]"
        >
          <Ionicons
            name="menu-outline"
            size={26}
            color="#fff"
          />
        </Pressable>
      </View>

      {/* ====================================================
          SEARCH
      ==================================================== */}

      <View className="px-5 pt-4">
        <View className="flex-row items-center rounded-xl border border-[#292929] bg-[#171717] px-4">
          <Ionicons
            name="search-outline"
            size={20}
            color="#777"
          />

          <TextInput
            value={searchQuery}
            onChangeText={
              setSearchQuery
            }
            placeholder="Search properties..."
            placeholderTextColor="#666"
            className="ml-3 flex-1 py-3.5 text-sm text-white"
            returnKeyType="search"
          />

          {searchQuery.length >
            0 && (
            <Pressable
              onPress={
                clearSearch
              }
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#ef4444"
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* ====================================================
          LISTING FILTERS
      ==================================================== */}

      <View className="px-5 pt-3">
        <View className="flex-row gap-2">
          {/* ==================================================
              ALL
          ================================================== */}

          <Pressable
            onPress={() =>
              setListingFilter(
                "all",
              )
            }
            className={`flex-1 items-center justify-center rounded-xl px-3 py-3 ${
              listingFilter ===
              "all"
                ? "bg-red-600"
                : "bg-[#181818]"
            }`}
          >
            <Text className="text-sm font-semibold text-white">
              All
            </Text>
          </Pressable>

          {/* ==================================================
              FOR SALE
          ================================================== */}

          <Pressable
            onPress={() =>
              setListingFilter(
                "sale",
              )
            }
            className={`flex-1 items-center justify-center rounded-xl px-3 py-3 ${
              listingFilter ===
              "sale"
                ? "bg-red-600"
                : "bg-[#181818]"
            }`}
          >
            <Text className="text-sm font-semibold text-white">
              For Sale
            </Text>
          </Pressable>

          {/* ==================================================
              FOR RENT
          ================================================== */}

          <Pressable
            onPress={() =>
              setListingFilter(
                "rent",
              )
            }
            className={`flex-1 items-center justify-center rounded-xl px-3 py-3 ${
              listingFilter ===
              "rent"
                ? "bg-red-600"
                : "bg-[#181818]"
            }`}
          >
            <Text className="text-sm font-semibold text-white">
              For Rent
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ====================================================
          PROPERTY COUNT
      ==================================================== */}

      <View className="px-5 pb-2 pt-4">
        <Text className="text-sm font-medium text-gray-500">
          {filteredProperties.length}{" "}
          {filteredProperties.length ===
          1
            ? "property"
            : "properties"}
        </Text>
      </View>
    </>
  );

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

        <View className="flex-row items-center justify-between border-b border-[#222] px-5 pb-3.5 pt-2.5">
          <Text className="text-2xl font-bold text-white">
            {screenTitle}
          </Text>

          <Pressable
            onPress={() =>
              setMenuVisible(
                true,
              )
            }
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
          visible={
            menuVisible
          }
          onClose={() =>
            setMenuVisible(
              false,
            )
          }
        />
      </SafeAreaView>
    );
  }

  // ==========================================================
  // ERROR SCREEN
  // ==========================================================

  if (
    error &&
    properties.length === 0
  ) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0d0d0d"
        />

        <View className="flex-row items-center justify-between border-b border-[#222] px-5 pb-3.5 pt-2.5">
          <Text className="text-2xl font-bold text-white">
            {screenTitle}
          </Text>

          <Pressable
            onPress={() =>
              setMenuVisible(
                true,
              )
            }
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

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent:
              "center",
            paddingHorizontal: 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
              tintColor="#ef4444"
              colors={[
                "#ef4444",
              ]}
            />
          }
        >
          <View className="items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-10">
            <Ionicons
              name="cloud-offline-outline"
              size={50}
              color="#555"
            />

            <Text className="mt-4 text-center text-lg font-semibold text-white">
              Unable to load
              properties
            </Text>

            <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
              {error}
            </Text>

            <Pressable
              onPress={
                handleRefresh
              }
              className="mt-6 rounded-xl bg-red-600 px-6 py-3.5 active:bg-red-700"
            >
              <Text className="font-bold text-white">
                Try Again
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <SideMenu
          visible={
            menuVisible
          }
          onClose={() =>
            setMenuVisible(
              false,
            )
          }
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

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor="#ef4444"
            colors={[
              "#ef4444",
            ]}
          />
        }
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        {renderHeader()}

        {/* ==================================================
            EMPTY RESULTS
        ================================================== */}

        {filteredProperties.length ===
        0 ? (
          <View className="mx-5 mt-8 items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-12">
            <Ionicons
              name="home-outline"
              size={52}
              color="#444"
            />

            <Text className="mt-4 text-lg font-semibold text-gray-400">
              No properties
              found
            </Text>

            <Text className="mt-1 text-center text-sm text-gray-600">
              Try changing
              your search or
              listing filter.
            </Text>

            {searchQuery.length >
              0 && (
              <Pressable
                onPress={
                  clearSearch
                }
                className="mt-5 rounded-xl bg-red-600 px-5 py-3"
              >
                <Text className="font-semibold text-white">
                  Clear Search
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          // ==================================================
          // PROPERTY GRID
          // ==================================================

          <View className="px-5 pt-2">
            {propertyRows.map(
              (
                row,
                rowIndex,
              ) => (
                <View
                  key={`property-row-${rowIndex}`}
                  className={
                    numberOfColumns ===
                    2
                      ? "mb-5 flex-row gap-4"
                      : "mb-5"
                  }
                >
                  {row.map(
                    (
                      property,
                      propertyIndex,
                    ) => (
                      <View
                        key={`${getPropertyId(
                          property,
                        )}-${propertyIndex}`}
                        className={
                          numberOfColumns ===
                          2
                            ? "flex-1"
                            : "w-full"
                        }
                      >
                        <PropertyCard
                          property={
                            property
                          }
                          isFullWidth={
                            numberOfColumns ===
                            1
                          }
                          onPress={
                            handlePropertyPress
                          }
                        />
                      </View>
                    ),
                  )}

                  {/* ==================================================
                      EMPTY COLUMN
                  ================================================== */}

                  {numberOfColumns ===
                    2 &&
                    row.length ===
                      1 && (
                      <View className="flex-1" />
                    )}
                </View>
              ),
            )}
          </View>
        )}
      </ScrollView>

      {/* ========================================================
          AUTH MODAL
      ======================================================== */}

      {/*
      <AuthRequiredModal
        visible={
          authModalVisible
        }
        onClose={() =>
          setAuthModalVisible(
            false,
          )
        }
      />
      */}

      {/* ========================================================
          SIDE MENU
      ======================================================== */}

      <SideMenu
        visible={
          menuVisible
        }
        onClose={() =>
          setMenuVisible(
            false,
          )
        }
      />
    </SafeAreaView>
  );
}