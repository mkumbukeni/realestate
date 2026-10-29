
import React from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  View,
  Pressable,
  Linking,
  useColorScheme,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Local video: project-root/assets/videos/about.mp4
const ABOUT_VIDEO = require("../../../assets/videos/about.mp4");

type InfoCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
  isDark: boolean;
};

function InfoCard({
  icon,
  title,
  children,
  isDark,
}: InfoCardProps) {
  return (
    <View
      className={`mb-4 rounded-2xl border p-5 ${
        isDark
          ? "border-[#383838] bg-[#202020]"
          : "border-gray-200 bg-white"
      }`}
    >
      <View className="mb-3 flex-row items-center">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
          <Ionicons name={icon} size={23} color="#dc2626" />
        </View>

        <Text
          className={`flex-1 text-lg font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}

type BulletItemProps = {
  text: string;
  isDark: boolean;
};

function BulletItem({ text, isDark }: BulletItemProps) {
  return (
    <View className="mb-3 flex-row items-start">
      <Ionicons
        name="checkmark-circle"
        size={18}
        color="#dc2626"
        style={{ marginTop: 2 }}
      />

      <Text
        className={`ml-3 flex-1 text-sm leading-6 ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {text}
      </Text>
    </View>
  );
}

function AboutHero() {
  const player = useVideoPlayer(ABOUT_VIDEO, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  return (
    <View style={styles.heroContainer}>
      <VideoView
        player={player}
        style={styles.heroVideo}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />

      {/* Dark overlay for readable text */}
      <View style={styles.heroOverlay} pointerEvents="none" />

      {/* Hero text */}
      <View style={styles.heroContent} pointerEvents="none">
        <View style={styles.heroIcon}>
          <Ionicons name="home-outline" size={30} color="#ffffff" />
        </View>

        <Text style={styles.heroTitle}>About Us</Text>

        <View style={styles.heroAccent} />

        <Text style={styles.heroDescription}>
          We are a dedicated real estate company helping people find
          their dream homes and investment opportunities.
        </Text>

        <View style={styles.brandRow}>
          <Ionicons name="business-outline" size={17} color="#ffffff" />
          <Text style={styles.brandText}>iMORRCS Real Estate</Text>
        </View>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";
  const router = useRouter();

  const openEmail = async () => {
    try {
      await Linking.openURL("mailto:imorrcsafrica@gmail.com");
    } catch (error) {
      console.warn("Unable to open email:", error);
    }
  };

  const openPhone = async (phone: string) => {
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      console.warn("Unable to open phone dialer:", error);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.screen,
        { backgroundColor: isDark ? "#0d0d0d" : "#f9fafb" },
      ]}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0d0d0d" : "#f9fafb"}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BACKGROUND VIDEO AND INTRO */}
        <AboutHero />

        <View className="px-4 pt-5">
          {/* INTRODUCTION */}
          <View
            className={`mb-5 rounded-2xl border p-5 ${
              isDark
                ? "border-[#383838] bg-[#202020]"
                : "border-gray-200 bg-white"
            }`}
          >
            <Text
              className={`text-[15px] leading-7 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Founded with the belief that everyone deserves a place
              to call home, our mission is to simplify the property
              buying and renting process through trust, transparency,
              and technology. Our vision is to become the most
              customer-centric real estate company by delivering
              quality service and fostering long-term relationships.
            </Text>
          </View>

          {/* OUR STORY */}
          <InfoCard
            icon="book-outline"
            title="Our Story"
            isDark={isDark}
          >
            <Text
              className={`text-sm leading-6 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              We were founded with the belief that everyone deserves
              a place to call home. We aim to simplify the property
              buying and renting process through trust, transparency,
              and technology.
            </Text>
          </InfoCard>

          {/* OUR MISSION */}
          <InfoCard
            icon="flag-outline"
            title="Our Mission"
            isDark={isDark}
          >
            <Text
              className={`text-sm leading-6 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              To simplify the property buying and renting process
              through trust, transparency, and technology while
              delivering quality service to our customers.
            </Text>
          </InfoCard>

          {/* OUR VISION */}
          <InfoCard
            icon="eye-outline"
            title="Our Vision"
            isDark={isDark}
          >
            <Text
              className={`text-sm leading-6 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              To become the most customer-centric real estate company
              by delivering quality service and fostering long-term
              relationships.
            </Text>
          </InfoCard>

          {/* WHY CHOOSE US */}
          <InfoCard
            icon="shield-checkmark-outline"
            title="Why Choose Us?"
            isDark={isDark}
          >
            <BulletItem
              text="Experienced and professional agents"
              isDark={isDark}
            />
            <BulletItem
              text="Wide selection of properties"
              isDark={isDark}
            />
            <BulletItem
              text="Transparent and secure transactions"
              isDark={isDark}
            />
            <BulletItem
              text="Customer-first approach"
              isDark={isDark}
            />
            <BulletItem
              text="Support from start to finish"
              isDark={isDark}
            />
          </InfoCard>

          {/* OUR SERVICES */}
          <InfoCard
            icon="business-outline"
            title="Our Services"
            isDark={isDark}
          >
            <BulletItem text="Property Sales" isDark={isDark} />
            <BulletItem text="Property Rentals" isDark={isDark} />
            <BulletItem
              text="Investment Consulting"
              isDark={isDark}
            />
            <BulletItem
              text="Property Management"
              isDark={isDark}
            />
            <BulletItem text="Market Analysis" isDark={isDark} />

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/services")}
              className="mt-3 flex-row items-center justify-center rounded-xl bg-red-600 px-5 py-3.5 active:bg-red-700"
            >
              <Text className="mr-2 text-sm font-bold text-white">
                View All Services
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#ffffff"
              />
            </Pressable>
          </InfoCard>

          {/* CONTACT US */}
          <InfoCard
            icon="call-outline"
            title="Contact Us"
            isDark={isDark}
          >
            <Text
              className={`mb-4 text-base font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              iMORRCS Real Estate
            </Text>

            <View className="mb-4 flex-row items-start">
              <Ionicons
                name="location-outline"
                size={20}
                color="#dc2626"
              />
              <Text
                className={`ml-3 flex-1 text-sm leading-6 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                P.O. Box 990, Blantyre, Malawi
              </Text>
            </View>

            <Pressable
              onPress={() => openPhone("+265990101303")}
              className="mb-4 flex-row items-center"
            >
              <Ionicons
                name="call-outline"
                size={20}
                color="#dc2626"
              />
              <Text className="ml-3 flex-1 text-sm text-red-600">
                +265 990 101 303
              </Text>
            </Pressable>

            <Pressable
              onPress={() => openPhone("+265880101303")}
              className="mb-4 flex-row items-center"
            >
              <Ionicons
                name="call-outline"
                size={20}
                color="#dc2626"
              />
              <Text className="ml-3 flex-1 text-sm text-red-600">
                +265 880 101 303
              </Text>
            </Pressable>

            <Pressable
              onPress={openEmail}
              className="flex-row items-center"
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color="#dc2626"
              />
              <Text className="ml-3 flex-1 text-sm text-red-600">
                imorrcsafrica@gmail.com
              </Text>
            </Pressable>
          </InfoCard>

          {/* FOOTER */}
          <View className="mb-4 mt-2 items-center">
            <Text
              className={`text-center text-xs ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              iMORRCS Real Estate
            </Text>
            <Text
              className={`mt-1 text-center text-xs ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Trust. Transparency. Technology.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroContainer: {
    width: "100%",
    height: 360,
    overflow: "hidden",
    backgroundColor: "#171717",
    justifyContent: "center",
  },
  heroVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.52)",
  },
  heroContent: {
    paddingHorizontal: 24,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  heroAccent: {
    width: 64,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#dc2626",
    marginVertical: 16,
  },
  heroDescription: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 25,
    fontWeight: "500",
    maxWidth: 500,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  brandText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
