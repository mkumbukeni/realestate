
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AgentCard from "@/app/components/agents/AgentCard";
import { useTheme } from "@/app/components/theme/ThemeContext";
import { fetchAgents } from "@/app/services/agentApi";
import  {Agent} from "@/app/types/agents/agent"

type AgentFilter = "all" | "registered" | "unregistered";

const FILTER_OPTIONS: {
  label: string;
  value: AgentFilter;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { label: "All", value: "all", icon: "people-outline" },
  {
    label: "Real Estate Agents",
    value: "registered",
    icon: "briefcase-outline",
  },
  {
    label: "Scouts",
    value: "unregistered",
    icon: "compass-outline",
  },
];

export default function AgentsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<AgentFilter>("all");

  const loadAgents = useCallback(async (forceRefresh = false) => {
    try {
      const result = await fetchAgents(forceRefresh);
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

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadAgents(true);
  }, [loadAgents]);

  const handleAgentPress = useCallback(
    (agent: Agent) => {
      router.push({
        pathname: "/(tabs)/agents/[id]",
        params: { id: String(agent.id) },
      });
    },
    [router],
  );

  const normalizedSearch = search.trim().toLowerCase();

  // Use one shared predicate for search and counts.
  const matchesSearch = useCallback(
    (agent: Agent) => {
      if (!normalizedSearch) {
        return true;
      }

      const fields = [
        agent.name,
        agent.email,
        agent.specialization,
        agent.address,
        agent.phone,
        ...(agent.coverageAreas ?? []).flatMap((area) => [
          area.location_name,
          area.district_name,
        ]),
      ];

      return fields.some((field) =>
        String(field ?? "").toLowerCase().includes(normalizedSearch),
      );
    },
    [normalizedSearch],
  );

  const matchesCategory = useCallback(
    (agent: Agent, filter: AgentFilter) => {
      const type = String(agent.agentType ?? "").trim().toLowerCase();

      if (filter === "all") {
        return true;
      }

      if (filter === "registered") {
        return type === "registered";
      }

      return type === "unregistered";
    },
    [],
  );

  // Counts and list data use identical category and search conditions.
  const categoryCounts = useMemo(() => {
    const counts: Record<AgentFilter, number> = {
      all: 0,
      registered: 0,
      unregistered: 0,
    };

    agents.forEach((agent) => {
      if (!matchesSearch(agent)) {
        return;
      }

      (Object.keys(counts) as AgentFilter[]).forEach((filter) => {
        if (matchesCategory(agent, filter)) {
          counts[filter] += 1;
        }
      });
    });

    return counts;
  }, [agents, matchesSearch, matchesCategory]);

  const filteredAgents = useMemo(
    () =>
      agents.filter(
        (agent) =>
          matchesCategory(agent, activeFilter) && matchesSearch(agent),
      ),
    [agents, activeFilter, matchesCategory, matchesSearch],
  );

  const renderAgent = ({ item }: { item: Agent }) => (
    <AgentCard
      agent={item}
      isFullWidth
      onPress={handleAgentPress}
    />
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <Ionicons
        name={search.trim() ? "search-outline" : "people-outline"}
        size={60}
        color={theme.textMuted}
      />

      <Text
        className="mt-4 text-center text-lg font-bold"
        style={{ color: theme.text }}
      >
        {search.trim() ? "No matching agents" : "No agents found"}
      </Text>

      <Text
        className="mt-2 text-center text-sm"
        style={{ color: theme.textMuted }}
      >
        {search.trim()
          ? "Try another name, email, specialization, or location."
          : "There are no agents in this category yet. Try another category or refresh."}
      </Text>

      {search.trim().length > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSearch("")}
          className="mt-4 rounded-xl px-5 py-3"
          style={{ backgroundColor: theme.accent }}
        >
          <Text className="font-semibold text-white">Clear search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <View
        className="px-5 pb-4 pt-3"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <Text
          className="text-2xl font-bold"
          style={{ color: theme.text }}
        >
          Agents
        </Text>

        <Text
          className="mt-1 text-sm"
          style={{ color: theme.textMuted }}
        >
          Meet our real estate professionals
        </Text>

        {/* Category buttons */}
        <View className="mt-4 flex-row gap-2">
          {FILTER_OPTIONS.map((option) => {
            const selected = activeFilter === option.value;
            const count = categoryCounts[option.value];

            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setActiveFilter(option.value)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.label}, ${count} agents`}
                className="min-h-12 flex-1 flex-row items-center justify-center rounded-xl border px-2 py-2"
                style={{
                  position: "relative",
                  backgroundColor: selected
                    ? theme.accent
                    : theme.inputBackground,
                  borderColor: selected ? theme.accent : theme.border,
                }}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={selected ? "#FFFFFF" : theme.textMuted}
                />

                <Text
                  numberOfLines={2}
                  className="ml-1 text-center text-xs font-semibold"
                  style={{
                    color: selected ? "#FFFFFF" : theme.text,
                  }}
                >
                  {option.label}
                </Text>

                {/* Count badge: top-right corner of active button */}
                {selected && !loading && (
                  <View
                    className="absolute items-center justify-center rounded-full  "
                    style={{
                      top: 1,
                      right: 3,
                      minWidth: 20,
                      height: 20,
                      paddingHorizontal: 4,
                      backgroundColor: theme.background,
                      borderWidth: 1,
                      borderColor: theme.accent,
                    }}
                  >
                    <Text
                      className="text-[10px] font-extrabold dark:text-white"
                    
                    >
                      {count} 
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search field below category buttons */}
        <View
          className="mt-4 min-h-12 flex-row items-center rounded-xl border px-3"
          style={{
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
          }}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.placeholder}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, email, location..."
            placeholderTextColor={theme.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="ml-2 flex-1 py-3 text-sm"
            style={{ color: theme.text }}
            accessibilityLabel="Search agents"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              activeOpacity={0.7}
              accessibilityLabel="Clear search"
              hitSlop={10}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Agent list */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.accent} />

          <Text
            className="mt-3 text-sm"
            style={{ color: theme.textMuted }}
          >
            Loading agents...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAgents}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderAgent}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 30,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
              colors={[theme.accent]}
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
