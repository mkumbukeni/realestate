import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

import type { Agent } from "@/app/services/agentApi";

interface AgentCardProps {
  agent: Agent;
  onPress: (agent: Agent) => void;
  isFullWidth?: boolean;
}

const AgentCard = ({
  agent,
  onPress,
  isFullWidth = false,
}: AgentCardProps) => {
  return (
    <Pressable
      onPress={() => onPress(agent)}
      className="mb-4 overflow-hidden rounded-2xl border border-[#292929] bg-[#171717]"
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {/* ================================================== */}
      {/* PROFILE IMAGE */}
      {/* ================================================== */}

      <View
        className={`relative ${
          isFullWidth ? "h-64" : "h-48"
        } w-full bg-[#202020]`}
      >
        {agent.image ? (
          <Image
            source={{ uri: agent.image }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-[#292929]">
              <Ionicons
                name="person-outline"
                size={42}
                color="#777"
              />
            </View>
          </View>
        )}

        {/* AGENT TYPE */}
        <View className="absolute left-3 top-3 rounded-lg bg-red-600 px-2.5 py-1.5">
          <Text className="text-xs font-bold capitalize text-white">
            {agent.agentType}
          </Text>
        </View>

        {/* LICENSE STATUS */}
        {agent.licenseStatus === "active" && (
          <View className="absolute right-3 top-3 flex-row items-center rounded-lg bg-black/75 px-2.5 py-1.5">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-green-500" />

            <Text className="text-xs font-medium text-white">
              Licensed
            </Text>
          </View>
        )}
      </View>

      {/* ================================================== */}
      {/* AGENT INFORMATION */}
      {/* ================================================== */}

      <View className="p-4">
        {/* NAME */}
        <Text
          className="text-lg font-bold text-white"
          numberOfLines={1}
        >
          {agent.name}
        </Text>

        {/* SPECIALIZATION */}
        <Text
          className="mt-1 text-sm text-gray-400"
          numberOfLines={1}
        >
          {agent.specialization}
        </Text>

        {/* LOCATION */}
        {agent.coverageAreas.length > 0 && (
          <View className="mt-3 flex-row items-center">
            <Ionicons
              name="location-outline"
              size={16}
              color="#ef4444"
            />

            <Text
              className="ml-1.5 flex-1 text-sm text-gray-300"
              numberOfLines={1}
            >
              {agent.coverageAreas[0].location_name},{" "}
              {agent.coverageAreas[0].district_name}
            </Text>
          </View>
        )}

        {/* ADDRESS FALLBACK */}
        {agent.coverageAreas.length === 0 &&
          agent.address !== "" && (
            <View className="mt-3 flex-row items-center">
              <Ionicons
                name="location-outline"
                size={16}
                color="#ef4444"
              />

              <Text
                className="ml-1.5 flex-1 text-sm text-gray-300"
                numberOfLines={1}
              >
                {agent.address}
              </Text>
            </View>
          )}

        {/* CONTACT + SALES */}
        <View className="mt-3 flex-row items-center border-t border-[#292929] pt-3">
          {/* PHONE */}
          {agent.phone !== "" && (
            <View className="mr-4 flex-row items-center">
              <Ionicons
                name="call-outline"
                size={16}
                color="#999"
              />

              <Text className="ml-1.5 text-xs text-gray-400">
                {agent.phone}
              </Text>
            </View>
          )}

          {/* SALES */}
          <View className="ml-auto flex-row items-center">
            <Ionicons
              name="home-outline"
              size={16}
              color="#ef4444"
            />

            <Text className="ml-1.5 text-xs font-semibold text-gray-300">
              {agent.totalSales}{" "}
              {agent.totalSales === 1
                ? "Sale"
                : "Sales"}
            </Text>
          </View>
        </View>

        {/* VIEW PROFILE */}
        <View className="mt-4 flex-row items-center justify-center rounded-xl bg-[#242424] px-4 py-3">
          <Text className="mr-2 text-sm font-bold text-red-400">
            View Profile
          </Text>

          <Ionicons
            name="arrow-forward"
            size={16}
            color="#f87171"
          />
        </View>
      </View>
    </Pressable>
  );
};

export default AgentCard;