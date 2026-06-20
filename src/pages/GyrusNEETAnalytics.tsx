import React, { useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, RefreshControl, Platform, TouchableOpacity, Image, Animated, Easing, Share, Alert } from 'react-native'
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { CustomText as Text } from '../components/CustomText';
import { CustomVerticalScrollbar } from '../components/CustomVerticalScrollbar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';



import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderBar from '../navigation/Headerbar';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../service/authContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { axiosInstance } from '../config/indeceptor';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAward } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONTS } from '../styles/themes';

const Botany = require('../assets/botany.png');
const chemistry = require('../assets/chemistry.png');
const physics = require('../assets/physics.png');
const zoology = require('../assets/zoology.png');

const APP_FONT_FAMILY = 'AppFont-Regular';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 25 : 40;


const GyrusNEETAnalytics = () => {
  const { userData, setUserData, setAppState } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<any>(null);
  const viewShotRef = useRef<any>(null);
  const [isSharing, setIsSharing] = useState(false);


  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('authentication/user');
      if (res?.data) setUserData(res.data);
    } catch { } finally {
      setLoading(false);
    }
  };

  const progressAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchUser();

      // Ensure the page starts at the top when focused
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: false });
      }

      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }).start();
    }, [])
  );
  
  const getStdLabel = (val?: string) => {
    if (!val) return "";
    const mapping: any = {
      "XI": "11th",
      "XII": "12th",
      "C": "Crash course",
      "R": "Repeater course"
    };
    return mapping[val] || val;
  };



  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      // Wait for state to update and branding to show
      setTimeout(async () => {
        if (viewShotRef.current) {
          const uri = await viewShotRef.current.capture();
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          } else {
            const message = `Check out my Gyrus NEET Detailed Analytics! 📊\nOverall Average: ${overallStats.avgScore}%\nJoin me on Gyrus NEET!`;
            await Share.share({ message });
          }
        }
        setIsSharing(false);
      }, 500);
    } catch (error) {
      console.error('Error sharing analytics:', error);
      setIsSharing(false);
      Alert.alert("Error", "Failed to capture or share analytics image.");
    }
  };

  const subjectData = useMemo(() => {
    const subs = ['physics', 'chemistry', 'botany', 'zoology'];
    // neetPhysics etc. = breakdown from NEET tests
    // physics etc.     = breakdown from individual subject tests
    // Analytics page shows the combined total of both.
    const neetFieldMap: Record<string, string> = {
      physics: 'neetPhysics',
      chemistry: 'neetChemistry',
      botany: 'neetBotany',
      zoology: 'neetZoology',
    };
    const colorMap: Record<'physics' | 'chemistry' | 'botany' | 'zoology', string> = {
      physics: '#2979FF',
      chemistry: '#C45EFF',
      botany: '#239229',
      zoology: '#10b981'
    };

    const extractStats = (sub: any) => {
      const scoresArr = Array.isArray(sub.scores)
        ? sub.scores
        : typeof sub.scores === 'string'
          ? JSON.parse(sub.scores || '[]')
          : [];
      let correct = typeof sub.correct === 'number' ? sub.correct : 0;
      let wrong = typeof sub.wrong === 'number' ? sub.wrong : 0;
      let reward = typeof sub.rewardPoints === 'number' ? sub.rewardPoints : Number(sub.reward || 0) || 0;
      if (typeof sub.correct !== 'number') {
        if (scoresArr.length > 0 && typeof scoresArr[0] === 'object') {
          if (scoresArr[0].score !== undefined && scoresArr[0].total !== undefined) {
            correct = scoresArr.reduce((sum: number, s: any) => sum + (Number(s.score) || 0), 0);
            wrong = scoresArr.reduce((sum: number, s: any) => sum + Math.max(0, (Number(s.total) || 0) - (Number(s.score) || 0)), 0);
          } else {
            correct = scoresArr.filter((s: any) => s.correct === true || s.isCorrect === true || s.status === 'correct' || s.answerCorrect === true).length;
            wrong = scoresArr.length - correct;
          }
          const sumReward = scoresArr.reduce((sum: number, s: any) => sum + (Number(s.rewardPoints || s.points || 0) || 0), 0);
          if (sumReward > 0 && typeof sub.rewardPoints !== 'number') reward = sumReward;
        } else if (scoresArr.length > 0 && typeof scoresArr[0] !== 'object') {
          correct = sub.attended || scoresArr.length;
          wrong = Math.max(0, scoresArr.length - (sub.attended || 0));
        } else {
          correct = sub.attended || 0;
          wrong = 0;
        }
      }
      return { correct, wrong, reward };
    };

    return subs.map((key) => {
      const neetSub = userData[neetFieldMap[key]] || {};
      const indSub = userData[key] || {};
      const neetStats = extractStats(neetSub);
      const indStats = extractStats(indSub);

      const correct = neetStats.correct + indStats.correct;
      const wrong = neetStats.wrong + indStats.wrong;
      const reward = neetStats.reward + indStats.reward;
      const streak = (neetSub.streak || 0) + (indSub.streak || 0);
      const total = correct + wrong;
      const progress = total > 0 ? Math.round((correct / total) * 100) : 0;
      const color = colorMap[key as keyof typeof colorMap];
      return {
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        score: progress,
        progress,
        completed: correct,
        failed: wrong < 0 ? 0 : wrong,
        reward,
        streak,
        color
      };
    });
  }, [userData]);

  const overallStats = useMemo(() => {
    const totalTests = subjectData.reduce((sum, s) => sum + (s.completed + s.failed), 0);
    const avgScore = subjectData.length
      ? (subjectData.reduce((a, b) => a + b.score, 0) / subjectData.length).toFixed(2)
      : '0';
    const bestScore = subjectData.length
      ? Math.max(...subjectData.map((s) => s.score))
      : 0;
    return { totalTests, avgScore, bestScore };
  }, [subjectData]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <HeaderBar />
      <CustomVerticalScrollbar
        ref={scrollRef}
        style={styles.scroll}
        indicatorColor="hsla(185, 100%, 93%, 1.00)"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {!userData?.analyticsEnabledAt && (
          <View style={[styles.sectionBox, { marginHorizontal: 16, backgroundColor: '#FEF9E7' }]}>
            <Text style={{ fontFamily: 'AppFont-Bold', fontSize: 16, color: COLORS.one, marginBottom: 6 }}>New: Test Analytics</Text>
            <Text style={{ color: COLORS.one, textAlign: 'justify' }}>This analytics feature is new. Your analytics will start at 0 when you submit tests from now on. Take a subject wise test to enable tracking for your subjects.</Text>
          </View>
        )}
        <LinearGradient
          colors={[COLORS.primary03, COLORS.button_enable01, COLORS.button_enable02]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBox}
        >
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Test Analytics</Text>
            <Text style={styles.headerSubtitle}>Gyrus NEET Mock Test Performance</Text>
          </View>
          {/* <View style={{ position: 'absolute', right: 16, top: 12 }}>
            <View>
              <FontAwesomeIcon icon={faAward} color={COLORS.light} size={40}  />
            </View>
          </View> */}
          <View style={styles.statsRow}>
            <View style={[styles.statsCard, { marginRight: 4 }]}>
              <Text style={styles.statsValue}>{overallStats.avgScore}%</Text>
              <Text style={styles.statsLabel}>Average Score</Text>
            </View>
            <View style={[styles.statsCard, { marginLeft: 4 }]}>
              <Text style={styles.statsValue}>{overallStats.bestScore}%</Text>
              <Text style={styles.statsLabel}>Best Score</Text>
            </View>
          </View>
        </LinearGradient>

        {loading && <ActivityIndicator style={{ margin: 20 }} color={COLORS.primary03} />}



        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={[styles.sectionBox, { backgroundColor: isSharing ? '#f8fafc' : COLORS.light }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Detailed Analytics</Text>
            {!isSharing && (
              <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                <Ionicons name="share-social-outline" size={24} color={COLORS.primary03} />
              </TouchableOpacity>
            )}
          </View>
          {subjectData.map((sub, idx) => (
            <View
              key={idx}
              style={[
                styles.subjectCard,
                {
                  borderColor: sub.color + '33',
                  borderWidth: 2,
                  shadowColor: sub.color,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 6,
                  backgroundColor: '#ffffff'
                },
              ]}
            >
              <View style={styles.subjectRow}>
                <View style={[styles.subjectDot, { backgroundColor: sub.color }]} />
                <Text style={styles.subjectName}>{sub.subject}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.subjectScoreSmall, { color: sub.color }]}>{sub.score}%</Text>
                  <Text style={[styles.subjectScoreLabel, { color: sub.color }]}>Accuracy</Text>
                </View>
              </View>
              <View style={[styles.progressBarBg, { position: 'relative' }]}>
                <View style={styles.progressBarTrack} />
                <Animated.View style={[styles.progressBarFill, {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', `${sub.score}%`]
                  }),
                  backgroundColor: sub.color,
                  position: 'absolute',
                  left: 0,
                  top: 0
                }]} />
              </View>
              {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
                <Text style={styles.progressLabel}>{sub.progress}% Accuracy</Text>
              </View> */}
              <View style={styles.statsGrid}>
                <View style={[styles.statsGridCard, { borderColor: 'rgba(64,182,175,0.12)', backgroundColor: 'rgba(64,182,175,0.12)' }]}>
                  <Text style={[styles.statsGridValue, { color: COLORS.primary08, fontFamily: 'AppFont-Bold' }]}>{sub.completed}</Text>
                  <Text style={styles.statsGridLabel}>{'Correct'}</Text>
                </View>
                <View style={[styles.statsGridCard, { borderColor: 'rgba(255,118,118,0.12)', backgroundColor: 'rgba(255,118,118,0.12)' }]}>
                  <Text style={[styles.statsGridValue, { color: '#FF7676', fontFamily: 'AppFont-Bold' }]}>{sub.failed}</Text>
                  <Text style={styles.statsGridLabel}>{'Incorrect'}</Text>
                </View>
                <View style={[styles.statsGridCard, { borderColor: 'rgba(37,99,235,0.12)', backgroundColor: 'rgba(37,99,235,0.12)' }]}>
                  <Text style={[styles.statsGridValue, { color: '#6898ff', fontFamily: 'AppFont-Bold' }]}>{sub.reward}</Text>
                  <Text style={styles.statsGridLabel}>{'Reward Points'}</Text>
                </View>
              </View>
            </View>
          ))}

          {isSharing && (
            <View style={styles.shareBranding}>
              <Image source={require('../assets/appLogo.png')} style={styles.shareLogo} />
              <View>
                <Text style={styles.shareAppName}>Gyrus NEET</Text>
                <Text style={styles.shareUserName}>
                  {`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || userData?.name || 'User'}
                  {userData?.std ? ` - ${getStdLabel(userData.std)}` : ''}
                </Text>
              </View>
            </View>
          )}
        </ViewShot>

        {(() => {
          const totalQuestions = subjectData.reduce((s, c) => s + (c.completed + c.failed), 0);
          if (totalQuestions === 0) return null;

          const best = subjectData.reduce((p, c) => (c.score > p.score ? c : p), subjectData[0]);
          const worst = subjectData.reduce((p, c) => (c.score < p.score ? c : p), subjectData[0]);

          const others = subjectData.filter((s) => s.subject !== best.subject && s.subject !== worst.subject);

          const totalCorrect = subjectData.reduce((s, c) => s + c.completed, 0);
          const totalWrong = subjectData.reduce((s, c) => s + c.failed, 0);
          const totalReward = subjectData.reduce((s, c) => s + (Number(c.reward) || 0), 0);

          return (
            <>
              <View style={styles.sectionBox}>
                <Text style={styles.sectionTitle}>Key Highlights</Text>
                <View style={styles.highlightCard}>
                  <Text style={styles.highlightText}>
                    <Text style={{ color: best.color }}>{best.subject}</Text> is your strongest subject with <Text style={{ color: best.color }}>{best.score}%</Text> accuracy.
                  </Text>
                </View>
                <View style={styles.highlightCard}>
                  <Text style={styles.highlightText}>
                    Consider focusing on <Text style={{ color: worst.color }}>{worst.subject}</Text> to improve performance (scored <Text style={{ color: worst.color }}>{worst.score}%</Text>).
                  </Text>
                </View>
                {others.map((o, i) => (
                  <View key={i} style={styles.highlightCard}>
                    <Text style={styles.highlightText}>
                      <Text style={{ color: o.color }}>{o.subject}</Text> is performing around average with <Text style={{ color: o.color }}>{o.score}%</Text> accuracy.
                    </Text>
                  </View>
                ))}
                <View style={styles.highlightCard}>
                  <Text style={styles.highlightText}>Total questions attempted: <Text style={{ color: '#6898ff' }}>{totalQuestions}</Text></Text>
                  <Text style={styles.highlightText}>Total correct: <Text style={{ color: COLORS.primary08 }}>{totalCorrect}</Text> — Total incorrect: <Text style={{ color: '#FF7676' }}>{totalWrong}</Text></Text>
                  <Text style={styles.highlightText}>Total reward points earned: <Text style={{ color: 'rgba(0, 71, 76,0.7)' }}>{totalReward}</Text></Text>
                </View>
              </View>

              <View style={styles.focusSectionCard}>
                <View style={styles.focusLabelContainer}>
                  <Text style={styles.focusLabelHeader}>FOCUS AREA RECOMMENDED</Text>
                  <Text style={styles.focusLabelDescription}>
                    You need to concentrate more on <Text style={{ color: worst.color }}>{worst.subject}</Text> compared to other subjects. Tap below to start practicing:
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    width: '75%',
                    alignSelf: 'center',
                    marginTop: 12,
                    borderRadius: 50,
                    backgroundColor: 'transparent',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                  onPress={() => {
                    setAppState((prev: any) => ({
                      ...prev,
                      home: worst.subject.toLowerCase(),
                    }));
                    navigation.navigate("BottomBar", { screen: "Home" });
                  }}
                >
                  <LinearGradient
                    colors={["#22E2D6", "#15BBB1", "#0D7F78"]}
                    locations={[0, 0.4, 1]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{
                      borderRadius: 50,
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: wp(2.5),
                    }}
                  >
                    {(() => {
                      const getSubjectIcon = (sub: string) => {
                        switch (sub?.toLowerCase()) {
                          case "physics":
                            return physics;
                          case "chemistry":
                            return chemistry;
                          case "botany":
                            return Botany;
                          case "zoology":
                            return zoology;
                          default:
                            return null;
                        }
                      };
                      const icon = getSubjectIcon(worst.subject);
                      return icon ? (
                        <Image
                          source={icon}
                          style={{
                            width: wp(8),
                            height: wp(8),
                            resizeMode: "contain",
                            position: "absolute",
                            left: 24,
                          }}
                        />
                      ) : null;
                    })()}
                    <Text style={styles.focusButtonText}>{worst.subject}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          );
        })()}
      </CustomVerticalScrollbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgb(1, 71, 78)' },
  scroll: { flex: 1 },
  headerBox: {
    borderRadius: 24,
    padding: 20,
    paddingBottom: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    opacity: 0.95
  },
  headerTextContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  headerTitle: { color: COLORS.light, fontFamily: 'AppFont-Bold', fontSize: 28, marginBottom: 4, textAlign: 'center' },
  headerSubtitle: { color: COLORS.light80, fontFamily: 'AppFont-Bold', fontSize: 14, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 12, marginBottom: 8 },
  statsCard: { flex: 1, backgroundColor: 'rgba(45, 44, 44, 0.5)', borderRadius: 18, padding: 16, marginHorizontal: 4, alignItems: 'center', overflow: 'hidden' },
  statsValue: { color: COLORS.light, fontFamily: 'AppFont-Bold', fontSize: 24, marginBottom: 2 },
  statsLabel: { color: COLORS.light80, fontFamily: 'AppFont-Bold', fontSize: 13 },
  sectionBox: { 
    backgroundColor: COLORS.light, 
    borderRadius: 24, 
    padding: 16, 
    marginHorizontal: 16, 
    marginTop: 16, 
    marginBottom: 0 
  },
  sectionTitle: { fontFamily: 'AppFont-Bold', fontSize: 20, color: COLORS.primary03, marginBottom: 12 },
  subjectCard: { backgroundColor: COLORS.secondary04, borderRadius: 16, padding: 12, marginBottom: 12 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  subjectDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  subjectName: { fontFamily: 'AppFont-Bold', fontSize: 16, color: COLORS.grey, flex: 1 },
  subjectScore: { fontFamily: 'AppFont-Bold', fontSize: 18 },
  subjectScoreSmall: { fontFamily: 'AppFont-Bold', fontSize: 14 },
  subjectScoreLabel: { fontFamily: 'AppFont-Bold', fontSize: 12, color: COLORS.two },
  progressBarBg: { backgroundColor: 'transparent', borderRadius: 8, height: 10, marginBottom: 16, overflow: 'hidden' },
  progressBarTrack: { position: 'absolute', left: 0, right: 0, height: 10, borderRadius: 8, backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#D1D5DB' },
  progressBarFill: { height: 10, borderRadius: 8 },
  progressLabel: { fontFamily: 'AppFont-Regular', fontSize: 12, color: COLORS.two, textAlign: 'right' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statsGridCard: { backgroundColor: COLORS.light, borderRadius: 10, borderWidth: 1, padding: 12, paddingVertical: 14, minHeight: 68, flex: 1, alignItems: 'center', marginHorizontal: 2 },
  statsGridValue: { fontFamily: 'AppFont-Regular', fontSize: 18, marginBottom: 2, color: COLORS.two },
  statsGridLabel: { fontFamily: 'AppFont-Bold', fontSize: 12, color: COLORS.one, alignItems: 'center', textAlign: 'center' },
  timeInfo: { fontFamily: 'AppFont-Regular', fontSize: 13, color: COLORS.two, marginTop: 4, textAlign: 'center' },
  highlightCard: { borderRadius: 12, padding: 10, marginBottom: 6 },
  highlightText: { fontFamily: 'AppFont-Regular', fontSize: 15, color: COLORS.grey },
  focusButton: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 12,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  focusButtonText: {
    fontFamily: 'AppFont-Bold',
    fontSize: 24,
    color: '#ffffff',
  },
  shareBtn: {
    padding: 8,
    // backgroundColor: 'rgba(10, 184, 173, 0.1)',
    borderRadius: 10,
  },
  shareBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(10, 184, 173, 0.05)',
    padding: 12,
    borderRadius: 12,
  },
  shareLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
  },
  shareAppName: {
    fontFamily: 'AppFont-Bold',
    fontSize: 18,
    color: COLORS.primary03,
  },
  shareUserName: {
    fontFamily: 'AppFont-Bold',
    fontSize: 14,
    color: COLORS.grey,
  },
  focusLabelContainer: {
    marginTop: 20,
    marginBottom: 8,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  focusLabelHeader: {
    fontFamily: 'AppFont-Bold',
    fontSize: 20,
    color: COLORS.primary03,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  focusLabelDescription: {
    fontFamily: 'AppFont-Regular',
    fontSize: 15,
    color: '#131314ff',
    textAlign: 'center',
    lineHeight: 18,
  },
  focusSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
  },
});

export default GyrusNEETAnalytics;
