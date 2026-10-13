
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

/* ============================================================
   MOTIVATIONAL MESSAGES WITH INDIVIDUAL BACKGROUND IMAGES
============================================================ */

interface MotivationalMessageItem {
  text: string;
  image: string;
}

type MessageAnimation = "fade" | "slide" | "zoom" | "bounce";

const MOTIVATIONAL_MESSAGES: MotivationalMessageItem[] = [
  {
    text: "Find a home in a country you love.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Your dream home is closer than you think.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Discover a place where life feels right.",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Your next chapter starts with the right property.",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Find your place. Build your future.",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Every great journey begins at home.",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "A better tomorrow begins with the right home.",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Discover a place to call your own.",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Your perfect property could be waiting for you.",
    image:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Make room for your next big dream.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Find a space that matches your ambition.",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Great memories start with a place called home.",
    image:
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Explore possibilities. Find your future.",
    image:
      "https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Your next investment could start right here.",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "There is a place for every dream.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Find your dream home with Real Estate Africa.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Real Estate Africa — where your next chapter begins.",
    image:
      "https://images.unsplash.com/photo-1600047509782-20d39509f26d?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Discover more. Dream bigger. Choose Real Estate Africa.",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Real Estate Africa: Your home, your future.",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Your property journey starts with Real Estate Africa.",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Find the right property with Real Estate Africa.",
    image:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Real Estate Africa — connecting you to your next home.",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&auto=format&fit=crop&q=80",
  },
  {
    text: "Build your future with Real Estate Africa.",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80",
  },
];

/* ============================================================
   MOTIVATIONAL MESSAGE COMPONENT
============================================================ */

const MESSAGE_DISPLAY_DURATION = 2600;
const IMAGE_FADE_DURATION = 350;

export default function MotivationalMessage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length),
  );

  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const previousMessageIndex = useRef(messageIndex);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);
  const isChangingMessage = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    const getRandomMessageIndex = () => {
      if (MOTIVATIONAL_MESSAGES.length < 2) {
        return 0;
      }

      let nextIndex = previousMessageIndex.current;

      while (nextIndex === previousMessageIndex.current) {
        nextIndex = Math.floor(
          Math.random() * MOTIVATIONAL_MESSAGES.length,
        );
      }

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
          void prepareNextMessage();
        }, MESSAGE_DISPLAY_DURATION);
      });
    };

    /*
     * Preload the next image BEFORE fading out the current display.
     * The current message and background remain visible during loading.
     */
    const prepareNextMessage = async () => {
      if (!isMounted.current || isChangingMessage.current) {
        return;
      }

      isChangingMessage.current = true;

      const nextIndex = getRandomMessageIndex();
      const nextMessage = MOTIVATIONAL_MESSAGES[nextIndex];

      try {
        const imageReady = await Image.prefetch(nextMessage.image);

        if (!isMounted.current) {
          return;
        }

        // Do not replace the current display if the next image failed.
        if (!imageReady) {
          isChangingMessage.current = false;

          timeoutRef.current = setTimeout(() => {
            void prepareNextMessage();
          }, 1500);

          return;
        }

        // The next image is cached. Fade the current message away.
        Animated.timing(opacity, {
          toValue: 0,
          duration: IMAGE_FADE_DURATION,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished || !isMounted.current) {
            isChangingMessage.current = false;
            return;
          }

          // Change the message and background together, after preload.
          previousMessageIndex.current = nextIndex;
          setMessageIndex(nextIndex);

          isChangingMessage.current = false;

          // Allow React Native to render the new, cached background
          // before starting the next message's entrance animation.
          timeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              animateMessage(getRandomAnimation());
            }
          }, 80);
        });
      } catch {
        if (!isMounted.current) {
          return;
        }

        // Keep the current display and retry later.
        isChangingMessage.current = false;

        timeoutRef.current = setTimeout(() => {
          void prepareNextMessage();
        }, 1500);
      }
    };

    // Preload and display the initial image before starting the cycle.
    const startInitialMessage = async () => {
      const initialMessage = MOTIVATIONAL_MESSAGES[messageIndex];

      try {
        await Image.prefetch(initialMessage.image);
      } catch {
        // The image can still be displayed by ImageBackground.
      }

      if (isMounted.current) {
        animateMessage(getRandomAnimation());
      }
    };

    void startInitialMessage();

    return () => {
      isMounted.current = false;
      isChangingMessage.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      opacity.stopAnimation();
      translateX.stopAnimation();
      translateY.stopAnimation();
      scale.stopAnimation();
    };
  }, [messageIndex, opacity, translateX, translateY, scale]);

  const currentMessage = MOTIVATIONAL_MESSAGES[messageIndex];
  const companyName = "Real Estate Africa";
  const messageParts = currentMessage.text.split(companyName);

  return (
    <View className="mb-5 overflow-hidden rounded-2xl">
      <ImageBackground
        source={{ uri: currentMessage.image }}
        resizeMode="cover"
        blurRadius={2}
        imageStyle={{ opacity: 1 }}
        style={{
          minHeight: 170,
          justifyContent: "center",
          backgroundColor: isDark ? "#262626" : "#555555",
        }}
      >
        {/* Reduced overlay opacity keeps the image more visible. */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: isDark
              ? "rgba(0,0,0,0.36)"
              : "rgba(0,0,0,0.30)",
          }}
        />

        <View className="px-4 py-4">
          {/* MESSAGE LABEL */}
          <View className="mb-2 flex-row items-center">
            <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-red-600">
              <Ionicons name="heart" size={16} color="#ffffff" />
            </View>

            <Text
              className="text-xs font-bold uppercase tracking-[2px] text-red-600"
              style={{
                textShadowColor: "rgba(0,0,0,0.85)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 4,
              }}
            >
              Your next chapter
            </Text>
          </View>

          {/* ANIMATED MESSAGE */}
          <Animated.View
            style={{
              opacity,
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
              minHeight: 75,
              justifyContent: "center",
            }}
          >
            <Text
              accessibilityLiveRegion="polite"
              className="text-xl font-bold leading-7 text-white"
              style={{
                textShadowColor: "rgba(0,0,0,0.95)",
                textShadowOffset: { width: 1, height: 2 },
                textShadowRadius: 5,
              }}
            >
              {messageParts.map((part, index) => (
                <React.Fragment key={`${messageIndex}-${index}-${part}`}>
                  {part}

                  {index < messageParts.length - 1 && (
                    <Text
                      style={{
                        color: "#ff4d5a",
                        textShadowColor: "rgba(0,0,0,0.95)",
                        textShadowOffset: { width: 1, height: 2 },
                        textShadowRadius: 5,
                      }}
                    >
                      {companyName}
                    </Text>
                  )}
                </React.Fragment>
              ))}
            </Text>
          </Animated.View>

          {/* BRAND ACCENT */}
          <View className="mt-3 h-1 w-12 rounded-full bg-red-500" />
        </View>
      </ImageBackground>
    </View>
  );
}
