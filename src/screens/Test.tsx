// Simple linear progress bar
const SimpleProgressBar = ({ progress = 0, height = 16, style = {} }) => {
  const barHeight = height;
  const fillColor = '#0AB8AD';
  const bgColor = '#E0E0E0';
  return (
    <View style={[{ height: barHeight, backgroundColor: bgColor, borderRadius: barHeight / 2, overflow: 'hidden', justifyContent: 'center', width: '100%' }, style]}>
      <View style={{ width: `${Math.max(0, Math.min(progress, 100))}%`, height: barHeight, backgroundColor: fillColor, borderRadius: barHeight / 2 }} />
      <Text style={{ position: 'absolute', width: '100%', textAlign: 'center', color: '#333', fontWeight: 'bold', fontSize: barHeight * 0.7 }}>{`${Math.round(progress)}%`}</Text>
    </View>
  );
};
import React, { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  TouchableOpacity,
  BackHandler,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import ConfettiCannon from 'react-native-confetti-cannon';
import RadioButton from "../components/RadioButton";
// import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../styles/themes";
import { SplitStringValues } from "../service/DataShow";
import { ThemeContext } from "../service/authContext";
import { getTestStrategy } from "../services/testStrategies";
import { TestStrategy } from "../services/testStrategies/types";
import { axiosInstance } from "../config/indeceptor";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import CheckButton from "../components/CheckButton";
import { LinearGradient as Lin } from "expo-linear-gradient";


import { Defs, LinearGradient, Path, Rect, Stop, Svg } from "react-native-svg";
import { Modal } from "@gluestack-ui/themed-native-base";

const Test = (props: any) => {
  const reviewMcqIdRaw = props?.route?.params?.params?.reviewMcqId;
  const isReviewMode = !!(typeof reviewMcqIdRaw === 'string' && reviewMcqIdRaw.trim());
  const reviewMcqId = isReviewMode ? String(reviewMcqIdRaw).trim() : "";

  // const [bookMarked, setBookMarked] = useState(false);
  const VectorWin = require("../assets/trophy.png");

  const [MCQs, setMCQs] = useState<any>([]);
  const [MCQ, setMCQ] = useState<any>({});
  const [MCQIdx, setMCQIdx] = useState(0);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [setIndexInCycle, setSetIndexInCycle] = useState(0);
  const [numericKeys, setNumericKeys] = useState<any>([]);

  const [showPopup, setShowPopup] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const context = React.useContext(ThemeContext);
  const {
    userData,
    setUserData,
    signUpData,
    setSignUpData,
    appState,
    setAppState,
  } = context;
  const isTesterBuildUser = String(userData?.accType || '').trim().toLowerCase() === 'tester';
  const showTestMeta = isReviewMode || isTesterBuildUser;

  const [finalData, setFinalData] = useState<any>({
    subjectId: props.route.params?.params?.subjectId || '',
    testId: props.route.params?.params?.testId || '',
    scores: 0,
    subject: props.route.params?.params?.subject || 'chemistry',
    correctQtsId: [],
    wrongQtsId: [],
  });
  const [score, setScore] = useState(0);
  const [correctQtsIds, setCorrectQtsIds] = useState<any[]>([]);
  const [wrongQtsIds, setWrongQtsIds] = useState<any[]>([]);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submittedTotal, setSubmittedTotal] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedIndex, setSelectedIdx] = useState(undefined);

  const [tipShown, setTipShown] = React.useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [resultShown, setResultShown] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [strategy, setStrategy] = useState<TestStrategy | null>(null);
  const [showAnimated, setshowAnimated] = useState(false);

  const [arrNum, setArrNum] = useState(0); // Define state for `arrNum`

  const [isSubmitting, setIsSubmitting] = useState(false);

  const answeredQuestionKeysRef = useRef<Set<string>>(new Set());

  const normalizeObjectIdString = useCallback((value: any): string | null => {
    if (value === null || value === undefined) return null;

    try {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^[0-9a-fA-F]{24}$/.test(trimmed)) return trimmed;

        // Handle strings like ObjectId("...")
        const objectIdMatch = trimmed.match(/ObjectId\(["']([0-9a-fA-F]{24})["']\)/);
        if (objectIdMatch?.[1]) return objectIdMatch[1];

        return null;
      }

      if (typeof value === 'object') {
        const maybeOid = (value as any).$oid ?? (value as any).oid;
        if (typeof maybeOid === 'string' && /^[0-9a-fA-F]{24}$/.test(maybeOid)) return maybeOid;

        if (typeof (value as any).toHexString === 'function') {
          const s = String((value as any).toHexString());
          if (/^[0-9a-fA-F]{24}$/.test(s)) return s;
        }

        if (typeof (value as any).toString === 'function') {
          const s = String((value as any).toString());
          const direct = s.match(/^[0-9a-fA-F]{24}$/)?.[0];
          if (direct) return direct;

          const objectIdMatch = s.match(/ObjectId\(["']([0-9a-fA-F]{24})["']\)/);
          if (objectIdMatch?.[1]) return objectIdMatch[1];
        }
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  const getQuestionIdForPayload = useCallback((question: any): string | null => {
    return normalizeObjectIdString(question?._id);
  }, [normalizeObjectIdString]);

  const getDedupKey = useCallback((question: any, fallbackIndex?: number): string => {
    const objectId = getQuestionIdForPayload(question);
    if (objectId) return `oid:${objectId}`;
    if (typeof question?.mcqId === 'string' && question.mcqId.trim()) return `mcq:${question.mcqId.trim()}`;
    if (typeof fallbackIndex === 'number') return `idx:${fallbackIndex}`;
    return 'unknown';
  }, [getQuestionIdForPayload]);

  const isTrueLike = useCallback((value: any) => {
    if (value === true) return true;
    if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
    return false;
  }, []);

  const isVisibleQuestion = useCallback((question: any) => {
    if (isTesterBuildUser) return true; // testers see all questions regardless of approval/deletion
    return isTrueLike(question?.approved) && !isTrueLike(question?.isDelete);
  }, [isTrueLike, isTesterBuildUser]);

  // Initialize strategy
  useEffect(() => {
    if (isReviewMode) {
      return;
    }
    try {
      const std = props.route.params?.params?.std;
      const isPaid = userData?.planValid || false;
      const subject = props.route.params?.params?.subject || 'neet';

      console.log('[Test.tsx] STRATEGY INITIALIZATION:', {
        std,
        isPaid,
        subject,
        userDataStd: userData?.std,
        userDataPlanValid: userData?.planValid,
        subjectDataExists: !!(userData && userData[subject]),
        subjectData: userData?.[subject] ? {
          cycle: userData[subject].cycle,
          setIndex: userData[subject].setIndex,
          testId: userData[subject].testId
        } : null
      });

      if (std && userData) {
        const selectedStrategy = getTestStrategy({ std: userData.std, planValid: userData.planValid }, subject);
        console.log('[Test.tsx] Strategy selected:', selectedStrategy ? 'SUCCESS' : 'FAILED');
        setStrategy(selectedStrategy);
      }

      if (userData && userData[subject]) {
        const c = userData[subject].cycle || 0;
        const s = userData[subject].setIndex || 0;
        console.log(`[Test.tsx] RESTORING indices from userData: cycle=${c}, setIndex=${s}`);
        setCycleIndex(c);
        setSetIndexInCycle(s);
      } else {
        console.warn('[Test.tsx] NO subject data in userData, defaulting to cycle=0, setIndex=0');
        setCycleIndex(0);
        setSetIndexInCycle(0);
      }
    } catch (error) {
      console.error('[Test.tsx] Error in strategy initialization:', error);
    }
  }, [props.route.params?.params?.std, userData?.planValid, props.route.params?.params?.subject, userData]);

  const [submitTest, setSubmitTest] = useState(false);
  const navigation: any = useNavigation();
  const [selectedValue, setSelectedValue] = useState<any>(null);

  const handleSelect = (value: any) => {
    setSelectedValue(value);
  };

  useEffect(() => {
    if (submitTest) {
      // Get the next size from strategy before submitting if possible,
      // or rely on SubmitTest to update some state.
      // But SubmitTest is an async side effect here.
      SubmitTest();
      setSubmitTest(false);
      // We don't call fetchQuestions (0, usedIds) here anymore because
      // we want to wait for the user to click "Continue" or handle it in SubmitTest.
      // Actually, the current SubmitTest has a setTimeout that calls fetchQuestions.
      // I should unify them.
    }
  }, [submitTest]);

  useEffect(() => {
    // Show initial instructions popup only once per mount
    if (!isReviewMode) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, []);

  // Review mode: fetch a single MCQ by mcqId and show answer + explanation
  useEffect(() => {
    if (!isReviewMode) return;

    let cancelled = false;

    const run = async () => {
      try {
        setLoadingQuestions(true);

        const res = await axiosInstance.get("authentication/questions/batch", {
          params: { mcqIds: reviewMcqId },
        });

        const list = res?.data;
        const q = Array.isArray(list) ? (list.find((item: any) => isVisibleQuestion(item)) || null) : null;
        if (!q) {
          Alert.alert("Not found", `No question found for MCQ ID: ${reviewMcqId}`);
          return;
        }

        if (cancelled) return;

        setMCQs([q]);
        setMCQIdx(0);
        setMCQ(q);
        setUsedIds([]);
        setOffset(0);
        setCycleIndex(0);
        setSetIndexInCycle(0);
        setResultShown(true);
        setTestStarted(true);
        setShowAnswer(true);

        const ans = (q as any)?.answer;
        const selected = ans !== undefined && ans !== null ? (Number(ans) as any) : undefined;
        setSelectedIdx(selected);
      } catch (err: any) {
        console.error('[Test.tsx] Review mode fetch failed:', err);
        const msg = err?.response?.data?.message;
        Alert.alert('Error', msg ? String(msg) : 'Failed to fetch MCQ.');
      } finally {
        if (!cancelled) setLoadingQuestions(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [isReviewMode, isVisibleQuestion, reviewMcqId]);

  // Log the IDs of the questions currently displayed whenever MCQs updates
  useEffect(() => {
    if (Array.isArray(MCQs) && MCQs.length) {
      const displayedIds = MCQs.map((q: any) => q.mcqId || q._id);
      console.log('[Test.tsx] Displayed question IDs:', displayedIds);
    }
  }, [MCQs]);

  // Helper to fetch questions with offset and usedIds
  // Always update MCQIdx and MCQ after fetching new questions
  const fetchQuestions = async (offsetValue = 0, usedIdsArr?: string[], nextIdx = 0, explicitCycle?: number, explicitSet?: number, forcedType?: number) => {
    try {
      const effectiveUsedIds = Array.isArray(usedIdsArr) ? usedIdsArr : usedIds;
      const std = props.route.params?.params?.std;
      const subject = props.route.params?.params?.subject;
      const type = forcedType || props.route.params?.params?.type;

      if (!std || !subject || !type) {
        console.error('[Test.tsx] Missing required parameters for fetchQuestions');
        setLoadingQuestions(false);
        return;
      }

      const finalCycle = explicitCycle !== undefined ? explicitCycle : cycleIndex;
      const finalSet = explicitSet !== undefined ? explicitSet : setIndexInCycle;

      console.log(`[Test.tsx] fetchQuestions - FULL DEBUG INFO:`, {
        forcedType: forcedType,
        routeParamsType: props.route.params?.params?.type,
        resolvedType: type,
        finalCycle: finalCycle,
        finalSet: finalSet,
        finalSetServerFormat: finalSet + 1,
        setIndexInCycle: setIndexInCycle,
        usedIdsCount: effectiveUsedIds.length,
        currentState: { cycleIndex, setIndexInCycle, type: props.route.params?.params?.type }
      });

      if (strategy && std && subject) {
        setLoadingQuestions(true);
        // CLEAR previous scores when fetching a NEW set (nextIdx 0 and offset 0 usually means new set)
        if (offsetValue === 0 && nextIdx === 0) {
          setCorrectQtsIds([]);
          setWrongQtsIds([]);
          answeredQuestionKeysRef.current = new Set();
        }

        const questions = await strategy.fetchQuestions({
          subject,
          std,
          type: Number(type),
          offset: offsetValue,
          usedIds: effectiveUsedIds,
          cycle: finalCycle,
          set: finalSet + 1, // backend expects 1-based set
        });

        console.log('[Test.tsx] Loaded strategy questions count:', questions.length);
        console.log('[Test.tsx] Displayed question IDs:', questions.map((q: any) => q.mcqId));

        // Validate and filter questions to ensure they have proper structure
        const validatedQuestions = (questions || []).filter((q: any) => {
          if (!q) {
            console.warn('[Test.tsx] Null or undefined question');
            return false;
          }

          if (!isVisibleQuestion(q)) {
            console.warn('[Test.tsx] Hidden question filtered out:', q.mcqId || q._id, {
              approved: q?.approved,
              isDelete: q?.isDelete,
            });
            return false;
          }
          
          // Check if question field exists and has value property
          if (!q.question || typeof q.question !== 'object') {
            console.warn('[Test.tsx] Invalid question field structure:', q.mcqId || q._id);
            return false;
          }
          
          // Check if value is a string
          if (!q.question.value || typeof q.question.value !== 'string') {
            console.warn('[Test.tsx] Invalid question value:', q.mcqId || q._id, 'value type:', typeof q.question.value);
            return false;
          }

          // CHECK if all 4 options exist
          if (!q["1"] || !q["2"] || !q["3"] || !q["4"]) {
            console.warn('[Test.tsx] Missing options for question:', q.mcqId || q._id, {
              has1: !!q["1"],
              has2: !!q["2"],
              has3: !!q["3"],
              has4: !!q["4"],
            });
            return false;
          }

          // Check if options have value property
          if (
            !q["1"].value || typeof q["1"].value !== 'string' ||
            !q["2"].value || typeof q["2"].value !== 'string' ||
            !q["3"].value || typeof q["3"].value !== 'string' ||
            !q["4"].value || typeof q["4"].value !== 'string'
          ) {
            console.warn('[Test.tsx] Invalid option values for question:', q.mcqId || q._id);
            return false;
          }
          
          return true;
        });

        if (validatedQuestions && validatedQuestions.length > 0) {
          setMCQs(validatedQuestions);
          setMCQ(validatedQuestions[0] || {});

          const newIds = validatedQuestions.map((q: any) => q._id?.toString() || q.mcqId);
          console.log('[Test.tsx] fetchQuestions - ID EXTRACTION:', {
            questionCount: validatedQuestions.length,
            newIdsCount: newIds.length,
            newIdsFirst5: newIds.slice(0, 5),
            newIdsTypes: newIds.slice(0, 3).map((id: any) => typeof id),
            sampleQuestionIdFields: validatedQuestions.slice(0, 2).map((q: any) => ({ _id: q._id, mcqId: q.mcqId, hasId: !!q._id, hasMcqId: !!q.mcqId })),
            previousUsedIdsCount: effectiveUsedIds?.length || 0,
            totalAfterMerge: (effectiveUsedIds?.length || 0) + newIds.length
          });
          setUsedIds([...(effectiveUsedIds || []), ...newIds]);
          setMCQIdx(nextIdx);
          console.log('[Test.tsx] fetchQuestions SUCCESS: Set MCQs with validated questions count:', validatedQuestions.length);
        } else {
          console.warn('[Test.tsx] No valid questions returned from strategy - total questions received:', questions.length);
          console.error('[Test.tsx] First question structure (for debugging):', questions.length > 0 ? JSON.stringify(questions[0], null, 2) : 'No questions');
          setMCQs([]);
        }
      }
    } catch (err) {
      console.error('[Test.tsx] Error loading questions from strategy:', err);
      Alert.alert('Error', 'Failed to load questions. Please check your connection.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Reset progress only once after algorithm update
  useEffect(() => {
    const resetProgressIfNeeded = async () => {
      try {
        const resetKey = await AsyncStorage.getItem('progressResetV2');
        if (!resetKey) {
          // Call your progress reset logic here (e.g., API call to reset user progress)
          // await axiosInstance.post('/user/reset-progress');
          // Set the key so it only happens once
          await AsyncStorage.setItem('progressResetV2', 'true');
          console.log('User progress reset for new algorithm.');
        } else {
          console.log('Progress already reset, skipping.');
        }
      } catch (e) {
        console.log('Error checking or setting progress reset key:', e);
      }
      const sub = props.route.params?.params?.subject || 'neet';
      const c = (userData && userData[sub]) ? (userData[sub].cycle || 0) : 0;
      const s = (userData && userData[sub]) ? (userData[sub].setIndex || 0) : 0;

      console.log(`[Test.tsx] Initial load: using indices cycle=${c}, set=${s}`);
      fetchQuestions(0, usedIds, 0, c, s);
      setOffset(0);
      // Keep usedIds to avoid repeats
    };
    if (!isReviewMode) {
      resetProgressIfNeeded();
    }
  }, [props.route.params?.params?.std, props.route.params?.params?.subject, strategy]);

  useEffect(() => {
    if (MCQ && Object.keys(MCQ).length > 0) {
      NumbericValues();
    }
  }, [MCQ]);

  // Sync MCQ with MCQs array when MCQIdx changes
  useEffect(() => {
    if (MCQs && MCQs.length > 0 && MCQIdx < MCQs.length) {
      const currentQuestion = MCQs[MCQIdx];
      if (currentQuestion && typeof currentQuestion === 'object') {
        setMCQ(currentQuestion);
      }
    }
  }, [MCQIdx, MCQs]);

  const returnContent = (testType: any) => {
    return (
      <View style={{ alignItems: "center", width: "100%" }}>
        <Text
          style={{
            color: "#0AB8AD",
            fontSize: hp(1.68),
            textAlign: "center",
            lineHeight: hp(2.4),
            width: "100%",
          }}
        >
          This exercise contains {Number(testType)}-MCQs
        </Text>
        <Text
          style={{
            color: "#0AB8AD",
            fontSize: hp(1.68),
            textAlign: "center",
            lineHeight: hp(2.4),
            width: "100%",
            marginBottom: hp(1),
          }}
        >
          Would you like to continue?
        </Text>
        <Text
          style={{
            color: "#0AB8AD",
            fontSize: hp(1.68),
            textAlign: "center",
            lineHeight: hp(2.4),
            width: "100%",
            marginTop: hp(1.5),
          }}
        >
          Note: you need to correctly answer at least {Math.ceil(Number(testType) / 2)} questions to pass this test
        </Text>
        {Number(testType) >= 180 && (
          <Text
            style={{
              color: "#0AB8AD",
              marginTop: hp(1.5),
              fontSize: hp(1.68),
              textAlign: "center",
              lineHeight: hp(2.4),
              width: "100%",
            }}
          >
            This exercise time limit is 3 hours 20 minutes
          </Text>
        )}
        <Text style={{
          color: '#0AB8AD',
          fontSize: hp(1.5),
          textAlign: 'center',
          lineHeight: hp(2.2),
          width: '100%',
          marginTop: hp(1.5),
        }}>
          Some questions may be wider than your screen — look for the ➡️ symbol and scroll sideways to view them.
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            marginTop: hp(3),
            columnGap: wp(2),
            width: "100%",
            rowGap: hp(1),
          }}
        >
          <View style={{ flex: 1, minWidth: wp(35), maxWidth: wp(40) }}>
            <TestButton
              onPress={() => {
                if (!testStarted) {
                  // Allow test to start for crash users even if MCQs are empty or mock
                  if (MCQs.length === 0) {
                    // Show fallback message but allow start
                    Alert.alert('Notice', 'No real questions found. You will get mock questions.');
                  }
                  setTestStarted(true);
                }
                setShowPopup(false);
              }}
              colors={loadingQuestions ? ["#CCCCCC", "#E0E0E0"] : ["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
              text={<Text style={{ fontWeight: 'bold' }}>{loadingQuestions ? "Loading..." : "Continue"}</Text>}
              disable={loadingQuestions}
            />
          </View>
          <View style={{ flex: 1, minWidth: wp(35), maxWidth: wp(40) }}>
            <TestButton
              onPress={() => {
                setShowPopup(false);
                setShowRetry(false);
                setShowSuccess(false);
                setMCQs([]);
                setMCQ({});
                setMCQIdx(0);
                setSelectedIdx(undefined);
                setShowAnswer(false);
                setArrNum(0);
                if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
                  navigation.goBack();
                } else if (navigation && typeof navigation.navigate === 'function') {
                  navigation.navigate("BottomBar", { screen: "Home" });
                }
              }}
              colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
              text={<Text style={{ fontWeight: 'bold' }}>Go Back</Text>}
            />
          </View>
        </View>
      </View>
    );
  };

  const returnTestContent = (result: any) => {
    const displayScore = submittedScore ?? correctQtsIds.length;
    const displayTotal = submittedTotal ?? Number(result);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
      // Scale in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Shake animation
      Animated.sequence([
        Animated.delay(600),
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]),
      ]).start();
    }, []);

    return (
      <Animated.View style={{
        alignItems: "center",
        justifyContent: "center",
        width: wp(90),
        paddingTop: hp(25),
        maxWidth: 500,
        paddingHorizontal: wp(2),
        transform: [{ scale: scaleAnim }, { translateX: shakeAnim }]
      }}>

        <Text
          style={{
            color: "#0AB8AD",
            fontSize: hp(3.5),
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: hp(1),
          }}
        >
          Oops!
        </Text>

        <Text
          style={{
            color: "#0AB8AD",
            fontSize: hp(2),
            textAlign: "center",
            marginBottom: hp(3),
          }}
        >
          It's alright! Every mistake is a step closer to success!
        </Text>

        {/* Try Again Box */}
        <View style={{
          backgroundColor: '#0AB8AD1a',
          borderRadius: hp(2),
          padding: hp(2),
          marginBottom: hp(2),
          width: '100%',
          borderWidth: 2,
          borderColor: '#0AB8AD'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: hp(0.8), height: hp(0.8), borderRadius: hp(0.4), backgroundColor: '#0AB8AD', marginRight: wp(2) }} />
            <Text style={{ color: '#0AB8AD', fontWeight: 'bold', fontSize: hp(2) }}>Keep Trying!</Text>
            <View style={{ width: hp(0.8), height: hp(0.8), borderRadius: hp(0.4), backgroundColor: '#0AB8AD', marginLeft: wp(2) }} />
          </View>
          <Text style={{ color: '#0AB8AD', textAlign: 'center', marginTop: hp(1), fontSize: hp(1.5), fontWeight: 'bold' }}>You've got {displayScore}/{displayTotal}</Text>

        </View>

        <View style={{ width: "100%", marginTop: hp(1) }}>
          <Text
            style={{
              color: "#0AB8AD",
              fontSize: hp(1.5),
              textAlign: "center",
              lineHeight: hp(2.2),
            }}
          >
            Note: You need to correctly answer at least {Math.ceil(Number(result) / 2)} questions to pass this test.
          </Text>
        </View>

        <View style={{ width: "100%", marginTop: hp(2) }} />
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            marginTop: hp(2),
            columnGap: wp(2),
            width: "100%",
            rowGap: hp(1),
          }}
        >
          <View style={{ flex: 1, minWidth: wp(35), maxWidth: wp(40) }}>
            <TestButton
              onPress={() => {
                const setSize = Number(props.route.params?.params?.type);
                // Reset state for retrying the SAME set, then re-fetch real question objects.
                setShowRetry(false);
                setResultShown(false);
                setSubmitTest(false);
                setSubmittedScore(null);
                setSubmittedTotal(null);
                setMCQIdx(0);
                setMCQ({});
                setMCQs([]);
                setSelectedIdx(undefined);
                setShowAnswer(false);
                setArrNum(0);

                answeredQuestionKeysRef.current = new Set();

                // Clear usedIds so the strategy can serve a fresh set.
                setUsedIds([]);
                setOffset(0);

                // Re-fetch questions for the current (cycle,set) without progressing.
                fetchQuestions(0, [], 0, cycleIndex, setIndexInCycle, setSize);

                // Mark test as started again so questions render once loaded
                setTestStarted(true);
              }}
              colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
              text={<Text style={{ fontWeight: 'bold' }}>Try Again</Text>}
            />
          </View>
          <View style={{ flex: 1, minWidth: wp(35), maxWidth: wp(40) }}>
            <TestButton
              onPress={() => {
                setShowPopup(false);
                setShowRetry(false);
                setShowSuccess(false);
                setSubmittedScore(null);
                setSubmittedTotal(null);
                setMCQs([]);
                setMCQ({});
                setMCQIdx(0);
                setSelectedIdx(undefined);
                setShowAnswer(false);
                setArrNum(0);
                answeredQuestionKeysRef.current = new Set();
                if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
                  navigation.goBack();
                } else if (navigation && typeof navigation.navigate === 'function') {
                  navigation.navigate("BottomBar", { screen: "Home" });
                }
              }}
              colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
              text={<Text style={{ fontWeight: 'bold' }}>Go Back</Text>}
            />
          </View>
        </View>
      </Animated.View>
    );
  };

  const showSuccessContent = (result: any) => {
    const displayScore = submittedScore ?? correctQtsIds.length;
    const displayTotal = submittedTotal ?? Number(result);
    interface ConfettiParticle {
      id: number;
      left: number;
      delay: number;
      duration: number;
      color: string;
      anim: Animated.Value;
    }
    const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const confettiArray = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        color: ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'][Math.floor(Math.random() * 5)],
        anim: new Animated.Value(0)
      }));
      setConfetti(confettiArray);
      confettiArray.forEach(particle => {
        Animated.sequence([
          Animated.delay(particle.delay * 1000),
          Animated.loop(
            Animated.sequence([
              Animated.timing(particle.anim, {
                toValue: 1,
                duration: particle.duration * 1000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.anim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ])
          )
        ]).start();
      });

      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -20, duration: 1500, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }, []);

    return (
      <View style={{
        alignItems: "center",
        width: wp(90),
        paddingTop: hp(15),
        maxWidth: 500,
        paddingHorizontal: wp(2),
      }}>
        {confetti.map(particle => (
          <Animated.View
            key={particle.id}
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              borderRadius: 5,
              backgroundColor: particle.color,
              left: `${particle.left}%`,
              top: -30,
              transform: [
                {
                  translateY: particle.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Dimensions.get('window').height + 20]
                  })
                },
                {
                  rotate: particle.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }
              ],
              opacity: particle.anim.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [1, 1, 0]
              })
            } as any}
          />
        ))}

        {/* Animated success icon */}
        <Animated.View style={{
          marginBottom: hp(2),
          transform: [{ scale: scaleAnim }, { translateY: floatAnim }]
        }}>
          <Lin
            colors={['#fbbf24', '#f97316']}
            style={{
              padding: hp(3), borderRadius: hp(10),
              alignItems: 'center', justifyContent: 'center', elevation: 10
            }}
          >
            <Ionicons name="trophy" size={hp(8)} color="white" />
          </Lin>
        </Animated.View>

        <Text
          style={{
            color: "#0AB8AD",
            fontSize: hp(3),
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: hp(1),
          }}
        >
          Congratulations
        </Text>

        <Text
          style={{
            color: "#0AB8AD",
            fontSize: hp(2),
            textAlign: "center",
            fontWeight: "600",
            marginBottom: hp(1),
          }}
        >
          You Did It!
        </Text>

        {/* Perfect Score Box */}
        <View style={{
          backgroundColor: '#0AB8AD1a',
          borderRadius: hp(2),
          padding: hp(2),
          marginBottom: hp(2),
          width: '100%'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: hp(0.8), height: hp(0.8), borderRadius: hp(0.4), backgroundColor: '#10B981', marginRight: wp(2) }} />
            <Text style={{ color: '#0AB8AD', fontWeight: 'bold', fontSize: hp(2) }}>Perfect Score!</Text>
            <View style={{ width: hp(0.8), height: hp(0.8), borderRadius: hp(0.4), backgroundColor: '#10B981', marginLeft: wp(2) }} />
          </View>
        </View>

        <Text
          style={{
            color: "#0AB8AD",
            marginBottom: hp(3),
            fontSize: hp(1.8),
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          You have scored {displayScore} out of {displayTotal}-MCQs
        </Text>

        <TestButton
          onPress={() => {
            setShowSuccess(false);
            setSubmittedScore(null);
            setSubmittedTotal(null);
            if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation && typeof navigation.navigate === 'function') {
              navigation.navigate("BottomBar", { screen: "Home" });
            }
          }}
          colors={["#0AB8AD", "#0ab8acb3"]}
          text={<Text style={{ fontWeight: 'bold' }}>CONTINUE</Text>}
        />
      </View>
    );
  };

  const SubmitTest = () => {
    try {
      if (resultShown) {
        return;
      }
      const setSize = Number(props.route.params?.params?.type);
      if (!setSize || isNaN(setSize)) {
        console.error('[Test.tsx] Invalid setSize:', setSize);
        Alert.alert('Error', 'Invalid test configuration. Please try again.');
        setIsSubmitting(false);
        return;
      }
      const passMark = Math.ceil(setSize / 2);
      const passed = correctQtsIds.length >= passMark;

      // Persist score for the result modal (we reset correct/wrong arrays shortly after to preload next set)
      setSubmittedScore(correctQtsIds.length);
      setSubmittedTotal(setSize);

      // If the user failed, show the retry modal and DO NOT advance.
      // This prevents Home from progressing (e.g., Start - 20 -> Start - 40) on failed attempts.
      if (!passed) {
        setIsSubmitting(false);
        setShowRetry(true);
        setResultShown(true);
        return;
      }

      // Calculate progression for next set using frontend strategy
      let nextCycle = cycleIndex;
      let nextSetInCycle = setIndexInCycle + 1;
      let nextSetSize = 20; // default

      if (strategy) {
        const progression = strategy.getProgressionLogic(correctQtsIds.length, setSize, cycleIndex, setIndexInCycle, finalData.subject, props.route.params?.params?.std);
        nextCycle = progression.nextCycleIndex ?? cycleIndex;
        nextSetInCycle = progression.nextSetIndexInCycle ?? (setIndexInCycle + 1);
        nextSetSize = progression.nextSetSize ?? 20;
      }

      console.log('[Test.tsx] SubmitTest - PROGRESSION CALCULATION:', {
        currentState: { cycleIndex, setIndexInCycle, setSize },
        calculatedNext: { nextCycle, nextSetInCycle, nextSetSize },
        scoredCorrect: correctQtsIds.length,
        strategy: strategy ? 'hasStrategy' : 'noStrategy',
        subject: finalData.subject,
        std: props.route.params?.params?.std
      });

      const questionIdsForSubmit = MCQs.map((q: any) => getQuestionIdForPayload(q)).filter((id: any) => typeof id === 'string');
      const correctForSubmit = (correctQtsIds || []).filter((x: any) => typeof x?.questionId === 'string' && /^[0-9a-fA-F]{24}$/.test(x.questionId));
      const wrongForSubmit = (wrongQtsIds || []).filter((x: any) => typeof x?.questionId === 'string' && /^[0-9a-fA-F]{24}$/.test(x.questionId));

      const submitPayload = {
        subjectId: finalData.subjectId,
        testId: finalData.testId,
        scores: correctForSubmit.length,
        subject: finalData.subject,
        correctQtsId: correctForSubmit.map((x: any) => x.questionId),
        wrongQtsId: wrongForSubmit.map((x: any) => x.questionId),
        cycle: cycleIndex, // current cycle
        set: setIndexInCycle, // current set
        nextCycle, // calculated next cycle
        nextSet: nextSetInCycle, // calculated next set
        nextSetSize, // calculated next set size
        std: props.route.params?.params?.std,
        type: setSize,
        questionIds: questionIdsForSubmit,
      };

      console.log('[Test.tsx] SubmitTest - SENDING PAYLOAD:', submitPayload);

      setIsSubmitting(true);

      axiosInstance
        .post("/authentication/test/submit", submitPayload)
        .then((res: any) => {
          if (res && res.data) {
            console.log('[Test.tsx] Received updated user from backend:', {
              hasData: !!res.data,
              subjectData: res.data[finalData.subject] ? {
                cycle: res.data[finalData.subject].cycle,
                setIndex: res.data[finalData.subject].setIndex,
                nextSetSize: res.data[finalData.subject].nextSetSize
              } : 'NO_SUBJECT_DATA'
            });
            setUserData(res.data);
          }

          console.log('[Test.tsx] UPDATING STATE after submission:', {
            oldCycleIndex: cycleIndex,
            oldSetIndexInCycle: setIndexInCycle,
            newCycleIndex: nextCycle,
            newSetIndexInCycle: nextSetInCycle
          });
          setCycleIndex(nextCycle);
          setSetIndexInCycle(nextSetInCycle);

          setShowSuccess(true);
          setResultShown(true);

          setIsSubmitting(false);

          // FETCH NEXT SET with the CORRECT calculated size and indices
          setTimeout(() => {
            console.log('[Test.tsx] SubmitTest: FETCHING NEXT SET ', {
              nextCycle,
              nextSetInCycle,
              nextSetSize,
              usedIdsCount: usedIds.length,
              usedIdsFirst10: usedIds.slice(0, 10),
              usedIdsTypes: usedIds.slice(0, 5).map((id: any) => typeof id),
              aboutToCall: `fetchQuestions(0, usedIds[${usedIds.length}], 0, ${nextCycle}, ${nextSetInCycle}, ${nextSetSize})`
            });
            fetchQuestions(0, usedIds, 0, nextCycle, nextSetInCycle, nextSetSize);
            setMCQIdx(0);
            setArrNum(0);
            // Reset score counters for new set
            setCorrectQtsIds([]);
            setWrongQtsIds([]);
          }, 1000);
        })
        .catch((err) => {
          console.error('[Test.tsx] Error submitting test:', err);
          const serverMsg = err?.response?.data?.message;
          const status = err?.response?.status;
          Alert.alert('Error', serverMsg ? String(serverMsg) : `Failed to submit test results${status ? ` (HTTP ${status})` : ''}.`);
          setIsSubmitting(false);
        });
    } catch (error) {
      console.error('[Test.tsx] Unexpected error in SubmitTest:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const NumbericValues = () => {
    if (!MCQ || typeof MCQ !== 'object' || Object.keys(MCQ).length === 0) {
      console.warn('[Test.tsx] NumbericValues: MCQ is invalid or empty', MCQ);
      setNumericKeys([
        { 1: undefined },
        { 2: undefined },
        { 3: undefined },
        { 4: undefined },
      ]);
      return;
    }

    try {
      let numericKeysArray = [
        { 1: MCQ["1"] || undefined },
        { 2: MCQ["2"] || undefined },
        { 3: MCQ["3"] || undefined },
        { 4: MCQ["4"] || undefined },
      ];
      setNumericKeys(numericKeysArray);
    } catch (error) {
      console.error('[Test.tsx] Error in NumbericValues:', error);
      setNumericKeys([
        { 1: undefined },
        { 2: undefined },
        { 3: undefined },
        { 4: undefined },
      ]);
    }
  };

  // const buttonLongPressed = () => {
  //   if (userData.planValid) {
  //     setBookMarked(!bookMarked);
  //   } else {
  //     setTipShown(!tipShown);
  //   }
  // };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#2C4B48" }} edges={["bottom"]}>
      {/* Arrow Progress Bar */}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginTop: 52,
          paddingBottom: hp(1.5),
          paddingHorizontal: wp(2),
          borderBottomColor: "#0AB8AD",
          borderBottomWidth: wp(0.5),
        }}
      >
        <View style={{ flex: 1, marginRight: wp(2), justifyContent: 'center' }}>
          {/* Simple linear progress bar stretched to cup image */}
          <SimpleProgressBar
            progress={testStarted ? (correctQtsIds.length + wrongQtsIds.length) / MCQs.length * 100 : 0}
            height={hp(2.5)}
          />
        </View>
        <View style={{ width: wp(15), alignItems: 'center' }}>
          <Image
            source={VectorWin}
            style={{
              width: wp(12),
              height: wp(12),
            }}
          />
        </View>
      </View>
      <ScrollView style={styles.scrollView}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
          }}
        >
          <View
            style={{
              marginTop: hp(1),
            }}
          ></View>
          {/* {bookmarkData?.map((data, index) => {
              return ( */}
          {testStarted && MCQs.length > 0 && MCQIdx < Number(props.route.params?.params?.type) ? (
            <View style={styles.qusContainer}>
              {/* Question progress text */}
              <Text style={{ color: '#0AB8AD', fontWeight: 'bold', fontSize: hp(2), marginBottom: hp(1) }}>
                Question {MCQIdx + 1} of {Number(props.route.params?.params?.type)}
              </Text>
              {showTestMeta && String(MCQs?.[MCQIdx % MCQs.length]?.mcqId || props?.route?.params?.params?.reviewMcqId || '').trim() ? (
                <Text style={{ color: '#0AB8AD', fontWeight: '700', fontSize: hp(1.9), marginBottom: hp(1) }}>
                  MCQ ID: {String(MCQs?.[MCQIdx % MCQs.length]?.mcqId || props?.route?.params?.params?.reviewMcqId || '').trim()}
                </Text>
              ) : null}
              {MCQs && MCQs.length > 0 && <SplitStringValues centerTable={true} MCQ={MCQs[MCQIdx % MCQs.length]} keyName={"question"} />}
              {showTestMeta && String(MCQs?.[MCQIdx % MCQs.length]?.answer ?? '').trim() ? (
                <View style={{ width: '100%', alignItems: 'flex-end', marginTop: hp(0.5), marginBottom: hp(1) }}>
                  <Text style={{ color: '#C6CDD0', fontStyle: 'italic', fontSize: hp(1.9), textAlign: 'right' }}>
                    The correct option is {String(MCQs?.[MCQIdx % MCQs.length]?.answer).trim()}
                  </Text>
                </View>
              ) : null}

              {MCQs && MCQs.length > 0 && (
                <RadioButton
                  labelName={"option"}
                  MCQ={numericKeys}
                  keyName={""}
                  answer={MCQs[MCQIdx % MCQs.length].answer}
                  showAnswer={showAnswer}
                  setSelectedIndex={setSelectedIdx}
                  selectedIndex={selectedIndex}
                />
              )}
              {/* debug-only correct-answer rendering removed */}

              {/* Report issue removed */}

              {showAnswer && (
                <View style={styles.checkAnswerCon}>
                  <Text style={[styles.answerText, { fontWeight: "bold" }]}>Answer:</Text>
                  <Text
                    style={[
                      styles.showAnswerText,
                      {
                        fontWeight: "bold", // Make Correct/Wrong bold
                        color:
                          Number(MCQ.answer) == selectedIndex
                            ? COLORS.primary08
                            : "#FF7676",
                      },
                    ]}
                  >
                    {Number(MCQ.answer) == selectedIndex ? "Correct" : "Incorrect"}
                  </Text>
                </View>
              )}

              {showAnswer == true && (
                <View
                  style={{
                    backgroundColor: COLORS.secondary04,
                    marginTop: hp(2),
                    paddingVertical: hp(1.5),
                    paddingHorizontal: hp(2),
                    borderRadius: hp(1.5),
                    width: "100%",
                    alignSelf: "stretch",
                  }}
                >
                  <Text style={{ color: "#FFF", fontFamily: "Manrope-VariableFont_wght", fontSize: hp(2), textDecorationLine: "underline", textAlign: "justify", fontWeight: "bold", marginBottom: hp(1) }}>Explanation:</Text>
                  <SplitStringValues MCQ={MCQ} keyName={"explanation"} />
                </View>
              )}
              {showAnswer == true && MCQ.note && MCQ.note.value != "" && (
                <View
                  style={{
                    backgroundColor: COLORS.secondary04,
                    marginTop: hp(2),
                    paddingVertical: hp(1.5),
                    paddingHorizontal: hp(2),
                    borderRadius: hp(1.5),
                    width: "100%",
                    alignSelf: "stretch",
                  }}
                >
                  <Text style={{color: "#FFF", fontFamily: "Manrope-VariableFont_wght", fontSize: hp(2), textDecorationLine: "underline", textAlign: "justify", fontWeight: "bold", marginBottom: hp(1)}}>Note:</Text>
                  <SplitStringValues MCQ={MCQ} keyName={"note"} />
                </View>
              )}
            </View>
          ) : loadingQuestions ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Text style={{ color: '#0AB8AD', fontSize: hp(2) }}>Questions are loading, please wait...</Text>
            </View>
          ) : isSubmitting ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: hp(20) }}>
              <Text style={{ color: '#0AB8AD', fontSize: hp(2), fontWeight: 'bold' }}>Submitting your test…</Text>
              <Text style={{ color: '#0AB8AD', fontSize: hp(1.6), marginTop: hp(1) }}>Please wait a moment.</Text>
            </View>
          ) : (
            <></>
          )}
          {/* );
            })} */}
        </View>
      </ScrollView>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      >
        <View>
          <CheckButton
            onPress={() => {
              if (isReviewMode) return;
              if (!testStarted) return;
              const setSize = Number(props.route.params?.params?.type);
              if (selectedIndex != undefined && showAnswer == true) {
                // Prevent double-tap / stale-state duplicates (can cause 41/40, etc.)
                const dedupKey = getDedupKey(MCQ, MCQIdx);
                const payloadQuestionId = getQuestionIdForPayload(MCQ);

                if (answeredQuestionKeysRef.current.has(dedupKey)) {
                  console.log('[Test.tsx] Question already recorded, skipping:', dedupKey);
                } else {
                  answeredQuestionKeysRef.current.add(dedupKey);

                  if (!payloadQuestionId) {
                    console.warn('[Test.tsx] Missing valid ObjectId for question; skipping submit tracking:', { dedupKey, raw: MCQ?._id });
                  } else if (MCQ.answer == selectedIndex) {
                    setCorrectQtsIds((qtsIds) => [
                      ...qtsIds,
                      { questionId: payloadQuestionId, streak: `${selectedIndex}` },
                    ]);
                  } else {
                    setWrongQtsIds((wqts) => [
                      ...wqts,
                      { questionId: payloadQuestionId, streak: `${selectedIndex}` },
                    ]);
                  }
                }
                if (MCQIdx < MCQs.length - 1) {
                  setSelectedIdx(undefined);
                  setMCQIdx(MCQIdx + 1);
                  setMCQ(MCQs[MCQIdx + 1] || {});
                } else {
                  // End the test when all questions are answered
                  setTestStarted(false);
                  setIsSubmitting(true);
                  setSubmitTest(true);
                }
                setShowAnswer(false);
              } else if (selectedIndex != undefined) {
                setShowAnswer(true);
              }
            }}
            colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
            text={showAnswer == false ? "Check" : "Next"}
            disable={selectedIndex == undefined}
          />
        </View>
      </View>
      <Modal isOpen={showPopup}>
        <Modal.Content
          maxWidth={wp(95)}
          maxH={hp(85)}
          style={{
            borderWidth: wp(0.3),
            borderRadius: wp(2),
            borderColor: "#0AB8AD",
            display: "flex",
            alignItems: "center",
            width: wp(90),
            marginVertical: hp(2),
            paddingHorizontal: wp(3),
            paddingVertical: wp(3),
            backgroundColor: "rgba(47, 47, 47, 0.9)",
          }}
        >
          <Modal.Body style={{ width: "100%", paddingHorizontal: 0 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              {returnContent(props.route.params.params.type)}
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal isOpen={showRetry}>
        <Modal.Content
          style={{
            borderWidth: wp(0.3),
            borderRadius: wp(2),
            borderColor: "#0AB8AD",
            display: "flex",
            alignItems: "center",
            width: wp(100),
            height: hp(100),
            backgroundColor: "rgba(47, 47, 47, 0.9)",
          }}
        >
          <Pressable
            onPress={() => setShowRetry(false)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 2,
            }}
          >
            <Text
              style={{
                color: "gray",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              ×
            </Text>
          </Pressable>
          <Modal.Body style={{}}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginVertical: hp(4),
                width: wp(80),
                backgroundColor: "rgba(47, 47, 47, 0.4)",
              }}
            >
              {returnTestContent(props.route.params.params.type)}
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal isOpen={showSuccess}>
        <Modal.Content
          style={{
            borderWidth: wp(0.3),
            borderRadius: wp(2),
            borderColor: "#0AB8AD",
            display: "flex",
            alignItems: "center",
            width: wp(100),
            height: hp(100),
            backgroundColor: "#ffffffff",
          }}
        >
          <Pressable
            onPress={() => setShowSuccess(false)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 2,
            }}
          >
            <Text
              style={{
                color: "#ffffffff" === "#ffffffff" ? "#000" : "#fff",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              ×
            </Text>
          </Pressable>
          <Modal.Body style={{}}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginVertical: hp(4),
                width: wp(80),
                backgroundColor: "#ffffffff",
              }}
            >
              {showSuccessContent(props.route.params.params.type)}
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      {/* Report issue modal removed */}
      {/* <FreshStartPopup visible={showFreshStart} onClose={() => setShowFreshStart(false)} /> */}
    </SafeAreaView>
  );
};




