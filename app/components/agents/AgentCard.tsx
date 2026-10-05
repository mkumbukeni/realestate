import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

import type { Agent } from "@/app/services/agentApi";
import { useTheme } from "@/app/components/theme/ThemeContext";

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
  const { isDark, theme } = useTheme();

  return (
    <Pressable
      onPress={() => onPress(agent)}
      className="mb-3 overflow-hidden rounded-2xl"
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        backgroundColor: theme.card,

        // Shadow
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: isDark ? 0.35 : 0.12,
        shadowRadius: 6,

        elevation: 4,
      })}
    >
      {/* ================================================== */}
      {/* PROFILE IMAGE */}
      {/* ================================================== */}

      <View
        className={`relative ${
          isFullWidth ? "h-52" : "h-40"
        } w-full`}
        style={{
          backgroundColor: theme.surface,
        }}
      >
        {agent.image ? (
          <Image
            source={{ uri: agent.image }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: theme.border,
              }}
            >
              <Ionicons
                name="person-outline"
                size={34}
                color={theme.textMuted}
              />
            </View>
          </View>
        )}

        {/* AGENT TYPE */}
        <View className="absolute left-3 top-3 rounded-lg bg-red-600 px-2 py-1">
          <Text className="text-[11px] font-bold capitalize text-white">
            {agent.agentType}
          </Text>
        </View>

        {/* LICENSE STATUS */}
        {agent.licenseStatus === "active" && (
          <View
            className="absolute right-3 top-3 flex-row items-center rounded-lg px-2 py-1"
            style={{
              backgroundColor: isDark
                ? "rgba(0,0,0,0.75)"
                : "rgba(255,255,255,0.90)",
            }}
          >
            <View className="mr-1.5 h-2 w-2 rounded-full bg-green-500" />

            <Text
              className="text-[11px] font-medium"
              style={{
                color: isDark ? "#ffffff" : "#111111",
              }}
            >
              Licensed
            </Text>
          </View>
        )}
      </View>

      {/* ================================================== */}
      {/* AGENT INFORMATION */}
      {/* ================================================== */}

      <View className="px-3.5 pb-3.5 pt-3">
        {/* NAME */}
        <Text
          className="text-base font-bold"
          style={{
            color: theme.text,
          }}
          numberOfLines={1}
        >
          {agent.name}
        </Text>

        {/* SPECIALIZATION */}
        <Text
          className="mt-0.5 text-xs"
          style={{
            color: theme.textSecondary,
          }}
          numberOfLines={1}
        >
          {agent.specialization}
        </Text>

        {/* LOCATION */}
        {agent.coverageAreas.length > 0 && (
          <View className="mt-2 flex-row items-center">
            <Ionicons
              name="location-outline"
              size={15}
              color={theme.accent}
            />

            <Text
              className="ml-1.5 flex-1 text-xs"
              style={{
                color: theme.textSecondary,
              }}
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
            <View className="mt-2 flex-row items-center">
              <Ionicons
                name="location-outline"
                size={15}
                color={theme.accent}
              />

              <Text
                className="ml-1.5 flex-1 text-xs"
                style={{
                  color: theme.textSecondary,
                }}
                numberOfLines={1}
              >
                {agent.address}
              </Text>
            </View>
          )}

        {/* CONTACT + SALES */}
        <View
          className="mt-2.5 flex-row items-center border-t pt-2.5"
          style={{
            borderTopColor: theme.border,
          }}
        >
          {/* PHONE */}
          {agent.phone !== "" && (
            <View className="mr-3 flex-row items-center">
              <Ionicons
                name="call-outline"
                size={14}
                color={theme.textMuted}
              />

              <Text
                className="ml-1 text-[11px]"
                style={{
                  color: theme.textMuted,
                }}
              >
                {agent.phone}
              </Text>
            </View>
          )}

          {/* SALES */}
          <View className="ml-auto flex-row items-center">
            <Ionicons
              name="home-outline"
              size={14}
              color={theme.accent}
            />

            <Text
              className="ml-1 text-[11px] font-semibold"
              style={{
                color: theme.textSecondary,
              }}
            >
              {agent.totalSales}{" "}
              {agent.totalSales === 1
                ? "Sale"
                : "Sales"}
            </Text>
          </View>
        </View>

        {/* VIEW PROFILE */}
        <View
          className="mt-3 flex-row items-center justify-center rounded-lg px-3 py-2"
          style={{
            backgroundColor: isDark
              ? "#242424"
              : "#f5f5f5",
          }}
        >
         
        </View>
      </View>
    </Pressable>
  );
};

export default AgentCard;