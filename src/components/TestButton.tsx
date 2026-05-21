import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient as Lin } from "expo-linear-gradient";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { CustomBoldText } from './CustomText';
import { COLORS } from '../styles/themes';

interface TestButtonProps {
  onPress: () => void;
  colors: readonly [string, string, ...string[]];
  text: React.ReactNode;
  disable?: boolean;
  style?: any;
}

const TestButton: React.FC<TestButtonProps> = ({
  onPress,
  colors,
  text,
  disable,
  style
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disable} style={style}>
      <Lin
        style={[styles.card, styles.shadow]}
        colors={colors}
        start={{ x: 0.6, y: 0.3 }}
        end={{ x: 0.6, y: 0 }}
      >
        <CustomBoldText style={styles.buttonTxt}>{text}</CustomBoldText>
      </Lin>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    height: hp(4),
    width: wp(35),
    justifyContent: "center",
    alignItems: "center"
  },
  shadow: {
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  buttonTxt: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4),
    fontWeight: '700',
    textTransform: "uppercase",
    color: COLORS.light,
    letterSpacing: wp(0.3),
    textAlign: "center"
  },
});

export default TestButton;
