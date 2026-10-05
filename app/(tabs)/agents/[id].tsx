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
import { useTheme } from "@/app/components/theme/ThemeContext";

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

  const { theme, isDark } = useTheme();

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
        <View
          className="mx-4 items-center justify-center rounded-2xl px-6 py-12"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Ionicons
            name="home-outline"
            size={52}
            color={theme.textMuted}
          />

          <Text
            className="mt-4 text-center text-lg font-bold"
            style={{
              color: theme.text,
            }}
          >
            No properties assigned
          </Text>

          <Text
            className="mt-2 text-center text-sm leading-5"
            style={{
              color: theme.textMuted,
            }}
          >
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
      <SafeAreaView
        className="flex-1"
        style={{
          backgroundColor: theme.background,
        }}
      >
        <View
          className="flex-row items-center px-4 py-3"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: theme.card,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={theme.icon}
            />
          </Pressable>

          <Text
            className="ml-3 text-xl font-bold"
            style={{
              color: theme.text,
            }}
          >
            Agent Details
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={theme.accent}
          />

          <Text
            className="mt-3 text-sm"
            style={{
              color: theme.textMuted,
            }}
          >
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
      <SafeAreaView
        className="flex-1"
        style={{
          backgroundColor: theme.background,
        }}
      >
        <View
          className="flex-row items-center px-4 py-3"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: theme.card,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={theme.icon}
            />
          </Pressable>

          <Text
            className="ml-3 text-xl font-bold"
            style={{
              color: theme.text,
            }}
          >
            Agent Details
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="person-outline"
            size={60}
            color={theme.textMuted}
          />

          <Text
            className="mt-5 text-center text-xl font-bold"
            style={{
              color: theme.text,
            }}
          >
            Agent not found
          </Text>

          <Text
            className="mt-2 text-center text-sm"
            style={{
              color: theme.textMuted,
            }}
          >
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
      className="flex-1"
      style={{
        backgroundColor: theme.background,
      }}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{
          backgroundColor: theme.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <View className="flex-1 flex-row items-center">
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: theme.card,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={theme.icon}
            />
          </Pressable>

          <View className="ml-3 flex-1">
            <Text
              className="text-lg font-bold"
              style={{
                color: theme.text,
              }}
              numberOfLines={1}
            >
              Agent Details
            </Text>

            <Text
              className="text-xs"
              style={{
                color: theme.textMuted,
              }}
            >
              Agent #{agent.id}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            setMenuVisible(true)
          }
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{
            backgroundColor: theme.card,
          }}
        >
          <Ionicons
            name="menu-outline"
            size={27}
            color={theme.icon}
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

            <View
              className="overflow-hidden rounded-2xl"
              style={{
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
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
                  <View
                    className="h-28 w-28 items-center justify-center rounded-full border-2 border-red-600"
                    style={{
                      backgroundColor:
                        theme.surface,
                    }}
                  >
                    <Ionicons
                      name="person-outline"
                      size={52}
                      color={theme.textMuted}
                    />
                  </View>
                )}

                <Text
                  className="mt-4 text-2xl font-bold"
                  style={{
                    color: theme.text,
                  }}
                >
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

                    <Text
                      className="ml-1.5 text-xs"
                      style={{
                        color: theme.textMuted,
                      }}
                    >
                      {agent.licenseStatus}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* ================================================= */}
              {/* CONTACT INFORMATION */}
              {/* ================================================= */}

              <View
                className="px-4"
                style={{
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                }}
              >
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
                <Text
                  className="mb-3 text-xl font-bold"
                  style={{
                    color: theme.text,
                  }}
                >
                  About
                </Text>

                <View
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor:
                      theme.card,
                    borderWidth: 1,
                    borderColor:
                      theme.border,
                  }}
                >
                  <Text
                    className="text-sm leading-6"
                    style={{
                      color:
                        theme.textSecondary,
                    }}
                  >
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
                <Text
                  className="mb-3 text-xl font-bold"
                  style={{
                    color: theme.text,
                  }}
                >
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
                          className="mb-2 mr-2 rounded-xl px-3 py-2.5"
                          style={{
                            backgroundColor:
                              theme.card,
                            borderWidth: 1,
                            borderColor:
                              theme.border,
                          }}
                        >
                          <View className="flex-row items-center">
                            <Ionicons
                              name="location-outline"
                              size={17}
                              color={
                                theme.accent
                              }
                            />

                            <Text
                              className="ml-2 text-sm font-medium"
                              style={{
                                color:
                                  theme.textSecondary,
                              }}
                            >
                              {areaName}
                            </Text>
                          </View>

                          {district ? (
                            <Text
                              className="ml-6 mt-1 text-xs"
                              style={{
                                color:
                                  theme.textMuted,
                              }}
                            >
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
                <Text
                  className="mb-3 text-xl font-bold"
                  style={{
                    color: theme.text,
                  }}
                >
                  Social Profiles
                </Text>

                <View className="flex-row">
                  {agent.linkedin ? (
                    <View
                      className="mr-2 flex-row items-center rounded-xl px-4 py-3"
                      style={{
                        backgroundColor:
                          theme.card,
                        borderWidth: 1,
                        borderColor:
                          theme.border,
                      }}
                    >
                      <Ionicons
                        name="logo-linkedin"
                        size={20}
                        color="#60a5fa"
                      />

                      <Text
                        className="ml-2 text-sm"
                        style={{
                          color:
                            theme.textSecondary,
                        }}
                      >
                        LinkedIn
                      </Text>
                    </View>
                  ) : null}

                  {agent.facebook ? (
                    <View
                      className="flex-row items-center rounded-xl px-4 py-3"
                      style={{
                        backgroundColor:
                          theme.card,
                        borderWidth: 1,
                        borderColor:
                          theme.border,
                      }}
                    >
                      <Ionicons
                        name="logo-facebook"
                        size={20}
                        color="#60a5fa"
                      />

                      <Text
                        className="ml-2 text-sm"
                        style={{
                          color:
                            theme.textSecondary,
                        }}
                      >
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
                <Text
                  className="text-xl font-bold"
                  style={{
                    color: theme.text,
                  }}
                >
                  Assigned Properties
                </Text>

                <Text
                  className="mt-1 text-sm"
                  style={{
                    color: theme.textMuted,
                  }}
                >
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
            tintColor={theme.accent}
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
  const { theme } = useTheme();

  return (
    <View
      className="flex-row items-center py-4"
      style={
        last
          ? undefined
          : {
              borderBottomWidth: 1,
              borderBottomColor:
                theme.border,
            }
      }
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-lg"
        style={{
          backgroundColor: theme.surface,
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={theme.accent}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className="text-xs"
          style={{
            color: theme.textMuted,
          }}
        >
          {label}
        </Text>

        <Text
          className="mt-1 text-sm font-semibold"
          style={{
            color: theme.textSecondary,
          }}
          numberOfLines={3}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}