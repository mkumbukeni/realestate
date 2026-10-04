import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

import RegisterModal from "@/app/components/auth/RegisterModal";
import LoginModal from "@/app/components/auth/LoginModal";

const SCREEN_WIDTH =
  Dimensions.get("window").width;

const MENU_WIDTH = SCREEN_WIDTH * 0.58;

export type SideMenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
};

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  items?: SideMenuItem[];
}

const DEFAULT_MENU_ITEMS: SideMenuItem[] = [
  {
    label: "Sign In",
    icon: "log-in-outline",
  },
  {
    label: "Register",
    icon: "person-add-outline",
  },
  {
    label: "Browse Properties",
    icon: "home-outline",
    route: "/(tabs)/properties",
  },
  {
    label: "Registered Estate Agents",
    icon: "people-outline",
    route: "/estate-agents",
  },
  {
    label: "List Properties",
    icon: "add-circle-outline",
    route: "/list-property",
  },
  {
    label: "Special Property Request",
    icon: "search-circle-outline",
    route: "/special-property-request",
  },
  {
    label: "Blogs",
    icon: "newspaper-outline",
    route: "/blogs",
  },
];

const SideMenu = ({
  visible,
  onClose,
  items = DEFAULT_MENU_ITEMS,
}: SideMenuProps) => {
  const router = useRouter();

  const [
    registerVisible,
    setRegisterVisible,
  ] = useState(false);

  const [
    loginVisible,
    setLoginVisible,
  ] = useState(false);

  /* ==========================================================
     START OFF-SCREEN TO THE LEFT
     ========================================================== */

  const slideAnim = useRef(
    new Animated.Value(-MENU_WIDTH),
  ).current;

  const backdropAnim = useRef(
    new Animated.Value(0),
  ).current;

  /* ==========================================================
     OPEN SIDE MENU
     ========================================================== */

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(-MENU_WIDTH);
      backdropAnim.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(
            Easing.cubic,
          ),
          useNativeDriver: true,
        }),

        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(
            Easing.cubic,
          ),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    visible,
    slideAnim,
    backdropAnim,
  ]);

  /* ==========================================================
     CLOSE SIDE MENU
     ========================================================== */

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 240,
        easing: Easing.in(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),

      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 240,
        easing: Easing.in(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  /* ==========================================================
     OPEN REGISTER MODAL
     ========================================================== */

  const openRegisterModal = () => {
    setLoginVisible(false);

    setTimeout(() => {
      setRegisterVisible(true);
    }, 150);
  };

  /* ==========================================================
     OPEN LOGIN MODAL
     ========================================================== */

  const openLoginModal = () => {
    setRegisterVisible(false);

    setTimeout(() => {
      setLoginVisible(true);
    }, 150);
  };

  /* ==========================================================
     HANDLE MENU ITEM
     ========================================================== */

  const handleMenuPress = (
    item: SideMenuItem,
  ) => {
    /*
     * SIGN IN
     *
     * Sign In is a modal, not a route.
     */
    if (item.label === "Sign In") {
      closeMenu();

      setTimeout(() => {
        openLoginModal();
      }, 250);

      return;
    }

    /*
     * REGISTER
     *
     * Register is a modal, not a route.
     */
    if (item.label === "Register") {
      closeMenu();

      setTimeout(() => {
        openRegisterModal();
      }, 250);

      return;
    }

    /*
     * NORMAL ROUTES
     */
    closeMenu();

    if (!item.route) {
      return;
    }

    setTimeout(() => {
      router.push(item.route as never);
    }, 250);
  };

  /*
   * Keep the component mounted while either
   * authentication modal is open.
   */
  if (
    !visible &&
    !registerVisible &&
    !loginVisible
  ) {
    return null;
  }

  return (
    <View
      className="absolute inset-0 z-50"
      style={{
        elevation: 20,
      }}
    >
      {/* ======================================================
          BACKDROP
          ====================================================== */}

      {visible ? (
        <Animated.View
          pointerEvents="box-none"
          className="absolute inset-0 bg-black"
          style={{
            opacity:
              backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.65],
              }),
          }}
        />
      ) : null}

      {/* ======================================================
          BACKDROP PRESS AREA
          ====================================================== */}

      {visible ? (
        <Pressable
          onPress={closeMenu}
          className="absolute inset-0"
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        />
      ) : null}

      {/* ======================================================
          SLIDING DRAWER
          
          The drawer starts at:
          
              -MENU_WIDTH
          
          which places it completely outside the
          LEFT side of the screen.
          
          It then animates to:
          
               0
          
          which brings it into view.
          ====================================================== */}

      {visible ? (
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: MENU_WIDTH,
            transform: [
              {
                translateX: slideAnim,
              },
            ],
          }}
          className="bg-[#111111]"
        >
          {/* ==================================================
              MENU HEADER
              ================================================== */}

          <View className="border-b border-[#292929] px-5 pb-5 pt-12">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xl font-bold text-white">
                  Menu
                </Text>

                <Text className="mt-1 text-xs text-gray-500">
                  Real Estate
                </Text>
              </View>

              <Pressable
                onPress={closeMenu}
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                className="h-10 w-10 items-center justify-center rounded-full bg-[#222222]"
                style={({
                  pressed,
                }) => ({
                  opacity: pressed
                    ? 0.6
                    : 1,
                })}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#fff"
                />
              </Pressable>
            </View>
          </View>

          {/* ==================================================
              MENU ITEMS
              ================================================== */}

          <View className="px-3 pt-5">
            {items.map((item) => (
              <Pressable
                key={item.label}
                onPress={() =>
                  handleMenuPress(
                    item,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={
                  item.label
                }
                style={({
                  pressed,
                }) => ({
                  opacity: pressed
                    ? 0.75
                    : 1,
                  backgroundColor:
                    pressed
                      ? "#241616"
                      : "transparent",
                })}
                className="mb-1 flex-row items-center rounded-xl px-2 py-3.5"
              >
                {/* ICON */}

                <View className="h-10 w-10 items-center justify-center rounded-lg bg-[#241616]">
                  <Ionicons
                    name={item.icon}
                    size={21}
                    color="#f87171"
                  />
                </View>

                {/* LABEL */}

                <Text
                  className="ml-3 flex-1 text-sm font-semibold text-white"
                  numberOfLines={2}
                >
                  {item.label}
                </Text>

                {/* ARROW */}

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color="#666"
                />
              </Pressable>
            ))}
          </View>
        </Animated.View>
      ) : null}

      {/* ======================================================
          LOGIN MODAL
          ====================================================== */}

      <LoginModal
        visible={loginVisible}
        onClose={() =>
          setLoginVisible(false)
        }
        onRegister={() => {
          setLoginVisible(false);

          setTimeout(() => {
            setRegisterVisible(true);
          }, 250);
        }}
      />

      {/* ======================================================
          REGISTER MODAL
          ====================================================== */}

      <RegisterModal
        visible={registerVisible}
        onClose={() =>
          setRegisterVisible(false)
        }
        onSignIn={() => {
          setRegisterVisible(false);

          setTimeout(() => {
            setLoginVisible(true);
          }, 250);
        }}
      />
    </View>
  );
};

export default SideMenu;