import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { Animated, View, StyleSheet } from 'react-native'
import { CustomAnimatedText } from './CustomText';

import { Svg, Path, Rect, Defs, Stop, LinearGradient } from 'react-native-svg';
import React, { useState, useEffect } from "react";





const returnSide = (index: any) => {
  if (index % 2 == 0) {
    return { bottom: -75 };
  } else {
    return { bottom: -35 };
  }
};

const ArrowSvg = (props: any) => {
  return (
    <Svg
      style={returnSide(props.id)}
      width="177"
      height="203"
      viewBox="0 0 177 203"
      fill="none"
    >
      <Path
        d="M141.943 37.7321L140.789 89.3622L91.4318 48.4853L141.943 37.7321Z"
        fill="#C0C0C0"
      />
      <Path
        d="M136.586 43.4162L138.794 84.1976L96.1074 48.8446L136.586 43.4162Z"
        fill="#06B002"
      />
      <Rect
        x="108.71"
        y="55.9287"
        width="27"
        height="150.325"
        transform="rotate(44.8955 108.71 55.9287)"
        fill="#C0C0C0"
      />
      <Rect
        x="113.208"
        y="57.7063"
        width="18"
        height="150"
        transform="rotate(44.8955 113.208 57.7063)"
        fill="url(#paint0_linear_613_92)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_613_92"
          x1="122.208"
          y1="57.7063"
          x2="122.208"
          y2="207.706"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#06B002" />
          <Stop offset="1" stopColor="#06B002" stopOpacity="0" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

const Arrow = ({ progress }: any) => {
  const [widthAnim] = useState(new Animated.Value(0)); // Animated value for progress width

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress, // Progress value (0 to 100)
      duration: 500, // Animation duration
      useNativeDriver: false}).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      {/* Slanted arrow body */}
      <View style={{ transform: [{ rotate: "-5deg" }] }}>
        <ArrowSvg id={0} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50}});

export default Arrow;
