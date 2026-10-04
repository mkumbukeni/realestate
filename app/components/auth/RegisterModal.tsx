
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
} from "react-native";

import {
  generateOtp,
  registerUser,
  verifyOtp,
} from "@/app/services/auth/authApi";

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;

  /**
   * Called after the backend registration succeeds.
   *
   * Password arguments are kept for compatibility with the
   * existing parent component, although the registration API
   * supplied does not accept a password.
   */
  onRegister?: (
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    confirmPassword: string,
  ) => void;

  onSignIn?: () => void;
}

/**
 * Registration flow:
 *
 * Stage 1: Generate OTP
 * Stage 2: Verify OTP
 * Stage 3: Registration Details
 * Stage 4: Registration Success
 */
type RegistrationStep =
  | "generateOtp"
  | "verifyOtp"
  | "details"
  | "success";

export default function RegisterModal({
  visible,
  onClose,
  onRegister,
  onSignIn,
}: RegisterModalProps) {
  // ----------------------------------------------------------
  // REGISTRATION DETAILS
  // ----------------------------------------------------------

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  // ----------------------------------------------------------
  // OTP
  // ----------------------------------------------------------

  const [otp, setOtp] = useState("");

  const [step, setStep] =
    useState<RegistrationStep>("generateOtp");

  const [otpSent, setOtpSent] = useState(false);

  const [emailVerified, setEmailVerified] =
    useState(false);

  /**
   * Exact email that was successfully verified.
   *
   * Registration will only be allowed if the email
   * entered during registration matches this email.
   */
  const [verifiedEmail, setVerifiedEmail] =
    useState("");

  // ----------------------------------------------------------
  // UI STATE
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [resendLoading, setResendLoading] =
    useState(false);

  // ----------------------------------------------------------
  // RESET
  // ----------------------------------------------------------

  useEffect(() => {
    if (!visible) {
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setAddress("");

      setOtp("");

      /**
       * Every time the modal is opened, start directly
       * with the Generate OTP screen.
       */
      setStep("generateOtp");

      setOtpSent(false);
      setEmailVerified(false);
      setVerifiedEmail("");

      setLoading(false);
      setResendLoading(false);

      setError("");
      setSuccessMessage("");
    }
  }, [visible]);

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  const isEmailValid = (value: string): boolean => {
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(value.trim());
  };

  const emailFormValid =
    email.trim().length > 0 &&
    isEmailValid(email);

  const otpFormValid =
    otp.trim().length > 0;

  const detailsFormValid =
    fullName.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    address.trim().length > 0;

  // ----------------------------------------------------------
  // ERROR HELPERS
  // ----------------------------------------------------------

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  // ----------------------------------------------------------
  // EMAIL CHANGE
  // ----------------------------------------------------------

  const handleEmailChange = (value: string) => {
    setEmail(value);

    /**
     * If the email changes, any previous verification
     * becomes invalid.
     */
    setEmailVerified(false);
    setVerifiedEmail("");

    setOtpSent(false);
    setOtp("");

    clearMessages();
  };

  // ----------------------------------------------------------
  // STAGE 1
  // GENERATE OTP
  // ----------------------------------------------------------

  const handleGenerateOtp = async () => {
    clearMessages();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!isEmailValid(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await generateOtp(trimmedEmail);

      setEmail(trimmedEmail);

      setOtp("");
      setOtpSent(true);

      setEmailVerified(false);
      setVerifiedEmail("");

      /**
       * OTP was successfully generated.
       * Move directly to OTP verification.
       */
      setStep("verifyOtp");

      setSuccessMessage(
        `A verification code has been sent to ${trimmedEmail}.`,
      );
    } catch (err) {
      console.error(
        "Failed to generate OTP:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to send verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // STAGE 2
  // VERIFY OTP
  // ----------------------------------------------------------

  const handleVerifyOtp = async () => {
    clearMessages();

    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail) {
      setError("Email address is required.");
      setStep("generateOtp");
      return;
    }

    if (!trimmedOtp) {
      setError(
        "Please enter the verification code.",
      );
      return;
    }

    try {
      setLoading(true);

      await verifyOtp(
        trimmedEmail,
        trimmedOtp,
      );

      /**
       * OTP verification succeeded.
       */
      setEmailVerified(true);
      setVerifiedEmail(trimmedEmail);

      setSuccessMessage(
        "Your email has been verified successfully.",
      );

      /**
       * Move directly to the registration details.
       */
      setTimeout(() => {
        setStep("details");
        setSuccessMessage("");
      }, 500);
    } catch (err) {
      console.error(
        "Failed to verify OTP:",
        err,
      );

      setEmailVerified(false);
      setVerifiedEmail("");

      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // RESEND OTP
  // ----------------------------------------------------------

  const handleResendOtp = async () => {
    clearMessages();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email address is required.");
      setStep("generateOtp");
      return;
    }

    if (!isEmailValid(trimmedEmail)) {
      setError("Please enter a valid email address.");
      setStep("generateOtp");
      return;
    }

    try {
      setResendLoading(true);

      await generateOtp(trimmedEmail);

      /**
       * A new OTP has been generated.
       * The user must verify the new OTP.
       */
      setOtp("");
      setEmailVerified(false);
      setVerifiedEmail("");
      setOtpSent(true);

      setStep("verifyOtp");

      setSuccessMessage(
        `A new verification code has been sent to ${trimmedEmail}.`,
      );
    } catch (err) {
      console.error(
        "Failed to resend OTP:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification code.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  // ----------------------------------------------------------
  // CHANGE EMAIL
  // ----------------------------------------------------------

  const handleChangeEmail = () => {
    clearMessages();

    setEmail("");
    setOtp("");

    setOtpSent(false);
    setEmailVerified(false);
    setVerifiedEmail("");

    /**
     * Return to the first stage.
     */
    setStep("generateOtp");
  };

  // ----------------------------------------------------------
  // STAGE 3
  // REGISTER USER
  // ----------------------------------------------------------

  const handleRegister = async () => {
    clearMessages();

    const trimmedEmail = email.trim();

    /**
     * Registration is only allowed after OTP verification.
     */
    if (!emailVerified) {
      setError(
        "Please verify your email address before registering.",
      );

      setStep("generateOtp");

      return;
    }

    /**
     * Make sure the email being registered is exactly
     * the email that was verified.
     */
    if (
      !verifiedEmail ||
      trimmedEmail.toLowerCase() !==
        verifiedEmail.toLowerCase()
    ) {
      setEmailVerified(false);
      setVerifiedEmail("");
      setOtp("");
      setOtpSent(false);

      setStep("generateOtp");

      setError(
        "The email address has changed. Please verify the new email address.",
      );

      return;
    }

    if (!fullName.trim()) {
      setError(
        "Please enter your full name.",
      );
      return;
    }

    if (!trimmedEmail) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (!isEmailValid(trimmedEmail)) {
      setError(
        "Please enter a valid email address.",
      );
      return;
    }

    if (!phoneNumber.trim()) {
      setError(
        "Please enter your phone number.",
      );
      return;
    }

    if (!address.trim()) {
      setError(
        "Please enter your address.",
      );
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        phone: phoneNumber.trim(),
        address: address.trim(),
        email: verifiedEmail,
        name: fullName.trim(),
        role_name: "client",
      });

      /**
       * Backend registration succeeded.
       */
      setSuccessMessage(
        "Your account has been created successfully.",
      );

      /**
       * Preserve the existing callback signature.
       *
       * The supplied registration API does not accept
       * passwords, so empty strings are passed.
       */
      onRegister?.(
        fullName.trim(),
        verifiedEmail,
        phoneNumber.trim(),
        "",
        "",
      );

      /**
       * Move to the final success stage.
       */
      setStep("success");
    } catch (err) {
      console.error(
        "Registration failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // SIGN IN
  // ----------------------------------------------------------

  const handleSignIn = () => {
    clearMessages();

    onClose();

    if (onSignIn) {
      setTimeout(() => {
        onSignIn();
      }, 250);
    }
  };

  // ----------------------------------------------------------
  // CLOSE
  // ----------------------------------------------------------

  const handleClose = () => {
    if (loading || resendLoading) {
      return;
    }

    onClose();
  };

  // ----------------------------------------------------------
  // STAGE INDICATOR
  // ----------------------------------------------------------

  const currentStage =
    step === "generateOtp"
      ? 1
      : step === "verifyOtp"
        ? 2
        : step === "details"
          ? 3
          : 4;

  const stages = [
    {
      number: 1,
      label: "Generate OTP",
    },
    {
      number: 2,
      label: "Verify OTP",
    },
    {
      number: 3,
      label: "Register",
    },
    {
      number: 4,
      label: "Complete",
    },
  ];

  // ----------------------------------------------------------
  // HEADER TEXT
  // ----------------------------------------------------------

  const getHeaderSubtitle = () => {
    switch (step) {
      case "generateOtp":
        return "Enter your email to receive an OTP.";

      case "verifyOtp":
        return "Enter the code sent to your email.";

      case "details":
        return "Complete your registration.";

      case "success":
        return "Your account has been created.";

      default:
        return "";
    }
  };

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        {/* BACKDROP */}
        <Pressable
          className="absolute inset-0 bg-black/70"
          onPress={handleClose}
        />

        {/* BOTTOM SHEET */}
        <View className="max-h-[92%] w-full rounded-t-3xl border-t border-[#292929] bg-[#111111]">
          {/* DRAG HANDLE */}
          <View className="items-center pb-2 pt-3">
            <View className="h-1.5 w-12 rounded-full bg-[#3a3a3a]" />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios"
                ? "interactive"
                : "on-drag"
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 30,
            }}
          >
            <View className="px-6 pb-2 pt-3">
              {/* HEADER */}
              <View className="mb-5 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-white">
                    Create Account
                  </Text>

                  <Text className="mt-1 text-sm text-gray-400">
                    {getHeaderSubtitle()}
                  </Text>
                </View>

                <Pressable
                  onPress={handleClose}
                  disabled={
                    loading || resendLoading
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Close register"
                  className="ml-4 h-10 w-10 items-center justify-center rounded-full bg-[#222222]"
                  style={({ pressed }) => ({
                    opacity:
                      loading ||
                      resendLoading
                        ? 0.4
                        : pressed
                          ? 0.7
                          : 1,
                  })}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color="#ffffff"
                  />
                </Pressable>
              </View>

              {/* FOUR-STAGE INDICATOR */}
              <View className="mb-6 flex-row items-center">
                {stages.map(
                  (stageItem, index) => {
                    const completed =
                      stageItem.number <
                      currentStage;

                    const active =
                      stageItem.number ===
                      currentStage;

                    return (
                      <React.Fragment
                        key={stageItem.number}
                      >
                        <View className="items-center">
                          <View
                            className="h-8 w-8 items-center justify-center rounded-full"
                            style={{
                              backgroundColor:
                                completed ||
                                active
                                  ? "#dc2626"
                                  : "#292929",
                            }}
                          >
                            {completed ? (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color="#ffffff"
                              />
                            ) : (
                              <Text className="text-xs font-bold text-white">
                                {
                                  stageItem.number
                                }
                              </Text>
                            )}
                          </View>

                          <Text
                            className="mt-1 text-[8px]"
                            style={{
                              color:
                                completed ||
                                active
                                  ? "#f87171"
                                  : "#666666",
                            }}
                          >
                            {stageItem.label}
                          </Text>
                        </View>

                        {index <
                        stages.length - 1 ? (
                          <View
                            className="mx-1 h-[1px] flex-1"
                            style={{
                              backgroundColor:
                                stageItem.number <
                                currentStage
                                  ? "#dc2626"
                                  : "#292929",
                            }}
                          />
                        ) : null}
                      </React.Fragment>
                    );
                  },
                )}
              </View>

              {/* ERROR */}
              {error ? (
                <View className="mb-5 flex-row items-center rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3">
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color="#ef4444"
                  />

                  <Text className="ml-2 flex-1 text-sm text-red-400">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* SUCCESS */}
              {successMessage ? (
                <View className="mb-5 flex-row items-center rounded-xl border border-green-900/60 bg-green-950/30 px-4 py-3">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#22c55e"
                  />

                  <Text className="ml-2 flex-1 text-sm text-green-400">
                    {successMessage}
                  </Text>
                </View>
              ) : null}

              {/* ==================================================
                  STAGE 1 — GENERATE OTP
                 ================================================== */}

              {step === "generateOtp" ? (
                <>
                  <View className="mb-6 items-center">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-red-950/50">
                      <Ionicons
                        name="mail-outline"
                        size={30}
                        color="#ef4444"
                      />
                    </View>

                    <Text className="mt-4 text-center text-xl font-bold text-white">
                      Generate OTP
                    </Text>

                    <Text className="mt-2 text-center text-sm leading-5 text-neutral-400">
                      Enter your email address and
                      we will send you a one-time
                      verification code.
                    </Text>
                  </View>

                  {/* EMAIL */}
                  <View className="mb-5">
                    <Text className="mb-2 text-sm font-semibold text-gray-300">
                      Email Address
                    </Text>

                    <View className="flex-row items-center rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color="#9ca3af"
                      />

                      <TextInput
                        value={email}
                        onChangeText={
                          handleEmailChange
                        }
                        placeholder="Enter your email"
                        placeholderTextColor="#6b7280"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={
                          handleGenerateOtp
                        }
                        className="ml-3 flex-1 py-4 text-[15px] text-white"
                      />
                    </View>
                  </View>

                  {/* GENERATE OTP BUTTON */}
                  <Pressable
                    onPress={handleGenerateOtp}
                    disabled={
                      !emailFormValid ||
                      loading
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Generate OTP"
                    className={`mt-2 h-13 items-center justify-center rounded-xl bg-red-600 ${
                      !emailFormValid ||
                      loading
                        ? "opacity-50"
                        : ""
                    }`}
                    style={({ pressed }) => ({
                      opacity:
                        !emailFormValid ||
                        loading
                          ? 0.5
                          : pressed
                            ? 0.7
                            : 1,
                    })}
                  >
                    {loading ? (
                      <ActivityIndicator
                        size="small"
                        color="#ffffff"
                      />
                    ) : (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="send-outline"
                          size={20}
                          color="#ffffff"
                        />

                        <Text className="ml-2 text-[15px] font-bold text-white">
                          Generate OTP
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </>
              ) : null}

              {/* ==================================================
                  STAGE 2 — VERIFY OTP
                 ================================================== */}

              {step === "verifyOtp" ? (
                <>
                  {/* EMAIL CARD */}
                  <View className="mb-5 rounded-2xl border border-neutral-800 bg-[#171717] p-5">
                    <View className="items-center">
                      <View className="h-14 w-14 items-center justify-center rounded-full bg-red-950/50">
                        <Ionicons
                          name="mail-open-outline"
                          size={28}
                          color="#ef4444"
                        />
                      </View>

                      <Text className="mt-4 text-center text-base font-semibold text-white">
                        Check Your Email
                      </Text>

                      <Text className="mt-2 text-center text-sm leading-5 text-neutral-400">
                        We sent a verification
                        code to:
                      </Text>

                      <Text className="mt-1 text-center text-sm font-semibold text-white">
                        {email.trim()}
                      </Text>
                    </View>
                  </View>

                  {/* OTP */}
                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-semibold text-gray-300">
                      Verification Code
                    </Text>

                    <View className="flex-row items-center rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                      <Ionicons
                        name="keypad-outline"
                        size={20}
                        color="#9ca3af"
                      />

                      <TextInput
                        value={otp}
                        onChangeText={(value) => {
                          const cleaned =
                            value.replace(
                              /[^0-9]/g,
                              "",
                            );

                          setOtp(cleaned);
                          clearMessages();
                        }}
                        placeholder="Enter OTP"
                        placeholderTextColor="#6b7280"
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        maxLength={8}
                        returnKeyType="done"
                        onSubmitEditing={
                          handleVerifyOtp
                        }
                        className="ml-3 flex-1 py-4 text-center text-[18px] font-bold tracking-[4px] text-white"
                      />
                    </View>
                  </View>

                  {/* VERIFY BUTTON */}
                  <Pressable
                    onPress={handleVerifyOtp}
                    disabled={
                      !otpFormValid ||
                      loading
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Verify OTP"
                    className={`mt-2 h-13 items-center justify-center rounded-xl bg-red-600 ${
                      !otpFormValid ||
                      loading
                        ? "opacity-50"
                        : ""
                    }`}
                    style={({ pressed }) => ({
                      opacity:
                        !otpFormValid ||
                        loading
                          ? 0.5
                          : pressed
                            ? 0.7
                            : 1,
                    })}
                  >
                    {loading ? (
                      <ActivityIndicator
                        size="small"
                        color="#ffffff"
                      />
                    ) : (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color="#ffffff"
                        />

                        <Text className="ml-2 text-[15px] font-bold text-white">
                          Verify Email
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  {/* RESEND */}
                  <View className="mt-5 items-center">
                    <Text className="text-sm text-gray-400">
                      Didn't receive the code?
                    </Text>

                    <Pressable
                      onPress={
                        handleResendOtp
                      }
                      disabled={resendLoading}
                      className="mt-2"
                      style={({ pressed }) => ({
                        opacity:
                          resendLoading
                            ? 0.5
                            : pressed
                              ? 0.7
                              : 1,
                      })}
                    >
                      {resendLoading ? (
                        <ActivityIndicator
                          size="small"
                          color="#ef4444"
                        />
                      ) : (
                        <Text className="text-sm font-bold text-red-500">
                          Resend Code
                        </Text>
                      )}
                    </Pressable>

                    {/* CHANGE EMAIL */}
                    <Pressable
                      onPress={
                        handleChangeEmail
                      }
                      disabled={loading}
                      className="mt-4"
                    >
                      <Text className="text-sm text-neutral-400">
                        Use a different email
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : null}

              {/* ==================================================
                  STAGE 3 — REGISTRATION DETAILS
                 ================================================== */}

              {step === "details" ? (
                <>
                  {/* VERIFIED EMAIL */}
                  <View className="mb-5 rounded-2xl border border-green-900/60 bg-green-950/20 p-4">
                    <View className="flex-row items-center">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-green-950/50">
                        <Ionicons
                          name="checkmark"
                          size={22}
                          color="#22c55e"
                        />
                      </View>

                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-semibold text-green-400">
                          Email Verified
                        </Text>

                        <Text
                          numberOfLines={1}
                          className="mt-1 text-xs text-neutral-400"
                        >
                          {verifiedEmail}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* FULL NAME */}
                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-semibold text-gray-300">
                      Full Name
                    </Text>

                    <View className="flex-row items-center rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color="#9ca3af"
                      />

                      <TextInput
                        value={fullName}
                        onChangeText={(value) => {
                          setFullName(value);
                          clearMessages();
                        }}
                        placeholder="Enter your full name"
                        placeholderTextColor="#6b7280"
                        autoCapitalize="words"
                        autoCorrect={false}
                        returnKeyType="next"
                        className="ml-3 flex-1 py-4 text-[15px] text-white"
                      />
                    </View>
                  </View>

                  {/* VERIFIED EMAIL */}
                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-semibold text-gray-300">
                      Verified Email
                    </Text>

                    <View className="flex-row items-center rounded-xl border border-green-700 bg-[#111b14] px-4">
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="#22c55e"
                      />

                      <Text
                        numberOfLines={1}
                        className="ml-3 flex-1 py-4 text-[15px] text-gray-300"
                      >
                        {verifiedEmail}
                      </Text>

                      <Ionicons
                        name="lock-closed-outline"
                        size={17}
                        color="#22c55e"
                      />
                    </View>
                  </View>

                  {/* PHONE */}
                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-semibold text-gray-300">
                      Phone Number
                    </Text>

                    <View className="flex-row items-center rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color="#9ca3af"
                      />

                      <TextInput
                        value={phoneNumber}
                        onChangeText={(value) => {
                          setPhoneNumber(value);
                          clearMessages();
                        }}
                        placeholder="Enter your phone number"
                        placeholderTextColor="#6b7280"
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                        className="ml-3 flex-1 py-4 text-[15px] text-white"
                      />
                    </View>
                  </View>

                  {/* ADDRESS */}
                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-semibold text-gray-300">
                      Address
                    </Text>

                    <View className="flex-row items-start rounded-xl border border-[#303030] bg-[#1b1b1b] px-4">
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color="#9ca3af"
                        style={{
                          marginTop: 15,
                        }}
                      />

                      <TextInput
                        value={address}
                        onChangeText={(value) => {
                          setAddress(value);
                          clearMessages();
                        }}
                        placeholder="Enter your address"
                        placeholderTextColor="#6b7280"
                        autoCapitalize="sentences"
                        autoCorrect={false}
                        multiline
                        textAlignVertical="top"
                        className="ml-3 min-h-[90px] flex-1 py-4 text-[15px] text-white"
                      />
                    </View>
                  </View>

                  {/* CREATE ACCOUNT */}
                  <Pressable
                    onPress={handleRegister}
                    disabled={
                      !detailsFormValid ||
                      loading
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Create account"
                    className={`mt-2 h-13 items-center justify-center rounded-xl bg-red-600 ${
                      !detailsFormValid ||
                      loading
                        ? "opacity-50"
                        : ""
                    }`}
                    style={({ pressed }) => ({
                      opacity:
                        !detailsFormValid ||
                        loading
                          ? 0.5
                          : pressed
                            ? 0.7
                            : 1,
                    })}
                  >
                    {loading ? (
                      <ActivityIndicator
                        size="small"
                        color="#ffffff"
                      />
                    ) : (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="person-add-outline"
                          size={20}
                          color="#ffffff"
                        />

                        <Text className="ml-2 text-[15px] font-bold text-white">
                          Create Account
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  {/* CHANGE EMAIL */}
                  <Pressable
                    onPress={handleChangeEmail}
                    disabled={loading}
                    className="mt-4 items-center"
                  >
                    <Text className="text-sm font-medium text-neutral-400">
                      Use a different email
                    </Text>
                  </Pressable>
                </>
              ) : null}

              {/* ==================================================
                  STAGE 4 — SUCCESS
                 ================================================== */}

              {step === "success" ? (
                <>
                  <View className="items-center rounded-2xl border border-green-900/60 bg-green-950/20 p-6">
                    <View className="h-20 w-20 items-center justify-center rounded-full bg-green-950/50">
                      <Ionicons
                        name="checkmark-circle"
                        size={50}
                        color="#22c55e"
                      />
                    </View>

                    <Text className="mt-5 text-center text-xl font-bold text-white">
                      Registration Complete
                    </Text>

                    <Text className="mt-2 text-center text-sm leading-5 text-neutral-400">
                      Your account has been created
                      successfully.
                    </Text>

                    <Text className="mt-2 text-center text-sm font-semibold text-green-400">
                      {verifiedEmail}
                    </Text>
                  </View>

                  <Pressable
                    onPress={onClose}
                    className="mt-5 h-13 items-center justify-center rounded-xl bg-red-600"
                    style={({ pressed }) => ({
                      opacity: pressed
                        ? 0.7
                        : 1,
                    })}
                  >
                    <Text className="text-[15px] font-bold text-white">
                      Done
                    </Text>
                  </Pressable>
                </>
              ) : null}

              {/* SIGN IN */}
              {step !== "success" ? (
                <View className="mt-6 flex-row items-center justify-center">
                  <Text className="text-sm text-gray-400">
                    Already have an account?
                  </Text>

                  <Pressable
                    onPress={handleSignIn}
                    className="ml-1.5"
                    style={({ pressed }) => ({
                      opacity: pressed
                        ? 0.7
                        : 1,
                    })}
                  >
                    <Text className="text-sm font-bold text-red-500">
                      Sign In
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

