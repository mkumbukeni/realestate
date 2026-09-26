
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  type Property,
} from "@/app/services/propertyApi";

import {
  fetchAgents,
  type Agent,
} from "@/app/services/agentApi";

export default function HomeScreen() {
  const router = useRouter();

  const [showWelcome, setShowWelcome] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  const [loadingProperties, setLoadingProperties] = useState(true);
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
  // LOAD PROPERTIES
  // ============================================================

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const result = await fetchProperties();
        setProperties(result);
      } catch (error) {
        console.error("Failed to load home properties:", error);
      } finally {
        setLoadingProperties(false);
      }
    };

    void loadProperties();
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
        console.error("Failed to load home agents:", error);
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
  // ============================================================

  const renderPropertySection = (
    title: string,
    sectionProperties: Property[],
  ) => {
    return (
      <View className="mb-10">
        {/* SECTION TITLE */}

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

        {/* TWO PROPERTY CARDS */}

        {sectionProperties.map((property) => (
          <PropertyCard
            key={`${title}-${property.id}`}
            property={property}
            isFullWidth
            onPress={handlePropertyPress}
          />
        ))}

        {/* VIEW ALL BUTTON */}

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
              Discover homes, commercial properties, rentals, and
              investment opportunities across Malawi.
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
            PROPERTIES
        ====================================================== */}

        {loadingProperties ? (
          <View className="items-center py-12">
            <ActivityIndicator
              size="large"
              color="#ef4444"
            />

            <Text className="mt-3 text-sm text-gray-500">
              Loading properties...
            </Text>
          </View>
        ) : properties.length === 0 ? (
          <View className="mb-10 items-center rounded-2xl border border-[#292929] bg-[#171717] px-5 py-10">
            <Ionicons
              name="home-outline"
              size={48}
              color="#444"
            />

            <Text className="mt-4 text-base font-semibold text-gray-400">
              No properties available
            </Text>

            <Text className="mt-1 text-center text-sm text-gray-600">
              Please check again later.
            </Text>
          </View>
        ) : (
          <>
            {/* ==================================================
                FEATURED PROPERTIES
            ================================================== */}

            {renderPropertySection(
              "Featured Properties",
              properties.slice(0, 2),
            )}

            {/* ==================================================
                NEW TO MARKET
            ================================================== */}

            {renderPropertySection(
              "New to Market",
              properties.slice(2, 4),
            )}

            {/* ==================================================
                OPEN HOUSES
            ================================================== */}

            {renderPropertySection(
              "Open Houses",
              properties.slice(4, 6),
            )}

            {/* ==================================================
                MOST VIEWED
            ================================================== */}

            {renderPropertySection(
              "Most Viewed",
              properties.slice(6, 8),
            )}
          </>
        )}

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
              router.push("/list-property")
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
              router.push("/special-property-request")
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
                Blogs
              </Text>

              <Text className="mt-1 text-sm text-gray-500">
                Read the latest real estate news and insights
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

