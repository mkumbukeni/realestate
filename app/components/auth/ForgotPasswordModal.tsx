
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";

import {
  generateOtp,
  verifyOtp,
  updatePassword,
} from "@/app/components/auth/authApi";

interface ForgotPasswordModalProps {
  visible: boolean;
  initialEmail?: string;
  onClose: () => void;
  onSuccess?: (email: string) => void;
}

type RecoveryStep = "email" | "otp" | "password" | "success";

export default function ForgotPasswordModal({
  visible,
  initialEmail = "",
  onClose,
  onSuccess,
}: ForgotPasswordModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const [step, setStep] = useState<RecoveryStep>("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [verifiedEmail, setVerifiedEmail] = useState("");

  useEffect(() => {
    if (visible) {
      setEmail(initialEmail.trim());
      return;
    }

    setStep("email");
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
    setResendLoading(false);
    setError("");
    setSuccessMessage("");
    setVerifiedEmail("");
  }, [visible, initialEmail]);

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleClose = () => {
    if (loading || resendLoading) return;
    onClose();
  };

  // Stage 1: Generate OTP.
  const handleGenerateOtp = async () => {
    clearMessages();

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await generateOtp(trimmedEmail);

      setEmail(trimmedEmail);
      setOtp("");
      setVerifiedEmail("");
      setStep("otp");
      setSuccessMessage(
        `A verification code has been sent to ${trimmedEmail}.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send the verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Stage 2: Verify OTP.
  const handleVerifyOtp = async () => {
    clearMessages();

    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    try {
      setLoading(true);

      await verifyOtp(email.trim().toLowerCase(), otp.trim());

      setVerifiedEmail(email.trim().toLowerCase());
      setOtp("");
      setStep("password");
      setSuccessMessage(
        "Your verification code has been confirmed.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP.
  const handleResendOtp = async () => {
    clearMessages();

    try {
      setResendLoading(true);

      await generateOtp(email.trim().toLowerCase());

      setOtp("");
      setSuccessMessage("A new verification code has been sent.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend the verification code.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Stage 3: Update password.
  const handleUpdatePassword = async () => {
    clearMessages();

    if (!verifiedEmail) {
      setError("Please verify your email address first.");
      setStep("email");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const result = await updatePassword({
        email: verifiedEmail,
        password,
        password_confirmation: confirmPassword,
      });

      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setStep("success");
      setSuccessMessage(
        result.message || "Your password has been updated successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your password.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    const recoveredEmail = verifiedEmail || email.trim().toLowerCase();

    onSuccess?.(recoveredEmail);
    onClose();
  };

  const title =
    step === "email"
      ? "Account Recovery"
      : step === "otp"
        ? "Verify Your Email"
        : step === "password"
          ? "Reset Password"
          : "Password Updated";

  const subtitle =
    step === "email"
      ? "Enter the email address associated with your account."
      : step === "otp"
        ? "Enter the verification code sent to your email."
        : step === "password"
          ? "Choose a new password for your account."
          : "You can now sign in using your new password.";

  const primaryText = isDark ? "text-white" : "text-gray-900";
  const secondaryText = isDark ? "text-gray-400" : "text-gray-600";
  const labelText = isDark ? "text-gray-300" : "text-gray-700";
  const inputText = isDark ? "text-white" : "text-gray-900";
  const inputBackground = isDark ? "bg-[#1b1b1b]" : "bg-gray-50";
  const inputBorder = isDark ? "border-[#303030]" : "border-gray-300";
  const iconColor = isDark ? "#9ca3af" : "#6b7280";

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
    icon: React.ComponentProps<typeof Ionicons>["name"],
    options: {
      secureTextEntry?: boolean;
      keyboardType?: "default" | "email-address" | "number-pad";
      autoCapitalize?: "none" | "sentences";
      rightIcon?: React.ReactNode;
      maxLength?: number;
    } = {},
  ) => (
    <View className="mb-4">
      <Text className={`mb-2 text-sm font-semibold ${labelText}`}>
        {label}
      </Text>

      <View
        className={`flex-row items-center rounded-xl border px-4 ${inputBorder} ${inputBackground}`}
      >
        <Ionicons name={icon} size={20} color={iconColor} />

        <TextInput
          value={value}
          onChangeText={(value) => {
            onChangeText(value);
            clearMessages();
          }}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          secureTextEntry={options.secureTextEntry}
          keyboardType={options.keyboardType || "default"}
          autoCapitalize={options.autoCapitalize || "none"}
          autoCorrect={false}
          editable={!loading}
          maxLength={options.maxLength}
          className={`ml-3 flex-1 py-4 text-[15px] ${inputText}`}
        />

        {options.rightIcon}
      </View>
    </View>
  );

  const renderPasswordInput = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    visiblePassword: boolean,
    togglePassword: () => void,
    placeholder: string,
  ) =>
    renderInput(
      label,
      value,
      onChangeText,
      placeholder,
      "lock-closed-outline",
      {
        secureTextEntry: !visiblePassword,
        rightIcon: (
          <Pressable
            onPress={togglePassword}
            disabled={loading}
            className="ml-2 p-1"
            accessibilityRole="button"
            accessibilityLabel={
              visiblePassword ? "Hide password" : "Show password"
            }
          >
            <Ionicons
              name={visiblePassword ? "eye-off-outline" : "eye-outline"}
              size={21}
              color={iconColor}
            />
          </Pressable>
        ),
      },
    );

  const renderButton = (
    label: string,
    onPress: () => void,
    disabled = false,
    icon: React.ComponentProps<typeof Ionicons>["name"] = "arrow-forward",
  ) => (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      className={`mt-2 min-h-14 flex-row items-center justify-center rounded-xl bg-red-600 px-4 py-4 ${
        disabled || loading ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <>
          <Ionicons name={icon} size={20} color="#ffffff" />
          <Text className="ml-2 text-[15px] font-bold text-white">
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          className="absolute inset-0 bg-black/70"
          onPress={handleClose}
          disabled={loading || resendLoading}
        />

        <View
          className={`max-h-[92%] w-full rounded-t-3xl border-t ${
            isDark
              ? "border-[#292929] bg-[#111111]"
              : "border-gray-200 bg-white"
          }`}
        >
          <View className="items-center pb-2 pt-3">
            <View
              className={`h-1.5 w-12 rounded-full ${
                isDark ? "bg-[#3a3a3a]" : "bg-gray-300"
              }`}
            />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <View className="px-6 pb-4 pt-3">
              <View className="mb-6 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className={`text-2xl font-bold ${primaryText}`}>
                    {title}
                  </Text>
                  <Text className={`mt-1 text-sm ${secondaryText}`}>
                    {subtitle}
                  </Text>
                </View>

                <Pressable
                  onPress={handleClose}
                  disabled={loading || resendLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Close account recovery"
                  className={`ml-4 h-10 w-10 items-center justify-center rounded-full ${
                    isDark ? "bg-[#222222]" : "bg-gray-100"
                  }`}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={isDark ? "#ffffff" : "#111111"}
                  />
                </Pressable>
              </View>

              <View className="mb-5 flex-row items-center justify-center">
                {(["email", "otp", "password", "success"] as const).map(
                  (item, index) => {
                    const steps = ["email", "otp", "password", "success"];
                    const activeIndex = steps.indexOf(step);
                    const completed = index < activeIndex;
                    const active = index === activeIndex;

                    return (
                      <React.Fragment key={item}>
                        <View
                          className="h-8 w-8 items-center justify-center rounded-full"
                          style={{
                            backgroundColor:
                              active || completed
                                ? "#dc2626"
                                : isDark
                                  ? "#292929"
                                  : "#e5e7eb",
                          }}
                        >
                          {completed ? (
                            <Ionicons
                              name="checkmark"
                              size={17}
                              color="#ffffff"
                            />
                          ) : (
                            <Text
                              className={`text-xs font-bold ${
                                active
                                  ? "text-white"
                                  : isDark
                                    ? "text-gray-400"
                                    : "text-gray-600"
                              }`}
                            >
                              {index + 1}
                            </Text>
                          )}
                        </View>

                        {index < 3 ? (
                          <View
                            className="mx-1 h-px flex-1"
                            style={{
                              backgroundColor:
                                completed
                                  ? "#dc2626"
                                  : isDark
                                    ? "#292929"
                                    : "#d1d5db",
                            }}
                          />
                        ) : null}
                      </React.Fragment>
                    );
                  },
                )}
              </View>

              {error ? (
                <View
                  className={`mb-4 flex-row items-start rounded-xl border px-4 py-3 ${
                    isDark
                      ? "border-red-900 bg-red-950/40"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color="#ef4444"
                  />
                  <Text
                    className={`ml-2 flex-1 text-sm ${
                      isDark ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              {successMessage ? (
                <View
                  className={`mb-4 flex-row items-start rounded-xl border px-4 py-3 ${
                    isDark
                      ? "border-green-900 bg-green-950/30"
                      : "border-green-200 bg-green-50"
                  }`}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#22c55e"
                  />
                  <Text
                    className={`ml-2 flex-1 text-sm ${
                      isDark ? "text-green-400" : "text-green-700"
                    }`}
                  >
                    {successMessage}
                  </Text>
                </View>
              ) : null}

              {step === "email" ? (
                <>
                  <View className="mb-5 items-center">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-red-600/10">
                      <Ionicons
                        name="mail-outline"
                        size={30}
                        color="#ef4444"
                      />
                    </View>
                    <Text className={`mt-4 text-center text-lg font-bold ${primaryText}`}>
                      Recover Your Account
                    </Text>
                    <Text className={`mt-2 text-center text-sm leading-5 ${secondaryText}`}>
                      We will send a one-time verification code to your email.
                    </Text>
                  </View>

                  {renderInput(
                    "Email Address",
                    email,
                    setEmail,
                    "Enter your registered email",
                    "mail-outline",
                    { keyboardType: "email-address" },
                  )}

                  {renderButton(
                    "Send Verification Code",
                    handleGenerateOtp,
                    !isValidEmail(email),
                    "send-outline",
                  )}
                </>
              ) : null}

              {step === "otp" ? (
                <>
                  <View
                    className={`mb-5 rounded-2xl border p-5 ${
                      isDark
                        ? "border-neutral-800 bg-[#171717]"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <View className="items-center">
                      <View className="h-14 w-14 items-center justify-center rounded-full bg-red-600/10">
                        <Ionicons
                          name="mail-open-outline"
                          size={28}
                          color="#ef4444"
                        />
                      </View>
                      <Text className={`mt-3 text-base font-semibold ${primaryText}`}>
                        Check Your Email
                      </Text>
                      <Text className={`mt-2 text-center text-sm ${secondaryText}`}>
                        Verification code sent to
                      </Text>
                      <Text className={`mt-1 text-center text-sm font-semibold ${primaryText}`}>
                        {email}
                      </Text>
                    </View>
                  </View>

                  {renderInput(
                    "Verification Code",
                    otp,
                    (value) => setOtp(value.replace(/[^0-9]/g, "")),
                    "Enter OTP",
                    "keypad-outline",
                    { keyboardType: "number-pad", maxLength: 8 },
                  )}

                  {renderButton(
                    "Verify Code",
                    handleVerifyOtp,
                    !otp.trim(),
                    "shield-checkmark-outline",
                  )}

                  <View className="mt-5 items-center">
                    <Text className={`text-sm ${secondaryText}`}>
                      Didn't receive the code?
                    </Text>

                    <Pressable
                      onPress={handleResendOtp}
                      disabled={resendLoading || loading}
                      className="mt-2"
                    >
                      {resendLoading ? (
                        <ActivityIndicator color="#ef4444" />
                      ) : (
                        <Text className="font-bold text-red-500">
                          Resend Code
                        </Text>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        clearMessages();
                        setOtp("");
                        setStep("email");
                      }}
                      disabled={loading || resendLoading}
                      className="mt-4"
                    >
                      <Text className={`text-sm ${secondaryText}`}>
                        Use a different email
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : null}

              {step === "password" ? (
                <>
                  <View
                    className={`mb-5 rounded-xl border p-4 ${
                      isDark
                        ? "border-green-900 bg-green-950/20"
                        : "border-green-200 bg-green-50"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={23}
                        color="#22c55e"
                      />
                      <View className="ml-3 flex-1">
                        <Text className="font-semibold text-green-600">
                          Email Verified
                        </Text>
                        <Text className={`mt-1 text-xs ${secondaryText}`}>
                          {verifiedEmail}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {renderPasswordInput(
                    "New Password",
                    password,
                    setPassword,
                    showPassword,
                    () => setShowPassword((previous) => !previous),
                    "Enter your new password",
                  )}

                  <Text className={`-mt-2 mb-4 text-xs ${secondaryText}`}>
                    Use at least 8 characters.
                  </Text>

                  {renderPasswordInput(
                    "Confirm New Password",
                    confirmPassword,
                    setConfirmPassword,
                    showConfirmPassword,
                    () =>
                      setShowConfirmPassword((previous) => !previous),
                    "Re-enter your new password",
                  )}

                  {confirmPassword.length > 0 ? (
                    <View className="mb-3 flex-row items-center">
                      <Ionicons
                        name={
                          password === confirmPassword
                            ? "checkmark-circle"
                            : "alert-circle"
                        }
                        size={16}
                        color={
                          password === confirmPassword
                            ? "#22c55e"
                            : "#ef4444"
                        }
                      />
                      <Text
                        className={`ml-2 text-xs ${
                          password === confirmPassword
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {password === confirmPassword
                          ? "Passwords match"
                          : "Passwords do not match"}
                      </Text>
                    </View>
                  ) : null}

                  {renderButton(
                    "Update Password",
                    handleUpdatePassword,
                    password.length < 8 ||
                      !confirmPassword ||
                      password !== confirmPassword,
                    "lock-closed-outline",
                  )}

                  <Pressable
                    onPress={() => {
                      clearMessages();
                      setStep("otp");
                    }}
                    disabled={loading}
                    className="mt-4 items-center"
                  >
                    <Text className={`text-sm ${secondaryText}`}>
                      Back to OTP verification
                    </Text>
                  </Pressable>
                </>
              ) : null}

              {step === "success" ? (
                <>
                  <View
                    className={`items-center rounded-2xl border p-6 ${
                      isDark
                        ? "border-green-900 bg-green-950/20"
                        : "border-green-200 bg-green-50"
                    }`}
                  >
                    <View className="h-20 w-20 items-center justify-center rounded-full bg-green-600/10">
                      <Ionicons
                        name="checkmark-circle"
                        size={54}
                        color="#22c55e"
                      />
                    </View>

                    <Text className={`mt-5 text-center text-xl font-bold ${primaryText}`}>
                      Password Reset Successful
                    </Text>

                    <Text className={`mt-2 text-center text-sm leading-5 ${secondaryText}`}>
                      Your password has been updated. Sign in using your new password.
                    </Text>

                    <Text className="mt-3 text-center text-sm font-semibold text-green-500">
                      {verifiedEmail}
                    </Text>
                  </View>

                  <Pressable
                    onPress={handleFinish}
                    className="mt-5 min-h-14 items-center justify-center rounded-xl bg-red-600 px-4 py-4"
                  >
                    <Text className="text-[15px] font-bold text-white">
                      Return to Sign In
                    </Text>
                  </Pressable>
                </>
              ) : null}

              {step !== "success" ? (
                <Pressable
                  onPress={handleClose}
                  disabled={loading || resendLoading}
                  className="mt-5 items-center py-2"
                >
                  <Text className={`text-sm ${secondaryText}`}>
                    Cancel and return to sign in
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
