import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AgentCard from "@/app/components/agents/AgentCard";
import { useTheme } from "@/app/components/theme/ThemeContext";
import { fetchAgents, type Agent } from "@/app/services/agentApi";

export default function AgentsScreen() {
  const router = useRouter();

  const { theme } = useTheme();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const loadAgents = useCallback(async () => {
    try {
      const result = await fetchAgents();
      setAgents(result);
    } catch (error) {
      console.error("Failed to load agents:", error);
      setAgents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadAgents();
  };

  const handleAgentPress = (agent: Agent) => {
    router.push({
      pathname: "/(tabs)/agents/[id]",
      params: {
        id: agent.id,
      },
    });
  };

  const filteredAgents = agents.filter((agent) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    return (
      agent.name.toLowerCase().includes(searchText) ||
      agent.email.toLowerCase().includes(searchText) ||
      agent.specialization
        .toLowerCase()
        .includes(searchText) ||
      agent.address
        .toLowerCase()
        .includes(searchText) ||
      agent.coverageAreas.some(
        (area) =>
          area.location_name
            .toLowerCase()
            .includes(searchText) ||
          area.district_name
            .toLowerCase()
            .includes(searchText),
      )
    );
  });

  const renderAgent = ({
    item,
  }: {
    item: Agent;
  }) => {
    return (
      <AgentCard
        agent={item}
        isFullWidth
        onPress={handleAgentPress}
      />
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View className="items-center justify-center px-6 py-20">
        <Ionicons
          name="people-outline"
          size={60}
          color={theme.textMuted}
        />

        <Text
          className="mt-4 text-center text-lg font-bold"
          style={{
            color: theme.text,
          }}
        >
          No agents found
        </Text>

        <Text
          className="mt-2 text-center text-sm"
          style={{
            color: theme.textMuted,
          }}
        >
          Try changing your search or refresh the list.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: theme.background,
      }}
    >
      {/* Header */}
      <View
        className="px-5 pb-4 pt-3"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text
              className="text-2xl font-bold"
              style={{
                color: theme.text,
              }}
            >
              Agents
            </Text>

            <Text
              className="mt-1 text-sm"
              style={{
                color: theme.textMuted,
              }}
            >
              Meet our real estate professionals
            </Text>
          </View>
        </View>

        {/* Search */}
        <View
          className="mt-4 flex-row items-center rounded-xl border px-4"
          style={{
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            minHeight: 48,
          }}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.placeholder}
          />

          <View className="flex-1" />
        </View>
      </View>

      {/* Loading */}
      {loading ? (
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
            Loading agents...
          </Text>
        </View>
      ) : (
        /*
         * IMPORTANT:
         * All agents are rendered using FlatList.
         */
        <FlatList
          data={filteredAgents}
          keyExtractor={(item) => item.id}
          renderItem={renderAgent}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 30,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
        />
      )}
    </SafeAreaView>
  );
}