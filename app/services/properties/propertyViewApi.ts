
// app/components/properties/propertyViewApi.ts

type HeaderProvider = () => Promise<Record<string, string>>;

interface TrackPropertyViewParams {
  propertyId: string | number;
  userId?: string | number | null;
  getAuthHeaders: HeaderProvider;
}

interface PropertyViewResponse {
  success?: boolean;
  message?: string;
  already_viewed?: boolean;
  alreadyViewed?: boolean;
  [key: string]: unknown;
}

// Prevent duplicate requests during the current app session.
// The backend must enforce uniqueness across sessions and devices.
const trackedPropertyViews = new Set<string>();

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_API_URL = API_URL?.replace(/\/+$/, "") ?? "";

export async function trackPropertyView({
  propertyId,
  userId,
  getAuthHeaders,
}: TrackPropertyViewParams): Promise<boolean> {
  if (!BASE_API_URL) {
    console.error(
      "Property view tracking failed: EXPO_PUBLIC_API_URL is not configured.",
    );
    return false;
  }

  if (
    propertyId === "" ||
    propertyId === null ||
    propertyId === undefined
  ) {
    console.error("Property view tracking failed: Missing property ID.");
    return false;
  }

  const normalizedPropertyId = String(propertyId);
  const normalizedUserId =
    userId == null ? "anonymous" : String(userId);

  const viewKey = `${normalizedPropertyId}:${normalizedUserId}`;

  // Already submitted for this property and viewer in this session.
  if (trackedPropertyViews.has(viewKey)) {
    console.log("Property view skipped: already tracked this session.", {
      propertyId: normalizedPropertyId,
      userId: normalizedUserId,
    });

    return true;
  }

  // Reserve the key immediately to prevent simultaneous duplicate requests.
  trackedPropertyViews.add(viewKey);

  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(
      `${BASE_API_URL}/v2/properties/${encodeURIComponent(
        normalizedPropertyId,
      )}/add-view`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          user_id: userId ?? 0,
          user_type: "user",
          latitude: 0,
          longitude: 0,
        }),
      },
    );

    const responseText = await response.text();

    let responseData: PropertyViewResponse | string | null = null;

    try {
      responseData = responseText
        ? JSON.parse(responseText)
        : null;
    } catch {
      responseData = responseText || null;
    }

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${
          typeof responseData === "string"
            ? responseData
            : JSON.stringify(responseData)
        }`,
      );
    }

    const alreadyViewed =
      typeof responseData === "object" &&
      responseData !== null &&
      (responseData.already_viewed === true ||
        responseData.alreadyViewed === true);

    if (alreadyViewed) {
      console.log("Property view not incremented: user already viewed it.", {
        propertyId: normalizedPropertyId,
        userId: normalizedUserId,
      });

      return true;
    }

    console.log("Property view request completed successfully:", {
      propertyId: normalizedPropertyId,
      userId: normalizedUserId,
      response: responseData,
    });

    return true;
  } catch (error) {
    // Permit retrying when the request fails.
    trackedPropertyViews.delete(viewKey);

    console.error("Failed to track property view:", error);

    return false;
  }
}
