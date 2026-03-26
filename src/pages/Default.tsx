import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Easing,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { ThemeContext } from "../service/authContext";
import { getSecureStorage } from "../config/SecureStore";
import { axiosInstance } from "../config/indeceptor";
import { LinearGradient } from "expo-linear-gradient";
import NetInfo from '@react-native-community/netinfo';
import { COLORS } from "../styles/themes";
import GradientButton from "../components/GradientButton";

const { width, height } = Dimensions.get("window");

// Medical-related emojis
const floatingItems = [
  "⚕", "🧬", "🔬", "🩺", "🧪"
];

// Adjusted positions to avoid logo, text, progress bar
const emojiPositions = [
  { top: "10%", left: "20%" },
  { top: "30%", right: "1%" },
  { top: "50%", left: "5%" },
  { top: "80%", left: "25%" },
  { top: "75%", right: "5%" },
];


const Default = ({ navigation }: { navigation: any }) => {
  const { setUserData } = useContext(ThemeContext);
  const [progress, setProgress] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [isLowInternet, setIsLowInternet] = useState(false);
  const showNoInternet = false; // temporary for testing

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
    ]).start();

    let progressVal = 0;
    const interval = setInterval(() => {
      progressVal += 0.02;
      setProgress(progressVal);
      if (progressVal >= 1) clearInterval(interval);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      if (state.details && (state.details as any).strength < 10) {
        setIsLowInternet(true);
      } else {
        setIsLowInternet(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const newUser = await getSecureStorage("newUser");
        if (!newUser) { navigation.navigate("SignUp"); return; }
        const token = await getSecureStorage("token");
        if (token) {
          try {
            const res = await axiosInstance.get("authentication/user");
            if (res?.data) setUserData(res.data);
            navigation.navigate("BottomBar");
          } catch (err: any) {
            console.error("Error fetching user data:", err.message || err);
            // Navigate to login on any error (network timeout, 401, server unreachable, etc.)
            navigation.navigate("Login");
          }
        } else navigation.navigate("Login");
      } catch {
        navigation.navigate("SignUp");
      }
    };
    const timer = setTimeout(checkAuth, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={["#02645e", "#01524d"]} style={styles.container}>
      {/* Floating Emojis in bubbles */}
      {floatingItems.map((emoji, index) => (
        <BubbleEmoji key={index} emoji={emoji} position={emojiPositions[index]} />
      ))}

      <Animated.View style={[styles.logoWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image source={require("../assets/appLogo.png")} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>Gyrus NEET</Animated.Text>
      <Text style={styles.tagline}>Your NEET Preparation App</Text>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.loadingText}>Preparing your journey...</Text>

      {!isConnected && (
        <View style={styles.overlay}>
          <View style={styles.noInternetContainer}>
            <Text style={styles.noInternetText}>No internet! </Text>
            <Text style={styles.noInternetText}>Please check and try again!</Text>
            <View style={{ marginTop: 10 }}>
              <GradientButton
                onPress={() => BackHandler.exitApp()}
                colors={["#00b7c2ff", "#c5fff480"]}
                text="Exit App"
              />
            </View>
          </View>
        </View>
      )}

      {isLowInternet && (
        <View style={styles.overlay}>
          <View style={styles.lowInternetContainer}>
            <Text style={styles.lowInternetText}>Something went wrong!</Text>
            <Text style={styles.lowInternetText}>Check your internet speed and</Text>
            <Text style={styles.lowInternetText}>Try Again!</Text>
            <View style={{ marginTop: 10 }}>
              <GradientButton
                onPress={() => BackHandler.exitApp()}
                colors={["#00b7c2ff", "#c5fff480"]}
                text="Exit App"
              />
            </View>
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const BubbleEmoji = ({ emoji, position }: { emoji: string; position: any }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -10 - Math.random() * 10,
              duration: 4000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 4000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: 10 - Math.random() * 20,
              duration: 3500 + Math.random() * 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 3500 + Math.random() * 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        position,
        { transform: [{ translateY }, { translateX }] },
      ]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden", padding: 20 },

  bubble: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#15BBB1",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 30,
    opacity: 0.4,
  },
  logoWrapper: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(21,187,177,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    shadowColor: "#15BBB1",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    position: "relative",
  },
  logo: {
    width: 130,
    height: 130,
  },
  appName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1.2,
    marginBottom: 6,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 50,
    textAlign: "center",
  },
  progressBarContainer: {
    width: width * 0.6,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#15BBB1",
    borderRadius: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 12,
    letterSpacing: 0.5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noInternetContainer: {
    backgroundColor: "rgba(42, 50, 42,0.8)",
    borderWidth: 2,
    borderColor: "#ADADAD",
    borderStyle: "solid",
    borderRadius: 12,
    overflow: "hidden",
    padding: 20,
    alignItems: 'center',
    width: 250,
    height: 150,
  },
  noInternetText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  lowInternetContainer: {
    backgroundColor: "rgba(42, 50, 42,0.8)",
    borderWidth: 2,
    borderColor: "#ADADAD",
    borderStyle: "solid",
    borderRadius: 12,
    overflow: "hidden",
    padding: 20,
    alignItems: 'center',
    width: 280,
    height: 180,
  },
  lowInternetText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  tryAgainButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Default;
