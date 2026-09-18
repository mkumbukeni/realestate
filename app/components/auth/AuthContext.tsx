
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface UserCredentials {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserCredentials | null;
  registeredUser: UserCredentials | null;
  register: (
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    confirmPassword: string
  ) => {
    success: boolean;
    message: string;
  };
  login: (
    email: string,
    password: string
  ) => {
    success: boolean;
    message: string;
  };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [registeredUser, setRegisteredUser] =
    useState<UserCredentials | null>(null);

  const [user, setUser] =
    useState<UserCredentials | null>(null);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const register = (
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    confirmPassword: string
  ) => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password ||
      !confirmPassword
    ) {
      return {
        success: false,
        message: "Please complete all fields.",
      };
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        message: "Passwords do not match.",
      };
    }

    const newUser: UserCredentials = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      password,
    };

    // Store credentials temporarily in memory.
    setRegisteredUser(newUser);

    // Automatically log the user in after registration.
    setUser(newUser);
    setIsLoggedIn(true);

    return {
      success: true,
      message: "Account created successfully.",
    };
  };

  const login = (
    email: string,
    password: string
  ) => {
    if (!registeredUser) {
      return {
        success: false,
        message: "No account has been registered yet.",
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail !== registeredUser.email ||
      password !== registeredUser.password
    ) {
      return {
        success: false,
        message: "Incorrect email or password.",
      };
    }

    setUser(registeredUser);
    setIsLoggedIn(true);

    return {
      success: true,
      message: "Signed in successfully.",
    };
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      registeredUser,
      register,
      login,
      logout,
    }),
    [isLoggedIn, user, registeredUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

