
import type {
  AddClientRequest,
  AddClientResponse,
} from "@/app/types/client/client";

const API_URL = process.env.EXPO_PUBLIC_API_URL?? "";

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not defined. Please check your environment configuration.",
  );
}

function getAddClientUrl(): string {
  const baseUrl = API_URL.replace(/\/+$/, "");

  // If the configured base already ends in /api/v2,
  // append only the endpoint path.
  if (/\/api\/v2$/i.test(baseUrl)) {
    return `${baseUrl}/client/add`;
  }

  // If the configured base ends in /api,
  // include the v2 prefix.
  if (/\/api$/i.test(baseUrl)) {
    return `${baseUrl}/v2/client/add`;
  }

  // If the configured base already ends in /v2,
  // append only the endpoint path.
  if (/\/v2$/i.test(baseUrl)) {
    return `${baseUrl}/client/add`;
  }

  return `${baseUrl}/v2/client/add`;
}

export async function addClient(
  payload: AddClientRequest,
): Promise<AddClientResponse> {
  const response = await fetch(getAddClientUrl(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  let result: AddClientResponse = {};

  if (responseText) {
    try {
      result = JSON.parse(responseText) as AddClientResponse;
    } catch {
      if (response.ok) {
        throw new Error(
          "The server returned an invalid response.",
        );
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Failed to submit property listing request (${response.status}).`,
    );
  }

  if (result.success === false) {
    throw new Error(
      result.message || "The request could not be completed.",
    );
  }

  return result;
}
