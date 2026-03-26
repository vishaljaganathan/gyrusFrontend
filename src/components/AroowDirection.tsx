import React, { useContext, useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { COLORS } from "../styles/themes";
import { useNavigation } from "@react-navigation/native";
import { axiosInstance } from "../config/indeceptor";
import { ThemeContext } from "../service/authContext";
import { getTestStrategy } from "../services/testStrategies";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SingleStage from "./SingleStage";
import StartButton from "./StartButton";

const Arrows = ({ subName, track }: { track: any; subName: string }) => {
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
    setAppState,
  } = themeContext;

  const scrollBottomRef = useRef<ScrollView | null>(null);
  const { height } = Dimensions.get("window");
  useEffect(() => {
    setStageTrack(track);
    if (track.length == 0) {
      scrollBottomRef.current?.scrollToEnd({ animated: true });
    }
  }, [track]);
  const dummyData = ["", "", "", ""];

  const navigation: any = useNavigation();

  // Store next set size for Start button
  const [nextSetSize, setNextSetSize] = useState(20);

  const normalizePositiveNumber = (value: any): number | null => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const normalizeNonNegativeInt = (value: any): number | null => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.floor(n);
  };

  const getDefaultSizeForSubject = (subject: string): number => {
    const s = String(subject || '').trim().toLowerCase();
    return s === 'neet' ? 100 : 20;
  };

  const getDerivedNextSizeFromProgress = (subjectState: any, subject: string): number | null => {
    const idx = normalizeNonNegativeInt(subjectState?.setIndex);
    if (idx === null) return null;

    try {
      const strategy = getTestStrategy(
        { std: userData?.std, planValid: !!userData?.planValid },
        subject
      );
      const pattern = strategy?.getCyclePattern ? strategy.getCyclePattern(userData?.std, subject) : null;
      if (Array.isArray(pattern) && pattern.length > 0) {
        return pattern[idx % pattern.length];
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

    // 1) Prefer explicit nextSetSize saved on user state
    const storedNext = normalizePositiveNumber(subjectState?.nextSetSize);
    if (storedNext !== null) {
      setTestSize(storedNext);
      setNextSetSize(storedNext);
      setIsNextSetSizeReady(true);
      return;
    }

    // 2) If nextSetSize is missing, derive from saved progress (setIndex + strategy pattern)
    const derivedNext = getDerivedNextSizeFromProgress(subjectState, homeSubject);
    if (derivedNext !== null) {
      setTestSize(derivedNext);
      setNextSetSize(derivedNext);
      setIsNextSetSizeReady(true);
      return;
    }

    axiosInstance
      .get(`authentication/test-track/${subjectState.testId}`)
      .then((res) => {
        const serverType = normalizePositiveNumber(res.data?.testType);
        const size = serverType ?? getDefaultSizeForSubject(homeSubject);
        setTestSize(size);
        setNextSetSize(size);
        setIsNextSetSizeReady(true);
      })
      .catch((err) => {
        console.error('[AroowDirection.tsx] Error fetching test-track:', err);
        setIsNextSetSizeReady(true); // Allow rendering even if the request fails
      });
  }, [userData, appState?.home]);

  const StartTest = () => {
    // Final client-side gate: free users cannot start individual subjects.
    const homeSubject = (appState?.home || 'neet').toString().toLowerCase();
    if (!userData?.planValid && homeSubject !== 'neet') {
      setLoading(false);
      navigation.navigate('Plans');
      return;
    }

    // Safety check before accessing userData
    if (!userData || !appState?.home || !userData[appState.home]) {
      console.error('[AroowDirection.tsx] StartTest: userData or appState.home is undefined, cannot start test');
      setLoading(false);
      return;
    }

    const subjectState = userData[appState.home];
    if (!subjectState.testId || !subjectState.subjectId) {
      console.error('[AroowDirection.tsx] StartTest: Missing testId or subjectId');
      setLoading(false);
      return;
    }

    setLoading(true);

    const storedNext = normalizePositiveNumber(subjectState?.nextSetSize);
    const derivedNext = getDerivedNextSizeFromProgress(subjectState, homeSubject);
    // Prefer what the UI shows / strategy derives, then fall back to current state/default.
    const preferredClientSize = storedNext ?? derivedNext ?? null;
    const fallbackSize = preferredClientSize ?? nextSetSize ?? getDefaultSizeForSubject(homeSubject);
    axiosInstance
      .get("authentication/test-track/" + subjectState.testId)
      .then((res: any) => {
        if (res && res.data) {
          console.log('[AroowDirection.tsx] Server testType:', res.data.testType);
          console.log('[AroowDirection.tsx] Received testType from backend:', res.data.testType);
          if (res.data && res.data.testType) {
            const serverType = normalizePositiveNumber(res.data.testType);
            const size = preferredClientSize ?? serverType ?? fallbackSize;

            if (preferredClientSize !== null && serverType !== null && preferredClientSize !== serverType) {
              console.warn('[AroowDirection.tsx] StartTest size mismatch; using client preferred size', {
                subject: homeSubject,
                clientPreferred: preferredClientSize,
                serverType,
              });
            }
            console.log('[AroowDirection.tsx] Updated nextSetSize to:', size);
            console.log('[AroowDirection.tsx] Normalized nextSetSize:', size);
            setNextSetSize(size);
            setTestSize(size);
            // Navigate using the freshly computed size to avoid async state lag
            navigation.navigate("Test", {
              params: {
                subject: appState.home,
                type: size,
                questionIds: res.data.questionIds,
                testId: subjectState.testId,
                subjectId: subjectState.subjectId,
                std: userData.std,
              },
            });
            setLoading(false);
            return;
          }
          // Fallback navigation if no testType present
          navigation.navigate("Test", {
            params: {
              subject: appState.home,
              type: fallbackSize,
              questionIds: res.data.questionIds,
              testId: subjectState.testId,
              subjectId: subjectState.subjectId,
              std: userData.std,
            },
          });
          setLoading(false);
        }
      })
      .catch((err: any) => {
        console.error('[AroowDirection.tsx] Error loading test-track:', err);
        setLoading(false);
        if (err.status == 401) {
          // navigate("Login");
        }
      });
  };

  if (!isNextSetSizeReady) {
    return <ActivityIndicator size="large" color="#00B7C2" />; // Show loading spinner
  }

  return (
    <View
      style={{
        flex: 1,
        height: "auto",
      }}
    >
      <ScrollView ref={scrollBottomRef}>
        <View
          style={{
            height: "auto",
          }}
        >
          {dummyData.length > 0 && dummyData.map((data, index) => {
            const strategy = getTestStrategy({ std: userData.std, planValid: userData.planValid }, appState.home);
            const label = strategy.getSetLabel ? strategy.getSetLabel(index) : `Set ${index + 1}`;
            return (
              <SingleStage
                key={index}
                id={index}
                score={data}
                start={() => { }}
                loading={loading}
                label={label}
              />
            );
          })}
          {stageTrack.length != 0 &&
            track.map((data: any, index: any) => {
              const setSize = testSize || 20;
              const strategy = getTestStrategy({ std: userData.std, planValid: userData.planValid }, appState.home);
              const setLabel = strategy.getSetLabel ? strategy.getSetLabel(index) : `Set ${index + 1}`;

              return (
                <SingleStage
                  key={index}
                  id={index}
                  score={data}
                  start={StartTest}
                  loading={loading}
                  questionCount={setSize}
                  label={setLabel}
                />
              );
            })}
          {stageTrack.length == 0 && (
            <View style={{ width: wp(50), left: wp(50), bottom: hp(0.5) }}>
              <StartButton
                onPress={StartTest}
                text={`Start - ${nextSetSize}`}
                loading={loading}
                questionCount={nextSetSize}
              />
            </View>
          )}
        </View>
      </ScrollView>
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
    marginBottom: wp(2),
  },
  wrapperAnother: {
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
    borderLeftWidth: wp(1.4),
  },

  rectangleTouch1: {
    // backgroundColor: "green",
    top: -64,
    left: -67,
    transform: [{ rotate: "28deg" }],
  },
  rectangleTouch2: {
    // backgroundColor: "red",
    top: -6,
    left: -128,
    transform: [{ rotate: "28deg" }],
  },
  rectangleTouch3: {
    // backgroundColor: "red",
    top: 52,
    left: -189,
    transform: [{ rotate: "28deg" }],
  },
  rectangle2: {
    width: 30,
    backgroundColor: COLORS.Arrowgray,
    margin: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    height: 62,
    borderColor: COLORS.lightGrey80,
    // transform: [{ rotate: "28deg" }],
    borderRightWidth: wp(1.4),
    borderLeftWidth: wp(1.4),
  },
  rectangle3: {
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
    borderLeftWidth: wp(1.4),
  },
  triangle: {
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
    borderWidth: 0,
  },
  wrapperLeft: {
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
    transform: [{ rotate: "-28deg" }],
  },
  rectangle2Left: {
    width: 30,
    backgroundColor: COLORS.Arrowgray,
    margin: 0,
    top: -20,
    left: -16,
    justifyContent: "center",
    alignItems: "center",
    height: 62,
    borderColor: COLORS.lightGrey80,
    transform: [{ rotate: "-28deg" }],
  },
  rectangle3Left: {
    width: 30,
    backgroundColor: COLORS.Arrowgray,
    margin: 0,
    top: 39,
    left: -15,
    justifyContent: "center",
    alignItems: "center",
    height: 62,
    borderColor: COLORS.lightGrey80,
    transform: [{ rotate: "-28deg" }],
  },
  triangleLeft: {
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
    borderWidth: 0,
  },

  // Mark
  rectangleScoreParent: {
    top: "43.39%",
    bottom: "4.76%",
    left: "48.64%",
    right: "0%",
    width: "51.36%",
    height: "10%",
  },
  rectangleScoreParent2: {
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
    zIndex: 1,
  },
  groupItem: {
    height: "110%",
    width: "16.74%",
    top: "7.94%",
    right: "59%",
    bottom: "30.68%",
    left: "60.47%",
  },
  groupChild1: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  groupChild2: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  groupChild3: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  groupChild4: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  groupChildPosition2: {
    // bottom: "11.11%",
    // left:"4%",
    // top: "56%",
    width: "38%",
    height: "100%",
  },
  groupChildPositionRight: {
    // bottom: "11.11%",
    // left: "54%",
    // top: "10%",
    width: "100%",
    height: "100%",
  },
  groupChildPosition1: {
    left: "61.71%",
    right: "5.88%",
    bottom: "11.11%",
    top: "20.67%",
    width: "29.41%",
    height: "8%",
  },
  groupChildPosition: {
    left: "5.9%",
    right: "64.71%",
    bottom: "11.11%",
    top: "20.67%",
    width: "29.41%",
    height: "72.22%",
  },
  groupChild4Position: {
    // borderRadius: ,
    left: "0%",
    top: "86.11%",
    height: "13.89%",
    bottom: "0%",
    right: "0%",
    width: "97%",
  },
  rectangleView: {
    left: "4%",
    top: "56%",
    height: "8%",
    bottom: "0%",
    right: "0%",
    width: "38%",
  },
  rectangleViewRight: {
    // left: "54%",
    // top: "10%",
    height: "100%",
    // bottom: "0%",
    // right: "0%",
    width: "100%",
  },
  textTypo2: {
    textShadowRadius: 4,
    textShadowOffset: {
      width: 4,
      height: 0,
    },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    fontWeight: "700",
    fontSize: 24,
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
      height: 0,
    },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    // fontFamily: FontFamily.palanquinBold,
    fontWeight: "700",
    fontSize: 24,
    top: "25%",
    position: "absolute",
  },
  textTypo: {
    left: "70.59%",
    textShadowRadius: 4,
    textShadowOffset: {
      width: 4,
      height: 0,
    },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    // fontFamily: FontFamily.palanquinBold,
    fontWeight: "700",
    fontSize: 24,
    top: "25%",
    position: "absolute",
  },
  textTypo2Right: {
    textShadowRadius: 4,
    textShadowOffset: {
      width: 4,
      height: 0,
    },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    fontWeight: "700",
    fontSize: 24,
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
      height: 0,
    },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    // fontFamily: FontFamily.palanquinBold,
    fontWeight: "700",
    fontSize: 24,
    top: "25%",
    position: "absolute",
  },
  textTypoRight: {
    left: "168%",
    textShadowRadius: 4,
    textShadowOffset: {
      width: 4,
      height: 0,
    },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    // fontFamily: FontFamily.palanquinBold,
    fontWeight: "700",
    fontSize: 24,
    top: "25%",
    position: "absolute",
  },
  groupChild5: {
    left: "64.71%",
    right: "5.88%",
    bottom: "11.11%",
    top: "20.67%",
    width: "16%",
    height: "8%",
  },
  groupChild6: {
    left: "35.29%",
    right: "35.29%",
    bottom: "11.11%",
    top: "20.67%",
    width: "29.41%",
    height: "8%",
  },
  groupChild7: {
    left: "6.29%",
    bottom: "11.11%",
    right: "35.29%",
    top: "20.67%",
    width: "29.41%",
    height: "8%",
  },
  groupChildBg: {
    backgroundColor: COLORS.colorLightgray,
    position: "absolute",
  },
  box: {
    width: 300,
    height: 30,
    marginVertical: 20,
    borderColor: "#000000",
    borderWidth: 1,
    borderRadius: 7.0,
  },
});
export default Arrows;
