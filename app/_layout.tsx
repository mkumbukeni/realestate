
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  Stack,
  useRouter,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import "react-native-reanimated";

import "../global.css";

import {
  AuthProvider,
  useAuth,
} from "@/app/components/auth/AuthContext";

import LoginModal from "@/app/components/auth/LoginModal";
import RegisterModal from "@/app/components/auth/RegisterModal";

import {
  ThemeProvider as AppThemeProvider,
  useTheme,
} from "@/app/components/theme/ThemeContext";

import SideMenu from "@/app/components/sidebar/SideMenu";

/* ============================================================
   THEME TOGGLE BUTTON
   ============================================================ */

function ThemeToggleButton() {
  const {
    isDark,
    toggleTheme,
  } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className="
        h-8
        w-8
        items-center
        justify-center
        bg-transparent
      "
    >
      <Ionicons
        name={
          isDark
            ? "sunny"
            : "moon"
        }
        size={22}
        color={
          isDark
            ? "white"
            : "black"
        }
      />
    </Pressable>
  );
}

/* ============================================================
   GLOBAL MENU BUTTON
   ============================================================ */

function GlobalMenuButton({
  onPress,
}: {
  onPress: () => void;
}) {
  const { isDark } =
    useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      className="
        h-11
        w-11
        items-center
        justify-center
        bg-transparent
      "
    >
      <Ionicons
        name="menu-outline"
        size={24}
        color={
          isDark
            ? "white"
            : "black"
        }
      />
    </Pressable>
  );
}

/* ============================================================
   GLOBAL AUTH BUTTON
   ============================================================ */

function GlobalAuthButton({
  onPress,
  isLoggedIn,
}: {
  onPress: () => void;
  isLoggedIn: boolean;
}) {
  const { isDark } =
    useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        isLoggedIn
          ? "Open account menu"
          : "Open login and register menu"
      }
      className={`
        h-8
        w-8
        items-center
        justify-center
        shadow-lg
        ${
          isDark
            ? "border-[#292929] bg-[#171717]"
            : "border-gray-200 bg-white"
        }
      `}
    >
      <Ionicons
        name={
          isLoggedIn
            ? "person-circle-outline"
            : "person-outline"
        }
        size={26}
        color={
          isDark
            ? "white"
            : "black"
        }
      />
    </Pressable>
  );
}

/* ============================================================
   GLOBAL HEADER
   ============================================================ */

function GlobalHeader({
  onMenuPress,
  onAuthPress,
  isLoggedIn,
}: {
  onMenuPress: () => void;
  onAuthPress: () => void;
  isLoggedIn: boolean;
}) {
  const { isDark } =
    useTheme();

  return (
    <View
      className={`
        absolute
        left-0
        right-0
        top-0
        z-50
        h-[110px]
        flex-row
        items-center
        border-b
        px-5
        pt-[38px]
        ${
          isDark
            ? "border-[#222] bg-[#0d0d0d]"
            : "border-gray-200 bg-white"
        }
      `}
    >
      {/* ======================================================
          LEFT - MENU
          ====================================================== */}

      <View className="w-[20%] items-start justify-center">
        <GlobalMenuButton
          onPress={onMenuPress}
        />
      </View>

      {/* ======================================================
          CENTER - TITLE
          ====================================================== */}

      <View className="flex-1 items-center justify-center">
        <Text
          numberOfLines={1}
          className="
            text-center
            text-2xl
            font-bold
            text-red-500
          "
        >
          Real Estate Africa
        </Text>
      </View>

      {/* ======================================================
          RIGHT - THEME + AUTH
          ====================================================== */}

      <View className="w-[25%] flex-row items-center justify-end gap-4">
        <ThemeToggleButton />

        <GlobalAuthButton
          onPress={onAuthPress}
          isLoggedIn={isLoggedIn}
        />
      </View>
    </View>
  );
}

/* ============================================================
   LOGGED-IN ACCOUNT DROPDOWN
   ============================================================ */

