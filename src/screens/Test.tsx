import { View, Image, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Pressable, BackHandler, Alert, Animated, Easing } from 'react-native'
import { CustomVerticalScrollbar } from '../components/CustomVerticalScrollbar';
import { CustomText as Text, CustomTextInput as TextInput, CustomAnimatedText, CustomBoldText } from '../components/CustomText';
import { Modal } from "@gluestack-ui/themed-native-base";
import RadioButton from "../components/RadioButton";
import { LinearGradient as Lin } from "expo-linear-gradient";
// Simple linear progress bar
const SimpleProgressBar = ({ progress = 0, height = 16, style = {} }) => {
  const barHeight = height;
  const fillColor = '#0AB8AD';
  const bgColor = '#E0E0E0';
  return (
    <View style={[{ height: barHeight, backgroundColor: bgColor, borderRadius: barHeight / 2, overflow: 'hidden', justifyContent: 'center', width: '100%' }, style]}>
      <View style={{ width: `${Math.max(0, Math.min(progress, 100))}%`, height: barHeight, backgroundColor: fillColor, borderRadius: barHeight / 2 }} />
      <Text style={{ position: 'absolute', width: '100%', textAlign: 'center', color: '#333', fontFamily: 'AppFont-Bold', fontSize: barHeight * 0.7 }}>{`${Math.round(progress)}%`}</Text>
    </View>
  );
};
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from "react-native-safe-area-context";






// import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { COLORS } from "../styles/themes";
import { SplitStringValues } from "../service/DataShow";
import { ThemeContext } from "../service/authContext";
import { getTestStrategy } from "../services/testStrategies";
import { TestStrategy } from "../services/testStrategies/types";
import { axiosInstance } from "../config/indeceptor";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import CheckButton from "../components/CheckButton";
import { scheduleInactivityReminder } from "../service/NotificationService";




import { Defs, LinearGradient, Path, Rect, Stop, Svg } from "react-native-svg";
import SuccessView from "../components/SuccessView";
import RetryView from "../components/RetryView";
import TestButton from "../components/TestButton";



