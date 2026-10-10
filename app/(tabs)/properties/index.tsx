
// app/(tabs)/properties/index.tsx

import React, { useCallback, useMemo, useState } from "react";
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
import PropertyFilters, {
  type DetailedPropertyFilters,
} from "@/app/components/properties/home/PropertyFilters";

import { usePropertiesScreen } from "@/app/hooks/properties/usePropertiesScreen";
import { getPropertyId } from "@/app/utils/properties/propertiesScreen.utils";

import type { Property } from "@/app/types/properties/property";

// ============================================================
// PROPERTY FILTER FIELD TYPES
// ============================================================

type PropertyFilterFields = Property & {
  district?: string | null;
  area?: string | null;
  location?: string | null;
  priceValue?: number | string | null;
  price?: number | string | null;
  beds?: number | string | null;
  baths?: number | string | null;
};

// ============================================================
// VALUE HELPERS
// ============================================================

const getText = (value: unknown): string =>
  value == null ? "" : String(value).trim();

const getNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);

  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);

  return Number.isFinite(parsed) ? parsed : null;
};

// ============================================================
// PROPERTY FIELD HELPERS
// ============================================================

const getPropertyDistrict = (property: Property): string => {
  const item = property as PropertyFilterFields;
  return getText(item.district);
};

const getPropertyLocation = (property: Property): string => {
  const item = property as PropertyFilterFields;

  return getText(item.area) || getText(item.location);
};

const getPropertyPrice = (property: Property): number | null => {
  const item = property as PropertyFilterFields;

  return getNumber(item.priceValue) ?? getNumber(item.price);
};

const getPropertyBedrooms = (property: Property): number | null => {
  const item = property as PropertyFilterFields;

  return getNumber(item.beds);
};

const getPropertyBathrooms = (property: Property): number | null => {
  const item = property as PropertyFilterFields;

  return getNumber(item.baths);
};

// ============================================================
// MINIMUM / MAXIMUM RANGE MATCHING
// ============================================================

const matchesRange = (
  value: number | null,
  minimum: string,
  maximum: string,
): boolean => {
  const min = minimum.trim() === "" ? null : Number(minimum);
  const max = maximum.trim() === "" ? null : Number(maximum);

  if (min !== null && !Number.isFinite(min)) {
    return true;
  }

  if (max !== null && !Number.isFinite(max)) {
    return true;
  }

  if (min !== null && value === null) {
    return false;
  }

  if (max !== null && value === null) {
    return false;
  }

  if (min !== null && value !== null && value < min) {
    return false;
  }

  if (max !== null && value !== null && value > max) {
    return false;
  }

  return true;
};

// ============================================================
// INITIAL DETAILED FILTER VALUES
// ============================================================

const INITIAL_FILTERS: DetailedPropertyFilters = {
  district: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  minBedrooms: "",
  maxBedrooms: "",
  minBathrooms: "",
  maxBathrooms: "",
};

// ============================================================
// PROPERTIES SCREEN
// ============================================================

