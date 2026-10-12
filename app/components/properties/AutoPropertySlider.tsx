
import React, {
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";

import PropertyCard, {
  type PropertyStatusType,
} from "@/app/components/properties/PropertyCard";
import type { Property } from "@/app/types/properties/property";

interface AutoPropertySliderProps {
  properties: Property[];
  onPropertyPress: (property: Property) => void;
  statusType?: PropertyStatusType;
   isVisible?: boolean;
}

const CARD_WIDTH = 320;
const CARD_GAP = 20;

// Slow automatic sliding.
const SLIDE_STEP = 1;
const SLIDE_INTERVAL = 40;

const AutoPropertySlider: React.FC<AutoPropertySliderProps> = ({
  properties,
  onPropertyPress,
  statusType,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const offsetRef = useRef(0);
  const isUserDragging = useRef(false);

  // Only Featured Properties should slide automatically.
  const shouldAutoSlide = statusType === "featured";

  const maxOffset = Math.max(
    0,
    properties.length * (CARD_WIDTH + CARD_GAP) - CARD_GAP
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    clearTimer();

    if (
      !shouldAutoSlide ||
      properties.length <= 1 ||
      isUserDragging.current
    ) {
      return;
    }

    timerRef.current = setTimeout(() => {
      if (isUserDragging.current) {
        return;
      }

      // Return to the beginning when the end is reached.
      if (offsetRef.current >= maxOffset) {
        offsetRef.current = 0;

        scrollRef.current?.scrollTo({
          x: 0,
          animated: false,
        });

        startAutoScroll();
        return;
      }

      // Move slowly, one pixel at a time.
      offsetRef.current = Math.min(
        offsetRef.current + SLIDE_STEP,
        maxOffset
      );

      scrollRef.current?.scrollTo({
        x: offsetRef.current,
        animated: false,
      });

      startAutoScroll();
    }, SLIDE_INTERVAL);
  }, [
    clearTimer,
    maxOffset,
    properties.length,
    shouldAutoSlide,
  ]);

  const handleScrollBeginDrag = useCallback(() => {
    isUserDragging.current = true;
    clearTimer();
  }, [clearTimer]);

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetRef.current = Math.max(
        0,
        event.nativeEvent.contentOffset.x
      );

      isUserDragging.current = false;

      if (shouldAutoSlide) {
        startAutoScroll();
      }
    },
    [shouldAutoSlide, startAutoScroll]
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetRef.current = Math.max(
        0,
        event.nativeEvent.contentOffset.x
      );

      if (shouldAutoSlide && !isUserDragging.current) {
        startAutoScroll();
      }
    },
    [shouldAutoSlide, startAutoScroll]
  );

  useEffect(() => {
    clearTimer();
    offsetRef.current = 0;
    isUserDragging.current = false;

    scrollRef.current?.scrollTo({
      x: 0,
      animated: false,
    });

    if (shouldAutoSlide && properties.length > 1) {
      startAutoScroll();
    }

    return clearTimer;
  }, [
    clearTimer,
    properties.length,
    shouldAutoSlide,
    startAutoScroll,
  ]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  if (properties.length === 0) {
    return null;
  }

  return (
    <View className="w-full">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="normal"
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
      >
        {properties.map((property, index) => (
          <View
            key={`property-${String(property.id ?? "unknown")}-${index}`}
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
              onPress={onPropertyPress}
              statusType={statusType}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default AutoPropertySlider;
