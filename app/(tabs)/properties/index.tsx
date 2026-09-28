import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";

import SideMenu from "../../components/sidebar/SideMenu";
// import AuthRequiredModal from "../../components/auth/AuthRequiredModal";
import PropertyCard from "../../components/properties/PropertyCard";

import {
  fetchFeaturedProperties,
  fetchMostViewedProperties,
  fetchProperties,
} from "../../services/propertyApi";

import type { Property } from "../../data/data";

type PropertyCategory =
  | "Featured Properties"
  | "New to Market"
  | "Open Houses"
  | "Most Viewed"
  | null;

type FilterType = "All" | "For Sale" | "For Rent";

type PropertySection = {
  title: string;
  data: Property[];
};

const getCategory = (
  category: string | string[] | undefined,
): PropertyCategory => {
  const value = Array.isArray(category)
    ? category[0]
    : category;

  if (
    value === "Featured Properties" ||
    value === "New to Market" ||
    value === "Open Houses" ||
    value === "Most Viewed"
  ) {
    return value;
  }

  return null;
};

const getPropertyId = (
  property: Property,
): string => {
  return String(property.id);
};

export default function PropertiesScreen() {
  const router = useRouter();

  const {
    width: screenWidth,
    height: screenHeight,
  } = useWindowDimensions();

  const params = useLocalSearchParams<{
    category?: string | string[];
  }>();

  const selectedCategory = getCategory(
    params.category,
  );

  const [properties, setProperties] = useState<
    Property[]
  >([]);

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<FilterType>("All");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [menuVisible, setMenuVisible] =
    useState(false);

  /*
   * Authentication check temporarily disabled.
   *
   * Keep this code commented so it can be restored later.
   *
   * const [authModalVisible, setAuthModalVisible] =
   *   useState(false);
   *
   * const isLoggedIn = false;
   */

  /*
   * --------------------------------------------------
   * RESPONSIVE LAYOUT
   * --------------------------------------------------
   *
   * Portrait phone:
   *
   *        [ PROPERTY CARD ]
   *
   *        [ PROPERTY CARD ]
   *
   * Landscape:
   *
   * [ CARD ]       [ CARD ]
   *
   * [ CARD ]       [ CARD ]
   *
   * Tablet / large screen:
   *
   * [ CARD ] [ CARD ] [ CARD ]
   *
   * The number of columns is calculated automatically.
   */

  const isLandscape =
    screenWidth > screenHeight;

  const numColumns = useMemo(() => {
    /*
     * Normal portrait phones use one column.
     */
    if (
      !isLandscape &&
      screenWidth < 600
    ) {
      return 1;
    }

    const horizontalPadding = 32;
    const gap = 20;

    const availableWidth =
      screenWidth - horizontalPadding;

    /*
     * Minimum desired width of a card.
     */
    const minimumCardWidth = 260;

    const columns = Math.floor(
      (availableWidth + gap) /
        (minimumCardWidth + gap),
    );

    /*
     * Landscape should always have
     * at least two columns.
     */
    if (isLandscape) {
      return Math.max(2, columns);
    }

    return Math.max(1, columns);
  }, [screenWidth, isLandscape]);

  /*
   * Calculate the exact width of each card.
   */
  const cardWidth = useMemo(() => {
    const horizontalPadding = 32;
    const gap = 20;

    const availableWidth =
      screenWidth - horizontalPadding;

    if (numColumns === 1) {
      return availableWidth;
    }

    const totalGaps =
      gap * (numColumns - 1);

    return (
      (availableWidth - totalGaps) /
      numColumns
    );
  }, [screenWidth, numColumns]);

  /*
   * --------------------------------------------------
   * LOAD PROPERTIES
   * --------------------------------------------------
   */

  const loadProperties =
    useCallback(async () => {
      try {
        setLoading(true);

        let data: Property[] = [];

        switch (selectedCategory) {
          case "Featured Properties":
            data =
              await fetchFeaturedProperties();
            break;

          case "Most Viewed":
            data =
              await fetchMostViewedProperties();
            break;

          case "Open Houses": {
            const allProperties =
              await fetchProperties();

            data = allProperties.filter(
              (property) =>
                property.isOpenHouse === true,
            );

            break;
          }

          case "New to Market":
            data =
              await fetchProperties();
            break;

          default:
            data =
              await fetchProperties();
            break;
        }

        setProperties(data);
      } catch (error) {
        console.error(
          "Failed to load properties:",
          error,
        );

        setProperties([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [selectedCategory]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadProperties();
  }, [loadProperties]);

  /*
   * --------------------------------------------------
   * PROPERTY PRESS
   * --------------------------------------------------
   *
   * Authentication requirement temporarily disabled.
   *
   * Previously, this checked whether the user was
   * logged in before opening the property details.
   *
   * The check is kept below as comments so it can
   * easily be restored later.
   */

  const handlePropertyPress =
    useCallback(
      (property: Property) => {
        /*
         * AUTHENTICATION CHECK DISABLED
         *
         * if (!isLoggedIn) {
         *   setAuthModalVisible(true);
         *   return;
         * }
         */

        router.push({
          pathname:
            "/(tabs)/properties/[id]",
          params: {
            id: getPropertyId(property),
          },
        });
      },
      [router],
    );

  /*
   * --------------------------------------------------
   * SEARCH + FILTER
   * --------------------------------------------------
   */

  const filteredProperties =
    useMemo(() => {
      let result = properties;

      if (filter === "For Sale") {
        result = result.filter(
          (property) => {
            const value = String(
              property.listingType ??
                property.listing_type ??
                property.status ??
                "",
            ).toLowerCase();

            return (
              value.includes("sale") ||
              value.includes("sell") ||
              value === "for_sale"
            );
          },
        );
      }

      if (filter === "For Rent") {
        result = result.filter(
          (property) => {
            const value = String(
              property.listingType ??
                property.listing_type ??
                property.status ??
                "",
            ).toLowerCase();

            return (
              value.includes("rent") ||
              value.includes("rental") ||
              value === "for_rent"
            );
          },
        );
      }

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return result;
      }

      return result.filter(
        (property) => {
          const searchableText = [
            property.title,
            property.description,
            property.propertyType,
            property.property_type,
            property.type,
            property.location?.city,
            property.location?.district,
            property.location?.area,
            property.location?.address,
            property.location?.country,
            property.status,
            property.listingType,
            property.listing_type,
            ...(Array.isArray(
              property.tags,
            )
              ? property.tags
              : []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            query,
          );
        },
      );
    }, [
      properties,
      search,
      filter,
    ]);

  /*
   * --------------------------------------------------
   * PROPERTY SECTIONS
   * --------------------------------------------------
   */

  const propertySections =
    useMemo<PropertySection[]>(() => {
      if (selectedCategory) {
        return [
          {
            title: selectedCategory,
            data: filteredProperties,
          },
        ];
      }

      const forSale =
        filteredProperties.filter(
          (property) => {
            const value = String(
              property.listingType ??
                property.listing_type ??
                property.status ??
                "",
            ).toLowerCase();

            return (
              value.includes("sale") ||
              value.includes("sell") ||
              value === "for_sale"
            );
          },
        );

      const forRent =
        filteredProperties.filter(
          (property) => {
            const value = String(
              property.listingType ??
                property.listing_type ??
                property.status ??
                "",
            ).toLowerCase();

            return (
              value.includes("rent") ||
              value.includes("rental") ||
              value === "for_rent"
            );
          },
        );

      return [
        {
          title: "For Sale",
          data: forSale,
        },
        {
          title: "For Rent",
          data: forRent,
        },
      ];
    }, [
      filteredProperties,
      selectedCategory,
    ]);

  const screenTitle =
    selectedCategory ?? "Real Estate";

  /*
   * --------------------------------------------------
   * PROPERTY GRID
   * --------------------------------------------------
   *
   * Properties are manually divided into rows.
   *
   * IMPORTANT:
   *
   * justifyContent is set to "center" when:
   *
   * 1. We are on a portrait phone, OR
   * 2. The final row does not have enough cards.
   *
   * This prevents cards from being stuck on
   * the left side of the screen.
   */

  const renderPropertyGrid =
    useCallback(
      (
        section: PropertySection,
      ) => {
        const rows: Property[][] = [];

        for (
          let i = 0;
          i < section.data.length;
          i += numColumns
        ) {
          rows.push(
            section.data.slice(
              i,
              i + numColumns,
            ),
          );
        }

        return (
          <View className="w-full">
            {rows.map(
              (row, rowIndex) => {
                /*
                 * Center the row when:
                 *
                 * - there is only one column, OR
                 * - this is an incomplete final row.
                 */
                const shouldCenter =
                  numColumns === 1 ||
                  row.length < numColumns;

                return (
                  <View
                    key={`${section.title}-row-${rowIndex}`}
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      justifyContent:
                        shouldCenter
                          ? "center"
                          : "flex-start",
                      marginBottom: 24,
                    }}
                  >
                    {row.map(
                      (
                        property,
                        columnIndex,
                      ) => {
                        const isLastColumn =
                          columnIndex ===
                          row.length - 1;

                        return (
                          <View
                            key={getPropertyId(
                              property,
                            )}
                            style={{
                              width: cardWidth,
                              marginRight:
                                isLastColumn
                                  ? 0
                                  : 20,
                            }}
                          >
                            <PropertyCard
                              property={
                                property
                              }
                              isFullWidth
                              onPress={
                                handlePropertyPress
                              }
                            />
                          </View>
                        );
                      },
                    )}
                  </View>
                );
              },
            )}
          </View>
        );
      },
      [
        numColumns,
        cardWidth,
        handlePropertyPress,
      ],
    );

  /*
   * --------------------------------------------------
   * EMPTY STATE
   * --------------------------------------------------
   */

  const renderEmptyComponent =
    useCallback(() => {
      if (loading) {
        return null;
      }

      return (
        <View className="items-center justify-center px-6 py-20">
          <Ionicons
            name="home-outline"
            size={54}
            color="#71717a"
          />

          <Text className="mt-4 text-center text-lg font-semibold text-white">
            No properties found
          </Text>

          <Text className="mt-2 text-center text-sm text-zinc-400">
            Try changing your search or
            filter.
          </Text>
        </View>
      );
    }, [loading]);

  /*
   * --------------------------------------------------
   * SCREEN
   * --------------------------------------------------
   */

  return (
    <SafeAreaView
      className="flex-1 bg-[#0d0d0d]"
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      {/* HEADER */}
      <View className="border-b border-zinc-800 px-4 pb-4 pt-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-2xl font-bold text-white">
              {screenTitle}
            </Text>

            <Text className="mt-1 text-sm text-zinc-400">
              Find your next property
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setMenuVisible(true)
            }
            className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
          >
            <Ionicons
              name="menu-outline"
              size={25}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View className="mt-4 flex-row items-center rounded-xl bg-[#171717] px-4">
          <Ionicons
            name="search-outline"
            size={21}
            color="#a1a1aa"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by location, type, or tag..."
            placeholderTextColor="#71717a"
            className="ml-3 h-12 flex-1 text-base text-white"
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setSearch("")
              }
            >
              <Ionicons
                name="close-circle"
                size={21}
                color="#71717a"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTERS */}
        {!selectedCategory && (
          <View className="mt-4 flex-row">
            {(
              [
                "All",
                "For Sale",
                "For Rent",
              ] as FilterType[]
            ).map((item) => {
              const active =
                filter === item;

              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  onPress={() =>
                    setFilter(item)
                  }
                  className={`mr-2 rounded-full px-5 py-2.5 ${
                    active
                      ? "bg-red-600"
                      : "bg-[#171717]"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active
                        ? "text-white"
                        : "text-zinc-400"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* PROPERTY CONTENT */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#dc2626"
          />

          <Text className="mt-3 text-sm text-zinc-400">
            Loading properties...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#dc2626"
              colors={["#dc2626"]}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 40,
          }}
        >
          {propertySections.map(
            (section) => {
              if (
                section.data.length === 0
              ) {
                return null;
              }

              return (
                <View
                  key={section.title}
                  className="w-full"
                >
                  {/* SECTION HEADER */}
                  <View className="mb-4 mt-3 flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-white">
                      {section.title}
                    </Text>

                    <Text className="text-sm text-zinc-400">
                      {section.data.length}{" "}
                      {section.data.length ===
                      1
                        ? "property"
                        : "properties"}
                    </Text>
                  </View>

                  {/* PROPERTY GRID */}
                  {renderPropertyGrid(
                    section,
                  )}

                  {/* VIEW ALL */}
                  {!selectedCategory && (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        router.push({
                          pathname:
                            "/(tabs)/properties",
                          params: {
                            category:
                              "New to Market",
                          },
                        });
                      }}
                      className="mb-8 mt-1 h-12 w-full items-center justify-center rounded-xl bg-red-600"
                    >
                      <Text className="text-base font-bold text-white">
                        View All Properties
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            },
          )}

          {propertySections.every(
            (section) =>
              section.data.length === 0,
          ) &&
            renderEmptyComponent()}
        </ScrollView>
      )}

      {/* SIDE MENU */}
      <SideMenu
        visible={menuVisible}
        onClose={() =>
          setMenuVisible(false)
        }
      />

      {/*
       * AUTH MODAL DISABLED
       *
       * Kept here as comments so it can easily
       * be enabled again in the future.
       *
       * <AuthRequiredModal
       *   visible={authModalVisible}
       *   onClose={() =>
       *     setAuthModalVisible(false)
       *   }
       * />
       */}
    </SafeAreaView>
  );
}