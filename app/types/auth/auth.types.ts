
export type GenerateOtpResponse = {
  success?: boolean;
  message?: string;
  msg?: string;
  [key: string]: unknown;
};

export type VerifyOtpResponse = {
  success?: boolean;
  message?: string;
  msg?: string;
  [key: string]: unknown;
};

export type RegisterUserData = {
  phone: string;
  address: string;
  email: string;
  name: string;
  role_name: "client";
  channel: "email";
};

export type RegisterUserResponse = {
  success?: boolean;
  message?: string;
  msg?: string;
  [key: string]: unknown;
};

export type LoginUserData = {
  email: string;
  password: string;
};

export type LoginUserResponse = {
  success?: boolean;
  message?: string;
  msg?: string;
  token?: string;
  access_token?: string;
  api_token?: string;
  data?: unknown;
  user?: Record<string, unknown>;
  [key: string]: unknown;
};
