
import {
  generateOtp,
  registerUser,
  verifyOtp,
} from "@/app/components/auth/authApi";
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

interface RegisterModalProps {
  visible: boolean;
  onRegister?: (
    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    confirmPassword: string,
  ) => void;
  onSignIn?: () => void;
  onLogin?: () => void;
  onClose: () => void;
}

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
  onLogin,
}: RegisterModalProps) {
  const isDark = useColorScheme() !== "light";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<RegistrationStep>("generateOtp");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!visible) {
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setAddress("");
      setOtp("");
      setStep("generateOtp");
      setVerifiedEmail("");
      setLoading(false);
      setResendLoading(false);
      setError("");
      setSuccessMessage("");
    }
  }, [visible]);

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const isEmailValid = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const emailFormValid = isEmailValid(email);
  const otpFormValid = otp.trim().length > 0;

  const detailsFormValid =
    fullName.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    address.trim().length > 0;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setVerifiedEmail("");
    setOtp("");
    clearMessages();
  };

  const handleGenerateOtp = async () => {
    clearMessages();

    const trimmedEmail = email.trim().toLowerCase();

    if (!isEmailValid(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await generateOtp(trimmedEmail);

      setEmail(trimmedEmail);
      setOtp("");
      setVerifiedEmail("");
      setStep("verifyOtp");
      setSuccessMessage(
        `Verification code sent to ${trimmedEmail}.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    clearMessages();

    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();

      await verifyOtp(normalizedEmail, otp.trim());

      setVerifiedEmail(normalizedEmail);
      setStep("details");
      setOtp("");
      setSuccessMessage("Email verified successfully.");
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

  const handleResendOtp = async () => {
    clearMessages();

    try {
      setResendLoading(true);

      await generateOtp(email.trim().toLowerCase());

      setOtp("");
      setVerifiedEmail("");
      setStep("verifyOtp");
      setSuccessMessage(
        "A new verification code has been sent.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification code.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangeEmail = () => {
    clearMessages();
    setEmail("");
    setOtp("");
    setVerifiedEmail("");
    setStep("generateOtp");
  };

  const handleRegister = async () => {
    clearMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (
      !verifiedEmail ||
      normalizedEmail !== verifiedEmail
    ) {
      setVerifiedEmail("");
      setOtp("");
      setStep("generateOtp");
      setError("Please verify your current email address.");
      return;
    }

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!address.trim()) {
      setError("Please enter your address.");
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
        channel: "email",
      });

      setStep("success");
      setSuccessMessage(
        "Your account has been created successfully.",
      );

      // The registration API does not accept a password.
      // Keep the existing parent callback signature.
      onRegister?.(
        fullName.trim(),
        verifiedEmail,
        phoneNumber.trim(),
        "",
        "",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    if (loading || resendLoading) return;

    // Support both callback names used by existing callers.
    const openLogin = onSignIn ?? onLogin;

    if (openLogin) {
      openLogin();
      return;
    }

    console.warn(
      "RegisterModal: No onSignIn/onLogin callback was provided. " +
        "The parent component must open the login modal.",
    );
  };

  const handleClose = () => {
    if (loading || resendLoading) return;
    onClose();
  };

  const currentStage =
    step === "generateOtp"
      ? 1
      : step === "verifyOtp"
        ? 2
        : step === "details"
          ? 3
          : 4;

  const title =
    step === "generateOtp"
      ? "Create Account"
      : step === "verifyOtp"
        ? "Verify Email"
        : step === "details"
          ? "Registration Details"
          : "Registration Complete";

  const subtitle =
    step === "generateOtp"
      ? "Enter your email to receive a verification code."
      : step === "verifyOtp"
        ? "Enter the verification code sent to your email."
        : step === "details"
          ? "Enter your details to complete registration."
          : "Your account has been created successfully.";

  const primaryText = isDark
    ? "text-white"
    : "text-gray-900";

  const secondaryText = isDark
    ? "text-gray-400"
    : "text-gray-600";

  const labelText = isDark
    ? "text-gray-300"
    : "text-gray-700";

  const inputText = isDark
    ? "text-white"
    : "text-gray-900";

  const inputBackground = isDark
    ? "bg-[#1b1b1b]"
    : "bg-gray-50";

  const inputBorder = isDark
    ? "border-[#303030]"
    : "border-gray-300";

  const iconColor = isDark ? "#9ca3af" : "#6b7280";

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
    icon: React.ComponentProps<typeof Ionicons>["name"],
    options: {
      keyboardType?:
        | "default"
        | "email-address"
        | "phone-pad"
        | "number-pad";
      autoCapitalize?:
        | "none"
        | "sentences"
        | "words"
        | "characters";
      multiline?: boolean;
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
        <Ionicons
          name={icon}
          size={20}
          color={iconColor}
          style={
            options.multiline
              ? { marginTop: 14 }
              : undefined
          }
        />

        <TextInput
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            clearMessages();
          }}
          placeholder={placeholder}
          placeholderTextColor={
            isDark ? "#6b7280" : "#9ca3af"
          }
          keyboardType={options.keyboardType ?? "default"}
          autoCapitalize={
            options.autoCapitalize ?? "sentences"
          }
          autoCorrect={false}
          multiline={options.multiline}
          maxLength={options.maxLength}
          editable={!loading}
          textAlignVertical={
            options.multiline ? "top" : "center"
          }
          className={`ml-3 flex-1 py-4 text-[15px] ${inputText} ${
            options.multiline ? "min-h-[90px]" : ""
          }`}
        />
      </View>
    </View>
  );

  const renderButton = (
    label: string,
    onPress: () => void,
    disabled = false,
    icon: React.ComponentProps<typeof Ionicons>["name"] =
      "arrow-forward",
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
          <Ionicons
            name={icon}
            size={20}
            color="#ffffff"
          />
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
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        className="justify-end"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
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
              Platform.OS === "ios"
                ? "interactive"
                : "on-drag"
            }
            automaticallyAdjustKeyboardInsets={
              Platform.OS === "ios"
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <View className="px-6 pb-3 pt-3">
              {/* Title and instructions */}
              <View className="mb-5 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    className={`text-2xl font-bold ${primaryText}`}
                  >
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
                  accessibilityLabel="Close registration"
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

              {/* Progress indicator */}
              <View className="mb-5 flex-row items-center">
                {["OTP", "Verify", "Details", "Done"].map(
                  (label, index) => {
                    const number = index + 1;
                    const completed = number < currentStage;
                    const active = number === currentStage;

                    return (
                      <React.Fragment key={label}>
                        <View className="items-center">
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
                                size={16}
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
                                {number}
                              </Text>
                            )}
                          </View>

                          <Text
                            className={`mt-1 text-[10px] ${
                              active || completed
                                ? "text-red-500"
                                : secondaryText
                            }`}
                          >
                            {label}
                          </Text>
                        </View>

                        {index < 3 ? (
                          <View
                            className="mx-1 h-px flex-1"
                            style={{
                              backgroundColor:
                                number < currentStage
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

              {/* Error message */}
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
                      isDark
                        ? "text-red-400"
                        : "text-red-600"
                    }`}
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Success message */}
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
                      isDark
                        ? "text-green-400"
                        : "text-green-700"
                    }`}
                  >
                    {successMessage}
                  </Text>
                </View>
              ) : null}

              {/* Step 1: Email */}
              {step === "generateOtp" ? (
                <>
                  {renderInput(
                    "Email Address",
                    email,
                    handleEmailChange,
                    "Enter your email",
                    "mail-outline",
                    {
                      keyboardType: "email-address",
                      autoCapitalize: "none",
                    },
                  )}

                  {renderButton(
                    "Send Verification Code",
                    handleGenerateOtp,
                    !emailFormValid,
                    "send-outline",
                  )}
                </>
              ) : null}

              {/* Step 2: OTP verification */}
              {step === "verifyOtp" ? (
                <>
                  {renderInput(
                    "Verification Code",
                    otp,
                    (value) =>
                      setOtp(value.replace(/[^0-9]/g, "")),
                    "Enter OTP",
                    "keypad-outline",
                    {
                      keyboardType: "number-pad",
                      autoCapitalize: "none",
                      maxLength: 8,
                    },
                  )}

                  {renderButton(
                    "Verify Email",
                    handleVerifyOtp,
                    !otpFormValid,
                    "shield-checkmark-outline",
                  )}

                  <View className="mt-4 items-center">
                    <Pressable
                      onPress={handleResendOtp}
                      disabled={resendLoading || loading}
                      accessibilityRole="button"
                    >
                      {resendLoading ? (
                        <ActivityIndicator color="#ef4444" />
                      ) : (
                        <Text className="font-semibold text-red-500">
                          Resend Code
                        </Text>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={handleChangeEmail}
                      disabled={loading || resendLoading}
                      className="mt-4"
                      accessibilityRole="button"
                    >
                      <Text className={`text-sm ${secondaryText}`}>
                        Use a different email
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : null}

              {/* Step 3: Registration details */}
              {step === "details" ? (
                <>
                  <View className="mb-4 flex-row items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#22c55e"
                    />

                    <Text
                      className={`ml-2 flex-1 text-sm ${secondaryText}`}
                    >
                      Verified email: {verifiedEmail}
                    </Text>
                  </View>

                  {renderInput(
                    "Full Name",
                    fullName,
                    setFullName,
                    "Enter your full name",
                    "person-outline",
                    { autoCapitalize: "words" },
                  )}

                  {renderInput(
                    "Phone Number",
                    phoneNumber,
                    setPhoneNumber,
                    "Enter your phone number",
                    "call-outline",
                    {
                      keyboardType: "phone-pad",
                      autoCapitalize: "none",
                    },
                  )}

                  {renderInput(
                    "Address",
                    address,
                    setAddress,
                    "Enter your address",
                    "location-outline",
                    {
                      multiline: true,
                      autoCapitalize: "sentences",
                    },
                  )}

                  {renderButton(
                    "Create Account",
                    handleRegister,
                    !detailsFormValid,
                    "person-add-outline",
                  )}

                  <Pressable
                    onPress={handleChangeEmail}
                    disabled={loading}
                    className="mt-4 items-center"
                    accessibilityRole="button"
                  >
                    <Text className={`text-sm ${secondaryText}`}>
                      Use a different email
                    </Text>
                  </Pressable>
                </>
              ) : null}

              {/* Step 4: Registration success */}
              {step === "success" ? (
                <>
                  <View className="items-center py-5">
                    <Ionicons
                      name="checkmark-circle"
                      size={54}
                      color="#22c55e"
                    />

                    <Text
                      className={`mt-3 text-center text-lg font-bold ${primaryText}`}
                    >
                      Registration Complete
                    </Text>

                    <Text
                      className={`mt-2 text-center text-sm ${secondaryText}`}
                    >
                      {verifiedEmail}
                    </Text>
                  </View>

                  <Pressable
                    onPress={onClose}
                    className="mt-2 min-h-14 items-center justify-center rounded-xl bg-red-600 px-4 py-4"
                    accessibilityRole="button"
                  >
                    <Text className="text-[15px] font-bold text-white">
                      Done
                    </Text>
                  </Pressable>
                </>
              ) : null}

              {/* Sign in */}
              {step !== "success" ? (
                <View className="mt-5 flex-row items-center justify-center">
                  <Text className={`text-sm ${secondaryText}`}>
                    Already have an account?
                  </Text>

                  <Pressable
                    onPress={handleSignIn}
                    disabled={loading || resendLoading}
                    className="ml-1.5"
                    accessibilityRole="button"
                    accessibilityLabel="Sign in to an existing account"
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
