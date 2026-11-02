// app/(tabs)/properties/[id].tsx

import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Animated,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  useColorScheme,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import { useLocalSearchParams, useRouter } from "expo-router";

import SideMenu from "@/app/components/sidebar/SideMenu";

import { useAuth } from "@/app/components/auth/AuthContext";

import type {
  Property,
  PropertyMedia,
  PropertyMediaItem,
} from "@/app/types/properties/property";

import {
  fetchAgentDetails,
  fetchProperties,
  fetchPropertyImages,
  fetchPropertyVideos,
} from "@/app/services/properties/propertyApi";

import type { Agent } from "@/app/types/agents/agent";

import { fetchAgents } from "@/app/services/agent/agentApi";

import PropertyLocationMap from "@/app/components/properties/PropertyLocationMap";

import PropertyListingAgent from "@/app/components/properties/PropertyListingAgent";

import PropertyImageGallery from "@/app/components/properties/PropertyDetails/PropertyImageGallery";

import PropertyHighlights from "@/app/components/properties/PropertyDetails/PropertyHighlights";

import PropertyInformation, {
  type PropertyInformationData,
} from "@/app/components/properties/PropertyDetails/PropertyInformation";

import PropertyAmenities from "@/app/components/properties/PropertyDetails/PropertyAmenities";

import PropertyVideosSection from "@/app/components/properties/PropertyDetails/PropertyVideosSection";

import PropertyOpenHouse, {
  type PropertyOpenHouseItem,
} from "@/app/components/properties/PropertyDetails/PropertyOpenHouse";

import PropertyMessageModal from "@/app/components/properties/PropertyDetails/PropertyMessageModal";

import { trackPropertyView } from "@/app/services/properties/propertyViewApi";

import {
  getPropertyAmenities,
  getPropertyCoordinates,
  getPropertyDescription,
  getPropertyListingType,
  getPropertyLocationText,
  getPropertyOpenHouses,
  getPropertyType,
  getPropertyValue,
} from "@/app/components/properties/PropertyDetails/propertyDetailsUtils";

// ============================================================
// API BASE URL
// ============================================================

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const BASE_API_URL = API_URL?.replace(/\/+$/, "") ?? "";

// ============================================================
// FACEBOOK-STYLE SHIMMER COMPONENT
// ============================================================

type FacebookShimmerProps = {
  width?: ViewStyle["width"];
  height: number;
  radius?: number;
  isDark: boolean;
  style?: StyleProp<ViewStyle>;
};

function FacebookShimmer({
  width = "100%",
  height,
  radius = 8,
  isDark,
  style,
}: FacebookShimmerProps) {
  const animation = useRef(new Animated.Value(0)).current;

  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const measuredWidth = event.nativeEvent.layout.width;

    if (measuredWidth !== containerWidth) {
      setContainerWidth(measuredWidth);
    }
  };

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
    outputRange: [-120, containerWidth + 120],
  });

  const baseColor = isDark ? "#303030" : "#D8DDE5";
  const highlightColor = isDark ? "#555555" : "#FFFFFF";

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
          width: 90,
          borderRadius: radius,
          backgroundColor: highlightColor,
          opacity: isDark ? 0.85 : 1,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

// ============================================================
// PROPERTY DETAILS LOADING SKELETON
// ============================================================

function PropertyDetailsSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <SafeAreaView
      className={isDark ? "flex-1 bg-[#0d0d0d]" : "flex-1 bg-gray-50"}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0d0d0d" : "#f9fafb"}
      />

      {/* HEADER SKELETON */}

      <View
        className={
          isDark
            ? "flex-row items-center justify-between border-b border-zinc-800 bg-[#0d0d0d] px-4 py-3"
            : "flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3"
        }
      >
        <View className="flex-row items-center">
          <View
            className={
              isDark
                ? "h-11 w-11 items-center justify-center rounded-full bg-[#202020]"
                : "h-11 w-11 items-center justify-center rounded-full bg-gray-200"
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#777777" : "#9CA3AF"}
            />
          </View>

          <View className="ml-3">
            <FacebookShimmer
              width={145}
              height={16}
              radius={5}
              isDark={isDark}
            />

            <View className="mt-2">
              <FacebookShimmer
                width={85}
                height={10}
                radius={4}
                isDark={isDark}
              />
            </View>
          </View>
        </View>

        <View
          className={
            isDark
              ? "h-11 w-11 items-center justify-center rounded-full bg-[#202020]"
              : "h-11 w-11 items-center justify-center rounded-full bg-gray-200"
          }
        >
          <Ionicons
            name="menu-outline"
            size={25}
            color={isDark ? "#777777" : "#9CA3AF"}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 45 }}
      >
        {/* PROPERTY IMAGE SKELETON */}

        <View className="px-4 pt-4">
          <FacebookShimmer
            width="100%"
            height={245}
            radius={16}
            isDark={isDark}
          />

          <View className="mt-3 flex-row items-center justify-center gap-2">
            <FacebookShimmer
              width={7}
              height={7}
              radius={10}
              isDark={isDark}
            />
            <FacebookShimmer
              width={7}
              height={7}
              radius={10}
              isDark={isDark}
            />
            <FacebookShimmer
              width={7}
              height={7}
              radius={10}
              isDark={isDark}
            />
            <FacebookShimmer
              width={7}
              height={7}
              radius={10}
              isDark={isDark}
            />
          </View>
        </View>

        {/* PROPERTY INFORMATION SKELETON */}

        <View className="mt-6 px-4">
          <FacebookShimmer
            width="72%"
            height={23}
            radius={6}
            isDark={isDark}
          />

          <View className="mt-3 flex-row items-center">
            <FacebookShimmer
              width={95}
              height={13}
              radius={5}
              isDark={isDark}
            />

            <View className="ml-3">
              <FacebookShimmer
                width={75}
                height={13}
                radius={5}
                isDark={isDark}
              />
            </View>
          </View>

          <View className="mt-4">
            <FacebookShimmer
              width="55%"
              height={20}
              radius={5}
              isDark={isDark}
            />
          </View>

          <View className="mt-3">
            <FacebookShimmer
              width="85%"
              height={12}
              radius={5}
              isDark={isDark}
            />
          </View>
        </View>

        {/* PROPERTY HIGHLIGHTS SKELETON */}

        <View className="mt-7 px-4">
          <FacebookShimmer
            width={145}
            height={19}
            radius={5}
            isDark={isDark}
          />

          <View
            className={
              isDark
                ? "mt-4 flex-row justify-between rounded-xl border border-[#292929] bg-[#171717] p-4"
                : "mt-4 flex-row justify-between rounded-xl border border-gray-200 bg-white p-4"
            }
          >
            {[1, 2, 3, 4].map((item) => (
              <View key={item} className="items-center">
                <FacebookShimmer
                  width={28}
                  height={25}
                  radius={6}
                  isDark={isDark}
                />

                <View className="mt-2">
                  <FacebookShimmer
                    width={42}
                    height={10}
                    radius={4}
                    isDark={isDark}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* DESCRIPTION SKELETON */}

        <View className="mt-8 px-4">
          <FacebookShimmer
            width={125}
            height={20}
            radius={5}
            isDark={isDark}
          />

          <View
            className={
              isDark
                ? "mt-4 rounded-xl border border-[#292929] bg-[#171717] p-4"
                : "mt-4 rounded-xl border border-gray-200 bg-white p-4"
            }
          >
            <FacebookShimmer
              width="100%"
              height={12}
              radius={4}
              isDark={isDark}
            />

            <View className="mt-3">
              <FacebookShimmer
                width="94%"
                height={12}
                radius={4}
                isDark={isDark}
              />
            </View>

            <View className="mt-3">
              <FacebookShimmer
                width="88%"
                height={12}
                radius={4}
                isDark={isDark}
              />
            </View>

            <View className="mt-3">
              <FacebookShimmer
                width="65%"
                height={12}
                radius={4}
                isDark={isDark}
              />
            </View>
          </View>
        </View>

        {/* AMENITIES SKELETON */}

        <View className="mt-8 px-4">
          <FacebookShimmer
            width={135}
            height={20}
            radius={5}
            isDark={isDark}
          />

          <View className="mt-4 flex-row flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <FacebookShimmer
                key={item}
                width={90}
                height={34}
                radius={8}
                isDark={isDark}
              />
            ))}
          </View>
        </View>

        {/* VIDEO SKELETON */}

        <View className="mt-8 px-4">
          <FacebookShimmer
            width={125}
            height={20}
            radius={5}
            isDark={isDark}
          />

          <View className="mt-4">
            <FacebookShimmer
              width="100%"
              height={190}
              radius={14}
              isDark={isDark}
            />
          </View>
        </View>

        {/* BUTTON SKELETON */}

        <View className="mt-8 px-4">
          <FacebookShimmer
            width="100%"
            height={54}
            radius={12}
            isDark={isDark}
          />
        </View>

        {/* OPEN HOUSE SKELETON */}

        <View className="mt-8 px-4">
          <FacebookShimmer
            width={145}
            height={20}
            radius={5}
            isDark={isDark}
          />

          <View className="mt-4">
            <FacebookShimmer
              width="100%"
              height={90}
              radius={12}
              isDark={isDark}
            />
          </View>
        </View>

        {/* MAP SKELETON */}

        <View className="mt-8 px-4">
          <FacebookShimmer
            width={120}
            height={20}
            radius={5}
            isDark={isDark}
          />

          <View className="mt-4">
            <FacebookShimmer
              width="100%"
              height={190}
              radius={14}
              isDark={isDark}
            />
          </View>
        </View>

        {/* AGENT SKELETON */}

        <View className="mt-8 px-4">
          <FacebookShimmer
            width={135}
            height={20}
            radius={5}
            isDark={isDark}
          />

          <View
            className={
              isDark
                ? "mt-4 flex-row items-center rounded-xl border border-[#292929] bg-[#171717] p-4"
                : "mt-4 flex-row items-center rounded-xl border border-gray-200 bg-white p-4"
            }
          >
            <FacebookShimmer
              width={58}
              height={58}
              radius={35}
              isDark={isDark}
            />

            <View className="ml-4 flex-1">
              <FacebookShimmer
                width="65%"
                height={14}
                radius={5}
                isDark={isDark}
              />

              <View className="mt-3">
                <FacebookShimmer
                  width="45%"
                  height={11}
                  radius={4}
                  isDark={isDark}
                />
              </View>

              <View className="mt-3">
                <FacebookShimmer
                  width="75%"
                  height={11}
                  radius={4}
                  isDark={isDark}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// MAIN SCREEN
