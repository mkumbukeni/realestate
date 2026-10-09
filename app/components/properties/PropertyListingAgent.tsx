
import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Agent } from "@/app/types/agents/agent";

interface PropertyListingAgentProps {
  listingAgent: Agent | null;
  loading: boolean;
  isDark: boolean;
  onAgentPress: () => void;
  onMessagePress: () => void;
  messageDisabled?: boolean;
}

export default function PropertyListingAgent({
  listingAgent,
  loading,
  isDark,
  onAgentPress,
  onMessagePress,
  messageDisabled = false,
}: PropertyListingAgentProps) {
  return (
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

      {loading ? (
        <View
          className={
            isDark
              ? "items-center rounded-xl border border-[#292929] bg-[#171717] py-10"
              : "items-center rounded-xl border border-gray-200 bg-white py-10"
          }
        >
          <ActivityIndicator size="small" color="#dc2626" />

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
          {/* Agent profile */}
          <Pressable onPress={onAgentPress}>
            {/* Agent header */}
            <View className="flex-row items-center">
              {listingAgent.image ? (
                <Image
                  source={{ uri: listingAgent.image }}
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
                    color={isDark ? "#777" : "#6b7280"}
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
                    {listingAgent.name || "Listing Agent"}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={isDark ? "#777" : "#9ca3af"}
                  />
                </View>

                {listingAgent.agentType ? (
                  <View className="mt-2 self-start rounded-full bg-red-600/15 px-3 py-1">
                    <Text className="text-xs font-semibold text-red-500">
                      {listingAgent.agentType}
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
                      License: {listingAgent.licenseStatus}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Agent contact information */}
            <View
              className={
                isDark
                  ? "mt-5 border-t border-[#292929] pt-4"
                  : "mt-5 border-t border-gray-200 pt-4"
              }
            >
              {listingAgent.email ? (
                <ContactRow
                  icon="mail-outline"
                  label="Email"
                  value={listingAgent.email}
                  isDark={isDark}
                />
              ) : null}

              {listingAgent.phone ? (
                <ContactRow
                  icon="call-outline"
                  label="Phone"
                  value={listingAgent.phone}
                  isDark={isDark}
                  spaced={Boolean(listingAgent.email)}
                />
              ) : null}

              {listingAgent.specialization ? (
                <ContactRow
                  icon="briefcase-outline"
                  label="Specialization"
                  value={listingAgent.specialization}
                  isDark={isDark}
                  spaced={Boolean(
                    listingAgent.email || listingAgent.phone,
                  )}
                />
              ) : null}

              {listingAgent.address ? (
                <ContactRow
                  icon="location-outline"
                  label="Address"
                  value={listingAgent.address}
                  isDark={isDark}
                  spaced={Boolean(
                    listingAgent.email ||
                      listingAgent.phone ||
                      listingAgent.specialization,
                  )}
                  numberOfLines={3}
                />
              ) : null}
            </View>

            {/* View agent profile */}
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
                style={{ marginLeft: 7 }}
              />
            </View>
          </Pressable>

          {/* Message agent */}
          <Pressable
            onPress={onMessagePress}
            disabled={messageDisabled}
            className={`mt-3 flex-row items-center justify-center rounded-lg py-3.5 ${
              messageDisabled
                ? "bg-red-900"
                : "bg-red-600 active:bg-red-700"
            }`}
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
                color={isDark ? "#555" : "#9ca3af"}
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
              No agent is currently associated with this property.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

interface ContactRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  isDark: boolean;
  spaced?: boolean;
  numberOfLines?: number;
}

function ContactRow({
  icon,
  label,
  value,
  isDark,
  spaced = false,
  numberOfLines = 2,
}: ContactRowProps) {
  return (
    <View className={`flex-row items-center ${spaced ? "mt-4" : ""}`}>
      <View
        className={
          isDark
            ? "h-9 w-9 items-center justify-center rounded-lg bg-[#242424]"
            : "h-9 w-9 items-center justify-center rounded-lg bg-gray-100"
        }
      >
        <Ionicons name={icon} size={18} color="#ef4444" />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className={
            isDark ? "text-xs text-zinc-500" : "text-xs text-gray-500"
          }
        >
          {label}
        </Text>

        <Text
          className={
            isDark
              ? "mt-1 text-sm font-medium text-zinc-300"
              : "mt-1 text-sm font-medium text-gray-700"
          }
          numberOfLines={numberOfLines}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
