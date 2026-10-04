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

type PropertyTypeFilter =
  | "all"
  | "residential"
  | "commercial"
  | "industrial"
  | "agricultural";

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
// PROPERTY CATEGORY LABEL
// ============================================================

function getPropertyTypeLabel(
  value: PropertyTypeFilter,
): string {
  switch (value) {
    case "residential":
      return "Residential";

    case "commercial":
      return "Commercial";

    case "industrial":
      return "Industrial";

    case "agricultural":
      return "Agricultural";

    default:
      return "All";
  }
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
    propertyTypeFilter,
    setPropertyTypeFilter,
  ] =
    useState<PropertyTypeFilter>(
      "all",
    );

  // Which of the three dropdowns
  // is currently open.
  const [
    openDropdown,
    setOpenDropdown,
  ] =
    useState<ListingFilter | null>(
      null,
    );

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

        if (
          !isAllPropertiesMode
        ) {
          let result: Property[] =
            [];

          switch (
            selectedCategory
          ) {
            case "Featured Properties":
              result =
                await fetchFeaturedProperties();
              break;

            case "Most Viewed":
              result =
                await fetchMostViewedProperties();
              break;

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

        const [
          newToMarket,
          featured,
          mostViewed,
        ] = await Promise.all([
          fetchProperties(),
          fetchFeaturedProperties(),
          fetchMostViewedProperties(),
        ]);

        const openHouses =
          newToMarket.filter(
            (property) =>
              property.isOpenHouse ===
              true,
          );

        const combinedProperties = [
          ...featured,
          ...newToMarket,
          ...openHouses,
          ...mostViewed,
        ];

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
          const listingType =
            String(
              property.tag ?? "",
            )
              .trim()
              .toLowerCase();

          // ----------------------------------------------
          // SALE / RENT FILTER
          // ----------------------------------------------

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

          if (
            !matchesListingFilter
          ) {
            return false;
          }

          // ----------------------------------------------
          // PROPERTY TYPE FILTER
          // ----------------------------------------------

          if (
            propertyTypeFilter !==
            "all"
          ) {
            const propertyType =
              String(
                property.type ??
                  property.category ??
                  "",
              )
                .trim()
                .toLowerCase();

            const propertyDesign =
              String(
                property.propertyDesign ??
                  "",
              )
                .trim()
                .toLowerCase();

            const combinedType =
              `${propertyType} ${propertyDesign}`;

            if (
              !combinedType.includes(
                propertyTypeFilter,
              )
            ) {
              return false;
            }
          }

          // ----------------------------------------------
          // SEARCH FILTER
          // ----------------------------------------------

          if (
            searchText === ""
          ) {
            return true;
          }

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
      propertyTypeFilter,
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
      [router],
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
  // SELECT LISTING FILTER
  // ==========================================================

  const handleListingFilterPress =
    (
      filter: ListingFilter,
    ) => {
      setOpenDropdown(
        openDropdown === filter
          ? null
          : filter,
      );

      setListingFilter(
        filter,
      );
    };

  // ==========================================================
  // SELECT PROPERTY TYPE
  // ==========================================================

  const handlePropertyTypeSelect =
    (
      type: PropertyTypeFilter,
    ) => {
      setPropertyTypeFilter(
        type,
      );

      setOpenDropdown(null);
    };

  // ==========================================================
  // DROPDOWN
  // ==========================================================

  const renderDropdown = (
    filter: ListingFilter,
  ) => {
    if (
      openDropdown !==
      filter
    ) {
      return null;
    }

    const options: {
      value: PropertyTypeFilter;
      label: string;
    }[] = [
      {
        value: "all",
        label: "All",
      },
      {
        value: "residential",
        label: "Residential",
      },
      {
        value: "commercial",
        label: "Commercial",
      },
      {
        value: "industrial",
        label: "Industrial",
      },
      {
        value: "agricultural",
        label: "Agricultural",
      },
    ];

    return (
      <View className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-xl border border-[#292929] bg-[#171717] shadow-lg">
        {options.map(
          (option) => {
            const selected =
              propertyTypeFilter ===
              option.value;

            return (
              <Pressable
                key={
                  option.value
                }
                onPress={() =>
                  handlePropertyTypeSelect(
                    option.value,
                  )
                }
                className={`flex-row items-center justify-between border-b border-[#292929] px-4 py-3.5 ${
                  selected
                    ? "bg-red-600"
                    : "bg-[#171717]"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selected
                      ? "text-white"
                      : "text-gray-300"
                  }`}
                >
                  {
                    option.label
                  }
                </Text>

                {selected && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color="#ffffff"
                  />
                )}
              </Pressable>
            );
          },
        )}
      </View>
    );
  };

  // ==========================================================
  // HEADER CONTENT
  // ==========================================================

  const renderHeader =
    () => (
      <View className="bg-[#0d0d0d]">
        {/* ================================================
            TITLE
        ================================================= */}

        <View className="border-b border-[#222] px-5 pb-3.5 pt-2.5">
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

        {/* ================================================
            SEARCH
        ================================================= */}

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

        {/* ================================================
            FILTER BUTTONS
        ================================================= */}

        <View className="px-5 pb-4 pt-3">
          <View className="flex-row gap-2">
            {/* ============================================
                ALL
            ============================================= */}

            <View className="relative flex-1">
              <Pressable
                onPress={() =>
                  handleListingFilterPress(
                    "all",
                  )
                }
                className={`flex-row items-center justify-center rounded-xl px-3 py-3 ${
                  listingFilter ===
                  "all"
                    ? "bg-red-600"
                    : "bg-[#181818]"
                }`}
              >
                <Text className="text-sm font-semibold text-white">
                  All
                </Text>

                <Ionicons
                  name={
                    openDropdown ===
                    "all"
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={16}
                  color="#ffffff"
                  style={{
                    marginLeft: 6,
                  }}
                />
              </Pressable>

              {renderDropdown(
                "all",
              )}
            </View>

            {/* ============================================
                FOR SALE
            ============================================= */}

            <View className="relative flex-1">
              <Pressable
                onPress={() =>
                  handleListingFilterPress(
                    "sale",
                  )
                }
                className={`flex-row items-center justify-center rounded-xl px-3 py-3 ${
                  listingFilter ===
                  "sale"
                    ? "bg-red-600"
                    : "bg-[#181818]"
                }`}
              >
                <Text className="text-sm font-semibold text-white">
                  For Sale
                </Text>

                <Ionicons
                  name={
                    openDropdown ===
                    "sale"
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={16}
                  color="#ffffff"
                  style={{
                    marginLeft: 6,
                  }}
                />
              </Pressable>

              {renderDropdown(
                "sale",
              )}
            </View>

            {/* ============================================
                FOR RENT
            ============================================= */}

            <View className="relative flex-1">
              <Pressable
                onPress={() =>
                  handleListingFilterPress(
                    "rent",
                  )
                }
                className={`flex-row items-center justify-center rounded-xl px-3 py-3 ${
                  listingFilter ===
                  "rent"
                    ? "bg-red-600"
                    : "bg-[#181818]"
                }`}
              >
                <Text className="text-sm font-semibold text-white">
                  For Rent
                </Text>

                <Ionicons
                  name={
                    openDropdown ===
                    "rent"
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={16}
                  color="#ffffff"
                  style={{
                    marginLeft: 6,
                  }}
                />
              </Pressable>

              {renderDropdown(
                "rent",
              )}
            </View>
          </View>

          {/* ==============================================
              ACTIVE CATEGORY
          =============================================== */}

          {propertyTypeFilter !==
            "all" && (
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-sm text-gray-500">
                Property type:
              </Text>

              <Pressable
                onPress={() =>
                  setPropertyTypeFilter(
                    "all",
                  )
                }
                className="flex-row items-center"
              >
                <Text className="mr-1 text-sm font-semibold text-red-500">
                  {getPropertyTypeLabel(
                    propertyTypeFilter,
                  )}
                </Text>

                <Ionicons
                  name="close-circle"
                  size={17}
                  color="#ef4444"
                />
              </Pressable>
            </View>
          )}

          {/* ==============================================
              COUNT
          =============================================== */}

          <Text className="mt-3 text-sm font-medium text-gray-500">
            {filteredProperties.length}{" "}
            {filteredProperties.length ===
            1
              ? "property"
              : "properties"}
          </Text>
        </View>
      </View>
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

        <View className="px-5 pb-3.5 pt-2.5">
          <Text className="text-2xl font-bold text-white">
            {screenTitle}
          </Text>
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

        <View className="px-5 pb-3.5 pt-2.5">
          <Text className="text-2xl font-bold text-white">
            {screenTitle}
          </Text>
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

      {/* ====================================================
          FIXED HEADER
          This section does NOT scroll.
      ===================================================== */}

      {renderHeader()}

      {/* ====================================================
          SCROLLING PROPERTY CARDS ONLY
      ===================================================== */}

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
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 30,
        }}
      >
        {filteredProperties.length ===
        0 ? (
          <View className="mt-8 items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-12">
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
          <View>
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
    </SafeAreaView>
  );
}