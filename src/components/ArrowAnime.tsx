import { Animated, Easing, View} from 'react-native'
import { CustomText as Text, CustomAnimatedText } from './CustomText';

import { Svg, Path } from 'react-native-svg';
import React, { useState, useEffect } from "react";





const ArrowAnimation = ({ percentage }: any) => {
  const [scaleAnim] = useState(new Animated.Value(1)); // Scale of the arrow
  const [fillAnim] = useState(new Animated.Value(0)); // Color change

  const [fillColor, setFillColor] = useState("#FF0000"); // State to hold the color

  // Update the animations when percentage changes
  useEffect(() => {
    // Scale animation
    Animated.timing(scaleAnim, {
      toValue: 1 + percentage / 100, // Scale from 1 to 2 based on percentage
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true, // Native driver for scale animation
    }).start();

    // Color animation
    Animated.timing(fillAnim, {
      toValue: percentage,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: false, // We can't use native driver for color animation
    }).start();

    // Listen for changes in fillAnim and update fillColor
    const listenerId = fillAnim.addListener(({ value }) => {
      // Map percentage to color value (Red to Green)
      const color =
        value <= 100
          ? `rgb(${255 - value * 2.55}, 0, ${value * 2.55})`
          : "#00FF00";
      setFillColor(color); // Update the state with the new color
    });

    // Cleanup the listener when the component is unmounted
    return () => fillAnim.removeListener(listenerId);
  }, [percentage]);

  return (
    <View
      style={{ alignItems: "center", justifyContent: "center", marginTop: 50 }}
    >
      <Text>Percentage: {percentage}%</Text>
      <Animated.View
        style={{
          width: "100%",
          height: 100,
          alignItems: "center",
          transform: [{ scale: scaleAnim }], // Apply scale transformation
        }}
      >
        <Svg width={200} height={100} viewBox="0 0 100 50">
          <Path
            d="M 10 25 L 70 25 L 50 15 L 70 25 L 50 35 Z" // Proper Arrow shape
            fill={fillColor} // Use the dynamic fill color
            stroke="none"
            strokeWidth="2"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default ArrowAnimation;
