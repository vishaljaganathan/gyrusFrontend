import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  LayoutAnimation,
  UIManager,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../styles/themes";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { CustomText as Text } from "../components/CustomText";

// Import the refactored form components
import LoginForm from "./Login";
import SignUpForm from "./Signup";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Auth = ({ navigation, route }: { navigation: any; route: any }) => {
  const logo = require("../assets/appLogo.png");
  const isSignUpRoute = route.name === "SignUp";
  
  // SignUp is now the 1st tab (left, value 0) and Login is the 2nd tab (right, value 1)
  const [activeTab, setActiveTab] = useState<"login" | "signup">(
    isSignUpRoute ? "signup" : "login"
  );
  const [formContainerWidth, setFormContainerWidth] = useState(0);
  const [tabWidth, setTabWidth] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  // slideAnim: 0 represents SignUp (left), 1 represents Login (right)
  const slideAnim = useRef(new Animated.Value(isSignUpRoute ? 0 : 1)).current;

  // Track keyboard open/close state to dynamically toggle flex centering
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardOpen(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardOpen(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Synchronize tab if route name changes (e.g. navigation redirection)
  useEffect(() => {
    if (route.name === "SignUp") {
      setActiveTab("signup");
    } else {
      setActiveTab("login");
    }
  }, [route.name]);

  // Animate tab slide and layout transitions
  useEffect(() => {
    // Configure layout animation for smooth card height shifts
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    Animated.spring(slideAnim, {
      toValue: activeTab === "login" ? 1 : 0, // Login = 1, SignUp = 0
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  // Interpolations for horizontal sliding and fading
  const translateXTab = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  // SignUp is on the left: exits to the left when transitioning to Login (value goes from 0 to 1)
  const translateSignUp = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -formContainerWidth],
  });

  // Login is on the right: enters from the right when transitioning from SignUp (value goes from 0 to 1)
  const translateLogin = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [formContainerWidth, 0],
  });

  const opacitySignUp = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const opacityLogin = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#028464", "#0AB7AD", "#0B7960"]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContainer,
              !isKeyboardOpen && { justifyContent: "center" },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.authContainer,
                !isKeyboardOpen && { justifyContent: "center" },
              ]}
            >
              {/* Logo Section */}
              <View style={styles.logoContainer}>
                <Image source={logo} style={styles.logoImage} />
              </View>

              {/* Main Card Container */}
              <View style={styles.formContainer}>
                {/* Segmented/Pill Tab Bar */}
                <View
                  style={styles.tabContainer}
                  onLayout={(e) => {
                    const width = e.nativeEvent.layout.width;
                    setTabWidth((width - 8) / 2);
                  }}
                >
                  {tabWidth > 0 && (
                    <Animated.View
                      style={[
                        styles.activeSlider,
                        {
                          width: tabWidth,
                          transform: [{ translateX: translateXTab }],
                        },
                      ]}
                    />
                  )}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.tabButton}
                    onPress={() => setActiveTab("signup")}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === "signup" && styles.activeTabText,
                      ]}
                    >
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.tabButton}
                    onPress={() => setActiveTab("login")}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === "login" && styles.activeTabText,
                      ]}
                    >
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Form Content Slider Wrapper */}
                <View
                  style={styles.sliderContainer}
                  onLayout={(e) => {
                    setFormContainerWidth(e.nativeEvent.layout.width);
                  }}
                >
                  {formContainerWidth > 0 && (
                    <>
                      {/* Sign Up Form Slide Container */}
                      <Animated.View
                        style={[
                          styles.formWrapper,
                          {
                            position: activeTab === "signup" ? "relative" : "absolute",
                            opacity: opacitySignUp,
                            transform: [{ translateX: translateSignUp }],
                          },
                        ]}
                        pointerEvents={activeTab === "signup" ? "auto" : "none"}
                      >
                        <SignUpForm
                          navigation={navigation}
                          route={route}
                          onSwitchTab={() => setActiveTab("login")}
                        />
                      </Animated.View>

                      {/* Sign In Form Slide Container */}
                      <Animated.View
                        style={[
                          styles.formWrapper,
                          {
                            position: activeTab === "login" ? "relative" : "absolute",
                            opacity: opacityLogin,
                            transform: [{ translateX: translateLogin }],
                          },
                        ]}
                        pointerEvents={activeTab === "login" ? "auto" : "none"}
                      >
                        <LoginForm
                          navigation={navigation}
                          onSwitchTab={() => setActiveTab("signup")}
                        />
                      </Animated.View>
                    </>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#028464",
  },
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: hp(2),
    paddingBottom: hp(10), // Generous padding bottom for keyboard spacing
  },
  authContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: wp(5),
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: hp(2),
  },
  logoImage: {
    width: 150,
    height: 120,
    resizeMode: "contain",
  },
  formContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.30)",
    width: "100%",
    maxWidth: 450,
    paddingHorizontal: wp(6),
    paddingVertical: hp(3),
    borderRadius: wp(4),
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.30)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minHeight: hp(35),
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: wp(6),
    padding: 4,
    width: "100%",
    marginBottom: hp(2.5),
    position: "relative",
  },
  tabButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  activeSlider: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.light,
    borderRadius: wp(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontFamily: "AppFont-Bold",
    fontSize: wp(4),
    color: "rgba(255, 255, 255, 0.7)",
  },
  activeTabText: {
    color: COLORS.secondary01,
  },
  sliderContainer: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  formWrapper: {
    width: "100%",
  },
});

export default React.memo(Auth);
