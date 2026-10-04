import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
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

import {
  VideoView,
  useVideoPlayer,
} from "expo-video";

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";

import SideMenu from "@/app/components/sidebar/SideMenu";

import {
  fetchProperties,
  fetchPropertyImages,
  fetchPropertyVideos,
  type Property,
  type PropertyMedia,
} from "@/app/services/propertyApi";

const { width: SCREEN_WIDTH } =
  Dimensions.get("window");

const IMAGE_HEIGHT = Math.min(
  320,
  SCREEN_WIDTH * 0.7,
);

const VIDEO_HEIGHT = Math.min(
  240,
  SCREEN_WIDTH * 0.56,
);

// ============================================================
// VIDEO PLAYER COMPONENT
// ============================================================

interface PropertyVideoProps {
  video: PropertyMedia;
}

function PropertyVideo({
  video,
}: PropertyVideoProps) {
  const player = useVideoPlayer(
    video.url,
    (player) => {
      player.loop = false;
    },
  );

  return (
    <View className="mb-4 overflow-hidden rounded-xl border border-[#292929] bg-black">
      <VideoView
        player={player}
        style={{
          width: "100%",
          height: VIDEO_HEIGHT,
        }}
        nativeControls
        contentFit="contain"
      />

      {video.description ? (
        <View className="bg-[#171717] px-4 py-3">
          <Text className="text-sm text-zinc-300">
            {video.description}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ============================================================
// MAIN SCREEN
// ============================================================

export default function PropertyDetailsScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const propertyId = Array.isArray(
    params.id,
  )
    ? params.id[0]
    : params.id;

  // ============================================================
  // STATE
  // ============================================================

  const [property, setProperty] =
    useState<Property | null>(null);

  const [images, setImages] =
    useState<PropertyMedia[]>([]);

  const [videos, setVideos] =
    useState<PropertyMedia[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [imagesLoading, setImagesLoading] =
    useState(true);

  const [videosLoading, setVideosLoading] =
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

        setProperty(
          foundProperty ?? null,
        );
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
  // LOAD PROPERTY VIDEOS
  // ============================================================

  useEffect(() => {
    const loadVideos = async () => {
      if (!propertyId) {
        setVideosLoading(false);
        return;
      }

      try {
        setVideosLoading(true);

        const result =
          await fetchPropertyVideos(
            propertyId,
          );

        console.log(
          "Loaded property videos:",
          result,
        );

        setVideos(result);
      } catch (error) {
        console.error(
          "Failed to load property videos:",
          error,
        );

        setVideos([]);
      } finally {
        setVideosLoading(false);
      }
    };

    void loadVideos();
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

  // ============================================================
  // MAP COORDINATES
  // ============================================================

  const coordinates = useMemo(() => {
    if (!property) {
      return null;
    }

    const object =
      property as unknown as Record<
        string,
        unknown
      >;

    const location =
      object.location &&
      typeof object.location === "object"
        ? (object.location as Record<
            string,
            unknown
          >)
        : null;

    const latitudeValue =
      location?.latitude ??
      location?.lat ??
      object.latitude ??
      object.lat;

    const longitudeValue =
      location?.longitude ??
      location?.lng ??
      location?.lon ??
      object.longitude ??
      object.lng;

    const latitude =
      Number(latitudeValue);

    const longitude =
      Number(longitudeValue);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null;
    }

    return {
      latitude,
      longitude,
    };
  }, [property]);

  // ============================================================
  // MAKE OFFER
  // ============================================================

  const handleMakeOffer = async () => {
    if (!propertyId) {
      console.error(
        "Cannot make offer: property ID is missing.",
      );
      return;
    }

    /*
     * The "19" in this URL is constant.
     *
     * Only the final number changes according
     * to the property ID.
     *
     * Example:
     *
     * Property 6:
     * https://dev.valuationsafrica.mw/property/makeoffer/19/6
     *
     * Property 7:
     * https://dev.valuationsafrica.mw/property/makeoffer/19/7
     */
    const makeOfferUrl =
      `https://dev.valuationsafrica.mw/property/makeoffer/19/${propertyId}`;

    try {
      const supported =
        await Linking.canOpenURL(
          makeOfferUrl,
        );

      if (!supported) {
        console.error(
          "Cannot open Make Offer URL:",
          makeOfferUrl,
        );
        return;
      }

      /*
       * This opens the external website
       * outside the Expo application.
       */
      await Linking.openURL(
        makeOfferUrl,
      );
    } catch (error) {
      console.error(
        "Failed to open Make Offer website:",
        error,
      );
    }
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
      (
        property as unknown as Record<
          string,
          unknown
        >
      ).amenities,
    )
      ? (
          (
            property as unknown as Record<
              string,
              unknown
            >
          ).amenities as unknown[]
        )
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

              <View className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1.5">
                <Text className="text-xs font-semibold text-white">
                  {imageIndex + 1} /{" "}
                  {displayImages.length}
                </Text>
              </View>

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
          <View className="flex-row items-center justify-between">
            <View className="rounded-md bg-red-600 px-3 py-1.5">
              <Text className="text-xs font-bold text-white">
                {listingType ||
                  "For Sale"}
              </Text>
            </View>

            {property.systemStatus ? (
              <Text className="text-sm font-medium text-zinc-400">
                {property.systemStatus}
              </Text>
            ) : null}
          </View>

          <Text className="mt-4 text-2xl font-bold text-white">
            {property.title ||
              locationText ||
              "Property"}
          </Text>

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
              {views ? (
                <Highlight
                  icon="eye-outline"
                  value={views}
                  label="Views"
                />
              ) : null}

              {bedrooms ? (
                <Highlight
                  icon="bed-outline"
                  value={bedrooms}
                  label="Beds"
                />
              ) : null}

              {bathrooms ? (
                <Highlight
                  icon="water-outline"
                  value={bathrooms}
                  label="Baths"
                />
              ) : null}

              {buildingSize ? (
                <Highlight
                  icon="resize-outline"
                  value={`${buildingSize}m²`}
                  label="Area"
                />
              ) : null}

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

            {amenities.length > 0 ? (
              <View className="flex-row flex-wrap">
                {amenities.map(
                  (
                    amenity,
                    index,
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
          {/* PROPERTY VIDEOS */}
          {/* ================================================= */}

          <View className="mt-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-white">
                Property Videos
              </Text>

              {videos.length > 0 ? (
                <Text className="text-sm text-zinc-500">
                  {videos.length}{" "}
                  {videos.length === 1
                    ? "video"
                    : "videos"}
                </Text>
              ) : null}
            </View>

            {videosLoading ? (
              <View className="items-center rounded-xl border border-[#292929] bg-[#171717] py-10">
                <ActivityIndicator
                  size="small"
                  color="#dc2626"
                />

                <Text className="mt-3 text-sm text-zinc-500">
                  Loading property videos...
                </Text>
              </View>
            ) : videos.length >
              0 ? (
              <View>
                {videos.map(
                  (video) => (
                    <PropertyVideo
                      key={String(
                        video.id,
                      )}
                      video={video}
                    />
                  ),
                )}
              </View>
            ) : (
              <View className="items-center rounded-xl border border-[#292929] bg-[#171717] px-5 py-8">
                <Ionicons
                  name="videocam-outline"
                  size={42}
                  color="#555"
                />

                <Text className="mt-3 text-sm text-zinc-500">
                  No property videos
                  available.
                </Text>
              </View>
            )}
          </View>

          {/* ================================================= */}
          {/* MAKE OFFER */}
          {/* ================================================= */}

          <Pressable
            onPress={handleMakeOffer}
            className="mt-8 w-full flex-row items-center justify-center rounded-xl bg-red-600 px-5 py-4 active:bg-red-700"
          >
            <Ionicons
              name="pricetag-outline"
              size={20}
              color="#fff"
            />

            <Text className="ml-2 text-base font-bold text-white">
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
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-white">
                Property Location
              </Text>

              {coordinates ? (
                <Ionicons
                  name="location"
                  size={22}
                  color="#ef4444"
                />
              ) : null}
            </View>

            {coordinates ? (
              <View className="overflow-hidden rounded-xl border border-[#292929]">
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={{
                    width: "100%",
                    height: 280,
                  }}
                  initialRegion={{
                    latitude:
                      coordinates.latitude,
                    longitude:
                      coordinates.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  showsCompass
                  zoomEnabled
                  scrollEnabled
                  rotateEnabled
                  pitchEnabled
                  toolbarEnabled
                >
                  <Marker
                    coordinate={
                      coordinates
                    }
                    title={
                      property.title ??
                      "Property"
                    }
                    description={
                      locationText ||
                      "Property location"
                    }
                  />
                </MapView>

                <View className="border-t border-[#292929] bg-[#171717] px-4 py-3">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color="#ef4444"
                    />

                    <Text
                      className="ml-2 flex-1 text-sm text-zinc-300"
                      numberOfLines={2}
                    >
                      {locationText ||
                        "Property location"}
                    </Text>
                  </View>

                  <Text className="mt-2 text-xs text-zinc-600">
                    {coordinates.latitude.toFixed(
                      6,
                    )}
                    {"  "}
                    {coordinates.longitude.toFixed(
                      6,
                    )}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="items-center rounded-xl border border-[#292929] bg-[#171717] px-5 py-10">
                <Ionicons
                  name="map-outline"
                  size={50}
                  color="#555"
                />

                <Text className="mt-3 text-center text-sm font-medium text-zinc-400">
                  Property coordinates
                  unavailable
                </Text>

                <Text className="mt-2 text-center text-xs leading-5 text-zinc-600">
                  This property does not
                  currently have valid
                  latitude and longitude
                  coordinates.
                </Text>

                {locationText ? (
                  <View className="mt-4 flex-row items-center">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#777"
                    />

                    <Text className="ml-2 text-xs text-zinc-500">
                      {locationText}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          {/* ================================================= */}
          {/* LISTING AGENT */}
          {/* ================================================= */}

          <View className="mt-8">
            <Text className="mb-4 text-xl font-bold text-white">
              Listing Agent
            </Text>

            {property.agent ? (
              <View className="rounded-xl border border-[#292929] bg-[#171717] p-4">
                <View className="flex-row items-center">
                  {property.agent.image ? (
                    <Image
                      source={{
                        uri: property.agent.image,
                      }}
                      className="h-14 w-14 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-[#292929]">
                      <Ionicons
                        name="person-outline"
                        size={28}
                        color="#777"
                      />
                    </View>
                  )}

                  <View className="ml-3 flex-1">
                    <Text
                      className="text-base font-bold text-white"
                      numberOfLines={2}
                    >
                      {property.agent.name || "Listing Agent"}
                    </Text>

                    <Text className="mt-1 text-sm text-zinc-500">
                      {property.agent.agentType ||
                        "Property Agent"}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 border-t border-[#292929] pt-4">
                  {property.agent.email ? (
                    <View className="flex-row items-center">
                      <Ionicons
                        name="mail-outline"
                        size={19}
                        color="#888"
                      />

                      <Text
                        className="ml-3 flex-1 text-sm text-zinc-400"
                        numberOfLines={2}
                      >
                        {property.agent.email}
                      </Text>
                    </View>
                  ) : null}

                  {property.agent.phone ? (
                    <View
                      className={`flex-row items-center ${
                        property.agent.email ? "mt-3" : ""
                      }`}
                    >
                      <Ionicons
                        name="call-outline"
                        size={19}
                        color="#888"
                      />

                      <Text
                        className="ml-3 flex-1 text-sm text-zinc-400"
                        numberOfLines={2}
                      >
                        {property.agent.phone}
                      </Text>
                    </View>
                  ) : null}

                  {property.agent.specialization ? (
                    <View className="mt-3 flex-row items-center">
                      <Ionicons
                        name="briefcase-outline"
                        size={19}
                        color="#888"
                      />

                      <Text
                        className="ml-3 flex-1 text-sm text-zinc-400"
                        numberOfLines={2}
                      >
                        {property.agent.specialization}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {property.agent.about ? (
                  <View className="mt-4 border-t border-[#292929] pt-4">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      About the Agent
                    </Text>

                    <Text className="mt-2 text-sm leading-6 text-zinc-300">
                      {property.agent.about}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View className="rounded-xl border border-[#292929] bg-[#171717] p-5">
                <View className="items-center">
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-[#292929]">
                    <Ionicons
                      name="person-outline"
                      size={28}
                      color="#555"
                    />
                  </View>

                  <Text className="mt-3 text-base font-semibold text-zinc-400">
                    No listing agent assigned
                  </Text>

                  <Text className="mt-1 text-center text-sm leading-5 text-zinc-600">
                    No agent is currently associated with
                    this property.
                  </Text>
                </View>
              </View>
            )}
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
        wide
          ? "flex-1"
          : "min-w-[30%]"
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