import React, { useEffect, useMemo, useState } from "react";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert, ImageBackground } from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from './CustomText';

import NetInfo from "@react-native-community/netinfo";
import { moderateScale } from '../styles/Responsive';




export const Wrapper = () => {
  const image = require("../assets/NoInternet.jpeg");

  return (
    <>
      <View style={styles.container}>
        <ImageBackground source={image} resizeMode="cover" style={styles.image}>
          <Text style={styles.Text}>No Internet</Text>
        </ImageBackground>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"},
  image: {
    flex: 1,
    justifyContent: "center",
    width: "100%"},
  Text: {
    
    color: "white",
    fontFamily: 'AppFont-Regular', fontSize: moderateScale(25),
    lineHeight: 84,
        textAlign: "center"}});
