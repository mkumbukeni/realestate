
import React from "react";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface PropertyCoordinates {
  latitude: number;
  longitude: number;
}

interface PropertyLocationMapProps {
  coordinates: PropertyCoordinates | null;
  locationText: string;
  propertyTitle?: string | null;
  isDark: boolean;
}

function createMapHtml(
  latitude: number,
  longitude: number,
  title: string,
  isDark: boolean,
) {
  const safeTitle = JSON.stringify(title || "Property location");
  const background = isDark ? "#171717" : "#ffffff";
  const textColor = isDark ? "#e4e4e7" : "#374151";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: ${background};
    }
    .property-marker {
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #dc2626;
      border: 3px solid white;
      border-radius: 50%;
      color: white;
      font-size: 21px;
      box-shadow: 0 2px 8px rgba(0,0,0,.35);
    }
    .leaflet-popup-content-wrapper,
    .leaflet-popup-tip {
      background: ${background};
      color: ${textColor};
    }
    .leaflet-popup-content {
      font-family: Arial, sans-serif;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function () {
      var lat = ${latitude};
      var lng = ${longitude};
      var title = ${safeTitle};

      if (!window.L) {
        document.getElementById("map").innerHTML =
          '<div style="padding:20px;color:${textColor};font-family:Arial">Unable to load map. Check your internet connection.</div>';
        return;
      }
var map = L.map("map", {
  zoomControl: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  touchZoom: false,
  boxZoom: false,
  keyboard: false,
  dragging: false
}).setView([lat, lng], 15);

// Keep OpenStreetMap tiles enabled to show roads and place names.
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

      var icon = L.divIcon({
        className: "",
        html: '<div class="property-marker">⌂</div>',
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -38]
      });

      L.marker([lat, lng], { icon: icon })
        .addTo(map)
        .bindPopup(title)
        .openPopup();

      setTimeout(function () {
        map.invalidateSize();
      }, 250);
    })();
  </script>
</body>
</html>`;
}

export default function PropertyLocationMap({
  coordinates,
  locationText,
  propertyTitle,
  isDark,
}: PropertyLocationMapProps) {
  const validCoordinates =
    coordinates !== null &&
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    Math.abs(coordinates.latitude) <= 90 &&
    Math.abs(coordinates.longitude) <= 180;

  const mapHtml = validCoordinates
    ? createMapHtml(
        coordinates.latitude,
        coordinates.longitude,
        propertyTitle || "Property location",
        isDark,
      )
    : "";

  return (
    <View className="mt-8">
      <View className="mb-4 flex-row items-center justify-between">
        <Text
          className={
            isDark
              ? "text-xl font-bold text-white"
              : "text-xl font-bold text-black"
          }
        >
          Property Location
        </Text>

        {validCoordinates ? (
          <Ionicons name="location" size={22} color="#ef4444" />
        ) : null}
      </View>

      {validCoordinates ? (
        <View
          className={
            isDark
              ? "overflow-hidden rounded-xl border border-[#292929]"
              : "overflow-hidden rounded-xl border border-gray-200"
          }
        >
          <View style={{ height: 280, width: "100%" }}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              javaScriptEnabled
              domStorageEnabled
              setSupportMultipleWindows={false}
              style={{ flex: 1, backgroundColor: isDark ? "#171717" : "#ffffff" }}
              scrollEnabled={false}
              nestedScrollEnabled={false}
              onShouldStartLoadWithRequest={(request) =>
                request.url === "about:blank" ||
                request.url.startsWith("data:") ||
                request.url.startsWith("https://unpkg.com/") ||
                request.url.startsWith("https://tile.openstreetmap.org/")
              }
              renderError={() => (
                <View
                  className={
                    isDark
                      ? "flex-1 items-center justify-center bg-[#171717] px-5"
                      : "flex-1 items-center justify-center bg-white px-5"
                  }
                >
                  <Ionicons name="map-outline" size={36} color="#ef4444" />
                  <Text
                    className={
                      isDark
                        ? "mt-3 text-center text-sm text-zinc-300"
                        : "mt-3 text-center text-sm text-gray-600"
                    }
                  >
                    Unable to load the map. Check your internet connection.
                  </Text>
                </View>
              )}
            />
          </View>

          <View
            className={
              isDark
                ? "border-t border-[#292929] bg-[#171717] px-4 py-3"
                : "border-t border-gray-200 bg-white px-4 py-3"
            }
          >
            <View className="flex-row items-center">
              <Ionicons
                name="location-outline"
                size={18}
                color="#ef4444"
              />

              <Text
                className={
                  isDark
                    ? "ml-2 flex-1 text-sm text-zinc-300"
                    : "ml-2 flex-1 text-sm text-gray-700"
                }
                numberOfLines={2}
              >
                {locationText || "Property location"}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View
          className={
            isDark
              ? "items-center rounded-xl border border-[#292929] bg-[#171717] px-5 py-10"
              : "items-center rounded-xl border border-gray-200 bg-white px-5 py-10"
          }
        >
          <Ionicons
            name="map-outline"
            size={50}
            color={isDark ? "#555" : "#9ca3af"}
          />

          <Text
            className={
              isDark
                ? "mt-3 text-center text-sm font-medium text-zinc-400"
                : "mt-3 text-center text-sm font-medium text-gray-600"
            }
          >
            Property coordinates unavailable
          </Text>

          <Text
            className={
              isDark
                ? "mt-2 text-center text-xs leading-5 text-zinc-600"
                : "mt-2 text-center text-xs leading-5 text-gray-500"
            }
          >
            This property does not currently have valid latitude and longitude
            coordinates.
          </Text>

          {locationText ? (
            <View className="mt-4 flex-row items-center">
              <Ionicons
                name="location-outline"
                size={16}
                color={isDark ? "#777" : "#6b7280"}
              />
              <Text
                className={
                  isDark
                    ? "ml-2 text-xs text-zinc-500"
                    : "ml-2 text-xs text-gray-500"
                }
              >
                {locationText}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
