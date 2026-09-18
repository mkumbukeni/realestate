import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import SideMenu from "@/app/components/sidebar/SideMenu";

export default function ProfileScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  const user = {
    name: "Mkumbukeni Mhone",
    email: "mkumbukeni@example.com",
    phone: "+265 999 000 000",
    location: "Lilongwe, Malawi",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Side Menu */}
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <View>
            <Text className="text-2xl font-bold text-white">
              Profile
            </Text>

            <Text className="mt-1 text-sm text-gray-400">
              Manage your account
            </Text>
          </View>

          {/* Menu Button */}
          <Pressable
            onPress={() => setMenuVisible(true)}
            className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
          >
            <Ionicons
              name="menu-outline"
              size={28}
              color="#ffffff"
            />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View className="mx-5 mt-4 rounded-3xl bg-[#171717] p-6">
          <View className="items-center">
            {/* Profile Image */}
            <View className="rounded-full border-2 border-red-600 p-1">
              <Image
                source={{ uri: user.image }}
                className="h-28 w-28 rounded-full"
              />
            </View>

            {/* Name */}
            <Text className="mt-4 text-2xl font-bold text-white">
              {user.name}
            </Text>

            {/* Role */}
            <Text className="mt-1 text-sm text-gray-400">
              Property Buyer / Client
            </Text>

            {/* Location */}
            <View className="mt-3 flex-row items-center">
              <Ionicons
                name="location-outline"
                size={16}
                color="#ef4444"
              />

              <Text className="ml-1 text-sm text-gray-400">
                {user.location}
              </Text>
            </View>
          </View>

          {/* Edit Profile */}
          <Pressable
            onPress={() => {}}
            className="mt-6 flex-row items-center justify-center rounded-2xl bg-red-600 py-3.5"
          >
            <Ionicons
              name="create-outline"
              size={19}
              color="#ffffff"
            />

            <Text className="ml-2 font-semibold text-white">
              Edit Profile
            </Text>
          </Pressable>
        </View>

        {/* Account Information */}
        <View className="mt-7 px-5">
          <Text className="mb-3 text-lg font-bold text-white">
            Account Information
          </Text>

          <View className="rounded-3xl bg-[#171717]">
            {/* Email */}
            <View className="flex-row items-center border-b border-[#292929] px-5 py-5">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#241313]">
                <Ionicons
                  name="mail-outline"
                  size={21}
                  color="#ef4444"
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-xs text-gray-500">
                  Email
                </Text>

                <Text
                  className="mt-1 text-sm font-medium text-white"
                  numberOfLines={1}
                >
                  {user.email}
                </Text>
              </View>
            </View>

            {/* Phone */}
            <View className="flex-row items-center border-b border-[#292929] px-5 py-5">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#241313]">
                <Ionicons
                  name="call-outline"
                  size={21}
                  color="#ef4444"
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-xs text-gray-500">
                  Phone
                </Text>

                <Text className="mt-1 text-sm font-medium text-white">
                  {user.phone}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View className="flex-row items-center px-5 py-5">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#241313]">
                <Ionicons
                  name="location-outline"
                  size={21}
                  color="#ef4444"
                />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-xs text-gray-500">
                  Location
                </Text>

                <Text className="mt-1 text-sm font-medium text-white">
                  {user.location}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* My Activity */}
        <View className="mt-7 px-5">
          <Text className="mb-3 text-lg font-bold text-white">
            My Activity
          </Text>

          <View className="flex-row gap-3">
            {/* Saved Properties */}
            <Pressable
              onPress={() => {}}
              className="flex-1 rounded-3xl bg-[#171717] p-5"
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#241313]">
                <Ionicons
                  name="heart-outline"
                  size={23}
                  color="#ef4444"
                />
              </View>

              <Text className="mt-4 text-base font-bold text-white">
                Saved
              </Text>

              <Text className="mt-1 text-xs text-gray-500">
                Properties
              </Text>
            </Pressable>

            {/* Enquiries */}
            <Pressable
              onPress={() => {}}
              className="flex-1 rounded-3xl bg-[#171717] p-5"
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#241313]">
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={23}
                  color="#ef4444"
                />
              </View>

              <Text className="mt-4 text-base font-bold text-white">
                Enquiries
              </Text>

              <Text className="mt-1 text-xs text-gray-500">
                My enquiries
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Account */}
        <View className="mt-7 px-5">
          <Text className="mb-3 text-lg font-bold text-white">
            Account
          </Text>

          <View className="overflow-hidden rounded-3xl bg-[#171717]">
            {/* Notifications */}
            <Pressable
              onPress={() => {}}
              className="flex-row items-center border-b border-[#292929] px-5 py-5"
            >
              <Ionicons
                name="notifications-outline"
                size={23}
                color="#ffffff"
              />

              <Text className="ml-4 flex-1 text-base text-white">
                Notifications
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#666666"
              />
            </Pressable>

            {/* Security */}
            <Pressable
              onPress={() => {}}
              className="flex-row items-center border-b border-[#292929] px-5 py-5"
            >
              <Ionicons
                name="lock-closed-outline"
                size={23}
                color="#ffffff"
              />

              <Text className="ml-4 flex-1 text-base text-white">
                Security
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#666666"
              />
            </Pressable>

            {/* Help & Support */}
            <Pressable
              onPress={() => {}}
              className="flex-row items-center px-5 py-5"
            >
              <Ionicons
                name="help-circle-outline"
                size={23}
                color="#ffffff"
              />

              <Text className="ml-4 flex-1 text-base text-white">
                Help & Support
              </Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#666666"
              />
            </Pressable>
          </View>
        </View>

        {/* Logout */}
        <View className="mt-7 px-5">
          <Pressable
            onPress={() => {
              // Connect this to your LoginContext logout function
            }}
            className="flex-row items-center justify-center rounded-2xl border border-red-600/40 bg-[#1a0b0b] py-4"
          >
            <Ionicons
              name="log-out-outline"
              size={21}
              color="#ef4444"
            />

            <Text className="ml-2 font-semibold text-red-500">
              Log Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}