const Test = (props: any) => {
  const reviewMcqIdRaw = props?.route?.params?.params?.reviewMcqId;
  const isReviewMode = !!(typeof reviewMcqIdRaw === 'string' && reviewMcqIdRaw.trim());
  const reviewMcqId = isReviewMode ? String(reviewMcqIdRaw).trim() : "";

  // const [bookMarked, setBookMarked] = useState(false);
  const VectorWin = require("../../assets/winning.png");

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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const context = React.useContext(ThemeContext);
  const {
    userData,
    setUserData,
    signUpData,
    setSignUpData,
    appState,
    setAppState } = context;
  const isTesterBuildUser = ['tester', 'tct', 'teacher come tester'].includes(String(userData?.accType || '').trim().toLowerCase());
  const showTestMeta = isReviewMode || isTesterBuildUser;

  const [finalData, setFinalData] = useState<any>({
    subjectId: props.route.params?.params?.subjectId || '',
    testId: props.route.params?.params?.testId || '',
    scores: 0,
    subject: props.route.params?.params?.subject || 'chemistry',
    correctQtsId: [],
    wrongQtsId: []
  });
  const [score, setScore] = useState(0);
  const [correctQtsIds, setCorrectQtsIds] = useState<any[]>([]);
  const [wrongQtsIds, setWrongQtsIds] = useState<any[]>([]);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submittedWrong, setSubmittedWrong] = useState<number | null>(null);
  const [submittedTotal, setSubmittedTotal] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedIndex, setSelectedIdx] = useState(undefined);


  const [tipShown, setTipShown] = React.useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [resultShown, setResultShown] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showAnimated, setshowAnimated] = useState(false);
  const [showOptionsCard, setShowOptionsCard] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [issueDescription, setIssueDescription] = useState("");
  const [lastPoints, setLastPoints] = useState(0);

  const scrollbarRef = useRef<any>(null);

  useEffect(() => {
    if (scrollbarRef.current) {
      // Reset scroll position to top instantly when question changes
      scrollbarRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [MCQIdx]);



  const reportTypes = [
    "Equation Issue",
    "Spelling Mistake",
    "Wrong Answer",
    "Images Missing/Unclear",
    "Other",
  ];

  const strategy = useMemo(() => {
    if (isReviewMode) return null;
    const std = props.route.params?.params?.std || userData?.std;
    const isPaid = userData?.planValid || false;
    const subject = props.route.params?.params?.subject || 'neet';

    if (std && userData) {
      return getTestStrategy({ std, planValid: isPaid }, subject);
    }
    return null;
  }, [userData?.std, userData?.planValid, props.route.params?.params?.subject, isReviewMode]);

  const [arrNum, setArrNum] = useState(0); // Define state for `arrNum`

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFailed, setSubmitFailed] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Sanitize test size for display and logic
  const rawTestType = Number(props.route.params?.params?.type) || 20;
  const testType = (!userData?.planValid && rawTestType > 40) ? 40 : rawTestType;

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

  // Initialize indices once or when subject changes, and fetch initial questions with restored values
  useEffect(() => {
    if (isReviewMode || !userData || !strategy) return;

    const initializeTest = async () => {
      // Avoid re-fetching if we already have questions or if we are already loading
      if (MCQs.length > 0 || loadingQuestions) return;

      try {
        const resetKey = await AsyncStorage.getItem('progressResetV2');
        if (!resetKey) {
          await AsyncStorage.setItem('progressResetV2', 'true');
          console.log('User progress reset marker set.');
        }
      } catch (e) {
        console.log('Error checking or setting progress reset key:', e);
      }

      const subject = props.route.params?.params?.subject || 'neet';
      let c = 0;
      let s = 0;

      if (userData[subject]) {
        c = userData[subject].cycle || 0;
        s = userData[subject].setIndex || 0;
      }

      console.log(`[Test.tsx] INITIAL INDICES RESTORED AND FETCHING: cycle=${c}, setIndex=${s}`);
      setCycleIndex(c);
      setSetIndexInCycle(s);

      fetchQuestions(0, usedIds, 0, c, s);
      setOffset(0);
    };

    initializeTest();
  }, [props.route.params?.params?.subject, strategy, userData]);

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

  // Warn user before leaving the test screen (hardware back or navigation)
  const navigationActionRef = useRef<any>(null);
  const isExitingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isExitingRef.current) return false;
        // Only show warning if test is active (started but not completed)
        if (testStarted && !resultShown && !showSuccess && !showRetry) {
          navigationActionRef.current = null;
          setShowExitConfirm(true);
          return true; // prevent default back behavior
        }
        return false; // allow normal back navigation
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
      };
    }, [testStarted, resultShown, showSuccess, showRetry])
  );

  // Warn user before navigating away via UI
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (isExitingRef.current) return;
      // Only show warning if test is active (started but not completed)
      if (testStarted && !resultShown && !showSuccess && !showRetry) {
        e.preventDefault();
        navigationActionRef.current = e.data.action;
        setShowExitConfirm(true);
      }
    });

    return unsubscribe;
  }, [navigation, testStarted, resultShown, showSuccess, showRetry]);

  const handleExitConfirm = () => {
    isExitingRef.current = true;
    setShowExitConfirm(false);
    if (navigationActionRef.current) {
      navigation.dispatch(navigationActionRef.current);
    } else {
      // Use goBack to pop the Test screen from stack. 
      // If we can't go back, reset the stack to BottomBar to avoid loops.
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'BottomBar' }]
        });
      }
    }
  };

  const handleStayInTest = () => {
    navigationActionRef.current = null;
    setShowExitConfirm(false);
  };

  // Review mode: fetch a single MCQ by mcqId and show answer + explanation
  useEffect(() => {
    if (!isReviewMode) return;

    let cancelled = false;

    const run = async () => {
      try {
        setLoadingQuestions(true);

        const res = await axiosInstance.get("authentication/questions/batch", {
          params: { mcqIds: reviewMcqId }
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
      let type = forcedType || props.route.params?.params?.type;

      // SAFETY: If a user's subscription expires while they are in a test 
      // or if they deep-link into a large test as a free user, cap the size to 40.
      if (userData && !userData.planValid && Number(type) > 40) {
        console.warn('[Test.tsx] Capping test size to 40 for free user.');
        type = 40;
      }

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
              isDelete: q?.isDelete
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
              has4: !!q["4"]
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
            fontFamily: 'AppFont-Regular', fontSize: hp(1.68),
            textAlign: "center",
            lineHeight: hp(2.4),
            width: "100%"
          }}
        >
          This exercise contains {Number(testType)}-MCQs
        </Text>
        <Text
          style={{
            color: "#0AB8AD",
            fontFamily: 'AppFont-Regular', fontSize: hp(1.68),
            textAlign: "center",
            lineHeight: hp(2.4),
            width: "100%",
            marginBottom: hp(1)
          }}
        >
          Would you like to continue?
        </Text>
        <Text
          style={{
            color: "#0AB8AD",
            fontFamily: 'AppFont-Regular', fontSize: hp(1.68),
            textAlign: "center",
            lineHeight: hp(2.4),
            width: "100%",
            marginTop: hp(1.5)
          }}
        >
          Note: you need to correctly answer at least {Math.ceil(Number(testType) / 2)} questions to pass this test
        </Text>
        {Number(testType) >= 180 && (
          <Text
            style={{
              color: "#0AB8AD",
              marginTop: hp(1.5),
              fontFamily: 'AppFont-Regular', fontSize: hp(1.68),
              textAlign: "center",
              lineHeight: hp(2.4),
              width: "100%"
            }}
          >
            This exercise time limit is 3 hours 20 minutes
          </Text>
        )}
        <Text style={{
          color: '#0AB8AD',
          fontFamily: 'AppFont-Regular', fontSize: hp(1.5),
          textAlign: 'center',
          lineHeight: hp(2.2),
          width: '100%',
          marginTop: hp(1.5)
        }}>
          Some questions may be wider than your screen ➡️ look for the ⬅️ symbol and scroll sideways to view them.
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: hp(3),
            width: "100%"
          }}
        >
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
            text={<Text style={{ fontFamily: 'AppFont-Bold',fontSize:wp(4.5) }}>{loadingQuestions ? "Loading..." : "Continue"}</Text>}
            disable={loadingQuestions}
            style={{ width: wp(55), height: hp(5), borderRadius: 28 }}
          />
        </View>
      </View>
    );
  };





  const SubmitTest = () => {
    try {
      if (resultShown) {
        return;
      }
      const setSize = testType;
      if (!setSize || isNaN(setSize)) {
        console.error('[Test.tsx] Invalid setSize:', setSize);
        Alert.alert('Error', 'Invalid test configuration. Please try again.');
        setIsSubmitting(false);
        return;
      }
      const effectiveSize = Math.min(setSize, MCQs.length > 0 ? MCQs.length : setSize);
      const passMark = Math.ceil(effectiveSize / 2);
      const passed = correctQtsIds.length >= passMark;

      // Persist score for the result modal (we reset correct/wrong arrays shortly after to preload next set)
      setSubmittedScore(correctQtsIds.length);
      setSubmittedWrong(wrongQtsIds.length);
      setSubmittedTotal(effectiveSize);

      const totalAnswered = correctQtsIds.length + wrongQtsIds.length;
      const answeredAll = totalAnswered >= effectiveSize;



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

      // Enforce no progression if they failed (but answered all)
      if (!passed) {
        nextCycle = cycleIndex;
        nextSetInCycle = setIndexInCycle;
        nextSetSize = setSize;
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
        questionIds: questionIdsForSubmit
      };

      console.log('[Test.tsx] SubmitTest - SENDING PAYLOAD:', submitPayload);

      setIsSubmitting(true);
      AsyncStorage.setItem('pending_test_submit', JSON.stringify(submitPayload)).catch(err => {
        console.error('[Test.tsx] Error saving pending test to AsyncStorage:', err);
      });

      axiosInstance
        .post("/authentication/test/submit", submitPayload)
        .then((res: any) => {
          AsyncStorage.removeItem('pending_test_submit').catch(() => {});
          if (res && res.data) {
            console.log('[Test.tsx] Received updated user from backend:', {
              hasData: !!res.data,
              subjectData: res.data[finalData.subject] ? {
                cycle: res.data[finalData.subject].cycle,
                setIndex: res.data[finalData.subject].setIndex,
                nextSetSize: res.data[finalData.subject].nextSetSize
              } : 'NO_SUBJECT_DATA'
            });

            // Extract points earned for this test
            try {
              // Reliable way: compare updated rewards earned total with old total
              // Based on Rewards.tsx, rewards is an object: { current, earned, redeemed, closing }
              const newEarned = Number(res.data?.rewards?.earned || 0);
              const oldEarned = Number(userData?.rewards?.earned || 0);
              const earned = newEarned - oldEarned;

              if (earned > 0) {
                setLastPoints(earned);
                console.log('[Test.tsx] Calculated points from rewards.earned diff:', earned);
              } else {
                // Fallback 1: check current balance diff
                const newCurrent = Number(res.data?.rewards?.current || 0);
                const oldCurrent = Number(userData?.rewards?.current || 0);
                const currentDiff = newCurrent - oldCurrent;
                if (currentDiff > 0) {
                  setLastPoints(currentDiff);
                } else {
                  // Fallback 2: searching in scores array
                  const subject = finalData.subject;
                  const scoresRaw = res.data[subject]?.scores;
                  const scoresArr = Array.isArray(scoresRaw)
                    ? scoresRaw
                    : typeof scoresRaw === 'string'
                      ? JSON.parse(scoresRaw || '[]')
                      : [];

                  if (scoresArr.length > 0) {
                    const lastTest = scoresArr[scoresArr.length - 1];
                    setLastPoints(Number(lastTest?.rewardPoints || lastTest?.points || 0));
                  }
                }
              }
            } catch (err) {
              console.error('[Test.tsx] Error parsing reward points:', err);
            }

            setUserData(res.data);
          }

          // Explicitly fetch user data to get updated streak counts
          // Using a slight delay to ensure DB triggers have finished
          setTimeout(() => {
            axiosInstance.get("authentication/user")
              .then((userRes) => {
                if (userRes?.data) {
                  setUserData(userRes.data);
                }
              })
              .catch(() => {});
          }, 500);

          if (!passed) {
            setShowRetry(true);
            setResultShown(true);
            setIsSubmitting(false);
            return;
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
          
          // Schedule inactivity reminder for 12 hours from now
          // scheduleInactivityReminder();

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
          setSubmitFailed(true);
        });
    } catch (error) {
      console.error('[Test.tsx] Unexpected error in SubmitTest:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleReportIssue = async () => {
    if (!selectedReportType) {
      Alert.alert("Error", "Please select an issue type.");
      return;
    }

    setReportSubmitting(true);
    try {
      const currentMCQ = MCQs[MCQIdx];
      const payload = {
        userName: userData?.name || userData?.firstName || "Unknown User",
        userId: userData?._id || userData?.id || "Unknown ID",
        issueType: selectedReportType,
        description: selectedReportType === "Other" ? issueDescription : undefined,
        mcqId: currentMCQ?.mcqId || "N/A",
        questionId: getQuestionIdForPayload(currentMCQ) || "N/A"
      };

      await axiosInstance.post("/issue-reports", payload);
      Alert.alert("Success", "Issue reported successfully. Thank you for your feedback!");
      setShowReportModal(false);
      setSelectedReportType("");
      setIssueDescription("");
    } catch (error: any) {
      console.error("Error reporting issue:", error);
      Alert.alert("Error", "Failed to report issue. Please try again later.");
    } finally {
      setReportSubmitting(false);
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
          borderBottomWidth: wp(0.5)
        }}
      >
        <TouchableOpacity
          onPress={() => setShowOptionsCard(!showOptionsCard)}
          style={{ padding: wp(2) }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#0AB8AD" />
        </TouchableOpacity>
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
              height: wp(12)
            }}
          />
        </View>
      </View>

      {/* Floating Card for Options */}
      {showOptionsCard && (
        <Pressable
          style={[StyleSheet.absoluteFill, { zIndex: 999 }]}
          onPress={() => setShowOptionsCard(false)}
        />
      )}
      {showOptionsCard && (
        <View style={{
          position: 'absolute',
          top: 110,
          left: wp(4),
          backgroundColor: '#2C4B48',
          borderRadius: wp(2),
          padding: wp(1.5),
          zIndex: 1000,
          borderWidth: 1,
          borderColor: '#0AB8AD',
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5
        }}>
          <TouchableOpacity
            onPress={() => setShowOptionsCard(false)}
            style={{
              position: 'absolute',
              top: -5,
              right: 2,
              padding: 5,
              zIndex: 1001
            }}
          >
            <CustomBoldText style={{ color: '#0AB8AD', fontSize: 18 }}>×</CustomBoldText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowOptionsCard(false);
              setShowReportModal(true);
            }}
            style={{
              paddingVertical: hp(1),
              paddingHorizontal: wp(4),
              marginTop: hp(0.5),
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Ionicons name="flag-outline" size={18} color="#0AB8AD" />
            <CustomBoldText style={{ color: '#0AB8AD', marginLeft: wp(2) }}>Report Issue</CustomBoldText>
          </TouchableOpacity>
        </View>
      )}
      <CustomVerticalScrollbar
        ref={scrollbarRef}
        indicatorColor="hsla(185, 100%, 93%, 1.00)"
        style={{ flex: 1 }}
        alwaysBounceVertical={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center"
          }}
        >
          <View
            style={{
              marginTop: hp(1)
            }}
          ></View>
          {/* {bookmarkData?.map((data, index) => {
              return ( */}
          {testStarted && MCQs.length > 0 && MCQIdx < testType ? (
            <View style={styles.qusContainer}>
              {/* Question progress text */}
              <Text style={{ color: '#0AB8AD', fontFamily: 'AppFont-Bold', fontSize: hp(2), marginBottom: hp(1) }}>
                Question {MCQIdx + 1} of {testType}
              </Text>
              {showTestMeta && String(MCQs?.[MCQIdx % MCQs.length]?.mcqId || props?.route?.params?.params?.reviewMcqId || '').trim() ? (
                <Text style={{ color: '#0AB8AD', fontFamily: 'AppFont-Bold', fontSize: hp(1.9), marginBottom: hp(1) }}>
                  MCQ ID: {String(MCQs?.[MCQIdx % MCQs.length]?.mcqId || props?.route?.params?.params?.reviewMcqId || '').trim()}
                </Text>
              ) : null}
              {MCQs && MCQs.length > 0 && <SplitStringValues centerTable={true} MCQ={MCQs[MCQIdx % MCQs.length]} keyName={"question"} />}
              {showTestMeta && String(MCQs?.[MCQIdx % MCQs.length]?.answer ?? '').trim() ? (
                <View style={{ width: '100%', alignItems: 'flex-start', marginTop: hp(0.5), marginBottom: hp(1), paddingHorizontal: wp(2) }}>
                  <Text style={{ color: '#C6CDD0', fontFamily: 'AppFont-Regular', fontSize: hp(1.9), textAlign: 'left'}}>
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
                  <Text style={[styles.answerText, { fontFamily: 'AppFont-Bold' }]}>Answer:</Text>
                  <CustomBoldText
                    style={[
                      styles.showAnswerText,
                      {
                        color:
                          Number(MCQ.answer) == selectedIndex
                            ? COLORS.primary08
                            : "#FF7676",
                      },
                    ]}
                  >
                    {Number(MCQ.answer) == selectedIndex ? "Correct" : "Incorrect"}
                  </CustomBoldText>
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
                    alignSelf: "stretch"
                  }}
                >
                  <Text style={{ color: "#FFF", fontFamily: 'AppFont-Bold', fontSize: hp(2), textDecorationLine: "underline", textAlign: "justify", marginBottom: hp(1) }}>Explanation:</Text>
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
                    alignSelf: "stretch"
                  }}
                >
                  <Text style={{ color: "#FFF", fontFamily: 'AppFont-Bold', fontSize: hp(2), textDecorationLine: "underline", textAlign: "justify", marginBottom: hp(1) }}>Note:</Text>
                  <SplitStringValues MCQ={MCQ} keyName={"note"} />
                </View>
              )}
            </View>
          ) : loadingQuestions ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Text style={{ color: '#0AB8AD', fontFamily: 'AppFont-Bold', fontSize: hp(2) }}>Questions are loading, please wait...</Text>
            </View>
          ) : isSubmitting ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: hp(20) }}>
              <Text style={{ color: '#0AB8AD', fontFamily: 'AppFont-Regular', fontSize: hp(2) }}>Submitting your test!!</Text>
              <Text style={{ color: '#0AB8AD', fontFamily: 'AppFont-Regular', fontSize: hp(1.6), marginTop: hp(1) }}>Please wait a moment.</Text>
            </View>
          ) : submitFailed ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: hp(15), paddingHorizontal: wp(5) }}>
              <Text style={{ color: '#F2C112', fontFamily: 'AppFont-Bold', fontSize: hp(2.4), textAlign: 'center', marginBottom: hp(1) }}>Submission Failed</Text>
              <Text style={{ color: '#0AB8AD', fontFamily: 'AppFont-Regular', fontSize: hp(1.8), textAlign: 'center', marginBottom: hp(3), lineHeight: hp(2.5) }}>
                We could not submit your test results due to an internet connection issue. Please reconnect and try again.
              </Text>
              <TouchableOpacity
                disabled={!isConnected}
                onPress={() => {
                  setSubmitFailed(false);
                  SubmitTest();
                }}
                style={{
                  backgroundColor: isConnected ? '#0AB8AD' : '#888888',
                  paddingVertical: hp(1.5),
                  paddingHorizontal: wp(8),
                  borderRadius: hp(1),
                  elevation: isConnected ? 3 : 0,
                  opacity: isConnected ? 1 : 0.6
                }}
              >
                <Text style={{ color: '#FFF', fontFamily: 'AppFont-Bold', fontSize: hp(1.8) }}>
                  {isConnected ? "Retry Submission" : "No Internet Connection"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <></>
          )}
          {/* );
            })} */}
        </View>
      </CustomVerticalScrollbar>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly"
        }}
      >
        {(!isSubmitting && !submitTest && !submitFailed) && (
          <View>
            <CheckButton
              onPress={() => {
                if (isReviewMode) return;
                if (!testStarted) return;
                const setSize = testType;
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
        )}
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
            backgroundColor: "rgba(47, 47, 47, 0.9)"
          }}
        >
          <TouchableOpacity
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
              answeredQuestionKeysRef.current = new Set();
              if (navigation && typeof navigation.reset === 'function') {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'BottomBar' }]
                });
              } else if (navigation && typeof navigation.navigate === 'function') {
                navigation.navigate("BottomBar", { screen: "Home" });
              }
            }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            style={{
              position: "absolute",
              top: 10,
              right: 15,
              zIndex: 9999
            }}
          >
            <CustomBoldText
              style={{
                color: "#0AB8AD",
                fontSize: 28
              }}
            >
              ×
            </CustomBoldText>
          </TouchableOpacity>
          <Modal.Body style={{ width: "100%", paddingHorizontal: 0 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: "100%"
              }}
            >
              {returnContent(testType)}
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal isOpen={showRetry}>
        <Modal.Content
          style={{
            borderWidth: 0,
            borderRadius: 0,
            width: wp(100),
            height: hp(100),
            backgroundColor: COLORS.secondary02,
            padding: 0
          }}
        >
          <RetryView
            displayScore={submittedScore ?? correctQtsIds.length}
            displayTotal={submittedTotal ?? Number(props.route.params.params.type)}
            onRetry={() => {
              const setSize = Number(props.route.params?.params?.type);
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
              setUsedIds([]);
              setOffset(0);
              fetchQuestions(0, [], 0, cycleIndex, setIndexInCycle, setSize);
              setTestStarted(true);
            }}
            onGoBack={() => {
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
              if (navigation && typeof navigation.reset === 'function') {
                navigation.reset({ index: 0, routes: [{ name: 'BottomBar' }] });
              } else if (navigation && typeof navigation.navigate === 'function') {
                navigation.navigate("BottomBar", { screen: "Home" });
              }
            }}
            result={props.route.params.params.type}
            userData={userData}
            finalData={finalData}
            std={props.route.params.params.std}
            submittedWrong={submittedWrong}
            wrongQtsIds={wrongQtsIds}
            navigation={navigation}
          />
        </Modal.Content>
      </Modal>
      <Modal isOpen={showSuccess}>
        <Modal.Content
          style={{
            borderWidth: 0,
            borderRadius: 0,
            width: wp(100),
            height: hp(100),
            backgroundColor: "#ffffffff",
            padding: 0
          }}
        >
          <SuccessView
            showSuccess={showSuccess}
            userData={userData}
            displayScore={submittedScore ?? correctQtsIds.length}
            displayTotal={submittedTotal ?? Number(props.route.params.params.type)}
            submittedWrong={submittedWrong}
            wrongQtsIds={wrongQtsIds}
            lastPoints={lastPoints}
            finalData={finalData}
            navigation={navigation}
            setShowSuccess={setShowSuccess}
            setSubmittedScore={setSubmittedScore}
            setSubmittedWrong={setSubmittedWrong}
            setSubmittedTotal={setSubmittedTotal}
            std={props.route.params.params.std}
          />
        </Modal.Content>
      </Modal>
      {/* Report issue modal removed */}
      {/* <FreshStartPopup visible={showFreshStart} onClose={() => setShowFreshStart(false)} /> */}
      <Modal isOpen={showExitConfirm}>
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
            backgroundColor: "rgba(47, 47, 47, 0.9)"
          }}
        >
          <Modal.Body style={{ width: "100%", paddingHorizontal: 0 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: "100%"
              }}
            >
              <View style={{ alignItems: "center", width: "100%" }}>
                <Text
                  style={{
                    color: "#0AB8AD",
                    fontFamily: 'AppFont-Bold', fontSize: hp(2.2),
                    textAlign: "center",
                    lineHeight: hp(2.8),
                    width: "100%",
                    marginBottom: hp(1)
                  }}
                >
                  Leave test?
                </Text>
                <Text
                  style={{
                    color: "#0AB8AD",
                    fontFamily: 'AppFont-Regular', fontSize: hp(1.68),
                    textAlign: "center",
                    lineHeight: hp(2.4),
                    width: "100%",
                    marginBottom: hp(2)
                  }}
                >
                  It looks like your test is still incomplete. Do you want to exit?
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: hp(2),
                    columnGap: wp(2),
                    width: "100%",
                    rowGap: hp(1)
                  }}
                >
                  <View style={{ flex: 1, minWidth: wp(35), maxWidth: wp(40) }}>
                    <TestButton
                      onPress={handleStayInTest}
                      colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
                      text={<Text style={{ fontFamily: 'AppFont-Bold' }}>Stay</Text>}
                    />
                  </View>
                  <View style={{ flex: 1, minWidth: wp(35), maxWidth: wp(40) }}>
                    <TestButton
                      onPress={handleExitConfirm}
                      colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
                      text={<Text style={{ fontFamily: 'AppFont-Bold' }}>Exit</Text>}
                    />
                  </View>
                </View>
              </View>
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal isOpen={showReportModal} onClose={() => { setShowReportModal(false); setSelectedReportType(""); setIssueDescription(""); }}>
        <Modal.Content
          maxWidth={wp(90)}
          style={{
            borderWidth: 1,
            borderRadius: wp(3),
            borderColor: "#0AB8AD",
            backgroundColor: "#242424", // More solid background
            padding: wp(4)
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setShowReportModal(false);
              setIssueDescription("");
              setSelectedReportType("");
            }}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            style={{
              position: "absolute",
              top: 10,
              right: 15,
              zIndex: 9999
            }}
          >
            <CustomBoldText
              style={{
                color: "#0AB8AD",
                fontSize: 28
              }}
            >
              ×
            </CustomBoldText>
          </TouchableOpacity>
          <Modal.Header style={{ backgroundColor: 'transparent', borderBottomWidth: 0, paddingRight: wp(10) }}>
            <Text style={{ color: "#0AB8AD", fontFamily: 'AppFont-Regular', fontSize: hp(2.2) }}>Report an Issue</Text>
          </Modal.Header>
          <Modal.Body>
            <Text style={{ color: "#E0E0E0", fontFamily: 'AppFont-Regular', fontSize: hp(1.8), marginBottom: hp(2) }}>
              What's wrong with this question?
            </Text>
            {reportTypes.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedReportType(type)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: hp(1.2),
                  borderBottomWidth: 0.5,
                  borderBottomColor: 'rgba(10, 184, 173, 0.3)'
                }}
              >
                <View style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#0AB8AD',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: wp(3)
                }}>
                  {selectedReportType === type && (
                    <View style={{
                      height: 10,
                      width: 10,
                      borderRadius: 5,
                      backgroundColor: '#0AB8AD'
                    }} />
                  )}
                </View>
                <CustomBoldText style={{ color: selectedReportType === type ? '#0AB8AD' : '#E0E0E0', fontSize: hp(1.9) }}>
                  {type}
                </CustomBoldText>
              </TouchableOpacity>
            ))}
            {selectedReportType === "Other" && (
              <View style={{ marginTop: hp(2) }}>
                <TextInput
                  placeholder="Tell us what's wrong..."
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={issueDescription}
                  onChangeText={setIssueDescription}
                  multiline
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: wp(2),
                    padding: wp(3),
                    color: '#FFF',
                    height: hp(12),
                    textAlignVertical: 'top',
                    borderWidth: 1,
                    borderColor: 'rgba(10, 184, 173, 0.5)'
                  }}
                />
              </View>
            )}
          </Modal.Body>
          <Modal.Footer style={{ backgroundColor: 'transparent', borderTopWidth: 0, justifyContent: 'space-between', flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() => {
                setShowReportModal(false);
                setIssueDescription("");
                setSelectedReportType("");
              }}
              style={{ paddingVertical: hp(1), paddingHorizontal: wp(4) }}
            >
              <CustomBoldText style={{ color: '#FFF' }}>Cancel</CustomBoldText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReportIssue}
              disabled={reportSubmitting || !selectedReportType || (selectedReportType === "Other" && !issueDescription.trim())}
              style={{
                backgroundColor: '#0AB8AD',
                paddingVertical: hp(1),
                paddingHorizontal: hp(6),
                borderRadius: wp(1),
                opacity: reportSubmitting || !selectedReportType || (selectedReportType === "Other" && !issueDescription.trim()) ? 0.5 : 1
              }}
            >
              <CustomBoldText style={{ color: '#FFF' }}>
                {reportSubmitting ? "Submitting..." : "Submit"}
              </CustomBoldText>
            </TouchableOpacity>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </SafeAreaView>
  );
};




