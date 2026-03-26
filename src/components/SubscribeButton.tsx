import React, { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../styles/themes";

const SubscribeBtn = ({
  onPress,
  style,
  colors,
  text,
  renderIcon,
  disable,
}: any) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disable}>
      {/* <LinearGradient style={[styles.card, styles.elevation]} colors={colors}  start={{ x: 0.6, y: 0.9}}
        end={{ x: 0.6, y: 0}} > */}
      <LinearGradient
        style={[styles.card, styles.elevation]}
        colors={["#15BBB1", "#FFFFFF"]}
        start={{ x: 0.6, y: 0.3 }}
        end={{ x: 0.6, y: 0 }}
      >
        {/* {renderIcon()} */}
        <Text style={styles.buttonTxt}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default SubscribeBtn;

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 13,
  },
  card: {
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 5,
    // padding:15,
    width: wp(40),
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(3),
  },
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  elevation: {
    elevation: 10,
  },
  buttonTxt: {
    fontSize: wp(4),
    fontWeight: "800",
    color: COLORS.light,
    letterSpacing: wp(0.5),
  },
});
//  <GradientButton
//  onPress={() => alert('Button Pressed')}
//  style={{
//    padding: 15,
//    alignItems: 'center',
//    borderRadius: 5,
//    flexDirection: 'row',
//  }}
//  colors={['#874f00', '#f5ba57']}
//  text="Press"
//  renderIcon={() => (
//    <Ionicons
//      name="md-checkmark-circle"
//      size={20}
//      color="green"
//      style={{ marginHorizontal: 20 }}
//    />
//  )}
// />
