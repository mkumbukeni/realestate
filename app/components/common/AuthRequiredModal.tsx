
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import SignInModal from "./SignInModal";
import RegisterModal from "./RegisterModal";

interface AuthRequiredModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function AuthRequiredModal({
  visible,
  onClose,
  title = "Sign in required",
  message = "Please sign in or register to view the full property details.",
}: AuthRequiredModalProps) {
  const [signInVisible, setSignInVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);

  /*
   * Open Sign In bottom sheet
   */
  const handleSignIn = () => {
    onClose();

    setTimeout(() => {
      setSignInVisible(true);
    }, 250);
  };

  /*
   * Open Register bottom sheet
   */
  const handleRegister = () => {
    onClose();

    setTimeout(() => {
      setRegisterVisible(true);
    }, 250);
  };

  /*
   * Close Sign In bottom sheet
   */
  const handleSignInClose = () => {
    setSignInVisible(false);
  };

  /*
   * Close Register bottom sheet
   */
  const handleRegisterClose = () => {
    setRegisterVisible(false);
  };

  /*
   * Switch from Sign In → Register
   */
  const handleOpenRegisterFromSignIn = () => {
    setSignInVisible(false);

    setTimeout(() => {
      setRegisterVisible(true);
    }, 250);
  };

  /*
   * Switch from Register → Sign In
   */
  const handleOpenSignInFromRegister = () => {
    setRegisterVisible(false);

    setTimeout(() => {
      setSignInVisible(true);
    }, 250);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* AUTH REQUIRED MODAL                                       */}
      {/* ========================================================= */}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 items-center justify-center bg-black/75 px-6">
          <View className="w-full max-w-[400px] rounded-2xl border border-[#2a2a2a] bg-[#171717] p-6">

            {/* ICON */}
            <View className="mb-4 h-14 w-14 self-center items-center justify-center rounded-full bg-red-950/50">
              <Ionicons
                name="lock-closed-outline"
                size={28}
                color="#ef4444"
              />
            </View>

            {/* TITLE */}
            <Text className="text-center text-[21px] font-bold text-white">
              {title}
            </Text>

            {/* MESSAGE */}
            <Text className="mb-6 mt-2 text-center text-sm leading-5 text-gray-400">
              {message}
            </Text>

            {/* ===================================================== */}
            {/* SIGN IN BUTTON                                        */}
            {/* ===================================================== */}

            <Pressable
              onPress={handleSignIn}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              className="mb-2.5 h-12 flex-row items-center justify-center rounded-lg bg-red-600 active:opacity-70"
            >
              <Ionicons
                name="log-in-outline"
                size={19}
                color="#ffffff"
              />

              <Text className="ml-2 text-[15px] font-bold text-white">
                Sign In
              </Text>
            </Pressable>

            {/* ===================================================== */}
            {/* REGISTER BUTTON                                       */}
            {/* ===================================================== */}

            <Pressable
              onPress={handleRegister}
              accessibilityRole="button"
              accessibilityLabel="Register"
              className="mb-2.5 h-12 flex-row items-center justify-center rounded-lg border border-[#3a3a3a] bg-[#262626] active:opacity-70"
            >
              <Ionicons
                name="person-add-outline"
                size={19}
                color="#ffffff"
              />

              <Text className="ml-2 text-[15px] font-bold text-white">
                Register
              </Text>
            </Pressable>

            {/* ===================================================== */}
            {/* CANCEL BUTTON                                         */}
            {/* ===================================================== */}

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              className="h-10 items-center justify-center active:opacity-70"
            >
              <Text className="text-sm font-semibold text-gray-400">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* SIGN IN BOTTOM SHEET                                      */}
      {/* ========================================================= */}

      <SignInModal
        visible={signInVisible}
        onClose={handleSignInClose}
        onSignIn={(email, password) => {
          /*
           * Connect your existing authentication logic here.
           *
           * email
           * password
           */
          console.log("Sign in:", {
            email,
            password,
          });
        }}
        onRegister={handleOpenRegisterFromSignIn}
      />

      {/* ========================================================= */}
      {/* REGISTER BOTTOM SHEET                                     */}
      {/* ========================================================= */}

      <RegisterModal
        visible={registerVisible}
        onClose={handleRegisterClose}
        onRegister={(fullName, email, phoneNumber) => {
          /*
           * Connect your registration API here.
           *
           * fullName
           * email
           * phoneNumber
           */
          console.log("Register:", {
            fullName,
            email,
            phoneNumber,
          });
        }}
        onSignIn={handleOpenSignInFromRegister}
      />
    </>
  );
}

