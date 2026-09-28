

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import SideMenu from "@/app/components/sidebar/SideMenu";

import {
  fetchProperties,
  fetchPropertyImages,
  type Property,
  type PropertyMedia,
} from "@/app/services/propertyApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const IMAGE_HEIGHT = Math.min(
  320,
  SCREEN_WIDTH * 0.7,
);

export default function PropertyDetailsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const propertyId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  // ============================================================
  // STATE
  // ============================================================

  const [property, setProperty] =
    useState<Property | null>(null);

  const [images, setImages] =
    useState<PropertyMedia[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [imagesLoading, setImagesLoading] =
    useState(true);

  const [imageIndex, setImageIndex] =
    useState(0);

  const [menuVisible, setMenuVisible] =
    useState(false);

  // ============================================================
  // LOAD PROPERTY
  // ============================================================

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const properties =
          await fetchProperties();

        const foundProperty =
          properties.find(
            (item) =>
              String(item.id) ===
              String(propertyId),
          );

        setProperty(foundProperty ?? null);
      } catch (error) {
        console.error(
          "Failed to load property:",
          error,
        );

        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    void loadProperty();
  }, [propertyId]);

  // ============================================================
  // LOAD PROPERTY IMAGES
  // ============================================================

  useEffect(() => {
    const loadImages = async () => {
      if (!propertyId) {
        setImagesLoading(false);
        return;
      }

      try {
        setImagesLoading(true);

        const result =
          await fetchPropertyImages(
            propertyId,
          );

        setImages(result);
      } catch (error) {
        console.error(
          "Failed to load property images:",
          error,
        );

        setImages([]);
      } finally {
        setImagesLoading(false);
      }
    };

    void loadImages();
  }, [propertyId]);

  // ============================================================
  // PROPERTY VALUES
  // ============================================================

  const locationText = useMemo(() => {
    if (!property) {
      return "";
    }

    const location =
      property.location;

    if (
      typeof location === "string"
    ) {
      return location;
    }

    if (
      location &&
      typeof location === "object"
    ) {
      const locationObject =
        location as Record<
          string,
          unknown
        >;

      return [
        locationObject.area,
        locationObject.city,
        locationObject.district,
        locationObject.region,
        locationObject.country,
      ]
        .filter(Boolean)
        .join(", ");
    }

    return "";
  }, [property]);

  const listingType = useMemo(() => {
    if (!property) {
      return "";
    }

    return String(
      property.listingType ??
        property.listing_type ??
        property.status ??
        "",
    );
  }, [property]);

  const propertyType = useMemo(() => {
    if (!property) {
      return "";
    }

    return String(
      property.propertyType ??
        property.property_type ??
        property.type ??
        "",
    );
  }, [property]);

  const description = useMemo(() => {
    if (!property) {
      return "";
    }

    return String(
      property.description ?? "",
    );
  }, [property]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getValue = (
    propertyValue: Property,
    ...keys: string[]
  ): string => {
    const object =
      propertyValue as unknown as Record<
        string,
        unknown
      >;

    for (const key of keys) {
      const value = object[key];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return String(value);
      }
    }

    return "";
  };

  const formatBoolean = (
    value: unknown,
  ): string => {
    if (value === true) {
      return "Available";
    }

    if (value === false) {
      return "Unavailable";
    }

    return String(value ?? "");
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    router.back();
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0d0d0d"
        />

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color="#dc2626"
          />

          <Text className="mt-4 text-sm text-zinc-400">
            Loading property...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // PROPERTY NOT FOUND
  // ============================================================

  if (!property) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0d0d]">
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0d0d0d"
        />

        <View className="flex-row items-center border-b border-zinc-800 px-4 py-3">
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#fff"
            />
          </Pressable>

          <Text className="ml-3 text-xl font-bold text-white">
            Property
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="home-outline"
            size={60}
            color="#555"
          />

          <Text className="mt-5 text-center text-xl font-bold text-white">
            Property not found
          </Text>

          <Text className="mt-2 text-center text-sm text-zinc-500">
            The property may no longer be
            available.
          </Text>

          <Pressable
            onPress={handleBack}
            className="mt-6 rounded-xl bg-red-600 px-6 py-3"
          >
            <Text className="font-bold text-white">
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // PROPERTY DETAILS
  // ============================================================

  const bedrooms = getValue(
    property,
    "beds",
    "bedrooms",
    "rooms",
  );

  const bathrooms = getValue(
    property,
    "baths",
    "bathrooms",
  );

  const views = getValue(
    property,
    "views",
    "view_count",
  );

  const buildingSize = getValue(
    property,
    "building_size",
    "buildingSize",
    "size",
    "area_size",
  );

  const yearBuilt = getValue(
    property,
    "year_built",
    "yearBuilt",
  );

  const zone = getValue(
    property,
    "zone",
    "zone_type",
  );

  const titleDeed = getValue(
    property,
    "title_deeds",
    "titleDeed",
    "title_deed",
  );

  const masterBedroom = getValue(
    property,
    "master_bedroom",
    "masterBedroom",
  );

  const amenities =
    Array.isArray(
      (property as any).amenities,
    )
      ? (property as any).amenities
      : [];

  // ============================================================
  // IMAGE FALLBACK
  // ============================================================

  const displayImages =
    images.length > 0
      ? images
      : property.image
        ? [
            {
              id: "main",
              url: property.image,
              description: null,
              collection: "images",
            },
          ]
        : [];

  return (
    <SafeAreaView
      className="flex-1 bg-[#0d0d0d]"
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0d0d0d"
      />

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <View className="flex-row items-center justify-between border-b border-zinc-800 bg-[#0d0d0d] px-4 py-3">
        <View className="flex-row items-center">
          <Pressable
            onPress={handleBack}
            className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#fff"
            />
          </Pressable>

          <View className="ml-3">
            <Text
              className="text-lg font-bold text-white"
              numberOfLines={1}
            >
              Property Details
            </Text>

            <Text className="text-xs text-zinc-500">
              Property #{property.id}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            setMenuVisible(true)
          }
          className="h-11 w-11 items-center justify-center rounded-full bg-[#171717]"
        >
          <Ionicons
            name="menu-outline"
            size={26}
            color="#fff"
          />
        </Pressable>
      </View>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
      >
        {/* ==================================================== */}
        {/* IMAGE GALLERY */}
        {/* ==================================================== */}

        <View className="bg-[#111]">
          {imagesLoading ? (
            <View
              style={{
                height: IMAGE_HEIGHT,
              }}
              className="items-center justify-center"
            >
              <ActivityIndicator
                size="large"
                color="#dc2626"
              />

              <Text className="mt-3 text-sm text-zinc-500">
                Loading property images...
              </Text>
            </View>
          ) : displayImages.length >
            0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={
                  false
                }
                onMomentumScrollEnd={(
                  event,
                ) => {
                  const index =
                    Math.round(
                      event.nativeEvent
                        .contentOffset
                        .x /
                        SCREEN_WIDTH,
                    );

                  setImageIndex(index);
                }}
              >
                {displayImages.map(
                  (image) => (
                    <View
                      key={String(
                        image.id,
                      )}
                      style={{
                        width:
                          SCREEN_WIDTH,
                        height:
                          IMAGE_HEIGHT,
                      }}
                    >
                      <Image
                        source={{
                          uri: image.url,
                        }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />

                      {image.description ? (
                        <View className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-3">
                          <Text className="text-sm text-white">
                            {
                              image.description
                            }
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ),
                )}
              </ScrollView>

              {/* IMAGE COUNTER */}

              <View className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1.5">
                <Text className="text-xs font-semibold text-white">
                  {imageIndex + 1} /{" "}
                  {displayImages.length}
                </Text>
              </View>

              {/* DOTS */}

              {displayImages.length >
                1 && (
                <View className="absolute bottom-3 left-0 right-0 flex-row items-center justify-center">
                  {displayImages.map(
                    (
                      image,
                      index,
                    ) => (
                      <View
                        key={`dot-${String(
                          image.id,
                        )}`}
                        className={`mx-1 h-2 rounded-full ${
                          index ===
                          imageIndex
                            ? "w-5 bg-red-500"
                            : "w-2 bg-white/50"
                        }`}
                      />
                    ),
                  )}
                </View>
              )}
            </>
          ) : (
            <View
              style={{
                height: IMAGE_HEIGHT,
              }}
              className="items-center justify-center bg-[#222]"
            >
              <Ionicons
                name="image-outline"
                size={55}
                color="#555"
              />

              <Text className="mt-3 text-sm text-zinc-500">
                No property images
              </Text>
            </View>
          )}
        </View>

        {/* ==================================================== */}
        {/* BASIC INFORMATION */}
        {/* ==================================================== */}

        <View className="px-4 pt-5">
          {/* LISTING STATUS */}

          <View className="flex-row items-center justify-between">
            <View className="rounded-md bg-red-600 px-3 py-1.5">
              <Text className="text-xs font-bold text-white">
                {listingType || "For Sale"}
              </Text>
            </View>

            {property.systemStatus ? (
              <Text className="text-sm font-medium text-zinc-400">
                {property.systemStatus}
              </Text>
            ) : null}
          </View>

          {/* TITLE */}

          <Text className="mt-4 text-2xl font-bold text-white">
            {property.title ||
              locationText ||
              "Property"}
          </Text>

          {/* LOCATION */}

          <View className="mt-3 flex-row items-start">
            <Ionicons
              name="location-outline"
              size={20}
              color="#ef4444"
            />

            <View className="ml-2 flex-1">
              <Text className="text-base font-semibold text-zinc-300">
                {locationText ||
                  "Location unavailable"}
              </Text>

              {zone ? (
                <Text className="mt-1 text-sm text-zinc-500">
                  Zone: {zone}
                </Text>
              ) : null}
            </View>
          </View>

          {/* PRICE */}

          <Text className="mt-5 text-2xl font-bold text-white">
            {property.price ||
              "Price on request"}
          </Text>

          {/* ================================================= */}
          {/* PROPERTY HIGHLIGHTS */}
          {/* ================================================= */}

          <View className="mt-7">
            <Text className="mb-4 text-xl font-bold text-white">
              Property Highlights
            </Text>

            <View className="flex-row flex-wrap">
              {/* VIEWS */}

              {views ? (
                <Highlight
                  icon="eye-outline"
                  value={views}
                  label="Views"
                />
              ) : null}

              {/* BEDROOMS */}

              {bedrooms ? (
                <Highlight
                  icon="bed-outline"
                  value={bedrooms}
                  label="Beds"
                />
              ) : null}

              {/* BATHROOMS */}

              {bathrooms ? (
                <Highlight
                  icon="water-outline"
                  value={bathrooms}
                  label="Baths"
                />
              ) : null}

              {/* SIZE */}

              {buildingSize ? (
                <Highlight
                  icon="resize-outline"
                  value={`${buildingSize}m²`}
                  label="Area"
                />
              ) : null}

              {/* MASTER BEDROOM */}

              {masterBedroom ? (
                <Highlight
                  icon="bed-outline"
                  value={
                    masterBedroom
                  }
                  label=""
                  wide
                />
              ) : null}

              {/* TITLE DEED */}

              {titleDeed ? (
                <Highlight
                  icon="document-text-outline"
                  value={titleDeed}
                  label="Title Deed"
                  wide
                />
              ) : null}
            </View>
          </View>

          {/* ================================================= */}
          {/* PROPERTY DETAILS */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text className="mb-4 text-xl font-bold text-white">
              Property Details
            </Text>

            <View className="overflow-hidden rounded-xl border border-[#292929] bg-[#171717]">
              <DetailRow
                icon="location-outline"
                label="Zone"
                value={
                  zone ||
                  "Not specified"
                }
              />

              <DetailRow
                icon="business-outline"
                label="Type"
                value={
                  propertyType ||
                  "Not specified"
                }
              />

              <DetailRow
                icon="calendar-outline"
                label="Built"
                value={
                  yearBuilt ||
                  "Not specified"
                }
                last
              />
            </View>
          </View>

          {/* ================================================= */}
          {/* DESCRIPTION */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text className="mb-4 text-xl font-bold text-white">
              Description
            </Text>

            <View className="rounded-xl border border-[#292929] bg-[#171717] p-4">
              <Text className="text-sm leading-6 text-zinc-300">
                {description ||
                  "No description available for this property."}
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* AMENITIES */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text className="mb-4 text-xl font-bold text-white">
              Amenities
            </Text>

            {amenities.length >
            0 ? (
              <View className="flex-row flex-wrap">
                {amenities.map(
                  (
                    amenity: unknown,
                    index: number,
                  ) => {
                    const value =
                      typeof amenity ===
                      "string"
                        ? amenity
                        : String(
                            (
                              amenity as Record<
                                string,
                                unknown
                              >
                            )?.name ??
                              amenity,
                          );

                    return (
                      <View
                        key={`${value}-${index}`}
                        className="mb-2 mr-2 flex-row items-center rounded-lg border border-[#292929] bg-[#171717] px-3 py-2"
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={18}
                          color="#ef4444"
                        />

                        <Text className="ml-2 text-sm text-zinc-300">
                          {value}
                        </Text>
                      </View>
                    );
                  },
                )}
              </View>
            ) : (
              <View className="rounded-xl border border-[#292929] bg-[#171717] p-4">
                <Text className="text-sm text-zinc-500">
                  No amenities listed for
                  this property.
                </Text>
              </View>
            )}
          </View>

          {/* ================================================= */}
          {/* VIDEOS */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text className="mb-4 text-xl font-bold text-white">
              Videos
            </Text>

            <View className="items-center rounded-xl border border-[#292929] bg-[#171717] px-5 py-8">
              <Ionicons
                name="videocam-outline"
                size={42}
                color="#555"
              />

              <Text className="mt-3 text-sm text-zinc-500">
                Property has no videos
                to display.
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* MAKE OFFER */}
          {/* ================================================= */}

          <Pressable
            onPress={() => {}}
            className="mt-8 w-full items-center justify-center rounded-xl bg-red-600 px-5 py-4 active:bg-red-700"
          >
            <Text className="text-base font-bold text-white">
              Make Offer
            </Text>
          </Pressable>

          {/* ================================================= */}
          {/* OPEN HOUSES */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text className="mb-4 text-xl font-bold text-white">
              Open Houses
            </Text>

            <View className="rounded-xl border border-[#292929] bg-[#171717] p-5">
              {property.isOpenHouse ? (
                <View className="flex-row items-center">
                  <Ionicons
                    name="calendar-outline"
                    size={23}
                    color="#ef4444"
                  />

                  <Text className="ml-3 text-sm text-zinc-300">
                    Open house available
                    for this property.
                  </Text>
                </View>
              ) : (
                <Text className="text-sm text-zinc-500">
                  No open houses scheduled
                  at this time.
                </Text>
              )}
            </View>
          </View>

          {/* ================================================= */}
          {/* MAP */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text className="mb-4 text-xl font-bold text-white">
              Map
            </Text>

            <View className="h-56 items-center justify-center rounded-xl border border-[#292929] bg-[#171717]">
              <Ionicons
                name="map-outline"
                size={50}
                color="#555"
              />

              <Text className="mt-3 text-sm text-zinc-500">
                Property map
              </Text>

              <Text className="mt-1 px-6 text-center text-xs text-zinc-600">
                {locationText ||
                  "Location coordinates are not available."}
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* LISTING AGENT */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text className="mb-4 text-xl font-bold text-white">
              Listing Agent
            </Text>

            <View className="rounded-xl border border-[#292929] bg-[#171717] p-4">
              <View className="flex-row items-center">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#292929]">
                  <Ionicons
                    name="person-outline"
                    size={28}
                    color="#777"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-base font-bold text-white">
                    {getValue(
                      property,
                      "agent_name",
                      "agentName",
                    ) ||
                      "Listing Agent"}
                  </Text>

                  <Text className="mt-1 text-sm text-zinc-500">
                    Property Agent
                  </Text>
                </View>
              </View>

              {/* AGENT CONTACT */}

              <View className="mt-4 border-t border-[#292929] pt-4">
                <View className="flex-row items-center">
                  <Ionicons
                    name="mail-outline"
                    size={19}
                    color="#888"
                  />

                  <Text className="ml-3 text-sm text-zinc-400">
                    {getValue(
                      property,
                      "agent_email",
                      "agentEmail",
                    ) ||
                      "No email available"}
                  </Text>
                </View>

                <View className="mt-3 flex-row items-center">
                  <Ionicons
                    name="call-outline"
                    size={19}
                    color="#888"
                  />

                  <Text className="ml-3 text-sm text-zinc-400">
                    {getValue(
                      property,
                      "agent_phone",
                      "agentPhone",
                    ) ||
                      "No phone available"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ====================================================== */}
      {/* SIDE MENU */}
      {/* ====================================================== */}

      <SideMenu
        visible={menuVisible}
        onClose={() =>
          setMenuVisible(false)
        }
      />
    </SafeAreaView>
  );
}

// ============================================================
// HIGHLIGHT COMPONENT
// ============================================================

interface HighlightProps {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];
  value: string;
  label: string;
  wide?: boolean;
}

function Highlight({
  icon,
  value,
  label,
  wide = false,
}: HighlightProps) {
  return (
    <View
      className={`mb-2 mr-2 rounded-xl border border-[#292929] bg-[#171717] px-3 py-3 ${
        wide ? "flex-1" : "min-w-[30%]"
      }`}
    >
      <Ionicons
        name={icon}
        size={20}
        color="#ef4444"
      />

      <Text
        className="mt-2 text-sm font-bold text-white"
        numberOfLines={2}
      >
        {value}
      </Text>

      {label ? (
        <Text
          className="mt-1 text-xs text-zinc-500"
          numberOfLines={2}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

// ============================================================
// DETAIL ROW
// ============================================================

interface DetailRowProps {
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];
  label: string;
  value: string;
  last?: boolean;
}

function DetailRow({
  icon,
  label,
  value,
  last = false,
}: DetailRowProps) {
  return (
    <View
      className={`flex-row items-center px-4 py-4 ${
        last
          ? ""
          : "border-b border-[#292929]"
      }`}
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-[#242424]">
        <Ionicons
          name={icon}
          size={18}
          color="#ef4444"
        />
      </View>

      <Text className="ml-3 flex-1 text-sm text-zinc-500">
        {label}
      </Text>

      <Text
        className="max-w-[55%] text-right text-sm font-semibold text-zinc-200"
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}