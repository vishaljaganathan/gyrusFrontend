import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Easing,
  TouchableOpacity,
  BackHandler} from "react-native"
import { CustomText as Text, CustomAnimatedText } from '../components/CustomText';



import { ThemeContext } from "../service/authContext";
import { getSecureStorage } from "../config/SecureStore";
import { axiosInstance } from "../config/indeceptor";
import { LinearGradient } from "expo-linear-gradient";
import NetInfo from "@react-native-community/netinfo";
import { COLORS } from "../styles/themes";

const { width, height } = Dimensions.get("window");

// Medical-related emojis
const floatingItems = ["⚕", "🧬", "🔬", "🩺", "🧪"];

// Adjusted positions to avoid logo, text, progress bar
const emojiPositions = [
  { top: "10%", left: "20%" },
  { top: "30%", right: "1%" },
  { top: "50%", left: "5%" },
  { top: "80%", left: "25%" },
  { top: "75%", right: "5%" },
];

const Default = ({ navigation }: { navigation: any }) => {
  const logoImg = require("../assets/appLogo.png");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const emojiAnimations = useRef(
    floatingItems.map(() => new Animated.Value(0)),
  ).current;

  const { setUserData, setAppState } = useContext(ThemeContext);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Fade in logo and app name
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true}).start();

    // Floating animation for emojis
    emojiAnimations.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + index * 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true}),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000 + index * 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true}),
        ]),
      ).start();
    });

    // Simulate loading progress
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false}).start();

    const progressListener = progressAnim.addListener(({ value }) => {
      setLoadingProgress(Math.floor(value * 100));
    });

    // Main logic: check connectivity and navigate
    const setupApp = async () => {
      try {
        const netState = await NetInfo.fetch();
        setAppState((prev: any) => ({
          ...prev,
          internetStatus: netState.isConnected}));

        const token = await getSecureStorage("token");
        if (token) {
          try {
            const res = await axiosInstance.get("authentication/user");
            if (res && res.data) {
              setUserData(res.data);
              navigation.replace("BottomBar");
            } else {
              navigation.replace("Login");
            }
          } catch (err) {
            navigation.replace("Login");
          }
        } else {
          // Wait a bit more for the splash feel
          setTimeout(() => {
            navigation.replace("Login");
          }, 1000);
        }
      } catch (err) {
        navigation.replace("Login");
      }
    };

    setupApp();

    return () => {
      progressAnim.removeListener(progressListener);
    };
  }, [navigation]);

  return (
    <LinearGradient
      style={styles.container}
      colors={["#00474C", "#0AB8AD", "#028464"]}
    >
      {/* Floating Emojis */}
      {floatingItems.map((item, index) => {
        const position = emojiPositions[index];
        const translateY = emojiAnimations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15]});

        return (
          <Animated.View
            key={index}
            style={[
              styles.floatingItem,
              position as any,
              { transform: [{ translateY }] },
            ]}
          >
            <Text style={styles.emojiText}>{item}</Text>
          </Animated.View>
        );
      })}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Image source={logoImg} style={styles.logo} resizeMode="contain" />
        </View>

        <CustomAnimatedText style={[styles.appName, { opacity: fadeAnim }]}>
          Gyrus NEET
        </CustomAnimatedText>
        <Text style={styles.tagline}>Your NEET Preparation App</Text>

        <View style={styles.loadingContainer}>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"]})},
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Preparing your journey...</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30},
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"},
  logoContainer: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 100,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8},
  logo: {
    width: "100%",
    height: "100%"},
  appName: {
    
    fontFamily: 'AppFont-Bold', fontSize: 40,
        color: "#fff",
    letterSpacing: 1.2,
    marginBottom: 6,
    textAlign: "center"},
  tagline: {
    
    fontFamily: 'AppFont-Regular', fontSize: 18,
        color: "rgba(255,255,255,0.9)",
    marginBottom: 50,
    textAlign: "center"},
  loadingContainer: {
    width: "100%",
    alignItems: "center"},
  progressBarContainer: {
    width: width * 0.6,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15},
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 10},
  loadingText: {
    
    color: "rgba(255,255,255,0.7)",
    fontFamily: 'AppFont-Regular', fontSize: 14},
  floatingItem: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center"},
  emojiText: {
    fontFamily: 'AppFont-Regular', fontSize: 24,
    color: "rgba(255,255,255,0.6)"}});

export default Default;
