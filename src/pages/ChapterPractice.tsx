import React, { useContext, useEffect, useState, useMemo, useRef } from "react";
import { Dimensions, StyleSheet, View, ActivityIndicator, Alert, TouchableOpacity, ScrollView, Modal, Pressable, Animated, Easing, Share, Image } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from 'expo-sharing';
import StopwatchCounter from "../components/StopwatchCounter";
import { CustomText as Text } from "../components/CustomText";
import HeaderBar from "../navigation/Headerbar";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import Arrows from "../components/AroowDirection";
import { LinearGradient } from "expo-linear-gradient";
import { axiosInstance } from "../config/indeceptor";
import { Wrapper } from "../components/Wrapper";
import { ThemeContext } from "../service/authContext";
import { COLORS } from "../styles/themes";
import { Ionicons } from '@expo/vector-icons';

import { 
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const ChapterPractice = ({ navigation, route }: { navigation: any; route: any }) => {
  const insets = useSafeAreaInsets();
  const themeContext = useContext(ThemeContext);
  const { userData } = themeContext;
  
  const { chapter, activeTab } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [testTrack, setTestTrack] = useState<any[]>([]);
  const [chapterBatches, setChapterBatches] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [showScoreDetail, setShowScoreDetail] = useState(false);
  const [selectedScore, setSelectedScore] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isSharingAnalytics, setIsSharingAnalytics] = useState(false);
  const viewShotRefAnalytics = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showScoreDetail) {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }).start();
    }
  }, [showScoreDetail]);

  const openScoreDetail = (score: any, index: number) => {
    setSelectedScore(score);
    setSelectedIndex(index);
    setShowScoreDetail(true);
  };

  const handleShareAnalytics = async () => {
    try {
      setIsSharingAnalytics(true);
      setTimeout(async () => {
        if (viewShotRefAnalytics.current) {
          const uri = await viewShotRefAnalytics.current.capture();
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
          } else {
            const accuracy = selectedScore?.total ? Math.round((Number(selectedScore.score) / Number(selectedScore.total)) * 100) : 0;
            const message = `Check out my ${chapter?.topicName || 'Chapter Practice'} performance on Gyrus NEET! 🏆\nScore: ${selectedScore?.score}/${selectedScore?.total}\nAccuracy: ${accuracy}%\nDate: ${new Date(selectedScore?.date || Date.now()).toLocaleDateString()}`;
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

  useEffect(() => {
    if (!chapter) return;
    
    const fetchFullChapter = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const chapterId = typeof chapter._id === 'object' && chapter._id.$oid 
                          ? chapter._id.$oid 
                          : chapter._id?.toString();
                          
        // Fetch full chapter including questions since /chapters list api omits them
        const res = await axiosInstance.get(`/chapters/${chapterId}`);
        const fullChapter = res.data;
        
        const chapterSubjectKey = `chapter_${chapterId}`;
        
        // Check user progress for scores
        const progress = userData?.chapterProgress?.[chapterSubjectKey] || {};
        const scores = progress.scores || [];
        
        // Sort questions strictly by mcqId (extracting the numeric part for proper ordering)
        if (fullChapter.questions && Array.isArray(fullChapter.questions)) {
          const sortedQuestions = [...fullChapter.questions].sort((a, b) => {
            const idA = a.mcqId || '';
            const idB = b.mcqId || '';
            
            const matchA = idA.match(/^[A-Za-z]+0*(\d+)$/);
            const matchB = idB.match(/^[A-Za-z]+0*(\d+)$/);
            
            if (matchA && matchB && matchA[1] && matchB[1]) {
              const numA = parseInt(matchA[1], 10);
              const numB = parseInt(matchB[1], 10);
              if (numA !== numB) return numA - numB;
            }
            
            // Fallback to alphabetical if format doesn't match
            return idA.localeCompare(idB);
          });

          // 1. Calculate base batches for the chapter
          const baseBatches: { size: number; questions: any[]; batchIndexInRound: number }[] = [];
          const total = sortedQuestions.length;
          let count = 0;
          let bIdx = 0;
          
          while (count < total) {
            let size = (bIdx % 2 === 0) ? 10 : 20;
            
            // If taking this size leaves less than 10 questions remaining, combine them into this batch!
            let remainingAfterThis = total - (count + size);
            if (remainingAfterThis > 0 && remainingAfterThis < 10) {
              size += remainingAfterThis;
            } else if (count + size > total) {
              // Normal clamp if we exceed total
              size = total - count;
            }
            
            const chunk = sortedQuestions.slice(count, count + size);
            baseBatches.push({
              size,
              questions: chunk,
              batchIndexInRound: bIdx,
            });
            count += size;
            bIdx++;
          }

          // 2. Generate multi-round batches
          const allBatches: any[] = [];
          const completedTrack: any[] = [];
          const baseBatchCount = baseBatches.length > 0 ? baseBatches.length : 1;
          
          const completedBatchesCount = scores.length;
          const isWholeChapterCompleted = (completedBatchesCount > 0 && completedBatchesCount % baseBatchCount === 0);
          const startPracticeTime = route.params?.startPracticeTime;
          
          const completedRounds = Math.floor(completedBatchesCount / baseBatchCount);
          const currentRound = Math.floor(completedBatchesCount / baseBatchCount);
          // Generate up to the current active practice round unconditionally so the next Start button is always visible
          const totalRoundsToGenerate = currentRound + 1;

          for (let r = 0; r < totalRoundsToGenerate; r++) {
            for (let b = 0; b < baseBatches.length; b++) {
              const baseBatch = baseBatches[b];
              const globalIndex = r * baseBatchCount + b;

              const scoreEntry = scores[globalIndex];
              const hasScore = scoreEntry !== undefined && scoreEntry !== null;
              const scoreValue = hasScore ? (typeof scoreEntry === 'object' ? Number(scoreEntry.score) : Number(scoreEntry)) : null;
              const totalValue = (hasScore && typeof scoreEntry === 'object' && scoreEntry.total) ? Number(scoreEntry.total) : baseBatch.size;
              const dateValue = (hasScore && typeof scoreEntry === 'object' && scoreEntry.date) ? scoreEntry.date : null;
              const rewardPointsValue = (hasScore && typeof scoreEntry === 'object' && scoreEntry.rewardPoints)
                ? Number(scoreEntry.rewardPoints)
                : (scoreValue !== null ? scoreValue * 8 : 0);

              const batch = {
                _id: `batch_${globalIndex}`,
                testType: baseBatch.size.toString(),
                testId: `chapter_test_${chapterId}_${globalIndex}`,
                totalQuestions: baseBatch.size,
                total: totalValue,
                score: scoreValue,
                date: dateValue,
                rewardPoints: rewardPointsValue,
                correct: scoreValue !== null ? scoreValue : 0,
                wrong: Math.max(0, totalValue - (scoreValue || 0)),
                questions: baseBatch.questions,
                batchIndex: globalIndex,
                batchIndexInRound: b,
                roundIndex: r,
              };
              allBatches.push(batch);
              
              if (batch.score !== null) {
                completedTrack.unshift(batch); // newest at index 0
              }
            }
          }
          setChapterBatches(allBatches);
          setTestTrack(completedTrack);
        } else {
          setFetchError("Chapter has no questions.");
        }
      } catch (err: any) {
        console.error("Error fetching full chapter questions", err);
        setFetchError(err.message || "Failed to fetch chapter questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchFullChapter();
  }, [chapter, userData, route.params?.startPracticeTime]);

  if (!chapter) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No chapter selected</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('SubjectChapters', { subject: route.params?.subject || 'Physics', activeTab: route.params?.activeTab })}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chapterId = typeof chapter._id === 'object' && chapter._id.$oid 
                    ? chapter._id.$oid 
                    : chapter._id?.toString();
  const chapterSubjectKey = `chapter_${chapterId}`;

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.screen} pointerEvents="box-none" collapsable={false}>
        <LinearGradient
          style={{ flex: 1 }}
          colors={["#028464", "#0AB7AD", "#0B7960"]}
        >
          <HeaderBar />
          
          <View style={styles.headerInfoContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('SubjectChapters', { subject: route.params?.subject || 'Physics', activeTab: route.params?.activeTab })} style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={22} color={COLORS.light} />
            </TouchableOpacity>
            
            <View style={styles.headerContentWrapper}>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>
                  {activeTab ? `Class ${activeTab === '11th' ? 'XI' : activeTab === '12th' ? 'XII' : activeTab.replace('th', '')}` : (chapter.className ? `Class ${chapter.className === '11th' || chapter.className === '11' ? 'XI' : chapter.className === '12th' || chapter.className === '12' ? 'XII' : chapter.className}` : 'Chapter Practice')} • Chapter {chapter.chapterNumber}
                </Text>
              </View>
              <Text style={styles.headerTitle}>{chapter.topicName}</Text>
            </View>
            
            {/* Dummy view to balance the back button and perfectly center the text */}
            <View style={{ width: wp(13) }} />
          </View>

          <View style={styles.trackContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.light} />
            ) : fetchError ? (
              <View style={styles.centerContainer}>
                <Text style={[styles.errorText, { color: '#ffaaaa' }]} selectable>{fetchError}</Text>
                <TouchableOpacity style={[styles.backButton, { marginTop: 20 }]} onPress={() => navigation.navigate('SubjectChapters', { subject: route.params?.subject || 'Physics', activeTab: route.params?.activeTab })}>
                  <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Arrows 
                track={testTrack} 
                chapterBatches={chapterBatches}
                subName={chapterSubjectKey}
                chapter={chapter}
                onScorePress={(score, index) => {
                  openScoreDetail(score, index);
                }}
              />
            )}
          </View>
        </LinearGradient>
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
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.detailTitle} numberOfLines={1}>
                    {chapter.topicName}
                  </Text>
                  {isSharingAnalytics ? (
                    <Text style={[styles.detailSubtitle, { color: '#012c29', fontFamily: 'AppFont-Bold', fontSize: 16 }]}>
                      {`${userData?.firstName || ''} ${userData?.lastName || ''} • Chapter ${chapter.chapterNumber}`}
                    </Text>
                  ) : (
                    <Text style={styles.detailSubtitle}>
                      {selectedScore?.roundIndex !== undefined
                        ? `Practice ${selectedScore.roundIndex + 1} • Batch ${(selectedScore.batchIndexInRound ?? 0) + 1}${selectedScore.date ? ` • ${new Date(selectedScore.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}` : ''}`
                        : (selectedScore?.date 
                          ? `${new Date(selectedScore.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • ${new Date(selectedScore.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                          : `Batch ${(selectedScore?.batchIndex ?? 0) + 1} • Practice Test`)}
                    </Text>
                  )}
                </View>
                {!isSharingAnalytics && (
                  <TouchableOpacity 
                    onPress={() => setShowScoreDetail(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={COLORS.primary03 || '#00474c'} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Overall stats */}
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
                        <Text style={styles.statValueDetail}>/{selectedScore?.total || selectedScore?.totalQuestions || 20}</Text>
                      </View>
                      <Text style={styles.statLabelDetail}>Total Score</Text>
                    </View>
                    <View style={styles.dividerDetail} />
                    <View style={styles.statBox}>
                      <Text style={[styles.statValueDetail, { color: '#b45309' }]}>
                        {selectedScore?.total || selectedScore?.totalQuestions
                          ? Math.round((Number(selectedScore.score || 0) / Number(selectedScore.total || selectedScore.totalQuestions)) * 100)
                          : 0}%
                      </Text>
                      <Text style={styles.statLabelDetail}>Accuracy</Text>
                    </View>
                  </View>
                  
                  {/* Accuracy Bar */}
                  <View style={[styles.progressBg, { marginRight: 0, height: 10, position: 'relative', backgroundColor: '#e2e8f0' }]}>
                    <Animated.View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', `${selectedScore?.total || selectedScore?.totalQuestions ? Math.round((Number(selectedScore.score || 0) / Number(selectedScore.total || selectedScore.totalQuestions)) * 100) : 0}%`]
                          }),
                          backgroundColor: COLORS.primary03 || '#0AB8AD',
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

              {/* Chapter Topic Breakdown */}
              <View style={styles.subjectItem}>
                <View style={styles.subjectInfo}>
                  <View style={[styles.subjectIndicator, { backgroundColor: '#0AB8AD' }]} />
                  <Text style={styles.subjectNameDetail} numberOfLines={1}>{chapter.topicName}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBg, { position: 'relative', marginRight: 12 }]}>
                    <Animated.View style={[
                      styles.progressFill, 
                      { 
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${selectedScore?.total || selectedScore?.totalQuestions ? Math.round((Number(selectedScore.score || 0) / Number(selectedScore.total || selectedScore.totalQuestions)) * 100) : 0}%`]
                        }),
                        backgroundColor: '#0AB8AD', 
                        position: 'absolute', 
                        left: 0, 
                        top: 0, 
                        borderRadius: 4 
                      }
                    ]} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <StopwatchCounter 
                      value={Number(selectedScore?.score || 0)} 
                      style={[styles.subjectScoreDetail, { color: '#0AB8AD' }]} 
                      key={showScoreDetail ? `sub-${selectedScore?.score}` : 'hidden'}
                    />
                    <Text style={[styles.subjectScoreDetail, { color: '#0AB8AD' }]}>/{selectedScore?.total || selectedScore?.totalQuestions || 20}</Text>
                  </View>
                </View>
              </View>

              {/* Reward Points */}
              <View style={styles.rewardContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 16 }}>
                  <View style={styles.rewardBadge}>
                    <Ionicons name="gift" size={24} color="#f59e0b" />
                  </View>
                  <View>
                    <Text style={styles.rewardLabel}>Reward Points Earned</Text>
                    <Text style={styles.rewardValue}>
                      +{Number(selectedScore?.rewardPoints || (selectedScore?.score || 0) * 8)} Points
                    </Text>
                  </View>
                </View>

                {!isSharingAnalytics && (
                  <TouchableOpacity 
                    onPress={handleShareAnalytics}
                    style={styles.shareBtnAnalytics}
                  >
                    <Ionicons name="share-social" size={24} color={COLORS.primary03 || '#0AB8AD'} />
                  </TouchableOpacity>
                )}
              </View>

              {isSharingAnalytics && (
                <View style={styles.shareBrandingAnalytics}>
                  <Image source={require('../assets/appLogo.png')} style={styles.shareLogoAnalytics} />
                  <View>
                    <Text style={styles.shareAppNameAnalytics}>Gyrus NEET</Text>
                    <Text style={styles.shareInfoAnalytics}>
                      Chapter {chapter.chapterNumber} • {selectedScore?.date 
                        ? `${new Date(selectedScore.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • ${new Date(selectedScore.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
                        : `${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
          </ViewShot>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#014b51",
  },
  screen: {
    flex: 1,
  },
  headerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: wp(5),
    paddingHorizontal: wp(2),
    paddingVertical: hp(2.5),
    marginTop: hp(1.5),
    marginBottom: hp(2),
  },
  backButtonCircle: {
    width: wp(10),
    height: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  headerContentWrapper: {
    flex: 1,
    alignItems: 'center', // Centered horizontally
    justifyContent: 'center',
  },
  headerBadge: {
    backgroundColor: COLORS.two || '#0AB8AD',
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.5),
    borderRadius: 20,
    marginBottom: hp(0.8),
    shadowColor: '#0AB8AD',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  headerBadgeText: {
    color: '#013a3f',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(2.8),
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.5),
    lineHeight: wp(5.5),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  trackContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "transparent",
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    fontSize: 20,
    color: COLORS.primary03 || '#00474c',
  },
  detailSubtitle: {
    fontFamily: 'AppFont-Regular',
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
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
    color: COLORS.primary03 || '#00474c',
  },
  statLabelDetail: {
    fontFamily: 'AppFont-Regular',
    fontSize: 12,
    color: '#64748b',
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
  rewardContainer: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 20,
    marginTop: 10,
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
  shareBtnAnalytics: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  shareBrandingAnalytics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 10,
  },
  shareLogoAnalytics: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  shareAppNameAnalytics: {
    fontFamily: 'AppFont-Bold',
    fontSize: 14,
    color: '#013a3f',
  },
  shareInfoAnalytics: {
    fontFamily: 'AppFont-Regular',
    fontSize: 12,
    color: '#64748b',
  },
});

export default ChapterPractice;
