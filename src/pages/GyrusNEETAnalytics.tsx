import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { View,  StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Platform, TouchableOpacity, Image } from 'react-native'
import { CustomText as Text } from '../components/CustomText';



import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderBar from '../navigation/Headerbar';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../service/authContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { axiosInstance } from '../config/indeceptor';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAward } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONTS } from '../styles/themes';

const APP_FONT_FAMILY = 'AppFont-Regular';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 25 : 40;


const GyrusNEETAnalytics = () => {
  const { userData, setUserData } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('authentication/user');
      if (res?.data) setUserData(res.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

  

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
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
      zoology: '#10b981'};

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
      const indSub  = userData[key] || {};
      const neetStats = extractStats(neetSub);
      const indStats  = extractStats(indSub);

      const correct = neetStats.correct + indStats.correct;
      const wrong   = neetStats.wrong   + indStats.wrong;
      const reward  = neetStats.reward  + indStats.reward;
      const streak  = (neetSub.streak || 0) + (indSub.streak || 0);
      const total   = correct + wrong;
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
        color};
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
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {!userData?.analyticsEnabledAt && (
          <View style={[styles.sectionBox, { marginHorizontal: 16, backgroundColor: '#FEF9E7' }]}> 
            <Text style={{ fontFamily: 'AppFont-Bold', fontSize: 16,  color: COLORS.one, marginBottom: 6 }}>New: Test Analytics</Text>
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

       

        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Detailed Analysis</Text>
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
                  backgroundColor: '#ffffff'},
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
                <View style={[styles.progressBarFill, { width: `${sub.score}%`, backgroundColor: sub.color, position: 'absolute', left: 0, top: 0 }]} />
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
        </View>

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
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Key Highlights</Text>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  <Text style={{ color: best.color}}>{best.subject}</Text> is your strongest subject with <Text style={{  color: best.color }}>{best.score}%</Text> accuracy.
                </Text>
              </View>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  Consider focusing on <Text style={{ color: worst.color}}>{worst.subject}</Text> to improve performance (scored <Text style={{  color: worst.color }}>{worst.score}%</Text>).
                </Text>
              </View>
              {others.map((o, i) => (
                <View key={i} style={styles.highlightCard}>
                  <Text style={styles.highlightText}>
                    <Text style={{ color: o.color}}>{o.subject}</Text> is performing around average with <Text style={{  color: o.color }}>{o.score}%</Text> accuracy.
                  </Text>
                </View>
              ))}
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>Total questions attempted: <Text style={{  color: '#6898ff' }}>{totalQuestions}</Text></Text>
                <Text style={styles.highlightText}>Total correct: <Text style={{  color: COLORS.primary08 }}>{totalCorrect}</Text> — Total incorrect: <Text style={{  color: '#FF7676' }}>{totalWrong}</Text></Text>
                <Text style={styles.highlightText}>Total reward points earned: <Text style={{  color: 'rgba(0, 71, 76,0.7)'}}>{totalReward}</Text></Text>
              </View>
            </View>
          );
        })()}
      </ScrollView>
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
    margin: 16,
    marginBottom: 8,
    opacity: 0.95},
  headerTextContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  headerTitle: { color: COLORS.light, fontFamily: 'AppFont-Bold', fontSize: 28,  marginBottom: 4, textAlign: 'center' },
  headerSubtitle: { color: COLORS.light80, fontFamily: 'AppFont-Bold', fontSize: 14, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 12, marginBottom: 8 },
  statsCard: { flex: 1, backgroundColor: 'rgba(45, 44, 44, 0.5)', borderRadius: 18, padding: 16, marginHorizontal: 4, alignItems: 'center', overflow: 'hidden' },
  statsValue: { color: COLORS.light, fontFamily: 'AppFont-Bold', fontSize: 24,  marginBottom: 2 },
  statsLabel: { color: COLORS.light80, fontFamily: 'AppFont-Bold', fontSize: 13 },
  sectionBox: { backgroundColor: COLORS.light, borderRadius: 24, padding: 16, margin: 16, marginBottom: 8 },
  sectionTitle: { fontFamily: 'AppFont-Bold', fontSize: 20,  color: COLORS.primary03, marginBottom: 12 },
  subjectCard: { backgroundColor: COLORS.secondary04, borderRadius: 16, padding: 12, marginBottom: 12 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  subjectDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  subjectName: { fontFamily: 'AppFont-Bold', fontSize: 16,  color: COLORS.grey, flex: 1 },
  subjectScore: { fontFamily: 'AppFont-Bold', fontSize: 18 },
  subjectScoreSmall: { fontFamily: 'AppFont-Bold', fontSize: 14 },
  subjectScoreLabel: { fontFamily: 'AppFont-Bold', fontSize: 12, color: COLORS.two },
  progressBarBg: { backgroundColor: 'transparent', borderRadius: 8, height: 10, marginBottom: 16, overflow: 'hidden' },
  progressBarTrack: { position: 'absolute', left: 0, right: 0, height: 10, borderRadius: 8, backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#D1D5DB' },
  progressBarFill: { height: 10, borderRadius: 8 },
  progressLabel: { fontFamily: 'AppFont-Regular', fontSize: 12, color: COLORS.two, textAlign: 'right' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statsGridCard: { backgroundColor: COLORS.light, borderRadius: 10, borderWidth: 1, padding: 12, paddingVertical: 14, minHeight: 68, flex: 1, alignItems: 'center', marginHorizontal: 2 },
  statsGridValue: { fontFamily: 'AppFont-Regular', fontSize: 18,  marginBottom: 2, color: COLORS.two },
  statsGridLabel: { fontFamily: 'AppFont-Bold', fontSize: 12,  color: COLORS.one, alignItems: 'center', textAlign: 'center' },
  timeInfo: { fontFamily: 'AppFont-Regular', fontSize: 13, color: COLORS.two, marginTop: 4, textAlign: 'center' },
  highlightCard: { borderRadius: 12, padding: 10, marginBottom: 6 },
  highlightText: { fontFamily: 'AppFont-Regular', fontSize: 15, color: COLORS.grey }});

export default GyrusNEETAnalytics;
