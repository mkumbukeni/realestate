import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SideMenu from "@/app/components/sidebar/SideMenu";
import PropertyCard from "@/app/components/properties/PropertyCard";

import {
  fetchProperties,
  type Property,
} from "@/app/services/propertyApi";

import {
  fetchAgents,
  type Agent,
} from "@/app/services/agentApi";

export default function AgentDetailsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const agentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [agent, setAgent] =
    useState<Agent | null>(null);

  const [properties, setProperties] =
    useState<Property[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [menuVisible, setMenuVisible] =
    useState(false);

  // ============================================================
  // LOAD AGENT + ASSIGNED PROPERTIES
  // ============================================================

  const loadAgentDetails =
    useCallback(async () => {
      if (!agentId) {
        setAgent(null);
        setProperties([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        setLoading(true);

        /*
         * Load the agent and all properties.
         *
         * IMPORTANT:
         *
         * The relationship between a property and its assigned
         * agent comes from the nested property.agent object.
         *
         * Example:
         *
         * property.agent.id = 7
         * property.agent.name = "Patricia Thonyiwa"
         *
         * Therefore we must NOT use:
         *
         * property.valuerId
         *
         * to determine the assigned agent.
         */

        const [
          agents,
          allProperties,
        ] = await Promise.all([
          fetchAgents(true),
          fetchProperties(),
        ]);

        // --------------------------------------------------------
        // Find requested agent
        // --------------------------------------------------------

        const foundAgent =
          agents.find(
            (item) =>
              String(item.id) ===
              String(agentId),
          ) ?? null;

        setAgent(foundAgent);

        // --------------------------------------------------------
        // Find properties assigned to this agent
        // --------------------------------------------------------

        if (foundAgent) {
          const assignedProperties =
            allProperties.filter(
              (property) =>
                property.agent !== null &&
                String(property.agent.id) ===
                  String(foundAgent.id),
            );

          setProperties(
            assignedProperties,
          );
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error(
          "Failed to load agent details:",
          error,
        );

        setAgent(null);
        setProperties([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [agentId]);

  useEffect(() => {
    void loadAgentDetails();
  }, [loadAgentDetails]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    setRefreshing(true);
    void loadAgentDetails();
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    router.back();
  };

  // ============================================================
  // PROPERTY PRESS
  // ============================================================

  const handlePropertyPress = (
    property: Property,
  ) => {
    router.push({
      pathname:
        "/(tabs)/properties/[id]",
      params: {
        id: String(property.id),
      },
    });
  };

  // ============================================================
  // PROPERTY CARD
  // ============================================================

  const renderProperty = ({
    item,
  }: {
    item: Property;
  }) => {
    return (
      <View className="px-4">
        <PropertyCard
          property={item}
          isFullWidth
          onPress={handlePropertyPress}
        />
      </View>
    );
  };

  // ============================================================
  // EMPTY PROPERTY LIST
  // ============================================================

  const renderEmptyProperties =
    () => {
      if (loading) {
        return null;
      }

      return (
        <View className="mx-4 items-center justify-center rounded-2xl border border-[#292929] bg-[#171717] px-6 py-12">
          <Ionicons
            name="home-outline"
            size={52}
            color="#444444"
          />

          <Text className="mt-4 text-center text-lg font-bold text-gray-300">
            No properties assigned
          </Text>

          <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
            There are currently no properties
            assigned to this agent.
          </Text>
        </View>
      );
    };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <View className="flex-row items-center border-b border-[#222222] px-4 py-3">
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#ffffff"
            />
          </Pressable>

          <Text className="ml-3 text-xl font-bold text-white">
            Agent Details
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#ef4444"
          />

          <Text className="mt-3 text-sm text-gray-500">
            Loading agent details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // AGENT NOT FOUND
  // ============================================================

  if (!agent) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <View className="flex-row items-center border-b border-[#222222] px-4 py-3">
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#ffffff"
            />
          </Pressable>

          <Text className="ml-3 text-xl font-bold text-white">
            Agent Details
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="person-outline"
            size={60}
            color="#444444"
          />

          <Text className="mt-5 text-center text-xl font-bold text-white">
            Agent not found
          </Text>

          <Text className="mt-2 text-center text-sm text-gray-500">
            The requested agent could not be
            found.
          </Text>

          <Pressable
            onPress={handleBack}
            className="mt-6 rounded-xl bg-red-600 px-6 py-3"
          >
            <Text className="font-bold text-white">
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // MAIN SCREEN
  // ============================================================

  return (
    <SafeAreaView
      className="flex-1 bg-[#0d0d0d]"
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <View className="flex-row items-center justify-between border-b border-[#222222] bg-[#0d0d0d] px-4 py-3">
        <View className="flex-1 flex-row items-center">
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#ffffff"
            />
          </Pressable>

          <View className="ml-3 flex-1">
            <Text
              className="text-lg font-bold text-white"
              numberOfLines={1}
            >
              Agent Details
            </Text>

            <Text className="text-xs text-zinc-500">
              Agent #{agent.id}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            setMenuVisible(true)
          }
          className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
        >
          <Ionicons
            name="menu-outline"
            size={27}
            color="#ffffff"
          />
        </Pressable>
      </View>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <FlatList
        data={properties}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderProperty}
        ListHeaderComponent={
          <View className="px-4 pt-5">
            {/* ================================================= */}
            {/* AGENT PROFILE */}
            {/* ================================================= */}

            <View className="overflow-hidden rounded-2xl border border-[#292929] bg-[#171717]">
              <View className="items-center px-5 pb-6 pt-7">
                {agent.image ? (
                  <Image
                    source={{
                      uri: agent.image,
                    }}
                    className="h-28 w-28 rounded-full border-2 border-red-600"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-28 w-28 items-center justify-center rounded-full border-2 border-red-600 bg-[#242424]">
                    <Ionicons
                      name="person-outline"
                      size={52}
                      color="#777777"
                    />
                  </View>
                )}

                <Text className="mt-4 text-2xl font-bold text-white">
                  {agent.name ||
                    "Unnamed Agent"}
                </Text>

                {agent.agentType ? (
                  <View className="mt-2 rounded-full bg-red-600/15 px-4 py-1.5">
                    <Text className="text-sm font-semibold text-red-500">
                      {agent.agentType}
                    </Text>
                  </View>
                ) : null}

                {agent.licenseStatus ? (
                  <View className="mt-2 flex-row items-center">
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={17}
                      color="#22c55e"
                    />

                    <Text className="ml-1.5 text-xs text-zinc-400">
                      {agent.licenseStatus}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* ================================================= */}
              {/* CONTACT INFORMATION */}
              {/* ================================================= */}

              <View className="border-t border-[#292929] px-4">
                {agent.email ? (
                  <InfoRow
                    icon="mail-outline"
                    label="Email"
                    value={agent.email}
                  />
                ) : null}

                {agent.phone ? (
                  <InfoRow
                    icon="call-outline"
                    label="Phone"
                    value={agent.phone}
                  />
                ) : null}

                {agent.address ? (
                  <InfoRow
                    icon="location-outline"
                    label="Address"
                    value={agent.address}
                  />
                ) : null}

                {agent.specialization ? (
                  <InfoRow
                    icon="briefcase-outline"
                    label="Specialization"
                    value={
                      agent.specialization
                    }
                  />
                ) : null}

                <InfoRow
                  icon="home-outline"
                  label="Assigned Properties"
                  value={String(
                    properties.length,
                  )}
                  last
                />
              </View>
            </View>

            {/* ================================================= */}
            {/* ABOUT */}
            {/* ================================================= */}

            {agent.about ? (
              <View className="mt-6">
                <Text className="mb-3 text-xl font-bold text-white">
                  About
                </Text>

                <View className="rounded-2xl border border-[#292929] bg-[#171717] p-4">
                  <Text className="text-sm leading-6 text-zinc-300">
                    {agent.about}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* ================================================= */}
            {/* COVERAGE AREAS */}
            {/* ================================================= */}

            {agent.coverageAreas.length >
            0 ? (
              <View className="mt-6">
                <Text className="mb-3 text-xl font-bold text-white">
                  Coverage Areas
                </Text>

                <View className="flex-row flex-wrap">
                  {agent.coverageAreas.map(
                    (
                      area,
                      index,
                    ) => {
                      const areaName =
                        area.location_name ||
                        area.district_name ||
                        "Coverage Area";

                      const district =
                        area.location_name &&
                        area.district_name &&
                        area.location_name !==
                          area.district_name
                          ? area.district_name
                          : "";

                      return (
                        <View
                          key={`${areaName}-${district}-${index}`}
                          className="mb-2 mr-2 rounded-xl border border-[#292929] bg-[#171717] px-3 py-2.5"
                        >
                          <View className="flex-row items-center">
                            <Ionicons
                              name="location-outline"
                              size={17}
                              color="#ef4444"
                            />

                            <Text className="ml-2 text-sm font-medium text-zinc-300">
                              {areaName}
                            </Text>
                          </View>

                          {district ? (
                            <Text className="ml-6 mt-1 text-xs text-zinc-500">
                              {district}
                            </Text>
                          ) : null}
                        </View>
                      );
                    },
                  )}
                </View>
              </View>
            ) : null}

            {/* ================================================= */}
            {/* SOCIAL PROFILES */}
            {/* ================================================= */}

            {agent.linkedin ||
            agent.facebook ? (
              <View className="mt-6">
                <Text className="mb-3 text-xl font-bold text-white">
                  Social Profiles
                </Text>

                <View className="flex-row">
                  {agent.linkedin ? (
                    <View className="mr-2 flex-row items-center rounded-xl border border-[#292929] bg-[#171717] px-4 py-3">
                      <Ionicons
                        name="logo-linkedin"
                        size={20}
                        color="#60a5fa"
                      />

                      <Text className="ml-2 text-sm text-zinc-300">
                        LinkedIn
                      </Text>
                    </View>
                  ) : null}

                  {agent.facebook ? (
                    <View className="flex-row items-center rounded-xl border border-[#292929] bg-[#171717] px-4 py-3">
                      <Ionicons
                        name="logo-facebook"
                        size={20}
                        color="#60a5fa"
                      />

                      <Text className="ml-2 text-sm text-zinc-300">
                        Facebook
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* ================================================= */}
            {/* ASSIGNED PROPERTIES HEADER */}
            {/* ================================================= */}

            <View className="mb-4 mt-8 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xl font-bold text-white">
                  Assigned Properties
                </Text>

                <Text className="mt-1 text-sm text-zinc-500">
                  Properties assigned to{" "}
                  {agent.name}
                </Text>
              </View>

              <View className="ml-3 rounded-full bg-red-600 px-3 py-1.5">
                <Text className="text-xs font-bold text-white">
                  {properties.length}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          renderEmptyProperties
        }
        contentContainerStyle={{
          paddingBottom: 35,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ef4444"
          />
        }
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
      />

      {/* ====================================================== */}
      {/* SIDE MENU */}
      {/* ====================================================== */}

      <SideMenu
        visible={menuVisible}
        onClose={() =>
          setMenuVisible(false)
        }
      />
    </SafeAreaView>
  );
}

// ============================================================
// INFO ROW
// ============================================================

interface InfoRowProps {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];

  label: string;

  value: string;

  last?: boolean;
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: InfoRowProps) {
  return (
    <View
      className={`flex-row items-center py-4 ${
        last
          ? ""
          : "border-b border-[#292929]"
      }`}
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-[#242424]">
        <Ionicons
          name={icon}
          size={18}
          color="#ef4444"
        />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-xs text-zinc-500">
          {label}
        </Text>

        <Text
          className="mt-1 text-sm font-semibold text-zinc-200"
          numberOfLines={3}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}