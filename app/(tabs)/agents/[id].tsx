
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthRequiredModal from "@/app/components/auth/AuthRequiredModal";
import LoginModal from "@/app/components/auth/LoginModal";
import RegisterModal from "@/app/components/auth/RegisterModal";
import SideMenu from "@/app/components/sidebar/SideMenu";
import PropertyCard from "@/app/components/properties/PropertyCard";
import { useTheme } from "@/app/components/theme/ThemeContext";
import { useAuth } from "@/app/components/auth/AuthContext";

import {
  fetchAgentDetails,
  type Property,
} from "@/app/services/propertyApi";

import type { Agent } from "@/app/services/agentApi";

export default function AgentDetailsScreen() {
  const router = useRouter();

  const { theme } = useTheme();

  const {
    user,
    isLoggedIn,
  } = useAuth();

  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const agentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [agent, setAgent] =
    useState<Agent | null>(null);

  const [properties, setProperties] =
    useState<Property[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [menuVisible, setMenuVisible] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ============================================================
  // AUTHENTICATION / PROPERTY ACCESS
  // ============================================================

  const [pendingProperty, setPendingProperty] =
    useState<Property | null>(null);

  const [authModalVisible, setAuthModalVisible] =
    useState(false);

  const [loginModalVisible, setLoginModalVisible] =
    useState(false);

  const [registerModalVisible, setRegisterModalVisible] =
    useState(false);

  // ============================================================
  // MESSAGE FORM
  // ============================================================

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [sendingMessage, setSendingMessage] =
    useState(false);

  // ============================================================
  // LOAD AGENT + ASSOCIATED PROPERTIES
  //
  // GET /v2/agents/{agentId}
  //
  // This endpoint returns both:
  //
  // 1. The agent
  // 2. The properties associated with that agent
  // ============================================================

  const loadAgentDetails =
    useCallback(
      async (
        isRefresh = false,
      ) => {
        if (!agentId) {
          setAgent(null);
          setProperties([]);
          setError("Agent ID is missing.");
          setLoading(false);
          setRefreshing(false);
          return;
        }

        try {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError(null);

          console.log(
            "================================================",
          );

          console.log(
            "Loading agent details",
          );

          console.log(
            "Agent ID:",
            agentId,
          );

          console.log(
            "================================================",
          );

          const result =
            await fetchAgentDetails(
              agentId,
            );

          console.log(
            "Agent details result:",
            result,
          );

          console.log(
            "Agent:",
            result.agent,
          );

          console.log(
            "Associated properties:",
            result.properties,
          );

          console.log(
            "Associated property count:",
            result.properties.length,
          );

          setAgent(result.agent);

          setProperties(
            Array.isArray(
              result.properties,
            )
              ? result.properties
              : [],
          );
        } catch (requestError) {
          console.error(
            "================================================",
          );

          console.error(
            "Failed to load agent details:",
            requestError,
          );

          console.error(
            "================================================",
          );

          setAgent(null);
          setProperties([]);

          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load agent details.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [agentId],
    );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    void loadAgentDetails(false);
  }, [loadAgentDetails]);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    void loadAgentDetails(true);
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    router.back();
  };

  // ============================================================
  // PROPERTY PRESS
  //
  // IMPORTANT:
  //
  // Properties listed by an agent must also follow the same
  // authentication rule used elsewhere in the app.
  //
  // Logged in:
  //     Open property details.
  //
  // Logged out:
  //     Remember the selected property and show the
  //     authentication-required modal.
  // ============================================================

  const handlePropertyPress = (
    property: Property,
  ) => {
    if (!property?.id) {
      return;
    }

    // ----------------------------------------------------------
    // USER IS ALREADY LOGGED IN
    // ----------------------------------------------------------

    if (isLoggedIn) {
      router.push({
        pathname:
          "/(tabs)/properties/[id]",
        params: {
          id: String(property.id),
        },
      });

      return;
    }

    // ----------------------------------------------------------
    // USER IS NOT LOGGED IN
    //
    // Remember the property so that after successful login
    // or registration/login the user can continue to it.
    // ----------------------------------------------------------

    setPendingProperty(property);
    setAuthModalVisible(true);
  };

  // ============================================================
  // AUTH REQUIRED -> LOGIN
  // ============================================================

  const handleAuthLogin = () => {
    setAuthModalVisible(false);
    setLoginModalVisible(true);
  };

  // ============================================================
  // AUTH REQUIRED -> REGISTER
  // ============================================================

  const handleAuthRegister = () => {
    setAuthModalVisible(false);
    setRegisterModalVisible(true);
  };

  // ============================================================
  // LOGIN SUCCESS
  //
  // After login, open the property that the user originally
  // attempted to view.
  // ============================================================

  const handleLoginSuccess = (
    _email: string,
    _response: Record<string, unknown>,
  ) => {
    setLoginModalVisible(false);

    const propertyToOpen =
      pendingProperty;

    setPendingProperty(null);

    if (propertyToOpen?.id) {
      router.push({
        pathname:
          "/(tabs)/properties/[id]",
        params: {
          id: String(propertyToOpen.id),
        },
      });
    }
  };

  // ============================================================
  // REGISTRATION COMPLETE
  //
  // Registration itself does not automatically open the
  // property. Keep pendingProperty and move the user to Login.
  // ============================================================

  const handleRegistrationComplete = () => {
    setRegisterModalVisible(false);
    setLoginModalVisible(true);
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSendMessage = async () => {
    const trimmedFirstName =
      firstName.trim();

    const trimmedLastName =
      lastName.trim();

    const trimmedEmail =
      email.trim();

    const trimmedPhone =
      phone.trim();

    const trimmedMessage =
      message.trim();

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!trimmedFirstName) {
      Alert.alert(
        "First Name Required",
        "Please enter your first name.",
      );

      return;
    }

    if (!trimmedLastName) {
      Alert.alert(
        "Last Name Required",
        "Please enter your last name.",
      );

      return;
    }

    if (!trimmedEmail) {
      Alert.alert(
        "Email Required",
        "Please enter your email address.",
      );

      return;
    }

    if (!trimmedPhone) {
      Alert.alert(
        "Phone Number Required",
        "Please enter your phone number. Preferably use a WhatsApp number.",
      );

      return;
    }

    if (!trimmedMessage) {
      Alert.alert(
        "Message Required",
        "Please enter your message.",
      );

      return;
    }

    // ----------------------------------------------------------
    // USER / SENDER CHECK
    //
    // The sender_id must be the currently logged-in user's ID.
    // ----------------------------------------------------------

    const senderId =
      user?.id;

    if (
      senderId === undefined ||
      senderId === null ||
      String(senderId).trim() === ""
    ) {
      Alert.alert(
        "Sign In Required",
        "Please sign in before sending a message to the agent.",
      );

      return;
    }

    // ----------------------------------------------------------
    // AGENT CHECK
    // ----------------------------------------------------------

    if (!agent) {
      Alert.alert(
        "Unable to Send",
        "Agent information is unavailable.",
      );

      return;
    }

    // ----------------------------------------------------------
    // IMPORTANT:
    //
    // AgentDetails returns:
    //
    // data.id      = agent record ID
    // data.user.id = user ID
    //
    // Messaging expects the receiver USER ID.
    //
    // agent.userId therefore has priority.
    // ----------------------------------------------------------

    const receiverId =
      agent.userId ?? agent.id;

    if (
      receiverId === undefined ||
      receiverId === null ||
      String(receiverId).trim() === ""
    ) {
      Alert.alert(
        "Unable to Send",
        "The agent's user ID is unavailable.",
      );

      return;
    }

    // ----------------------------------------------------------
    // API URL
    // ----------------------------------------------------------

    const apiUrl =
      process.env.EXPO_PUBLIC_API_URL;

    if (!apiUrl) {
      Alert.alert(
        "Configuration Error",
        "EXPO_PUBLIC_API_URL is not configured.",
      );

      return;
    }

    const endpoint =
      `${apiUrl.replace(/\/+$/, "")}/v2/messages/send`;

    // ----------------------------------------------------------
    // MESSAGE CONTENT
    //
    // The endpoint accepts:
    //
    // sender_id
    // receiver_id
    // message
    //
    // Since first name, last name, email and phone are not
    // separate fields in the supplied API, they are included
    // inside the message body.
    // ----------------------------------------------------------

    const formattedMessage =
      `Name: ${trimmedFirstName} ${trimmedLastName}\n` +
      `Email: ${trimmedEmail}\n` +
      `Phone: ${trimmedPhone}\n\n` +
      `Message:\n${trimmedMessage}`;

    try {
      setSendingMessage(true);

      console.log(
        "================================================",
      );

      console.log(
        "Sending message to agent",
      );

      console.log(
        "Endpoint:",
        endpoint,
      );

      console.log(
        "Sender ID:",
        senderId,
      );

      console.log(
        "Receiver ID:",
        receiverId,
      );

      console.log(
        "================================================",
      );

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              sender_id:
                senderId,

              receiver_id:
                receiverId,

              message:
                formattedMessage,
            }),
          },
        );

      const responseText =
        await response
          .text()
          .catch(() => "");

      let responseJson: unknown =
        null;

      try {
        responseJson =
          responseText
            ? JSON.parse(
                responseText,
              )
            : null;
      } catch {
        responseJson =
          responseText;
      }

      console.log(
        "Message API response:",
        responseJson,
      );

      // --------------------------------------------------------
      // HANDLE API ERROR
      // --------------------------------------------------------

      if (!response.ok) {
        let errorMessage =
          `Message request failed (${response.status}).`;

        if (
          typeof responseJson ===
            "object" &&
          responseJson !== null
        ) {
          const possibleResponse =
            responseJson as {
              message?: unknown;
              msg?: unknown;
              error?: unknown;
            };

          if (
            possibleResponse.message
          ) {
            errorMessage =
              String(
                possibleResponse.message,
              );
          } else if (
            possibleResponse.msg
          ) {
            errorMessage =
              String(
                possibleResponse.msg,
              );
          } else if (
            possibleResponse.error
          ) {
            errorMessage =
              String(
                possibleResponse.error,
              );
          }
        }

        throw new Error(
          errorMessage,
        );
      }

      // --------------------------------------------------------
      // CLEAR FORM AFTER SUCCESS
      // --------------------------------------------------------

      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setMessage("");

      Alert.alert(
        "Message Sent",
        `Your message has been sent to ${
          agent.name ||
          "the agent"
        }.`,
      );
    } catch (sendError) {
      console.error(
        "================================================",
      );

      console.error(
        "Failed to send message:",
        sendError,
      );

      console.error(
        "================================================",
      );

      Alert.alert(
        "Message Not Sent",
        sendError instanceof Error
          ? sendError.message
          : "Unable to send your message. Please try again.",
      );
    } finally {
      setSendingMessage(false);
    }
  };

  // ============================================================
  // PROPERTY CARD
  // ============================================================

  const renderProperty = ({
    item,
  }: {
    item: Property;
  }) => {
    return (
      <View className="px-4">
        <PropertyCard
          property={item}
          isFullWidth
          onPress={handlePropertyPress}
        />
      </View>
    );
  };

  // ============================================================
  // EMPTY PROPERTY LIST
  // ============================================================

  const renderEmptyProperties =
    () => {
      if (loading) {
        return null;
      }

      return (
        <View
          className="mx-4 items-center justify-center rounded-2xl px-6 py-12"
          style={{
            backgroundColor:
              theme.card,

            borderWidth: 1,

            borderColor:
              theme.border,
          }}
        >
          <Ionicons
            name="home-outline"
            size={52}
            color={theme.textMuted}
          />

          <Text
            className="mt-4 text-center text-lg font-bold"
            style={{
              color: theme.text,
            }}
          >
            No properties assigned
          </Text>

          <Text
            className="mt-2 text-center text-sm leading-5"
            style={{
              color:
                theme.textMuted,
            }}
          >
            There are currently no
            properties assigned to
            this agent.
          </Text>

          {error ? (
            <Text
              className="mt-4 text-center text-xs leading-5"
              style={{
                color:
                  theme.textMuted,
              }}
            >
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={() =>
              void loadAgentDetails(
                false,
              )
            }
            className="mt-5 rounded-xl bg-red-600 px-5 py-3"
          >
            <Text className="font-bold text-white">
              Try Again
            </Text>
          </Pressable>
        </View>
      );
    };

  // ============================================================
  // LEAVE A MESSAGE
  //
  // IMPORTANT:
  //
  // This is used as ListFooterComponent so it appears AFTER
  // all associated properties.
  // ============================================================

  const renderMessageForm =
    () => {
      if (!agent) {
        return null;
      }

      return (
        <View className="px-4">
          <View className="mb-8 mt-8">
            <Text
              className="text-2xl font-bold"
              style={{
                color: theme.text,
              }}
            >
              Leave a Message
            </Text>

            <Text
              className="mt-1 text-sm leading-5"
              style={{
                color:
                  theme.textMuted,
              }}
            >
              Send a message directly to{" "}
              {agent.name ||
                "this agent"}.
            </Text>

            <View
              className="mt-4 rounded-2xl p-4"
              style={{
                backgroundColor:
                  theme.card,

                borderWidth: 1,

                borderColor:
                  theme.border,
              }}
            >
              {/* ================================================= */}
              {/* FIRST NAME */}
              {/* ================================================= */}

              <MessageInput
                label="First Name"
                value={firstName}
                onChangeText={
                  setFirstName
                }
                placeholder="Enter your first name"
                icon="person-outline"
                theme={theme}
                editable={
                  !sendingMessage
                }
              />

              {/* ================================================= */}
              {/* LAST NAME */}
              {/* ================================================= */}

              <MessageInput
                label="Last Name"
                value={lastName}
                onChangeText={
                  setLastName
                }
                placeholder="Enter your last name"
                icon="person-outline"
                theme={theme}
                editable={
                  !sendingMessage
                }
              />

              {/* ================================================= */}
              {/* EMAIL */}
              {/* ================================================= */}

              <MessageInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                theme={theme}
                editable={
                  !sendingMessage
                }
              />

              {/* ================================================= */}
              {/* PHONE */}
              {/* ================================================= */}

              <MessageInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                placeholder="Preferably a WhatsApp number"
                icon="call-outline"
                keyboardType="phone-pad"
                theme={theme}
                editable={
                  !sendingMessage
                }
                helperText="Preferably a WhatsApp number"
              />

              {/* ================================================= */}
              {/* MESSAGE */}
              {/* ================================================= */}

              <View className="mt-1">
                <Text
                  className="mb-2 text-sm font-semibold"
                  style={{
                    color:
                      theme.text,
                  }}
                >
                  Message
                </Text>

                <View
                  className="rounded-xl"
                  style={{
                    backgroundColor:
                      theme.surface,

                    borderWidth: 1,

                    borderColor:
                      theme.border,
                  }}
                >
                  <TextInput
                    value={message}
                    onChangeText={
                      setMessage
                    }
                    placeholder="Write your message..."
                    placeholderTextColor={
                      theme.textMuted
                    }
                    multiline
                    textAlignVertical="top"
                    editable={
                      !sendingMessage
                    }
                    className="px-4 py-3 text-sm"
                    style={{
                      color:
                        theme.text,

                      minHeight: 140,

                      maxHeight: 220,
                    }}
                  />
                </View>
              </View>

              {/* ================================================= */}
              {/* SEND MESSAGE BUTTON */}
              {/* ================================================= */}

              <Pressable
                onPress={
                  handleSendMessage
                }
                disabled={
                  sendingMessage
                }
                className="mt-5 min-h-[52px] flex-row items-center justify-center rounded-xl px-5"
                style={{
                  backgroundColor:
                    sendingMessage
                      ? theme.textMuted
                      : "#dc2626",
                }}
              >
                {sendingMessage ? (
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                  />
                ) : (
                  <Ionicons
                    name="send-outline"
                    size={20}
                    color="#ffffff"
                  />
                )}

                <Text className="ml-2 text-base font-bold text-white">
                  {sendingMessage
                    ? "Sending..."
                    : "Send Message"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      );
    };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{
          backgroundColor:
            theme.background,
        }}
      >
        <View
          className="flex-row items-center px-4 py-3"
          style={{
            borderBottomWidth: 1,

            borderBottomColor:
              theme.border,
          }}
        >
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                theme.card,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={theme.icon}
            />
          </Pressable>

          <Text
            className="ml-3 text-xl font-bold"
            style={{
              color: theme.text,
            }}
          >
            Agent Details
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={theme.accent}
          />

          <Text
            className="mt-3 text-sm"
            style={{
              color:
                theme.textMuted,
            }}
          >
            Loading agent details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // AGENT NOT FOUND
  // ============================================================

  if (!agent) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{
          backgroundColor:
            theme.background,
        }}
      >
        <View
          className="flex-row items-center px-4 py-3"
          style={{
            borderBottomWidth: 1,

            borderBottomColor:
              theme.border,
          }}
        >
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                theme.card,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={theme.icon}
            />
          </Pressable>

          <Text
            className="ml-3 text-xl font-bold"
            style={{
              color: theme.text,
            }}
          >
            Agent Details
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="person-outline"
            size={60}
            color={theme.textMuted}
          />

          <Text
            className="mt-5 text-center text-xl font-bold"
            style={{
              color: theme.text,
            }}
          >
            Agent not found
          </Text>

          <Text
            className="mt-2 text-center text-sm"
            style={{
              color:
                theme.textMuted,
            }}
          >
            {error ||
              "The requested agent could not be found."}
          </Text>

          <Pressable
            onPress={() =>
              void loadAgentDetails(
                false,
              )
            }
            className="mt-5 rounded-xl bg-red-600 px-6 py-3"
          >
            <Text className="font-bold text-white">
              Try Again
            </Text>
          </Pressable>

          <Pressable
            onPress={handleBack}
            className="mt-3 rounded-xl px-6 py-3"
            style={{
              backgroundColor:
                theme.card,

              borderWidth: 1,

              borderColor:
                theme.border,
            }}
          >
            <Text
              className="font-bold"
              style={{
                color: theme.text,
              }}
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // MAIN SCREEN
  // ============================================================

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor:
          theme.background,
      }}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{
          backgroundColor:
            theme.background,

          borderBottomWidth: 1,

          borderBottomColor:
            theme.border,
        }}
      >
        <View className="flex-1 flex-row items-center">
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                theme.card,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={theme.icon}
            />
          </Pressable>

          <View className="ml-3 flex-1">
            <Text
              className="text-lg font-bold"
              style={{
                color: theme.text,
              }}
              numberOfLines={1}
            >
              Agent Details
            </Text>

            <Text
              className="text-xs"
              style={{
                color:
                  theme.textMuted,
              }}
            >
              Agent #{agent.id}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            setMenuVisible(true)
          }
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{
            backgroundColor:
              theme.card,
          }}
        >
          <Ionicons
            name="menu-outline"
            size={27}
            color={theme.icon}
          />
        </Pressable>
      </View>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <FlatList
        data={properties}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderProperty}
        ListHeaderComponent={
          <View className="px-4 pt-5">
            {/* ================================================= */}
            {/* AGENT PROFILE */}
            {/* ================================================= */}

            <View
              className="overflow-hidden rounded-2xl"
              style={{
                backgroundColor:
                  theme.card,

                borderWidth: 1,

                borderColor:
                  theme.border,
              }}
            >
              <View className="items-center px-5 pb-6 pt-7">
                {agent.image ? (
                  <Image
                    source={{
                      uri: agent.image,
                    }}
                    className="h-28 w-28 rounded-full border-2 border-red-600"
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className="h-28 w-28 items-center justify-center rounded-full border-2 border-red-600"
                    style={{
                      backgroundColor:
                        theme.surface,
                    }}
                  >
                    <Ionicons
                      name="person-outline"
                      size={52}
                      color={
                        theme.textMuted
                      }
                    />
                  </View>
                )}

                <Text
                  className="mt-4 text-2xl font-bold"
                  style={{
                    color: theme.text,
                  }}
                >
                  {agent.name ||
                    "Unnamed Agent"}
                </Text>

                {agent.agentType ? (
                  <View className="mt-2 rounded-full bg-red-600/15 px-4 py-1.5">
                    <Text className="text-sm font-semibold text-red-500">
                      {agent.agentType}
                    </Text>
                  </View>
                ) : null}

                {agent.licenseStatus ? (
                  <View className="mt-2 flex-row items-center">
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={17}
                      color="#22c55e"
                    />

                    <Text
                      className="ml-1.5 text-xs"
                      style={{
                        color:
                          theme.textMuted,
                      }}
                    >
                      {agent.licenseStatus}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* ================================================= */}
              {/* CONTACT INFORMATION */}
              {/* ================================================= */}

              <View
                className="px-4"
                style={{
                  borderTopWidth: 1,

                  borderTopColor:
                    theme.border,
                }}
              >
                {agent.email ? (
                  <InfoRow
                    icon="mail-outline"
                    label="Email"
                    value={agent.email}
                  />
                ) : null}

                {agent.phone ? (
                  <InfoRow
                    icon="call-outline"
                    label="Phone"
                    value={agent.phone}
                  />
                ) : null}

                {agent.address ? (
                  <InfoRow
                    icon="location-outline"
                    label="Address"
                    value={agent.address}
                  />
                ) : null}

                {agent.specialization ? (
                  <InfoRow
                    icon="briefcase-outline"
                    label="Specialization"
                    value={
                      agent.specialization
                    }
                  />
                ) : null}

                <InfoRow
                  icon="home-outline"
                  label="Associated Properties"
                  value={String(
                    properties.length,
                  )}
                  last
                />
              </View>
            </View>

            {/* ================================================= */}
            {/* ABOUT */}
            {/* ================================================= */}

            {agent.about ? (
              <View className="mt-6">
                <Text
                  className="mb-3 text-xl font-bold"
                  style={{
                    color: theme.text,
                  }}
                >
                  About
                </Text>

                <View
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor:
                      theme.card,

                    borderWidth: 1,

                    borderColor:
                      theme.border,
                  }}
                >
                  <Text
                    className="text-sm leading-6"
                    style={{
                      color:
                        theme.textSecondary,
                    }}
                  >
                    {agent.about}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* ================================================= */}
            {/* COVERAGE AREAS */}
            {/* ================================================= */}

            {agent.coverageAreas.length >
            0 ? (
              <View className="mt-6">
                <Text
                  className="mb-3 text-xl font-bold"
                  style={{
                    color: theme.text,
                  }}
                >
                  Coverage Areas
                </Text>

                <View className="flex-row flex-wrap">
                  {agent.coverageAreas.map(
                    (
                      area,
                      index,
                    ) => {
                      const areaName =
                        area.location_name ||
                        area.district_name ||
                        "Coverage Area";

                      const district =
                        area.location_name &&
                        area.district_name &&
                        area.location_name !==
                          area.district_name
                          ? area.district_name
                          : "";

                      return (
                        <View
                          key={`${areaName}-${district}-${index}`}
                          className="mb-2 mr-2 rounded-xl px-3 py-2.5"
                          style={{
                            backgroundColor:
                              theme.card,

                            borderWidth: 1,

                            borderColor:
                              theme.border,
                          }}
                        >
                          <View className="flex-row items-center">
                            <Ionicons
                              name="location-outline"
                              size={17}
                              color={
                                theme.accent
                              }
                            />

                            <Text
                              className="ml-2 text-sm font-medium"
                              style={{
                                color:
                                  theme.textSecondary,
                              }}
                            >
                              {areaName}
                            </Text>
                          </View>

                          {district ? (
                            <Text
                              className="ml-6 mt-1 text-xs"
                              style={{
                                color:
                                  theme.textMuted,
                              }}
                            >
                              {district}
                            </Text>
                          ) : null}
                        </View>
                      );
                    },
                  )}
                </View>
              </View>
            ) : null}

            {/* ================================================= */}
            {/* SOCIAL PROFILES */}
            {/* ================================================= */}

            {agent.linkedin ||
            agent.facebook ? (
              <View className="mt-6">
                <Text
                  className="mb-3 text-xl font-bold"
                  style={{
                    color: theme.text,
                  }}
                >
                  Social Profiles
                </Text>

                <View className="flex-row">
                  {agent.linkedin ? (
                    <View
                      className="mr-2 flex-row items-center rounded-xl px-4 py-3"
                      style={{
                        backgroundColor:
                          theme.card,

                        borderWidth: 1,

                        borderColor:
                          theme.border,
                      }}
                    >
                      <Ionicons
                        name="logo-linkedin"
                        size={20}
                        color="#60a5fa"
                      />

                      <Text
                        className="ml-2 text-sm"
                        style={{
                          color:
                            theme.textSecondary,
                        }}
                      >
                        LinkedIn
                      </Text>
                    </View>
                  ) : null}

                  {agent.facebook ? (
                    <View
                      className="flex-row items-center rounded-xl px-4 py-3"
                      style={{
                        backgroundColor:
                          theme.card,

                        borderWidth: 1,

                        borderColor:
                          theme.border,
                      }}
                    >
                      <Ionicons
                        name="logo-facebook"
                        size={20}
                        color="#60a5fa"
                      />

                      <Text
                        className="ml-2 text-sm"
                        style={{
                          color:
                            theme.textSecondary,
                        }}
                      >
                        Facebook
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* ================================================= */}
            {/* ASSOCIATED PROPERTIES HEADER */}
            {/* ================================================= */}

            <View className="mb-4 mt-8 flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className="text-xl font-bold"
                  style={{
                    color: theme.text,
                  }}
                >
                  Associated Properties
                </Text>

                <Text
                  className="mt-1 text-sm"
                  style={{
                    color:
                      theme.textMuted,
                  }}
                >
                  All properties associated
                  with{" "}
                  {agent.name}
                </Text>
              </View>

              <View className="ml-3 rounded-full bg-red-600 px-3 py-1.5">
                <Text className="text-xs font-bold text-white">
                  {properties.length}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          renderEmptyProperties
        }
        ListFooterComponent={
          renderMessageForm
        }
        contentContainerStyle={{
          paddingBottom: 35,
        }}
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent}
          />
        }
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
      />

      {/* ====================================================== */}
      {/* SIDE MENU */}
      {/* ====================================================== */}

      <SideMenu
        visible={menuVisible}
        onClose={() =>
          setMenuVisible(false)
        }
      />

      {/* ====================================================== */}
      {/* AUTH REQUIRED MODAL */}
      {/* ====================================================== */}

      <AuthRequiredModal
        visible={authModalVisible}
        onClose={() => {
          setAuthModalVisible(false);
          setPendingProperty(null);
        }}
        onLogin={handleAuthLogin}
        onRegister={handleAuthRegister}
      />

      {/* ====================================================== */}
      {/* LOGIN MODAL */}
      {/* ====================================================== */}

      <LoginModal
        visible={loginModalVisible}
        onClose={() => {
          setLoginModalVisible(false);
        }}
        onLogin={handleLoginSuccess}
        onRegister={() => {
          setLoginModalVisible(false);
          setRegisterModalVisible(true);
        }}
      />

      {/* ====================================================== */}
      {/* REGISTER MODAL */}
      {/* ====================================================== */}

      <RegisterModal
        visible={registerModalVisible}
        onClose={() => {
          setRegisterModalVisible(false);
        }}
        onRegister={
          handleRegistrationComplete
        }
        onLogin={() => {
          setRegisterModalVisible(false);
          setLoginModalVisible(true);
        }}
      />
    </SafeAreaView>
  );
}

