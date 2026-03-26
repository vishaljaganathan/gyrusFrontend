import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { moderateScale } from "../styles/Responsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NeetPopupProps = {
  date?: string | number | Date;
};

const NeetPopup = ({ date }: NeetPopupProps) => {
  const insets = useSafeAreaInsets();

  // Validate and format date
  const formatDate = (dateInput: string | number | Date | undefined): string => {
    if (!dateInput) return "";
    try {
      const parsedDate = new Date(dateInput);
      if (isNaN(parsedDate.getTime())) return "Invalid Date";
      return parsedDate.toLocaleDateString("en-GB");
    } catch {
      return "Invalid Date";
    }
  };

  const formattedDate = formatDate(date);
  if (!formattedDate || formattedDate === "Invalid Date") return null;

  return (
    <View
      style={[
        styles.container,
        {
          marginTop: hp(2) + insets.top,
          paddingHorizontal: insets.left + wp(4),
          paddingBottom: insets.bottom + hp(2),
        },
      ]}
    >
      <Text
        style={styles.bodyText}
        accessibilityLabel="NEET exam date announcement"
      >
        NEET exam will held on
      </Text>
      <Text
        style={styles.dateText}
        accessibilityLabel={`NEET exam date: ${formattedDate}`}
      >
        {formattedDate}
      </Text>
    </View>
  );
};

export default NeetPopup;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    borderRadius: wp(2),
    padding: wp(4),
    width: wp(90),
    alignSelf: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  bodyText: {
    fontSize: moderateScale(16),
    color: "#666",
    marginBottom: hp(1),
    textAlign: "center",
  },
  dateText: {
    fontSize: moderateScale(24),
    color: "#1976d2",
    fontWeight: "bold",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Adds slight elevation for Android
  },
});