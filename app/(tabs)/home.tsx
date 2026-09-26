import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import * as Location from "expo-location";

import SideMenu from "@/app/components/sidebar/SideMenu";
import PropertyCard from "@/app/components/properties/PropertyCard";
import AgentCard from "@/app/components/agents/AgentCard";

import {
  fetchProperties,
  fetchFeaturedProperties,
  fetchMostViewedProperties,
  fetchNearbyProperties,
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

  // Properties in My Location
  const [nearbyProperties, setNearbyProperties] = useState<
    Property[]
  >([]);

  // ============================================================
  // LOADING STATE
  // ============================================================

  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingOpenHouses, setLoadingOpenHouses] = useState(true);
  const [loadingMostViewed, setLoadingMostViewed] = useState(true);

  // Nearby properties are NOT loaded automatically.
  // They are loaded only after pressing "Use My Location".
  const [loadingNearby, setLoadingNearby] = useState(false);

  // Used to know whether the user has already tried
  // to search for nearby properties.
  const [nearbyRequested, setNearbyRequested] = useState(false);

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
  // Endpoint:
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
  // Endpoint:
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
  // There is currently no separate open-house endpoint.
  //
  // Therefore:
  // GET /properties
  //
  // Then filter only properties marked as open houses.
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
  // Endpoint:
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
  // FIND PROPERTIES IN MY LOCATION
  //
  // Flow:
  //
  // 1. Check whether location services are enabled.
  // 2. Request foreground location permission.
  // 3. Get current latitude and longitude.
  // 4. POST coordinates to:
  //
  //    /property/nearby
  //
  // 5. The POST response contains the nearby properties.
  //
  // No GET request is made because /property/nearby
  // supports POST only.
  // ============================================================

  const handleUseMyLocation = async () => {
    if (loadingNearby) {
      return;
    }

    try {
      setLoadingNearby(true);
      setNearbyRequested(true);

      // ----------------------------------------------------------
      // Check if location services are enabled on the device
      // ----------------------------------------------------------

      const servicesEnabled =
        await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        setNearbyProperties([]);

        Alert.alert(
          "Location Disabled",
          "Please enable location services on your device and try again.",
        );

        return;
      }

      // ----------------------------------------------------------
      // Request foreground location permission
      // ----------------------------------------------------------

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (
        permission.status !==
        Location.PermissionStatus.GRANTED
      ) {
        setNearbyProperties([]);

        Alert.alert(
          "Location Permission Required",
          "Please allow location access to find properties near you.",
        );

        return;
      }

      // ----------------------------------------------------------
      // Get current device location
      // ----------------------------------------------------------

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const { latitude, longitude } = currentLocation.coords;

      console.log("Current latitude:", latitude);
      console.log("Current longitude:", longitude);

      // ----------------------------------------------------------
      // POST location to /property/nearby
      //
      // The propertyApi function sends:
      //
      // {
      //   latitude,
      //   longitude,
      //   radius: 1,
      //   min_price: 0,
      //   max_price: 0,
      //   search: ""
      // }
      // ----------------------------------------------------------

      const result = await fetchNearbyProperties(
        latitude,
        longitude,
      );

      setNearbyProperties(result);
    } catch (error) {
      console.error(
        "Failed to load nearby properties:",
        error,
      );

      setNearbyProperties([]);

      Alert.alert(
        "Unable to Find Properties",
        "We could not find properties near your current location. Please try again.",
      );
    } finally {
      setLoadingNearby(false);
    }
  };

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
          /* ====================================================
             PROPERTY CARDS
          ==================================================== */

          <>
            {sectionProperties.slice(0, 2).map((property) => (
              <PropertyCard
                key={`${title}-${property.id}`}
                property={property}
                isFullWidth
                onPress={handlePropertyPress}
              />
            ))}

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
  // PROPERTIES IN MY LOCATION SECTION
  // ============================================================

  const renderNearbyPropertiesSection = () => {
    return (
      <View className="mb-10">
        {/* ======================================================
            SECTION TITLE
        ====================================================== */}

        <View className="mb-4 flex-row items-center">
          <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

          <View>
            <Text className="text-lg font-bold text-white">
              Properties in My Location
            </Text>

            <Text className="mt-1 text-xs text-gray-500">
              Find properties near your current location
            </Text>
          </View>
        </View>

        {/* ======================================================
            USE MY LOCATION BUTTON
        ====================================================== */}

        <Pressable
          onPress={handleUseMyLocation}
          disabled={loadingNearby}
          accessibilityRole="button"
          accessibilityLabel="Use my location to find nearby properties"
          className={`mb-4 w-full flex-row items-center justify-center rounded-xl px-5 py-4 ${
            loadingNearby
              ? "bg-red-900"
              : "bg-red-600 active:bg-red-700"
          }`}
        >
          {loadingNearby ? (
            <>
              <ActivityIndicator
                size="small"
                color="#fff"
              />

              <Text className="ml-3 text-base font-bold text-white">
                Finding Properties...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="location"
                size={21}
                color="#fff"
              />

              <Text className="ml-2 text-base font-bold text-white">
                Use My Location
              </Text>
            </>
          )}
        </Pressable>

        {/* ======================================================
            BEFORE USER PRESSES BUTTON
        ====================================================== */}

        {!nearbyRequested && !loadingNearby ? (
          <View className="items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-8">
            <Ionicons
              name="location-outline"
              size={44}
              color="#555"
            />

            <Text className="mt-4 text-base font-semibold text-gray-400">
              Find properties near you
            </Text>

            <Text className="mt-1 text-center text-sm leading-5 text-gray-600">
              Press "Use My Location" to discover properties
              close to your current location.
            </Text>
          </View>
        ) : null}

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loadingNearby ? (
          <View className="items-center rounded-2xl border border-[#292929] bg-[#171717] py-10">
            <ActivityIndicator
              size="large"
              color="#ef4444"
            />

            <Text className="mt-3 text-sm text-gray-500">
              Searching near your location...
            </Text>
          </View>
        ) : null}

        {/* ======================================================
            NO RESULTS
        ====================================================== */}

        {nearbyRequested &&
        !loadingNearby &&
        nearbyProperties.length === 0 ? (
          <View className="items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-10">
            <Ionicons
              name="location-outline"
              size={44}
              color="#444"
            />

            <Text className="mt-4 text-base font-semibold text-gray-400">
              No nearby properties found
            </Text>

            <Text className="mt-1 text-center text-sm leading-5 text-gray-600">
              There are currently no properties available
              within the nearby search radius.
            </Text>
          </View>
        ) : null}

        {/* ======================================================
            NEARBY PROPERTY CARDS
        ====================================================== */}

        {!loadingNearby &&
        nearbyProperties.length > 0 ? (
          <>
            {nearbyProperties.slice(0, 2).map((property) => (
              <PropertyCard
                key={`nearby-${property.id}`}
                property={property}
                isFullWidth
                onPress={handlePropertyPress}
              />
            ))}

            {/* ==================================================
                VIEW ALL NEARBY PROPERTIES
            ================================================== */}

            <View className="mt-3">
              <Pressable
                onPress={() => {
                  router.push("/(tabs)/properties");
                }}
                accessibilityRole="button"
                accessibilityLabel="View all nearby properties"
                className="w-full flex-row items-center justify-center rounded-xl bg-red-600 px-5 py-4 active:bg-red-700"
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
            </View>
          </>
        ) : null}
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
            /property/get-featured
        ====================================================== */}

        {renderPropertySection(
          "Featured Properties",
          featuredProperties,
          loadingFeatured,
        )}

        {/* ======================================================
            NEW TO MARKET
            /properties
        ====================================================== */}

        {renderPropertySection(
          "New to Market",
          properties,
          loadingProperties,
        )}

        {/* ======================================================
            OPEN HOUSES
            /properties + isOpenHouse filter
        ====================================================== */}

        {renderPropertySection(
          "Open Houses",
          openHouseProperties,
          loadingOpenHouses,
        )}

        {/* ======================================================
            MOST VIEWED
            /property/get-most-viewed
        ====================================================== */}

        {renderPropertySection(
          "Most Viewed",
          mostViewedProperties,
          loadingMostViewed,
        )}

        {/* ======================================================
            PROPERTIES IN MY LOCATION
            POST /property/nearby
        ====================================================== */}

        {renderNearbyPropertiesSection()}

        {/* ======================================================
            AGENTS
        ====================================================== */}

        <View className="mt-2">
          {/* SECTION TITLE */}

          <View className="mb-4 flex-row items-center">
            <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

            <Text className="text-lg font-bold text-white">
              Our Agents
            </Text>
          </View>

          {/* AGENT LOADING */}

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
              {/* ONLY TWO AGENTS */}

              {agents.slice(0, 2).map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isFullWidth
                  onPress={handleAgentPress}
                />
              ))}

              {/* VIEW ALL AGENTS */}

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
          {/* SECTION TITLE */}

          <View className="mb-4 flex-row items-center">
            <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

            <Text className="text-lg font-bold text-white">
              Quick Actions
            </Text>
          </View>

          {/* ====================================================
              LIST PROPERTY
          ==================================================== */}

          <Pressable
            onPress={() =>
              router.push(
                "/properties/list-property",
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

          {/* ====================================================
              SPECIAL PROPERTY REQUEST
          ==================================================== */}

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

          {/* ====================================================
              BLOGS
          ==================================================== */}

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