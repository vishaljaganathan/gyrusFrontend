import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { COLORS } from "../styles/themes";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface ShineTextProps {
  text: string;
  fontSize?: number;
  width?: number | string;
  height?: number | string;
  marginBottom?: number;
  colors?: string[];
  gradientId?: string;
  isReverse?: boolean;
  align?: "left" | "center" | "right";
}

export const ShineText: React.FC<ShineTextProps> = ({ 
  text, 
  fontSize = 36, 
  width, 
  height, 
  marginBottom = 20,
  colors,
  gradientId = "shine-grad",
  isReverse = false,
  align = "center"
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      animatedValue.setValue(0);
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false, // SVG props cannot be animated with native driver
        })
      ).start();
    };
    startAnimation();
  }, [animatedValue]);

  // Interpolate the gradient coordinates to move the shine
  const x1 = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: isReverse ? [1.5, -1.5] : [-1.5, 1.5],
  });
  const x2 = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: isReverse ? [2.5, -0.5] : [-0.5, 2.5],
  });

  // SVG Text needs width and height to render properly
  const svgWidth = width || wp(80);
  const svgHeight = height || fontSize * 1.5;

  const defaultColors = ["#ffffff", "#014b51ff", "#ffffff"];
  const gradientColors = colors || defaultColors;

  const textAnchor = align === "left" ? "start" : align === "right" ? "end" : "middle";
  const textX = align === "left" ? "0%" : align === "right" ? "100%" : "50%";

  return (
    <View style={[
      styles.container, 
      { 
        marginBottom,
        alignItems: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"
      }
    ]}>
      <Svg height={svgHeight} width={svgWidth}>
        <Defs>
          <AnimatedLinearGradient
            id={gradientId}
            x1={x1}
            y1="0"
            x2={x2}
            y2="0"
          >
            <Stop offset="0" stopColor={gradientColors[0]} />
            <Stop offset="0.5" stopColor={gradientColors[1]} />
            <Stop offset="1" stopColor={gradientColors[2]} />
          </AnimatedLinearGradient>
        </Defs>
        <SvgText
          fill={`url(#${gradientId})`}
          fontSize={fontSize}
          fontWeight="800"
          fontFamily="AppFont-Bold"
          x={textX}
          y="70%"
          textAnchor={textAnchor}
        >
          {text}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
});