// ============================================================
// MESSAGE INPUT
// ============================================================

interface MessageInputProps {
  label: string;

  value: string;

  onChangeText: (
    value: string,
  ) => void;

  placeholder: string;

  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];

  theme: ReturnType<
    typeof useTheme
  >["theme"];

  editable?: boolean;

  keyboardType?: React.ComponentProps<
    typeof TextInput
  >["keyboardType"];

  autoCapitalize?: React.ComponentProps<
    typeof TextInput
  >["autoCapitalize"];

  helperText?: string;
}

function MessageInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  theme,
  editable = true,
  keyboardType,
  autoCapitalize,
  helperText,
}: MessageInputProps) {
  return (
    <View className="mb-4">
      <Text
        className="mb-2 text-sm font-semibold"
        style={{
          color: theme.text,
        }}
      >
        {label}
      </Text>

      <View
        className="flex-row items-center rounded-xl"
        style={{
          backgroundColor:
            theme.surface,

          borderWidth: 1,

          borderColor:
            theme.border,
        }}
      >
        <View className="pl-3">
          <Ionicons
            name={icon}
            size={19}
            color={theme.textMuted}
          />
        </View>

        <TextInput
          value={value}
          onChangeText={
            onChangeText
          }
          placeholder={
            placeholder
          }
          placeholderTextColor={
            theme.textMuted
          }
          editable={editable}
          keyboardType={
            keyboardType
          }
          autoCapitalize={
            autoCapitalize
          }
          className="min-h-[50px] flex-1 px-3 py-2 text-sm"
          style={{
            color: theme.text,
          }}
        />
      </View>

      {helperText ? (
        <Text
          className="mt-1 text-xs"
          style={{
            color:
              theme.textMuted,
          }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

// ============================================================
// INFO ROW
// ============================================================

interface InfoRowProps {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];

  label: string;

  value: string;

  last?: boolean;
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: InfoRowProps) {
  const { theme } =
    useTheme();

  return (
    <View
      className="flex-row items-center py-4"
      style={
        last
          ? undefined
          : {
              borderBottomWidth: 1,

              borderBottomColor:
                theme.border,
            }
      }
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-lg"
        style={{
          backgroundColor:
            theme.surface,
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={theme.accent}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className="text-xs"
          style={{
            color:
              theme.textMuted,
          }}
        >
          {label}
        </Text>

        <Text
          className="mt-1 text-sm font-semibold"
          style={{
            color:
              theme.textSecondary,
          }}
          numberOfLines={3}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

