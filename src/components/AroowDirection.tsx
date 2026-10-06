import { getTestStrategy } from '../services/testStrategies/index';
import StartButton from './StartButton';
import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Pressable } from "react-native"
import { CustomText as Text } from './CustomText';
import { CustomVerticalScrollbar } from './CustomVerticalScrollbar';
import { ScrollView } from 'react-native';

import { COLORS } from "../styles/themes";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { axiosInstance } from "../config/indeceptor";
import { ThemeContext } from "../service/authContext";



import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import SingleStage from "./SingleStage";



const Arrows = ({ subName, track, chapterBatches, chapter, onScorePress, hideStartButton, forceLockDummy }: { track: any; subName: string; chapterBatches?: any[]; chapter?: any; onScorePress?: (score: any, index: number) => void; hideStartButton?: boolean; forceLockDummy?: boolean }) => {
  const [stageTrack, setStageTrack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testSize, setTestSize] = useState<number | null>(null);
  const [isNextSetSizeReady, setIsNextSetSizeReady] = useState(false);
  const themeContext = useContext(ThemeContext);

  // Destructure the context value as an object
  const {
    userData,
    setUserData,
    signUpData,
    setSignUpData,
    appState,
    setAppState } = themeContext;

  const scrollBottomRef = useRef<ScrollView | null>(null);
  const startButtonYPos = useRef<number | null>(null);
  const { height } = Dimensions.get("window");

  const homeSubject = subName || String(appState?.home || 'neet');
  const isChapter = homeSubject.startsWith('chapter_');
  const hasNextBatch = !isChapter || Boolean(chapterBatches && chapterBatches.some((b: any) => b.score === null || b.score === undefined));
  const isChapterComplete = isChapter && !hasNextBatch && Array.isArray(track) && track.length > 0;

  const lastCompletedRound = Array.isArray(track) && track[0]?.roundIndex;
  const nextBatchIndex = chapterBatches ? chapterBatches.findIndex((b: any) => b.score === null || b.score === undefined) : -1;
  const currentPendingRound = (nextBatchIndex !== -1 && chapterBatches) ? chapterBatches[nextBatchIndex]?.roundIndex : undefined;
  const isNewRoundStarting = isChapter && typeof currentPendingRound === 'number' && typeof lastCompletedRound === 'number' && currentPendingRound > lastCompletedRound;

  const scrollToStart = React.useCallback(() => {
    // Default to hp(80) (approx height of the 4 dummy stages) so we never scroll to 0 or wrong end
    const defaultY = hp(80);
    const targetY = (startButtonYPos.current !== null && startButtonYPos.current > 0)
      ? startButtonYPos.current
      : defaultY;

    // When chapter practice is fully complete, starting a new practice round, or starting practice 1:
    // Position target near top of viewport so that the result section and practice cards below are fully in view without scrolling!
    let scrollY: number;
    if (isChapterComplete) {
      scrollY = Math.max(0, targetY - hp(12));
    } else if (isNewRoundStarting) {
      scrollY = Math.max(0, targetY - hp(12));
    } else if (isChapter && (!stageTrack || stageTrack.length === 0)) {
      scrollY = Math.max(0, targetY - hp(8));
    } else {
      scrollY = Math.max(0, targetY - height + hp(40));
    }

    scrollBottomRef.current?.scrollTo({ y: scrollY, animated: true });
  }, [height, isChapter, isChapterComplete, isNewRoundStarting, stageTrack]);

  const handleStartLayout = React.useCallback((e: any) => {
    const y = e?.nativeEvent?.layout?.y;
    if (typeof y === 'number' && y > 0) {
      startButtonYPos.current = y;
      scrollToStart();
    }
  }, [scrollToStart]);

  useEffect(() => {
    setStageTrack(track);
    setTimeout(scrollToStart, 50);
    setTimeout(scrollToStart, 150);
    setTimeout(scrollToStart, 350);
  }, [track, scrollToStart]);

  useFocusEffect(
    React.useCallback(() => {
      setTimeout(scrollToStart, 50);
      setTimeout(scrollToStart, 150);
      setTimeout(scrollToStart, 350);
    }, [scrollToStart])
  );
  const dummyData = ["", "", "", ""];

  const navigation: any = useNavigation();

  // Store next set size for Start button
  const [nextSetSize, setNextSetSize] = useState(40);

  const normalizePositiveNumber = (value: any): number | null => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const normalizeNonNegativeInt = (value: any): number | null => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.floor(n);
  };

  const isRegularStudent = (std: string = ''): boolean => {
    const s = String(std || '').trim().toUpperCase();
    return s !== 'R' && s !== 'REPEATER' && s !== 'C' && s !== 'CRASH';
  };

  const getDefaultSizeForSubject = (subject: string): number => {
    return 20;
  };

  const getDerivedNextSizeFromProgress = (subjectState: any, subject: string, trackLength?: number): number | null => {
    const backendIdx = normalizeNonNegativeInt(subjectState?.setIndex);
    // The backend setIndex is the absolute source of truth. We only fall back to track length if setIndex is missing.
    const idx = backendIdx !== null ? backendIdx : (trackLength !== undefined ? trackLength : null);

    console.log(`[AroowDirection] getDerived: sub=${subject}, backendIdx=${backendIdx}, trackLen=${trackLength}, chosenIdx=${idx}`);

    if (idx === null) return null;

    try {
      const isPaid = !!userData?.planValid;
      const strategy = getTestStrategy(
        { std: userData?.std, planValid: isPaid },
        subject
      );
      const pattern = strategy?.getCyclePattern ? strategy.getCyclePattern(userData?.std, subject) : null;
      console.log(`[AroowDirection] getDerived: strategy=${strategy.constructor.name}, isPaid=${isPaid}, pattern=${JSON.stringify(pattern)}`);

      if (Array.isArray(pattern) && pattern.length > 0) {
        const result = pattern[idx % pattern.length];
        console.log(`[AroowDirection] getDerived: returning ${result} (idx ${idx} % ${pattern.length} = ${idx % pattern.length})`);
        return result;
      }
    } catch (e) {
      console.error('[AroowDirection.tsx] getDerivedNextSizeFromProgress error:', e);
    }

    return null;
  };

  useEffect(() => {
    if (!userData || !appState?.home || !userData[appState.home]) {
      console.error('[AroowDirection.tsx] Missing userData or appState.home');
      setIsNextSetSizeReady(true); // Allow rendering even if data is missing
      return;
    }

    const homeSubject = String(appState.home || 'neet');
    const subjectState = userData[appState.home];
    if (!subjectState || !subjectState.testId) {
      console.log('[AroowDirection.tsx] No testId for the current track. Defaulting to size 20');
      const fallbackSize = getDefaultSizeForSubject(homeSubject);
      setTestSize(fallbackSize);
      setNextSetSize(fallbackSize);
      setIsNextSetSizeReady(true);
      return;
    }

    const storedNext = normalizePositiveNumber(subjectState?.nextSetSize);
    // Use the 'track' prop which is passed from Home.tsx as the source of truth for progress
    const trackLength = Array.isArray(track) ? track.length : 0;
    const derivedNext = getDerivedNextSizeFromProgress(subjectState, homeSubject, trackLength);
    const isPaid = !!userData?.planValid;

    // PROGRESSION LOGIC: 
    const finalNextSize = derivedNext ?? storedNext ?? getDefaultSizeForSubject(homeSubject);

    console.log('[AroowDirection.tsx] Syncing progress:', {
      trackLength,
      derivedNext,
      isPaid,
      final: finalNextSize
    });

    const isRegular = isRegularStudent(userData?.std);
    const cappedSize = ((!isPaid || isRegular) && finalNextSize > 40) ? 40 : finalNextSize;
    setTestSize(cappedSize);
    setNextSetSize(cappedSize);
    setIsNextSetSizeReady(true);
  }, [userData, appState?.home, track]);

  // Zero-lag progression sync: Calculate the next set size directly during render
  // to ensure the UI is always in sync with the 'track' prop history.
  const liveNextSize = React.useMemo(() => {
    const homeSubject = subName || String(appState?.home || 'neet');
    const isChapter = homeSubject.startsWith('chapter_');
    const subjectState = isChapter ? (userData?.chapterProgress?.[homeSubject] || {}) : userData?.[homeSubject];

    if (isChapter && chapterBatches) {
      const nextBatchIndex = chapterBatches.findIndex((t: any) => t.score === null || t.score === undefined);
      if (nextBatchIndex === -1) {
        return 0;
      }
      const currentBatch = chapterBatches[nextBatchIndex];
      return currentBatch ? currentBatch.totalQuestions : 10;
    }

    if (!userData || !subjectState) {
      console.log('[AroowDirection] liveNextSize: missing data, returning nextSetSize', nextSetSize);
      return nextSetSize;
    }
    const trackLength = Array.isArray(track) ? track.length : 0;
    const derived = getDerivedNextSizeFromProgress(subjectState, homeSubject, trackLength);
    const stored = normalizePositiveNumber(subjectState.nextSetSize);
    const isPaid = !!userData?.planValid;
    const isRegular = isRegularStudent(userData?.std);

    // If regular student (11th/12th), ignore legacy stored values > 40
    const sanitizedStored = (isRegular && stored && stored > 40) ? null : stored;
    const final = derived ?? sanitizedStored ?? nextSetSize;
    let result = (!isPaid && final > 40) ? 40 : final;
    if (isRegular && result > 40) {
      result = 40;
    }

    console.log('[AroowDirection] liveNextSize calculation:', {
      trackLength,
      derived,
      stored,
      isPaid,
      final,
      result
    });

    return result;
  }, [userData, appState?.home, track, nextSetSize, chapterBatches]);

  const StartTest = () => {
    // Final client-side gate: free users cannot start individual subjects.
    const homeSubject = (subName || appState?.home || 'neet').toString().toLowerCase();
    const isChapter = homeSubject.startsWith('chapter_');
    if (!userData?.planValid && homeSubject !== 'neet' && !isChapter) {
      setLoading(false);
      navigation.navigate('Plans');
      return;
    }

    // Safety check before accessing userData
    if (!userData || !homeSubject) {
      console.error('[AroowDirection.tsx] StartTest: userData or homeSubject is undefined, cannot start test');
      setLoading(false);
      return;
    }

    const subjectState = isChapter ? (userData.chapterProgress?.[homeSubject] || {}) : userData[homeSubject];
    if (!subjectState) {
      console.error('[AroowDirection.tsx] StartTest: subject state not found');
      setLoading(false);
      return;
    }

    // For chapters, we don't necessarily have a strict `testId` or `subjectId` required to proceed like the main subjects.
    // If it's not a chapter, enforce testId and subjectId presence.
    if (!isChapter && (!subjectState.testId || !subjectState.subjectId)) {
      console.error('[AroowDirection.tsx] StartTest: Missing testId or subjectId in state', {
        testId: subjectState.testId,
        subjectId: subjectState.subjectId
      });
      setLoading(false);
      return;
    }

    const isPaid = !!userData?.planValid;

    // Use liveNextSize for immediate navigation to prevent legacy state from overriding
    const preferredClientSize = liveNextSize;

    const fallbackSize = preferredClientSize ?? nextSetSize ?? getDefaultSizeForSubject(homeSubject);

    if (isChapter && chapterBatches) {
      if (navigation && typeof navigation.setParams === 'function') {
        navigation.setParams({ startPracticeTime: undefined });
      }
      // Find the next batch in the track that is not completed
      const nextBatchIndex = chapterBatches.findIndex((t: any) => t.score === null || t.score === undefined);
      if (nextBatchIndex === -1) {
        setLoading(false);
        return;
      }
      const currentBatch = chapterBatches[nextBatchIndex];

      let size = currentBatch ? currentBatch.totalQuestions : 20;

      setNextSetSize(size);
      setTestSize(size);
      navigation.navigate("Test", {
        params: {
          subject: homeSubject,
          chapter: chapter,
          chapterName: chapter?.topicName,
          chapterNumber: chapter?.chapterNumber,
          type: size,
          localQuestions: currentBatch?.questions,
          std: userData.std
        }
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    // Call backend to lock the state of the NEXT test.
    // Notice that we explicitly pass `nextSetSize: preferredClientSize` to tell the backend our intent!
    axiosInstance.post("authentication/test-track", { subject: homeSubject, nextSetSize: preferredClientSize })
      .then((res: any) => {
        const generatedTypeSize = Number(res.data.type);
        const isRegular = isRegularStudent(userData?.std);
        let size = isPaid ? generatedTypeSize : (generatedTypeSize > 40 ? 40 : generatedTypeSize);
        if (isRegular && size > 40) size = 40;

        console.log('[AroowDirection] Backend synced! Starting test with type:', size);
        setNextSetSize(size);
        setTestSize(size);

        navigation.navigate("Test", {
          params: {
            subject: homeSubject,
            type: size,
            questionIds: res.data.questionIds,
            testId: subjectState.testId,
            subjectId: subjectState.subjectId,
            std: userData.std
          }
        });
        setLoading(false);
      })
      .catch((e: any) => {
        console.error('[AroowDirection] test-track error:', e.message);
        // Local Fallback Route:
        const isRegular = isRegularStudent(userData?.std);
        let size = preferredClientSize ?? fallbackSize;
        if ((!isPaid || isRegular) && size > 40) size = 40;
        let testTypeParam = fallbackSize;
        if (isRegular && testTypeParam > 40) testTypeParam = size;

        console.log('[AroowDirection] Using fallback local navigation for test with size:', size);
        setNextSetSize(size);
        setTestSize(size);
        navigation.navigate("Test", {
          params: {
            subject: homeSubject,
            type: testTypeParam,
            testId: subjectState.testId,
            subjectId: subjectState.subjectId,
            std: userData.std
          }
        });
        setLoading(false);
      });
  };

  const renderPracticeResultSection = (
    key: string,
    label: string,
    stats: { correct: number; wrong: number; total: number },
    prevStageId: number,
    nextStageId?: number
  ) => {
    const isPrevEven = prevStageId % 2 === 0;
    const isNextEven = (typeof nextStageId === 'number' ? nextStageId : 0) % 2 === 0;

    // Desired symmetrical visual gap in pixels
    const GAP = 36;
    
    // Stage ABOVE: empty space inside container below shelf = 120 (even) or 110 (odd)
    const prevShelfBottom = isPrevEven ? 120 : 110;
    const marginTop = GAP - prevShelfBottom;

    // Stage BELOW: empty space inside container above shelf = hp(20) - (bottom + wp(20))
    const nextShelfBottom = isNextEven ? 120 : 110;
    const emptySpaceAboveShelf = hp(20) - (nextShelfBottom + wp(20));
    const marginBottom = GAP - emptySpaceAboveShelf;

    return (
      <View key={key} style={[styles.newRoundEndWrapper, { marginTop, marginBottom }]}>
        <View style={styles.roundEndPillRow}>
          <View style={styles.roundEndLine} />
          <View style={styles.roundEndPill}>
            <Text style={styles.roundEndCheck}>✓</Text>
            <Text style={styles.roundEndText}>{label}</Text>
          </View>
          <View style={styles.roundEndLine} />
        </View>

        <View style={styles.roundEndStatsRow}>
          <View style={[styles.roundEndStatCard, { backgroundColor: 'rgba(0,0,0,0.45)', borderColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={[styles.roundEndStatValue, { color: '#5dffc4' }]}>{stats.correct}</Text>
            <Text style={styles.roundEndStatLabel}>Correct</Text>
          </View>
          <View style={[styles.roundEndStatCard, { backgroundColor: 'rgba(0,0,0,0.45)', borderColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={[styles.roundEndStatValue, { color: '#ff8f8f' }]}>{stats.wrong}</Text>
            <Text style={styles.roundEndStatLabel}>Incorrect</Text>
          </View>
          <View style={[styles.roundEndStatCard, { backgroundColor: 'rgba(0,0,0,0.45)', borderColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={[styles.roundEndStatValue, { color: '#ffffff' }]}>{stats.total}</Text>
            <Text style={styles.roundEndStatLabel}>Total</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!isNextSetSizeReady) {
    return <ActivityIndicator size="large" color="#00B7C2" />; // Show loading spinner
  }

  return (
    <View
      style={{
        flex: 1,
        height: "auto"
      }}
    >
      <CustomVerticalScrollbar
        ref={scrollBottomRef}
        indicatorColor="hsla(185, 100%, 93%, 1.00)"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: subName === 'mockTest' ? hp(15) : hp(2) }}
      >
        <View
          style={{
            height: "auto"
          }}
        >
          {(() => {
            const homeSubject = subName || String(appState?.home || 'neet');
            const isChapter = homeSubject.startsWith('chapter_');
            const hasNextBatch = !isChapter || Boolean(chapterBatches && chapterBatches.some((b: any) => b.score === null || b.score === undefined));
            const lastCompletedRound = track[0]?.roundIndex;
            const nextBatchIndex = chapterBatches ? chapterBatches.findIndex((b: any) => b.score === null || b.score === undefined) : -1;
            const currentPendingRound = (nextBatchIndex !== -1 && chapterBatches) ? chapterBatches[nextBatchIndex]?.roundIndex : undefined;
            const isNewRoundStarting = isChapter && typeof currentPendingRound === 'number' && typeof lastCompletedRound === 'number' && currentPendingRound > lastCompletedRound;

            return dummyData.length > 0 && dummyData.map((data, index) => {
            const isNeet = subName.toLowerCase() === 'neet';
            // If it's NEET, we might want to be more strict about strategy selection
            const strategy = getTestStrategy({ std: userData.std, planValid: userData.planValid }, appState.home);
            const label = strategy.getSetLabel ? strategy.getSetLabel(index) : `Set ${index + 1}`;

            // Calculate what the question count WOULD be for this future stage
            // Use setIndex from backend (not track.length) to match what Start button shows
            let qCount = 40;
            const homeSubject = subName || String(appState?.home || 'neet');
            const isChapter = homeSubject.startsWith('chapter_');

            try {
              if (isChapter && chapterBatches) {
                // Find current batch
                const nextBatchIndex = chapterBatches.findIndex((b: any) => b.score === null || b.score === undefined);
                if (nextBatchIndex === -1) {
                  // Whole chapter completed and no next batch active
                  qCount = 0;
                } else {
                  const currentBatch = chapterBatches[nextBatchIndex];
                  const currentRound = currentBatch ? currentBatch.roundIndex : 0;
                  const currentSetIndex = nextBatchIndex;

                  let offsetFromCurrent;
                  if (index === 3) {
                    offsetFromCurrent = 0; // Current test size (Start button size)
                  } else if (index === 2) {
                    offsetFromCurrent = 1; // Next test size
                  } else if (index === 1) {
                    offsetFromCurrent = 2;
                  } else {
                    offsetFromCurrent = 3;
                  }

                  const targetBatchIndex = currentSetIndex + offsetFromCurrent;
                  // Only show question count for batches within the CURRENT practice set; others are locked
                  if (
                    targetBatchIndex < chapterBatches.length &&
                    chapterBatches[targetBatchIndex]?.roundIndex === currentRound
                  ) {
                    qCount = chapterBatches[targetBatchIndex].totalQuestions;
                  } else {
                    // Beyond current practice set - locked with padlock icon until next practice session starts
                    qCount = 0;
                  }
                }
              } else {
                const pattern = strategy.getCyclePattern ? strategy.getCyclePattern(userData.std, appState.home) : null;
                if (Array.isArray(pattern) && pattern.length > 0) {
                  // Get current setIndex from backend (determines which test we're on in the pattern)
                  const backendSetIndex = normalizeNonNegativeInt(userData[appState.home]?.setIndex);

                  // The backend setIndex is the absolute source of truth. We only fall back to track length if setIndex is missing.
                  const currentSetIndex = backendSetIndex !== null ? backendSetIndex : track.length;

                  // Use liveNextSize as the baseline for the current test
                  // Locked cards show NEXT test sizes from the pattern (going forward)
                  let offsetFromCurrent;
                  if (index === 3) {
                    offsetFromCurrent = 0; // Current test size (Start button size)
                  } else if (index === 2) {
                    offsetFromCurrent = 1; // Next test size
                  } else if (index === 1) {
                    offsetFromCurrent = 2;
                  } else {
                    offsetFromCurrent = 3;
                  }
                  // Handle indices with modulo using the full pattern
                  const absoluteIndex = (currentSetIndex + offsetFromCurrent) % pattern.length;
                  let rawQCount = pattern[absoluteIndex];

                  const isRegular = isRegularStudent(userData?.std);
                  // ABSOLUTE GATE: Force non-paid users and regular 11th/12th students to 40 max for locked display.
                  if (!userData?.planValid && rawQCount > 40) {
                    qCount = 40;
                  } else if (isRegular && rawQCount > 40) {
                    qCount = 40;
                  } else {
                    qCount = rawQCount;
                  }
                }
              }
            } catch (e) {
              console.error('[AroowDirection] Error calculating qCount for dummy stage:', e);
            }

            const isLowestDummy = index === dummyData.length - 1;
            const isChapterComplete = isLowestDummy && isChapter && !hasNextBatch && track.length > 0;
            const shouldHideArrow = isLowestDummy && isChapter && !hasNextBatch && track.length > 0;

            let dummyRoundEndLabel: string | undefined = undefined;
            let dummyRoundEndStats: { correct: number; wrong: number; total: number } | undefined = undefined;
            let dummyPracticeLabel: string | undefined = undefined;

            if (isChapterComplete) {
              const latestRoundIndex = track[0]?.roundIndex ?? 0;
              const latestRoundNumber = latestRoundIndex + 1;
              const roundBatches = track.filter((t: any) => t.roundIndex === latestRoundIndex);
              const rCorrect = roundBatches.reduce((s: number, t: any) => s + (Number(t.correct ?? t.score) || 0), 0);
              const rTotal = roundBatches.reduce((s: number, t: any) => s + (Number(t.total ?? t.totalQuestions) || 0), 0);
              const rWrong = Math.max(0, rTotal - rCorrect);
              dummyRoundEndLabel = `Practice ${latestRoundNumber} Complete`;
              dummyRoundEndStats = { correct: rCorrect, wrong: rWrong, total: rTotal };
              dummyPracticeLabel = `Practice ${latestRoundNumber + 1}`;
            }

            return (
              <React.Fragment key={index}>
                <SingleStage
                  key={index}
                  id={index}
                  score={data}
                  start={() => { }}
                  loading={loading}
                  questionCount={qCount}
                  label={label}
                  showNumber={forceLockDummy ? false : qCount > 0}
                  practiceLabel={dummyPracticeLabel}
                  isLocked={forceLockDummy || isChapterComplete}
                  onLayout={isChapterComplete ? handleStartLayout : undefined}
                  hideArrow={shouldHideArrow || (forceLockDummy && index === dummyData.length - 1 && stageTrack.length === 0)}
                />
                {isChapterComplete && dummyRoundEndLabel && dummyRoundEndStats && (
                  renderPracticeResultSection(
                    'chapter-complete-result-banner',
                    dummyRoundEndLabel,
                    dummyRoundEndStats,
                    index,
                    0
                  )
                )}
              </React.Fragment>
            );
          });
          })()}
          {stageTrack.length != 0 &&
            (() => {
              const homeSubject = subName || String(appState?.home || 'neet');
              const isChapter = homeSubject.startsWith('chapter_');
              const hasNextBatch = !isChapter || Boolean(chapterBatches && chapterBatches.some((b: any) => b.score === null || b.score === undefined));
              const elements: React.ReactNode[] = [];

              const lastCompletedRound = track[0]?.roundIndex;
              const nextBatchIndex = chapterBatches ? chapterBatches.findIndex((b: any) => b.score === null || b.score === undefined) : -1;
              const currentPendingRound = (nextBatchIndex !== -1 && chapterBatches) ? chapterBatches[nextBatchIndex]?.roundIndex : undefined;
              const isNewRoundStarting = isChapter && typeof currentPendingRound === 'number' && typeof lastCompletedRound === 'number' && currentPendingRound > lastCompletedRound;

              if (isNewRoundStarting && typeof lastCompletedRound === 'number') {
                const roundBatches = track.filter((t: any) => t.roundIndex === lastCompletedRound);
                const rCorrect = roundBatches.reduce((s: number, t: any) => s + (Number(t.correct ?? t.score) || 0), 0);
                const rTotal = roundBatches.reduce((s: number, t: any) => s + (Number(t.total ?? t.totalQuestions) || 0), 0);
                const roundStats = { correct: rCorrect, wrong: Math.max(0, rTotal - rCorrect), total: rTotal };
                const pendingRoundNumber = (typeof currentPendingRound === 'number' ? currentPendingRound : lastCompletedRound + 1) + 1;

                elements.push(
                  <View key="new-round-start-section" style={{ width: '100%' }}>
                    {/* Start button and practice score card like every other start and score card */}
                    <SingleStage
                      key="new-round-start-stage"
                      id={0}
                      score=""
                      start={StartTest}
                      loading={loading}
                      questionCount={liveNextSize}
                      isLatest={true}
                      practiceLabel={`Practice ${pendingRoundNumber}`}
                      onLayout={handleStartLayout}
                      hideArrow={true}
                    />

                    {/* Previous practice complete divider + stats */}
                    {renderPracticeResultSection(
                      'new-round-end-section',
                      `Practice ${lastCompletedRound + 1} Complete`,
                      roundStats,
                      0,
                      0
                    )}
                  </View>
                );
              }

              track.forEach((data: any, index: number) => {
                const isLatest = index === 0 && hasNextBatch && !isNewRoundStarting;
                // For the Start button (isLatest), always use liveNextSize (the upcoming test size)
                // For completed score cards, preserve their actual recorded total questions
                let questionCount = isLatest
                  ? liveNextSize
                  : (typeof data === 'object' && data !== null && 'total' in data ? (Number(data.total) || liveNextSize) : liveNextSize);

                const strategy = getTestStrategy({ std: userData.std, planValid: userData.planValid }, appState.home);
                const setLabel = strategy.getSetLabel ? strategy.getSetLabel(index) : `Set ${index + 1}`;

                // Detect if this stage is the LAST stage of a completed round
                let roundEndLabel: string | undefined = undefined;
                let roundEndStats: { correct: number; wrong: number; total: number } | undefined = undefined;
                if (
                  isChapter &&
                  index < track.length - 1 &&
                  typeof data?.roundIndex === 'number' &&
                  typeof track[index + 1]?.roundIndex === 'number' &&
                  data.roundIndex > track[index + 1].roundIndex
                ) {
                  const completedRoundIndex = track[index + 1].roundIndex;
                  roundEndLabel = `Practice ${completedRoundIndex + 1} Complete`;
                  const roundBatches = track.filter((t: any) => t.roundIndex === completedRoundIndex);
                  const rCorrect = roundBatches.reduce((s: number, t: any) => s + (Number(t.correct ?? t.score) || 0), 0);
                  const rTotal = roundBatches.reduce((s: number, t: any) => s + (Number(t.total ?? t.totalQuestions) || 0), 0);
                  roundEndStats = { correct: rCorrect, wrong: Math.max(0, rTotal - rCorrect), total: rTotal };
                }

                elements.push(
                  <SingleStage
                    key={`${data.date}_${data.score}_${index}`}
                    id={index}
                    score={data}
                    start={StartTest}
                    onScorePress={onScorePress}
                    loading={loading}
                    questionCount={questionCount}
                    label={setLabel}
                    showNumber={false}
                    isLatest={isLatest && !hideStartButton}
                    onLayout={isLatest ? handleStartLayout : undefined}
                    hideArrow={Boolean(roundEndLabel) || index === track.length - 1}
                    isBottomStage={index === track.length - 1}
                  />
                );

                if (roundEndLabel && roundEndStats) {
                  elements.push(
                    renderPracticeResultSection(
                      `round-end-${index}`,
                      roundEndLabel,
                      roundEndStats,
                      index,
                      index + 1 < track.length ? index + 1 : undefined
                    )
                  );
                }
              });

              return elements;
            })()
          }
          {stageTrack.length == 0 && (() => {
            const homeSubject = subName || String(appState?.home || 'neet');
            const isChapter = homeSubject.startsWith('chapter_');
            const hasNextBatch = !isChapter || Boolean(chapterBatches && chapterBatches.some((b: any) => b.score === null || b.score === undefined));
            if (!hasNextBatch) return null;

            if (isChapter) {
              const firstBatchIndex = chapterBatches ? chapterBatches.findIndex((b: any) => b.score === null || b.score === undefined) : -1;
              const initialRoundIndex = (firstBatchIndex !== -1 && chapterBatches && typeof chapterBatches[firstBatchIndex]?.roundIndex === 'number')
                ? chapterBatches[firstBatchIndex].roundIndex
                : 0;
              const initialPracticeLabel = `Practice ${initialRoundIndex + 1}`;

              return (
                <SingleStage
                  key="chapter_practice_start"
                  id={0}
                  score=""
                  start={StartTest}
                  loading={loading}
                  questionCount={liveNextSize}
                  isLatest={true}
                  practiceLabel={initialPracticeLabel}
                  onLayout={handleStartLayout}
                  hideArrow={true}
                  isBottomStage={true}
                />
              );
            }

            return (
              <View
                style={{ width: wp(50), left: wp(50), bottom: hp(0.5) }}
                onLayout={handleStartLayout}
              >
                {!hideStartButton && (
                  <StartButton
                    onPress={StartTest}
                    Text={`Start - ${liveNextSize}`}
                    loading={loading}
                    questionCount={liveNextSize}
                  />
                )}
              </View>
            );
          })()}
        </View>
      </CustomVerticalScrollbar>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 29,
    marginTop: "28%",
    height: "auto",
    marginBottom: wp(2)
  }, wrapperAnother: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    transform: [{ rotate: "-52deg" }],
    marginTop: "22%",
    // backgroundColor:"red",
    left: 28,
    marginBottom: wp(10),

    // top:10
    // display:"none"
  },
  rectangle1: {
    width: 30,
    backgroundColor: COLORS.Arrowgray,
    margin: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    height: 62,
    borderColor: COLORS.lightGrey80,

    borderRightWidth: wp(1.4),
    borderLeftWidth: wp(1.4)
  }, rectangleTouch1: {
    // backgroundColor: "green",
    top: -64,
    left: -67,
    transform: [{ rotate: "28deg" }]
  }, rectangleTouch2: {
    // backgroundColor: "red",
    top: -6,
    left: -128,
    transform: [{ rotate: "28deg" }]
  }, rectangleTouch3: {
    // backgroundColor: "red",
    top: 52,
    left: -189,
    transform: [{ rotate: "28deg" }]
  }, rectangle2: {
    width: 30,
    backgroundColor: COLORS.Arrowgray,
    margin: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    height: 62,
    borderColor: COLORS.lightGrey80,
    // transform: [{ rotate: "28deg" }],
    borderRightWidth: wp(1.4),
    borderLeftWidth: wp(1.4)
  }, rectangle3: {
    display: "flex",
    flexDirection: "row",

    width: 30,
    backgroundColor: COLORS.Arrowgray,
    margin: 0,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    height: 62,
    borderColor: COLORS.lightGrey80,
    // transform: [{ rotate: "28deg" }],
    borderRightWidth: wp(1.4),
    borderLeftWidth: wp(1.4)
  }, triangle: {
    top: -112,
    width: 0,
    height: 50,
    // left:22,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 27,
    borderRightWidth: 27,
    borderBottomWidth: 43,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: COLORS.Arrowgray,
    transform: [{ rotate: "28deg" }],
    margin: 0,
    marginLeft: "50%",
    borderWidth: 0
  }, wrapperLeft: {
    flexDirection: "row",
    // justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 29,
    // paddingTop: 90,
    // marginTop: "40%",
    // height:'8.6%',
    // backgroundColor:'yellow',
    // overflow:'hidden',
    // marginVertical:40
  },
  rectangle1Left: {
    width: 30,
    backgroundColor: COLORS.Arrowgray,
    margin: 0,
    top: -78,
    left: -17,
    justifyContent: "center",
    alignItems: "center",
    height: 62,
    borderColor: COLORS.lightGrey80,
    transform: [{ rotate: "-28deg" }]
  }, rectangle2Left: {
    width: 30,
    backgroundColor: COLORS.Arrowgray,
    margin: 0,
    top: -20,
    left: -16,
    justifyContent: "center",
    alignItems: "center",
    height: 62,
    borderColor: COLORS.lightGrey80,
    transform: [{ rotate: "-28deg" }]
  }, rectangle3Left: {
    width: 30,
    backgroundColor: COLORS.Arrowgray,
    margin: 0,
    top: 39,
    left: -15,
    justifyContent: "center",
    alignItems: "center",
    height: 62,
    borderColor: COLORS.lightGrey80,
    transform: [{ rotate: "-28deg" }]
  }, triangleLeft: {
    top: -126,
    width: 0,
    height: 50,
    // left:22,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 27,
    borderRightWidth: 27,
    borderBottomWidth: 43,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: COLORS.Arrowgray,
    transform: [{ rotate: "-28deg" }],
    margin: 0,
    marginLeft: "20%",
    borderWidth: 0
  }, // Mark
  rectangleScoreParent: {
    top: "43.39%",
    bottom: "4.76%",
    left: "48.64%",
    right: "0%",
    width: "51.36%",
    height: "10%"
  }, rectangleScoreParent2: {
    // top: "12%",
    bottom: "18%",
    left: "14%",
    right: "1%",
    width: "51%",
    height: "15%",
    // backgroundColor:'red'
  },
  groupChildtri2: {
    height: "28%",
    width: "28%",
    top: "5%",
    right: "62%",
    bottom: "39%",
    left: "29%",
    zIndex: 1
  }, groupItem: {
    height: "110%",
    width: "16.74%",
    top: "7.94%",
    right: "59%",
    bottom: "30.68%",
    left: "60.47%"
  }, groupChild1: {
    position: "absolute",
    backgroundColor: "transparent"
  }, groupChild2: {
    position: "absolute",
    backgroundColor: "transparent"
  }, groupChild3: {
    position: "absolute",
    backgroundColor: "transparent"
  }, groupChild4: {
    position: "absolute",
    backgroundColor: "transparent"
  }, groupChildPosition2: {
    // bottom: "11.11%",
    // left:"4%",
    // top: "56%",
    width: "38%",
    height: "100%"
  }, groupChildPositionRight: {
    // bottom: "11.11%",
    // left: "54%",
    // top: "10%",
    width: "100%",
    height: "100%"
  }, groupChildPosition1: {
    left: "61.71%",
    right: "5.88%",
    bottom: "11.11%",
    top: "20.67%",
    width: "29.41%",
    height: "8%"
  }, groupChildPosition: {
    left: "5.9%",
    right: "64.71%",
    bottom: "11.11%",
    top: "20.67%",
    width: "29.41%",
    height: "72.22%"
  }, groupChild4Position: {
    // borderRadius: ,
    left: "0%",
    top: "86.11%",
    height: "13.89%",
    bottom: "0%",
    right: "0%",
    width: "97%"
  }, rectangleView: {
    left: "4%",
    top: "56%",
    height: "8%",
    bottom: "0%",
    right: "0%",
    width: "38%"
  }, rectangleViewRight: {
    // left: "54%",
    // top: "10%",
    height: "100%",
    // bottom: "0%",
    // right: "0%",
    width: "100%"
  }, textTypo2: {
    textShadowRadius: 4,
    textShadowOffset: {
      width: 4,
      height: 0
    }, textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    fontFamily: 'AppFont-Regular', fontSize: 24,
    left: "42.35%",
    top: "57%",
    position: "absolute",
    // backgroundColor:'red',
    // width:'20%'
  },
  textTypo1: {
    left: "13.53%",
    textShadowRadius: 4,
    textShadowOffset: {
      width: 4,
      height: 0
    }, textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    // fontFamily: FontFamily.palanquinBold,
    fontFamily: 'AppFont-Regular', fontSize: 24,
    top: "25%",
    position: "absolute"
  }, textTypo: {
    left: "70.59%",
    textShadowRadius: 4,
    textShadowOffset: {
      width: 4,
      height: 0
    }, textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    // fontFamily: FontFamily.palanquinBold,
    fontFamily: 'AppFont-Regular', fontSize: 24,
    top: "25%",
    position: "absolute"
  }, textTypo2Right: {
    textShadowRadius: 4,
    textShadowOffset: {
      width: 4,
      height: 0
    }, textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    fontFamily: 'AppFont-Regular', fontSize: 24,
    left: "114%",
    top: "57%",
    position: "absolute",
    // backgroundColor:'red',
    // width:'20%'
  },
  textTypo1Right: {
    left: "142%",
    textShadowRadius: 4,
    textShadowOffset: {
      width: 4,
      height: 0
    }, textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    // fontFamily: FontFamily.palanquinBold,
    fontFamily: 'AppFont-Regular', fontSize: 24,
    top: "25%",
    position: "absolute"
  }, textTypoRight: {
    left: "168%",
    textShadowRadius: 4,
    textShadowOffset: {
      width: 4,
      height: 0
    }, textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    // fontFamily: FontFamily.palanquinBold,
    fontFamily: 'AppFont-Regular', fontSize: 24,
    top: "25%",
    position: "absolute"
  }, groupChild5: {
    left: "64.71%",
    right: "5.88%",
    bottom: "11.11%",
    top: "20.67%",
    width: "16%",
    height: "8%"
  }, groupChild6: {
    left: "35.29%",
    right: "35.29%",
    bottom: "11.11%",
    top: "20.67%",
    width: "29.41%",
    height: "8%"
  }, groupChild7: {
    left: "6.29%",
    bottom: "11.11%",
    right: "35.29%",
    top: "20.67%",
    width: "29.41%",
    height: "8%"
  }, groupChildBg: {
    backgroundColor: COLORS.colorLightgray,
    position: "absolute"
  },
  box: {
    width: 300,
    height: 30,
    marginVertical: 20,
    borderColor: "#000000",
    borderWidth: 1,
    borderRadius: 7.0,
  },
  newRoundEndWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  roundEndPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  roundEndLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 1,
  },
  roundEndPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  roundEndCheck: {
    color: '#4ade80',
    fontSize: 15,
    fontFamily: 'AppFont-Bold',
    marginRight: 6,
  },
  roundEndText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontFamily: 'AppFont-Bold',
    letterSpacing: 0.3,
  },
  roundEndStatsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  roundEndStatCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
  },
  roundEndStatValue: {
    fontSize: 22,
    fontFamily: 'AppFont-Bold',
  },
  roundEndStatLabel: {
    fontSize: 13,
    fontFamily: 'AppFont-Medium',
    color: 'rgba(255,255,255,0.88)',
    marginTop: 3,
  },
});
export default Arrows;
