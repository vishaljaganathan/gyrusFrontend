
import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import { verticalScale } from "../styles/Responsive";
import { COLORS } from "../styles/themes";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import GradientButton from "../components/GradientButton";
import { Wrapper } from "../components/Wrapper";
import { getSecureStorage } from "../config/SecureStore";
import HeaderBar from "../navigation/Headerbar";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import Net from "@react-native-community/netinfo";
import { ThemeContext } from "../service/authContext";

const Rewards = ({ navigation }: { navigation: any }) => {
  const RewardsImg = require("../assets/Rewards.png");
  const insets = useSafeAreaInsets();
  const {
    userData,
    setUserData,
    signUpData,
    setSignUpData,
    appState,
    setAppState,
  } = useContext(ThemeContext);

  useEffect(() => {
    CheckInternetConnectivity();
    getSecureStorage("token")
      .then((token) => {
        if (token != null && token != undefined && token != "") {
        } else {
          navigation.navigate("SignUp"); // Use navigation prop
        }
      })
      .catch((err) => {
        navigation.navigate("SignUp"); // Use navigation prop
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

  function formatNumber(num: number) {
    let numStr = num.toString();
    if (num >= 100000) {
      return numStr.replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1,");
    } else {
      return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      {/* <View
        style={{
          paddingTop: insets.top,
          paddingRight: insets.right,
          paddingLeft: insets.left,
          backgroundColor: Platform.OS ? "#00474C" : "",
        }}
      /> */}
      <LinearGradient
        style={styles.container}
        colors={["#028464", "#0AB7AD", "#0B7960"]}
      >
        <HeaderBar />
        {!appState.internetStatus && <Wrapper />}

        {appState.internetStatus && (
          <View style={styles.mainContainer}>
            {/* Content Card */}
            <View style={styles.contentCard}>
              {/* Rewards Image Section - Repositioned at the top */}
              <View style={styles.imageContainer}>
                <Image
                  source={RewardsImg}
                  style={styles.rewardsImage}
                  resizeMode="contain"
                />
              </View>

              {/* Current Balance Section */}
              <View style={styles.currentBalanceSection}>
                <Text style={styles.currentBalanceLabel}>Current Balance</Text>
                <Text style={styles.currentBalanceValue}>
                  {formatNumber(userData.rewards.current)}
                </Text>
              </View>

              {/* Earned and Redeemed Section */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>EARNED</Text>
                  <Text style={styles.statValue}>
                    {formatNumber(userData.rewards.earned)}
                  </Text>
                </View>

                <View style={styles.dividerLine} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>REDEEMED</Text>
                  <Text style={styles.statValue}>
                    {formatNumber(userData.rewards.redeemed)}
                  </Text>
                </View>
              </View>

              {/* Closing Balance Section */}
              <View style={styles.closingBalanceSection}>
                <Text style={styles.closingBalanceLabel}>CLOSING BALANCE</Text>
                <Text style={styles.closingBalanceValue}>
                  {formatNumber(userData.rewards.closing)}
                </Text>
              </View>

              {/* Redeem Button */}
              <View style={styles.buttonContainer}>
                <GradientButton
                  disable={true}
                  colors={["rgba(0, 183, 194, 1))", "rgba(197, 255, 244, 0.5)"]}
                  text="REDEEM NOW"
                />
              </View>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#014b51ff",
  },
  androidLarge57: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
    height: 800,
    width: "100%",
  },
  Img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    zIndex: 1000,
  },
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  mainContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(4),
  },
  imageContainer: {
    position: "relative",  
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: hp(-2),
    marginBottom: hp(1),
  },
  rewardsImage: {
    width: wp(40),
    height: hp(20),
  },
  contentCard: {
    backgroundColor: "rgba(0, 71, 76, 0.7)",
    borderRadius: hp(2),
    paddingHorizontal: wp(6),
    paddingVertical: hp(3),
    width: wp(92),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  currentBalanceSection: {
    alignItems: "center",
    marginBottom: hp(3),
    width: "100%",
  },
  currentBalanceLabel: {
    fontSize: wp(4),
    textTransform: "uppercase",
    color: COLORS.light,
    letterSpacing: wp(0.5),
    backgroundColor: COLORS.grey02,
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(4),
    width: "100%",
    textAlign: "center",
    borderRadius: wp(1),
  },
  currentBalanceValue: {
    fontSize: hp(4),
    color: `${COLORS.yellow02}`,
    fontWeight: "bold",
    marginTop: hp(2),
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: hp(3),
    paddingHorizontal: wp(2),
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: hp(1.8),
    letterSpacing: wp(0.3),
    color: COLORS.light,
    textTransform: "uppercase",
    backgroundColor: COLORS.grey02,
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(3),
    borderRadius: wp(1),
    textAlign: "center",
    minWidth: wp(25),
  },
  statValue: {
    color: COLORS.primary03,
    fontSize: hp(2.5),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: hp(1.5),
  },
  dividerLine: {
    height: hp(8),
    width: wp(0.5),
    backgroundColor: COLORS.grey02,
    marginHorizontal: wp(4),
  },
  closingBalanceSection: {
    alignItems: "center",
    marginBottom: hp(4),
    width: "100%",
  },
  closingBalanceLabel: {
    fontSize: wp(4),
    textTransform: "uppercase",
    color: COLORS.light,
    letterSpacing: wp(0.5),
    backgroundColor: COLORS.grey02,
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(4),
    width: "100%",
    textAlign: "center",
    borderRadius: wp(1),
  },
  closingBalanceValue: {
    fontSize: hp(4),
    color: COLORS.grey09,
    fontWeight: "bold",
    marginTop: hp(2),
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },

  rewardsContainer: {
    flex: 4,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    position: "relative",
  },
  rewrdsImg: {
    position: "absolute",
    bottom: hp(48),
  },
  contentContainer: {
    backgroundColor: "rgba(0, 71, 76,0.7)",
    paddingHorizontal: wp(6),
    paddingVertical: verticalScale(50),
    borderRadius: hp(0.5),
    paddingTop: hp(12),
    position: "absolute",
    zIndex: -1,
    width: wp(92),
    top: hp(12),
  },
  curntpointCont: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  currentText: {
    fontSize: wp(4),
    textTransform: "uppercase",
    color: COLORS.light,
    letterSpacing: wp(2.5),
    backgroundColor: COLORS.grey02,
    paddingVertical: hp(0.3),
    width: "100%",
    textAlign: "center",
    marginTop: hp(1),
  },
  currentPoints: {
    fontSize: hp(3),
    color: `${COLORS.yellow02},${COLORS.yellow03}`,
    fontWeight: "bold",
    marginVertical: hp(1),
  },
  lifeContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lifeScoreText: {
    fontSize: hp(1.8),
    letterSpacing: wp(1),
    color: COLORS.light,
    textTransform: "uppercase",
    backgroundColor: COLORS.grey02,
    padding: hp(0.4),
  },
  life_balance_Points: {
    color: COLORS.primary03,
    fontSize: hp(2),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: hp(1),
  },
  balanceText: {
    fontSize: hp(1.8),
    color: "white",
    letterSpacing: wp(1),
    textTransform: "uppercase",
    backgroundColor: COLORS.grey02,
    padding: hp(0.4),
  },
  targetContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    top: hp(2),
  },
  targetText: {
    fontSize: wp(4),
    textTransform: "uppercase",
    color: COLORS.light,
    letterSpacing: wp(1),
    backgroundColor: COLORS.grey02,
    paddingVertical: hp(0.3),
    width: "100%",
    textAlign: "center",
  },
  targetPoints: {
    fontSize: hp(3),
    color: COLORS.grey09,
    fontWeight: "bold",
    marginTop: hp(1),
  },
  verticleLine: {
    height: hp(8),
    width: wp(1),
    backgroundColor: COLORS.grey02,
  },
  commonColor: {
    color: COLORS.light,
    fontSize: hp(2),
  },
  commonfontSize: {
    fontSize: hp(2),
    color: COLORS.light,
  },

});

export default Rewards;
