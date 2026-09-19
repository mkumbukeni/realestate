import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AgentCard from "@/app/components/agents/AgentCard";
import SideMenu from "@/app/components/sidebar/SideMenu";
import { fetchAgents, type Agent } from "@/app/services/agentApi";

export default function AgentsScreen() {
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
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
      agent.specialization.toLowerCase().includes(searchText) ||
      agent.address.toLowerCase().includes(searchText) ||
      agent.coverageAreas.some(
        (area) =>
          area.location_name.toLowerCase().includes(searchText) ||
          area.district_name.toLowerCase().includes(searchText)
      )
    );
  });

  const renderAgent = ({ item }: { item: Agent }) => {
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
          color="#444444"
        />

        <Text className="mt-4 text-center text-lg font-bold text-gray-300">
          No agents found
        </Text>

        <Text className="mt-2 text-center text-sm text-gray-500">
          Try changing your search or refresh the list.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      {/* Header */}
      <View className="border-b border-[#222222] px-5 pb-4 pt-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">
              Agents
            </Text>

            <Text className="mt-1 text-sm text-gray-500">
              Meet our real estate professionals
            </Text>
          </View>

          <Pressable
            onPress={() => setMenuVisible(true)}
            className="ml-4 h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
          >
            <Ionicons
              name="menu-outline"
              size={28}
              color="#ffffff"
            />
          </Pressable>
        </View>

        {/* Search */}
        <View className="mt-4 flex-row items-center rounded-xl border border-[#292929] bg-[#171717] px-4">
          <Ionicons
            name="search-outline"
            size={20}
            color="#777777"
          />

          <Pressable
            className="flex-1"
            onPress={() => {
              // Search field is intentionally handled by the TextInput below.
            }}
          >
            {/* Empty Pressable kept out of the actual input area */}
          </Pressable>
        </View>
      </View>

      {/* Loading */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#ef4444"
          />

          <Text className="mt-3 text-sm text-gray-500">
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
              tintColor="#ef4444"
            />
          }
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
        />
      )}

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
}