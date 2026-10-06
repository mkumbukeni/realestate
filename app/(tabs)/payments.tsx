import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import AuthRequiredModal from "@/app/components/auth/AuthRequiredModal";
import LoginModal from "@/app/components/auth/LoginModal";
import RegisterModal from "@/app/components/auth/RegisterModal";
import { useAuth } from "@/app/components/auth/AuthContext";

type PlanType = "renting" | "buying" | "whatsapp";

interface PlanCardProps {
  title: string;
  price: string;
  priceSuffix: string;
  description: string;
  features: string[];
  icon: keyof typeof Ionicons.glyphMap;
  buttonText: string;
  onPress: () => void;
  isDark: boolean;
}

const PlanCard = ({
  title,
  price,
  priceSuffix,
  description,
  features,
  icon,
  buttonText,
  onPress,
  isDark,
}: PlanCardProps) => {
  const cardBackground = isDark ? "#171717" : "#ffffff";
  const borderColor = isDark ? "#2a2a2a" : "#e5e5e5";
  const primaryText = isDark ? "#ffffff" : "#171717";
  const secondaryText = isDark ? "#a3a3a3" : "#666666";

  return (
    <View
      className="mb-5 overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: cardBackground,
        borderColor,
      }}
    >
      <View className="p-5">
        {/* Icon and title */}
        <View className="mb-4 flex-row items-center">
          <View
            className="mr-3 h-12 w-12 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark ? "#2b1111" : "#fef2f2",
            }}
          >
            <Ionicons
              name={icon}
              size={25}
              color="#dc2626"
            />
          </View>

          <View className="flex-1">
            <Text
              className="text-lg font-bold"
              style={{ color: primaryText }}
            >
              {title}
            </Text>

            <Text
              className="mt-1 text-sm"
              style={{ color: secondaryText }}
            >
              {description}
            </Text>
          </View>
        </View>

        {/* Price */}
        <View
          className="mb-5 rounded-xl p-4"
          style={{
            backgroundColor: isDark
              ? "#101010"
              : "#f7f7f7",
          }}
        >
          <View className="flex-row items-baseline">
            <Text
              className="text-2xl font-extrabold"
              style={{ color: primaryText }}
            >
              {price}
            </Text>

            <Text
              className="ml-2 text-sm"
              style={{ color: secondaryText }}
            >
              {priceSuffix}
            </Text>
          </View>
        </View>

        {/* Features */}
        <Text
          className="mb-3 text-sm font-bold"
          style={{ color: primaryText }}
        >
          What you get
        </Text>

        <View className="mb-5">
          {features.map((feature, index) => (
            <View
              key={`${title}-${index}`}
              className="mb-3 flex-row items-start"
            >
              <View
                className="mr-3 mt-0.5 h-5 w-5 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? "#2b1111"
                    : "#fef2f2",
                }}
              >
                <Ionicons
                  name="checkmark"
                  size={13}
                  color="#dc2626"
                />
              </View>

              <Text
                className="flex-1 text-sm leading-5"
                style={{ color: secondaryText }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Button */}
        <Pressable
          onPress={onPress}
          className="items-center justify-center rounded-xl bg-red-600 py-3.5 active:opacity-80"
        >
          <Text className="text-base font-bold text-white">
            {buttonText}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default function PaymentScreen() {
  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  /*
   * Authentication state
   */
  const { isLoggedIn } = useAuth();

  /*
   * Selected plan
   */
  const [selectedPlan, setSelectedPlan] =
    useState<PlanType | null>(null);

  /*
   * Authentication modal states
   */
  const [authRequiredVisible, setAuthRequiredVisible] =
    useState(false);

  const [loginVisible, setLoginVisible] =
    useState(false);

  const [registerVisible, setRegisterVisible] =
    useState(false);

  const backgroundColor = isDark
    ? "#0d0d0d"
    : "#f5f5f5";

  const primaryText = isDark
    ? "#ffffff"
    : "#171717";

  const secondaryText = isDark
    ? "#a3a3a3"
    : "#666666";

  // ============================================================
  // CONTINUE WITH SELECTED PLAN
  // ============================================================

  const continueWithPlan = (plan: PlanType) => {
    setSelectedPlan(plan);

    if (plan === "renting") {
      Alert.alert(
        "Renting Plan",
        "You selected the Renting a Property plan for MK10,000/month/property.",
        [
          {
            text: "Continue",
            onPress: () => {
              /*
               * Add payment navigation/API here later.
               */
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );

      return;
    }

    if (plan === "buying") {
      Alert.alert(
        "Buying Plan",
        "You selected the Buying a Property plan for MK100,000/month/property.",
        [
          {
            text: "Continue",
            onPress: () => {
              /*
               * Add payment navigation/API here later.
               */
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );

      return;
    }

    Alert.alert(
      "WhatsApp Subscription",
      "You selected the WhatsApp property alerts subscription.",
      [
        {
          text: "Continue",
          onPress: () => {
            /*
             * Add WhatsApp subscription/payment navigation here later.
             */
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  // ============================================================
  // CHOOSE PLAN / SUBSCRIBE
  // ============================================================

  const handleChoosePlan = (plan: PlanType) => {
    /*
     * Logged-out users must authenticate before continuing.
     */
    if (!isLoggedIn) {
      setSelectedPlan(plan);
      setAuthRequiredVisible(true);
      return;
    }

    /*
     * Logged-in users can continue directly.
     */
    continueWithPlan(plan);
  };

  // ============================================================
  // AUTHENTICATION REQUIRED POPUP
  // ============================================================

  const handleCloseAuthRequired = () => {
    setAuthRequiredVisible(false);
    setSelectedPlan(null);
  };

  const handleOpenLogin = () => {
    setAuthRequiredVisible(false);
    setLoginVisible(true);
  };

  const handleOpenRegister = () => {
    setAuthRequiredVisible(false);
    setRegisterVisible(true);
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleCloseLogin = () => {
    setLoginVisible(false);
  };

  const handleLoginSuccess = (
    _email: string,
    _response: Record<string, unknown>,
  ) => {
    /*
     * AuthContext updates isLoggedIn.
     */
    setLoginVisible(false);

    /*
     * Clear the pending plan after successful login.
     * The user can now choose the plan using the normal
     * logged-in button.
     */
    setSelectedPlan(null);
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const handleCloseRegister = () => {
    setRegisterVisible(false);
  };

  const handleRegistrationComplete = () => {
    /*
     * After registration, open the login modal.
     */
    setRegisterVisible(false);
    setLoginVisible(true);
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "bottom"]}
      style={{ backgroundColor }}
    >
      {/* ========================================================
          HEADER
          ======================================================== */}

      <View
        className="flex-row items-center border-b px-4 py-3"
        style={{
          borderBottomColor: isDark
            ? "#292929"
            : "#e5e5e5",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          style={{
            backgroundColor: isDark
              ? "#1c1c1c"
              : "#ffffff",
          }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={primaryText}
          />
        </Pressable>

        <View className="flex-1">
          <Text
            className="text-xl font-bold"
            style={{ color: primaryText }}
          >
            Pricing Plans
          </Text>

          <Text
            className="mt-0.5 text-xs"
            style={{ color: secondaryText }}
          >
            Find the right property subscription for you
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {/* ======================================================
            INTRO
            ====================================================== */}

        <View className="mb-6">
          <Text
            className="text-2xl font-extrabold"
            style={{ color: primaryText }}
          >
            Choose a Plan
          </Text>

          <Text
            className="mt-2 text-sm leading-5"
            style={{ color: secondaryText }}
          >
            Get priority access to properties that match your
            requirements and receive relevant property updates
            directly from us.
          </Text>
        </View>

        {/* ======================================================
            AUTHENTICATION STATUS
            ====================================================== */}

        {isLoggedIn ? (
          <View
            className="mb-6 flex-row items-start rounded-2xl border p-4"
            style={{
              backgroundColor: isDark
                ? "#171717"
                : "#ffffff",
              borderColor: isDark
                ? "#2a2a2a"
                : "#e5e5e5",
            }}
          >
            <View
              className="mr-3 h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? "#102719"
                  : "#f0fdf4",
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#22c55e"
              />
            </View>

            <View className="flex-1">
              <Text
                className="text-sm font-bold"
                style={{ color: primaryText }}
              >
                You're signed in
              </Text>

              <Text
                className="mt-1 text-sm leading-5"
                style={{ color: secondaryText }}
              >
                You can now choose a subscription plan or
                subscribe to WhatsApp property alerts.
              </Text>
            </View>
          </View>
        ) : (
          <View
            className="mb-6 flex-row items-start rounded-2xl border p-4"
            style={{
              backgroundColor: isDark
                ? "#171717"
                : "#ffffff",
              borderColor: isDark
                ? "#2a2a2a"
                : "#e5e5e5",
            }}
          >
            <View
              className="mr-3 h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? "#2b1111"
                  : "#fef2f2",
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#dc2626"
              />
            </View>

            <View className="flex-1">
              <Text
                className="text-sm font-bold"
                style={{ color: primaryText }}
              >
                Sign in to choose a plan
              </Text>

              <Text
                className="mt-1 text-sm leading-5"
                style={{ color: secondaryText }}
              >
                Please sign in or create an account to choose
                a property subscription plan or subscribe to
                WhatsApp property alerts.
              </Text>
            </View>
          </View>
        )}

        {/* ======================================================
            RENTING PLAN
            ====================================================== */}

        <PlanCard
          title="Renting a Property"
          price="MK10,000"
          priceSuffix="/month/property"
          description="For customers looking for a property to rent."
          icon="home-outline"
          features={[
            "Property hunt search special",
            "Priority access to for-rent property listings that meet your enquiry criteria",
            "Up to 4 property referrals per month",
            "Receive WhatsApp and email notifications",
          ]}
          buttonText={
            isLoggedIn
              ? "Choose a Plan"
              : "Sign in to Choose a Plan"
          }
          onPress={() =>
            handleChoosePlan("renting")
          }
          isDark={isDark}
        />

        {/* ======================================================
            BUYING PLAN
            ====================================================== */}

        <PlanCard
          title="Buying a Property"
          price="MK100,000"
          priceSuffix="/month/property"
          description="For customers looking for a property to buy."
          icon="business-outline"
          features={[
            "Property hunt search special",
            "Priority access to for-sale property listings that meet your enquiry criteria",
            "Up to 6 property referrals per month",
            "Receive WhatsApp and email notifications",
            "Priority customer support",
          ]}
          buttonText={
            isLoggedIn
              ? "Choose a Plan"
              : "Sign in to Choose a Plan"
          }
          onPress={() =>
            handleChoosePlan("buying")
          }
          isDark={isDark}
        />

        {/* ======================================================
            WHATSAPP PROPERTY ALERTS
            ====================================================== */}

        <View className="mb-4 mt-3">
          <Text
            className="text-xl font-extrabold"
            style={{ color: primaryText }}
          >
            WhatsApp Property Alerts
          </Text>

          <Text
            className="mt-2 text-sm leading-5"
            style={{ color: secondaryText }}
          >
            Stay updated with property opportunities and
            important updates through WhatsApp.
          </Text>
        </View>

        <View
          className="mb-5 overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: isDark
              ? "#171717"
              : "#ffffff",
            borderColor: isDark
              ? "#2a2a2a"
              : "#e5e5e5",
          }}
        >
          <View className="p-5">
            {/* WhatsApp header */}

            <View className="mb-5 flex-row items-center">
              <View
                className="mr-3 h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? "#102719"
                    : "#f0fdf4",
                }}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={26}
                  color="#22c55e"
                />
              </View>

              <View className="flex-1">
                <Text
                  className="text-lg font-bold"
                  style={{ color: primaryText }}
                >
                  WhatsApp Subscription
                </Text>

                <Text
                  className="mt-1 text-sm"
                  style={{ color: secondaryText }}
                >
                  Receive property information directly on WhatsApp
                </Text>
              </View>
            </View>

            {/* WhatsApp information */}

            <View
              className="mb-5 rounded-xl p-4"
              style={{
                backgroundColor: isDark
                  ? "#101010"
                  : "#f7f7f7",
              }}
            >
              <Text
                className="mb-3 text-base font-bold"
                style={{ color: primaryText }}
              >
                What you can receive
              </Text>

              {[
                {
                  icon: "notifications-outline" as keyof typeof Ionicons.glyphMap,
                  text: "New property listings matching your requirements",
                },
                {
                  icon: "pricetag-outline" as keyof typeof Ionicons.glyphMap,
                  text: "Property price changes and special offers",
                },
                {
                  icon: "search-outline" as keyof typeof Ionicons.glyphMap,
                  text: "Property recommendations based on your search",
                },
                {
                  icon: "calendar-outline" as keyof typeof Ionicons.glyphMap,
                  text: "Open house and property viewing reminders",
                },
                {
                  icon: "chatbubble-ellipses-outline" as keyof typeof Ionicons.glyphMap,
                  text: "Updates about your property enquiries and referrals",
                },
                {
                  icon: "megaphone-outline" as keyof typeof Ionicons.glyphMap,
                  text: "Important Real Estate Africa announcements and updates",
                },
              ].map((item, index) => (
                <View
                  key={`whatsapp-feature-${index}`}
                  className="mb-3 flex-row items-center"
                >
                  <Ionicons
                    name={item.icon}
                    size={19}
                    color="#22c55e"
                  />

                  <Text
                    className="ml-3 flex-1 text-sm leading-5"
                    style={{ color: secondaryText }}
                  >
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>

            {/* Subscription details */}

            <View className="mb-5">
              <Text
                className="mb-2 text-sm font-bold"
                style={{ color: primaryText }}
              >
                How it works
              </Text>

              <Text
                className="text-sm leading-5"
                style={{ color: secondaryText }}
              >
                Subscribe with your WhatsApp number and tell us
                what type of property you are looking for. We will
                send relevant property opportunities and updates
                directly to your WhatsApp.
              </Text>
            </View>

            

            {/* WhatsApp button */}

          <Pressable
  onPress={() => handleChoosePlan("whatsapp")}
  className="w-full flex-row items-center justify-center rounded-xl px-4 py-3.5 active:opacity-80"
  style={{
    backgroundColor: "#22c55e",
  }}
>
  <Ionicons
    name="logo-whatsapp"
    size={20}
    color="#ffffff"
  />

  <Text className="ml-2 flex-shrink text-center text-base font-bold text-white">
    {isLoggedIn
      ? "Subscribe to WhatsApp Alerts"
      : "Sign in to Subscribe to WhatsApp Alerts"}
  </Text>
</Pressable>
          </View>
        </View>

        {/* ======================================================
            BENEFITS
            ====================================================== */}

        <View
          className="rounded-2xl border p-5"
          style={{
            backgroundColor: isDark
              ? "#171717"
              : "#ffffff",
            borderColor: isDark
              ? "#2a2a2a"
              : "#e5e5e5",
          }}
        >
          <View className="mb-3 flex-row items-center">
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color="#dc2626"
            />

            <Text
              className="ml-2 text-base font-bold"
              style={{ color: primaryText }}
            >
              Why subscribe?
            </Text>
          </View>

          <Text
            className="text-sm leading-5"
            style={{ color: secondaryText }}
          >
            Our property subscription service helps you save
            time by connecting you with properties that match
            your requirements. Receive relevant listings,
            recommendations and important updates without
            having to search constantly.
          </Text>
        </View>
      </ScrollView>

      {/* ========================================================
          AUTHENTICATION REQUIRED POPUP
          ======================================================== */}

      <AuthRequiredModal
        visible={authRequiredVisible}
        onClose={handleCloseAuthRequired}
        onLogin={handleOpenLogin}
        onRegister={handleOpenRegister}
        title="Sign in to choose a plan"
        description="Please sign in or create an account to choose a property subscription plan or subscribe to WhatsApp property alerts."
      />

      {/* ========================================================
          LOGIN MODAL
          ======================================================== */}

      <LoginModal
        visible={loginVisible}
        onClose={handleCloseLogin}
        onLogin={handleLoginSuccess}
        onRegister={() => {
          setLoginVisible(false);
          setRegisterVisible(true);
        }}
      />

      {/* ========================================================
          REGISTER MODAL
          ======================================================== */}

      <RegisterModal
        visible={registerVisible}
        onClose={handleCloseRegister}
        onRegistrationComplete={
          handleRegistrationComplete
        }
      />
    </SafeAreaView>
  );
}