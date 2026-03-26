import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { moderateScale } from "../styles/Responsive";
import { ThemeContext } from "../service/authContext";
export const Wrapper = () => {
  const image = require("../assets/NoInternet.jpeg");

  return (
    <>
      <View style={styles.container}>
        <ImageBackground source={image} resizeMode="cover" style={styles.image}>
          <Text style={styles.text}>No Internet</Text>
        </ImageBackground>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  text: {
    color: "white",
    fontSize: moderateScale(25),
    lineHeight: 84,
    fontWeight: "bold",
    textAlign: "center",
  },
});
