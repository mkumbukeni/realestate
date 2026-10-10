
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";

import PropertyCard, {
  type PropertyStatusType,
} from "@/app/components/properties/PropertyCard";

import type { Property } from "@/app/types/properties/property";

interface AutoPropertySliderProps {
  properties: Property[];
  onPropertyPress: (property: Property) => void;
  isVisible?: boolean;
  statusType?: PropertyStatusType;
}

const CARD_WIDTH = 320;
const CARD_GAP = 20;
const CARD_INTERVAL = CARD_WIDTH + CARD_GAP;

const WAIT_TIME = 5000;
const MOVE_DURATION = 4500;

export default function AutoPropertySlider({
  properties,
  onPropertyPress,
  statusType,
}: AutoPropertySliderProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const currentIndex = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUserDragging = useRef(false);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const moveNext = useCallback(() => {
    if (properties.length <= 1 || isUserDragging.current) {
      return;
    }

    const nextIndex = currentIndex.current + 1;

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
      duration: MOVE_DURATION,
      useNativeDriver: false,
    }).start();
  }, [properties.length, scrollX]);

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
  }, [clearTimer, moveNext, properties.length]);

  useEffect(() => {
    if (properties.length <= 1) {
      scrollX.setValue(0);
      return;
    }

    currentIndex.current = 0;
    scrollX.setValue(0);

    timer.current = setTimeout(() => {
      moveNext();
      startAutoScroll();
    }, WAIT_TIME);

    return clearTimer;
  }, [
    properties.length,
    scrollX,
    moveNext,
    startAutoScroll,
    clearTimer,
  ]);

  const handleScrollBeginDrag = useCallback(() => {
    isUserDragging.current = true;
    clearTimer();
  }, [clearTimer]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x;
      const index = Math.round(offset / CARD_INTERVAL);

      currentIndex.current = Math.max(
        0,
        Math.min(index, properties.length - 1),
      );

      isUserDragging.current = false;
      startAutoScroll();
    },
    [properties.length, startAutoScroll],
  );

  const handleScrollEndDrag = useCallback(() => {
    isUserDragging.current = false;
    startAutoScroll();
  }, [startAutoScroll]);

  useEffect(() => {
    return clearTimer;
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
      contentContainerStyle={{ paddingRight: 8 }}
    >
      {properties.map((property, index) => (
        <View
          key={`${property.id}-${index}`}
          style={{
            width: CARD_WIDTH,
            marginRight:
              index === properties.length - 1 ? 0 : CARD_GAP,
          }}
        >
          <PropertyCard
            property={property}
            isFullWidth
            statusType={statusType}
            onPress={onPropertyPress}
          />
        </View>
      ))}
    </Animated.ScrollView>
  );
}
