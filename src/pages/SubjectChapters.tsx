import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { CustomText as Text } from "../components/CustomText";
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from "../styles/themes";
import { axiosInstance } from "../config/indeceptor";
import { ThemeContext } from "../service/authContext";
import HeaderBar from "../navigation/Headerbar";

const colorMap: Record<string, string> = {
  physics: '#8627BC',
  chemistry: '#013385',
  botany: '#016507',
  zoology: '#007750'
};

const getChapterRounds = (totalQ: number, scores: any[]) => {
  if (totalQ <= 0) {
    return [{ round: 1, progress: 0 }];
  }

  let count = 0;
  let bIdx = 0;
  let baseBatchesCount = 0;
  while (count < totalQ) {
    let size = (bIdx % 2 === 0) ? 10 : 20;
    let remainingAfterThis = totalQ - (count + size);
    if (remainingAfterThis > 0 && remainingAfterThis < 10) {
      size += remainingAfterThis;
    } else if (count + size > totalQ) {
      size = totalQ - count;
    }
    count += size;
    bIdx++;
    baseBatchesCount++;
  }

  const baseBatchCount = baseBatchesCount > 0 ? baseBatchesCount : 1;
  const numRounds = Math.max(1, Math.ceil(scores.length / baseBatchCount));

  const rounds: { round: number; progress: number }[] = [];
  for (let r = 0; r < numRounds; r++) {
    const roundScores = scores.slice(r * baseBatchCount, (r + 1) * baseBatchCount);
    const roundCorrect = roundScores.reduce((sum: number, s: any) => {
      const correctVal = (typeof s === 'object' && s !== null)
        ? (s.correct !== undefined && s.correct !== null ? Number(s.correct) : (Number(s.score) || 0))
        : (Number(s) || 0);
      return sum + correctVal;
    }, 0);

    const progress = Math.min(100, Math.round((roundCorrect / totalQ) * 100));
    rounds.push({ round: r + 1, progress });
  }

  return rounds;
};

const CLASS_NAME_MAP: Record<string, string> = {
  "11th": "XI",
  "12th": "XII",
};

