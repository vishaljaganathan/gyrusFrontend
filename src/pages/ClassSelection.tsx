import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, LayoutAnimation, Platform, UIManager, Animated, Pressable, Image } from "react-native";

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { CustomText as Text } from "../components/CustomText";
import HeaderBar from "../navigation/Headerbar";
import { COLORS } from "../styles/themes";
import SubjectRow from "../components/SubjectRow";
import { axiosInstance } from "../config/indeceptor";
import { ThemeContext } from "../service/authContext";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";

const Botany = require("../assets/botany.png");
const chemistry = require("../assets/chemistry.png");
const physics = require("../assets/physics.png");
const zoology = require("../assets/zoology.png");

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const getSubjectIcon = (subject: string) => {
  switch (subject.toLowerCase()) {
    case "physics": return physics;
    case "chemistry": return chemistry;
    case "botany": return Botany;
    case "zoology": return zoology;
    default: return null;
  }
};



const ClassSelection = ({ navigation }: any) => {
  const { userData, setUserData } = React.useContext(ThemeContext);
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState<"11th" | "12th">("11th");
  const [lastSubject, setLastSubject] = useState("");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isFocused) {
      axiosInstance.get("authentication/user")
        .then(res => {
          if (res.data) {
            setUserData(res.data);
          }
        })
        .catch(() => {});
        
      AsyncStorage.getItem('lastPracticedSubject').then(res => {
        if (res) setLastSubject(res);
      });
    }
  }, [isFocused]);

  const subjects = ["Physics", "Chemistry", "Botany", "Zoology"];



  const [fadeAnim] = useState(new Animated.Value(1));
  const [translateYAnim] = useState(new Animated.Value(0));

  const handleTabChange = (tab: "11th" | "12th") => {
    if (activeTab !== tab) {
      
      // Animate out quickly
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 15,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update state while invisible
        setActiveTab(tab);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        
        // Animate back in smoothly
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handleSubjectClick = (subject: string) => {
    const compoundKey = `${activeTab}_${subject}`;
    AsyncStorage.setItem('lastPracticedSubject', compoundKey);
    setLastSubject(compoundKey);
    navigation.navigate('SubjectChapters', { subject, activeTab });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 60 }]}>
      <HeaderBar />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 60 }}>
        <View style={styles.cardContainer}>
          <Text style={{ fontFamily: 'AppFont-Bold', color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 16 }}>
            Chapterwise 
          </Text>
          <View style={[styles.tabContainer, { marginHorizontal: 0, marginTop: 0 }]}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "11th" && styles.activeTab]}
              onPress={() => handleTabChange("11th")}
            >
              <Text style={[styles.tabText, activeTab === "11th" && styles.activeTabText]}>Class - XI</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "12th" && styles.activeTab]}
              onPress={() => handleTabChange("12th")}
            >
              <Text style={[styles.tabText, activeTab === "12th" && styles.activeTabText]}>Class - XII</Text>
            </TouchableOpacity>
          </View>
          
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateYAnim }], marginTop: 16 }}>
            {subjects.map((subject, index) => {
              return (
                <View key={index} style={{ marginVertical: 6 }}>
                  <Pressable onPress={() => handleSubjectClick(subject)}>
                    <ExpoLinearGradient
                      colors={["#22E2D6", "#15BBB1", "#0D7F78"]}
                      locations={[0, 0.4, 1]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={[
                        styles.pillSubjectContainer,
                        {
                          borderWidth: lastSubject === `${activeTab}_${subject}` ? 2 : 0,
                          borderColor: lastSubject === `${activeTab}_${subject}` ? "#FFFFFF" : "transparent",
                          marginTop: 0,
                        }
                      ]}
                    >
                      <View style={styles.pillIconWrapper}>
                        <Image source={getSubjectIcon(subject)} style={styles.pillIcon} />
                      </View>

                      <View style={styles.pillTextWrapper}>
                        <Text style={styles.pillSubjectText}>{subject}</Text>
                      </View>

                      <View style={styles.pillPercentageWrapper}></View>
                    </ExpoLinearGradient>
                  </Pressable>
                </View>
              );
            })}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary01,
  },
  cardContainer: {
    backgroundColor: "rgba(2, 60, 54, 0.4)",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Darker semi-transparent container
    borderRadius: 30,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 26,
  },
  activeTab: {
    backgroundColor: COLORS.two || '#0AB8AD',
  },
  tabText: {
    fontSize: 20,
    color: COLORS.two || '#0AB8AD', // Teal color for inactive text
    fontFamily: "AppFont-Bold",
  },
  activeTabText: {
    color: '#013a3f', // Dark green color for active text on teal background
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  chaptersList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  listCard: {
    backgroundColor: "rgba(40, 63, 56, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(10, 184, 173, 0.3)",
  },
  listCardExpanded: {
    borderColor: COLORS.two,
    backgroundColor: "rgba(40, 63, 56, 1)",
  },
  listCardMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
  },
  listCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  chaptersContainer: {
    marginTop: 10,
  },
  progressContainer: {
    marginBottom: 16,
  },
  firstRoundProgress: {},
  additionalRoundProgress: {
    marginTop: 10,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  roundLabelText: {
    fontSize: 12,
    color: COLORS.two,
    fontFamily: "AppFont-Bold",
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.two,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "AppFont-Bold",
    textAlign: "right",
  },
  practiceButton: {
    backgroundColor: COLORS.two,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  practiceButtonText: {
    color: COLORS.secondary01,
    fontFamily: "AppFont-Bold",
    fontSize: 14,
  },
  chapterBadge: {
    backgroundColor: 'rgba(10, 184, 173, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  chapterNumber: {
    fontSize: 11,
    color: COLORS.two,
    fontFamily: "AppFont-Bold",
    letterSpacing: 0.5,
  },
  chapterTitle: {
    fontSize: 15,
    color: COLORS.light,
    fontFamily: "AppFont-Bold",
    flex: 1,
  },
  noDataText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "AppFont-Bold",
    textAlign: "center",
    paddingVertical: 12,
  },
  pillSubjectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#15BBB1",
    marginTop: hp(1.2),
    paddingVertical: 15,
    paddingHorizontal: wp(3),
    borderRadius: 30,
  },
  pillIconWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pillIcon: {
    width: wp(7),
    height: hp(3),
    resizeMode: "contain",
  },
  pillTextWrapper: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  pillSubjectText: {
    fontFamily: 'AppFont-Bold',
    fontWeight: '700',
    fontSize: wp(4.8),
    color: "#FFFFFF",
    textAlign: "center",
  },
  pillPercentageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  }
});

export default ClassSelection;
