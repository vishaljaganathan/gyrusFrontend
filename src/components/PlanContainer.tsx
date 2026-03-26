import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { moderateScale } from "../styles/Responsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PlanContainerProps = {
  title: string;
  image?: string | { uri: string } | number;
  plan?: boolean;
  expiryDate?: string | number | Date;
  onUpgradeClick?: () => void;
};

const PlanContainer = ({
  title,
  image,
  plan = false,
  expiryDate,
  onUpgradeClick,
}: PlanContainerProps) => {
  const insets = useSafeAreaInsets();

  const formatExpiryDate = (date: string | number | Date | undefined): string => {
    if (!date) return "N/A";
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return "Invalid Date";
      return parsedDate.toLocaleDateString("en-GB");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {image && (
          <Image
            source={
              typeof image === "string"
                ? { uri: image }
                : typeof image === "number"
                ? image
                : image
            }
            style={styles.avatar}
            accessibilityLabel={`${title} avatar`}
          />
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text 
          style={styles.title} 
          accessibilityLabel={`${title} membership status`}
        >
          {title} Member
        </Text>
        
        {plan && expiryDate && (
          <View style={styles.expiryContainer}>
            <Text 
              style={styles.expiryText} 
              accessibilityLabel="Validity expiry label"
            >
              Validity expires
            </Text>
            <Text
              style={styles.expiryDateText}
              accessibilityLabel={`Expires on ${formatExpiryDate(expiryDate)}`}
            >
              on {formatExpiryDate(expiryDate)}
            </Text>
          </View>
        )}
        
        {!plan && onUpgradeClick && (
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={onUpgradeClick}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Upgrade membership"
          >
            <LinearGradient
              style={styles.button}
              colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>Upgrade</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PlanContainer;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: wp(3),
    width: "100%",
    maxWidth: wp(90),
    minHeight: hp(12),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    alignSelf: "center",
  },
  imageContainer: {
    width: wp(16),
    height: wp(16),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
    borderRadius: wp(8),
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  title: {
    fontSize: moderateScale(18),
    color: "#333",
    fontWeight: "700",
    lineHeight: moderateScale(22),
    letterSpacing: 0.3,
    marginBottom: hp(0.8),
  },
  expiryContainer: {
    flexDirection: "column",
  },
  expiryText: {
    fontSize: moderateScale(13),
    color: "#666",
    lineHeight: moderateScale(18),
    marginBottom: hp(0.3),
  },
  expiryDateText: {
    fontSize: moderateScale(13),
    color: "#666",
    lineHeight: moderateScale(18),
    fontWeight: "600",
  },
  buttonContainer: {
    marginTop: hp(0.5),
  },
  button: {
    borderRadius: wp(2.5),
    paddingVertical: hp(1),
    paddingHorizontal: wp(5),
    justifyContent: "center",
    alignItems: "center",
    minWidth: moderateScale(100),
    shadowColor: "rgba(0, 183, 194, 0.4)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: moderateScale(13),
    color: "white",
    fontWeight: "700",
    textTransform: "none",
    letterSpacing: 0.5,
  },
});