import { COLORS } from '../styles/themes';
import React, { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View,  StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { CustomText as Text } from './CustomText';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp} from "react-native-responsive-screen";



const GradientButton = ({
  onPress,
  style,
  colors,
  Text: textProp,
  renderIcon,
  disable,
  loading,
  textStyle}: any) => {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* <LinearGradient style={[styles.card, styles.elevation]}
            colors={colors}  start={{ x: 0.6, y: 0.9}}
        end={{ x: 0.6, y: 0}} > */}
      <LinearGradient
        style={[styles.card, styles.elevation]}
        colors={
          disable
            ? [COLORS.button_disable01, COLORS.button_disable02]
            : [COLORS.button_enable01, COLORS.button_enable02]
        }
        start={{ x: 0.6, y: 0.3 }}
        end={{ x: 0.6, y: 0 }}
      >
        {/* {renderIcon()} */}
        {loading && <ActivityIndicator size="small" color="#fff" />}
        {!loading && <Text style={[styles.buttonTxt, textStyle]}>{textProp}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientButton;

const styles = StyleSheet.create({
  heading: {
    
    fontFamily: 'AppFont-Regular', fontSize: 18,
        marginBottom: 13},
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    // padding:15,
    width: "100%",
    marginVertical: 10,
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
    
    fontFamily: 'AppFont-Regular', fontSize: wp(4),
    textTransform: "uppercase",
        color: COLORS.light,
    letterSpacing: wp(1)}});
//  <GradientButton
//  onPress={() => alert('Button Pressed')}
//  style={{
//    padding: 15,
//    alignItems: 'center',
//    borderRadius: 5,
//    flexDirection: 'row',
//  }}
//  colors={['#874f00', '#f5ba57']}
//  Text="Press"
//  renderIcon={() => (
//    <Ionicons
//      name="md-checkmark-circle"
//      size={20}
//      color="green"
//      style={{ marginHorizontal: 20 }}
//    />
//  )}
// />
