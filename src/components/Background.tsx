import { ImageBackground, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenWithBackgroundProps } from "../interface/Interface";
import React, { useEffect, useState } from "react";



const ScreenWithBackground = ({ children }: any) => {
  let BackgroundImg = require("../assets/BgImg.png");
  const [shouldRenderBackground, setShouldRenderBackground] = useState("");

  useEffect(() => {
    if (shouldRenderBackground) {
    }
  }, []);
  return (
    <LinearGradient
      style={styles.androidLarge57}
      locations={[0, 0.5, 0.3, 1]}
      colors={[
        "rgba(0, 148, 148, 1)",
        "rgba(9, 163, 163, 0.75)",
        "rgba(2, 188, 188, 1)",
        "rgba(2, 134, 134, 1)",
      ]}
    >
      <ImageBackground
        source={BackgroundImg}
        style={styles.Img}
        imageStyle={{ opacity: 0.4 }}
      >
        {children}
      </ImageBackground>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  androidLarge57: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
    height: 800,
    width: "100%"},
  Img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    zIndex: 1000}});

export default React.memo(ScreenWithBackground);