const SubjectChapters = ({ navigation, route }: any) => {
  const { subject, activeTab } = route.params;
  const { userData, setUserData } = useContext(ThemeContext);
  const isFocused = useIsFocused();
  const [chaptersData, setChaptersData] = useState<any[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const insets = useSafeAreaInsets();

  const subjectColor = colorMap[subject.toLowerCase()] || COLORS.two;
  const displayClass = CLASS_NAME_MAP[activeTab] || activeTab;

  useEffect(() => {
    if (isFocused) {
      axiosInstance.get("authentication/user")
        .then(res => {
          if (res.data) {
            setUserData(res.data);
          }
        })
        .catch(() => { });
    }
  }, [isFocused]);

  useEffect(() => {
    const fetchChapters = async () => {
      setLoadingChapters(true);
      const mappedClass = CLASS_NAME_MAP[activeTab] || activeTab;

      try {
        const res = await axiosInstance.get(`/chapters?className=${mappedClass}&subject=${subject}`);
        const activeChapters = Array.isArray(res.data) 
          ? res.data.filter((ch: any) => !ch.isArchived && ch.approved !== false)
          : [];
        setChaptersData(activeChapters);
      } catch (error) {
        console.error("Error fetching chapters", error);
      } finally {
        setLoadingChapters(false);
      }
    };
    fetchChapters();
  }, [subject, activeTab]);

  useEffect(() => {
    if (!chaptersData || chaptersData.length === 0) return;
    const missing = chaptersData.filter(ch => !ch.totalQuestions || ch.totalQuestions <= 0);
    if (missing.length === 0) return;

    missing.forEach(async (ch) => {
      const cId = typeof ch._id === 'object' && ch._id.$oid ? ch._id.$oid : ch._id?.toString();
      if (!cId) return;
      try {
        const res = await axiosInstance.get(`/chapters/${cId}`);
        if (res.data?.questions && Array.isArray(res.data.questions)) {
          const count = res.data.questions.length;
          setChaptersData(prev =>
            prev.map(c => {
              const id = typeof c._id === 'object' && c._id.$oid ? c._id.$oid : c._id?.toString();
              return id === cId ? { ...c, totalQuestions: count } : c;
            })
          );
        }
      } catch (e) {
        // Silently catch background fetch
      }
    });
  }, [chaptersData]);

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]} edges={["top"]}>
      <HeaderBar />
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Classes')}>
            <Ionicons name="arrow-back" size={24} color="#2b2b2b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{subject} • Class - {displayClass}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {loadingChapters ? (
            <ActivityIndicator size="large" color={subjectColor} style={{ marginTop: 40 }} />
          ) : chaptersData.length === 0 ? (
            <Text style={styles.noDataText}>No chapters available.</Text>
          ) : (
            <View style={styles.chaptersList}>
              {chaptersData.map((chapter, cIndex) => {
                const chapterId = typeof chapter._id === 'object' && chapter._id.$oid
                  ? chapter._id.$oid
                  : chapter._id?.toString();
                const chapterSubjectKey = `chapter_${chapterId}`;
                const progressData = userData?.chapterProgress?.[chapterSubjectKey] || {};
                const scores = progressData.scores || [];
                const totalQ = Number(chapter.totalQuestions) || 0;
                const rounds = getChapterRounds(totalQ, scores);

                return (
                  <TouchableOpacity
                    key={cIndex}
                    style={[
                      styles.listCard,
                      {
                        borderColor: subjectColor + '33',
                        shadowColor: subjectColor,
                      }
                    ]}
                    onPress={() => navigation.navigate('ChapterPractice', {
                      chapter,
                      subject,
                      activeTab,
                      startPracticeTime: Date.now()
                    })}
                  >
                    <View style={styles.listCardMain}>
                      <View style={styles.listCardLeft}>
                        <View style={[styles.chapterBadge, { backgroundColor: subjectColor }]}>
                          <Text style={styles.chapterNumber}>CH {chapter.chapterNumber}</Text>
                        </View>
                        <Text style={styles.chapterTitle}>{chapter.topicName}</Text>
                      </View>
                    </View>

                    <View style={styles.expandedContent}>
                      <View style={styles.progressContainer}>
                        {rounds.map((roundItem) => (
                          <View
                            key={roundItem.round}
                            style={roundItem.round > 1 ? styles.additionalRoundProgress : styles.firstRoundProgress}
                          >
                            <View style={styles.progressLabelRow}>
                              <Text style={[styles.roundLabelText, { color: subjectColor }]}>
                                {rounds.length > 1 ? `Practice ${roundItem.round}` : 'Practice'}
                              </Text>
                              <Text style={styles.progressText}>{roundItem.progress}% Completed</Text>
                            </View>
                            <View style={styles.progressBarBackground}>
                              <View style={[styles.progressBarFill, { width: `${roundItem.progress}%`, backgroundColor: subjectColor }]} />
                            </View>
                          </View>
                        ))}
                      </View>
                      <View
                        style={[styles.practiceButton, { backgroundColor: subjectColor }]}
                      >
                        <Text style={styles.practiceButtonText}>Practice</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary01,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: 20,
    color: '#2b2b2b',
  },
  content: {
    padding: 16,
  },
  chaptersList: {
    paddingBottom: 16,
  },
  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  listCardMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
  },
  listCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
  },
  chapterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  chapterNumber: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "AppFont-Bold",
  },
  chapterTitle: {
    fontSize: 18,
    color: "rgba(0, 0, 0, 0.6)",
    fontFamily: "AppFont-Bold",
    flex: 1,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  progressContainer: {
    marginBottom: 16,
  },
  firstRoundProgress: {},
  additionalRoundProgress: {
    marginTop: 10,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  roundLabelText: {
    fontSize: 16,
    fontFamily: "AppFont-Bold",
  },
  progressText: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.6)",
    fontFamily: "AppFont-Bold",
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  practiceButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  practiceButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "AppFont-Bold",
  },
  noDataText: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.7)",
    fontFamily: "AppFont-Regular",
    textAlign: "center",
    paddingVertical: 12,
  }
});

export default SubjectChapters;
