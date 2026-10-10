
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import type { Property } from "@/app/types/properties/property";

export type ListingFilter = "all" | "sale" | "rent";

export type PropertyTypeFilter =
  | "all"
  | "residential"
  | "commercial"
  | "industrial"
  | "agricultural";

export type DetailedPropertyFilters = {
  district: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  maxBedrooms: string;
  minBathrooms: string;
  maxBathrooms: string;
};

export const EMPTY_DETAILED_FILTERS: DetailedPropertyFilters = {
  district: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  minBedrooms: "",
  maxBedrooms: "",
  minBathrooms: "",
  maxBathrooms: "",
};

type Props = {
  section?: "listing" | "details" | "all";
  isDark: boolean;
  listingFilter: ListingFilter;
  propertyTypeFilter: PropertyTypeFilter;
  propertyCount: number;
  availableProperties: Property[];
  onListingFilterPress: (filter: ListingFilter) => void;
  onPropertyTypeSelect: (type: PropertyTypeFilter) => void;
  onFiltersChange: (filters: DetailedPropertyFilters) => void;
};

const listingButtons: { value: ListingFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

const propertyTypeOptions: { value: PropertyTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "agricultural", label: "Agricultural" },
];

const getPropertyTypeLabel = (type: PropertyTypeFilter) =>
  propertyTypeOptions.find((option) => option.value === type)?.label ?? "All";