export default Test;

const TestButton = ({
  onPress,
  style,
  colors,
  text,
  renderIcon,
  disable,
}: any) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disable}>
      {/* <LinearGradient style={[styles.card, styles.elevation]} colors={colors}  start={{ x: 0.6, y: 0.9}}
        end={{ x: 0.6, y: 0}} > */}

      <Lin
        style={[styles.card, styles.shadow]}
        colors={colors}
        start={{ x: 0.6, y: 0.3 }}
        end={{ x: 0.6, y: 0 }}
      >
        <Text style={styles.buttonTxt}>{text}</Text>
      </Lin>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    height: hp(90),
  },
  Img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    zIndex: 1000,
  },
  note: {
    color: COLORS.light,
    fontSize: hp(3),
    // fontWeight: "bold",
    fontFamily: "Manrope-VariableFont_wght",
    textAlign: "justify",
  },
  searchContainer: {
    display: "flex",
    backgroundColor: COLORS.grey,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(4),
    width: wp(90),
  },
  qusContainer: {
    width: wp(97),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2.8),
    paddingBottom: hp(4),
    borderRadius: hp(4),
    height: "auto",
  },
  qus: {
    fontSize: hp(1.9),
    alignItems: "center",
    justifyContent: "center",
    color: COLORS.light,
    fontFamily: "Manrope-VariableFont_wght",
    textAlign: "justify",
  },
  androidLarge57: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
    height: 800,
    width: "100%",
  },
  answerText: {
    fontSize: hp(2),
    color: COLORS.light,
    fontFamily: "Manrope-VariableFont_wght",
    textDecorationLine: "underline",
    textAlign: "justify",
  },
  showAnswerText: {
    fontSize: hp(2),
    fontFamily: "Manrope-VariableFont_wght",
    marginLeft: hp(1),
    fontWeight: "500",
    textAlign: "justify",
  },
  checkAnswerCon: {
    display: "flex",
    flexDirection: "row",
    marginTop: hp(2),
  },
  // BookmarkCon: {
  //   display: "flex",
  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   marginTop: hp(1),
  // },
  wrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flex: 0.2,
    alignItems: "center",
    paddingLeft: 29,
    paddingTop: 0,
    marginTop: 0,
  },
  rectangle: {
    width: wp(50),
    backgroundColor: "yellow",
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
    height: wp(8),
    borderColor: "black",
    borderTopWidth: 8,
    borderBottomWidth: 8,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: wp(7.5),
    borderRightWidth: wp(7.5),
    borderBottomWidth: wp(13),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ rotate: "90deg" }],
    borderBottomColor: "red",
  },
  elevation: {
    elevation: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    height: hp(4),
    // padding:15,
    width: wp(35),
    justifyContent: "center",
    alignItems: "center",
  },
  shadow: {
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonTxt: {
    fontSize: wp(4),
    textTransform: "uppercase",
    fontWeight: "600",
    color: COLORS.light,
    letterSpacing: wp(0.3),
    fontFamily: "Manrope-VariableFont_wght",
    textAlign: "center",
  },
  radioContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  radioLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioOuterCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#333", // Border color when not selected
    backgroundColor: "#fff", // Outer circle white when not selected
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  radioSelectedOuterCircle: {
    borderColor: "#333", // Same border when selected
  },
  radioInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#000", // Black inner circle when selected
  },
  radioOptionText: {
    fontSize: 16,
    color: "#0AB8AD",
    fontFamily: "Manrope-VariableFont_wght",
    textAlign: "left",
  },
  radioSelectedText: {
    marginTop: 20,
    fontSize: 16,
    color: "#0AB8AD",
    fontFamily: "Manrope-VariableFont_wght",
    textAlign: "left",
  },
  closeButtonStyle: {
    color: '#808080', // Gray color
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});