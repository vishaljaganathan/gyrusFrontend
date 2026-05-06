import React, { useContext, useEffect, useMemo, useState } from "react";
import { Dimensions, Image, Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
// 9:16 image — compute height from width, cap at screen height
const IMG_H = Math.min(SCREEN_W * (16 / 9), SCREEN_H);
import { CustomText as Text } from "../components/CustomText";
import HeaderBar from "../navigation/Headerbar";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import Arrows from "../components/AroowDirection";
import { LinearGradient } from "expo-linear-gradient";
import { axiosInstance } from "../config/indeceptor";
import { Wrapper } from "../components/Wrapper";
import { getSecureStorage } from "../config/SecureStore";
import Net from "@react-native-community/netinfo";
import { ThemeContext } from "../service/authContext";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../styles/themes";



const Home = ({ navigation, route }: { navigation: any; route: any }) => {
  const insets = useSafeAreaInsets();
  const themeContext = useContext(ThemeContext);
  const { userData, setUserData, appState, setAppState } = themeContext;

  const [showPremiumBanner, setShowPremiumBanner] = useState(false);
  const [buttonsEnabled, setButtonsEnabled] = useState(false);

  // Step 1: detect navigation param and open the banner
  useEffect(() => {
    if (route?.params?.fromPaymentSuccess) {
      navigation.setParams({ fromPaymentSuccess: undefined });
      setButtonsEnabled(false);
      setShowPremiumBanner(true);
    }
  }, [route?.params?.fromPaymentSuccess]);

  // Step 2: when banner opens, start the 3-second timer to reveal buttons
  useEffect(() => {
    if (!showPremiumBanner) return;
    setButtonsEnabled(false);
    const timer = setTimeout(() => {
      setButtonsEnabled(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showPremiumBanner]);

  const closePremiumBanner = () => {
    setShowPremiumBanner(false);
  };

  const isTester = useMemo(() => {
    return String(userData?.accType || "").trim().toLowerCase() === "tester";
  }, [userData?.accType]);

  useEffect(() => {
    if (!userData) return;
    const subject = (appState?.home || "neet").toString().toLowerCase();
    if (!userData.planValid && subject !== "neet") {
      setAppState((prev: any) => ({
        ...prev,
        home: "neet",
      }));
    }
  }, [userData?.planValid, appState?.home]);


  useEffect(() => {
    CheckInternetConnectivity();
    getSecureStorage("token")
      .then((token) => {
        if (token != null && token != undefined && token != "") {
          axiosInstance
            .get("authentication/user")
            .then((res) => {
              if (res && res.data) {
                setUserData(res.data);
              }
            })
                .catch((err) => {
              if (err.status == 401) {
                navigation.replace("Login");
              }
            });
        } else {
          navigation.replace("Login");
        }
      })
      .catch((err) => {
        navigation.replace("SignUp");
      });
  }, []);

  const CheckInternetConnectivity = () => {
    Net.fetch().then((state) => {
      setAppState((prev: any) => ({
        ...prev,
        internetStatus: state.isConnected,
      }));
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.screen} pointerEvents="box-none" collapsable={false}>
        <LinearGradient
          style={[styles.androidLarge57, { paddingTop: 0 }]}
          colors={["#028464", "#0AB7AD", "#0B7960"]}
        >
          <HeaderBar />
          {!appState.internetStatus && <Wrapper />}
          {appState.internetStatus && (
            <Arrows
              subName={appState.home}
              track={
                (userData &&
                  userData[appState.home] &&
                  JSON.parse(
                    JSON.stringify(userData[appState.home])
                  ).scores.reverse()) ||
                []
              }
            />
          )}
        </LinearGradient>

        {isTester && (
          <Pressable
            onPress={() => navigation.navigate("MCQSearch")}
            style={[
              styles.floatingSearch,
              { bottom: Math.max(10, insets.bottom) + 30 },
            ]}
            hitSlop={12}
          >
            <Ionicons name="search" size={26} color={COLORS.light} />
          </Pressable>
        )}
      </View>

      <Modal
        visible={showPremiumBanner}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePremiumBanner}
      >
        <View style={[styles.bannerOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.bannerImageWrapper}>
            <Image
              source={require("../assets/premiumBanner.png")}
              style={styles.bannerImage}
              resizeMode="contain"
            />

            {/* X close button — overlaid inside image, top-right */}
            {buttonsEnabled && (
              <TouchableOpacity
                style={styles.bannerCloseBtn}
                onPress={closePremiumBanner}
                activeOpacity={0.7}
              >
                <Text style={styles.bannerCloseBtnText}>✕</Text>
              </TouchableOpacity>
            )}

            {/* Continue button — overlaid inside image, bottom */}
            {buttonsEnabled && (
              <TouchableOpacity
                style={styles.bannerContinueBtn}
                onPress={closePremiumBanner}
                activeOpacity={0.85}
              >
                <Text style={styles.bannerContinueBtnText}>CONTINUE</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#014b51ff",
  },
  screen: {
    flex: 1,
  },
  androidLarge57: {
    flex: 1,
    overflow: "visible",
    backgroundColor: "transparent",
    width: "100%",
  },
  floatingSearch: {
    position: "absolute",
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.two,
    elevation: 8,
    zIndex: 20,
  },
  Img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    zIndex: 1000,
  },
  bannerOverlay: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerImageWrapper: {
    width: SCREEN_W,
    height: IMG_H,
  },
  bannerImage: {
    width: SCREEN_W,
    height: IMG_H,
  },
  bannerCloseBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerCloseBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 19,
  },
  bannerContinueBtn: {
    position: "absolute",
    bottom: 20,
    left: 24,
    right: 24,
    zIndex: 10,
    paddingVertical: 10,
    marginTop: 12,
    borderRadius: 32,
    backgroundColor: "rgba(0, 183, 194, 1)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  bannerContinueBtnText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bannerBtnDisabled: {
    opacity: 0.4,
  },
});