function AccountDropdown({
  visible,
  onProfile,
  onLogout,
  onClose,
}: {
  visible: boolean;
  onProfile: () => void;
  onLogout: () => void;
  onClose: () => void;
}) {
  const { isDark } =
    useTheme();

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* Invisible area to close the dropdown */}
      <Pressable
        onPress={onClose}
        className="absolute inset-0 z-40"
      />

      <View
        className={`
          absolute
          right-5
          top-[88px]
          z-[60]
          w-[190px]
          overflow-hidden
          rounded-xl
          border
          shadow-xl
          ${
            isDark
              ? "border-[#292929] bg-[#171717]"
              : "border-gray-200 bg-white"
          }
        `}
      >
        {/* PROFILE */}

        <Pressable
          onPress={onProfile}
          className={`
            flex-row
            items-center
            px-4
            py-4
            ${
              isDark
                ? "active:bg-[#242424]"
                : "active:bg-gray-100"
            }
          `}
        >
          <View
            className={`
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              ${
                isDark
                  ? "bg-[#292929]"
                  : "bg-gray-100"
              }
            `}
          >
            <Ionicons
              name="person-outline"
              size={19}
              color="#ef4444"
            />
          </View>

          <Text
            className={`
              ml-3
              text-sm
              font-semibold
              ${
                isDark
                  ? "text-white"
                  : "text-gray-900"
              }
            `}
          >
            Profile
          </Text>
        </Pressable>

        {/* DIVIDER */}

        <View
          className={
            isDark
              ? "h-px bg-[#292929]"
              : "h-px bg-gray-200"
          }
        />

        {/* LOGOUT */}

        <Pressable
          onPress={onLogout}
          className={`
            flex-row
            items-center
            px-4
            py-4
            ${
              isDark
                ? "active:bg-[#242424]"
                : "active:bg-gray-100"
            }
          `}
        >
          <View
            className={`
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              ${
                isDark
                  ? "bg-red-950/40"
                  : "bg-red-50"
              }
            `}
          >
            <Ionicons
              name="log-out-outline"
              size={19}
              color="#ef4444"
            />
          </View>

          <Text className="ml-3 text-sm font-semibold text-red-500">
            Logout
          </Text>
        </Pressable>
      </View>
    </>
  );
}

/* ============================================================
   LOGGED-OUT AUTH DROPDOWN
   ============================================================ */

function AuthDropdown({
  visible,
  onLogin,
  onRegister,
  onClose,
}: {
  visible: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onClose: () => void;
}) {
  const { isDark } =
    useTheme();

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* Invisible area to close the dropdown */}
      <Pressable
        onPress={onClose}
        className="absolute inset-0 z-40"
      />

      <View
        className={`
          absolute
          right-5
          top-[88px]
          z-[60]
          w-[210px]
          overflow-hidden
          rounded-xl
          border
          shadow-xl
          ${
            isDark
              ? "border-[#292929] bg-[#171717]"
              : "border-gray-200 bg-white"
          }
        `}
      >
        {/* LOGIN */}

        <Pressable
          onPress={onLogin}
          className={`
            flex-row
            items-center
            px-4
            py-4
            ${
              isDark
                ? "active:bg-[#242424]"
                : "active:bg-gray-100"
            }
          `}
        >
          <View
            className={`
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              ${
                isDark
                  ? "bg-[#292929]"
                  : "bg-gray-100"
              }
            `}
          >
            <Ionicons
              name="log-in-outline"
              size={20}
              color="#ef4444"
            />
          </View>

          <View className="ml-3 flex-1">
            <Text
              className={`
                text-sm
                font-semibold
                ${
                  isDark
                    ? "text-white"
                    : "text-gray-900"
                }
              `}
            >
              Login
            </Text>

            <Text
              className={`
                mt-0.5
                text-xs
                ${
                  isDark
                    ? "text-gray-400"
                    : "text-gray-500"
                }
              `}
            >
              Sign in to your account
            </Text>
          </View>
        </Pressable>

        {/* DIVIDER */}

        <View
          className={
            isDark
              ? "h-px bg-[#292929]"
              : "h-px bg-gray-200"
          }
        />

        {/* REGISTER */}

        <Pressable
          onPress={onRegister}
          className={`
            flex-row
            items-center
            px-4
            py-4
            ${
              isDark
                ? "active:bg-[#242424]"
                : "active:bg-gray-100"
            }
          `}
        >
          <View
            className={`
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              ${
                isDark
                  ? "bg-[#292929]"
                  : "bg-gray-100"
              }
            `}
          >
            <Ionicons
              name="person-add-outline"
              size={20}
              color="#ef4444"
            />
          </View>

          <View className="ml-3 flex-1">
            <Text
              className={`
                text-sm
                font-semibold
                ${
                  isDark
                    ? "text-white"
                    : "text-gray-900"
                }
              `}
            >
              Register
            </Text>

            <Text
              className={`
                mt-0.5
                text-xs
                ${
                  isDark
                    ? "text-gray-400"
                    : "text-gray-500"
                }
              `}
            >
              Create a new account
            </Text>
          </View>
        </Pressable>
      </View>
    </>
  );
}

/* ============================================================
   ROOT CONTENT
   ============================================================ */

