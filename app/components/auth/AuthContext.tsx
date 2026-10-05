import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AppState,
  type AppStateStatus,
} from "react-native";
import * as SecureStore from "expo-secure-store";

import { loginUser } from "./authApi";

const ACCESS_TOKEN_KEY =
  "imorrcs_access_token";

const USER_KEY =
  "imorrcs_user";

const LAST_ACTIVITY_KEY =
  "imorrcs_last_activity";

/**
 * User is automatically logged out after
 * 1 hour of inactivity.
 */
const INACTIVITY_TIMEOUT =
  60 * 60 * 1000;

interface User {
  id?: number | string;
  fullName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  role?: string;
  role_name?: string;
  [key: string]: unknown;
}

interface LoginResponseData {
  api_token?: string;
  token?: string;
  access_token?: string;
  avatar_url?: string | null;
  created_at?: string;
  created_at_fmt?: string;
  deleted_at?: string | null;
  email?: string;
  email_verified_at?: string | null;
  financial_institution_id?: string;
  formatted_role?: string;
  id?: number | string;
  last_login_date?: string;
  last_login_time?: string;
  media?: unknown[];
  name?: string;
  password_last_updated_at?: string | null;
  phone?: string;
  properties_approved?: string;
  properties_claimed?: string;
  properties_current_working?: string;
  properties_done_deal?: string;
  properties_on_market?: string;
  properties_submitted?: string;
  properties_total?: string;
  role?: string;
  status?: string;
  total_sale_price?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * The API response can be returned in either of these
 * forms:
 *
 * 1. {
 *      data: {
 *        api_token: "...",
 *        ...
 *      }
 *    }
 *
 * 2. {
 *      data: {
 *        data: {
 *          api_token: "...",
 *          ...
 *        }
 *      },
 *      ok: true,
 *      status: 200
 *    }
 */
interface LoginResponseWrapper {
  data?:
    | LoginResponseData
    | {
        data?: LoginResponseData;
      };
  message?: string;
  msg?: string;
  ok?: boolean;
  status?: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  token: string | null;
  user: User | null;

  login: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;

  logout: () => Promise<void>;

  setAuthenticatedUser: (
    token: string,
    user?: User | null,
  ) => Promise<void>;

