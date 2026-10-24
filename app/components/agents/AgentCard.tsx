
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import type { Agent } from "@/app/services/agentApi";

interface AgentCardProps {
  agent: Agent;
  onPress: (agent: Agent) => void;
}

const getAgentDisplayType = (agentType?: string | null): string => {
  return agentType?.toLowerCase() === "registered"
    ? "Real Estate Agent"
    : "Scout";
};

const AgentCard: React.FC<AgentCardProps> = ({ agent, onPress }) => {
  const agentName = agent.name?.trim() || "Unknown Agent";

  const imageUri = agent.image?.trim() || null;

  const agentType = getAgentDisplayType(agent.agentType);

  // Read the agent's coverage areas.
  // These should already be parsed into objects by agentApi.ts.
  const coverageAreas = agent.coverageAreas ?? [];

  // Collect unique regions across all coverage areas.
  const regions = [
    ...new Set(
      coverageAreas
        .map((area) => area.region?.trim())
        .filter((region): region is string => Boolean(region)),
    ),
  ];

  // Collect unique districts across all coverage areas.
  const districts = [
    ...new Set(
      coverageAreas
        .map((area) => area.district_name?.trim())
        .filter((district): district is string => Boolean(district)),
    ),
  ];

  // Collect unique locations across all coverage areas.
  const locations = [
    ...new Set(
      coverageAreas
        .map((area) => area.location_name?.trim())
        .filter((location): location is string => Boolean(location)),
    ),
  ];

  // Keep the existing address as a fallback for the location label.
  const address = agent.address?.trim();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(agent)}
      className="mb-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#171717]"
    >
      {/* Agent image */}
      <View className="relative h-48 w-full items-center justify-center bg-neutral-200 dark:bg-neutral-800">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="items-center justify-center">
            <Ionicons
              name="person-circle-outline"
              size={76}
              color="#9ca3af"
            />
            <Text className="mt-1 text-xs text-neutral-500">
              No profile image
            </Text>
          </View>
        )}

        {/* Agent type badge */}
        <View className="absolute left-3 top-3 rounded-lg bg-red-600 px-3 py-1.5">
          <Text className="text-[11px] font-bold text-white">
            {agentType}
          </Text>
        </View>
      </View>

      {/* Agent information */}
      <View className="p-4">
        <Text
          numberOfLines={1}
          className="text-base font-bold text-neutral-900 dark:text-white"
        >
          {agentName}
        </Text>

        {/* Region */}
        <View className="mt-3 flex-row items-start">
          <Ionicons
            name="map-outline"
            size={16}
            color="#ef4444"
            style={{ marginTop: 2 }}
          />

          <View className="ml-2 flex-1">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              Region
            </Text>

            <Text className="text-sm text-neutral-700 dark:text-neutral-200">
              {regions.length > 0 ? regions.join(", ") : "Not specified"}
            </Text>
          </View>
        </View>

        {/* District */}
        <View className="mt-2 flex-row items-start">
          <Ionicons
            name="location-outline"
            size={16}
            color="#ef4444"
            style={{ marginTop: 2 }}
          />

          <View className="ml-2 flex-1">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              District
            </Text>

            <Text className="text-sm text-neutral-700 dark:text-neutral-200">
              {districts.length > 0
                ? districts.join(", ")
                : address || "Not specified"}
            </Text>
          </View>
        </View>

        {/* Specific coverage locations */}
        {locations.length > 0 && (
          <View className="mt-2 flex-row items-start">
            <Ionicons
              name="navigate-outline"
              size={16}
              color="#ef4444"
              style={{ marginTop: 2 }}
            />

            <View className="ml-2 flex-1">
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                Areas Covered
              </Text>

              <Text className="text-sm text-neutral-700 dark:text-neutral-200">
                {locations.join(", ")}
              </Text>
            </View>
          </View>
        )}

        {/* Contact details */}
        {agent.phone ? (
          <View className="mt-3 flex-row items-center">
            <Ionicons
              name="call-outline"
              size={15}
              color="#9ca3af"
            />

            <Text
              numberOfLines={1}
              className="ml-2 flex-1 text-sm text-neutral-600 dark:text-neutral-400"
            >
              {agent.phone}
            </Text>
          </View>
        ) : null}

        {agent.email ? (
          <View className="mt-2 flex-row items-center">
            <Ionicons
              name="mail-outline"
              size={15}
              color="#9ca3af"
            />

            <Text
              numberOfLines={1}
              className="ml-2 flex-1 text-sm text-neutral-600 dark:text-neutral-400"
            >
              {agent.email}
            </Text>
          </View>
        ) : null}

        {/* View profile */}
        <View className="mt-4 flex-row items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Text className="text-sm font-semibold text-red-600">
            View profile
          </Text>

          <Ionicons
            name="arrow-forward-circle-outline"
            size={23}
            color="#dc2626"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AgentCard;
