
import React from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface HighlightProps {
  icon: IconName;
  value: string;
  label: string;
  wide?: boolean;
  isDark: boolean;
}

export function Highlight({
  icon,
  value,
  label,
  wide = false,
  isDark,
}: HighlightProps) {
  return (
    <View
      className={`mb-2 mr-2 rounded-xl border px-3 py-3 ${
        isDark ? "border-[#292929] bg-[#171717]" : "border-gray-200 bg-white"
      } ${wide ? "flex-1" : "min-w-[30%]"}`}
    >
      <Ionicons name={icon} size={20} color="#ef4444" />

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
            isDark ? "mt-1 text-xs text-zinc-500" : "mt-1 text-xs text-gray-500"
          }
          numberOfLines={2}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

interface DetailRowProps {
  icon: IconName;
  label: string;
  value: string;
  last?: boolean;
  isDark: boolean;
}

export function DetailRow({
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
        <Ionicons name={icon} size={18} color="#ef4444" />
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
