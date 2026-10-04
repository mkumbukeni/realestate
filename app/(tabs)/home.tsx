
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
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
import AutoPropertySlider from "@/app/components/properties/AutoPropertySlider";

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

/* ============================================================
   PROPERTY SECTION COMPONENT

   This component is responsible for detecting whether the
   section is currently visible on the screen.

   When visible, AutoPropertySlider automatically starts moving.
   When the section leaves the screen, automatic movement stops.
   ============================================================ */

interface PropertySectionProps {
  title: string;
  sectionProperties: Property[];
  loading: boolean;
  parentScrollY: number;
  viewportHeight: number;
  onPropertyPress: (property: Property) => void;
  onViewAll: (title: string) => void;
}

function PropertySection({
  title,
  sectionProperties,
  loading,
  parentScrollY,
  viewportHeight,
  onPropertyPress,
  onViewAll,
}: PropertySectionProps) {
  const [sectionY, setSectionY] = useState(0);
  const [sectionHeight, setSectionHeight] = useState(0);

  /*
   * Determine whether this section is currently inside
   * the visible area of the main vertical ScrollView.
   */
  const isVisible = useMemo(() => {
    if (
      viewportHeight <= 0 ||
      sectionHeight <= 0
    ) {
      return false;
    }

    const sectionTop =
      sectionY - parentScrollY;

    const sectionBottom =
      sectionTop + sectionHeight;

    return (
      sectionBottom > 0 &&
      sectionTop < viewportHeight
    );
  }, [
    sectionY,
    sectionHeight,
    parentScrollY,
    viewportHeight,
  ]);

  return (
    <View
      className="mb-10"
      onLayout={(event) => {
        const {
          y,
          height,
        } = event.nativeEvent.layout;

        setSectionY(y);
        setSectionHeight(height);
      }}
    >
      {/* SECTION TITLE */}

      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

          <Text className="text-lg font-bold text-white">
            {title}
          </Text>
        </View>

        <Pressable
          onPress={() => onViewAll(title)}
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

      {/* LOADING */}

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
        /* EMPTY */

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
          {/* ========================================================
             AUTOMATIC PROPERTY SLIDER

             The slider only moves automatically while this section
             is visible on the screen.
             ======================================================== */}

          <AutoPropertySlider
            properties={sectionProperties}
            onPropertyPress={onPropertyPress}
            isVisible={isVisible}
          />

          {/* VIEW ALL */}

          <Pressable
            onPress={() => onViewAll(title)}
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
}

/* ============================================================
   NEARBY PROPERTY SECTION

   This is kept separate because it has the "Use My Location"
   functionality in addition to the automatic slider.
   ============================================================ */

interface NearbyPropertySectionProps {
  nearbyProperties: Property[];
  loadingNearby: boolean;
  nearbyRequested: boolean;
  parentScrollY: number;
  viewportHeight: number;
  onPropertyPress: (property: Property) => void;
  onUseMyLocation: () => void;
  onViewAll: () => void;
}

function NearbyPropertySection({
  nearbyProperties,
  loadingNearby,
  nearbyRequested,
  parentScrollY,
  viewportHeight,
  onPropertyPress,
  onUseMyLocation,
  onViewAll,
}: NearbyPropertySectionProps) {
  const [sectionY, setSectionY] = useState(0);
  const [sectionHeight, setSectionHeight] = useState(0);

  const isVisible = useMemo(() => {
    if (
      viewportHeight <= 0 ||
      sectionHeight <= 0
    ) {
      return false;
    }

    const sectionTop =
      sectionY - parentScrollY;

    const sectionBottom =
      sectionTop + sectionHeight;

    return (
      sectionBottom > 0 &&
      sectionTop < viewportHeight
    );
  }, [
    sectionY,
    sectionHeight,
    parentScrollY,
    viewportHeight,
  ]);

  return (
    <View
      className="mb-10"
      onLayout={(event) => {
        const {
          y,
          height,
        } = event.nativeEvent.layout;

        setSectionY(y);
        setSectionHeight(height);
      }}
    >
      {/* SECTION TITLE */}

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

      {/* USE MY LOCATION */}

      <Pressable
        onPress={onUseMyLocation}
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

      {/* BEFORE LOCATION SEARCH */}

      {!nearbyRequested &&
        !loadingNearby && (
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
              Press "Use My Location" to discover
              properties close to your current location.
            </Text>
          </View>
        )}

      {/* LOADING */}

      {loadingNearby && (
        <View className="items-center rounded-2xl border border-[#292929] bg-[#171717] py-10">
          <ActivityIndicator
            size="large"
            color="#ef4444"
          />

          <Text className="mt-3 text-sm text-gray-500">
            Searching near your location...
          </Text>
        </View>
      )}

      {/* NO RESULTS */}

      {nearbyRequested &&
        !loadingNearby &&
        nearbyProperties.length === 0 && (
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
              There are currently no properties
              available within the nearby search radius.
            </Text>
          </View>
        )}

      {/* NEARBY PROPERTIES */}

      {!loadingNearby &&
        nearbyProperties.length > 0 && (
          <>
            <AutoPropertySlider
              properties={nearbyProperties}
              onPropertyPress={onPropertyPress}
              isVisible={isVisible}
            />

            {/* VIEW ALL NEARBY PROPERTIES */}

            <Pressable
              onPress={onViewAll}
              accessibilityRole="button"
              accessibilityLabel="View all nearby properties"
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
}

/* ============================================================
   HOME SCREEN
   ============================================================ */

export default function HomeScreen() {
  const router = useRouter();

  // ============================================================
  // GENERAL STATE
  // ============================================================

  const [showWelcome, setShowWelcome] =
    useState(true);

  const [menuVisible, setMenuVisible] =
    useState(false);

  // ============================================================
  // MAIN SCROLL POSITION
  // ============================================================

  /*
   * These values are used by the property sections to know
   * whether they are currently visible on the screen.
   */

  const [parentScrollY, setParentScrollY] =
    useState(0);

  const [viewportHeight, setViewportHeight] =
    useState(0);

  // ============================================================
  // PROPERTY STATE
  // ============================================================

  const [properties, setProperties] =
    useState<Property[]>([]);

  const [featuredProperties, setFeaturedProperties] =
    useState<Property[]>([]);

  const [openHouseProperties, setOpenHouseProperties] =
    useState<Property[]>([]);

  const [mostViewedProperties, setMostViewedProperties] =
    useState<Property[]>([]);

  const [nearbyProperties, setNearbyProperties] =
    useState<Property[]>([]);

  // ============================================================
  // LOADING STATE
  // ============================================================

  const [loadingProperties, setLoadingProperties] =
    useState(true);

  const [loadingFeatured, setLoadingFeatured] =
    useState(true);

  const [loadingOpenHouses, setLoadingOpenHouses] =
    useState(true);

  const [loadingMostViewed, setLoadingMostViewed] =
    useState(true);

  const [loadingNearby, setLoadingNearby] =
    useState(false);

  const [nearbyRequested, setNearbyRequested] =
    useState(false);

  // ============================================================
  // AGENT STATE
  // ============================================================

  const [agents, setAgents] =
    useState<Agent[]>([]);

  const [loadingAgents, setLoadingAgents] =
    useState(true);

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
  // ============================================================

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const result =
          await fetchProperties();

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
  // ============================================================

  useEffect(() => {
    const loadFeaturedProperties =
      async () => {
        try {
          const result =
            await fetchFeaturedProperties();

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
  // ============================================================

  useEffect(() => {
    const loadOpenHouses = async () => {
      try {
        const result =
          await fetchProperties();

        const openHouses =
          result.filter(
            (property) =>
              property.isOpenHouse === true,
          );

        setOpenHouseProperties(
          openHouses,
        );
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
  // ============================================================

  useEffect(() => {
    const loadMostViewedProperties =
      async () => {
        try {
          const result =
            await fetchMostViewedProperties();

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
        const result =
          await fetchAgents();

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
  // ============================================================

  const handleUseMyLocation =
    async () => {
      if (loadingNearby) {
        return;
      }

      try {
        setLoadingNearby(true);
        setNearbyRequested(true);

        // --------------------------------------------------------
        // CHECK LOCATION SERVICES
        // --------------------------------------------------------

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

        // --------------------------------------------------------
        // REQUEST LOCATION PERMISSION
        // --------------------------------------------------------

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

        // --------------------------------------------------------
        // GET CURRENT LOCATION
        // --------------------------------------------------------

        const currentLocation =
          await Location.getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.Balanced,
          });

        const {
          latitude,
          longitude,
        } = currentLocation.coords;

        console.log(
          "Current latitude:",
          latitude,
        );

        console.log(
          "Current longitude:",
          longitude,
        );

        // --------------------------------------------------------
        // FIND NEARBY PROPERTIES
        // --------------------------------------------------------

        const result =
          await fetchNearbyProperties(
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

  const handlePropertyPress =
    (property: Property) => {
      router.push({
        pathname:
          "/(tabs)/properties/[id]",
        params: {
          id: property.id,
        },
      });
    };

  // ============================================================
  // AGENT PRESS
  // ============================================================

  const handleAgentPress =
    (agent: Agent) => {
      router.push({
        pathname:
          "/(tabs)/agents/[id]",
        params: {
          id: agent.id,
        },
      });
    };

  // ============================================================
  // VIEW ALL PROPERTIES
  // ============================================================

  const handleViewAllProperties =
    (title: string) => {
      router.push({
        pathname:
          "/(tabs)/properties",
        params: {
          category: title,
        },
      });
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
              Your next property{"\n"}
              starts here.
            </Text>

            <Text className="mt-4 max-w-sm text-center text-base leading-6 text-gray-400">
              Discover homes, commercial properties,
              rentals, and investment opportunities
              across Malawi.
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
          onPress={() =>
            setMenuVisible(true)
          }
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
        scrollEventThrottle={100}
        onScroll={(event) => {
          setParentScrollY(
            event.nativeEvent.contentOffset.y,
          );
        }}
        onLayout={(event) => {
          setViewportHeight(
            event.nativeEvent.layout.height,
          );
        }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
      >
        {/* ======================================================
            INTRO
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
            ====================================================== */}

        <PropertySection
          title="Featured Properties"
          sectionProperties={
            featuredProperties
          }
          loading={loadingFeatured}
          parentScrollY={parentScrollY}
          viewportHeight={viewportHeight}
          onPropertyPress={
            handlePropertyPress
          }
          onViewAll={
            handleViewAllProperties
          }
        />

        {/* ======================================================
            NEW TO MARKET
            ====================================================== */}

        <PropertySection
          title="New to Market"
          sectionProperties={properties}
          loading={loadingProperties}
          parentScrollY={parentScrollY}
          viewportHeight={viewportHeight}
          onPropertyPress={
            handlePropertyPress
          }
          onViewAll={
            handleViewAllProperties
          }
        />

        {/* ======================================================
            OPEN HOUSES
            ====================================================== */}

        <PropertySection
          title="Open Houses"
          sectionProperties={
            openHouseProperties
          }
          loading={loadingOpenHouses}
          parentScrollY={parentScrollY}
          viewportHeight={viewportHeight}
          onPropertyPress={
            handlePropertyPress
          }
          onViewAll={
            handleViewAllProperties
          }
        />

        {/* ======================================================
            MOST VIEWED
            ====================================================== */}

        <PropertySection
          title="Most Viewed"
          sectionProperties={
            mostViewedProperties
          }
          loading={loadingMostViewed}
          parentScrollY={parentScrollY}
          viewportHeight={viewportHeight}
          onPropertyPress={
            handlePropertyPress
          }
          onViewAll={
            handleViewAllProperties
          }
        />

        {/* ======================================================
            PROPERTIES IN MY LOCATION
            ====================================================== */}

        <NearbyPropertySection
          nearbyProperties={
            nearbyProperties
          }
          loadingNearby={loadingNearby}
          nearbyRequested={
            nearbyRequested
          }
          parentScrollY={parentScrollY}
          viewportHeight={viewportHeight}
          onPropertyPress={
            handlePropertyPress
          }
          onUseMyLocation={
            handleUseMyLocation
          }
          onViewAll={() =>
            router.push(
              "/(tabs)/properties",
            )
          }
        />

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
              {agents
                .slice(0, 2)
                .map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isFullWidth
                    onPress={() =>
                      handleAgentPress(
                        agent,
                      )
                    }
                  />
                ))}

              <Pressable
                onPress={() =>
                  router.push(
                    "/(tabs)/agents",
                  )
                }
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
            onPress={() =>
              router.push("/blogs")
            }
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
        onClose={() =>
          setMenuVisible(false)
        }
      />
    </SafeAreaView>
  );
}
