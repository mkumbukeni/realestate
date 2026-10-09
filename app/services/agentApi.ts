
/*
|--------------------------------------------------------------------------
| Agent API Service
|--------------------------------------------------------------------------
*/

import type {
  Agent,
  AgentUser,
  ApiAgent,
  CoverageArea,
} from "@/app/types/agents/agent";

/*
|--------------------------------------------------------------------------
| API CONFIGURATION
|--------------------------------------------------------------------------
*/

const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!EXPO_PUBLIC_API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured. Please add it to your .env file.",
  );
}

/*
|--------------------------------------------------------------------------
| PARSE COVERAGE AREAS
|--------------------------------------------------------------------------
*/

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

    return Array.isArray(parsed)
      ? (parsed as CoverageArea[])
      : [];
  } catch {
    return [];
  }
}

/*
|--------------------------------------------------------------------------
| GET AGENT IMAGE
|--------------------------------------------------------------------------
|
| The API may return user: null.
| Therefore this function safely handles null or undefined.
|
*/

function getAgentImage(
  user: AgentUser | null | undefined,
): string | null {
  // No user information
  if (!user) {
    return null;
  }

  // Prefer the user's avatar
  if (user.avatar_url) {
    return user.avatar_url;
  }

  // Fall back to media images
  if (user.media?.images && user.media.images.length > 0) {
    const firstImage = user.media.images[0];

    return firstImage.original || firstImage.storage_url || null;
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| GET AGENT PHONE
|--------------------------------------------------------------------------
*/

function getAgentPhone(apiAgent: ApiAgent): string {
  return (
    apiAgent.phone ||
    apiAgent.phone_1 ||
    apiAgent.phone_2 ||
    apiAgent.user?.phone ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| GET AGENT EMAIL
|--------------------------------------------------------------------------
*/

function getAgentEmail(apiAgent: ApiAgent): string {
  return apiAgent.email || apiAgent.user?.email || "";
}

/*
|--------------------------------------------------------------------------
| MAP API AGENT TO APP AGENT
|--------------------------------------------------------------------------
|
| This function is exported because propertyApi.ts also receives
| nested agents directly from the properties API.
|
| Example:
| property.agent -> ApiAgent -> mapApiAgent() -> Agent
|
*/

export function mapApiAgent(apiAgent: ApiAgent): Agent {
  return {
    id: String(apiAgent.id),

    userId: String(apiAgent.user_id || ""),

    name: apiAgent.user?.name || "Unknown Agent",

    email: getAgentEmail(apiAgent),

    phone: getAgentPhone(apiAgent),

    image: getAgentImage(apiAgent.user),

    agentType: apiAgent.agent_type || "",

    licenseStatus: apiAgent.license_status || "",

    specialization: apiAgent.specialization || "",

    address: apiAgent.address || "",

    coverageAreas: parseCoverageAreas(apiAgent.coverage_area),

    totalSales: Number(apiAgent.total_sales || 0),

    compsCount: Number(apiAgent.comps_count || 0),

    about: apiAgent.about || "",

    linkedin: apiAgent.linkedin || null,

    facebook: apiAgent.facebook || null,
  };
}

/*
|--------------------------------------------------------------------------
| AGENTS CACHE
|--------------------------------------------------------------------------
|
| The cache prevents every screen from making another GET /agents
| request.
|
*/

let agentsCache: Agent[] | null = null;

/*
|--------------------------------------------------------------------------
| ACTIVE AGENTS REQUEST
|--------------------------------------------------------------------------
|
| If several screens request agents at the same time, they can
| share the same request.
|
*/

let agentsRequest: Promise<Agent[]> | null = null;

/*
|--------------------------------------------------------------------------
| FETCH AGENTS
|--------------------------------------------------------------------------
*/

export async function fetchAgents(
  forceRefresh = false,
): Promise<Agent[]> {
  // Return cached agents when available
  if (!forceRefresh && agentsCache) {
    return agentsCache;
  }

  // Reuse an active request
  if (!forceRefresh && agentsRequest) {
    return agentsRequest;
  }

  // Make API request
  agentsRequest = (async () => {
    const response = await fetch(
      `${EXPO_PUBLIC_API_URL}/v2/agents`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch agents: ${response.status}`,
      );
    }

    const json: unknown = await response.json();

    // Validate API response
    if (
      !json ||
      typeof json !== "object" ||
      !("data" in json) ||
      !Array.isArray(json.data)
    ) {
      throw new Error("Invalid agents API response.");
    }

    // Map API agents
    const agents = json.data.map((agent) =>
      mapApiAgent(agent as ApiAgent),
    );

    // Save in cache
    agentsCache = agents;

    return agents;
  })();

  // Clear active request when complete
  try {
    return await agentsRequest;
  } finally {
    agentsRequest = null;
  }
}

/*
|--------------------------------------------------------------------------
| CLEAR AGENTS CACHE
|--------------------------------------------------------------------------
|
| Call this when agent information has changed and the next fetch
| should retrieve fresh data from the API.
|
*/

export function clearAgentsCache(): void {
  agentsCache = null;
}

/*
|--------------------------------------------------------------------------
| FETCH SINGLE AGENT WITH ASSOCIATED PROPERTIES
|--------------------------------------------------------------------------
|
| Endpoint:
| GET /v2/agents/{agent_id}
|
| The response contains:
| {
|   msg: "...",
|   data: { ...agent },
|   properties: [ ...properties ]
| }
|
| The properties are returned as raw API properties.
| AgentDetailsScreen maps them using mapApiProperty() from
| propertyApi.ts.
|
*/

/*
|--------------------------------------------------------------------------
| FETCH AGENT DETAILS + ASSOCIATED PROPERTIES
|--------------------------------------------------------------------------
*/

export async function fetchAgentDetails(
  agentId: string | number,
): Promise<{
  agent: Agent;
  properties: unknown[];
}> {
  const endpoint =
    `${EXPO_PUBLIC_API_URL}/v2/agents/${encodeURIComponent(
      String(agentId),
    )}`;

  console.log("Fetching agent details from:", endpoint);

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Agent request failed (${response.status}): ${errorText}`,
    );
  }

  const json: unknown = await response.json();

  if (
    typeof json !== "object" ||
    json === null ||
    !("data" in json)
  ) {
    throw new Error("Invalid agent details response.");
  }

  const responseData = json as {
    data?: unknown;
    properties?: unknown;
  };

  if (
    !responseData.data ||
    typeof responseData.data !== "object"
  ) {
    throw new Error(
      "Agent details response does not contain valid agent data.",
    );
  }

  return {
    agent: mapApiAgent(responseData.data as ApiAgent),

    properties: Array.isArray(responseData.properties)
      ? responseData.properties
      : [],
  };
}
