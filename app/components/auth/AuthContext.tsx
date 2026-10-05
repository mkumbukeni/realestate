
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

const ACCESS_TOKEN_KEY = "imorrcs_access_token";
const USER_KEY = "imorrcs_user";
const LAST_ACTIVITY_KEY = "imorrcs_last_activity";

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

interface LoginResponseWrapper {
  data?: LoginResponseData;
  message?: string;
  msg?: string;
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

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * The API currently returns a Laravel-style token:
 *
 * 280|29oHiRqyEjKvWWiLVJgYwW0xHq5B7X2kfyBDy1Cned00d46e
 *
 * This is NOT a JWT.
 *
 * Therefore, there is no local JWT `exp` claim
 * to decode.
 *
 * Session expiration is handled using the
 * inactivity timestamp below.
 */
const isTokenExpired = (
  _token: string,
): boolean => {
  return false;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [token, setToken] =
    useState<string | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  /**
   * Timestamp of the user's latest activity.
   */
  const lastActivityRef =
    useRef<number>(0);

  /**
   * Inactivity timeout.
   */
  const inactivityTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  /**
   * Prevents repeated SecureStore writes
   * on every API call.
   */
  const lastPersistedActivityRef =
    useRef<number>(0);

  /**
   * Authentication restoration state.
   */
  const authenticationReadyRef =
    useRef(false);

  /**
   * Clear the inactivity timer.
   */
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

  /**
   * Remove all authentication data.
   */
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

  /**
   * Logout implementation.
   */
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

  /**
   * Store the latest activity timestamp.
   */
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

  /**
   * Start the inactivity timer.
   */
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

        /**
         * Session has already expired.
         */
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

  /**
   * Record user activity.
   *
   * This refreshes the inactivity timer.
   */
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

      /**
       * Restart the one-hour inactivity timer.
       */
      startInactivityTimer(now);

      /**
       * Avoid writing to SecureStore
       * on every single API call.
       *
       * Persist once every minute at most.
       */
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
   * Restore authentication when the application starts.
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

          /**
           * No stored authentication.
           */
          if (!storedToken) {
            if (mounted) {
              setToken(null);
              setUser(null);
            }

            return;
          }

          /**
           * JWT check is currently not used because
           * the backend returns a Laravel API token.
           */
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

          /**
           * Check inactivity from the previous session.
           */
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

              /**
               * The user has been inactive for
               * one hour or more.
               */
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
            /**
             * Existing sessions from before the
             * inactivity system was added do not
             * have a timestamp.
             *
             * Start their inactivity period now.
             */
            const now = Date.now();

            lastActivityRef.current =
              now;

            await persistActivity(now);
          }

          /**
           * Restore stored user.
           */
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
   * Start the inactivity timer whenever an
   * authenticated token is available.
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
   * Monitor whether the application goes into
   * the background or returns to the foreground.
   *
   * Returning to the app counts as activity.
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
   * Store the authenticated user's token
   * and profile.
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

        /**
         * Login is considered activity,
         * so start a completely new one-hour
         * inactivity period.
         */
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
   * Login user.
   *
   * Actual API response:
   *
   * {
   *   data: {
   *     data: {
   *       api_token: "...",
   *       id: 19,
   *       name: "Mhone Mhone",
   *       email: "...",
   *       role: "client"
   *     }
   *   },
   *   ok: true,
   *   status: 200
   * }
   *
   * authApi.ts returns the inner data.data object,
   * therefore api_token is available as
   * response.data.api_token.
   */
  const login = useCallback(
    async (
      email: string,
      password: string,
    ) => {
      const trimmedEmail =
        email
          .trim()
          .toLowerCase();

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
        console.log(
          "Logging in user:",
          {
            email: trimmedEmail,
          },
        );

        const response =
          (await loginUser({
            email: trimmedEmail,
            password,
          })) as LoginResponseWrapper;

        console.log(
          "Login response:",
          response,
        );

        /**
         * Support the current API token
         * and common fallback names.
         */
        const newToken =
          response.data?.api_token ??
          response.data?.token ??
          response.data?.access_token;

        if (
          typeof newToken !==
            "string" ||
          !newToken.trim()
        ) {
          console.error(
            "Login response did not contain an API token:",
            response,
          );

          return {
            success: false,
            message:
              response.message ??
              response.msg ??
              "Login succeeded, but the server did not return an authentication token.",
          };
        }

        /**
         * The API puts the authenticated user's
         * information in the same object as api_token.
         */
        const authenticatedUser: User =
          {
            ...response.data,

            id: response.data.id,

            name: response.data.name,

            email:
              response.data.email,

            phone:
              response.data.phone,

            role:
              response.data.role,
          };

        await setAuthenticatedUser(
          newToken,
          authenticatedUser,
        );

        console.log(
          "Authentication token stored successfully.",
        );

        console.log(
          "Authenticated user:",
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
        console.error(
          "Authentication error:",
          error,
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

  /**
   * Logout user and remove stored authentication.
   */
  const logout = useCallback(
    async () => {
      await performLogout();
    },
    [performLogout],
  );

  /**
   * Return authorization headers for
   * authenticated API calls.
   */
  const getAuthHeaders =
    useCallback(
      async (): Promise<
        Record<string, string>
      > => {
        if (!token) {
          return {};
        }

        /**
         * Check whether the local inactivity
         * period has already expired.
         */
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

        /**
         * An authenticated API call is
         * considered user activity.
         */
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

  /**
   * If a token exists, the user is authenticated.
   *
   * The current backend token is a Laravel API
   * token rather than a JWT, so local expiration
   * is handled using the inactivity system.
   */
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