  getAuthHeaders: () => Promise<
    Record<string, string>
  >;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  );

/**
 * The backend returns a Laravel-style API token,
 * not a JWT.
 */
const isTokenExpired = (
  _token: string,
): boolean => {
  return false;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [token, setToken] =
    useState<string | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const lastActivityRef =
    useRef<number>(0);

  const inactivityTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const lastPersistedActivityRef =
    useRef<number>(0);

  const authenticationReadyRef =
    useRef(false);

  const clearInactivityTimer =
    useCallback(() => {
      if (
        inactivityTimerRef.current !== null
      ) {
        clearTimeout(
          inactivityTimerRef.current,
        );

        inactivityTimerRef.current =
          null;
      }
    }, []);

  const clearStoredAuthentication =
    useCallback(async () => {
      try {
        await SecureStore.deleteItemAsync(
          ACCESS_TOKEN_KEY,
        );

        await SecureStore.deleteItemAsync(
          USER_KEY,
        );

        await SecureStore.deleteItemAsync(
          LAST_ACTIVITY_KEY,
        );
      } catch (error) {
        console.error(
          "Failed to clear authentication:",
          error,
        );
      }
    }, []);

  const performLogout =
    useCallback(async () => {
      clearInactivityTimer();

      await clearStoredAuthentication();

      lastActivityRef.current = 0;

      lastPersistedActivityRef.current =
        0;

      setToken(null);
      setUser(null);
    }, [
      clearInactivityTimer,
      clearStoredAuthentication,
    ]);

  const persistActivity =
    useCallback(
      async (timestamp: number) => {
        try {
          await SecureStore.setItemAsync(
            LAST_ACTIVITY_KEY,
            String(timestamp),
          );

          lastPersistedActivityRef.current =
            timestamp;
        } catch (error) {
          console.error(
            "Failed to store authentication activity:",
            error,
          );
        }
      },
      [],
    );

  const startInactivityTimer =
    useCallback(
      (activityTimestamp: number) => {
        clearInactivityTimer();

        const elapsed =
          Date.now() -
          activityTimestamp;

        const remaining =
          INACTIVITY_TIMEOUT -
          elapsed;

        if (remaining <= 0) {
          void performLogout();
          return;
        }

        inactivityTimerRef.current =
          setTimeout(() => {
            console.log(
              "User logged out because the authentication session was inactive for 1 hour.",
            );

            void performLogout();
          }, remaining);
      },
      [
        clearInactivityTimer,
        performLogout,
      ],
    );

  const recordActivity =
    useCallback(async () => {
      if (
        !authenticationReadyRef.current ||
        !token
      ) {
        return;
      }

      const now = Date.now();

      lastActivityRef.current = now;

      startInactivityTimer(now);

      if (
        now -
          lastPersistedActivityRef.current >=
        60 * 1000
      ) {
        await persistActivity(now);
      }
    }, [
      token,
      startInactivityTimer,
      persistActivity,
    ]);

  /**
   * Restore authentication when the app starts.
   */
  useEffect(() => {
    let mounted = true;

    const restoreAuthentication =
      async () => {
        try {
          const storedToken =
            await SecureStore.getItemAsync(
              ACCESS_TOKEN_KEY,
            );

          const storedUser =
            await SecureStore.getItemAsync(
              USER_KEY,
            );

          const storedLastActivity =
            await SecureStore.getItemAsync(
              LAST_ACTIVITY_KEY,
            );

          if (!storedToken) {
            if (mounted) {
              setToken(null);
              setUser(null);
            }

            return;
          }

          if (
            isTokenExpired(
              storedToken,
            )
          ) {
            await clearStoredAuthentication();

            if (mounted) {
              setToken(null);
              setUser(null);
            }

            return;
          }

          if (storedLastActivity) {
            const lastActivity =
              Number(
                storedLastActivity,
              );

            if (
              Number.isFinite(
                lastActivity,
              )
            ) {
              const elapsed =
                Date.now() -
                lastActivity;

              if (
                elapsed >=
                INACTIVITY_TIMEOUT
              ) {
                console.log(
                  "Stored authentication session expired because of inactivity.",
                );

                await clearStoredAuthentication();

                if (mounted) {
                  setToken(null);
                  setUser(null);
                }

                return;
              }

              lastActivityRef.current =
                lastActivity;

              lastPersistedActivityRef.current =
                lastActivity;
            }
          } else {
            const now = Date.now();

            lastActivityRef.current =
              now;

            await persistActivity(now);
          }

          let parsedUser:
            | User
            | null = null;

          if (storedUser) {
            try {
              parsedUser =
                JSON.parse(
                  storedUser,
                ) as User;
            } catch {
              parsedUser = null;
            }
          }

          if (mounted) {
            setToken(storedToken);
            setUser(parsedUser);
          }
        } catch (error) {
          console.error(
            "Failed to restore authentication:",
            error,
          );

          if (mounted) {
            setToken(null);
            setUser(null);
          }
        } finally {
          if (mounted) {
            authenticationReadyRef.current =
              true;

            setIsLoading(false);
          }
        }
      };

    void restoreAuthentication();

    return () => {
      mounted = false;

      clearInactivityTimer();
    };
  }, [
    clearInactivityTimer,
    clearStoredAuthentication,
    persistActivity,
  ]);

  /**
   * Start inactivity timer when authenticated.
   */
  useEffect(() => {
    if (
      !authenticationReadyRef.current ||
      !token
    ) {
      clearInactivityTimer();
      return;
    }

    const activityTimestamp =
      lastActivityRef.current ||
      Date.now();

    lastActivityRef.current =
      activityTimestamp;

    startInactivityTimer(
      activityTimestamp,
    );

    return () => {
      clearInactivityTimer();
    };
  }, [
    token,
    startInactivityTimer,
    clearInactivityTimer,
  ]);

  /**
   * Monitor app foreground/background state.
   */
  useEffect(() => {
    const handleAppStateChange =
      (
        nextState: AppStateStatus,
      ) => {
        if (
          nextState === "active" &&
          token
        ) {
          void recordActivity();
        }
      };

    const subscription =
      AppState.addEventListener(
        "change",
        handleAppStateChange,
      );

    return () => {
      subscription.remove();
    };
  }, [
    token,
    recordActivity,
  ]);

  /**
   * Store authenticated user.
   */
  const setAuthenticatedUser =
    useCallback(
      async (
        newToken: string,
        authenticatedUser?: User | null,
      ) => {
        const trimmedToken =
          newToken.trim();

        if (!trimmedToken) {
          throw new Error(
            "Authentication token is required.",
          );
        }

        await SecureStore.setItemAsync(
          ACCESS_TOKEN_KEY,
          trimmedToken,
        );

        if (authenticatedUser) {
          await SecureStore.setItemAsync(
            USER_KEY,
            JSON.stringify(
              authenticatedUser,
            ),
          );
        } else {
          await SecureStore.deleteItemAsync(
            USER_KEY,
          );
        }

        const now = Date.now();

        lastActivityRef.current = now;

        await persistActivity(now);

        setToken(trimmedToken);

        setUser(
          authenticatedUser ?? null,
        );
      },
      [persistActivity],
    );

  /**
   * Login.
   */
  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{
      success: boolean;
      message: string;
    }> => {
      const trimmedEmail =
        email.trim().toLowerCase();

      if (
        !trimmedEmail ||
        !password
      ) {
        return {
          success: false,
          message:
            "Please enter your email and password.",
        };
      }

      try {
        const response =
          (await loginUser({
            email: trimmedEmail,
            password,
          })) as LoginResponseWrapper;

        console.log(
          "Processed login response:",
          response,
        );

        /**
         * Extract the actual user data.
         *
         * Supports:
         *
         * {
         *   data: {
         *     api_token: "...",
         *     ...
         *   }
         * }
         *
         * and:
         *
         * {
         *   data: {
         *     data: {
         *       api_token: "...",
         *       ...
         *     }
         *   }
         * }
         */
        let responseData:
          | LoginResponseData
          | undefined;

        if (
          response.data &&
          typeof response.data ===
            "object"
        ) {
          const possibleNestedData =
            response.data as {
              data?: LoginResponseData;
            };

          if (
            possibleNestedData.data &&
            typeof possibleNestedData.data ===
              "object"
          ) {
            responseData =
              possibleNestedData.data;
          } else {
            responseData =
              response.data as LoginResponseData;
          }
        }

        if (!responseData) {
          return {
            success: false,
            message:
              response.message ??
              response.msg ??
              "Login failed. The server returned an invalid response.",
          };
        }

        /**
         * Get the authentication token.
         */
        const newToken =
          responseData.api_token ??
          responseData.token ??
          responseData.access_token;

        if (
          typeof newToken !==
            "string" ||
          !newToken.trim()
        ) {
          return {
            success: false,
            message:
              response.message ??
              response.msg ??
              "Login succeeded, but the server did not return an authentication token.",
          };
        }

        /**
         * Store the authenticated user.
         */
        const authenticatedUser: User =
          {
            ...responseData,

            id: responseData.id,
            name: responseData.name,
            email:
              responseData.email,
            phone:
              responseData.phone,
            role:
              responseData.role,
          };

        await setAuthenticatedUser(
          newToken,
          authenticatedUser,
        );

        return {
          success: true,
          message:
            response.message ??
            response.msg ??
            "Signed in successfully.",
        };
      } catch (error) {
        /**
         * Login failures are expected when the
         * credentials are incorrect.
         *
         * Use console.log instead of console.error
         * so Expo does not show a red ERROR message.
         */
        console.log(
          "Login failed:",
          error instanceof Error
            ? error.message
            : "Unable to sign in. Please try again.",
        );

        return {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Unable to sign in. Please try again.",
        };
      }
    },
    [setAuthenticatedUser],
  );

  const logout = useCallback(
    async () => {
      await performLogout();
    },
    [performLogout],
  );

  /**
   * Get authorization headers.
   */
  const getAuthHeaders =
    useCallback(
      async (): Promise<
        Record<string, string>
      > => {
        if (!token) {
          return {};
        }

        const lastActivity =
          lastActivityRef.current;

        if (
          lastActivity > 0 &&
          Date.now() -
            lastActivity >=
            INACTIVITY_TIMEOUT
        ) {
          await performLogout();

          return {};
        }

        await recordActivity();

        return {
          Authorization: `Bearer ${token}`,
        };
      },
      [
        token,
        performLogout,
        recordActivity,
      ],
    );

  const isLoggedIn = !!token;

  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      token,
      user,
      login,
      logout,
      setAuthenticatedUser,
      getAuthHeaders,
    }),
    [
      isLoggedIn,
      isLoading,
      token,
      user,
      login,
      logout,
      setAuthenticatedUser,
      getAuthHeaders,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}