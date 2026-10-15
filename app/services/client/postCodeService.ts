import type {
  PostCode,
  PostCodesResponse,
} from "@/app/types/client/postCode";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined.");
}

function getPostCodesUrl(): string {
  const baseUrl = API_URL.replace(/\/+$/, "");

  if (/\/api\/v\d+$/i.test(baseUrl)) {
    return `${baseUrl.replace(/\/api\/v\d+$/i, "/api")}/v1/post-codes`;
  }

  if (/\/api$/i.test(baseUrl)) {
    return `${baseUrl}/v1/post-codes`;
  }

  return `${baseUrl}/api/v1/post-codes`;
}

export async function getPostalCodes(): Promise<PostCode[]> {
  const response = await fetch(getPostCodesUrl(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const result = (await response.json()) as PostCodesResponse;

  if (!response.ok) {
    throw new Error(
      `Failed to load locations (${response.status}).`,
    );
  }

  if (!Array.isArray(result.data)) {
    throw new Error("The server returned an invalid locations response.");
  }

  return result.data;
}
