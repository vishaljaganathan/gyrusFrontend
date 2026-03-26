import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

interface SubjectRowProps {
  subject: string;
  image?: any;
  percentage?: string;
  isLocked?: boolean;
  isPlanValid?: boolean;
  onClick?: () => void;
}

const SubjectRow: React.FC<SubjectRowProps> = ({
  subject,
  image,
  percentage,
  isLocked,
  isPlanValid,
  onClick,
}) => {
  const showLock = subject !== "Neet" && !isPlanValid && isLocked;

  return (
    <Pressable style={styles.container} onPress={onClick}>
      <View style={styles.imageContainer}>
        {image && <Image source={image} style={styles.avatar} />}
      </View>

      <View style={styles.subjectContainer}>
        <Text style={styles.subjectText}>{subject}</Text>
      </View>

      <View style={styles.statusContainer}>
        {showLock ? (
          <FontAwesomeIcon icon={faLock} size={20} color="#BDBDBD" />
        ) : (
          <Text style={styles.percentageText}>{percentage}</Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#15BBB1",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    cursor: "pointer",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  subjectContainer: {
    flex: 3,
    justifyContent: "flex-start",
  },
  subjectText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  statusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default SubjectRow;