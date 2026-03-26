import React, { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../styles/themes";

const StartButton = ({ onPress, style, disable, text, colors, loading, questionCount }: { onPress: () => void; style?: any; disable?: boolean; text?: string; colors?: [string, string]; loading?: boolean; questionCount?: number }) => {
  const label = text || `Start${questionCount ? ` - ${questionCount}` : ""}`;
  const gradientColors: [string, string] = colors && colors.length >= 2 ? colors : ["#00B712", "#5AFF15"];
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
          <Text style={styles.buttonTxt}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default StartButton;

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 13,
  },
  card: {
    backgroundColor: "#06B002",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 15,
    // padding:15,
    justifyContent: "center",
    alignItems: "center",
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