// ============================================================

export default function PropertyDetailsScreen() {
  const router = useRouter();

  const colorScheme = useColorScheme();

  const isDark = colorScheme !== "light";

  // ============================================================
  // AUTHENTICATED USER
  // ============================================================

  const { user, isLoggedIn, getAuthHeaders } = useAuth();

  const loggedInUserId = user?.id;

  // ============================================================
  // ROUTE PARAMS
  // ============================================================

  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;

  // ============================================================
  // STATE
  // ============================================================

  const [property, setProperty] = useState<Property | null>(null);

  const [listingAgent, setListingAgent] = useState<Agent | null>(null);

  const [listingAgentLoading, setListingAgentLoading] = useState(false);

  const [images, setImages] = useState<PropertyMediaItem[]>([]);

  const [videos, setVideos] = useState<PropertyMedia[]>([]);

  const [loading, setLoading] = useState(true);

  const [imagesLoading, setImagesLoading] = useState(true);

  const [videosLoading, setVideosLoading] = useState(true);

  const [imageIndex, setImageIndex] = useState(0);

  const [menuVisible, setMenuVisible] = useState(false);

  const [messageModalVisible, setMessageModalVisible] = useState(false);

  const [messageText, setMessageText] = useState("");

  const [sendingMessage, setSendingMessage] = useState(false);

  // ============================================================
  // LOAD PROPERTY
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadProperty = async () => {
      if (!propertyId) {
        setProperty(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const properties = await fetchProperties();

        const foundProperty = properties.find(
          (item) => String(item.id) === String(propertyId),
        );

        if (cancelled) {
          return;
        }

        setProperty(foundProperty ?? null);

        console.log("Loaded property:", foundProperty);

        if (foundProperty) {
          console.log("Property agent from property:", foundProperty.agent);

          console.log("Property valuer ID:", foundProperty.valuerId);
        }
      } catch (error) {
        console.error("Failed to load property:", error);

        if (!cancelled) {
          setProperty(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProperty();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  // ============================================================
  // RECORD PROPERTY VIEW
  // ============================================================
  //
  // The separate utility handles the API request and duplicate
  // request protection.
  //
  // This effect runs only after the property has loaded.
  // Tapping a property card alone does not call the view API.
  // ============================================================

  useEffect(() => {
    if (loading || !property || !propertyId) {
      return;
    }

    void trackPropertyView({
      propertyId: property.id,
      userId: loggedInUserId,
      getAuthHeaders,
    });
  }, [
    loading,
    property,
    propertyId,
    loggedInUserId,
    getAuthHeaders,
  ]);

  // ============================================================
  // LOAD LISTING AGENT
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadListingAgent = async () => {
      if (!property) {
        setListingAgent(null);
        setListingAgentLoading(false);
        return;
      }

      setListingAgentLoading(true);
      setListingAgent(null);

      try {
        // Use the agent already attached to the property.
        if (property.agent) {
          console.log(
            "Using agent already attached to property:",
            property.agent,
          );

          if (!cancelled) {
            setListingAgent(property.agent);
          }

          return;
        }

        // Use valuerId when available.
        if (
          property.valuerId !== undefined &&
          property.valuerId !== null &&
          String(property.valuerId).trim() !== ""
        ) {
          console.log("Property has valuer ID:", property.valuerId);

          try {
            const result = await fetchAgentDetails(property.valuerId);

            if (!cancelled) {
              setListingAgent(result.agent);
            }

            return;
          } catch (error) {
            console.error(
              "Failed to load agent using property valuerId:",
              error,
            );
          }
        }

        // Otherwise search each agent's associated properties.
        console.log("Property does not contain agent or valuerId.");

        console.log("Searching agents for property:", property.id);

        const agentsResponse = await fetchAgents();

        console.log("Available agents:", agentsResponse);

        if (!Array.isArray(agentsResponse)) {
          console.log("Agents response is not an array.");

          if (!cancelled) {
            setListingAgent(null);
          }

          return;
        }

        for (const agent of agentsResponse) {
          if (cancelled) {
            return;
          }

          try {
            console.log(
              `Checking agent ${agent.id} for property ${property.id}`,
            );

            const result = await fetchAgentDetails(agent.id);

            console.log(
              `Agent ${agent.id} returned ${result.properties.length} properties.`,
            );

            const associatedProperty = result.properties.find(
              (agentProperty) =>
                String(agentProperty.id) === String(property.id),
            );

            if (associatedProperty) {
              console.log("================================================");

              console.log("FOUND LISTING AGENT");

              console.log("Property ID:", property.id);

              console.log("Agent:", result.agent);

              console.log("Associated property:", associatedProperty);

              console.log("================================================");

              if (!cancelled) {
                setListingAgent(result.agent);
              }

              return;
            }
          } catch (agentError) {
            console.error(`Failed checking agent ${agent.id}:`, agentError);
          }
        }

        console.log("No listing agent was found for property:", property.id);

        if (!cancelled) {
          setListingAgent(null);
        }
      } catch (error) {
        console.error("Failed to search for listing agent:", error);

        if (!cancelled) {
          setListingAgent(null);
        }
      } finally {
        if (!cancelled) {
          setListingAgentLoading(false);
        }
      }
    };

    void loadListingAgent();

    return () => {
      cancelled = true;
    };
  }, [property]);

  // ============================================================
  // LOAD PROPERTY IMAGES
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadImages = async () => {
      if (!propertyId) {
        setImages([]);
        setImagesLoading(false);
        return;
      }

      try {
        setImagesLoading(true);

        const result = await fetchPropertyImages(propertyId);

        console.log("Loaded property images:", result);

        if (!cancelled) {
          setImages(result);
          setImageIndex(0);
        }
      } catch (error) {
        console.error("Failed to load property images:", error);

        if (!cancelled) {
          setImages([]);
          setImageIndex(0);
        }
      } finally {
        if (!cancelled) {
          setImagesLoading(false);
        }
      }
    };

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  // ============================================================
  // LOAD PROPERTY VIDEOS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadVideos = async () => {
      if (!propertyId) {
        setVideos([]);
        setVideosLoading(false);
        return;
      }

      try {
        setVideosLoading(true);

        const result = await fetchPropertyVideos(propertyId);

        console.log("Loaded property videos:", result);

        if (!cancelled) {
          const formattedVideos: PropertyMedia[] = result.map(
            (video, index) => ({
              id: Number(video.id) || index + 1,
              name: video.name || `Property video ${index + 1}`,
              original_url: video.url,
              preview_url: video.url,
            }),
          );

          setVideos(formattedVideos);
        }
      } catch (error) {
        console.error("Failed to load property videos:", error);

        if (!cancelled) {
          setVideos([]);
        }
      } finally {
        if (!cancelled) {
          setVideosLoading(false);
        }
      }
    };

    void loadVideos();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  // ============================================================
  // PROPERTY VALUES
  // ============================================================

  const locationText = useMemo(() => {
    if (!property) {
      return "";
    }

    return getPropertyLocationText(property);
  }, [property]);

  const listingType = useMemo(() => {
    if (!property) {
      return "";
    }

    return getPropertyListingType(property);
  }, [property]);

  const propertyType = useMemo(() => {
    if (!property) {
      return "";
    }

    return getPropertyType(property);
  }, [property]);

  const description = useMemo(() => {
    if (!property) {
      return "";
    }

    return getPropertyDescription(property);
  }, [property]);

  // ============================================================
  // MAP COORDINATES
  // ============================================================

  const coordinates = useMemo(() => {
    if (!property) {
      return null;
    }

    return getPropertyCoordinates(property);
  }, [property]);

  // ============================================================
  // MAKE OFFER
  // ============================================================

  const handleMakeOffer = async () => {
    if (!propertyId) {
      console.error("Cannot make offer: property ID is missing.");
      return;
    }

    if (loggedInUserId === undefined || loggedInUserId === null) {
      console.error("Cannot make offer: logged-in user ID is missing.");
      return;
    }

    const makeOfferUrl = `https://dev.valuationsafrica.mw/property/makeoffer/${loggedInUserId}/${propertyId}`;

    console.log("Opening Make Offer URL:", makeOfferUrl);

    console.log("Logged-in user ID:", loggedInUserId);

    console.log("Property ID:", propertyId);

    try {
      const supported = await Linking.canOpenURL(makeOfferUrl);

      if (!supported) {
        console.error("Cannot open Make Offer URL:", makeOfferUrl);
        return;
      }

      await Linking.openURL(makeOfferUrl);
    } catch (error) {
      console.error("Failed to open Make Offer website:", error);
    }
  };

  // ============================================================
  // OPEN MESSAGE MODAL
  // ============================================================

  const handleOpenMessage = () => {
    if (!listingAgent) {
      return;
    }

    if (!isLoggedIn) {
      Alert.alert(
        "Sign In Required",
        "Please sign in before sending a message to the agent.",
      );

      return;
    }

    if (loggedInUserId === undefined || loggedInUserId === null) {
      Alert.alert(
        "Account Error",
        "Your account ID could not be found. Please sign in again.",
      );

      return;
    }

    if (listingAgent.userId === undefined || listingAgent.userId === null) {
      Alert.alert(
        "Agent Unavailable",
        "The agent's user account could not be identified, so a message cannot be sent.",
      );

      return;
    }

    if (String(loggedInUserId) === String(listingAgent.userId)) {
      Alert.alert(
        "Cannot Send Message",
        "You cannot send a message to your own account.",
      );

      return;
    }

    setMessageText("");
    setMessageModalVisible(true);
  };

  // ============================================================
  // CLOSE MESSAGE MODAL
  // ============================================================

  const handleCloseMessage = () => {
    if (sendingMessage) {
      return;
    }

    setMessageModalVisible(false);
    setMessageText("");
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSendMessage = async () => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) {
      Alert.alert("Message Required", "Please enter a message before sending.");
      return;
    }

    if (!isLoggedIn) {
      Alert.alert(
        "Sign In Required",
        "Please sign in before sending a message.",
      );
      return;
    }

    if (loggedInUserId === undefined || loggedInUserId === null) {
      Alert.alert(
        "Account Error",
        "Your account ID could not be found. Please sign in again.",
      );
      return;
    }

    if (!listingAgent) {
      Alert.alert("Agent Unavailable", "The listing agent could not be found.");
      return;
    }

    if (listingAgent.userId === undefined || listingAgent.userId === null) {
      Alert.alert(
        "Agent Unavailable",
        "The agent's user account could not be identified.",
      );
      return;
    }

    if (String(loggedInUserId) === String(listingAgent.userId)) {
      Alert.alert(
        "Cannot Send Message",
        "You cannot send a message to your own account.",
      );
      return;
    }

    if (!BASE_API_URL) {
      Alert.alert("Configuration Error", "The API URL is not configured.");
      return;
    }

    try {
      setSendingMessage(true);

      const endpoint = `${BASE_API_URL}/v2/messages/send`;

      console.log("Sending message to:", endpoint);

      console.log("Message sender ID:", loggedInUserId);

      console.log("Message receiver ID:", listingAgent.userId);

      const authHeaders = await getAuthHeaders();

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          sender_id: loggedInUserId,
          receiver_id: listingAgent.userId,
          message: trimmedMessage,
        }),
      });

      const responseText = await response.text();

      let responseData: unknown = null;

      if (responseText) {
        try {
          responseData = JSON.parse(responseText) as unknown;
        } catch {
          responseData = responseText;
        }
      }

      console.log("Send message response status:", response.status);

      console.log("Send message response:", responseData);

      if (!response.ok) {
        let errorMessage = "Failed to send your message.";

        if (typeof responseData === "object" && responseData !== null) {
          const data = responseData as Record<string, unknown>;

          const serverMessage = data.message ?? data.msg ?? data.error;

          if (typeof serverMessage === "string" && serverMessage.trim()) {
            errorMessage = serverMessage;
          }
        } else if (typeof responseData === "string" && responseData.trim()) {
          errorMessage = responseData;
        }

        throw new Error(
          `Message request failed (${response.status}): ${errorMessage}`,
        );
      }

      setMessageModalVisible(false);
      setMessageText("");

      Alert.alert(
        "Message Sent",
        `Your message has been sent to ${listingAgent.name || "the agent"}.`,
      );
    } catch (error) {
      console.error("Failed to send message:", error);

      Alert.alert(
        "Message Not Sent",
        error instanceof Error
          ? error.message
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setSendingMessage(false);
    }
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const handleBack = () => {
    router.back();
  };

  const handleAgentPress = () => {
    if (!listingAgent) {
      return;
    }

    router.push({
      pathname: "/(tabs)/agents/[id]",
      params: {
        id: String(listingAgent.id),
      },
    });
  };

  // ============================================================
  // FACEBOOK-STYLE LOADING SCREEN
  // ============================================================

  if (loading) {
    return <PropertyDetailsSkeleton isDark={isDark} />;
  }

  // ============================================================
  // PROPERTY NOT FOUND
  // ============================================================

  if (!property) {
    return (
      <SafeAreaView
        className={isDark ? "flex-1 bg-[#0d0d0d]" : "flex-1 bg-gray-50"}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#0d0d0d" : "#f9fafb"}
        />

        <View
          className={
            isDark
              ? "flex-row items-center border-b border-zinc-800 bg-[#0d0d0d] px-4 py-3"
              : "flex-row items-center border-b border-gray-200 bg-white px-4 py-3"
          }
        >
          <Pressable
            onPress={handleBack}
            className={
              isDark
                ? "h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
                : "h-11 w-11 items-center justify-center rounded-full bg-gray-100"
            }
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={isDark ? "#fff" : "#000"}
            />
          </Pressable>

          <Text
            className={
              isDark
                ? "ml-3 text-xl font-bold text-white"
                : "ml-3 text-xl font-bold text-black"
            }
          >
            Property
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="home-outline"
            size={60}
            color={isDark ? "#555" : "#9ca3af"}
          />

          <Text
            className={
              isDark
                ? "mt-5 text-center text-xl font-bold text-white"
                : "mt-5 text-center text-xl font-bold text-black"
            }
          >
            Property not found
          </Text>

          <Text
            className={
              isDark
                ? "mt-2 text-center text-sm text-zinc-500"
                : "mt-2 text-center text-sm text-gray-500"
            }
          >
            The property may no longer be available.
          </Text>

          <Pressable
            onPress={handleBack}
            className="mt-6 rounded-xl bg-red-600 px-6 py-3"
          >
            <Text className="font-bold text-white">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // PROPERTY DETAILS VALUES
  // ============================================================

  const bedrooms = getPropertyValue(property, "beds", "bedrooms", "rooms");

  const bathrooms = getPropertyValue(property, "baths", "bathrooms");

  const views = getPropertyValue(property, "views", "view_count");

  const buildingSize = getPropertyValue(
    property,
    "building_size",
    "buildingSize",
    "size",
    "area_size",
  );

  const yearBuilt = getPropertyValue(property, "year_built", "yearBuilt");

  const zone = getPropertyValue(property, "zone", "zone_type");

  const titleDeed = getPropertyValue(
    property,
    "title_deeds",
    "titleDeed",
    "title_deed",
  );

  const masterBedroom = getPropertyValue(
    property,
    "master_bedroom",
    "masterBedroom",
  );

  const amenities = getPropertyAmenities(property);

  const openHouseItems = getPropertyOpenHouses(
    property,
  ) as PropertyOpenHouseItem[];

  // ============================================================
  // PROPERTY INFORMATION COMPONENT DATA
  // ============================================================

  const propertyInformation: PropertyInformationData = {
    title: propertyType || property.type || "Property Details",
    listingType: listingType || "For Sale",
    status: property.systemStatus,
    location: locationText,
    zone,
    price: property.price,
    propertyType,
    bedrooms,
    bathrooms,
    buildingSize,
    yearBuilt,
    titleDeed,
    masterBedroom,
    views,
  };

  // ============================================================
  // IMAGE FALLBACK
  // ============================================================

  const displayImages: PropertyMediaItem[] =
    images.length > 0
      ? images
      : property.image
        ? [
            {
              id: 0,
              name: propertyType || property.type || "Property image",
              url: property.image,
              description: null,
              collection: "images",
            },
          ]
        : [];

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <SafeAreaView
      className={isDark ? "flex-1 bg-[#0d0d0d]" : "flex-1 bg-gray-50"}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0d0d0d" : "#f9fafb"}
      />

      {/* HEADER */}

      <View
        className={
          isDark
            ? "flex-row items-center justify-between border-b border-zinc-800 bg-[#0d0d0d] px-4 py-3"
            : "flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3"
        }
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={handleBack}
            className={
              isDark
                ? "h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
                : "h-11 w-11 items-center justify-center rounded-full bg-gray-100"
            }
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={isDark ? "#fff" : "#000"}
            />
          </Pressable>

          <View className="ml-3">
            <Text
              className={
                isDark
                  ? "text-lg font-bold text-white"
                  : "text-lg font-bold text-black"
              }
              numberOfLines={1}
            >
              Property Details
            </Text>

            <Text
              className={
                isDark ? "text-xs text-zinc-500" : "text-xs text-gray-500"
              }
            >
              Property #{property.id}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setMenuVisible(true)}
          className={
            isDark
              ? "h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
              : "h-11 w-11 items-center justify-center rounded-full bg-gray-100"
          }
        >
          <Ionicons
            name="menu-outline"
            size={26}
            color={isDark ? "#fff" : "#000"}
          />
        </Pressable>
      </View>

      {/* SCROLLABLE PROPERTY CONTENT */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        {/* PROPERTY IMAGE GALLERY */}

        <PropertyImageGallery
          images={displayImages}
          loading={imagesLoading}
          imageIndex={imageIndex}
          onImageIndexChange={setImageIndex}
          isDark={isDark}
        />

        {/* PROPERTY INFORMATION */}

        <PropertyInformation
          information={propertyInformation}
          isDark={isDark}
        />

        {/* PROPERTY HIGHLIGHTS */}

        <View className="px-4">
          <PropertyHighlights
            views={views}
            bedrooms={bedrooms}
            bathrooms={bathrooms}
            buildingSize={buildingSize}
            masterBedroom={masterBedroom}
            titleDeed={titleDeed}
            isDark={isDark}
          />
        </View>

        {/* DESCRIPTION */}

        <View className="mt-8 px-4">
          <Text
            className={
              isDark
                ? "mb-4 text-xl font-bold text-white"
                : "mb-4 text-xl font-bold text-black"
            }
          >
            Description
          </Text>

          <View
            className={
              isDark
                ? "rounded-xl border border-[#292929] bg-[#171717] p-4"
                : "rounded-xl border border-gray-200 bg-white p-4"
            }
          >
            <Text
              className={
                isDark
                  ? "text-sm leading-6 text-zinc-300"
                  : "text-sm leading-6 text-gray-700"
              }
            >
              {description || "No description available for this property."}
            </Text>
          </View>
        </View>

        {/* PROPERTY AMENITIES */}

        <View className="px-4">
          <PropertyAmenities amenities={amenities} isDark={isDark} />
        </View>

        {/* PROPERTY VIDEOS */}

        <View className="px-4">
          <PropertyVideosSection
            videos={videos}
            loading={videosLoading}
            isDark={isDark}
          />
        </View>

        {/* MAKE OFFER */}

        <View className="px-4">
          <Pressable
            onPress={handleMakeOffer}
            className="mt-8 w-full flex-row items-center justify-center rounded-xl bg-red-600 px-5 py-4 active:bg-red-700"
          >
            <Ionicons name="pricetag-outline" size={20} color="#fff" />

            <Text className="ml-2 text-base font-bold text-white">
              Make Offer
            </Text>
          </Pressable>
        </View>

        {/* OPEN HOUSES */}

        <View className="px-4">
          <PropertyOpenHouse
            isOpenHouse={Boolean(property.isOpenHouse)}
            openHouses={openHouseItems}
            isDark={isDark}
          />
        </View>

        {/* PROPERTY MAP */}

        <View className="px-4">
          <PropertyLocationMap
            coordinates={coordinates}
            locationText={locationText}
            propertyTitle={propertyType || property.type || "Property"}
            isDark={isDark}
          />
        </View>

        {/* LISTING AGENT */}

        <View className="px-4">
          <PropertyListingAgent
            listingAgent={listingAgent}
            loading={listingAgentLoading}
            isDark={isDark}
            onAgentPress={handleAgentPress}
            onMessagePress={handleOpenMessage}
            messageDisabled={sendingMessage}
          />
        </View>
      </ScrollView>

      {/* MESSAGE MODAL */}

      <PropertyMessageModal
        visible={messageModalVisible}
        isDark={isDark}
        listingAgent={listingAgent}
        messageText={messageText}
        onMessageTextChange={setMessageText}
        sendingMessage={sendingMessage}
        onClose={handleCloseMessage}
        onSend={handleSendMessage}
      />

      {/* SIDE MENU */}

      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}