
import React from "react";

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import type { Agent } from "@/app/types/agents/agent";

interface PropertyMessageModalProps {
  visible: boolean;
  isDark: boolean;
  listingAgent: Agent | null;
  messageText: string;
  onMessageTextChange: (text: string) => void;
  sendingMessage: boolean;
  onClose: () => void;
  onSend: () => void;
}

export default function PropertyMessageModal({
  visible,
  isDark,
  listingAgent,
  messageText,
  onMessageTextChange,
  sendingMessage,
  onClose,
  onSend,
}: PropertyMessageModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View
            className={
              isDark
                ? "max-h-[85%] rounded-t-3xl border-t border-[#292929] bg-[#111111] px-5 pb-8 pt-5"
                : "max-h-[85%] rounded-t-3xl border-t border-gray-200 bg-white px-5 pb-8 pt-5"
            }
          >
            {/* MODAL HEADER */}

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
                  {listingAgent?.name || "Listing Agent"}
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                disabled={sendingMessage}
                className={
                  isDark
                    ? "h-10 w-10 items-center justify-center rounded-full bg-[#242424]"
                    : "h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                }
              >
                <Ionicons
                  name="close"
                  size={23}
                  color={isDark ? "#fff" : "#000"}
                />
              </Pressable>
            </View>

            {/* AGENT SUMMARY */}

            <View
              className={
                isDark
                  ? "mt-5 flex-row items-center rounded-xl border border-[#292929] bg-[#171717] p-3"
                  : "mt-5 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 p-3"
              }
            >
              {listingAgent?.image ? (
                <Image
                  source={{ uri: listingAgent.image }}
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
                    color={isDark ? "#777" : "#6b7280"}
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
                  {listingAgent?.name || "Listing Agent"}
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

            {/* MESSAGE INPUT */}

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
                onChangeText={onMessageTextChange}
                placeholder="Write a message to the agent..."
                placeholderTextColor={isDark ? "#666" : "#9ca3af"}
                multiline
                textAlignVertical="top"
                editable={!sendingMessage}
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

            {/* SEND BUTTON */}

            <Pressable
              onPress={onSend}
              disabled={sendingMessage}
              className={`mt-4 flex-row items-center justify-center rounded-xl px-5 py-4 ${
                sendingMessage
                  ? "bg-red-900"
                  : "bg-red-600 active:bg-red-700"
              }`}
            >
              {sendingMessage ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />

                  <Text className="ml-2 text-base font-bold text-white">
                    Sending...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="send-outline" size={19} color="#fff" />

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
              Your message will be sent directly to the listing agent.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
