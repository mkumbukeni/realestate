
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
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";

import AuthRequiredModal from "@/app/components/auth/AuthRequiredModal";
import LoginModal from "@/app/components/auth/LoginModal";
import RegisterModal from "@/app/components/auth/RegisterModal";
import { useAuth } from "@/app/components/auth/AuthContext";

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const [sectionY, setSectionY] = useState(0);
  const [sectionHeight, setSectionHeight] =
    useState(0);

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
      {/* SECTION HEADER */}

      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

          <Text
            className={
              isDark
                ? "text-lg font-bold text-white"
                : "text-lg font-bold text-black"
            }
          >
            {title}
          </Text>
        </View>

        <Pressable
          onPress={() => onViewAll(title)}
          accessibilityRole="button"
          accessibilityLabel={`View all ${title}`}
          className="flex-row items-center"
        >
          
        </Pressable>
      </View>

      {/* LOADING */}

      {loading ? (
        <View
          className={
            isDark
              ? "items-center rounded-2xl border border-[#292929] bg-[#171717] py-10"
              : "items-center rounded-2xl border border-gray-200 bg-white py-10"
          }
        >
          <ActivityIndicator
            size="large"
            color="#ef4444"
          />

          <Text
            className={
              isDark
                ? "mt-3 text-sm text-gray-500"
                : "mt-3 text-sm text-gray-600"
            }
          >
            Loading {title.toLowerCase()}...
          </Text>
        </View>
      ) : sectionProperties.length === 0 ? (
        /* EMPTY */

        <View
          className={
            isDark
              ? "items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-10"
              : "items-center rounded-2xl border border-gray-200 bg-white px-5 py-10"
          }
        >
          <Ionicons
            name="home-outline"
            size={44}
            color={
              isDark
                ? "#444"
                : "#9ca3af"
            }
          />

          <Text
            className={
              isDark
                ? "mt-4 text-base font-semibold text-gray-400"
                : "mt-4 text-base font-semibold text-gray-700"
            }
          >
            No {title.toLowerCase()} available
          </Text>

          <Text
            className={
              isDark
                ? "mt-1 text-center text-sm text-gray-600"
                : "mt-1 text-center text-sm text-gray-500"
            }
          >
            Please check again later.
          </Text>
        </View>
      ) : (
        <>
          <AutoPropertySlider
            properties={sectionProperties}
            onPropertyPress={
              onPropertyPress
            }
            isVisible={isVisible}
          />

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const [sectionY, setSectionY] =
    useState(0);

  const [sectionHeight, setSectionHeight] =
    useState(0);

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
      {/* SECTION HEADER */}

      <View className="mb-4 flex-row items-center">
        <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

        <View>
          <Text
            className={
              isDark
                ? "text-lg font-bold text-white"
                : "text-lg font-bold text-black"
            }
          >
            Properties in My Location
          </Text>

          <Text
            className={
              isDark
                ? "mt-1 text-xs text-gray-500"
                : "mt-1 text-xs text-gray-600"
            }
          >
            Find properties near your current location
          </Text>
        </View>
      </View>

      {/* LOCATION BUTTON */}

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

      {/* INITIAL STATE */}

      {!nearbyRequested &&
        !loadingNearby && (
          <View
            className={
              isDark
                ? "items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-8"
                : "items-center rounded-2xl border border-gray-200 bg-white px-5 py-8"
            }
          >
            <Ionicons
              name="location-outline"
              size={44}
              color={
                isDark
                  ? "#555"
                  : "#9ca3af"
              }
            />

            <Text
              className={
                isDark
                  ? "mt-4 text-base font-semibold text-gray-400"
                  : "mt-4 text-base font-semibold text-gray-700"
              }
            >
              Find properties near you
            </Text>

            <Text
              className={
                isDark
                  ? "mt-1 text-center text-sm leading-5 text-gray-600"
                  : "mt-1 text-center text-sm leading-5 text-gray-500"
              }
            >
              Press "Use My Location" to discover
              properties close to your current location.
            </Text>
          </View>
        )}

      {/* LOADING */}

      {loadingNearby && (
        <View
          className={
            isDark
              ? "items-center rounded-2xl border border-[#292929] bg-[#171717] py-10"
              : "items-center rounded-2xl border border-gray-200 bg-white py-10"
          }
        >
          <ActivityIndicator
            size="large"
            color="#ef4444"
          />

          <Text
            className={
              isDark
                ? "mt-3 text-sm text-gray-500"
                : "mt-3 text-sm text-gray-600"
            }
          >
            Searching near your location...
          </Text>
        </View>
      )}

      {/* NO RESULTS */}

      {nearbyRequested &&
        !loadingNearby &&
        nearbyProperties.length === 0 && (
          <View
            className={
              isDark
                ? "items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-10"
                : "items-center rounded-2xl border border-gray-200 bg-white px-5 py-10"
            }
          >
            <Ionicons
              name="location-outline"
              size={44}
              color={
                isDark
                  ? "#444"
                  : "#9ca3af"
              }
            />

            <Text
              className={
                isDark
                  ? "mt-4 text-base font-semibold text-gray-400"
                  : "mt-4 text-base font-semibold text-gray-700"
              }
            >
              No nearby properties found
            </Text>

            <Text
              className={
                isDark
                  ? "mt-1 text-center text-sm leading-5 text-gray-600"
                  : "mt-1 text-center text-sm leading-5 text-gray-500"
              }
            >
              There are currently no properties
              available within the nearby search radius.
            </Text>
          </View>
        )}

      {/* RESULTS */}

      {!loadingNearby &&
        nearbyProperties.length > 0 && (
          <>
            <AutoPropertySlider
              properties={nearbyProperties}
              onPropertyPress={
                onPropertyPress
              }
              isVisible={isVisible}
            />

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

  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const {
    isLoggedIn,
  } = useAuth();

  // ============================================================
  // AUTHENTICATION STATE
  // ============================================================

  const [
    authModalVisible,
    setAuthModalVisible,
  ] = useState(false);

  const [
    loginVisible,
    setLoginVisible,
  ] = useState(false);

  const [
    registerVisible,
    setRegisterVisible,
  ] = useState(false);

  const [
    pendingProperty,
    setPendingProperty,
  ] = useState<Property | null>(
    null,
  );

  // ============================================================
  // GENERAL STATE
  // ============================================================

  const [showWelcome, setShowWelcome] =
    useState(true);

  // ============================================================
  // REFRESH STATE
  // ============================================================

  const [refreshing, setRefreshing] =
    useState(false);

  // ============================================================
  // MAIN SCROLL POSITION
  // ============================================================

  const [parentScrollY, setParentScrollY] =
    useState(0);

  const [viewportHeight, setViewportHeight] =
    useState(0);

  // ============================================================
  // PROPERTY STATE
  // ============================================================

  const [properties, setProperties] =
    useState<Property[]>([]);

  const [
    featuredProperties,
    setFeaturedProperties,
  ] = useState<Property[]>([]);

  const [
    openHouseProperties,
    setOpenHouseProperties,
  ] = useState<Property[]>([]);

  const [
    mostViewedProperties,
    setMostViewedProperties,
  ] = useState<Property[]>([]);

  const [
    nearbyProperties,
    setNearbyProperties,
  ] = useState<Property[]>([]);

  // ============================================================
  // LOADING STATE
  // ============================================================

  const [
    loadingProperties,
    setLoadingProperties,
  ] = useState(true);

  const [
    loadingFeatured,
    setLoadingFeatured,
  ] = useState(true);

  const [
    loadingOpenHouses,
    setLoadingOpenHouses,
  ] = useState(true);

  const [
    loadingMostViewed,
    setLoadingMostViewed,
  ] = useState(true);

  const [
    loadingNearby,
    setLoadingNearby,
  ] = useState(false);

  const [
    nearbyRequested,
    setNearbyRequested,
  ] = useState(false);

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

    return () =>
      clearTimeout(timer);
  }, []);

  // ============================================================
  // LOAD ALL HOME DATA
  //
  // This function is used both on initial load and when the
  // user pulls the entire screen down to refresh.
  //
  // IMPORTANT:
  // If one request fails because the network is down, the
  // existing data is kept. This prevents a failed refresh from
  // replacing working property sections with empty arrays.
  // ============================================================

  const loadHomeData = async (
    isRefresh = false,
  ) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    /*
     * During a manual refresh we do not show the large loading
     * placeholders inside every section. The pull-to-refresh
     * indicator at the top is enough.
     *
     * On the first load, the individual section loaders remain
     * visible.
     */
    if (!isRefresh) {
      setLoadingProperties(true);
      setLoadingFeatured(true);
      setLoadingOpenHouses(true);
      setLoadingMostViewed(true);
      setLoadingAgents(true);
    }

    try {
      /*
       * Load all main home requests together.
       *
       * Promise.allSettled is intentional here.
       *
       * If the network is down and one endpoint fails, the
       * successful sections still update instead of the entire
       * refresh failing.
       */
      const results =
        await Promise.allSettled([
          fetchProperties(),
          fetchFeaturedProperties(),
          fetchMostViewedProperties(),
          fetchAgents(),
        ]);

      // ========================================================
      // NEW TO MARKET + OPEN HOUSES
      // ========================================================

      const propertiesResult =
        results[0];

      if (
        propertiesResult.status ===
        "fulfilled"
      ) {
        const result =
          propertiesResult.value;

        setProperties(result);

        const openHouses =
          result.filter(
            (property) =>
              property.isOpenHouse ===
              true,
          );

        setOpenHouseProperties(
          openHouses,
        );
      } else {
        console.error(
          "Failed to load properties:",
          propertiesResult.reason,
        );
      }

      // ========================================================
      // FEATURED
      // ========================================================

      const featuredResult =
        results[1];

      if (
        featuredResult.status ===
        "fulfilled"
      ) {
        setFeaturedProperties(
          featuredResult.value,
        );
      } else {
        console.error(
          "Failed to load featured properties:",
          featuredResult.reason,
        );
      }

      // ========================================================
      // MOST VIEWED
      // ========================================================

      const mostViewedResult =
        results[2];

      if (
        mostViewedResult.status ===
        "fulfilled"
      ) {
        setMostViewedProperties(
          mostViewedResult.value,
        );
      } else {
        console.error(
          "Failed to load most viewed properties:",
          mostViewedResult.reason,
        );
      }

      // ========================================================
      // AGENTS
      // ========================================================

      const agentsResult =
        results[3];

      if (
        agentsResult.status ===
        "fulfilled"
      ) {
        setAgents(
          agentsResult.value,
        );
      } else {
        console.error(
          "Failed to load home agents:",
          agentsResult.reason,
        );
      }
    } catch (error) {
      /*
       * This is a final safety net.
       *
       * We intentionally do NOT clear existing data here.
       */
      console.error(
        "Failed to refresh home data:",
        error,
      );
    } finally {
      if (!isRefresh) {
        setLoadingProperties(false);
        setLoadingFeatured(false);
        setLoadingOpenHouses(false);
        setLoadingMostViewed(false);
        setLoadingAgents(false);
      }

      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    void loadHomeData(false);
  }, []);

  // ============================================================
  // PULL TO REFRESH
  //
  // Sliding down from the top of the ENTIRE screen triggers
  // this function.
  // ============================================================

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }

    await loadHomeData(true);

    /*
     * If the user has already used "Use My Location", refresh
     * that section as well.
     *
     * We deliberately do this after the normal home requests so
     * the standard property sections always reload.
     */
    if (nearbyRequested) {
      try {
        const servicesEnabled =
          await Location.hasServicesEnabledAsync();

        if (!servicesEnabled) {
          console.warn(
            "Location services are disabled while refreshing nearby properties.",
          );

          return;
        }

        const permission =
          await Location.getForegroundPermissionsAsync();

        if (
          permission.status !==
          Location.PermissionStatus.GRANTED
        ) {
          console.warn(
            "Location permission is not granted while refreshing nearby properties.",
          );

          return;
        }

        const currentLocation =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy.Balanced,
            },
          );

        const {
          latitude,
          longitude,
        } = currentLocation.coords;

        const result =
          await fetchNearbyProperties(
            latitude,
            longitude,
          );

        setNearbyProperties(result);
      } catch (error) {
        /*
         * Keep the previous nearby properties if the network
         * is down during refresh.
         */
        console.error(
          "Failed to refresh nearby properties:",
          error,
        );
      }
    }
  };

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

        const currentLocation =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy.Balanced,
            },
          );

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
      /*
       * Logged-in users can open the property
       * immediately.
       */
      if (isLoggedIn) {
        router.push({
          pathname:
            "/(tabs)/properties/[id]",
          params: {
            id: property.id,
          },
        });

        return;
      }

      /*
       * Logged-out users must authenticate first.
       */
      setPendingProperty(property);
      setAuthModalVisible(true);
    };

  // ============================================================
  // AUTH REQUIRED -> LOGIN
  // ============================================================

  const handleAuthRequiredLogin =
    () => {
      setAuthModalVisible(false);
      setLoginVisible(true);
    };

  // ============================================================
  // AUTH REQUIRED -> REGISTER
  // ============================================================

  const handleAuthRequiredRegister =
    () => {
      setAuthModalVisible(false);
      setRegisterVisible(true);
    };

  // ============================================================
  // LOGIN SUCCESS
  // ============================================================

  const handleLoginSuccess =
    (
      _email: string,
      _response: Record<
        string,
        unknown
      >,
    ) => {
      setLoginVisible(false);

      /*
       * AuthContext has already set isLoggedIn = true.
       *
       * Continue to the property the user originally
       * selected.
       */
      if (pendingProperty) {
        const propertyToOpen =
          pendingProperty;

        setPendingProperty(null);

        router.push({
          pathname:
            "/(tabs)/properties/[id]",
          params: {
            id: propertyToOpen.id,
          },
        });
      }
    };

  // ============================================================
  // REGISTRATION SUCCESS
  // ============================================================

  const handleRegistrationComplete =
    () => {
      /*
       * Keep pendingProperty.
       *
       * Registration itself does not necessarily log the
       * user in, so we now allow the user to sign in.
       */
      setRegisterVisible(false);
      setLoginVisible(true);
    };

  // ============================================================
  // CLOSE AUTH REQUIRED
  // ============================================================

  const handleCloseAuthRequired =
    () => {
      setAuthModalVisible(false);
      setPendingProperty(null);
    };

  // ============================================================
  // CLOSE LOGIN
  // ============================================================

  const handleCloseLogin = () => {
    setLoginVisible(false);
  };

  // ============================================================
  // CLOSE REGISTER
  // ============================================================

  const handleCloseRegister = () => {
    setRegisterVisible(false);
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
      <SafeAreaView
        className={
          isDark
            ? "flex-1 bg-[#0d0d0d]"
            : "flex-1 bg-white"
        }
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

            <Text
              className={
                isDark
                  ? "mt-3 text-center text-3xl font-bold leading-10 text-white"
                  : "mt-3 text-center text-3xl font-bold leading-10 text-black"
              }
            >
              Your next property{"\n"}
              starts here.
            </Text>

            <Text
              className={
                isDark
                  ? "mt-4 max-w-sm text-center text-base leading-6 text-gray-400"
                  : "mt-4 max-w-sm text-center text-base leading-6 text-gray-600"
              }
            >
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
    <SafeAreaView
      className={
        isDark
          ? "flex-1 bg-[#0d0d0d]"
          : "flex-1 bg-gray-50"
      }
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
            : "#f9fafb"
        }
      />

      {/* HEADER */}

      <View
        className={
          isDark
            ? "flex-row items-center border-b border-[#222] bg-[#0d0d0d] px-5 pb-3.5 pt-2.5"
            : "flex-row items-center border-b border-gray-200 bg-white px-5 pb-3.5 pt-2.5"
        }
      >
        <View>
          <Text
            className={
              isDark
                ? "text-xl font-bold text-white"
                : "text-xl font-bold text-black"
            }
          >
            Real Estate Africa
          </Text>

          <Text
            className={
              isDark
                ? "mt-1 text-sm text-gray-500"
                : "mt-1 text-sm text-gray-600"
            }
          >
            Find your next property
          </Text>
        </View>
      </View>

      {/* CONTENT */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={100}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ef4444"
            colors={["#ef4444"]}
            progressBackgroundColor={
              isDark
                ? "#171717"
                : "#ffffff"
            }
          />
        }
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
        {/* INTRO */}

        <View className="mb-6">
          <Text
            className={
              isDark
                ? "text-2xl font-bold text-white"
                : "text-2xl font-bold text-black"
            }
          >
            Discover Properties
          </Text>

          <Text
            className={
              isDark
                ? "mt-1 text-sm leading-5 text-gray-500"
                : "mt-1 text-sm leading-5 text-gray-600"
            }
          >
            Explore properties available for sale and rent.
          </Text>
        </View>

        {/* FEATURED */}

        <PropertySection
          title="Featured Properties"
          sectionProperties={
            featuredProperties
          }
          loading={loadingFeatured}
          parentScrollY={
            parentScrollY
          }
          viewportHeight={
            viewportHeight
          }
          onPropertyPress={
            handlePropertyPress
          }
          onViewAll={
            handleViewAllProperties
          }
        />

        {/* NEW TO MARKET */}

        <PropertySection
          title="New to Market"
          sectionProperties={properties}
          loading={loadingProperties}
          parentScrollY={
            parentScrollY
          }
          viewportHeight={
            viewportHeight
          }
          onPropertyPress={
            handlePropertyPress
          }
          onViewAll={
            handleViewAllProperties
          }
        />

        {/* OPEN HOUSES */}

        <PropertySection
          title="Open Houses"
          sectionProperties={
            openHouseProperties
          }
          loading={loadingOpenHouses}
          parentScrollY={
            parentScrollY
          }
          viewportHeight={
            viewportHeight
          }
          onPropertyPress={
            handlePropertyPress
          }
          onViewAll={
            handleViewAllProperties
          }
        />

        {/* MOST VIEWED */}

        <PropertySection
          title="Most Viewed"
          sectionProperties={
            mostViewedProperties
          }
          loading={loadingMostViewed}
          parentScrollY={
            parentScrollY
          }
          viewportHeight={
            viewportHeight
          }
          onPropertyPress={
            handlePropertyPress
          }
          onViewAll={
            handleViewAllProperties
          }
        />

        {/* NEARBY */}

        <NearbyPropertySection
          nearbyProperties={
            nearbyProperties
          }
          loadingNearby={
            loadingNearby
          }
          nearbyRequested={
            nearbyRequested
          }
          parentScrollY={
            parentScrollY
          }
          viewportHeight={
            viewportHeight
          }
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

        {/* AGENTS */}

        <View className="mt-2">
          <View className="mb-4 flex-row items-center">
            <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

            <Text
              className={
                isDark
                  ? "text-lg font-bold text-white"
                  : "text-lg font-bold text-black"
              }
            >
              Our Agents
            </Text>
          </View>

          {loadingAgents ? (
            <View className="items-center py-10">
              <ActivityIndicator
                size="large"
                color="#ef4444"
              />

              <Text
                className={
                  isDark
                    ? "mt-3 text-sm text-gray-500"
                    : "mt-3 text-sm text-gray-600"
                }
              >
                Loading agents...
              </Text>
            </View>
          ) : agents.length === 0 ? (
            <View
              className={
                isDark
                  ? "items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-10"
                  : "items-center rounded-2xl border border-gray-200 bg-white px-5 py-10"
              }
            >
              <Ionicons
                name="people-outline"
                size={48}
                color={
                  isDark
                    ? "#444"
                    : "#9ca3af"
                }
              />

              <Text
                className={
                  isDark
                    ? "mt-4 text-base font-semibold text-gray-400"
                    : "mt-4 text-base font-semibold text-gray-700"
                }
              >
                No agents available
              </Text>

              <Text
                className={
                  isDark
                    ? "mt-1 text-center text-sm text-gray-600"
                    : "mt-1 text-center text-sm text-gray-500"
                }
              >
                Please check again later.
              </Text>
            </View>
          ) : (
            <View>
              {agents
                .slice(0, 1)
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

        {/* QUICK ACTIONS */}

        <View className="mt-10">
          <View className="mb-4 flex-row items-center">
            <View className="mr-2 h-5 w-1 rounded-full bg-red-500" />

            <Text
              className={
                isDark
                  ? "text-lg font-bold text-white"
                  : "text-lg font-bold text-black"
              }
            >
              Quick Actions
            </Text>
          </View>

          {/* LIST PROPERTY */}

          <Pressable
            onPress={() =>
              router.push(
                "/properties/list-property",
              )
            }
            accessibilityRole="button"
            accessibilityLabel="List your property"
            className={
              isDark
                ? "mb-3 w-full flex-row items-center rounded-2xl border border-[#292929] bg-[#171717] px-4 py-4 active:bg-[#222]"
                : "mb-3 w-full flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 active:bg-gray-100"
            }
          >
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-red-600">
              <Ionicons
                name="home-outline"
                size={25}
                color="#fff"
              />
            </View>

            <View className="flex-1">
              <Text
                className={
                  isDark
                    ? "text-base font-bold text-white"
                    : "text-base font-bold text-black"
                }
              >
                List Property
              </Text>

              <Text
                className={
                  isDark
                    ? "mt-1 text-sm text-gray-500"
                    : "mt-1 text-sm text-gray-600"
                }
              >
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
            className={
              isDark
                ? "mb-3 w-full flex-row items-center rounded-2xl border border-[#292929] bg-[#171717] px-4 py-4 active:bg-[#222]"
                : "mb-3 w-full flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 active:bg-gray-100"
            }
          >
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-red-600">
              <Ionicons
                name="search-outline"
                size={25}
                color="#fff"
              />
            </View>

            <View className="flex-1">
              <Text
                className={
                  isDark
                    ? "text-base font-bold text-white"
                    : "text-base font-bold text-black"
                }
              >
                Special Property Request
              </Text>

              <Text
                className={
                  isDark
                    ? "mt-1 text-sm text-gray-500"
                    : "mt-1 text-sm text-gray-600"
                }
              >
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
            className={
              isDark
                ? "w-full flex-row items-center rounded-2xl border border-[#292929] bg-[#171717] px-4 py-4 active:bg-[#222]"
                : "w-full flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 active:bg-gray-100"
            }
          >
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-red-600">
              <Ionicons
                name="newspaper-outline"
                size={25}
                color="#fff"
              />
            </View>

            <View className="flex-1">
              <Text
                className={
                  isDark
                    ? "text-base font-bold text-white"
                    : "text-base font-bold text-black"
                }
              >
                Subscribe to our newsletter
              </Text>

              <Text
                className={
                  isDark
                    ? "mt-1 text-sm text-gray-500"
                    : "mt-1 text-sm text-gray-600"
                }
              >
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
          AUTH REQUIRED MODAL
          ======================================================== */}

      <AuthRequiredModal
        visible={authModalVisible}
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

      {/* ========================================================
          LOGIN MODAL
          ======================================================== */}

      <LoginModal
        visible={loginVisible}
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

      {/* ========================================================
          REGISTER MODAL
          ======================================================== */}

      <RegisterModal
        visible={registerVisible}
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

