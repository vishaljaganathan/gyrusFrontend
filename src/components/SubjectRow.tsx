import React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { CustomText as Text } from './CustomText';

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { Ionicons } from '@expo/vector-icons';

interface SubjectRowProps {
  subject: string;
  image?: any;
  percentage?: string;
  isLocked?: boolean;
  isPlanValid?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}

const SubjectRow: React.FC<SubjectRowProps> = ({
  subject,
  image,
  percentage,
  isLocked,
  isPlanValid,
  isExpanded,
  onClick
}) => {
  const showLock = subject !== "Neet" && !isPlanValid && isLocked;

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.7} 
      onPress={onClick}
    >
      <View style={styles.imageContainer}>
        {image && <Image source={image} style={styles.avatar} />}
      </View>

      <View style={styles.subjectContainer}>
        <Text style={styles.subjectText}>{subject}</Text>
      </View>

      <View style={styles.statusContainer}>
        {showLock ? (
          <FontAwesomeIcon icon={faLock} size={20} color="#BDBDBD" />
        ) : percentage ? (
          <Text style={styles.percentageText}>{percentage}</Text>
        ) : (
          <Ionicons 
            name={isExpanded ? "chevron-down" : "chevron-forward"} 
            size={20} 
            color="rgba(255, 255, 255, 0.5)" 
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Removed dark color, using a lighter transparent background
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  subjectContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // Centered the text horizontally
  },
  subjectText: {
    color: "#FFFFFF",
    fontFamily: 'AppFont-Bold',
    fontSize: 18,
    letterSpacing: 0.5,
    textAlign: "center", // Ensures text is centered
  },
  statusContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 48, // Matched width with imageContainer to ensure subjectText is perfectly centered in the row
  },
  percentageText: {
    color: "#FFFFFF",
    fontFamily: 'AppFont-SemiBold',
    fontSize: 16,
  }
});

export default SubjectRow;
