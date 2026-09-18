import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import SideMenu from "@/app/components/sidebar/SideMenu";

type Agent = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  image: string;
};

const AGENTS: Agent[] = [
  {
    id: "1",
    name: "John Banda",
    role: "Senior Real Estate Agent",
    phone: "+265 888 123 456",
    email: "john.banda@imorrcs.com",
    location: "Blantyre",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "Mary Phiri",
    role: "Real Estate Agent",
    phone: "+265 999 234 567",
    email: "mary.phiri@imorrcs.com",
    location: "Lilongwe",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "3",
    name: "Peter Mbewe",
    role: "Property Consultant",
    phone: "+265 888 345 678",
    email: "peter.mbewe@imorrcs.com",
    location: "Mzuzu",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    id: "4",
    name: "Grace Chirwa",
    role: "Real Estate Agent",
    phone: "+265 999 456 789",
    email: "grace.chirwa@imorrcs.com",
    location: "Blantyre",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: "5",
    name: "David Phiri",
    role: "Property Specialist",
    phone: "+265 888 567 890",
    email: "david.phiri@imorrcs.com",
    location: "Lilongwe",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    id: "6",
    name: "Angela Banda",
    role: "Real Estate Consultant",
    phone: "+265 999 678 901",
    email: "angela.banda@imorrcs.com",
    location: "Zomba",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    id: "7",
    name: "Charles Mwale",
    role: "Senior Property Consultant",
    phone: "+265 888 789 012",
    email: "charles.mwale@imorrcs.com",
    location: "Mzuzu",
    image: "https://randomuser.me/api/portraits/men/61.jpg",
  },
  {
    id: "8",
    name: "Linda Nkhoma",
    role: "Real Estate Agent",
    phone: "+265 999 890 123",
    email: "linda.nkhoma@imorrcs.com",
    location: "Lilongwe",
    image: "https://randomuser.me/api/portraits/women/49.jpg",
  },
  {
    id: "9",
    name: "Brian Kalua",
    role: "Property Consultant",
    phone: "+265 888 901 234",
    email: "brian.kalua@imorrcs.com",
    location: "Blantyre",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    id: "10",
    name: "Sarah Mhone",
    role: "Real Estate Agent",
    phone: "+265 999 012 345",
    email: "sarah.mhone@imorrcs.com",
    location: "Zomba",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

export default function AgentsScreen() {
  const router = useRouter();

  // ============================================================
  // SEARCH
  // ============================================================

  const [searchQuery, setSearchQuery] = useState("");

  // ============================================================
  // SIDE MENU
  // ============================================================

  const [menuVisible, setMenuVisible] = useState(false);

  // ============================================================
  // FILTER AGENTS
  // ============================================================

  const filteredAgents = useMemo(() => {
    const searchText = searchQuery.trim().toLowerCase();

    if (!searchText) {
      return AGENTS;
    }

    return AGENTS.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchText) ||
        agent.role.toLowerCase().includes(searchText) ||
        agent.location.toLowerCase().includes(searchText) ||
        agent.phone.toLowerCase().includes(searchText) ||
        agent.email.toLowerCase().includes(searchText),
    );
  }, [searchQuery]);

  // ============================================================
  // CLEAR SEARCH
  // ============================================================

  const clearSearch = () => {
    setSearchQuery("");
  };

  // ============================================================
  // AGENT CARD
  // ============================================================

  const renderAgent = ({ item }: { item: Agent }) => {
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(tabs)/agents/[id]",
            params: {
              id: item.id,
            },
          })
        }
        className="mb-4 flex-1 overflow-hidden rounded-2xl border border-[#292929] bg-[#151515]"
        style={({ pressed }) => ({
          opacity: pressed ? 0.75 : 1,
          transform: [
            {
              scale: pressed ? 0.98 : 1,
            },
          ],
        })}
      >
        {/* AGENT IMAGE */}

        <Image
          source={{ uri: item.image }}
          className="h-48 w-full"
          resizeMode="cover"
        />

        {/* AGENT INFORMATION */}

        <View className="p-3">
          <Text
            className="text-base font-bold text-white"
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text
            className="mt-1 text-xs text-red-400"
            numberOfLines={1}
          >
            {item.role}
          </Text>

          {/* LOCATION */}

          <View className="mt-3 flex-row items-center">
            <Ionicons
              name="location-outline"
              size={15}
              color="#999"
            />

            <Text
              className="ml-1 flex-1 text-xs text-gray-400"
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>

          {/* PHONE */}

          <View className="mt-1.5 flex-row items-center">
            <Ionicons
              name="call-outline"
              size={15}
              color="#999"
            />

            <Text
              className="ml-1 flex-1 text-xs text-gray-400"
              numberOfLines={1}
            >
              {item.phone}
            </Text>
          </View>

          {/* VIEW PROFILE */}

          <View className="mt-4 flex-row items-center justify-center rounded-lg bg-red-600 px-3 py-2.5">
            <Text className="text-xs font-bold text-white">
              View Profile
            </Text>

            <Ionicons
              name="arrow-forward"
              size={14}
              color="#fff"
              style={{ marginLeft: 5 }}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0d0d0d"
      />

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <View className="border-b border-[#222] bg-[#0d0d0d] px-5 pb-3.5 pt-2.5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">
              Our Agents
            </Text>

            <Text className="mt-1 text-sm text-gray-500">
              Meet our property professionals
            </Text>
          </View>

          {/* MENU BUTTON */}

          <Pressable
            onPress={() => setMenuVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons
              name="menu-outline"
              size={28}
              color="#fff"
            />
          </Pressable>
        </View>
      </View>

      {/* ====================================================== */}
      {/* SEARCH BAR */}
      {/* ====================================================== */}

      <View className="mx-4 mt-4 flex-row items-center rounded-xl border border-[#292929] bg-[#181818] px-3.5">
        <Ionicons
          name="search-outline"
          size={20}
          color="#999"
        />

        <TextInput
          className="h-12 flex-1 px-2.5 text-base text-white"
          placeholder="Search agents..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {searchQuery.length > 0 && (
          <Pressable
            onPress={clearSearch}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color="#ef4444"
            />
          </Pressable>
        )}
      </View>

      {/* ====================================================== */}
      {/* RESULTS COUNT */}
      {/* ====================================================== */}

      <View className="px-5 pb-1.5 pt-3.5">
        <Text className="text-sm font-medium text-gray-400">
          {filteredAgents.length}{" "}
          {filteredAgents.length === 1 ? "agent" : "agents"} found
        </Text>
      </View>

      {/* ====================================================== */}
      {/* AGENT LIST */}
      {/* ====================================================== */}

      <FlatList
        data={filteredAgents}
        renderItem={renderAgent}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{
          gap: 12,
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Ionicons
              name="people-outline"
              size={60}
              color="#444"
            />

            <Text className="mt-4 text-lg font-semibold text-gray-400">
              No agents found
            </Text>

            <Text className="mt-1 text-center text-sm text-gray-600">
              Try searching with a different name or location.
            </Text>
          </View>
        }
      />

      {/* ====================================================== */}
      {/* SIDE MENU */}
      {/* ====================================================== */}

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </SafeAreaView>
  );
}