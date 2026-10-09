import React, { useCallback } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useTheme } from "@/app/components/theme/ThemeContext";
import { useAuth } from "@/app/components/auth/AuthContext";
import AuthRequiredModal from "@/app/components/auth/AuthRequiredModal";
import LoginModal from "@/app/components/auth/LoginModal";
import RegisterModal from "@/app/components/auth/RegisterModal";

import PropertiesHeader from "@/app/components/properties/home/PropertiesHeader";
import PropertiesGrid from "@/app/components/properties/home/PropertiesGrid";
import PropertiesLoadingState from "@/app/components/properties/home/PropertiesLoadingState";
import PropertiesErrorState from "@/app/components/properties/home/PropertiesErrorState";

import { usePropertiesScreen } from "@/app/hooks/properties/usePropertiesScreen";
import { getPropertyId } from "@/app/utils/properties/propertiesScreen.utils";

import type { Property } from "@/app/types/properties/property";

export default function PropertiesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();
  const { isLoggedIn } = useAuth();

  const params = useLocalSearchParams<{
    category?: string | string[];
  }>();

  const screen = usePropertiesScreen({
    category: params.category,
  });

  const {
    selectedCategory,
    isAllPropertiesMode,
    properties,
    loading,
    refreshing,
    error,
    searchQuery,
    setSearchQuery,
    listingFilter,
    propertyTypeFilter,
    openDropdown,
    setOpenDropdown,
    filteredProperties,
    handleRefresh,
    clearSearch,
    handleListingFilterPress,
    handlePropertyTypeSelect,
  } = screen;

  const [pendingProperty, setPendingProperty] =
    React.useState<Property | null>(null);

  const [authRequiredVisible, setAuthRequiredVisible] =
    React.useState(false);

  const [loginVisible, setLoginVisible] =
    React.useState(false);

  const [registerVisible, setRegisterVisible] =
    React.useState(false);

  const numberOfColumns = width >= 700 ? 2 : 1;
  const screenTitle = selectedCategory ?? "Properties";

  const openPropertyDetails = useCallback(
    (property: Property) => {
      router.push({
        pathname: "/(tabs)/properties/[id]",
        params: {
          id: getPropertyId(property),
        },
      });
    },
    [router],
  );

  const handlePropertyPress = useCallback(
    (property: Property) => {
      if (isLoggedIn) {
        openPropertyDetails(property);
        return;
      }

      setPendingProperty(property);
      setAuthRequiredVisible(true);
    },
    [isLoggedIn, openPropertyDetails],
  );

  const handleAuthRequiredLogin = useCallback(() => {
    setAuthRequiredVisible(false);
    setLoginVisible(true);
  }, []);

  const handleAuthRequiredRegister = useCallback(() => {
    setAuthRequiredVisible(false);
    setRegisterVisible(true);
  }, []);

  const handleCloseAuthRequired = useCallback(() => {
    setAuthRequiredVisible(false);
    setPendingProperty(null);
  }, []);

  const handleLoginSuccess = useCallback(
    (_email: string, _response: Record<string, unknown>) => {
      setLoginVisible(false);

      if (pendingProperty) {
        const propertyToOpen = pendingProperty;
        setPendingProperty(null);
        openPropertyDetails(propertyToOpen);
      }
    },
    [pendingProperty, openPropertyDetails],
  );

  const handleRegistrationComplete = useCallback(() => {
    // Registration does not automatically authenticate the user.
    setRegisterVisible(false);
    setLoginVisible(true);
  }, []);

  const handleCloseLogin = useCallback(() => {
    setLoginVisible(false);
  }, []);

  const handleCloseRegister = useCallback(() => {
    setRegisterVisible(false);
  }, []);

  const handleLoginOpenRegister = useCallback(() => {
    setLoginVisible(false);
    setRegisterVisible(true);
  }, []);

  const handleRegisterOpenLogin = useCallback(() => {
    setRegisterVisible(false);
    setLoginVisible(true);
  }, []);

  if (loading) {
    return (
      <PropertiesLoadingState
        isDark={isDark}
        screenTitle={screenTitle}
      />
    );
  }

  if (error && properties.length === 0) {
    return (
      <PropertiesErrorState
        isDark={isDark}
        screenTitle={screenTitle}
        error={error}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${
        isDark ? "bg-[#0d0d0d]" : "bg-white"
      }`}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0d0d0d" : "#ffffff"}
      />

      <PropertiesHeader
        isDark={isDark}
        screenTitle={screenTitle}
        isAllPropertiesMode={isAllPropertiesMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={clearSearch}
        listingFilter={listingFilter}
        propertyTypeFilter={propertyTypeFilter}
        openDropdown={openDropdown}
        propertyCount={filteredProperties.length}
        onListingFilterPress={handleListingFilterPress}
        onPropertyTypeSelect={handlePropertyTypeSelect}
        onClearPropertyType={() => {
          handlePropertyTypeSelect("all");
          setOpenDropdown(null);
        }}
      />

      <ScrollView
        className={isDark ? "flex-1 bg-[#0d0d0d]" : "flex-1 bg-white"}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ef4444"
            colors={["#ef4444"]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 30,
        }}
      >
        <PropertiesGrid
          properties={filteredProperties}
          numberOfColumns={numberOfColumns}
          isDark={isDark}
          searchQuery={searchQuery}
          onPropertyPress={handlePropertyPress}
          onClearSearch={clearSearch}
        />
      </ScrollView>

      <AuthRequiredModal
        visible={authRequiredVisible}
        onClose={handleCloseAuthRequired}
        onLogin={handleAuthRequiredLogin}
        onRegister={handleAuthRequiredRegister}
      />

      <LoginModal
        visible={loginVisible}
        onClose={handleCloseLogin}
        onLogin={handleLoginSuccess}
        onRegister={handleLoginOpenRegister}
      />

      <RegisterModal
        visible={registerVisible}
        onClose={handleCloseRegister}
        onRegister={handleRegistrationComplete}
        onSignIn={handleRegisterOpenLogin}
      />
    </SafeAreaView>
  );
}