function NumberFilter({
  label,
  value,
  placeholder,
  isDark,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  isDark: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <View className="flex-1">
      <Text
        className={`mb-1.5 text-xs font-medium ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(text.replace(/[^\d.]/g, ""))}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#666666" : "#a3a3a3"}
        keyboardType="numeric"
        returnKeyType="done"
        className={`min-h-[46px] rounded-lg border px-3 py-2.5 text-sm ${
          isDark
            ? "border-[#333333] bg-[#202020] text-white"
            : "border-gray-200 bg-gray-50 text-gray-900"
        }`}
      />
    </View>
  );
}

function SelectFilter({
  label,
  value,
  options,
  placeholder,
  isDark,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  isDark: boolean;
  onSelect: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="flex-1">
      <Text
        className={`mb-1.5 text-xs font-medium ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {label}
      </Text>

      <Pressable
        onPress={() => setExpanded((previous) => !previous)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        className={`min-h-[46px] flex-row items-center justify-between rounded-lg border px-3 py-2.5 ${
          isDark
            ? "border-[#333333] bg-[#202020]"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`mr-2 flex-1 text-sm ${
            value
              ? isDark
                ? "text-white"
                : "text-gray-900"
              : isDark
                ? "text-gray-500"
                : "text-gray-400"
          }`}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={isDark ? "#b3b3b3" : "#737373"}
        />
      </Pressable>

      {expanded && (
        <View
          className={`mt-1 overflow-hidden rounded-lg border ${
            isDark
              ? "border-[#333333] bg-[#171717]"
              : "border-gray-200 bg-white"
          }`}
        >
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 170 }}
          >
            {[placeholder, ...options].map((option, index) => {
              const isPlaceholder = index === 0;
              const selected = !isPlaceholder && value === option;

              return (
                <Pressable
                  key={`${option}-${index}`}
                  onPress={() => {
                    onSelect(isPlaceholder ? "" : option);
                    setExpanded(false);
                  }}
                  className={`flex-row items-center justify-between border-b px-3 py-3 ${
                    isDark ? "border-[#292929]" : "border-gray-100"
                  } ${selected ? "bg-red-600" : ""}`}
                >
                  <Text
                    className={`flex-1 text-sm ${
                      selected
                        ? "font-semibold text-white"
                        : isPlaceholder
                          ? isDark
                            ? "text-gray-400"
                            : "text-gray-500"
                          : isDark
                            ? "text-gray-200"
                            : "text-gray-800"
                    }`}
                  >
                    {option}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark" size={17} color="#ffffff" />
                  )}
                </Pressable>
              );
            })}

            {options.length === 0 && (
              <Text
                className={`px-3 py-3 text-sm ${
                  isDark ? "text-gray-500" : "text-gray-500"
                }`}
              >
                No options available
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function PropertyFilters({
  section = "all",
  isDark,
  listingFilter,
  propertyTypeFilter,
  propertyCount,
  availableProperties,
  onListingFilterPress,
  onPropertyTypeSelect,
  onFiltersChange,
}: Props) {
  const [draftFilters, setDraftFilters] =
    useState<DetailedPropertyFilters>(EMPTY_DETAILED_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [openListingDropdown, setOpenListingDropdown] =
    useState<ListingFilter | null>(null);

  const districts = useMemo(
    () =>
      Array.from(
        new Set(
          availableProperties
            .map((property) => property.district?.trim())
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [availableProperties],
  );

  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          availableProperties
            .filter(
              (property) =>
                !draftFilters.district ||
                property.district === draftFilters.district,
            )
            .map((property) => property.area?.trim())
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [availableProperties, draftFilters.district],
  );

  const updateFilter = (
    key: keyof DetailedPropertyFilters,
    value: string,
  ) => {
    setDraftFilters((previous) => ({
      ...previous,
      [key]: value,
      ...(key === "district" ? { location: "" } : {}),
    }));
    // Do not apply the filters until Search is pressed.
  };

  const applyFilters = () => {
    onFiltersChange({ ...draftFilters });
    setFiltersVisible(false);
    setOpenListingDropdown(null);
  };

  const clearFilters = () => {
    setDraftFilters({ ...EMPTY_DETAILED_FILTERS });
    onFiltersChange({ ...EMPTY_DETAILED_FILTERS });
    setFiltersVisible(false);
    setOpenListingDropdown(null);
  };

  const hasDraftFilters = Object.values(draftFilters).some(Boolean);

  const renderListingButtons = () => (
    <View className="px-5 pb-3 pt-3">
      <View className="flex-row gap-2">
        {listingButtons.map((button) => {
          const selected = listingFilter === button.value;
          const dropdownOpen = openListingDropdown === button.value;

          return (
            <View key={button.value} className="relative flex-1">
              <View
                className={`flex-row items-center overflow-hidden rounded-xl ${
                  selected
                    ? "bg-red-600"
                    : isDark
                      ? "bg-[#181818]"
                      : "bg-gray-100"
                }`}
              >
                <Pressable
                  onPress={() => {
                    onListingFilterPress(button.value);
                    setOpenListingDropdown(null);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className="min-h-[46px] flex-1 items-center justify-center px-2 py-3"
                >
                  <Text
                    numberOfLines={1}
                    className={`text-sm font-semibold ${
                      selected
                        ? "text-white"
                        : isDark
                          ? "text-gray-200"
                          : "text-gray-800"
                    }`}
                  >
                    {button.label}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    setOpenListingDropdown((previous) =>
                      previous === button.value ? null : button.value,
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Choose property type for ${button.label}`}
                  className="min-h-[46px] items-center justify-center px-2"
                >
                  <Ionicons
                    name={dropdownOpen ? "chevron-up" : "chevron-down"}
                    size={15}
                    color={
                      selected
                        ? "#ffffff"
                        : isDark
                          ? "#d4d4d4"
                          : "#525252"
                    }
                  />
                </Pressable>
              </View>

              {dropdownOpen && (
                <View
                  className={`absolute left-0 right-0 top-[49px] z-50 overflow-hidden rounded-xl border shadow-lg ${
                    isDark
                      ? "border-[#333333] bg-[#171717]"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <ScrollView
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    style={{ maxHeight: 220 }}
                  >
                    {propertyTypeOptions.map((option) => {
                      const typeSelected =
                        propertyTypeFilter === option.value;

                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => {
                            onPropertyTypeSelect(option.value);
                            setOpenListingDropdown(null);
                          }}
                          className={`flex-row items-center justify-between border-b px-3 py-3 ${
                            isDark ? "border-[#292929]" : "border-gray-100"
                          } ${typeSelected ? "bg-red-600" : ""}`}
                        >
                          <Text
                            className={`text-sm ${
                              typeSelected
                                ? "font-semibold text-white"
                                : isDark
                                  ? "text-gray-200"
                                  : "text-gray-800"
                            }`}
                          >
                            {option.label}
                          </Text>
                          {typeSelected && (
                            <Ionicons
                              name="checkmark"
                              size={17}
                              color="#ffffff"
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderDetailedFilters = () => (
    <View className="px-5 pb-4 pt-3">
      <View
        className={`rounded-xl border ${
          isDark
            ? "border-[#292929] bg-[#141414]"
            : "border-gray-200 bg-white"
        }`}
      >
        <Pressable
          onPress={() => setFiltersVisible((previous) => !previous)}
          accessibilityRole="button"
          accessibilityLabel={
            filtersVisible ? "Hide detailed filters" : "Show detailed filters"
          }
          className="flex-row items-center justify-between px-3.5 py-3.5"
        >
          <View className="flex-row items-center">
            <Ionicons name="options-outline" size={19} color="#ef4444" />
            <Text
              className={`ml-2 text-sm font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Filter Properties
            </Text>
            {hasDraftFilters && (
              <View className="ml-2 rounded-full bg-red-600 px-2 py-0.5">
                <Text className="text-xs font-semibold text-white">
                  Edited
                </Text>
              </View>
            )}
          </View>
          <Ionicons
            name={filtersVisible ? "chevron-up" : "chevron-down"}
            size={19}
            color={isDark ? "#d4d4d4" : "#525252"}
          />
        </Pressable>

        {filtersVisible && (
          <View
            className={`gap-3 border-t px-3.5 pb-4 pt-3 ${
              isDark ? "border-[#292929]" : "border-gray-100"
            }`}
          >
            <Text
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Property type: {getPropertyTypeLabel(propertyTypeFilter)}
            </Text>

            <View className="flex-row gap-3">
              <SelectFilter
                label="District"
                value={draftFilters.district}
                options={districts}
                placeholder="All districts"
                isDark={isDark}
                onSelect={(value) => updateFilter("district", value)}
              />
              <SelectFilter
                label="Location"
                value={draftFilters.location}
                options={locations}
                placeholder="All locations"
                isDark={isDark}
                onSelect={(value) => updateFilter("location", value)}
              />
            </View>

            <View className="flex-row gap-3">
              <NumberFilter
                label="Min. Price"
                value={draftFilters.minPrice}
                placeholder="Minimum"
                isDark={isDark}
                onChange={(value) => updateFilter("minPrice", value)}
              />
              <NumberFilter
                label="Max. Price"
                value={draftFilters.maxPrice}
                placeholder="Maximum"
                isDark={isDark}
                onChange={(value) => updateFilter("maxPrice", value)}
              />
            </View>

            <View className="flex-row gap-3">
              <NumberFilter
                label="Min. Bedrooms"
                value={draftFilters.minBedrooms}
                placeholder="Minimum"
                isDark={isDark}
                onChange={(value) => updateFilter("minBedrooms", value)}
              />
              <NumberFilter
                label="Max. Bedrooms"
                value={draftFilters.maxBedrooms}
                placeholder="Maximum"
                isDark={isDark}
                onChange={(value) => updateFilter("maxBedrooms", value)}
              />
            </View>

            <View className="flex-row gap-3">
              <NumberFilter
                label="Min. Bathrooms"
                value={draftFilters.minBathrooms}
                placeholder="Minimum"
                isDark={isDark}
                onChange={(value) => updateFilter("minBathrooms", value)}
              />
              <NumberFilter
                label="Max. Bathrooms"
                value={draftFilters.maxBathrooms}
                placeholder="Maximum"
                isDark={isDark}
                onChange={(value) => updateFilter("maxBathrooms", value)}
              />
            </View>

            {/* These buttons are part of the scrolling form. */}
            <View className="mt-1 flex-row gap-3">
              <Pressable
                onPress={clearFilters}
                className={`min-h-[46px] flex-1 flex-row items-center justify-center rounded-lg border ${
                  isDark ? "border-[#404040]" : "border-gray-300"
                }`}
              >
                <Ionicons
                  name="refresh-outline"
                  size={17}
                  color={isDark ? "#e5e5e5" : "#404040"}
                />
                <Text
                  className={`ml-2 text-sm font-semibold ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  Clear
                </Text>
              </Pressable>

              <Pressable
                onPress={applyFilters}
                className="min-h-[46px] flex-1 flex-row items-center justify-center rounded-lg bg-red-600"
              >
                <Ionicons name="search-outline" size={17} color="#ffffff" />
                <Text className="ml-2 text-sm font-semibold text-white">
                  Search
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <Text
        className={`mt-3 text-sm font-medium ${
          isDark ? "text-gray-500" : "text-gray-600"
        }`}
      >
        {propertyCount} {propertyCount === 1 ? "property" : "properties"}
      </Text>
    </View>
  );

  if (section === "listing") {
    return renderListingButtons();
  }

  if (section === "details") {
    return renderDetailedFilters();
  }

  return (
    <View>
      {renderListingButtons()}
      {renderDetailedFilters()}
    </View>
  );
}
