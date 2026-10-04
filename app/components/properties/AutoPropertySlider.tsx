
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";

import PropertyCard from "@/app/components/properties/PropertyCard";
import type { Property } from "@/app/services/propertyApi";

interface AutoPropertySliderProps {
  properties: Property[];
  onPropertyPress: (property: Property) => void;
  isVisible?: boolean;
}

const CARD_WIDTH = 320;
const CARD_GAP = 20;
const CARD_INTERVAL = CARD_WIDTH + CARD_GAP;

// How long the current card stays still
const WAIT_TIME = 5000;

// How long it takes to slowly move to the next card
const MOVE_DURATION = 4500;

export default function AutoPropertySlider({
  properties,
  onPropertyPress,
}: AutoPropertySliderProps) {
  const scrollX = useRef(new Animated.Value(0)).current;

  const currentIndex = useRef(0);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isUserDragging = useRef(false);

  /**
   * Clear the current automatic-scroll timer.
   */
  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  /**
   * Slowly move to the next card.
   */
  const moveNext = useCallback(() => {
    if (properties.length <= 1) {
      return;
    }

    if (isUserDragging.current) {
      return;
    }

    const nextIndex = currentIndex.current + 1;

    /*
     * When we reach the final card,
     * smoothly return to the first card.
     */
    if (nextIndex >= properties.length) {
      currentIndex.current = 0;

      Animated.timing(scrollX, {
        toValue: 0,
        duration: MOVE_DURATION,
        useNativeDriver: false,
      }).start();

      return;
    }

    currentIndex.current = nextIndex;

    Animated.timing(scrollX, {
      toValue: nextIndex * CARD_INTERVAL,

      // Slow, smooth movement
      duration: MOVE_DURATION,

      useNativeDriver: false,
    }).start();
  }, [properties.length, scrollX]);

  /**
   * Start the automatic slider.
   */
  const startAutoScroll = useCallback(() => {
    clearTimer();

    if (properties.length <= 1) {
      return;
    }

    timer.current = setTimeout(() => {
      if (!isUserDragging.current) {
        moveNext();
      }

      startAutoScroll();
    }, WAIT_TIME + MOVE_DURATION);
  }, [
    clearTimer,
    moveNext,
    properties.length,
  ]);

  /**
   * Start automatic movement when properties are loaded.
   */
  useEffect(() => {
    if (properties.length <= 1) {
      return;
    }

    currentIndex.current = 0;

    scrollX.setValue(0);

    /*
     * Give the user a few seconds to see
     * the first card before movement starts.
     */
    timer.current = setTimeout(() => {
      moveNext();
      startAutoScroll();
    }, WAIT_TIME);

    return () => {
      clearTimer();
    };
  }, [
    properties.length,
    scrollX,
    moveNext,
    startAutoScroll,
    clearTimer,
  ]);

  /**
   * Stop automatic movement while
   * the user manually swipes.
   */
  const handleScrollBeginDrag = useCallback(() => {
    isUserDragging.current = true;

    clearTimer();
  }, [clearTimer]);

  /**
   * Update the current card after
   * the user's swipe has finished.
   */
  const handleMomentumScrollEnd = useCallback(
    (
      event: NativeSyntheticEvent<NativeScrollEvent>,
    ) => {
      const offset = event.nativeEvent.contentOffset.x;

      const index = Math.round(
        offset / CARD_INTERVAL,
      );

      currentIndex.current = Math.max(
        0,
        Math.min(
          index,
          properties.length - 1,
        ),
      );

      isUserDragging.current = false;

      startAutoScroll();
    },
    [
      properties.length,
      startAutoScroll,
    ],
  );

  /**
   * Restart automatic movement after
   * the user finishes dragging.
   */
  const handleScrollEndDrag = useCallback(() => {
    isUserDragging.current = false;

    startAutoScroll();
  }, [startAutoScroll]);

  /**
   * Clean up the timer when the component
   * is removed from the screen.
   */
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  if (properties.length === 0) {
    return null;
  }

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      directionalLockEnabled
      decelerationRate="fast"
      snapToInterval={CARD_INTERVAL}
      snapToAlignment="start"
      disableIntervalMomentum={false}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      contentOffset={{
        x: scrollX,
        y: 0,
      }}
      contentContainerStyle={{
        paddingRight: 8,
      }}
    >
      {properties.map((property, index) => (
        <View
          key={`${property.id}-${index}`}
          style={{
            width: CARD_WIDTH,
            marginRight:
              index === properties.length - 1
                ? 0
                : CARD_GAP,
          }}
        >
          <PropertyCard
            property={property}
            isFullWidth
            onPress={onPropertyPress}
          />
        </View>
      ))}
    </Animated.ScrollView>
  );
}

