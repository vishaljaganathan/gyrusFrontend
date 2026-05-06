import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import React from "react";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert } from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from './CustomText';






const CustomProgressBar = ({ progress }: any) => {
  return (
    <View style={styles.progressBarContainer}>
      <LinearGradient
        style={[styles.progressBar, { width: `${progress}%` }]}
        colors={["#4caf50", "#ff9800"]} // Define your gradient colors
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <Text style={styles.progressText}>{`${progress}%`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    height: wp(15.8),
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden"},
  progressBar: {
    height: "100%"},
  progressText: {
    
    position: "absolute",
    alignSelf: "center",
    lineHeight: 30,
    color: "#000",
    fontFamily: 'AppFont-Regular', fontSize: 8}});

export default CustomProgressBar;
