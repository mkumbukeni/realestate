
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import SideMenu from "@/app/components/sidebar/SideMenu";
import PropertyCard from "@/app/components/properties/PropertyCard";
import AgentCard from "@/app/components/agents/AgentCard";

import {
  fetchProperties,
  fetchFeaturedProperties,
  fetchMostViewedProperties,
  type Property,
} from "@/app/services/propertyApi";

import {
  fetchAgents,
  type Agent,
} from "@/app/services/agentApi";

export default function HomeScreen() {
  const router = useRouter();

  // ============================================================
  // GENERAL STATE
  // ============================================================

  const [showWelcome, setShowWelcome] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  // ============================================================
  // PROPERTY STATE
  // ============================================================

  // New to Market
  const [properties, setProperties] = useState<Property[]>([]);

  // Featured Properties
  const [featuredProperties, setFeaturedProperties] = useState<
    Property[]
  >([]);

  // Open Houses
  const [openHouseProperties, setOpenHouseProperties] = useState<
    Property[]
  >([]);

  // Most Viewed
  const [mostViewedProperties, setMostViewedProperties] = useState<
    Property[]
  >([]);

  // ============================================================
  // LOADING STATE
  // ============================================================

  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingOpenHouses, setLoadingOpenHouses] = useState(true);
  const [loadingMostViewed, setLoadingMostViewed] = useState(true);

  // ============================================================
  // AGENT STATE
  // ============================================================

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // ============================================================
  // WELCOME SCREEN
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // ============================================================
  // LOAD NEW TO MARKET
  //
  // GET /properties
  // ============================================================

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const result = await fetchProperties();

        setProperties(result);
      } catch (error) {
        console.error(
          "Failed to load new-to-market properties:",
          error,
        );
      } finally {
        setLoadingProperties(false);
      }
    };

    void loadProperties();
  }, []);

  // ============================================================
  // LOAD FEATURED PROPERTIES
  //
  // GET /property/get-featured
  // ============================================================

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        const result = await fetchFeaturedProperties();

        setFeaturedProperties(result);
      } catch (error) {
        console.error(
          "Failed to load featured properties:",
          error,
        );
      } finally {
        setLoadingFeatured(false);
      }
    };

    void loadFeaturedProperties();
  }, []);

  // ============================================================
  // LOAD OPEN HOUSES
  //
  // GET /properties
  //
  // Filter properties that have open houses.
  // ============================================================

  useEffect(() => {
    const loadOpenHouses = async () => {
      try {
        const result = await fetchProperties();

        const openHouses = result.filter(
          (property) => property.isOpenHouse === true,
        );

        setOpenHouseProperties(openHouses);
      } catch (error) {
        console.error(
          "Failed to load open houses:",
          error,
        );
      } finally {
        setLoadingOpenHouses(false);
      }
    };

    void loadOpenHouses();
  }, []);

  // ============================================================
  // LOAD MOST VIEWED PROPERTIES
  //
  // GET /property/get-most-viewed
  // ============================================================

  useEffect(() => {
    const loadMostViewedProperties = async () => {
      try {
        const result = await fetchMostViewedProperties();

        setMostViewedProperties(result);
      } catch (error) {
        console.error(
          "Failed to load most viewed properties:",
          error,
        );
      } finally {
        setLoadingMostViewed(false);
      }
    };

    void loadMostViewedProperties();
  }, []);

  // ============================================================
  // LOAD AGENTS
  // ============================================================

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const result = await fetchAgents();

        setAgents(result);
      } catch (error) {
        console.error(
          "Failed to load home agents:",
          error,
        );
      } finally {
        setLoadingAgents(false);
      }
    };

    void loadAgents();
  }, []);

  // ============================================================
  // PROPERTY PRESS
  // ============================================================

  const handlePropertyPress = (property: Property) => {
    router.push({
      pathname: "/(tabs)/properties/[id]",
      params: {
        id: property.id,
      },
    });
  };

  // ============================================================
  // AGENT PRESS
  // ============================================================

  const handleAgentPress = (agent: Agent) => {
    router.push({
      pathname: "/(tabs)/agents/[id]",
      params: {
        id: agent.id,
      },
    });
  };

  // ============================================================
  // PROPERTY SECTION
  //
  // IMPORTANT:
  //
  // Every property returned by the endpoint is displayed.
  //
  // FlatList allows the user to slide left/right.
  //
  // The PropertyCard is given a fixed width so it does not
  // stretch when the device is rotated or used on a large screen.
  // ============================================================

  const renderPropertySection = (
    title: string,
    sectionProperties: Property[],
    loading: boolean,
  ) => {
    return (
      <View className="mb-10">
        {/* ======================================================
            SECTION TITLE
        ====================================================== */}

        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

            <Text className="text-lg font-bold text-white">
              {title}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              router.push("/(tabs)/properties");
            }}
            accessibilityRole="button"
            accessibilityLabel={`View all ${title}`}
            className="flex-row items-center"
          >
            <Text className="mr-1 text-sm font-semibold text-red-500">
              View All
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color="#ef4444"
            />
          </Pressable>
        </View>

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading ? (
          <View className="items-center rounded-2xl border border-[#292929] bg-[#171717] py-10">
            <ActivityIndicator
              size="large"
              color="#ef4444"
            />

            <Text className="mt-3 text-sm text-gray-500">
              Loading {title.toLowerCase()}...
            </Text>
          </View>
        ) : sectionProperties.length === 0 ? (
          /* ====================================================
             EMPTY STATE
          ==================================================== */

          <View className="items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-10">
            <Ionicons
              name="home-outline"
              size={44}
              color="#444"
            />

            <Text className="mt-4 text-base font-semibold text-gray-400">
              No {title.toLowerCase()} available
            </Text>

            <Text className="mt-1 text-center text-sm text-gray-600">
              Please check again later.
            </Text>
          </View>
        ) : (
          <>
            {/* ==================================================
                HORIZONTAL PROPERTY SLIDER

                ALL properties from the endpoint are displayed.

                The width is fixed so the card does not resize
                based on the device/screen width.
            ================================================== */}

            <FlatList
              data={sectionProperties}
              keyExtractor={(property) =>
                `${title}-${property.id}`
              }
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              directionalLockEnabled
              contentContainerStyle={{
                paddingRight: 8,
              }}
              ItemSeparatorComponent={() => (
                <View style={{ width: 20 }} />
              )}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: 320,
                  }}
                >
                  <PropertyCard
                    property={item}
                    isFullWidth
                    onPress={handlePropertyPress}
                  />
                </View>
              )}
            />

            {/* ==================================================
                SLIDER HINT

                Only shown when there is more than one property.
            ================================================== */}

            {sectionProperties.length > 1 && (
              <View className="mt-1 flex-row items-center justify-center">
                <Ionicons
                  name="chevron-back"
                  size={14}
                  color="#666"
                />

                <Text className="mx-1 text-xs text-gray-600">
                  Swipe to see more
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color="#666"
                />
              </View>
            )}

            {/* ==================================================
                VIEW ALL BUTTON
            ================================================== */}

            <Pressable
              onPress={() => {
                router.push("/(tabs)/properties");
              }}
              accessibilityRole="button"
              accessibilityLabel={`View all ${title}`}
              className="mt-3 w-full flex-row items-center justify-center rounded-xl bg-red-600 px-5 py-4 active:bg-red-700"
            >
              <Text className="mr-2 text-base font-bold text-white">
                View All Properties
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#fff"
              />
            </Pressable>
          </>
        )}
      </View>
    );
  };

  // ============================================================
  // WELCOME SCREEN
  // ============================================================

  if (showWelcome) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0d0d0d"
        />

        <View className="flex-1 items-center justify-center px-6">
          <Image
            source={{
              uri: "https://www.realestateafrica.mw/logo.png",
            }}
            className="h-32 w-64"
            resizeMode="contain"
          />

          <View className="mt-8 items-center">
            <Text className="text-center text-sm font-semibold uppercase tracking-[3px] text-red-500">
              Welcome to iMORRCS
            </Text>

            <Text className="mt-3 text-center text-3xl font-bold leading-10 text-white">
              Your next property{"\n"}starts here.
            </Text>

            <Text className="mt-4 max-w-sm text-center text-base leading-6 text-gray-400">
              Discover homes, commercial properties, rentals,
              and investment opportunities across Malawi.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // HOME
  // ============================================================

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0d0d0d"
      />

      {/* ========================================================
          HEADER
      ======================================================== */}

      <View className="flex-row items-center justify-between border-b border-[#222] bg-[#0d0d0d] px-5 pb-3.5 pt-2.5">
        <View>
          <Text className="text-2xl font-bold text-white">
            Real Estate
          </Text>

          <Text className="mt-1 text-sm text-gray-500">
            Find your next property
          </Text>
        </View>

        <Pressable
          onPress={() => setMenuVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
        >
          <Ionicons
            name="menu-outline"
            size={28}
            color="#fff"
          />
        </Pressable>
      </View>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
      >
        {/* ======================================================
            WELCOME
        ====================================================== */}

        <View className="mb-6">
          <Text className="text-2xl font-bold text-white">
            Discover Properties
          </Text>

          <Text className="mt-1 text-sm leading-5 text-gray-500">
            Explore properties available for sale and rent.
          </Text>
        </View>

        {/* ======================================================
            FEATURED PROPERTIES

            GET /property/get-featured
        ====================================================== */}

        {renderPropertySection(
          "Featured Properties",
          featuredProperties,
          loadingFeatured,
        )}

        {/* ======================================================
            NEW TO MARKET

            GET /properties
        ====================================================== */}

        {renderPropertySection(
          "New to Market",
          properties,
          loadingProperties,
        )}

        {/* ======================================================
            OPEN HOUSES

            GET /properties + open house filter
        ====================================================== */}

        {renderPropertySection(
          "Open Houses",
          openHouseProperties,
          loadingOpenHouses,
        )}

        {/* ======================================================
            MOST VIEWED

            GET /property/get-most-viewed
        ====================================================== */}

        {renderPropertySection(
          "Most Viewed",
          mostViewedProperties,
          loadingMostViewed,
        )}

        {/* ======================================================
            AGENTS
        ====================================================== */}

        <View className="mt-2">
          <View className="mb-4 flex-row items-center">
            <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

            <Text className="text-lg font-bold text-white">
              Our Agents
            </Text>
          </View>

          {loadingAgents ? (
            <View className="items-center py-10">
              <ActivityIndicator
                size="large"
                color="#ef4444"
              />

              <Text className="mt-3 text-sm text-gray-500">
                Loading agents...
              </Text>
            </View>
          ) : agents.length === 0 ? (
            <View className="items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-10">
              <Ionicons
                name="people-outline"
                size={48}
                color="#444"
              />

              <Text className="mt-4 text-base font-semibold text-gray-400">
                No agents available
              </Text>

              <Text className="mt-1 text-center text-sm text-gray-600">
                Please check again later.
              </Text>
            </View>
          ) : (
            <View>
              {agents.slice(0, 2).map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isFullWidth
                  onPress={handleAgentPress}
                />
              ))}

              <Pressable
                onPress={() => {
                  router.push("/(tabs)/agents");
                }}
                accessibilityRole="button"
                accessibilityLabel="View all agents"
                className="mt-3 w-full flex-row items-center justify-center rounded-xl bg-red-600 px-5 py-4 active:bg-red-700"
              >
                <Text className="mr-2 text-base font-bold text-white">
                  View All Agents
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#fff"
                />
              </Pressable>
            </View>
          )}
        </View>

        {/* ======================================================
            QUICK ACTIONS
        ====================================================== */}

        <View className="mt-10">
          <View className="mb-4 flex-row items-center">
            <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

            <Text className="text-lg font-bold text-white">
              Quick Actions
            </Text>
          </View>

          {/* LIST PROPERTY */}

          <Pressable
            onPress={() =>
              router.push(
                "/appcomponents/listProperty/list-property",
              )
            }
            accessibilityRole="button"
            accessibilityLabel="List your property"
            className="mb-3 w-full flex-row items-center rounded-2xl border border-[#292929] bg-[#171717] px-4 py-4 active:bg-[#222]"
          >
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-red-600">
              <Ionicons
                name="home-outline"
                size={25}
                color="#fff"
              />
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-white">
                List Property
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                List your property for sale or rent
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color="#ef4444"
            />
          </Pressable>

          {/* SPECIAL PROPERTY REQUEST */}

          <Pressable
            onPress={() =>
              router.push(
                "/properties/special-property-request",
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Special property request"
            className="mb-3 w-full flex-row items-center rounded-2xl border border-[#292929] bg-[#171717] px-4 py-4 active:bg-[#222]"
          >
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-red-600">
              <Ionicons
                name="search-outline"
                size={25}
                color="#fff"
              />
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-white">
                Special Property Request
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                Tell us what property you are looking for
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color="#ef4444"
            />
          </Pressable>

          {/* BLOGS */}

          <Pressable
            onPress={() => router.push("/blogs")}
            accessibilityRole="button"
            accessibilityLabel="Open blogs"
            className="w-full flex-row items-center rounded-2xl border border-[#292929] bg-[#171717] px-4 py-4 active:bg-[#222]"
          >
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-red-600">
              <Ionicons
                name="newspaper-outline"
                size={25}
                color="#fff"
              />
            </View>

            <View className="flex-1">
              <Text className="text-base font-bold text-white">
                Subscribe to our newsletter
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                Get the latest property news and updates
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color="#ef4444"
            />
          </Pressable>
        </View>
      </ScrollView>

      {/* ========================================================
          SIDE MENU
      ======================================================== */}

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
}

