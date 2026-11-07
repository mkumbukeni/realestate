
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AgentCard from "@/app/components/agents/AgentCard";
import { useTheme } from "@/app/components/theme/ThemeContext";
import { fetchAgents } from "@/app/services/agent/agentApi";
import type { Agent } from "@/app/types/agents/agent";

// ============================================================
// TYPES
// ============================================================

type AgentFilter = "all" | "registered" | "unregistered";

type ShimmerProps = {
  width?: ViewStyle["width"];
  height: number;
  radius?: number;
  baseColor: string;
  highlightColor: string;
  style?: StyleProp<ViewStyle>;
};

// ============================================================
// RESPONSIVE GRID CONFIGURATION
// ============================================================

const GRID_GAP = 16;
const SCREEN_PADDING = 16;

// ============================================================
// FILTER OPTIONS
// ============================================================

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

// ============================================================
// FACEBOOK-STYLE SHIMMER
// ============================================================

function FacebookShimmer({
  width = "100%",
  height,
  radius = 8,
  baseColor,
  highlightColor,
  style,
}: ShimmerProps) {
  const animation = useRef(new Animated.Value(0)).current;

  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const measuredWidth = event.nativeEvent.layout.width;

      if (measuredWidth !== containerWidth) {
        setContainerWidth(measuredWidth);
      }
    },
    [containerWidth],
  );

  useEffect(() => {
    if (containerWidth <= 0) {
      return;
    }

    animation.setValue(0);

    const shimmerAnimation = Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 1250,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, [animation, containerWidth]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-110, containerWidth + 110],
  });

  return (
    <View
      onLayout={handleLayout}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: baseColor,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -8,
          bottom: -8,
          left: 0,
          width: 85,
          borderRadius: radius,
          backgroundColor: highlightColor,
          opacity: 0.85,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

// ============================================================
// AGENT CARD SKELETON
// ============================================================

function AgentCardSkeleton({
  baseColor,
  highlightColor,
  cardBackground,
  borderColor,
}: {
  baseColor: string;
  highlightColor: string;
  cardBackground: string;
  borderColor: string;
}) {
  return (
    <View
      className="mb-4 overflow-hidden rounded-2xl border p-4"
      style={{
        backgroundColor: cardBackground,
        borderColor,
        flex: 1,
      }}
    >
      <View className="flex-row items-center">
        <FacebookShimmer
          width={68}
          height={68}
          radius={40}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />

        <View className="ml-4 flex-1">
          <FacebookShimmer
            width="75%"
            height={15}
            radius={5}
            baseColor={baseColor}
            highlightColor={highlightColor}
          />

          <View className="mt-3">
            <FacebookShimmer
              width="55%"
              height={11}
              radius={4}
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
          </View>

          <View className="mt-3 flex-row items-center">
            <FacebookShimmer
              width={75}
              height={19}
              radius={10}
              baseColor={baseColor}
              highlightColor={highlightColor}
            />

            <View className="ml-2">
              <FacebookShimmer
                width={65}
                height={19}
                radius={10}
                baseColor={baseColor}
                highlightColor={highlightColor}
              />
            </View>
          </View>
        </View>
      </View>

      <View
        className="my-4"
        style={{
          height: 1,
          backgroundColor: borderColor,
        }}
      />

      <View className="flex-row items-center">
        <Ionicons name="call-outline" size={16} color={highlightColor} />

        <View className="ml-3 flex-1">
          <FacebookShimmer
            width="65%"
            height={11}
            radius={4}
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
        </View>
      </View>

      <View className="mt-4 flex-row items-center">
        <Ionicons name="location-outline" size={16} color={highlightColor} />

        <View className="ml-3 flex-1">
          <FacebookShimmer
            width="80%"
            height={11}
            radius={4}
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
        </View>
      </View>

      <View className="mt-5 flex-row items-center justify-between">
        <FacebookShimmer
          width={100}
          height={12}
          radius={4}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />

        <FacebookShimmer
          width={90}
          height={34}
          radius={9}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </View>
    </View>
  );
}

// ============================================================
// RESPONSIVE LOADING SKELETON
// ============================================================

function AgentsLoadingSkeleton({
  theme,
  numColumns,
}: {
  theme: ReturnType<typeof useTheme>["theme"];
  numColumns: number;
}) {
  const baseColor = theme.border;
  const highlightColor = theme.inputBackground;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: SCREEN_PADDING,
        paddingBottom: 30,
      }}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <FacebookShimmer
          width={125}
          height={15}
          radius={5}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />

        <FacebookShimmer
          width={65}
          height={13}
          radius={5}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: GRID_GAP,
        }}
      >
        {Array.from({ length: numColumns * 2 }).map((_, index) => (
          <View
            key={index}
            style={{
              width: `${100 / numColumns}%`,
              flex: 1,
              minWidth: numColumns > 1 ? 0 : undefined,
            }}
          >
            <AgentCardSkeleton
              baseColor={baseColor}
              highlightColor={highlightColor}
              cardBackground={theme.inputBackground}
              borderColor={theme.border}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ============================================================
// MAIN AGENTS SCREEN
// ============================================================

export default function AgentsScreen() {
  const router = useRouter();

  const { theme } = useTheme();

  const { width: windowWidth, height: windowHeight } =
    useWindowDimensions();

  // ============================================================
  // RESPONSIVE COLUMN CALCULATION
  // ============================================================

  const isLandscape = windowWidth > windowHeight;

  const numColumns = useMemo(() => {
    if (windowWidth < 600) {
      return 1;
    }

    if (windowWidth < 900) {
      return 2;
    }

    if (windowWidth < 1200) {
      return 3;
    }

    return 4;
  }, [windowWidth]);

  // Calculate card width based on available screen width.

  const cardWidth = useMemo(() => {
    const availableWidth = windowWidth - SCREEN_PADDING * 2;
    const totalGaps = GRID_GAP * (numColumns - 1);

    return (availableWidth - totalGaps) / numColumns;
  }, [windowWidth, numColumns]);

  // ============================================================
  // STATE
  // ============================================================

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<AgentFilter>("all");

  // ============================================================
  // LOAD AGENTS
  // ============================================================

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

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadAgents(true);
  }, [loadAgents]);

  // ============================================================
  // AGENT NAVIGATION
  // ============================================================

  const handleAgentPress = useCallback(
    (agent: Agent) => {
      router.push({
        pathname: "/(tabs)/agents/[id]",
        params: {
          id: String(agent.id),
        },
      });
    },
    [router],
  );

  // ============================================================
  // SEARCH
  // ============================================================

  const normalizedSearch = search.trim().toLowerCase();

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

  // ============================================================
  // CATEGORY FILTER
  // ============================================================

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

  // ============================================================
  // CATEGORY COUNTS
  // ============================================================

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

  // ============================================================
  // FILTERED AGENTS
  // ============================================================

  const filteredAgents = useMemo(
    () =>
      agents.filter(
        (agent) =>
          matchesCategory(agent, activeFilter) && matchesSearch(agent),
      ),
    [agents, activeFilter, matchesCategory, matchesSearch],
  );

  // ============================================================
  // RENDER AGENT
  // ============================================================

  const renderAgent = useCallback(
    ({ item }: { item: Agent }) => (
      <View
        style={{
          width: cardWidth,
          marginBottom: GRID_GAP,
        }}
      >
        <AgentCard
          agent={item}
          isFullWidth={numColumns === 1}
          onPress={handleAgentPress}
        />
      </View>
    ),
    [cardWidth, numColumns, handleAgentPress],
  );

  // ============================================================
  // EMPTY STATE
  // ============================================================

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

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      {/* HEADER */}

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

        {/* CATEGORY BUTTONS */}

        <View
          className="mt-4 flex-row gap-2"
          style={{
            maxWidth: isLandscape ? 850 : undefined,
            alignSelf: isLandscape ? "center" : "stretch",
            width: "100%",
          }}
        >
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

                {selected && !loading && (
                  <View
                    className="absolute items-center justify-center rounded-full bg-white"
                    style={{
                      top: 1,
                      right: 3,
                      minWidth: 17,
                      height: 17,
                      paddingHorizontal: 4,
                      borderWidth: 1,
                      borderColor: theme.accent,
                    }}
                  >
                    <Text className="text-[10px] font-extrabold text-black">
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SEARCH FIELD */}

        <View
          className="mt-4 min-h-12 flex-row items-center rounded-xl border px-3"
          style={{
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            maxWidth: isLandscape ? 850 : undefined,
            width: "100%",
            alignSelf: isLandscape ? "center" : "stretch",
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

      {/* AGENT LIST / LOADING SKELETON */}

      {loading ? (
        <AgentsLoadingSkeleton
          theme={theme}
          numColumns={numColumns}
        />
      ) : (
        <FlatList
          key={`agents-grid-${numColumns}`}
          data={filteredAgents}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderAgent}
          numColumns={numColumns}
          columnWrapperStyle={
            numColumns > 1
              ? {
                  justifyContent: "flex-start",
                  gap: GRID_GAP,
                }
              : undefined
          }
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            paddingTop: 16,
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
