import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import { CustomText as Text } from "../components/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../styles/themes";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "../components/GradientButton";

const COURSE_DETAILS: any = {
  "XI": {
    title: "Regular Course",
    subTitle: "11th Std",
    content: "The regular courses are planned and constructed specifically for grade XI and XII students involving a professional team of doctors who are experts in NEET coaching, clutching about approximately 37 years question bank with accurate solutions and their explanations to hone their NEET cracking skills. The course not only upgrades the student's preparation but also elevates their quickness to conquering the NEET exams.",
    color: "#0AB8AD",
    btnLabel: "11th",
  },
  "XII": {
    title: "Regular Course",
    subTitle: "12th Std",
    content: "The regular courses are planned and constructed specifically for grade XI and XII students involving a professional team of doctors who are experts in NEET coaching, clutching about approximately 37 years question bank with accurate solutions and their explanations to hone their NEET cracking skills. The course not only upgrades the student's preparation but also elevates their quickness to conquering the NEET exams.",
    color: "#0AB8AD",
    btnLabel: "12th",
  },
  "R": {
    title: "Repeater Course",
    subTitle: "NEET 2nd Attempt",
    content: "The repeater course offers accessibility of updated personalized question papers, professionally designed in the form of MCQs meeting the NEET standards. Students are allowed to take tests frequently in order to improve their understanding of the subjects in meeting the pre-requisites to triumph in their NEET exams.",
    color: "#0AB8AD",
    btnLabel: "Repeater",
  },
  "C": {
    title: "Crash Course",
    subTitle: "12th Passed out",
    content: "The crash courses offered by Gyrus ensures intensive short-term condensed learning opportunity, orchestrated to quickly refresh the concepts already assimilated. Students are entitled to participate in multiple special test-series providing concentrated learning experience making it ideal for the students, for a better retention, focusing on the key concepts and strategies.",
    color: "#0AB8AD",
    btnLabel: "Crash",
  },
};

const ClassSelection = ({ navigation }: { navigation: any }) => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    setModalVisible(true);
  };

  const handleContinue = () => {
    setModalVisible(false);
    navigation.navigate("SignUp", { selectedStd: selectedClass });
  };

  const logo = require("../assets/appLogo.png");

  return (
    <LinearGradient
      colors={[COLORS.primary01, COLORS.primary02, COLORS.primary03, COLORS.primary05]}
      style={styles.container}
    >
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        activeOpacity={1}
      >
        <Ionicons name="arrow-back" size={wp(6)} color="white" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
           <Image source={logo} style={styles.logo} />
           <Text style={styles.title}>Select Your Course</Text>
           <Text style={styles.subtitle}>Choose the path that fits your goals</Text>
        </View>

        <View style={styles.grid}>
          {Object.keys(COURSE_DETAILS).map((key, index) => {
            const details = COURSE_DETAILS[key];
            return (
              <View 
                key={key} 
                style={styles.cardWrapper}
              >
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleClassSelect(key)}
                  activeOpacity={1}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderText}>{details.btnLabel}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{details.title}</Text>
                    <Ionicons name="chevron-forward-circle" size={24} color="#0AB8AD" />
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Course Detail Modal */}
      <Modal
        animationType="none" // Remove modal animation
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedClass && (
              <>
                <View style={[styles.modalHeader, { backgroundColor: COURSE_DETAILS[selectedClass].color }]}>
                  <View>
                    <Text style={styles.modalTitle}>{COURSE_DETAILS[selectedClass].title}</Text>
                    <Text style={styles.modalSubtitle}>{COURSE_DETAILS[selectedClass].subTitle}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => setModalVisible(false)}
                    activeOpacity={1}
                  >
                    <Ionicons name="close" size={28} color="white" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <Text style={styles.modalDescription}>
                    {COURSE_DETAILS[selectedClass].content}
                  </Text>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <GradientButton
                    onPress={handleContinue}
                    colors={["#0AB8AD", "#00474C"]}
                    activeOpacity={1}
                    Text={<Text style={styles.continueBtnText}>Continue</Text>}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(5),
    paddingHorizontal: wp(5),
    alignItems: "center",
    justifyContent: "center", // Center vertically
  },
  header: {
    marginBottom: hp(4),
    alignItems: "center",
  },
  logo: {
    width: wp(50),
    height: hp(15),
    resizeMode: "contain",
    marginBottom: hp(1),
  },
  backButton: {
    position: "absolute",
    left: wp(4),
    top: hp(5), // Positioned at top left
    zIndex: 10,
    padding: wp(2),
    borderRadius: wp(5),
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: wp(7),
    fontFamily: "AppFont-Bold",
    color: "white",
    textAlign: "center",
  },
  subtitle: {
    fontSize: wp(4),
    fontFamily: "AppFont-Regular",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginTop: hp(0.5),
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
    marginBottom: hp(2),
  },
  card: {
    backgroundColor: "white", // High contrast
    borderRadius: wp(4),
    overflow: "hidden",
    height: hp(15),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardHeader: {
    paddingVertical: hp(1),
    alignItems: "center",
    backgroundColor: "#0AB8AD", // Solid teal header
  },
  cardHeaderText: {
    color: "white",
    fontFamily: "AppFont-Bold",
    fontSize: wp(4.5),
  },
  cardBody: {
    flex: 1,
    padding: wp(3),
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  cardTitle: {
    color: "#333", // Dark text on white background
    fontFamily: "AppFont-Bold",
    fontSize: wp(3.8),
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: wp(5),
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: wp(5),
    overflow: "hidden",
    maxHeight: hp(70),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp(5),
  },
  modalTitle: {
    color: "white",
    fontFamily: "AppFont-Bold",
    fontSize: wp(5.5),
  },
  modalSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "AppFont-Regular",
    fontSize: wp(3.8),
  },
  closeButton: {
    padding: wp(1),
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    padding: wp(5),
  },
  modalDescription: {
    color: "#333",
    fontFamily: "AppFont-Regular",
    fontSize: wp(4),
    lineHeight: wp(6),
    textAlign: "justify",
  },
  modalFooter: {
    padding: wp(5),
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  continueBtnText: {
    fontFamily: "AppFont-Bold",
    color: "white",
    fontSize: wp(4.5),
  },
});

export default ClassSelection;
