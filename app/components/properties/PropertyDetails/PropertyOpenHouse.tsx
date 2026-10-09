
import React from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface PropertyOpenHouseItem {
  id?: number | string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

interface PropertyOpenHouseProps {
  isOpenHouse: boolean;
  openHouses?: PropertyOpenHouseItem[];
  isDark: boolean;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PropertyOpenHouse({
  isOpenHouse,
  openHouses = [],
  isDark,
}: PropertyOpenHouseProps) {
  const cardClass = isDark
    ? "border-[#292929] bg-[#171717]"
    : "border-gray-200 bg-white";

  const mainTextClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-zinc-400" : "text-gray-500";

  return (
    <View className="mt-8">
      <Text className={`mb-4 text-xl font-bold ${mainTextClass}`}>
        Open Houses
      </Text>

      <View className={`rounded-xl border p-4 ${cardClass}`}>
        {isOpenHouse ? (
          <>
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={22} color="#ef4444" />
              <Text className={`ml-3 flex-1 text-base font-semibold ${mainTextClass}`}>
                Open house available
              </Text>
            </View>

            {openHouses.length > 0 ? (
              openHouses.map((item, index) => (
                <View
                  key={String(item.id ?? index)}
                  className={`mt-4 border-t pt-4 ${
                    isDark ? "border-[#292929]" : "border-gray-200"
                  }`}
                >
                  {item.start_date ? (
                    <Text className={`text-sm ${mutedTextClass}`}>
                      Starts: {formatDate(item.start_date)}
                    </Text>
                  ) : null}

                  {item.end_date ? (
                    <Text className={`mt-1 text-sm ${mutedTextClass}`}>
                      Ends: {formatDate(item.end_date)}
                    </Text>
                  ) : null}

                  {item.description ? (
                    <Text className={`mt-2 text-sm leading-5 ${mainTextClass}`}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text className={`mt-2 text-sm ${mutedTextClass}`}>
                Contact the listing agent for open-house dates and details.
              </Text>
            )}
          </>
        ) : (
          <View className="flex-row items-center">
            <Ionicons
              name="calendar-clear-outline"
              size={22}
              color={isDark ? "#71717a" : "#9ca3af"}
            />
            <Text className={`ml-3 flex-1 text-sm ${mutedTextClass}`}>
              No open houses scheduled at this time.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
