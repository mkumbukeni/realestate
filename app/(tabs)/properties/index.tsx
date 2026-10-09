
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
} from "@/app/types/properties/property";

import {
  useTheme,
} from "@/app/components/theme/ThemeContext";

import {
  useAuth,
} from "@/app/components/auth/AuthContext";

import AuthRequiredModal from "@/app/components/auth/AuthRequiredModal";

import LoginModal from "@/app/components/auth/LoginModal";

import RegisterModal from "@/app/components/auth/RegisterModal";

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

  /*
   * ==========================================================
   * THEME
   * ==========================================================
   */

  const { isDark } = useTheme();

  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  const {
    isLoggedIn,
  } = useAuth();

  // ==========================================================
  // ROUTE PARAMETERS
  // ==========================================================

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

  const [
    openDropdown,
    setOpenDropdown,
  ] =
    useState<ListingFilter | null>(
      null,
    );

  // ==========================================================
  // AUTH MODAL STATE
  // ==========================================================

  const [
    pendingProperty,
    setPendingProperty,
  ] = useState<Property | null>(
    null,
  );

  const [
    authRequiredVisible,
    setAuthRequiredVisible,
  ] = useState(false);

  const [
    loginVisible,
    setLoginVisible,
  ] = useState(false);

  const [
    registerVisible,
    setRegisterVisible,
  ] = useState(false);

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
  // OPEN PROPERTY DETAILS
  // ==========================================================

  const openPropertyDetails =
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
  // PROPERTY PRESS
  // ==========================================================

  const handlePropertyPress =
    useCallback(
      (property: Property) => {
        if (isLoggedIn) {
          openPropertyDetails(
            property,
          );

          return;
        }

        setPendingProperty(
          property,
        );

        setAuthRequiredVisible(
          true,
        );
      },
      [
        isLoggedIn,
        openPropertyDetails,
      ],
    );

  // ==========================================================
  // AUTH REQUIRED -> LOGIN
  // ==========================================================

  const handleAuthRequiredLogin =
    useCallback(() => {
      setAuthRequiredVisible(
        false,
      );

      setLoginVisible(true);
    }, []);

  // ==========================================================
  // AUTH REQUIRED -> REGISTER
  // ==========================================================

  const handleAuthRequiredRegister =
    useCallback(() => {
      setAuthRequiredVisible(
        false,
      );

      setRegisterVisible(true);
    }, []);

  // ==========================================================
  // LOGIN SUCCESS
  // ==========================================================

  const handleLoginSuccess =
    useCallback(
      (
        _email: string,
        _response: Record<
          string,
          unknown
        >,
      ) => {
        setLoginVisible(false);

        if (
          pendingProperty
        ) {
          const propertyToOpen =
            pendingProperty;

          setPendingProperty(
            null,
          );

          openPropertyDetails(
            propertyToOpen,
          );
        }
      },
      [
        pendingProperty,
        openPropertyDetails,
      ],
    );

  // ==========================================================
  // REGISTRATION SUCCESS
  // ==========================================================

  const handleRegistrationComplete =
    useCallback(() => {
      /*
       * Keep the pending property.
       *
       * Registration does not automatically authenticate
       * the user, so send them to login next.
       */
      setRegisterVisible(false);
      setLoginVisible(true);
    }, []);

  // ==========================================================
  // CLOSE AUTH REQUIRED MODAL
  // ==========================================================

  const handleCloseAuthRequired =
    useCallback(() => {
      setAuthRequiredVisible(
        false,
      );

      setPendingProperty(
        null,
      );
    }, []);

  // ==========================================================
  // CLOSE LOGIN MODAL
  // ==========================================================

  const handleCloseLogin =
    useCallback(() => {
      setLoginVisible(false);
    }, []);

  // ==========================================================
  // CLOSE REGISTER MODAL
  // ==========================================================

  const handleCloseRegister =
    useCallback(() => {
      setRegisterVisible(false);
    }, []);

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
      <View
        className={`absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-xl border shadow-lg ${
          isDark
            ? "border-[#292929] bg-[#171717]"
            : "border-gray-200 bg-white"
        }`}
      >
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
                className={`flex-row items-center justify-between border-b px-4 py-3.5 ${
                  isDark
                    ? "border-[#292929]"
                    : "border-gray-200"
                } ${
                  selected
                    ? "bg-red-600"
                    : isDark
                      ? "bg-[#171717]"
                      : "bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selected
                      ? "text-white"
                      : isDark
                        ? "text-gray-300"
                        : "text-gray-700"
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
      <View
        className={
          isDark
            ? "bg-[#0d0d0d]"
            : "bg-white"
        }
      >
        <View
          className={`border-b px-5 pb-3.5 pt-2.5 ${
            isDark
              ? "border-[#222]"
              : "border-gray-200"
          }`}
        >
          <Text
            className={`text-2xl font-bold ${
              isDark
                ? "text-white"
                : "text-black"
            }`}
          >
            {screenTitle}
          </Text>

          {isAllPropertiesMode && (
            <Text
              className={`mt-1 text-sm ${
                isDark
                  ? "text-gray-500"
                  : "text-gray-600"
              }`}
            >
              Explore all available
              properties
            </Text>
          )}
        </View>

        <View className="px-5 pt-4">
          <View
            className={`flex-row items-center rounded-xl border px-4 ${
              isDark
                ? "border-[#292929] bg-[#171717]"
                : "border-gray-200 bg-white"
            }`}
            style={
              isDark
                ? undefined
                : {
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 2,
                  }
            }
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={
                isDark
                  ? "#777"
                  : "#737373"
              }
            />

            <TextInput
              value={searchQuery}
              onChangeText={
                setSearchQuery
              }
              placeholder="Search properties..."
              placeholderTextColor={
                isDark
                  ? "#666"
                  : "#a3a3a3"
              }
              className={`ml-3 flex-1 py-3.5 text-sm ${
                isDark
                  ? "text-white"
                  : "text-black"
              }`}
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

        <View className="px-5 pb-4 pt-3">
          <View className="flex-row gap-2">
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
                    : isDark
                      ? "bg-[#181818]"
                      : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    listingFilter ===
                    "all"
                      ? "text-white"
                      : isDark
                        ? "text-gray-200"
                        : "text-gray-800"
                  }`}
                >
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
                  color={
                    listingFilter ===
                    "all"
                      ? "#ffffff"
                      : isDark
                        ? "#d4d4d4"
                        : "#525252"
                  }
                  style={{
                    marginLeft: 6,
                  }}
                />
              </Pressable>

              {renderDropdown(
                "all",
              )}
            </View>

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
                    : isDark
                      ? "bg-[#181818]"
                      : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    listingFilter ===
                    "sale"
                      ? "text-white"
                      : isDark
                        ? "text-gray-200"
                        : "text-gray-800"
                  }`}
                >
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
                  color={
                    listingFilter ===
                    "sale"
                      ? "#ffffff"
                      : isDark
                        ? "#d4d4d4"
                        : "#525252"
                  }
                  style={{
                    marginLeft: 6,
                  }}
                />
              </Pressable>

              {renderDropdown(
                "sale",
              )}
            </View>

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
                    : isDark
                      ? "bg-[#181818]"
                      : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    listingFilter ===
                    "rent"
                      ? "text-white"
                      : isDark
                        ? "text-gray-200"
                        : "text-gray-800"
                  }`}
                >
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
                  color={
                    listingFilter ===
                    "rent"
                      ? "#ffffff"
                      : isDark
                        ? "#d4d4d4"
                        : "#525252"
                  }
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

          {propertyTypeFilter !==
            "all" && (
            <View className="mt-2 items-center">
              <Pressable
                onPress={() =>
                  setPropertyTypeFilter(
                    "all",
                  )
                }
                className="flex-row items-center rounded-lg px-3 py-1.5"
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

          <Text
            className={`mt-3 text-sm font-medium ${
              isDark
                ? "text-gray-500"
                : "text-gray-600"
            }`}
          >
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
      <SafeAreaView
        className={`flex-1 ${
          isDark
            ? "bg-[#0d0d0d]"
            : "bg-white"
        }`}
      >
        <StatusBar
          barStyle={
            isDark
              ? "light-content"
              : "dark-content"
          }
          backgroundColor={
            isDark
              ? "#0d0d0d"
              : "#ffffff"
          }
        />

        <View
          className={`border-b px-5 pb-3.5 pt-2.5 ${
            isDark
              ? "border-[#222]"
              : "border-gray-200"
          }`}
        >
          <Text
            className={`text-2xl font-bold ${
              isDark
                ? "text-white"
                : "text-black"
            }`}
          >
            {screenTitle}
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#ef4444"
          />

          <Text
            className={`mt-4 text-sm ${
              isDark
                ? "text-gray-400"
                : "text-gray-600"
            }`}
          >
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
      <SafeAreaView
        className={`flex-1 ${
          isDark
            ? "bg-[#0d0d0d]"
            : "bg-white"
        }`}
      >
        <StatusBar
          barStyle={
            isDark
              ? "light-content"
              : "dark-content"
          }
          backgroundColor={
            isDark
              ? "#0d0d0d"
              : "#ffffff"
          }
        />

        <View
          className={`border-b px-5 pb-3.5 pt-2.5 ${
            isDark
              ? "border-[#222]"
              : "border-gray-200"
          }`}
        >
          <Text
            className={`text-2xl font-bold ${
              isDark
                ? "text-white"
                : "text-black"
            }`}
          >
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
          <View
            className={`items-center rounded-2xl border px-5 py-10 ${
              isDark
                ? "border-[#292929] bg-[#171717]"
                : "border-gray-200 bg-white"
            }`}
            style={
              isDark
                ? undefined
                : {
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.08,
                    shadowRadius: 5,
                    elevation: 3,
                  }
            }
          >
            <Ionicons
              name="cloud-offline-outline"
              size={50}
              color={
                isDark
                  ? "#555"
                  : "#9ca3af"
              }
            />

            <Text
              className={`mt-4 text-center text-lg font-semibold ${
                isDark
                  ? "text-white"
                  : "text-black"
              }`}
            >
              Unable to load
              properties
            </Text>

            <Text
              className={`mt-2 text-center text-sm leading-5 ${
                isDark
                  ? "text-gray-500"
                  : "text-gray-600"
              }`}
            >
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
    <SafeAreaView
      className={`flex-1 ${
        isDark
          ? "bg-[#0d0d0d]"
          : "bg-white"
      }`}
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={
          isDark
            ? "#0d0d0d"
            : "#ffffff"
        }
      />

      {/* FIXED HEADER */}

      {renderHeader()}

      {/* PROPERTY CARDS */}

      <ScrollView
        className={
          isDark
            ? "flex-1 bg-[#0d0d0d]"
            : "flex-1 bg-white"
        }
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
          <View
            className={`mt-8 items-center rounded-2xl border px-5 py-12 ${
              isDark
                ? "border-[#292929] bg-[#171717]"
                : "border-gray-200 bg-white"
            }`}
            style={
              isDark
                ? undefined
                : {
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.08,
                    shadowRadius: 5,
                    elevation: 3,
                  }
            }
          >
            <Ionicons
              name="home-outline"
              size={52}
              color={
                isDark
                  ? "#444"
                  : "#9ca3af"
              }
            />

            <Text
              className={`mt-4 text-lg font-semibold ${
                isDark
                  ? "text-gray-400"
                  : "text-gray-700"
              }`}
            >
              No properties
              found
            </Text>

            <Text
              className={`mt-1 text-center text-sm ${
                isDark
                  ? "text-gray-600"
                  : "text-gray-500"
              }`}
            >
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

      {/* ====================================================
          AUTH REQUIRED MODAL
      ===================================================== */}

      <AuthRequiredModal
        visible={
          authRequiredVisible
        }
        onClose={
          handleCloseAuthRequired
        }
        onLogin={
          handleAuthRequiredLogin
        }
        onRegister={
          handleAuthRequiredRegister
        }
      />

      {/* ====================================================
          LOGIN MODAL
      ===================================================== */}

      <LoginModal
        visible={
          loginVisible
        }
        onClose={
          handleCloseLogin
        }
        onLogin={
          handleLoginSuccess
        }
        onRegister={() => {
          setLoginVisible(false);
          setRegisterVisible(true);
        }}
      />

      {/* ====================================================
          REGISTER MODAL
      ===================================================== */}

      <RegisterModal
        visible={
          registerVisible
        }
        onClose={
          handleCloseRegister
        }
        onRegister={
          handleRegistrationComplete
        }
        onLogin={() => {
          setRegisterVisible(false);
          setLoginVisible(true);
        }}
      />
    </SafeAreaView>
  );
}

