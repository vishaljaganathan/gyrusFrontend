import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import HeaderBar from '../navigation/Headerbar';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../service/authContext';
import { axiosInstance } from '../config/indeceptor';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAward } from '@fortawesome/free-solid-svg-icons';
import { COLORS, FONTS } from '../styles/themes';

const APP_FONT_FAMILY = Platform.OS === 'android' ? 'Roboto' : FONTS.h4.fontFamily;

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? 25 : 40;

import { useNavigation } from '@react-navigation/native';

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

  useEffect(() => {
    fetchUser();
  }, []);

  

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  };

  const subjectData = useMemo(() => {
    const subs = ['physics', 'chemistry', 'botany', 'zoology'];
    const colorMap: Record<'physics' | 'chemistry' | 'botany' | 'zoology', string> = {
      physics: '#2979FF',
      chemistry: '#C45EFF',
      botany: '#239229',
      zoology: '#10b981',
    };
    return subs.map((key) => {
      const sub = userData[key] || {};
      const scoresArr = Array.isArray(sub.scores)
        ? sub.scores
        : typeof sub.scores === 'string'
        ? JSON.parse(sub.scores || '[]')
        : [];
      let correct = 0;
      let wrong = 0;
      let reward = typeof sub.rewardPoints === 'number' ? sub.rewardPoints : Number(sub.reward || 0) || 0;

      if (scoresArr.length > 0 && typeof scoresArr[0] === 'object') {
        // scores array contains objects — try common keys
        correct = scoresArr.filter((s: any) => s.correct === true || s.isCorrect === true || s.status === 'correct' || s.answerCorrect === true).length;
        wrong = scoresArr.length - correct;
        // try to sum reward points from items if present
        const sumReward = scoresArr.reduce((sum: number, s: any) => sum + (Number(s.rewardPoints || s.points || 0) || 0), 0);
        if (sumReward > 0) reward = sumReward;
      } else if (scoresArr.length > 0 && typeof scoresArr[0] !== 'object') {
        // scores array contains primitives (e.g., IDs). Fall back to attended / flags
        correct = typeof sub.correct === 'number' ? sub.correct : sub.attended || scoresArr.length;
        wrong = typeof sub.wrong === 'number' ? sub.wrong : Math.max(0, scoresArr.length - (sub.attended || 0));
      } else {
        // empty scoresArr
        correct = typeof sub.correct === 'number' ? sub.correct : sub.attended || 0;
        wrong = typeof sub.wrong === 'number' ? sub.wrong : 0;
      }
      const streak = sub.streak || 0;
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
        color,
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
    <View style={styles.container}>
      <View style={{ height: STATUS_BAR_HEIGHT + 10, backgroundColor: COLORS.secondary01 }} />
      <HeaderBar />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {!userData?.analyticsEnabledAt && (
          <View style={[styles.sectionBox, { marginHorizontal: 16, backgroundColor: '#FEF9E7' }]}> 
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.one, marginBottom: 6 }}>New: Test Analytics</Text>
            <Text style={{ color: COLORS.one }}>This analytics feature is new. Your analytics will start at 0 when you submit tests from now on. Take a subject wise test to enable tracking for your subjects.</Text>
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
                  backgroundColor: '#ffffff',
                },
              ]}
            >
              <View style={styles.subjectRow}>
                <View style={[styles.subjectDot, { backgroundColor: sub.color }]} />
                <Text style={styles.subjectName}>{sub.subject}</Text>
                <Text style={[styles.subjectScore, { color: sub.color }]}>{sub.score}%</Text>
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
                  <Text style={[styles.statsGridValue, { color: COLORS.primary08 }]}>{sub.completed}</Text>
                  <Text style={styles.statsGridLabel}>{'Correct'}</Text>
                </View>
                <View style={[styles.statsGridCard, { borderColor: 'rgba(255,118,118,0.12)', backgroundColor: 'rgba(255,118,118,0.12)' }]}>
                  <Text style={[styles.statsGridValue, { color: '#FF7676' }]}>{sub.failed}</Text>
                  <Text style={styles.statsGridLabel}>{'Incorrect'}</Text>
                </View>
                <View style={[styles.statsGridCard, { borderColor: 'rgba(37,99,235,0.12)', backgroundColor: 'rgba(37,99,235,0.12)' }]}>
                  <Text style={[styles.statsGridValue, { color: '#6898ff' }]}>{sub.reward}</Text>
                  <Text style={styles.statsGridLabel}>{'Reward Points'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {(() => {
          const best = subjectData.reduce((p, c) => (c.score > p.score ? c : p), subjectData[0]);
          const worst = subjectData.reduce((p, c) => (c.score < p.score ? c : p), subjectData[0]);
          const totalTests = subjectData.reduce((s, c) => s + (c.completed + c.failed), 0);
          const totalCorrect = subjectData.reduce((s, c) => s + c.completed, 0);
          const totalWrong = subjectData.reduce((s, c) => s + c.failed, 0);
          const totalReward = subjectData.reduce((s, c) => s + (Number(c.reward) || 0), 0);
          return (
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Key Highlights</Text>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  <Text style={{ color: best.color, fontWeight: 'bold' }}>{best.subject}</Text> is your strongest subject with <Text style={{ fontWeight: 'bold' }}>{best.score}%</Text> accuracy.
                </Text>
              </View>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  Consider focusing on <Text style={{ color: worst.color, fontWeight: 'bold' }}>{worst.subject}</Text> to improve performance (scored <Text style={{ fontWeight: 'bold' }}>{worst.score}%</Text>).
                </Text>
              </View>
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>Total tests recorded: <Text style={{ fontWeight: 'bold' }}>{totalTests}</Text></Text>
                <Text style={styles.highlightText}>Total correct: <Text style={{ fontWeight: 'bold' }}>{totalCorrect}</Text> — Total incorrect: <Text style={{ fontWeight: 'bold' }}>{totalWrong}</Text></Text>
                <Text style={styles.highlightText}>Total reward points earned: <Text style={{ fontWeight: 'bold' }}>{totalReward}</Text></Text>
              </View>
            </View>
          );
        })()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary01 },
  scroll: { flex: 1 },
  headerBox: {
    borderRadius: 24,
    padding: 20,
    paddingBottom: 24,
    margin: 16,
    marginBottom: 8,
    opacity: 0.95,
  },
  headerTextContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  headerTitle: { color: COLORS.light, fontSize: 28, fontWeight: 'bold', marginBottom: 4, fontFamily: APP_FONT_FAMILY, textAlign: 'center' },
  headerSubtitle: { color: COLORS.light80, fontSize: 14, fontFamily: APP_FONT_FAMILY, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 12, marginBottom: 8 },
  statsCard: { flex: 1, backgroundColor: 'rgba(45, 44, 44, 0.5)', borderRadius: 18, padding: 16, marginHorizontal: 4, alignItems: 'center', overflow: 'hidden' },
  statsValue: { color: COLORS.light, fontSize: 24, fontWeight: 'bold', marginBottom: 2, fontFamily: APP_FONT_FAMILY },
  statsLabel: { color: COLORS.light80, fontSize: 13, fontFamily: APP_FONT_FAMILY },
  sectionBox: { backgroundColor: COLORS.light, borderRadius: 24, padding: 16, margin: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary03, marginBottom: 12, fontFamily: APP_FONT_FAMILY },
  subjectCard: { backgroundColor: COLORS.secondary04, borderRadius: 16, padding: 12, marginBottom: 12 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  subjectDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  subjectName: { fontSize: 16, fontWeight: 'bold', color: COLORS.grey, flex: 1, fontFamily: APP_FONT_FAMILY },
  subjectScore: { fontSize: 18, fontWeight: 'bold', fontFamily: APP_FONT_FAMILY },
  progressBarBg: { backgroundColor: 'transparent', borderRadius: 8, height: 10, marginBottom: 16, overflow: 'hidden' },
  progressBarTrack: { position: 'absolute', left: 0, right: 0, height: 10, borderRadius: 8, backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#D1D5DB' },
  progressBarFill: { height: 10, borderRadius: 8 },
  progressLabel: { fontSize: 12, color: COLORS.two, textAlign: 'right', fontFamily: APP_FONT_FAMILY },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statsGridCard: { backgroundColor: COLORS.light, borderRadius: 10, borderWidth: 1, padding: 12, paddingVertical: 14, minHeight: 68, flex: 1, alignItems: 'center', marginHorizontal: 2 },
  statsGridValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 2, color: COLORS.two, fontFamily: APP_FONT_FAMILY },
  statsGridLabel: { fontSize: 12, fontWeight: '500', color: COLORS.one, fontFamily: APP_FONT_FAMILY },
  timeInfo: { fontSize: 13, color: COLORS.two, marginTop: 4, textAlign: 'center' },
  highlightCard: { borderRadius: 12, padding: 10, marginBottom: 6 },
  highlightText: { fontSize: 14, color: COLORS.grey, fontFamily: APP_FONT_FAMILY },
  
});

export default GyrusNEETAnalytics;
