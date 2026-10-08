import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  VideoView,
  useVideoPlayer,
} from "expo-video";

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";

import SideMenu from "@/app/components/sidebar/SideMenu";

import { useAuth } from "@/app/components/auth/AuthContext";

import {
  fetchProperties,
  fetchPropertyImages,
  fetchPropertyVideos,
  fetchAgentDetails,
  type Property,
  type PropertyMedia,
} from "@/app/services/propertyApi";

import {
  fetchAgents,
} from "@/app/services/agentApi";

import type {
  Agent,
} from "@/app/services/agentApi";

const { width: SCREEN_WIDTH } =
  Dimensions.get("window");

const IMAGE_HEIGHT = Math.min(
  320,
  SCREEN_WIDTH * 0.7,
);

const VIDEO_HEIGHT = Math.min(
  240,
  SCREEN_WIDTH * 0.56,
);

// ============================================================
// API BASE URL
// ============================================================

const API_URL =
  process.env.EXPO_PUBLIC_API_URL;

const BASE_API_URL =
  API_URL?.replace(/\/+$/, "") ?? "";

// ============================================================
// VIDEO PLAYER COMPONENT
// ============================================================

interface PropertyVideoProps {
  video: PropertyMedia;
}

function PropertyVideo({
  video,
}: PropertyVideoProps) {
  const colorScheme =
    useColorScheme();

  const isDark =
    colorScheme !== "light";

  const player = useVideoPlayer(
    video.url,
    (player) => {
      player.loop = false;
    },
  );

  return (
    <View
      className={
        isDark
          ? "mb-4 overflow-hidden rounded-xl border border-[#292929] bg-black"
          : "mb-4 overflow-hidden rounded-xl border border-gray-200 bg-black"
      }
    >
      <VideoView
        player={player}
        style={{
          width: "100%",
          height: VIDEO_HEIGHT,
        }}
        nativeControls
        contentFit="contain"
      />

      {video.description ? (
        <View
          className={
            isDark
              ? "bg-[#171717] px-4 py-3"
              : "bg-gray-100 px-4 py-3"
          }
        >
          <Text
            className={
              isDark
                ? "text-sm text-zinc-300"
                : "text-sm text-gray-700"
            }
          >
            {video.description}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ============================================================
// MAIN SCREEN
// ============================================================

export default function PropertyDetailsScreen() {
  const router = useRouter();

  const colorScheme =
    useColorScheme();

  const isDark =
    colorScheme !== "light";

  // ============================================================
  // AUTHENTICATED USER
  // ============================================================

  const {
    user,
    isLoggedIn,
    getAuthHeaders,
  } = useAuth();

  const loggedInUserId =
    user?.id;

  // ============================================================
  // ROUTE PARAMS
  // ============================================================

  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const propertyId = Array.isArray(
    params.id,
  )
    ? params.id[0]
    : params.id;

  // ============================================================
  // STATE
  // ============================================================

  const [property, setProperty] =
    useState<Property | null>(null);

  const [listingAgent, setListingAgent] =
    useState<Agent | null>(null);

  const [listingAgentLoading, setListingAgentLoading] =
    useState(false);

  const [images, setImages] =
    useState<PropertyMedia[]>([]);

  const [videos, setVideos] =
    useState<PropertyMedia[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [imagesLoading, setImagesLoading] =
    useState(true);

  const [videosLoading, setVideosLoading] =
    useState(true);

  const [imageIndex, setImageIndex] =
    useState(0);

  const [menuVisible, setMenuVisible] =
    useState(false);

  // ============================================================
  // MESSAGE STATE
  // ============================================================

  const [messageModalVisible, setMessageModalVisible] =
    useState(false);

  const [messageText, setMessageText] =
    useState("");

  const [sendingMessage, setSendingMessage] =
    useState(false);

  // ============================================================
  // LOAD PROPERTY
  // ============================================================

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const properties =
          await fetchProperties();

        const foundProperty =
          properties.find(
            (item) =>
              String(item.id) ===
              String(propertyId),
          );

        setProperty(
          foundProperty ?? null,
        );

        console.log(
          "Loaded property:",
          foundProperty,
        );

        if (foundProperty) {
          console.log(
            "Property agent from property:",
            foundProperty.agent,
          );

          console.log(
            "Property valuer ID:",
            foundProperty.valuerId,
          );
        }
      } catch (error) {
        console.error(
          "Failed to load property:",
          error,
        );

        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    void loadProperty();
  }, [propertyId]);

  // ============================================================
  // LOAD LISTING AGENT
  //
  // IMPORTANT:
  //
  // The generic property endpoint may return:
  //
  //   agent: null
  //   valuerId: null
  //
  // even though the property is actually associated with
  // an agent.
  //
  // The working endpoint is:
  //
  //   GET /v2/agents/{agentId}
  //
  // That endpoint returns:
  //
  //   {
  //     data: agent,
  //     properties: [...]
  //   }
  //
  // Therefore we:
  //
  // 1. Use property.agent if already available.
  // 2. Use property.valuerId if available.
  // 3. Otherwise load all agents.
  // 4. Check each agent's associated properties.
  // 5. Find the agent whose property list contains this
  //    property's ID.
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
        // ------------------------------------------------------
        // STEP 1
        // If the property already contains its agent, use it.
        // ------------------------------------------------------

        if (property.agent) {
          console.log(
            "Using agent already attached to property:",
            property.agent,
          );

          if (!cancelled) {
            setListingAgent(
              property.agent,
            );
          }

          return;
        }

        // ------------------------------------------------------
        // STEP 2
        // If valuerId exists, directly request that agent.
        // ------------------------------------------------------

        if (
          property.valuerId !==
            undefined &&
          property.valuerId !== null &&
          String(
            property.valuerId,
          ).trim() !== ""
        ) {
          console.log(
            "Property has valuer ID:",
            property.valuerId,
          );

          try {
            const result =
              await fetchAgentDetails(
                property.valuerId,
              );

            if (!cancelled) {
              setListingAgent(
                result.agent,
              );
            }

            return;
          } catch (error) {
            console.error(
              "Failed to load agent using property valuerId:",
              error,
            );
          }
        }

        // ------------------------------------------------------
        // STEP 3
        // The property has no agent and no valuerId.
        //
        // Search through the agent-details endpoint.
        // ------------------------------------------------------

        console.log(
          "Property does not contain agent or valuerId.",
        );

        console.log(
          "Searching agents for property:",
          property.id,
        );

        const agentsResponse =
          await fetchAgents();

        console.log(
          "Available agents:",
          agentsResponse,
        );

        if (
          !Array.isArray(
            agentsResponse,
          )
        ) {
          console.log(
            "Agents response is not an array.",
          );

          if (!cancelled) {
            setListingAgent(null);
          }

          return;
        }

        // ------------------------------------------------------
        // STEP 4
        // Check every agent.
        // ------------------------------------------------------

        for (const agent of agentsResponse) {
          if (cancelled) {
            return;
          }

          try {
            console.log(
              `Checking agent ${agent.id} for property ${property.id}`,
            );

            const result =
              await fetchAgentDetails(
                agent.id,
              );

            console.log(
              `Agent ${agent.id} returned ${result.properties.length} properties.`,
            );

            // --------------------------------------------------
            // STEP 5
            // Look for the current property.
            // --------------------------------------------------

            const associatedProperty =
              result.properties.find(
                (agentProperty) =>
                  String(
                    agentProperty.id,
                  ) ===
                  String(
                    property.id,
                  ),
              );

            if (
              associatedProperty
            ) {
              console.log(
                "================================================",
              );

              console.log(
                "FOUND LISTING AGENT",
              );

              console.log(
                "Property ID:",
                property.id,
              );

              console.log(
                "Agent:",
                result.agent,
              );

              console.log(
                "Associated property:",
                associatedProperty,
              );

              console.log(
                "================================================",
              );

              if (!cancelled) {
                setListingAgent(
                  result.agent,
                );
              }

              return;
            }
          } catch (agentError) {
            console.error(
              `Failed checking agent ${agent.id}:`,
              agentError,
            );

            // Continue checking the next agent.
          }
        }

        // ------------------------------------------------------
        // No agent was found.
        // ------------------------------------------------------

        console.log(
          "No listing agent was found for property:",
          property.id,
        );

        if (!cancelled) {
          setListingAgent(null);
        }
      } catch (error) {
        console.error(
          "Failed to search for listing agent:",
          error,
        );

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
    const loadImages = async () => {
      if (!propertyId) {
        setImagesLoading(false);
        return;
      }

      try {
        setImagesLoading(true);

        const result =
          await fetchPropertyImages(
            propertyId,
          );

        setImages(result);
      } catch (error) {
        console.error(
          "Failed to load property images:",
          error,
        );

        setImages([]);
      } finally {
        setImagesLoading(false);
      }
    };

    void loadImages();
  }, [propertyId]);

  // ============================================================
  // LOAD PROPERTY VIDEOS
  // ============================================================

  useEffect(() => {
    const loadVideos = async () => {
      if (!propertyId) {
        setVideosLoading(false);
        return;
      }

      try {
        setVideosLoading(true);

        const result =
          await fetchPropertyVideos(
            propertyId,
          );

        console.log(
          "Loaded property videos:",
          result,
        );

        setVideos(result);
      } catch (error) {
        console.error(
          "Failed to load property videos:",
          error,
        );

        setVideos([]);
      } finally {
        setVideosLoading(false);
      }
    };

    void loadVideos();
  }, [propertyId]);

  // ============================================================
  // PROPERTY VALUES
  // ============================================================

  const locationText = useMemo(() => {
    if (!property) {
      return "";
    }

    const location =
      property.location;

    if (
      typeof location === "string"
    ) {
      return location;
    }

    if (
      location &&
      typeof location === "object"
    ) {
      const locationObject =
        location as Record<
          string,
          unknown
        >;

      return [
        locationObject.area,
        locationObject.city,
        locationObject.district,
        locationObject.region,
        locationObject.country,
      ]
        .filter(Boolean)
        .join(", ");
    }

    return "";
  }, [property]);

  const listingType = useMemo(() => {
    if (!property) {
      return "";
    }

    return String(
      property.listingType ??
        property.listing_type ??
        property.status ??
        "",
    );
  }, [property]);

  const propertyType = useMemo(() => {
    if (!property) {
      return "";
    }

    return String(
      property.propertyType ??
        property.property_type ??
        property.type ??
        "",
    );
  }, [property]);

  const description = useMemo(() => {
    if (!property) {
      return "";
    }

    return String(
      property.description ?? "",
    );
  }, [property]);

  // ============================================================
  // GENERIC VALUE HELPER
  // ============================================================

  const getValue = (
    propertyValue: Property,
    ...keys: string[]
  ): string => {
    const object =
      propertyValue as unknown as Record<
        string,
        unknown
      >;

    for (const key of keys) {
      const value = object[key];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return String(value);
      }
    }

    return "";
  };

  // ============================================================
  // MAP COORDINATES
  // ============================================================

  const coordinates = useMemo(() => {
    if (!property) {
      return null;
    }

    const object =
      property as unknown as Record<
        string,
        unknown
      >;

    const location =
      object.location &&
      typeof object.location === "object"
        ? (object.location as Record<
            string,
            unknown
          >)
        : null;

    const latitudeValue =
      location?.latitude ??
      location?.lat ??
      object.latitude ??
      object.lat;

    const longitudeValue =
      location?.longitude ??
      location?.lng ??
      location?.lon ??
      object.longitude ??
      object.lng;

    const latitude =
      Number(latitudeValue);

    const longitude =
      Number(longitudeValue);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null;
    }

    return {
      latitude,
      longitude,
    };
  }, [property]);

  // ============================================================
  // MAKE OFFER
  // ============================================================

  const handleMakeOffer = async () => {
    if (!propertyId) {
      console.error(
        "Cannot make offer: property ID is missing.",
      );
      return;
    }

    if (
      loggedInUserId ===
        undefined ||
      loggedInUserId === null
    ) {
      console.error(
        "Cannot make offer: logged-in user ID is missing.",
      );

      return;
    }

    const makeOfferUrl =
      `https://dev.valuationsafrica.mw/property/makeoffer/${loggedInUserId}/${propertyId}`;

    console.log(
      "Opening Make Offer URL:",
      makeOfferUrl,
    );

    console.log(
      "Logged-in user ID:",
      loggedInUserId,
    );

    console.log(
      "Property ID:",
      propertyId,
    );

    try {
      const supported =
        await Linking.canOpenURL(
          makeOfferUrl,
        );

      if (!supported) {
        console.error(
          "Cannot open Make Offer URL:",
          makeOfferUrl,
        );

        return;
      }

      await Linking.openURL(
        makeOfferUrl,
      );
    } catch (error) {
      console.error(
        "Failed to open Make Offer website:",
        error,
      );
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

    if (
      loggedInUserId ===
        undefined ||
      loggedInUserId === null
    ) {
      Alert.alert(
        "Account Error",
        "Your account ID could not be found. Please sign in again.",
      );

      return;
    }

    if (
      listingAgent.userId ===
        undefined ||
      listingAgent.userId === null
    ) {
      Alert.alert(
        "Agent Unavailable",
        "The agent's user account could not be identified, so a message cannot be sent.",
      );

      return;
    }

    if (
      String(loggedInUserId) ===
      String(listingAgent.userId)
    ) {
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
    const trimmedMessage =
      messageText.trim();

    if (!trimmedMessage) {
      Alert.alert(
        "Message Required",
        "Please enter a message before sending.",
      );

      return;
    }

    if (!isLoggedIn) {
      Alert.alert(
        "Sign In Required",
        "Please sign in before sending a message.",
      );

      return;
    }

    if (
      loggedInUserId ===
        undefined ||
      loggedInUserId === null
    ) {
      Alert.alert(
        "Account Error",
        "Your account ID could not be found. Please sign in again.",
      );

      return;
    }

    if (!listingAgent) {
      Alert.alert(
        "Agent Unavailable",
        "The listing agent could not be found.",
      );

      return;
    }

    if (
      listingAgent.userId ===
        undefined ||
      listingAgent.userId === null
    ) {
      Alert.alert(
        "Agent Unavailable",
        "The agent's user account could not be identified.",
      );

      return;
    }

    if (
      String(loggedInUserId) ===
      String(listingAgent.userId)
    ) {
      Alert.alert(
        "Cannot Send Message",
        "You cannot send a message to your own account.",
      );

      return;
    }

    if (!BASE_API_URL) {
      Alert.alert(
        "Configuration Error",
        "The API URL is not configured.",
      );

      return;
    }

    try {
      setSendingMessage(true);

      const endpoint =
        `${BASE_API_URL}/v2/messages/send`;

      console.log(
        "Sending message to:",
        endpoint,
      );

      console.log(
        "Message sender ID:",
        loggedInUserId,
      );

      console.log(
        "Message receiver ID:",
        listingAgent.userId,
      );

      const authHeaders =
        await getAuthHeaders();

      const response =
        await fetch(endpoint, {
          method: "POST",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",

            ...authHeaders,
          },

          body: JSON.stringify({
            sender_id:
              loggedInUserId,

            receiver_id:
              listingAgent.userId,

            message:
              trimmedMessage,
          }),
        });

      const responseText =
        await response.text();

      let responseData: unknown =
        null;

      if (responseText) {
        try {
          responseData =
            JSON.parse(
              responseText,
            ) as unknown;
        } catch {
          responseData =
            responseText;
        }
      }

      console.log(
        "Send message response status:",
        response.status,
      );

      console.log(
        "Send message response:",
        responseData,
      );

      if (!response.ok) {
        let errorMessage =
          "Failed to send your message.";

        if (
          typeof responseData ===
            "object" &&
          responseData !== null
        ) {
          const data =
            responseData as Record<
              string,
              unknown
            >;

          const serverMessage =
            data.message ??
            data.msg ??
            data.error;

          if (
            typeof serverMessage ===
            "string" &&
            serverMessage.trim()
          ) {
            errorMessage =
              serverMessage;
          }
        } else if (
          typeof responseData ===
            "string" &&
          responseData.trim()
        ) {
          errorMessage =
            responseData;
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
      console.error(
        "Failed to send message:",
        error,
      );

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
  // BACK
  // ============================================================

  const handleBack = () => {
    router.back();
  };

  // ============================================================
  // OPEN AGENT DETAILS
  // ============================================================

  const handleAgentPress = () => {
    if (!listingAgent) {
      return;
    }

    router.push({
      pathname: "/(tabs)/agents/[id]",
      params: {
        id: String(
          listingAgent.id,
        ),
      },
    });
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <SafeAreaView
        className={
          isDark
            ? "flex-1 bg-[#0d0d0d]"
            : "flex-1 bg-white"
        }
      >
        <StatusBar
          barStyle={
            isDark
              ? "light-content"
              : "dark-content"
          }
          backgroundColor={
            isDark
              ? "#0d0d0d"
              : "#ffffff"
          }
        />

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#dc2626"
          />

          <Text
            className={
              isDark
                ? "mt-4 text-sm text-zinc-400"
                : "mt-4 text-sm text-gray-600"
            }
          >
            Loading property...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // PROPERTY NOT FOUND
  // ============================================================

  if (!property) {
    return (
      <SafeAreaView
        className={
          isDark
            ? "flex-1 bg-[#0d0d0d]"
            : "flex-1 bg-gray-50"
        }
      >
        <StatusBar
          barStyle={
            isDark
              ? "light-content"
              : "dark-content"
          }
          backgroundColor={
            isDark
              ? "#0d0d0d"
              : "#f9fafb"
          }
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
              color={
                isDark
                  ? "#fff"
                  : "#000"
              }
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
            color={
              isDark
                ? "#555"
                : "#9ca3af"
            }
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
            The property may no longer be
            available.
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
  // PROPERTY DETAILS VALUES
  // ============================================================

  const bedrooms = getValue(
    property,
    "beds",
    "bedrooms",
    "rooms",
  );

  const bathrooms = getValue(
    property,
    "baths",
    "bathrooms",
  );

  const views = getValue(
    property,
    "views",
    "view_count",
  );

  const buildingSize = getValue(
    property,
    "building_size",
    "buildingSize",
    "size",
    "area_size",
  );

  const yearBuilt = getValue(
    property,
    "year_built",
    "yearBuilt",
  );

  const zone = getValue(
    property,
    "zone",
    "zone_type",
  );

  const titleDeed = getValue(
    property,
    "title_deeds",
    "titleDeed",
    "title_deed",
  );

  const masterBedroom = getValue(
    property,
    "master_bedroom",
    "masterBedroom",
  );

  const amenities =
    Array.isArray(
      (
        property as unknown as Record<
          string,
          unknown
        >
      ).amenities,
    )
      ? (
          (
            property as unknown as Record<
              string,
              unknown
            >
          ).amenities as unknown[]
        )
      : [];

  // ============================================================
  // IMAGE FALLBACK
  // ============================================================

  const displayImages =
    images.length > 0
      ? images
      : property.image
        ? [
            {
              id: "main",
              url: property.image,
              description: null,
              collection: "images",
            },
          ]
        : [];

  return (
    <SafeAreaView
      className={
        isDark
          ? "flex-1 bg-[#0d0d0d]"
          : "flex-1 bg-gray-50"
      }
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={
          isDark
            ? "#0d0d0d"
            : "#f9fafb"
        }
      />

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

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
              color={
                isDark
                  ? "#fff"
                  : "#000"
              }
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
                isDark
                  ? "text-xs text-zinc-500"
                  : "text-xs text-gray-500"
              }
            >
              Property #{property.id}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            setMenuVisible(true)
          }
          className={
            isDark
              ? "h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
              : "h-11 w-11 items-center justify-center rounded-full bg-gray-100"
          }
        >
          <Ionicons
            name="menu-outline"
            size={26}
            color={
              isDark
                ? "#fff"
                : "#000"
            }
          />
        </Pressable>
      </View>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        {/* ==================================================== */}
        {/* IMAGE GALLERY */}
        {/* ==================================================== */}

        <View
          className={
            isDark
              ? "bg-[#111]"
              : "bg-gray-100"
          }
        >
          {imagesLoading ? (
            <View
              style={{
                height: IMAGE_HEIGHT,
              }}
              className="items-center justify-center"
            >
              <ActivityIndicator
                size="large"
                color="#dc2626"
              />

              <Text
                className={
                  isDark
                    ? "mt-3 text-sm text-zinc-500"
                    : "mt-3 text-sm text-gray-500"
                }
              >
                Loading property images...
              </Text>
            </View>
          ) : displayImages.length >
            0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={
                  false
                }
                onMomentumScrollEnd={(
                  event,
                ) => {
                  const index =
                    Math.round(
                      event.nativeEvent
                        .contentOffset
                        .x /
                        SCREEN_WIDTH,
                    );

                  setImageIndex(index);
                }}
              >
                {displayImages.map(
                  (image) => (
                    <View
                      key={String(
                        image.id,
                      )}
                      style={{
                        width:
                          SCREEN_WIDTH,
                        height:
                          IMAGE_HEIGHT,
                      }}
                    >
                      <Image
                        source={{
                          uri: image.url,
                        }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />

                      {image.description ? (
                        <View className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-3">
                          <Text className="text-sm text-white">
                            {
                              image.description
                            }
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ),
                )}
              </ScrollView>

              <View className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1.5">
                <Text className="text-xs font-semibold text-white">
                  {imageIndex + 1} /{" "}
                  {displayImages.length}
                </Text>
              </View>

              {displayImages.length >
                1 && (
                <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center">
                  {displayImages.map(
                    (
                      image,
                      index,
                    ) => (
                      <View
                        key={`dot-${String(
                          image.id,
                        )}`}
                        className={`mx-1 h-2 rounded-full ${
                          index ===
                          imageIndex
                            ? "w-5 bg-red-500"
                            : "w-2 bg-white/50"
                        }`}
                      />
                    ),
                  )}
                </View>
              )}
            </>
          ) : (
            <View
              style={{
                height: IMAGE_HEIGHT,
              }}
              className={
                isDark
                  ? "items-center justify-center bg-[#222]"
                  : "items-center justify-center bg-gray-200"
              }
            >
              <Ionicons
                name="image-outline"
                size={55}
                color={
                  isDark
                    ? "#555"
                    : "#9ca3af"
                }
              />

              <Text
                className={
                  isDark
                    ? "mt-3 text-sm text-zinc-500"
                    : "mt-3 text-sm text-gray-500"
                }
              >
                No property images
              </Text>
            </View>
          )}
        </View>

        {/* ==================================================== */}
        {/* BASIC INFORMATION */}
        {/* ==================================================== */}

        <View className="px-4 pt-5">
          <View className="flex-row items-center justify-between">
            <View className="rounded-md bg-red-600 px-3 py-1.5">
              <Text className="text-xs font-bold text-white">
                {listingType ||
                  "For Sale"}
              </Text>
            </View>

            {property.systemStatus ? (
              <Text
                className={
                  isDark
                    ? "text-sm font-medium text-zinc-400"
                    : "text-sm font-medium text-gray-600"
                }
              >
                {property.systemStatus}
              </Text>
            ) : null}
          </View>

          <Text
            className={
              isDark
                ? "mt-4 text-2xl font-bold text-white"
                : "mt-4 text-2xl font-bold text-black"
            }
          >
            {property.title ||
              locationText ||
              "Property"}
          </Text>

          <View className="mt-3 flex-row items-start">
            <Ionicons
              name="location-outline"
              size={20}
              color="#ef4444"
            />

            <View className="ml-2 flex-1">
              <Text
                className={
                  isDark
                    ? "text-base font-semibold text-zinc-300"
                    : "text-base font-semibold text-gray-700"
                }
              >
                {locationText ||
                  "Location unavailable"}
              </Text>

              {zone ? (
                <Text
                  className={
                    isDark
                      ? "mt-1 text-sm text-zinc-500"
                      : "mt-1 text-sm text-gray-500"
                  }
                >
                  Zone: {zone}
                </Text>
              ) : null}
            </View>
          </View>

          <Text
            className={
              isDark
                ? "mt-5 text-2xl font-bold text-white"
                : "mt-5 text-2xl font-bold text-black"
            }
          >
            {property.price ||
              "Price on request"}
          </Text>

          {/* ================================================= */}
          {/* PROPERTY HIGHLIGHTS */}
          {/* ================================================= */}

          <View className="mt-7">
            <Text
              className={
                isDark
                  ? "mb-4 text-xl font-bold text-white"
                  : "mb-4 text-xl font-bold text-black"
              }
            >
              Property Highlights
            </Text>

            <View className="flex-row flex-wrap">
              {views ? (
                <Highlight
                  icon="eye-outline"
                  value={views}
                  label="Views"
                  isDark={isDark}
                />
              ) : null}

              {bedrooms ? (
                <Highlight
                  icon="bed-outline"
                  value={bedrooms}
                  label="Beds"
                  isDark={isDark}
                />
              ) : null}

              {bathrooms ? (
                <Highlight
                  icon="water-outline"
                  value={bathrooms}
                  label="Baths"
                  isDark={isDark}
                />
              ) : null}

              {buildingSize ? (
                <Highlight
                  icon="resize-outline"
                  value={`${buildingSize}m²`}
                  label="Area"
                  isDark={isDark}
                />
              ) : null}

              {masterBedroom ? (
                <Highlight
                  icon="bed-outline"
                  value={masterBedroom}
                  label=""
                  wide
                  isDark={isDark}
                />
              ) : null}

              {titleDeed ? (
                <Highlight
                  icon="document-text-outline"
                  value={titleDeed}
                  label="Title Deed"
                  wide
                  isDark={isDark}
                />
              ) : null}
            </View>
          </View>

          {/* ================================================= */}
          {/* PROPERTY DETAILS */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text
              className={
                isDark
                  ? "mb-4 text-xl font-bold text-white"
                  : "mb-4 text-xl font-bold text-black"
              }
            >
              Property Details
            </Text>

            <View
              className={
                isDark
                  ? "overflow-hidden rounded-xl border border-[#292929] bg-[#171717]"
                  : "overflow-hidden rounded-xl border border-gray-200 bg-white"
              }
            >
              <DetailRow
                icon="location-outline"
                label="Zone"
                value={
                  zone ||
                  "Not specified"
                }
                isDark={isDark}
              />

              <DetailRow
                icon="business-outline"
                label="Type"
                value={
                  propertyType ||
                  "Not specified"
                }
                isDark={isDark}
              />

              <DetailRow
                icon="calendar-outline"
                label="Built"
                value={
                  yearBuilt ||
                  "Not specified"
                }
                last
                isDark={isDark}
              />
            </View>
          </View>

          {/* ================================================= */}
          {/* DESCRIPTION */}
          {/* ================================================= */}

          <View className="mt-8">
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
                {description ||
                  "No description available for this property."}
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* AMENITIES */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text
              className={
                isDark
                  ? "mb-4 text-xl font-bold text-white"
                  : "mb-4 text-xl font-bold text-black"
              }
            >
              Amenities
            </Text>

            {amenities.length > 0 ? (
              <View className="flex-row flex-wrap">
                {amenities.map(
                  (
                    amenity,
                    index,
                  ) => {
                    const value =
                      typeof amenity ===
                      "string"
                        ? amenity
                        : String(
                            (
                              amenity as Record<
                                string,
                                unknown
                              >
                            )?.name ??
                              amenity,
                          );

                    return (
                      <View
                        key={`${value}-${index}`}
                        className={
                          isDark
                            ? "mb-2 mr-2 flex-row items-center rounded-lg border border-[#292929] bg-[#171717] px-3 py-2"
                            : "mb-2 mr-2 flex-row items-center rounded-lg border border-gray-200 bg-white px-3 py-2"
                        }
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={18}
                          color="#ef4444"
                        />

                        <Text
                          className={
                            isDark
                              ? "ml-2 text-sm text-zinc-300"
                              : "ml-2 text-sm text-gray-700"
                          }
                        >
                          {value}
                        </Text>
                      </View>
                    );
                  },
                )}
              </View>
            ) : (
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
                      ? "text-sm text-zinc-500"
                      : "text-sm text-gray-500"
                  }
                >
                  No amenities listed for
                  this property.
                </Text>
              </View>
            )}
          </View>

          {/* ================================================= */}
          {/* PROPERTY VIDEOS */}
          {/* ================================================= */}

          <View className="mt-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text
                className={
                  isDark
                    ? "text-xl font-bold text-white"
                    : "text-xl font-bold text-black"
                }
              >
                Property Videos
              </Text>

              {videos.length > 0 ? (
                <Text
                  className={
                    isDark
                      ? "text-sm text-zinc-500"
                      : "text-sm text-gray-500"
                  }
                >
                  {videos.length}{" "}
                  {videos.length === 1
                    ? "video"
                    : "videos"}
                </Text>
              ) : null}
            </View>

            {videosLoading ? (
              <View
                className={
                  isDark
                    ? "items-center rounded-xl border border-[#292929] bg-[#171717] py-10"
                    : "items-center rounded-xl border border-gray-200 bg-white py-10"
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#dc2626"
                />

                <Text
                  className={
                    isDark
                      ? "mt-3 text-sm text-zinc-500"
                      : "mt-3 text-sm text-gray-500"
                  }
                >
                  Loading property videos...
                </Text>
              </View>
            ) : videos.length >
              0 ? (
              <View>
                {videos.map(
                  (video) => (
                    <PropertyVideo
                      key={String(
                        video.id,
                      )}
                      video={video}
                    />
                  ),
                )}
              </View>
            ) : (
              <View
                className={
                  isDark
                    ? "items-center rounded-xl border border-[#292929] bg-[#171717] px-5 py-8"
                    : "items-center rounded-xl border border-gray-200 bg-white px-5 py-8"
                }
              >
                <Ionicons
                  name="videocam-outline"
                  size={42}
                  color={
                    isDark
                      ? "#555"
                      : "#9ca3af"
                  }
                />

                <Text
                  className={
                    isDark
                      ? "mt-3 text-sm text-zinc-500"
                      : "mt-3 text-sm text-gray-500"
                  }
                >
                  No property videos
                  available.
                </Text>
              </View>
            )}
          </View>

          {/* ================================================= */}
          {/* MAKE OFFER */}
          {/* ================================================= */}

          <Pressable
            onPress={handleMakeOffer}
            className="mt-8 w-full flex-row items-center justify-center rounded-xl bg-red-600 px-5 py-4 active:bg-red-700"
          >
            <Ionicons
              name="pricetag-outline"
              size={20}
              color="#fff"
            />

            <Text className="ml-2 text-base font-bold text-white">
              Make Offer
            </Text>
          </Pressable>

          {/* ================================================= */}
          {/* OPEN HOUSES */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text
              className={
                isDark
                  ? "mb-4 text-xl font-bold text-white"
                  : "mb-4 text-xl font-bold text-black"
              }
            >
              Open Houses
            </Text>

            <View
              className={
                isDark
                  ? "rounded-xl border border-[#292929] bg-[#171717] p-5"
                  : "rounded-xl border border-gray-200 bg-white p-5"
              }
            >
              {property.isOpenHouse ? (
                <View className="flex-row items-center">
                  <Ionicons
                    name="calendar-outline"
                    size={23}
                    color="#ef4444"
                  />

                  <Text
                    className={
                      isDark
                        ? "ml-3 text-sm text-zinc-300"
                        : "ml-3 text-sm text-gray-700"
                    }
                  >
                    Open house available
                    for this property.
                  </Text>
                </View>
              ) : (
                <Text
                  className={
                    isDark
                      ? "text-sm text-zinc-500"
                      : "text-sm text-gray-500"
                  }
                >
                  No open houses scheduled
                  at this time.
                </Text>
              )}
            </View>
          </View>

          {/* ================================================= */}
          {/* MAP */}
          {/* ================================================= */}

          <View className="mt-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text
                className={
                  isDark
                    ? "text-xl font-bold text-white"
                    : "text-xl font-bold text-black"
                }
              >
                Property Location
              </Text>

              {coordinates ? (
                <Ionicons
                  name="location"
                  size={22}
                  color="#ef4444"
                />
              ) : null}
            </View>

            {coordinates ? (
              <View
                className={
                  isDark
                    ? "overflow-hidden rounded-xl border border-[#292929]"
                    : "overflow-hidden rounded-xl border border-gray-200"
                }
              >
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={{
                    width: "100%",
                    height: 280,
                  }}
                  initialRegion={{
                    latitude:
                      coordinates.latitude,
                    longitude:
                      coordinates.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  showsCompass={false}
                  zoomEnabled={false}
                  scrollEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  toolbarEnabled={false}
                >
                  <Marker
                    coordinate={coordinates}
                    title={
                      property.title ??
                      "Property"
                    }
                    description={
                      locationText ||
                      "Property location"
                    }
                  />
                </MapView>

                <View
                  className={
                    isDark
                      ? "border-t border-[#292929] bg-[#171717] px-4 py-3"
                      : "border-t border-gray-200 bg-white px-4 py-3"
                  }
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#ef4444"
                    />

                    <Text
                      className={
                        isDark
                          ? "ml-2 flex-1 text-sm text-zinc-300"
                          : "ml-2 flex-1 text-sm text-gray-700"
                      }
                      numberOfLines={2}
                    >
                      {locationText ||
                        "Property location"}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View
                className={
                  isDark
                    ? "items-center rounded-xl border border-[#292929] bg-[#171717] px-5 py-10"
                    : "items-center rounded-xl border border-gray-200 bg-white px-5 py-10"
                }
              >
                <Ionicons
                  name="map-outline"
                  size={50}
                  color={
                    isDark
                      ? "#555"
                      : "#9ca3af"
                  }
                />

                <Text
                  className={
                    isDark
                      ? "mt-3 text-center text-sm font-medium text-zinc-400"
                      : "mt-3 text-center text-sm font-medium text-gray-600"
                  }
                >
                  Property coordinates
                  unavailable
                </Text>

                <Text
                  className={
                    isDark
                      ? "mt-2 text-center text-xs leading-5 text-zinc-600"
                      : "mt-2 text-center text-xs leading-5 text-gray-500"
                  }
                >
                  This property does not
                  currently have valid
                  latitude and longitude
                  coordinates.
                </Text>

                {locationText ? (
                  <View className="mt-4 flex-row items-center">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={
                        isDark
                          ? "#777"
                          : "#6b7280"
                      }
                    />

                    <Text
                      className={
                        isDark
                          ? "ml-2 text-xs text-zinc-500"
                          : "ml-2 text-xs text-gray-500"
                      }
                    >
                      {locationText}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          {/* ================================================= */}
          {/* LISTING AGENT */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text
              className={
                isDark
                  ? "mb-4 text-xl font-bold text-white"
                  : "mb-4 text-xl font-bold text-black"
              }
            >
              Listing Agent
            </Text>

            {listingAgentLoading ? (
              <View
                className={
                  isDark
                    ? "items-center rounded-xl border border-[#292929] bg-[#171717] py-10"
                    : "items-center rounded-xl border border-gray-200 bg-white py-10"
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#dc2626"
                />

                <Text
                  className={
                    isDark
                      ? "mt-3 text-sm text-zinc-500"
                      : "mt-3 text-sm text-gray-500"
                  }
                >
                  Finding listing agent...
                </Text>
              </View>
            ) : listingAgent ? (
              <View
                className={
                  isDark
                    ? "rounded-xl border border-[#292929] bg-[#171717] p-4"
                    : "rounded-xl border border-gray-200 bg-white p-4"
                }
              >
                {/* ================================================= */}
                {/* AGENT PROFILE AREA */}
                {/* ================================================= */}

                <Pressable
                  onPress={handleAgentPress}
                >
                  {/* ================================================= */}
                  {/* AGENT HEADER */}
                  {/* ================================================= */}

                  <View className="flex-row items-center">
                    {listingAgent.image ? (
                      <Image
                        source={{
                          uri: listingAgent.image,
                        }}
                        className="h-16 w-16 rounded-full border-2 border-red-600"
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className={
                          isDark
                            ? "h-16 w-16 items-center justify-center rounded-full border-2 border-red-600 bg-[#292929]"
                            : "h-16 w-16 items-center justify-center rounded-full border-2 border-red-600 bg-gray-200"
                        }
                      >
                        <Ionicons
                          name="person-outline"
                          size={30}
                          color={
                            isDark
                              ? "#777"
                              : "#6b7280"
                          }
                        />
                      </View>
                    )}

                    <View className="ml-4 flex-1">
                      <View className="flex-row items-center">
                        <Text
                          className={
                            isDark
                              ? "flex-1 text-lg font-bold text-white"
                              : "flex-1 text-lg font-bold text-black"
                          }
                          numberOfLines={2}
                        >
                          {listingAgent.name ||
                            "Listing Agent"}
                        </Text>

                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={
                            isDark
                              ? "#777"
                              : "#9ca3af"
                          }
                        />
                      </View>

                      {listingAgent.agentType ? (
                        <View className="mt-2 self-start rounded-full bg-red-600/15 px-3 py-1">
                          <Text className="text-xs font-semibold text-red-500">
                            {
                              listingAgent.agentType
                            }
                          </Text>
                        </View>
                      ) : null}

                      {listingAgent.licenseStatus ? (
                        <View className="mt-2 flex-row items-center">
                          <Ionicons
                            name="shield-checkmark-outline"
                            size={15}
                            color="#22c55e"
                          />

                          <Text
                            className={
                              isDark
                                ? "ml-1.5 text-xs text-zinc-500"
                                : "ml-1.5 text-xs text-gray-500"
                            }
                          >
                            License:{" "}
                            {
                              listingAgent.licenseStatus
                            }
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* ================================================= */}
                  {/* AGENT CONTACT INFORMATION */}
                  {/* ================================================= */}

                  <View
                    className={
                      isDark
                        ? "mt-5 border-t border-[#292929] pt-4"
                        : "mt-5 border-t border-gray-200 pt-4"
                    }
                  >
                    {listingAgent.email ? (
                      <View className="flex-row items-center">
                        <View
                          className={
                            isDark
                              ? "h-9 w-9 items-center justify-center rounded-lg bg-[#242424]"
                              : "h-9 w-9 items-center justify-center rounded-lg bg-gray-100"
                          }
                        >
                          <Ionicons
                            name="mail-outline"
                            size={18}
                            color="#ef4444"
                          />
                        </View>

                        <View className="ml-3 flex-1">
                          <Text
                            className={
                              isDark
                                ? "text-xs text-zinc-500"
                                : "text-xs text-gray-500"
                            }
                          >
                            Email
                          </Text>

                          <Text
                            className={
                              isDark
                                ? "mt-1 text-sm font-medium text-zinc-300"
                                : "mt-1 text-sm font-medium text-gray-700"
                            }
                            numberOfLines={2}
                          >
                            {
                              listingAgent.email
                            }
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {listingAgent.phone ? (
                      <View
                        className={`flex-row items-center ${
                          listingAgent.email
                            ? "mt-4"
                            : ""
                        }`}
                      >
                        <View
                          className={
                            isDark
                              ? "h-9 w-9 items-center justify-center rounded-lg bg-[#242424]"
                              : "h-9 w-9 items-center justify-center rounded-lg bg-gray-100"
                          }
                        >
                          <Ionicons
                            name="call-outline"
                            size={18}
                            color="#ef4444"
                          />
                        </View>

                        <View className="ml-3 flex-1">
                          <Text
                            className={
                              isDark
                                ? "text-xs text-zinc-500"
                                : "text-xs text-gray-500"
                            }
                          >
                            Phone
                          </Text>

                          <Text
                            className={
                              isDark
                                ? "mt-1 text-sm font-medium text-zinc-300"
                                : "mt-1 text-sm font-medium text-gray-700"
                            }
                            numberOfLines={2}
                          >
                            {
                              listingAgent.phone
                            }
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {listingAgent.specialization ? (
                      <View
                        className={`flex-row items-center ${
                          listingAgent.email ||
                          listingAgent.phone
                            ? "mt-4"
                            : ""
                        }`}
                      >
                        <View
                          className={
                            isDark
                              ? "h-9 w-9 items-center justify-center rounded-lg bg-[#242424]"
                              : "h-9 w-9 items-center justify-center rounded-lg bg-gray-100"
                          }
                        >
                          <Ionicons
                            name="briefcase-outline"
                            size={18}
                            color="#ef4444"
                          />
                        </View>

                        <View className="ml-3 flex-1">
                          <Text
                            className={
                              isDark
                                ? "text-xs text-zinc-500"
                                : "text-xs text-gray-500"
                            }
                          >
                            Specialization
                          </Text>

                          <Text
                            className={
                              isDark
                                ? "mt-1 text-sm font-medium text-zinc-300"
                                : "mt-1 text-sm font-medium text-gray-700"
                            }
                            numberOfLines={2}
                          >
                            {
                              listingAgent.specialization
                            }
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {listingAgent.address ? (
                      <View
                        className={`flex-row items-center ${
                          listingAgent.email ||
                          listingAgent.phone ||
                          listingAgent.specialization
                            ? "mt-4"
                            : ""
                        }`}
                      >
                        <View
                          className={
                            isDark
                              ? "h-9 w-9 items-center justify-center rounded-lg bg-[#242424]"
                              : "h-9 w-9 items-center justify-center rounded-lg bg-gray-100"
                          }
                        >
                          <Ionicons
                            name="location-outline"
                            size={18}
                            color="#ef4444"
                          />
                        </View>

                        <View className="ml-3 flex-1">
                          <Text
                            className={
                              isDark
                                ? "text-xs text-zinc-500"
                                : "text-xs text-gray-500"
                            }
                          >
                            Address
                          </Text>

                          <Text
                            className={
                              isDark
                                ? "mt-1 text-sm font-medium text-zinc-300"
                                : "mt-1 text-sm font-medium text-gray-700"
                            }
                            numberOfLines={3}
                          >
                            {
                              listingAgent.address
                            }
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </View>

                  {/* ================================================= */}
                  {/* AGENT ABOUT */}
                  {/* ================================================= */}

                  {listingAgent.about ? (
                    <View
                      className={
                        isDark
                          ? "mt-5 border-t border-[#292929] pt-4"
                          : "mt-5 border-t border-gray-200 pt-4"
                      }
                    >
                      <Text
                        className={
                          isDark
                            ? "text-xs font-semibold uppercase tracking-wide text-zinc-500"
                            : "text-xs font-semibold uppercase tracking-wide text-gray-500"
                        }
                      >
                        About the Agent
                      </Text>

                      <Text
                        className={
                          isDark
                            ? "mt-2 text-sm leading-6 text-zinc-300"
                            : "mt-2 text-sm leading-6 text-gray-700"
                        }
                      >
                        {
                          listingAgent.about
                        }
                      </Text>
                    </View>
                  ) : null}

                  {/* ================================================= */}
                  {/* VIEW AGENT */}
                  {/* ================================================= */}

                  <View
                    className={
                      isDark
                        ? "mt-5 flex-row items-center justify-center rounded-lg bg-[#242424] py-3"
                        : "mt-5 flex-row items-center justify-center rounded-lg bg-gray-100 py-3"
                    }
                  >
                    <Text className="text-sm font-bold text-red-500">
                      View Agent Profile
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color="#ef4444"
                      style={{
                        marginLeft: 7,
                      }}
                    />
                  </View>
                </Pressable>

                {/* ================================================= */}
                {/* MESSAGE AGENT */}
                {/* ================================================= */}

                <Pressable
                  onPress={
                    handleOpenMessage
                  }
                  disabled={
                    sendingMessage
                  }
                  className="mt-3 flex-row items-center justify-center rounded-lg bg-red-600 py-3.5 active:bg-red-700"
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={19}
                    color="#fff"
                  />

                  <Text className="ml-2 text-sm font-bold text-white">
                    Message Agent
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View
                className={
                  isDark
                    ? "rounded-xl border border-[#292929] bg-[#171717] p-5"
                    : "rounded-xl border border-gray-200 bg-white p-5"
                }
              >
                <View className="items-center">
                  <View
                    className={
                      isDark
                        ? "h-14 w-14 items-center justify-center rounded-full bg-[#292929]"
                        : "h-14 w-14 items-center justify-center rounded-full bg-gray-200"
                    }
                  >
                    <Ionicons
                      name="person-outline"
                      size={28}
                      color={
                        isDark
                          ? "#555"
                          : "#9ca3af"
                      }
                    />
                  </View>

                  <Text
                    className={
                      isDark
                        ? "mt-3 text-base font-semibold text-zinc-400"
                        : "mt-3 text-base font-semibold text-gray-600"
                    }
                  >
                    No listing agent assigned
                  </Text>

                  <Text
                    className={
                      isDark
                        ? "mt-1 text-center text-sm leading-5 text-zinc-600"
                        : "mt-1 text-center text-sm leading-5 text-gray-500"
                    }
                  >
                    No agent is currently
                    associated with this
                    property.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ====================================================== */}
      {/* MESSAGE MODAL */}
      {/* ====================================================== */}

      <Modal
        visible={messageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={
          handleCloseMessage
        }
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
        }
        keyboardVerticalOffset={
          Platform.OS === "ios"
            ? 10
            : 0
        }
      >
          <View className="flex-1 justify-end bg-black/60">
            <View
              className={
                isDark
                  ? "max-h-[85%] rounded-t-3xl border-t border-[#292929] bg-[#111111] px-5 pb-8 pt-5"
                  : "max-h-[85%] rounded-t-3xl border-t border-gray-200 bg-white px-5 pb-8 pt-5"
              }
            >
              {/* ================================================= */}
              {/* MODAL HEADER */}
              {/* ================================================= */}

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    className={
                      isDark
                        ? "text-xl font-bold text-white"
                        : "text-xl font-bold text-black"
                    }
                  >
                    Message Agent
                  </Text>

                  <Text
                    className={
                      isDark
                        ? "mt-1 text-sm text-zinc-500"
                        : "mt-1 text-sm text-gray-500"
                    }
                    numberOfLines={1}
                  >
                    {listingAgent?.name ||
                      "Listing Agent"}
                  </Text>
                </View>

                <Pressable
                  onPress={
                    handleCloseMessage
                  }
                  disabled={
                    sendingMessage
                  }
                  className={
                    isDark
                      ? "h-10 w-10 items-center justify-center rounded-full bg-[#242424]"
                      : "h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                  }
                >
                  <Ionicons
                    name="close"
                    size={23}
                    color={
                      isDark
                        ? "#fff"
                        : "#000"
                    }
                  />
                </Pressable>
              </View>

              {/* ================================================= */}
              {/* AGENT SUMMARY */}
              {/* ================================================= */}

              <View
                className={
                  isDark
                    ? "mt-5 flex-row items-center rounded-xl border border-[#292929] bg-[#171717] p-3"
                    : "mt-5 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 p-3"
                }
              >
                {listingAgent?.image ? (
                  <Image
                    source={{
                      uri: listingAgent.image,
                    }}
                    className="h-12 w-12 rounded-full border border-red-600"
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className={
                      isDark
                        ? "h-12 w-12 items-center justify-center rounded-full bg-[#292929]"
                        : "h-12 w-12 items-center justify-center rounded-full bg-gray-200"
                    }
                  >
                    <Ionicons
                      name="person-outline"
                      size={23}
                      color={
                        isDark
                          ? "#777"
                          : "#6b7280"
                      }
                    />
                  </View>
                )}

                <View className="ml-3 flex-1">
                  <Text
                    className={
                      isDark
                        ? "text-sm font-bold text-white"
                        : "text-sm font-bold text-black"
                    }
                    numberOfLines={1}
                  >
                    {listingAgent?.name ||
                      "Listing Agent"}
                  </Text>

                  <Text
                    className={
                      isDark
                        ? "mt-1 text-xs text-zinc-500"
                        : "mt-1 text-xs text-gray-500"
                    }
                  >
                    About this property
                  </Text>
                </View>
              </View>

              {/* ================================================= */}
              {/* MESSAGE INPUT */}
              {/* ================================================= */}

              <View className="mt-5">
                <Text
                  className={
                    isDark
                      ? "mb-2 text-sm font-semibold text-zinc-300"
                      : "mb-2 text-sm font-semibold text-gray-700"
                  }
                >
                  Your message
                </Text>

                <TextInput
                  value={messageText}
                  onChangeText={
                    setMessageText
                  }
                  placeholder="Write a message to the agent..."
                  placeholderTextColor={
                    isDark
                      ? "#666"
                      : "#9ca3af"
                  }
                  multiline
                  textAlignVertical="top"
                  editable={
                    !sendingMessage
                  }
                  maxLength={2000}
                  className={
                    isDark
                      ? "min-h-[140px] rounded-xl border border-[#292929] bg-[#171717] px-4 py-3 text-base text-white"
                      : "min-h-[140px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-black"
                  }
                />

                <View className="mt-2 flex-row justify-end">
                  <Text
                    className={
                      isDark
                        ? "text-xs text-zinc-600"
                        : "text-xs text-gray-500"
                    }
                  >
                    {messageText.length}/2000
                  </Text>
                </View>
              </View>

              {/* ================================================= */}
              {/* SEND BUTTON */}
              {/* ================================================= */}

              <Pressable
                onPress={
                  handleSendMessage
                }
                disabled={
                  sendingMessage
                }
                className={`mt-4 flex-row items-center justify-center rounded-xl px-5 py-4 ${
                  sendingMessage
                    ? "bg-red-900"
                    : "bg-red-600 active:bg-red-700"
                }`}
              >
                {sendingMessage ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                    />

                    <Text className="ml-2 text-base font-bold text-white">
                      Sending...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="send-outline"
                      size={19}
                      color="#fff"
                    />

                    <Text className="ml-2 text-base font-bold text-white">
                      Send Message
                    </Text>
                  </>
                )}
              </Pressable>

              <Text
                className={
                  isDark
                    ? "mt-3 text-center text-xs leading-5 text-zinc-600"
                    : "mt-3 text-center text-xs leading-5 text-gray-500"
                }
              >
                Your message will be sent directly
                to the listing agent.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
// HIGHLIGHT COMPONENT
// ============================================================

interface HighlightProps {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];

  value: string;

  label: string;

  wide?: boolean;

  isDark: boolean;
}

function Highlight({
  icon,
  value,
  label,
  wide = false,
  isDark,
}: HighlightProps) {
  return (
    <View
      className={`mb-2 mr-2 rounded-xl border px-3 py-3 ${
        isDark
          ? "border-[#292929] bg-[#171717]"
          : "border-gray-200 bg-white"
      } ${
        wide
          ? "flex-1"
          : "min-w-[30%]"
      }`}
    >
      <Ionicons
        name={icon}
        size={20}
        color="#ef4444"
      />

      <Text
        className={
          isDark
            ? "mt-2 text-sm font-bold text-white"
            : "mt-2 text-sm font-bold text-black"
        }
        numberOfLines={2}
      >
        {value}
      </Text>

      {label ? (
        <Text
          className={
            isDark
              ? "mt-1 text-xs text-zinc-500"
              : "mt-1 text-xs text-gray-500"
          }
          numberOfLines={2}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

// ============================================================
// DETAIL ROW
// ============================================================

interface DetailRowProps {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];

  label: string;

  value: string;

  last?: boolean;

  isDark: boolean;
}

function DetailRow({
  icon,
  label,
  value,
  last = false,
  isDark,
}: DetailRowProps) {
  return (
    <View
      className={`flex-row items-center px-4 py-4 ${
        last
          ? ""
          : isDark
            ? "border-b border-[#292929]"
            : "border-b border-gray-200"
      }`}
    >
      <View
        className={
          isDark
            ? "h-9 w-9 items-center justify-center rounded-lg bg-[#242424]"
            : "h-9 w-9 items-center justify-center rounded-lg bg-gray-100"
        }
      >
        <Ionicons
          name={icon}
          size={18}
          color="#ef4444"
        />
      </View>

      <Text
        className={
          isDark
            ? "ml-3 flex-1 text-sm text-zinc-500"
            : "ml-3 flex-1 text-sm text-gray-500"
        }
      >
        {label}
      </Text>

      <Text
        className={
          isDark
            ? "max-w-[55%] text-right text-sm font-semibold text-zinc-200"
            : "max-w-[55%] text-right text-sm font-semibold text-gray-800"
        }
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}