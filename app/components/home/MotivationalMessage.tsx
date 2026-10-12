
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, View, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

/* ============================================================
   MOTIVATIONAL MESSAGES
   ============================================================ */

const MOTIVATIONAL_MESSAGES = [
  "Find a home in a country you love.",
  "Your dream home is closer than you think.",
  "Discover a place where life feels right.",
  "Your next chapter starts with the right property.",
  "Find your place. Build your future.",
  "Every great journey begins at home.",
  "A better tomorrow begins with the right home.",
  "Discover a place to call your own.",
  "Your perfect property could be waiting for you.",
  "Make room for your next big dream.",
  "Find a space that matches your ambition.",
  "Great memories start with a place called home.",
  "Explore possibilities. Find your future.",
  "Your next investment could start right here.",
  "There is a place for every dream.",
  "Find your dream home with Real Estate Africa.",
  "Real Estate Africa — where your next chapter begins.",
  "Discover more. Dream bigger. Choose Real Estate Africa.",
  "Real Estate Africa: Your home, your future.",
  "Your property journey starts with Real Estate Africa.",
  "Find the right property with Real Estate Africa.",
  "Real Estate Africa — connecting you to your next home.",
  "Build your future with Real Estate Africa.",
];

type MessageAnimation = "fade" | "slide" | "zoom" | "bounce";

export default function MotivationalMessage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
  );

  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const previousMessageIndex = useRef(messageIndex);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const getRandomMessageIndex = () => {
      if (MOTIVATIONAL_MESSAGES.length < 2) {
        return 0;
      }

      let nextIndex = previousMessageIndex.current;

      while (nextIndex === previousMessageIndex.current) {
        nextIndex = Math.floor(
          Math.random() * MOTIVATIONAL_MESSAGES.length
        );
      }

      previousMessageIndex.current = nextIndex;
      return nextIndex;
    };

    const getRandomAnimation = (): MessageAnimation => {
      const animations: MessageAnimation[] = [
        "fade",
        "slide",
        "zoom",
        "bounce",
      ];

      return animations[
        Math.floor(Math.random() * animations.length)
      ];
    };

    const resetValues = (type: MessageAnimation) => {
      opacity.setValue(0);
      translateX.setValue(0);
      translateY.setValue(0);
      scale.setValue(1);

      switch (type) {
        case "fade":
          translateY.setValue(10);
          break;
        case "slide":
          translateX.setValue(Math.random() < 0.5 ? -55 : 55);
          break;
        case "zoom":
          scale.setValue(0.7);
          break;
        case "bounce":
          translateY.setValue(28);
          scale.setValue(0.85);
          break;
      }
    };

    const animateMessage = (type: MessageAnimation) => {
      if (!isMounted.current) {
        return;
      }

      resetValues(type);

      let entrance: Animated.CompositeAnimation;

      switch (type) {
        case "fade":
          entrance = Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 700,
              useNativeDriver: true,
            }),
          ]);
          break;

        case "slide":
          entrance = Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 550,
              useNativeDriver: true,
            }),
            Animated.spring(translateX, {
              toValue: 0,
              damping: 15,
              stiffness: 115,
              mass: 0.8,
              useNativeDriver: true,
            }),
          ]);
          break;

        case "zoom":
          entrance = Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              damping: 12,
              stiffness: 120,
              mass: 0.8,
              useNativeDriver: true,
            }),
          ]);
          break;

        case "bounce":
          entrance = Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              damping: 7,
              stiffness: 140,
              mass: 0.8,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              damping: 7,
              stiffness: 140,
              mass: 0.8,
              useNativeDriver: true,
            }),
          ]);
          break;
      }

      entrance.start(({ finished }) => {
        if (!finished || !isMounted.current) {
          return;
        }

        timeoutRef.current = setTimeout(() => {
          if (!isMounted.current) {
            return;
          }

          Animated.timing(opacity, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }).start(({ finished: fadeFinished }) => {
            if (!fadeFinished || !isMounted.current) {
              return;
            }

            setMessageIndex(getRandomMessageIndex());

            timeoutRef.current = setTimeout(() => {
              if (isMounted.current) {
                animateMessage(getRandomAnimation());
              }
            }, 100);
          });
        }, 2600);
      });
    };

    animateMessage(getRandomAnimation());

    return () => {
      isMounted.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      opacity.stopAnimation();
      translateX.stopAnimation();
      translateY.stopAnimation();
      scale.stopAnimation();
    };
  }, [opacity, translateX, translateY, scale]);

  const message = MOTIVATIONAL_MESSAGES[messageIndex];
  const companyName = "Real Estate Africa";
  const messageParts = message.split(companyName);

  return (
    <View
      className={
        isDark
          ? "mb-7 overflow-hidden rounded-2xl border border-none bg-transparent px-5 py-6"
          : "mb-7 overflow-hidden rounded-2xl border border-transparent bg-transparent px-5 py-6"
      }
    >
      <View className="mb-3 flex-row items-center">
        <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-red-600">
          <Ionicons name="heart" size={16} color="#ffffff" />
        </View>

        <Text className="text-xs font-bold uppercase tracking-[2px] text-red-500">
          Your next chapter
        </Text>
      </View>

      <Animated.View
        style={{
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
          minHeight: 84,
          justifyContent: "center",
        }}
      >
        <Text
          accessibilityLiveRegion="polite"
          className={
            isDark
              ? "text-2xl font-bold leading-9 text-white"
              : "text-2xl font-bold leading-9 text-gray-900"
          }
        >
          {messageParts.map((part, index) => (
            <React.Fragment key={`${index}-${part}`}>
              {part}
              {index < messageParts.length - 1 && (
                <Text style={{ color: "#ef4444" }}>
                  {companyName}
                </Text>
              )}
            </React.Fragment>
          ))}
        </Text>
      </Animated.View>
    </View>
  );
}
