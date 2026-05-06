import { COLORS } from '../styles/themes';
import React, { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert } from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput, CustomBoldText } from './CustomText';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp} from "react-native-responsive-screen";



const StartButton = ({
  onPress,
  style,
  disable,
  Text: textProp,
  colors,
  loading,
  questionCount}: {
  onPress: () => void;
  style?: any;
  disable?: boolean;
  Text?: string;
  colors?: [string, string];
  loading?: boolean;
  questionCount?: number;
}) => {
  const label = textProp || `Start${questionCount ? ` - ${questionCount}` : ""}`;
  const gradientColors: [string, string] =
    colors && colors.length >= 2 ? colors : ["#00B712", "#5AFF15"];
  return (
    <TouchableOpacity onPress={onPress} disabled={disable || loading}>
      <LinearGradient
        style={[styles.card, styles.elevation]}
        colors={gradientColors}
        start={{ x: 0.6, y: 0.3 }}
        end={{ x: 0.6, y: 0 }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <CustomBoldText style={styles.buttonTxt}>{label}</CustomBoldText>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default StartButton;

const styles = StyleSheet.create({
  heading: {
    
    fontFamily: 'AppFont-Bold', fontSize: 18, 
        marginBottom: 13},
  card: {
    backgroundColor: "#06B002",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 15,
    // padding:15,
    justifyContent: "center",
    alignItems: "center"},
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2},
  elevation: {
    elevation: 10},
  buttonTxt: {
    fontFamily: 'AppFont-Bold', fontSize: wp(4.2), fontWeight: '700',
        color: COLORS.light,
    letterSpacing: wp(0.5)}});

