import React, { useContext, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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



const Home = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const themeContext = useContext(ThemeContext);
  const { userData, setUserData, appState, setAppState } = themeContext;

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
                navigation.navigate("Login");
              }
            });
        } else {
          navigation.navigate("Login");
        }
      })
      .catch((err) => {
        navigation.navigate("SignUp");
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
});