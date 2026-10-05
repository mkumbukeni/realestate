
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured.",
  );
}

type GenerateOtpResponse = {
  success?: boolean;
  message?: string;
  msg?: string;
  [key: string]: unknown;
};

type VerifyOtpResponse = {
  success?: boolean;
  message?: string;
  msg?: string;
  [key: string]: unknown;
};

type RegisterUserData = {
  phone: string;
  address: string;
  email: string;
  name: string;
  role_name: "client";
  channel: "email";
};

type RegisterUserResponse = {
  success?: boolean;
  message?: string;
  msg?: string;
  [key: string]: unknown;
};

/**
 * Safely read an API response.
 *
 * Some server errors return JSON while others return
 * plain text or HTML. This prevents response.json()
 * from throwing another error and hiding the real problem.
 */
const parseResponse = async (
  response: Response,
): Promise<unknown> => {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

/**
 * Extract a useful error message from an API response.
 */
const getErrorMessage = (
  data: unknown,
  fallback: string,
): string => {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const objectData = data as Record<
      string,
      unknown
    >;

    if (
      typeof objectData.message === "string" &&
      objectData.message.trim()
    ) {
      return objectData.message;
    }

    if (
      typeof objectData.msg === "string" &&
      objectData.msg.trim()
    ) {
      return objectData.msg;
    }

    if (
      typeof objectData.error === "string" &&
      objectData.error.trim()
    ) {
      return objectData.error;
    }

    if (
      typeof objectData.errors === "object" &&
      objectData.errors !== null
    ) {
      const errors =
        objectData.errors as Record<
          string,
          unknown
        >;

      const messages: string[] = [];

      Object.values(errors).forEach(
        (value) => {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              if (
                typeof item === "string" &&
                item.trim()
              ) {
                messages.push(item);
              }
            });
          } else if (
            typeof value === "string" &&
            value.trim()
          ) {
            messages.push(value);
          }
        },
      );

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  }

  return fallback;
};

/**
 * Generate OTP
 *
 * Endpoint:
 * POST /v1/generate-otp
 *
 * Request:
 * {
 *   "channel": "email",
 *   "email": "user@example.com"
 * }
 */
export const generateOtp = async (
  email: string,
): Promise<GenerateOtpResponse> => {
  const url = `${API_BASE_URL}/v1/generate-otp`;

  const trimmedEmail = email.trim();

  console.log("Generating OTP:", {
    url,
    channel: "email",
    email: trimmedEmail,
  });

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        channel: "email",
        email: trimmedEmail,
      }),
    });
  } catch (error) {
    console.error(
      "Generate OTP network error:",
      error,
    );

    throw new Error(
      "Unable to connect to the server. Please check your internet connection and API URL.",
    );
  }

  const data = await parseResponse(response);

  console.log("Generate OTP response:", {
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
    const message = getErrorMessage(
      data,
      `Failed to generate OTP: ${response.status}`,
    );

    throw new Error(message);
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    return data as GenerateOtpResponse;
  }

  return {
    message:
      typeof data === "string"
        ? data
        : undefined,
  };
};

/**
 * Verify OTP
 *
 * Endpoint:
 * POST /v1/verify-otp
 *
 * Request:
 * {
 *   "handler": "user@example.com",
 *   "otp": 123456
 * }
 *
 * The API expects "handler", not "email".
 * The OTP must also be sent as a number.
 */
export const verifyOtp = async (
  email: string,
  otp: string,
): Promise<VerifyOtpResponse> => {
  const url = `${API_BASE_URL}/v1/verify-otp`;

  const trimmedEmail = email.trim();
  const trimmedOtp = otp.trim();
  const numericOtp = Number(trimmedOtp);

  console.log("Verifying OTP:", {
    url,
    handler: trimmedEmail,
    otp: numericOtp,
  });

  if (!trimmedEmail) {
    throw new Error(
      "Email address is required to verify the OTP.",
    );
  }

  if (!trimmedOtp) {
    throw new Error(
      "OTP is required.",
    );
  }

  if (!Number.isInteger(numericOtp)) {
    throw new Error(
      "The OTP must contain numbers only.",
    );
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        handler: trimmedEmail,
        otp: numericOtp,
      }),
    });
  } catch (error) {
    console.error(
      "Verify OTP network error:",
      error,
    );

    throw new Error(
      "Unable to connect to the server. Please check your internet connection and API URL.",
    );
  }

  const data = await parseResponse(response);

  console.log("Verify OTP response:", {
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
    const message = getErrorMessage(
      data,
      `Failed to verify OTP: ${response.status}`,
    );

    throw new Error(message);
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    return data as VerifyOtpResponse;
  }

  return {
    message:
      typeof data === "string"
        ? data
        : undefined,
  };
};

/**
 * Register user
 *
 * Endpoint:
 * POST /registration/register-user
 *
 * Request:
 * {
 *   "phone": "string",
 *   "address": "string",
 *   "email": "string",
 *   "name": "string",
 *   "role_name": "client",
 *   "channel": "email"
 * }
 */
export const registerUser = async (
  userData: RegisterUserData,
): Promise<RegisterUserResponse> => {
  const url = `${API_BASE_URL}/registration/register-user`;

  const requestData: RegisterUserData = {
    phone: userData.phone.trim(),
    address: userData.address.trim(),
    email: userData.email.trim(),
    name: userData.name.trim(),
    role_name: "client",
    channel: "email",
  };

  console.log("Registering user:", {
    url,
    data: requestData,
  });

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestData),
    });
  } catch (error) {
    console.error(
      "Registration network error:",
      error,
    );

    throw new Error(
      "Unable to connect to the server. Please check your internet connection and API URL.",
    );
  }

  const data = await parseResponse(response);

  console.log("Registration response:", {
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
    const message = getErrorMessage(
      data,
      `Registration failed: ${response.status}`,
    );

    throw new Error(message);
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    return data as RegisterUserResponse;
  }

  return {
    message:
      typeof data === "string"
        ? data
        : undefined,
  };
};





type LoginUserData = {
  email: string;
  password: string;
};

type LoginUserResponse = {
  success?: boolean;
  message?: string;
  msg?: string;
  token?: string;
  access_token?: string;
  user?: Record<string, unknown>;
  [key: string]: unknown;
};

/**
 * Login user
 *
 * Endpoint:
 * POST /login
 *
 * Request:
 * {
 *   "email": "user@example.com",
 *   "password": "password"
 * }
 */
export const loginUser = async (
  loginData: LoginUserData,
): Promise<LoginUserResponse> => {
  const url = `${API_BASE_URL}/v2/login`;

  const requestData: LoginUserData = {
    email: loginData.email.trim(),
    password: loginData.password,
  };

  console.log("Logging in user:", {
    url,
    email: requestData.email,
  });

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestData),
    });
  } catch (error) {
    console.error(
      "Login network error:",
      error,
    );

    throw new Error(
      "Unable to connect to the server. Please check your internet connection and API URL.",
    );
  }

  const data = await parseResponse(response);

  console.log("Login response:", {
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
    const message = getErrorMessage(
      data,
      `Login failed: ${response.status}`,
    );

    throw new Error(message);
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    return data as LoginUserResponse;
  }

  return {
    message:
      typeof data === "string"
        ? data
        : undefined,
  };
};