export default Test;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  scrollView: {
    height: hp(90)
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(2)
  },
  Img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    zIndex: 1000
  },
  note: {

    color: COLORS.light,
    fontFamily: 'AppFont-Regular', fontSize: hp(3),
  },
  searchContainer: {
    display: "flex",
    backgroundColor: COLORS.grey,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(4),
    width: wp(90)
  },
  qusContainer: {
    width: wp(97),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2.8),
    paddingBottom: hp(4),
    borderRadius: hp(4),
    height: "auto"
  },
  qus: {

    fontFamily: 'AppFont-Regular', fontSize: hp(1.9),
    alignItems: "center",
    justifyContent: "center",
    color: COLORS.light,
    textAlign: "justify",
    lineHeight: hp(3)
  },
  androidLarge57: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
    height: 800,
    width: "100%"
  },
  answerText: {

    fontFamily: 'AppFont-Regular', fontSize: hp(2),
    color: COLORS.light,
    textDecorationLine: "underline",
    textAlign: "justify",
    lineHeight: hp(3)
  },
  showAnswerText: {

    fontFamily: 'AppFont-Regular', fontSize: hp(2),
    marginLeft: hp(1),
    textAlign: "justify"
  },
  checkAnswerCon: {
    display: "flex",
    flexDirection: "row",
    marginTop: hp(2)
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
    marginTop: 0
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
    borderBottomWidth: 8
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
    borderBottomColor: "red"
  },
  radioContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  radioLabel: {
    fontFamily: 'AppFont-Regular', fontSize: 18,
    marginBottom: 10
  },
  radioGroup: {
    marginBottom: 20
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
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
    marginRight: 10
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
    fontFamily: 'AppFont-Regular', fontSize: 16,
    color: "#0AB8AD",
    textAlign: "left"
  },
  radioSelectedText: {
    marginTop: 20,
    fontFamily: 'AppFont-Regular', fontSize: 16,
    color: "#0AB8AD",
    textAlign: "left"
  },
  closeButtonStyle: {
    color: '#808080', // Gray color
    fontFamily: 'AppFont-Regular', fontSize: 18,
    textAlign: 'center',
  },
});