function RootContent() {
  const {
    isDark,
    theme,
  } = useTheme();

  const {
    isLoggedIn,
    logout,
  } = useAuth();

  const router =
    useRouter();

  const [
    menuVisible,
    setMenuVisible,
  ] = useState(false);

  const [
    loginVisible,
    setLoginVisible,
  ] = useState(false);

  const [
    registerVisible,
    setRegisterVisible,
  ] = useState(false);

  const [
    accountMenuVisible,
    setAccountMenuVisible,
  ] = useState(false);

  const [
    authDropdownVisible,
    setAuthDropdownVisible,
  ] = useState(false);

  /* ==========================================================
     AUTH BUTTON

     LOGGED OUT:
     Open Login/Register dropdown.

     LOGGED IN:
     Open Profile/Logout dropdown.
     ========================================================== */

  const handleAuthPress =
    () => {
      if (isLoggedIn) {
        setAuthDropdownVisible(false);

        setAccountMenuVisible(
          (visible) => !visible,
        );

        return;
      }

      setAccountMenuVisible(false);

      setAuthDropdownVisible(
        (visible) => !visible,
      );
    };

  /* ==========================================================
     LOGIN FROM LOGGED-OUT DROPDOWN
     ========================================================== */

  const handleOpenLogin =
    () => {
      setAuthDropdownVisible(false);
      setLoginVisible(true);
    };

  /* ==========================================================
     REGISTER FROM LOGGED-OUT DROPDOWN
     ========================================================== */

  const handleOpenRegister =
    () => {
      setAuthDropdownVisible(false);
      setRegisterVisible(true);
    };

  /* ==========================================================
     PROFILE
     ========================================================== */

  const handleProfile =
    () => {
      setAccountMenuVisible(false);

      router.push(
        "/others/profile/profile",
      );
    };

  /* ==========================================================
     LOGOUT
     ========================================================== */

  const handleLogout =
    async () => {
      try {
        setAccountMenuVisible(false);
        setAuthDropdownVisible(false);
        setMenuVisible(false);
        setLoginVisible(false);
        setRegisterVisible(false);

        await logout();

        router.replace(
          "/(tabs)/home",
        );
      } catch (error) {
        console.error(
          "Logout failed:",
          error,
        );

        setAccountMenuVisible(false);
        setAuthDropdownVisible(false);
        setMenuVisible(false);
      }
    };

  /* ==========================================================
     LOGIN SUCCESS
     ========================================================== */

  const handleLoginSuccess =
    (
      _email: string,
      _response: Record<
        string,
        unknown
      >,
    ) => {
      /*
       * AuthContext has already updated
       * isLoggedIn.
       */
      setLoginVisible(false);
    };

  /* ==========================================================
     REGISTER CLOSE
     ========================================================== */

  const handleRegisterClose =
    () => {
      setRegisterVisible(false);
    };

  return (
    <ThemeProvider
      value={
        isDark
          ? {
              ...DarkTheme,
              colors: {
                ...DarkTheme.colors,
                background:
                  theme.background,
                card:
                  theme.card,
                text:
                  theme.text,
                border:
                  theme.border,
                primary:
                  theme.accent,
              },
            }
          : {
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                background:
                  theme.background,
                card:
                  theme.card,
                text:
                  theme.text,
                border:
                  theme.border,
                primary:
                  theme.accent,
              },
            }
      }
    >
      {/* ======================================================
          ROOT CONTAINER
          ====================================================== */}

      <View
        className={`flex-1 ${
          isDark
            ? "bg-[#0d0d0d]"
            : "bg-white"
        }`}
      >
        {/* ====================================================
            GLOBAL HEADER
            ==================================================== */}

        <GlobalHeader
          onMenuPress={() => {
            setAccountMenuVisible(false);
            setAuthDropdownVisible(false);
            setMenuVisible(true);
          }}
          onAuthPress={
            handleAuthPress
          }
          isLoggedIn={isLoggedIn}
        />

        {/* ====================================================
            APP SCREENS
            ==================================================== */}

        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>

        {/* ====================================================
            LOGGED-IN ACCOUNT DROPDOWN
            ==================================================== */}

        <AccountDropdown
          visible={
            isLoggedIn &&
            accountMenuVisible
          }
          onProfile={
            handleProfile
          }
          onLogout={
            handleLogout
          }
          onClose={() =>
            setAccountMenuVisible(
              false,
            )
          }
        />

        {/* ====================================================
            LOGGED-OUT LOGIN / REGISTER DROPDOWN
            ==================================================== */}

        <AuthDropdown
          visible={
            !isLoggedIn &&
            authDropdownVisible
          }
          onLogin={
            handleOpenLogin
          }
          onRegister={
            handleOpenRegister
          }
          onClose={() =>
            setAuthDropdownVisible(
              false,
            )
          }
        />

        {/* ====================================================
            SIDE MENU
            ==================================================== */}

        <SideMenu
          visible={menuVisible}
          onClose={() =>
            setMenuVisible(false)
          }
        />

        {/* ====================================================
            LOGIN MODAL
            ==================================================== */}

        <LoginModal
          visible={loginVisible}
          onClose={() =>
            setLoginVisible(false)
          }
          onLogin={
            handleLoginSuccess
          }
          onRegister={() => {
            setLoginVisible(false);
            setRegisterVisible(true);
          }}
        />

        {/* ====================================================
            REGISTER MODAL
            ==================================================== */}

        <RegisterModal
          visible={registerVisible}
          onClose={
            handleRegisterClose
          }
        />

        {/* ====================================================
            STATUS BAR
            ==================================================== */}

        <StatusBar
          style={
            isDark
              ? "light"
              : "dark"
          }
        />
      </View>
    </ThemeProvider>
  );
}

/* ============================================================
   ROOT LAYOUT
   ============================================================ */

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootContent />
      </AuthProvider>
    </AppThemeProvider>
  );
}

