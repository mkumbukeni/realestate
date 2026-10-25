/** Payload sent to the API when an authenticated user changes their password. */
export type UpdatePasswordPayload = {
  /** Email used to sign in. This value is supplied from AuthContext, not user input. */
  email: string;
  password: string;
  password_confirmation: string;
};

/** Common response shape returned by the API. */
export type UpdatePasswordResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
  [key: string]: unknown;
};