export default function PropertiesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { isDark } = useTheme();
  const { isLoggedIn } = useAuth();

  const params = useLocalSearchParams<{
    category?: string | string[];
  }>();

  // ==========================================================
  // PROPERTIES SCREEN DATA AND ACTIONS
  // ==========================================================

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
    filteredProperties,
    handleRefresh,
    clearSearch,
    handleListingFilterPress,
    handlePropertyTypeSelect,
  } = screen;

  // ==========================================================
  // DETAILED FILTER STATE
  // ==========================================================

  const [detailedFilters, setDetailedFilters] =
    useState<DetailedPropertyFilters>({
      ...INITIAL_FILTERS,
    });

  // ==========================================================
  // AUTHENTICATION STATE
  // ==========================================================

  const [pendingProperty, setPendingProperty] =
    useState<Property | null>(null);

  const [authRequiredVisible, setAuthRequiredVisible] =
    useState(false);

  const [loginVisible, setLoginVisible] = useState(false);

  const [registerVisible, setRegisterVisible] = useState(false);

  // ==========================================================
  // RESPONSIVE PROPERTY GRID
  // ==========================================================

  const numberOfColumns = width >= 700 ? 2 : 1;

  const screenTitle = selectedCategory ?? "Properties";

  // ==========================================================
  // FILTER PROPERTIES
  //
  // filteredProperties already includes the active listing and
  // property-type selections from usePropertiesScreen.
  //
  // The detailed filters narrow those results further.
  // ==========================================================

  const propertiesAfterDetailedFilters = useMemo(() => {
    return filteredProperties.filter((property) => {
      const district = getPropertyDistrict(property);
      const location = getPropertyLocation(property);

      if (
        detailedFilters.district &&
        district.toLowerCase() !==
          detailedFilters.district.trim().toLowerCase()
      ) {
        return false;
      }

      if (
        detailedFilters.location &&
        location.toLowerCase() !==
          detailedFilters.location.trim().toLowerCase()
      ) {
        return false;
      }

      if (
        !matchesRange(
          getPropertyPrice(property),
          detailedFilters.minPrice,
          detailedFilters.maxPrice,
        )
      ) {
        return false;
      }

      if (
        !matchesRange(
          getPropertyBedrooms(property),
          detailedFilters.minBedrooms,
          detailedFilters.maxBedrooms,
        )
      ) {
        return false;
      }

      if (
        !matchesRange(
          getPropertyBathrooms(property),
          detailedFilters.minBathrooms,
          detailedFilters.maxBathrooms,
        )
      ) {
        return false;
      }

      return true;
    });
  }, [filteredProperties, detailedFilters]);

  // ==========================================================
  // OPEN PROPERTY DETAILS
  // ==========================================================

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

  // ==========================================================
  // PROPERTY CARD PRESS
  // ==========================================================

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

  // ==========================================================
  // AUTHENTICATION REQUIRED MODAL ACTIONS
  // ==========================================================

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

  // ==========================================================
  // LOGIN SUCCESS
  // ==========================================================

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

  // ==========================================================
  // REGISTRATION COMPLETED
  // ==========================================================

  const handleRegistrationComplete = useCallback(() => {
    // Registration does not automatically authenticate the user.
    setRegisterVisible(false);
    setLoginVisible(true);
  }, []);

  // ==========================================================
  // CLOSE AUTHENTICATION MODALS
  // ==========================================================

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

  // ==========================================================
  // DETAILED FILTER CHANGES
  //
  // PropertyFilters should call this callback when the user
  // presses Search or Clear, not on every draft-field edit.
  // ==========================================================

  const handleDetailedFiltersChange = useCallback(
    (nextFilters: DetailedPropertyFilters) => {
      setDetailedFilters({ ...nextFilters });
    },
    [],
  );

  // ==========================================================
  // LISTING BUTTON PRESS
  // ==========================================================

  const handleListingButtonPress = useCallback(
    (filter: typeof listingFilter) => {
      handleListingFilterPress(filter);

      setDetailedFilters({ ...INITIAL_FILTERS });
    },
    [handleListingFilterPress],
  );

  // ==========================================================
  // PROPERTY TYPE SELECTION
  // ==========================================================

  const handlePropertyTypeDropdownSelect = useCallback(
    (type: typeof propertyTypeFilter) => {
      handlePropertyTypeSelect(type);

      setDetailedFilters({ ...INITIAL_FILTERS });
    },
    [handlePropertyTypeSelect],
  );

  // ==========================================================
  // CLEAR SEARCH AND DETAILED FILTERS
  // ==========================================================

  const handleClearAllFilters = useCallback(() => {
    setDetailedFilters({ ...INITIAL_FILTERS });

    clearSearch();
    setSearchQuery("");
  }, [clearSearch, setSearchQuery]);

  // ==========================================================
  // PULL-TO-REFRESH
  // ==========================================================

  const handleScreenRefresh = useCallback(async () => {
    await handleRefresh();
  }, [handleRefresh]);

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <PropertiesLoadingState
        isDark={isDark}
        screenTitle={screenTitle}
      />
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error && properties.length === 0) {
    return (
      <PropertiesErrorState
        isDark={isDark}
        screenTitle={screenTitle}
        error={error}
        refreshing={refreshing}
        onRefresh={handleScreenRefresh}
      />
    );
  }

  // ==========================================================
  // MAIN SCREEN
  // ==========================================================

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

      {/* ====================================================== */}
      {/* FIXED HEADER                                           */}
      {/*                                                        */}
      {/* PropertiesHeader displays the screen title and the     */}
      {/* All / For Sale / For Rent buttons.                     */}
      {/* ====================================================== */}

      <PropertiesHeader
        isDark={isDark}
        screenTitle={screenTitle}
        isAllPropertiesMode={isAllPropertiesMode}
        listingFilter={listingFilter}
        propertyTypeFilter={propertyTypeFilter}
        propertyCount={propertiesAfterDetailedFilters.length}
        availableProperties={filteredProperties}
        onListingFilterPress={handleListingButtonPress}
        onPropertyTypeSelect={handlePropertyTypeDropdownSelect}
        onDetailedFiltersChange={handleDetailedFiltersChange}
      />

      {/* ====================================================== */}
      {/* MAIN SCROLL AREA                                       */}
      {/*                                                        */}
      {/* The detailed filter, Search/Clear buttons and property */}
      {/* grid all live inside this single ScrollView.           */}
      {/* ====================================================== */}

      <ScrollView
        className={
          isDark ? "flex-1 bg-[#0d0d0d]" : "flex-1 bg-white"
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleScreenRefresh}
            tintColor="#ef4444"
            colors={["#ef4444"]}
          />
        }
        contentContainerStyle={{
          paddingBottom: 30,
          flexGrow: 1,
        }}
      >
        {/* ==================================================== */}
        {/* DEEP / DETAILED FILTER                               */}
        {/* ==================================================== */}

        <PropertyFilters
          section="details"
          isDark={isDark}
          listingFilter={listingFilter}
          propertyTypeFilter={propertyTypeFilter}
          propertyCount={propertiesAfterDetailedFilters.length}
          availableProperties={filteredProperties}
          onListingFilterPress={handleListingButtonPress}
          onPropertyTypeSelect={handlePropertyTypeDropdownSelect}
          onFiltersChange={handleDetailedFiltersChange}
        />

        {/* ==================================================== */}
        {/* PROPERTY GRID                                        */}
        {/* ==================================================== */}

        <PropertiesGrid
          properties={propertiesAfterDetailedFilters}
          numberOfColumns={numberOfColumns}
          isDark={isDark}
          searchQuery=""
          onPropertyPress={handlePropertyPress}
          onClearSearch={handleClearAllFilters}
        />
      </ScrollView>

      {/* ====================================================== */}
      {/* AUTHENTICATION REQUIRED MODAL                          */}
      {/* ====================================================== */}

      <AuthRequiredModal
        visible={authRequiredVisible}
        onClose={handleCloseAuthRequired}
        onLogin={handleAuthRequiredLogin}
        onRegister={handleAuthRequiredRegister}
      />

      {/* ====================================================== */}
      {/* LOGIN MODAL                                           */}
      {/* ====================================================== */}

      <LoginModal
        visible={loginVisible}
        onClose={handleCloseLogin}
        onLogin={handleLoginSuccess}
        onRegister={handleLoginOpenRegister}
      />

      {/* ====================================================== */}
      {/* REGISTER MODAL                                        */}
      {/* ====================================================== */}

      <RegisterModal
        visible={registerVisible}
        onClose={handleCloseRegister}
        onRegister={handleRegistrationComplete}
        onSignIn={handleRegisterOpenLogin}
      />
    </SafeAreaView>
  );
}
