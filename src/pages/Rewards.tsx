import React, { useContext, useEffect } from "react";
import { View, StyleSheet, Platform, Image, TouchableOpacity, Alert, Modal, ScrollView } from "react-native"
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from "@react-navigation/native";
import { CustomText as Text } from '../components/CustomText';



import { LinearGradient } from "expo-linear-gradient";
import { verticalScale } from "../styles/Responsive";
import { COLORS } from "../styles/themes";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp} from "react-native-responsive-screen";
import GradientButton from "../components/GradientButton";
import { axiosInstance } from "../config/indeceptor";
import { Wrapper } from "../components/Wrapper";
import { getSecureStorage } from "../config/SecureStore";
import HeaderBar from "../navigation/Headerbar";
import {
  useSafeAreaInsets,
  SafeAreaView} from "react-native-safe-area-context";
import Net from "@react-native-community/netinfo";
import { ThemeContext } from "../service/authContext";
import StopwatchCounter from "../components/StopwatchCounter";

const Rewards = ({ navigation }: { navigation: any }) => {
  const RewardsImg = require("../assets/Rewards.png");
  const insets = useSafeAreaInsets();
  const {
    userData,
    setUserData,
    appState,
    setAppState} = useContext(ThemeContext);
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const isFocused = useIsFocused();
  const [animationKey, setAnimationKey] = React.useState(0);

  useEffect(() => {
    if (isFocused) {
      setAnimationKey(prev => prev + 1);
    }
  }, [isFocused]);

  useEffect(() => {
    CheckInternetConnectivity();
    getSecureStorage("token")
      .then((token) => {
        if (token != null && token != undefined && token != "") {
        } else {
          navigation.replace("SignUp"); // Use replace to avoid stacking
        }
      })
      .catch((err) => {
        navigation.replace("SignUp"); // Use replace to avoid stacking
      });
  }, []);

  const handleRedeem = async () => {
    const currentPoints = Number(userData?.rewards?.current || 0);
    const possiblePercentage = Math.floor(currentPoints / 2000);
    const pointsToRedeem = possiblePercentage * 2000;

    if (currentPoints < 40000) {
      Alert.alert("Insufficient Points", "You can only redeem after reaching 20% off (40,000 points)");
      return;
    }

    Alert.alert(
      "Redeem Points",
      `You have ${formatNumber(currentPoints)} points. If you redeem now, you will use ${formatNumber(pointsToRedeem)} points to get a ${possiblePercentage}% discount on your next subscription.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Redeem", 
          onPress: async () => {
            try {
              const res = await axiosInstance.post('authentication/redeem-points', { points: pointsToRedeem });
              if (res.data) {
                // Refresh user data
                const userRes = await axiosInstance.get('authentication/user');
                setUserData(userRes.data);
                Alert.alert("Success", `Points redeemed successfully! You got a ${possiblePercentage}% discount.`);
              }
            } catch (err) {
              console.error("Redemption error:", err);
              Alert.alert("Error", "Failed to redeem points. Please try again later.");
            }
          }
        }
      ]
    );
  };

  const CheckInternetConnectivity = () => {
    Net.fetch().then((state) => {
      setAppState((prev: any) => ({
        ...prev,
        internetStatus: state.isConnected}));
    });
  };

  function formatNumber(num: number) {
    let numStr = (num || 0).toString();
    if (num >= 100000) {
      return numStr.replace(/(\d)(?=(\d{2})+(?!\d))/g, "$1,");
    } else {
      return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
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
                <StopwatchCounter 
                  key={animationKey}
                  value={Number(userData?.rewards?.current || 0)} 
                  style={styles.currentBalanceValue} 
                />
              </View>

              {/* Earned and Redeemed Section */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>EARNED</Text>
                  <Text style={styles.statValue}>
                    {formatNumber(userData?.rewards?.earned)}
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>REDEEMED</Text>
                  <Text style={styles.statValue}>
                    {formatNumber(userData?.rewards?.redeemed)}
                  </Text>
                </View>
              </View>

              {/* Discount Ready Section */}
              {(() => {
                const discPct = Number(userData?.availableDiscountPercentage || 0);
                const currentPoints = Number(userData?.rewards?.current || 0);
                const pendingPercentage = Math.floor(currentPoints / 2000);
                
                return discPct > 0 ? (
                  <View style={styles.discountReadySection}>
                    <Text style={styles.discountReadyLabel}>DISCOUNT READY</Text>
                    <Text style={styles.discountReadyValue}>{discPct}% OFF</Text>
                    <Text style={styles.discountReadyHint}>Applied automatically at checkout</Text>
                  </View>
                ) : pendingPercentage >= 20 ? (
                  <View style={styles.discountReadySection}>
                    <Text style={styles.discountReadyLabel}>REDEEM TO UNLOCK</Text>
                    <Text style={styles.discountReadyValue}>{pendingPercentage}% OFF</Text>
                    <Text style={styles.discountReadyHint}>You have enough points to redeem now</Text>
                  </View>
                ) : (
                  <View style={styles.discountReadySection}>
                    <Text style={styles.discountReadyLabel}>DISCOUNT</Text>
                    <Text style={styles.discountReadyValue}>0% OFF</Text>
                    <Text style={styles.discountReadyHint}>Earn 40,000 points (20% off) to redeem</Text>
                  </View>
                );
              })()}

              {/* Redeem Button */}
              <View style={styles.buttonContainer}>
                {(() => {
                  const currentPoints = Number(userData?.rewards?.current || 0);
                  const isRedeemable = currentPoints >= 40000;
                  
                  return (
                    <TouchableOpacity 
                      onPress={handleRedeem}
                      style={[styles.redeemBtnWrapper, !isRedeemable && styles.disabledBtn]}
                      activeOpacity={0.8}
                      disabled={!isRedeemable}
                    >
                      <LinearGradient
                        colors={isRedeemable 
                          ? ["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]
                          : ["rgba(100, 100, 100, 1)", "rgba(150, 150, 150, 0.5)"]
                        }
                        style={styles.redeemGradient}
                      >
                        <Text style={styles.redeemBtnText}>REDEEM NOW</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })()}

                <TouchableOpacity 
                  style={styles.historyToggleBtn}
                  onPress={() => setShowHistoryModal(true)}
                >
                  <Text style={styles.historyToggleText}>View Redemption History</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Redemption History Modal */}
        <Modal
          visible={showHistoryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowHistoryModal(false)}
        >
          <View style={styles.historyModalOverlay}>
            <View style={styles.historyModalContent}>
              <View style={styles.historyModalHeader}>
                <Text style={styles.historyModalTitle}>Redemption History</Text>
                <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                  <Ionicons name="close" size={wp(7)} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyList}>
                {userData?.redemptions?.length > 0 ? (
                  userData.redemptions.map((item: any, index: number) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyPoints}>-{formatNumber(item.points)} Points</Text>
                        <Text style={styles.historyDate}>
                          {new Date(item.redeemedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.historyBadge}>
                        <Text style={styles.historyPercentage}>{item.percentage}% Off</Text>
                      </View>
                    </View>
                  )).reverse()
                ) : (
                  <View style={styles.emptyHistory}>
                    <Ionicons name="receipt-outline" size={wp(15)} color="rgba(255,255,255,0.2)" />
                    <Text style={styles.emptyHistoryText}>No redemptions yet</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#014b51ff"},
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent"},
  mainContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(4)},
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(1)},
  rewardsImage: {
    width: wp(28),
    height: hp(14)},
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
      height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8},
  currentBalanceSection: {
    alignItems: "center",
    marginBottom: hp(3),
    width: "100%"},
  currentBalanceLabel: {
    
    fontFamily: 'AppFont-Bold', fontSize: wp(4),
    textTransform: "uppercase",
    color: COLORS.light,
    letterSpacing: wp(0.5),
    backgroundColor: COLORS.secondary05,
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(4),
    width: "100%",
    textAlign: "center",
    borderRadius: wp(1)},
  currentBalanceValue: {
    
    fontFamily: 'AppFont-Bold', fontSize: hp(4),
    color: `${COLORS.yellow02}`,
        marginTop: hp(2),
    textAlign: "center"},
  statsContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    width: "100%",
    gap: wp(3),
    marginBottom: hp(3)},
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: wp(3),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(2),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'},
  statItem: {
    alignItems: "center",
    flex: 1},
  statLabel: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.2),
    letterSpacing: wp(0.2),
    color: 'rgba(255, 255, 255, 0.65)',
    textTransform: "uppercase",
    marginBottom: hp(0.8)},
  statValue: {
    color: COLORS.primary03,
    fontFamily: 'AppFont-Bold',
    fontSize: hp(2.8),
    textAlign: "center"},
  dividerLine: {
    height: hp(8),
    width: wp(0.5),
    backgroundColor: COLORS.grey02,
    marginHorizontal: wp(2)},
  discountReadySection: {
    alignItems: "center",
    marginBottom: hp(4),
    width: "100%",
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: wp(3),
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)'},
  discountReadyLabel: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.2),
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: wp(0.3),
    marginBottom: hp(0.5)},
  discountReadyValue: {
    fontFamily: 'AppFont-Bold',
    fontSize: hp(4),
    color: '#FFD700',
    marginBottom: hp(0.5)},
  discountReadyHint: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.2),
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center'},
  buttonContainer: {
    width: "100%",
    alignItems: "center"},
  redeemBtnWrapper: {
    width: '100%',
    borderRadius: wp(2),
    overflow: 'hidden',
  },
  redeemGradient: {
    paddingVertical: hp(1.8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemBtnText: {
    color: '#fff',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4),
  },
  disabledBtn: {
    opacity: 0.6,
  },
  historyToggleBtn: {
    marginTop: hp(2),
    paddingVertical: hp(1),
  },
  historyToggleText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.5),
    color: COLORS.primary03,
    textDecorationLine: 'underline',
  },
  historyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  historyModalContent: {
    backgroundColor: '#014b51',
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
    height: hp(70),
    paddingHorizontal: wp(6),
    paddingTop: hp(3),
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  historyModalTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(5),
    color: '#FFFFFF',
  },
  historyList: {
    paddingBottom: hp(5),
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyInfo: {
    gap: hp(0.5),
  },
  historyPoints: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4),
    color: COLORS.yellow02,
  },
  historyDate: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.2),
    color: 'rgba(255, 255, 255, 0.5)',
  },
  historyBadge: {
    backgroundColor: '#028464',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(5),
  },
  historyPercentage: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.5),
    color: '#FFFFFF',
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(15),
    gap: hp(2),
  },
  emptyHistoryText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(4),
    color: 'rgba(255,255,255,0.4)',
  },
});

export default Rewards;
