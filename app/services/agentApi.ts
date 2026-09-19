// services/agentApi.ts

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured. Please add it to your .env file.",
  );
}

// ============================================================
// API TYPES
// ============================================================

export interface AgentMediaImage {
  id: number;
  name: string;
  created_at_fmt: string;
  storage_url: string;
  original: string;
  file_size: number;
}

export interface AgentMedia {
  images: AgentMediaImage[];
}

export interface AgentUser {
  id: number;
  name: string;
  email: string | null;
  status: string;
  email_verified_at: string | null;
  phone: string | null;
  password_last_updated_at: string | null;
  financial_institution_id: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  signature: string;
  media: AgentMedia;
}

export interface CoverageArea {
  id: number;
  region: string;
  district_code: string;
  district_name: string;
  location_name: string;
  location_code: string;
  latitude: number | null;
  longitude: number | null;
  google_map_link: string | null;
  last_sync_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiAgent {
  id: number;
  user: AgentUser;
  comps_count: number;
  user_id: string;

  phone_1: string | null;
  phone_2: string | null;

  headline1: string | null;
  headline2: string | null;

  bank_name: string | null;
  account_number: string | null;
  account_type: string | null;
  account_branch: string | null;

  phone: string | null;
  email: string | null;

  linkedin: string | null;
  facebook: string | null;

  address: string | null;
  account_name: string | null;

  is_agreement_signed: string;
  agent_type: string;

  about: string | null;

  coverage_area: string | CoverageArea[] | null;

  license_number: string | null;
  license_status: string | null;

  specialization: string | null;

  created_at: string;
  updated_at: string;

  total_sales: number;
}

// ============================================================
// APP AGENT TYPE
// ============================================================

export interface Agent {
  id: string;
  userId: string;

  name: string;
  email: string;
  phone: string;

  image: string | null;

  agentType: string;
  licenseStatus: string;
  specialization: string;

  address: string;

  coverageAreas: CoverageArea[];

  totalSales: number;
  compsCount: number;

  about: string;

  linkedin: string | null;
  facebook: string | null;
}

// ============================================================
// HELPERS
// ============================================================

function parseCoverageAreas(
  coverageArea: string | CoverageArea[] | null,
): CoverageArea[] {
  if (!coverageArea) {
    return [];
  }

  if (Array.isArray(coverageArea)) {
    return coverageArea;
  }

  try {
    const parsed: unknown = JSON.parse(coverageArea);

    if (Array.isArray(parsed)) {
      return parsed as CoverageArea[];
    }

    return [];
  } catch {
    return [];
  }
}

function getAgentImage(user: AgentUser): string | null {
  // First check avatar_url
  if (user.avatar_url) {
    return user.avatar_url;
  }

  // Then look for profile image
  const images = user.media?.images ?? [];

  const profileImage = images.find(
    (image) =>
      image.name.toLowerCase() === "profile_image",
  );

  if (profileImage?.original) {
    return profileImage.original;
  }

  // Finally use the first available image
  if (images.length > 0 && images[0]?.original) {
    return images[0].original;
  }

  return null;
}

function getAgentPhone(apiAgent: ApiAgent): string {
  return (
    apiAgent.phone ??
    apiAgent.phone_1 ??
    apiAgent.phone_2 ??
    apiAgent.user.phone ??
    ""
  );
}

function getAgentEmail(apiAgent: ApiAgent): string {
  return (
    apiAgent.email ??
    apiAgent.user.email ??
    ""
  );
}

// ============================================================
// MAP API AGENT
// ============================================================

function mapApiAgent(apiAgent: ApiAgent): Agent {
  return {
    id: String(apiAgent.id),

    userId: String(apiAgent.user_id),

    name: apiAgent.user?.name ?? "Unknown Agent",

    email: getAgentEmail(apiAgent),

    phone: getAgentPhone(apiAgent),

    image: getAgentImage(apiAgent.user),

    agentType:
      apiAgent.agent_type || "Real Estate Agent",

    licenseStatus:
      apiAgent.license_status || "Unknown",

    specialization:
      apiAgent.specialization || "Real Estate",

    address:
      apiAgent.address ??
      apiAgent.headline1 ??
      "",

    coverageAreas:
      parseCoverageAreas(apiAgent.coverage_area),

    totalSales: apiAgent.total_sales ?? 0,

    compsCount: apiAgent.comps_count ?? 0,

    about:
      apiAgent.about ??
      "Real estate professional helping clients find suitable properties.",

    linkedin: apiAgent.linkedin,

    facebook: apiAgent.facebook,
  };
}

// ============================================================
// FETCH AGENTS
// ============================================================

export async function fetchAgents(): Promise<Agent[]> {
  const response = await fetch(`${API_URL}/agents`);

  if (!response.ok) {
    throw new Error(
      `Failed to load agents. Server returned ${response.status}.`,
    );
  }

  const json: unknown = await response.json();

  if (
    typeof json !== "object" ||
    json === null ||
    !("data" in json) ||
    !Array.isArray(json.data)
  ) {
    throw new Error(
      "Invalid agents response from the server.",
    );
  }

  return json.data.map((agent) =>
    mapApiAgent(agent as ApiAgent),
  );
}