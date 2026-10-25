import type {
  UpdatePasswordPayload,
  UpdatePasswordResponse,
} from "@/app/types/auth/update-password";

/**
 * Builds the update-password endpoint from the app's configured API URL.
 * EXPO_PUBLIC_API_URL may already include an API prefix such as /api/v2.
 */
function getUpdatePasswordEndpoint(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    throw new Error(
      "The API URL is not configured. Please set EXPO_PUBLIC_API_URL in your environment.",
    );
  }

  const baseUrl = configuredUrl.replace(/\/+$/, "");

  if (/\/update-password$/i.test(baseUrl)) {
    return baseUrl;
  }

  return `${baseUrl}/v1/update-password`;
}

function getResponseMessage(data: UpdatePasswordResponse): string | undefined {
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  if (data.errors && typeof data.errors === "object") {
    for (const value of Object.values(data.errors)) {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }

      if (Array.isArray(value) && typeof value[0] === "string") {
        return value[0];
      }
    }
  }

  return undefined;
}

/** Sends the password update request to POST /update-password. */
export async function updatePassword(
  payload: UpdatePasswordPayload,
): Promise<UpdatePasswordResponse> {
  const email = payload.email.trim().toLowerCase();

  if (!email) {
    throw new Error("Unable to find the email address for your signed-in account.");
  }

  if (payload.password.length < 8) {
    throw new Error("Your new password must contain at least 8 characters.");
  }

  if (payload.password !== payload.password_confirmation) {
    throw new Error("The passwords do not match.");
  }

  const response = await fetch(getUpdatePasswordEndpoint(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    }),
  });

  let responseData: UpdatePasswordResponse = {};

  try {
    responseData = (await response.json()) as UpdatePasswordResponse;
  } catch {
    // The API may return an empty response body.
  }

  if (!response.ok || responseData.success === false) {
    throw new Error(
      getResponseMessage(responseData) ||
        `Unable to update password (HTTP ${response.status}). Please try again.`,
    );
  }

  return responseData;
}
