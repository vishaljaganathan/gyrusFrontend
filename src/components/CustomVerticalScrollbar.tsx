import React, { useRef, useState, forwardRef } from 'react';
import { View, Animated, StyleSheet, ScrollViewProps, ScrollView } from 'react-native';

interface Props extends ScrollViewProps {
  children: React.ReactNode;
  indicatorColor?: string;
}

export const CustomVerticalScrollbar = forwardRef<ScrollView, Props>(({ children, indicatorColor = 'hsla(185, 100%, 93%, 1.00)', ...props }, ref) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const indicatorHeight = Math.max(30, layoutHeight > 0 && contentHeight > 0 ? (layoutHeight / contentHeight) * layoutHeight : 0);
  const maxScroll = Math.max(1, contentHeight - layoutHeight);
  const maxIndicatorScroll = Math.max(0, layoutHeight - indicatorHeight);

  const indicatorY = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [0, maxIndicatorScroll],
    extrapolate: 'clamp'
  });

  return (
    <View style={[styles.container, props.style]}>
      <ScrollView
        ref={ref}
        {...props}
        style={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onLayout={(e) => {
          setLayoutHeight(e.nativeEvent.layout.height);
          if (props.onLayout) props.onLayout(e);
        }}
        onContentSizeChange={(w, h) => {
          setContentHeight(h);
          if (props.onContentSizeChange) props.onContentSizeChange(w, h);
        }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
          listener: props.onScroll
        })}
        scrollEventThrottle={props.scrollEventThrottle || 16}
      >
        {children}
      </ScrollView>

      {layoutHeight > 0 && contentHeight > layoutHeight && (
        <View style={styles.scrollTrack} pointerEvents="none">
          <Animated.View style={[
            styles.scrollThumb,
            {
              backgroundColor: indicatorColor,
              height: indicatorHeight,
              transform: [{ translateY: indicatorY }]
            }
          ]} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexShrink: 1
  },
  scrollTrack: {
    position: 'absolute',
    right: 3,
    top: 4,
    bottom: 4,
    width: 4,
    backgroundColor: 'transparent',
  },
  scrollThumb: {
    width: '100%',
    borderRadius: 2,
  }
});
