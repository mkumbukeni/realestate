
/*
|--------------------------------------------------------------------------
| Agent Types
|--------------------------------------------------------------------------
*/

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
  user: AgentUser | null;
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

export interface AgentDetailsApiResponse {
  msg?: string;
  data: ApiAgent;
  properties?: unknown[];
}
