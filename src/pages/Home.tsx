import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import { Dimensions, Image, Modal, Pressable, StyleSheet, TouchableOpacity, View, ActivityIndicator, Alert, Share, Animated, Easing } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from 'expo-sharing';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
// 9:16 image — compute height from width, cap at screen height
const IMG_H = Math.min(SCREEN_W * (16 / 9), SCREEN_H);
import { CustomText as Text } from "../components/CustomText";
import { CustomVerticalScrollbar } from "../components/CustomVerticalScrollbar";
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
import TrialModal from "../components/TrialModal";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from "../styles/themes";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import PremiumBanner from "../components/PremiumBanner";
import StopwatchCounter from "../components/StopwatchCounter";



const Home = ({ navigation, route }: { navigation: any; route: any }) => {
  const insets = useSafeAreaInsets();
  const themeContext = useContext(ThemeContext);
  const { userData, setUserData, appState, setAppState } = themeContext;

  const [showPremiumBanner, setShowPremiumBanner] = useState(false);

  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const [selectedScore, setSelectedScore] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneValue, setMilestoneValue] = useState(0);

  const [goldPlan, setGoldPlan] = useState<any>({
    title: "EXCLUSIVE GOLD PLAN OFFER",
    prices: { price: 1000, discountPrice: 800, offer: 20 },
    discountApplicable: true,
    gst: 18
  });

  useEffect(() => {
    axiosInstance.get("authentication/plans")
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          const gold = res.data.find((p: any) => p.title && p.title.toLowerCase().includes("gold"));
          if (gold) {
            setGoldPlan(gold);
          } else if (res.data.length > 0) {
            setGoldPlan(res.data[0]);
          }
        }
      })
      .catch(err => console.log("Failed to fetch plans for subscription modal", err));
  }, []);

  useEffect(() => {
    const syncOfflineTest = async () => {
      try {
        const pendingStr = await AsyncStorage.getItem('pending_test_submit');
        if (pendingStr) {
          const payload = JSON.parse(pendingStr);
          console.log('[Home.tsx] Found pending offline test submission:', payload);
          axiosInstance.post("/authentication/test/submit", payload)
            .then(async (res) => {
              console.log('[Home.tsx] Offline test submitted successfully!');
              await AsyncStorage.removeItem('pending_test_submit');
              if (res.data) {
                setUserData(res.data);
              }
              Alert.alert('Offline Test Synced', 'Your completed test results have been successfully synced!');
            })
            .catch(err => {
              console.log('[Home.tsx] Failed to sync offline test (still offline?):', err);
            });
        }
      } catch (err) {
        console.error('[Home.tsx] Error syncing offline test:', err);
      }
    };

    syncOfflineTest();
  }, []);

  const [isSharingAnalytics, setIsSharingAnalytics] = useState(false);
  const viewShotRefAnalytics = useRef<any>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showScoreDetail) {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }).start();
    }
  }, [showScoreDetail]);

  const handleShareAnalytics = async () => {
    try {
      setIsSharingAnalytics(true);
      // Wait for UI to update to show branding
      setTimeout(async () => {
        if (viewShotRefAnalytics.current) {
          const uri = await viewShotRefAnalytics.current.capture();
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          } else {
            const accuracy = selectedScore?.total ? Math.round((Number(selectedScore.score) / Number(selectedScore.total)) * 100) : 0;
            const message = `Check out my ${appState.home?.toUpperCase()} performance on Gyrus NEET! 🏆\nScore: ${selectedScore?.score}/${selectedScore?.total}\nAccuracy: ${accuracy}%\nDate: ${new Date(selectedScore?.date || Date.now()).toLocaleDateString()}`;
            await Share.share({ message });
          }
        }
        setIsSharingAnalytics(false);
      }, 500);
    } catch (error) {
      console.error('Error sharing analytics:', error);
      setIsSharingAnalytics(false);
      Alert.alert("Error", "Failed to capture or share analytics image.");
    }
  };

  const openScoreDetail = (score: any, index: number) => {
    if (!userData?.planValid) {
      setShowSubscriptionModal(true);
      return;
    }
    setSelectedScore(score);
    setSelectedIndex(index);
    setShowScoreDetail(true);
  };

  // Step 1: detect navigation param and open the banner
  useEffect(() => {
    if (route?.params?.fromPaymentSuccess) {
      navigation.setParams({ fromPaymentSuccess: undefined });
      setShowPremiumBanner(true);
    }
  }, [route?.params?.fromPaymentSuccess]);

  const closePremiumBanner = () => {
    setShowPremiumBanner(false);
  };

  const isTester = useMemo(() => {
    const role = String(userData?.accType || "").trim().toLowerCase();
    return role === "tester" || role === "tct" || role === "teacher come tester";
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
    // Show trial modal if user is on free plan and trial has NOT been used
    const checkTrialModal = async () => {
      if (userData && !userData.planValid && !userData.trialUsed) {
        try {
          const lastDismissedStr = await AsyncStorage.getItem('trialModalLastDismissed');
          if (lastDismissedStr) {
            const lastDismissed = parseInt(lastDismissedStr, 10);
            const now = Date.now();
            const diffInMinutes = (now - lastDismissed) / (1000 * 60);
            if (diffInMinutes < 20) {
              return; // Less than 20 minutes ago, don't show
            }
          }
          setShowTrialModal(true);
        } catch (error) {
          console.error("Error reading trial modal state:", error);
          setShowTrialModal(true); // show by default if error
        }
      }
    };
    checkTrialModal();
  }, [userData]);

  /* useEffect(() => {
    if (userData?._id) {
      axiosInstance.get('authentication/check-milestones')
        .then(res => {
          if (res.data?.milestone > 0) {
            setMilestoneValue(res.data.milestone);
            setShowMilestoneModal(true);
          }
        })
        .catch(err => console.error("Milestone check error:", err));
    }
  }, [userData?._id, userData?.rewards?.earned]); */

  // Modal activation handled by TrialModal component


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

  const scoreTrack = useMemo(() => {
    if (!userData || !userData[appState.home]) return [];
    try {
      const scores = JSON.parse(JSON.stringify(userData[appState.home])).scores || [];
      return [...scores].reverse();
    } catch {
      return [];
    }
  }, [userData, appState.home]);

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.screen} pointerEvents="box-none" collapsable={false}>
        <LinearGradient
          style={[styles.androidLarge57, { paddingTop: 0 }]}
          colors={["#028464", "#0AB7AD", "#0B7960"]}
        >
          <HeaderBar />
          <Text style={styles.watermarkText}>{appState.home?.toUpperCase()}</Text>
          {!appState.internetStatus && <Wrapper />}
          {appState.internetStatus && (
            <Arrows
              subName={appState.home}
              onScorePress={openScoreDetail}
              track={scoreTrack}
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

      {/* Score Detail Modal */}
      <Modal
        visible={showScoreDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScoreDetail(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowScoreDetail(false)}
        >
          <ViewShot
            ref={viewShotRefAnalytics}
            options={{ format: 'jpg', quality: 0.9 }}
            style={styles.scoreDetailCard}
          >
            <Pressable>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.detailTitle}>
                  {appState.home?.toLowerCase() === 'neet' ? 'NEET' : (appState.home?.charAt(0).toUpperCase() + appState.home?.slice(1))} Analytics
                </Text>
                {isSharingAnalytics ? (
                  <Text style={[styles.detailSubtitle, { color: '#012c29ff', fontFamily: 'AppFont-Bold', fontSize: 16 }]}>
                    {`${userData?.firstName || ''} ${userData?.lastName || ''} - ${
                      userData?.std === 'XI' ? '11th' :
                      userData?.std === 'XII' ? '12th' :
                      userData?.std === 'R' ? 'Repeater' :
                      userData?.std === 'C' ? 'Crash Course' : (userData?.std || '')
                    }`}
                  </Text>
                ) : (
                  <Text style={styles.detailSubtitle}>
                    {selectedScore?.date 
                      ? `${new Date(selectedScore.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • ${new Date(selectedScore.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                      : 'Recent Test'}
                  </Text>
                )}
              </View>
              {!isSharingAnalytics && (
                <TouchableOpacity 
                  onPress={() => setShowScoreDetail(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={COLORS.primary03} />
                </TouchableOpacity>
              )}
            </View>

            {(!selectedScore?.total && !selectedScore?.testId && !selectedScore?.breakdown) ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Image 
                  source={require('../assets/WebAnalyticsin.png')} 
                  style={{ width: 64, height: 64, tintColor: '#cbd5e1' }} 
                  resizeMode="contain" 
                />
                <Text style={{ fontFamily: 'AppFont-Bold', fontSize: 18, color: '#475569', textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
                  No Analytics Available
                </Text>
                <Text style={{ fontFamily: 'AppFont-Regular', fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 }}>
                  Detailed performance analytics are not stored for this older test. Complete a new test to view your breakdown and insights here.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.overallStats}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <View style={styles.statBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <StopwatchCounter 
                        value={Number(selectedScore?.score || 0)} 
                        style={styles.statValueDetail} 
                        key={showScoreDetail ? `score-${selectedScore?.score}` : 'hidden'}
                      />
                      <Text style={styles.statValueDetail}>/{selectedScore?.total || 100}</Text>
                    </View>
                    <Text style={styles.statLabelDetail}>Total Score</Text>
                  </View>
                  <View style={styles.dividerDetail} />
                  <View style={styles.statBox}>
                    <Text style={[styles.statValueDetail, { color: '#b45309' }]}>
                      {selectedScore?.total ? Math.round((Number(selectedScore.score) / Number(selectedScore.total)) * 100) : 0}%
                    </Text>
                    <Text style={styles.statLabelDetail}>Accuracy</Text>
                  </View>
                </View>
                <View style={[styles.progressBg, { marginRight: 0, height: 10, position: 'relative', backgroundColor: '#e2e8f0' }]}>
                  <Animated.View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${selectedScore?.total ? Math.round((Number(selectedScore.score) / Number(selectedScore.total)) * 100) : 0}%`]
                        }),
                        backgroundColor: COLORS.primary03,
                        height: 10,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        borderRadius: 5,
                        zIndex: 10
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>

            <CustomVerticalScrollbar style={styles.subjectList} showsVerticalScrollIndicator={false} indicatorColor="hsla(185, 100%, 93%, 1.00)">
              {['Physics', 'Chemistry', 'Botany', 'Zoology'].map((sub) => {
                const subKey = sub.toLowerCase();
                const isCurrentSubject = subKey === appState.home.toLowerCase();
                
                // Try to find breakdown data in various possible locations
                let correct = 0;
                let total = 0;

                const breakdown = selectedScore?.breakdown || selectedScore;
                const subEntry = breakdown?.[subKey];

                if (subEntry && typeof subEntry === 'object') {
                  correct = Number(subEntry.correct || subEntry.score || 0);
                  total = Number(subEntry.total || 0);
                } else if (appState.home === 'neet') {
                  // Search in specific subject scores if breakdown is missing in main entry
                  const neetFieldMap: any = {
                    physics: 'neetPhysics',
                    chemistry: 'neetChemistry',
                    botany: 'neetBotany',
                    zoology: 'neetZoology',
                  };
                  const neetFieldName = neetFieldMap[subKey];
                  const subScores = [...(userData?.[neetFieldName]?.scores || [])].reverse();
                  
                  // Primary: Try to match by index (perfect synchronization for tests taken together)
                  let matchingScore = subScores[selectedIndex];
                  
                  // For a NEET mock test, each subject should contribute 1/4 of the total questions
                  const expectedSubTotal = Math.floor(Number(selectedScore?.total || 0) / 4);
                  
                  // Validation/Fallback: If index match doesn't look right, search by testId or date+total
                  if (!matchingScore || Math.abs(Number(matchingScore.total) - expectedSubTotal) > 2) {
                    matchingScore = subScores.find((s: any) => 
                      (s.testId && selectedScore?.testId && s.testId === selectedScore.testId) || 
                      (s.date === selectedScore?.date && Math.abs(Number(s.total) - expectedSubTotal) <= 2)
                    );
                  }

                  if (matchingScore) {
                    correct = Number(matchingScore.score || 0);
                    total = Number(matchingScore.total || 0);
                  }
                } else if (isCurrentSubject) {
                  correct = Number(selectedScore?.score || 0);
                  total = Number(selectedScore?.total || 0);
                }

                const subData = { correct, total };

                // If it's not a NEET test, only show the relevant subject
                if (appState.home !== 'neet' && !isCurrentSubject) return null;
                
                const percentage = subData.total > 0 ? Math.round((subData.correct / subData.total) * 100) : 0;
                const colors: any = {
                  physics: '#2979FF',
                  chemistry: '#C45EFF',
                  botany: '#239229',
                  zoology: '#10b981'
                };
                const color = colors[subKey] || COLORS.primary03;

                return (
                  <View key={sub} style={styles.subjectItem}>
                    <View style={styles.subjectInfo}>
                      <View style={[styles.subjectIndicator, { backgroundColor: color }]} />
                      <Text style={styles.subjectNameDetail}>{sub}</Text>
                      
                    </View>
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBg, { position: 'relative', marginRight: 12 }]}>
                        <Animated.View style={[
                          styles.progressFill, 
                          { 
                            width: progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', `${percentage}%`]
                            }),
                            backgroundColor: color, 
                            position: 'absolute', 
                            left: 0, 
                            top: 0, 
                            borderRadius: 4 
                          }
                        ]} />
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <StopwatchCounter 
                          value={subData.correct} 
                          style={[styles.subjectScoreDetail, { color }]} 
                          key={showScoreDetail ? `sub-${sub}-${subData.correct}` : 'hidden'}
                        />
                        <Text style={[styles.subjectScoreDetail, { color }]}>/{subData.total}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </CustomVerticalScrollbar>

            <View style={styles.rewardContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 16 }}>
                <View style={styles.rewardBadge}>
                  <Ionicons name="gift" size={24} color="#f59e0b" />
                </View>
                <View>
                  <Text style={styles.rewardLabel}>Reward Points Earned</Text>
                  <Text style={styles.rewardValue}>
                    +{Math.max(
                      Number(selectedScore?.rewardPoints || selectedScore?.reward || selectedScore?.points || 0),
                      Number(selectedScore?.score || 0) * 8
                    )} Points
                  </Text>
                </View>
              </View>

              {!isSharingAnalytics && (
                <TouchableOpacity 
                  onPress={handleShareAnalytics}
                  style={styles.shareBtnAnalytics}
                >
                  <Ionicons name="share-social" size={24} color={COLORS.primary03} />
                </TouchableOpacity>
              )}
            </View>
            </>
            )}

            {isSharingAnalytics && (
              <View style={styles.shareBrandingAnalytics}>
                <Image source={require('../assets/appLogo.png')} style={styles.shareLogoAnalytics} />
                <View>
                  <Text style={styles.shareAppNameAnalytics}>Gyrus NEET</Text>
                  <Text style={styles.shareInfoAnalytics}>
                    {appState.home?.toUpperCase()} Analytics • {selectedScore?.date 
                      ? `${new Date(selectedScore.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • ${new Date(selectedScore.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                      : `${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
        </ViewShot>
      </Pressable>
    </Modal>

      {/* Premium Banner Overlay */}
      <PremiumBanner 
        isVisible={showPremiumBanner} 
        onClose={closePremiumBanner} 
      />

      {/* 7-Day Free Trial Modal */}
      <TrialModal 
        isVisible={showTrialModal} 
        onClose={() => setShowTrialModal(false)}
        onSuccess={() => setShowPremiumBanner(true)}
      />

      {/* Reward Milestone Modal 
      <Modal visible={showMilestoneModal} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.milestoneOverlay}>
          <View style={styles.milestoneCard}>
            <View style={styles.milestoneIconBox}>
              <Ionicons name="gift" size={wp(14)} color="#0AB8AD" />
            </View>
            <Text style={styles.milestoneTitle}>Congratulations!</Text>
            <Text style={styles.milestoneBody}>
              You've earned <Text style={{ fontFamily: 'AppFont-Bold', color: '#0AB8AD' }}>{milestoneValue}</Text> reward points! Keep going to unlock more benefits.
            </Text>
            <TouchableOpacity 
              style={styles.milestoneBtn}
              onPress={() => setShowMilestoneModal(false)}
            >
              <LinearGradient
                colors={["#00b7c2", "#0AB8AD"]}
                style={styles.milestoneGradient}
              >
                <Text style={styles.milestoneBtnText}>AWESOME!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

      {/* Subscription Required Modal */}
      <Modal visible={showSubscriptionModal} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.subModalOverlay}>
          <View style={styles.subModalBox}>
            <View style={styles.subModalContent}>
              <Text style={styles.subModalTitle}>Subscription required</Text>
              <Text style={styles.subModalBody}>
                {(!userData?.trialUsed) 
                  ? "This feature is for premium users. You can try it for free for 7 days!" 
                  : "This feature is available for subscribed users. Please consider upgrading to enjoy full access."}
              </Text>

              {userData?.trialUsed && (
                <View style={styles.discountCard}>
                  <Text style={styles.discountCardTitle}>EXCLUSIVE GOLD PLAN OFFER</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 4 }}>
                    <Text style={styles.discountPriceText}>
                      {"\u20B9"}{goldPlan.discountApplicable ? Number(goldPlan.prices?.discountPrice || 0) : Number(goldPlan.prices?.price || 0)}
                    </Text>
                    {goldPlan.discountApplicable && (
                      <>
                        <Text style={styles.originalPriceText}>{"\u20B9"}{Number(goldPlan.prices?.price || 0)}</Text>
                        <Text style={styles.offerBadgeText}>{Number(goldPlan.prices?.offer || 0)}% OFF</Text>
                      </>
                    )}
                  </View>
                  <Text style={styles.gstText}>+ {goldPlan.gst || 18}% GST</Text>
                </View>
              )}

              <View style={styles.subModalActions}>
                <LinearGradient
                  colors={["#00b7c2", "rgba(197, 255, 244, 0.5)"]}
                  start={{ x: 0.6, y: 0.3 }}
                  end={{ x: 0.6, y: 0 }}
                  style={styles.upgradeGradient}
                >
                  <TouchableOpacity
                    style={styles.upgradeInner}
                    onPress={() => {
                      setShowSubscriptionModal(false);
                      if (!userData?.trialUsed) {
                        setShowTrialModal(true);
                      } else {
                        navigation.navigate('Plans');
                      }
                    }}
                  >
                    <Text style={styles.upgradeTxt}>{(!userData?.trialUsed) ? "TRY FREE TRIAL" : "UPGRADE"}</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
              <TouchableOpacity style={styles.maybeLaterBtn} onPress={() => setShowSubscriptionModal(false)}>
                <Text style={[styles.maybeLaterTxt]}>Maybe later</Text>
              </TouchableOpacity>
            </View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 71, 76, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scoreDetailCard: {
    width: wp(90),
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: 22,
    color: COLORS.primary03,
  },
  detailSubtitle: {
    fontFamily: 'AppFont-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  overallStats: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  dividerDetail: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  statValueDetail: {
    fontFamily: 'AppFont-Bold',
    fontSize: 20,
    color: COLORS.primary03,
  },
  statLabelDetail: {
    fontFamily: 'AppFont-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  subjectList: {
    maxHeight: hp(40),
  },
  subjectItem: {
    marginBottom: 16,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  subjectNameDetail: {
    flex: 1,
    fontFamily: 'AppFont-Bold',
    fontSize: 16,
    color: '#1e293b',
  },
  subjectScoreDetail: {
    fontFamily: 'AppFont-Bold',
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'AppFont-Bold',
    fontSize: 14,
    color: '#64748b',
    width: 40,
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 16,
  },
  rewardBadge: {
    width: 48,
    height: 48,
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardLabel: {
    fontFamily: 'AppFont-Regular',
    fontSize: 14,
    color: '#92400e',
  },
  rewardValue: {
    fontFamily: 'AppFont-Bold',
    fontSize: 20,
    color: '#b45309',
  },
  subModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  subModalBox: {
    width: '88%',
    alignItems: 'center',
    borderRadius: 30,
    paddingTop: 28,
    paddingBottom: 18,
    paddingHorizontal: 18,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  subModalContent: {
    width: '100%',
    backgroundColor: '#00474c', // App theme dark green/teal
    borderRadius: 16,
    paddingTop: 32,
    paddingBottom: 18,
    paddingHorizontal: 16,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#0AB8AD', // App theme teal border
  },
  subModalTitle: { fontFamily: 'AppFont-Bold', fontSize: 22, color: '#FFF', textAlign: 'center', marginTop: 4, marginBottom: 8 },
  subModalBody: { fontFamily: 'AppFont-Regular', fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  discountCard: {
    backgroundColor: 'rgba(40, 63, 56, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0AB8AD',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  discountCardTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: 13,
    color: '#0AB8AD',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  discountPriceText: {
    fontFamily: 'AppFont-Bold',
    fontSize: 26,
    color: '#FFF',
  },
  originalPriceText: {
    fontFamily: 'AppFont-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'line-through',
  },
  offerBadgeText: {
    fontFamily: 'AppFont-Bold',
    fontSize: 14,
    color: '#F2C112',
  },
  gstText: {
    fontFamily: 'AppFont-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: -2,
    marginBottom: 6,
  },
  subModalActions: { alignItems: 'center' },
  upgradeGradient: { width: '100%', borderRadius: 8, overflow: 'hidden', marginBottom: 10 },
  upgradeInner: { paddingVertical: 12, alignItems: 'center' },
  upgradeTxt: { color: '#fff', fontFamily: 'AppFont-Bold', fontSize: 15 },
  maybeLaterBtn: { width: '100%', borderRadius: 8, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  maybeLaterTxt: { color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'AppFont-Regular', fontSize: 15 },
  shareBtnAnalytics: {
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  shareBrandingAnalytics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  shareLogoAnalytics: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  shareAppNameAnalytics: {
    fontFamily: 'AppFont-Bold',
    fontSize: 16,
    color: COLORS.primary03,
  },
  shareInfoAnalytics: {
    fontFamily: 'AppFont-Regular',
    fontSize: 11,
    color: '#64748b',
  },
  trialFooter: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.2),
    color: 'rgba(255, 255, 255, 0.4)',
  },
  milestoneOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneCard: {
    width: wp(80),
    backgroundColor: '#1e293b',
    borderRadius: wp(6),
    padding: wp(8),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0AB8AD',
  },
  milestoneIconBox: {
    marginBottom: hp(2),
  },
  milestoneTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(6.5),
    color: '#FFFFFF',
    marginBottom: hp(1),
  },
  milestoneBody: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(4),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: wp(6),
    marginBottom: hp(3),
  },
  milestoneBtn: {
    width: '100%',
  },
  milestoneGradient: {
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    alignItems: 'center',
  },
  milestoneBtnText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4),
    color: '#FFFFFF',
  },
  watermarkText: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    fontSize: wp(12),
    fontFamily: 'AppFont-Bold',
    color: 'rgba(215, 215, 215, 0.34)',
    letterSpacing: 8,
    textTransform: 'uppercase',
    zIndex: 0,
    pointerEvents: 'none',
  },
});