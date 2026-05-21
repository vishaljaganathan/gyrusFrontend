import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { View, StyleSheet, Pressable, Image, Animated, Easing } from "react-native"
import { Svg, Path, Rect, Defs, LinearGradient, Stop, Mask } from "react-native-svg";
import { Ionicons } from '@expo/vector-icons';
import { CustomText as Text } from '../components/CustomText';
import { axiosInstance } from "../config/indeceptor";
import ModalBox from "../components/Modal";
import { COLORS } from "../styles/themes";
import { PopupModal } from "../interface/Interface";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp} from "react-native-responsive-screen";
import { ThemeContext } from "../service/authContext";
import { moderateScale } from "../styles/Responsive";
import { useFocusEffect } from "@react-navigation/native";





const AnimatedRect = Animated.createAnimatedComponent(Rect);

const HeaderBar = () => {
  const [modelData, setModelData] = useState<PopupModal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEmoji, setshowEmoji] = useState(false);
  const [streakData, setStreakData] = useState({ active: 0, inactive: 0 });

  // Pulse Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ekgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Heartbeat pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 300, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 300, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Continuous EKG sweep animation
    Animated.loop(
      Animated.timing(ekgAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: false
      })
    ).start();
  }, []);

  const Botany = require("../assets/botany.png");
  const Silver = require("../assets/Silver.png");
  const streak = require("../assets/stricks.png");
  const inactiveStreak = { uri: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f634/512.gif" };
  const stethoscope = { uri: "https://fonts.gstatic.com/s/e/notoemoji/latest/1fa7a/512.gif" };
  const noto_stethoscope = require("../assets/noto_stethoscope.png");
  const chemistry = require("../assets/chemistry.png");
  const physics = require("../assets/physics.png");
  const zoology = require("../assets/zoology.png");
  const DayBg = require("../assets/daybg.png");

  const themeContext = useContext(ThemeContext);
  const { userData, setUserData, appState, setAppState } = themeContext;

  const FALLBACK_NEET_DATE = "2026-05-03";
  const [neetDate, setNeetDate] = useState<string>(FALLBACK_NEET_DATE);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      axiosInstance.get("authentication/user").then((res) => {
        if (res?.data && isMounted) {
          setUserData(res.data);
        }
      }).catch(() => {});
      return () => { isMounted = false; };
    }, [])
  );

  useEffect(() => {
    let isMounted = true;
    axiosInstance
      .get("neet-date")
      .then((res) => {
        const dateFromApi = res?.data?.date;
        if (!isMounted) return;

        if (dateFromApi) {
          // API returns a Date which axios deserializes as a string
          const resolvedDate = String(dateFromApi);
          setNeetDate(resolvedDate);
          setAppState((prev: any) =>
            prev?.neetDate === resolvedDate
              ? prev
              : { ...prev, neetDate: resolvedDate }
          );
        }
      })
      .catch(() => {
        // Keep fallback on any error
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Move the ReturnImage function here
  const ReturnImage = (sub: string) => {
    switch (sub?.toLowerCase()) {
      case "neet":
        return stethoscope;
      case "physics":
        return physics;
      case "chemistry":
        return chemistry;
      case "botany":
        return Botany;
      case "zoology":
        return zoology;
      default:
        return noto_stethoscope;
    }
  };

  const [subImage, setSubImage] = useState(ReturnImage(appState.home));
  const [sub, setSub] = useState(appState.home);

  useEffect(() => {
    setSubImage(ReturnImage(appState.home));
  }, [appState]);

  const daysUntil = (mongoDate: string) => {
    const currentDate = new Date();
    const targetDate = new Date(mongoDate);
    const differenceInMs = targetDate.getTime() - currentDate.getTime();
    const daysRemaining = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
    return daysRemaining < 0 ? 0 : daysRemaining;
  };

  const handleClick = (index: number) => {
    switch (index) {
      case 0:
        setModelData([]);
        setshowEmoji(true);
        setStreakData({
          active: userData?.active?.days || 0,
          inactive: userData?.inActive || 0});
        break;

      case 1:
        {
          const isPlanValid = !!userData?.planValid;
          setModelData([
            {
              img: noto_stethoscope,
              sub: "NEET",
              subject: "neet",
              subjectId: "6728835a32ffdd2cd2c55ac3",
              lock: false,
              openTest: true},
            {
              img: physics,
              sub: "Physics",
              subject: "physics",
              subjectId: "659fc324c2444fa264d2b546",
              lock: !isPlanValid,
              openTest: isPlanValid},
            {
              img: chemistry,
              sub: "Chemistry",
              subject: "chemistry",
              subjectId: "659fc329c2444fa264d2b548",
              lock: !isPlanValid,
              openTest: isPlanValid},
            {
              img: Botany,
              sub: "Botany",
              subject: "botany",
              subjectId: "659fc35dc2444fa264d2b54b",
              lock: !isPlanValid,
              openTest: isPlanValid},
            {
              img: zoology,
              sub: "Zoology",
              subject: "zoology",
              subjectId: "659fc3c2c2444fa264d2b553",
              lock: !isPlanValid,
              openTest: isPlanValid},
          ]);
          setshowEmoji(false);
          break;
        }

      case 2:
        setModelData([
          {
            id: 1,
            img: (userData?.planValid && userData?.planId?.img)
              ? { uri: userData?.planId?.img }
              : Silver,
            title: (userData?.isTrial && userData?.planValid) 
              ? "7-Day Gold Trial" 
              : (userData?.planValid ? userData?.planId?.name : "Silver"),
            plan: userData?.planValid,
            expiryDate: userData?.planExpiry},
        ]);
        setshowEmoji(false);
        break;

      case 3:
        setModelData([
          {
            id: 1,
            title: "NEET exam will held on",
            date: neetDate},
        ]);
        setshowEmoji(false);
        break;

      default:
        break;
    }
    setShowModal(true);
  };

  const formatDateWithOrdinal = (dateInput: string) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  return (
    <View style={HeaderMenuStyle.container}>
      <View style={HeaderMenuStyle.headerContent}>
        {/* Streak Section */}
        <Pressable onPress={() => handleClick(0)} style={HeaderMenuStyle.menuItem}>
          <View style={HeaderMenuStyle.itemContainer}>
            { (userData?.active?.updatedAt && new Date(userData.active.updatedAt).toDateString() === new Date().toDateString()) ? (
                  <View style={{ width: 80, height: 40 }}>
                    <Svg width="80" height="40" viewBox="0 0 80 40">
                      <Defs>
                        <LinearGradient id="pulseGradModal" x1="0%" y1="0%" x2="100%" y2="0%">
                          <Stop offset="0%" stopColor="white" stopOpacity="0" />
                          <Stop offset="50%" stopColor="white" stopOpacity="0.1" />
                          <Stop offset="90%" stopColor="white" stopOpacity="1" />
                          <Stop offset="100%" stopColor="white" stopOpacity="0" />
                        </LinearGradient>
                        <Mask id="pulseMaskModal">
                          <AnimatedRect
                            x={ekgAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-80, 80]
                            })}
                            y="0"
                            width="80"
                            height="40"
                            fill="url(#pulseGradModal)"
                          />
                        </Mask>
                      </Defs>
                      <Path
                        d="M2,20 L20,20 L23,14 L27,20 L30,34 L35,6 L39,20 L43,25 L47,20 L65,20"
                        fill="none"
                        stroke="#00B712"
                        strokeWidth="2"
                        opacity={0.15}
                      />
                      <Path
                        d="M2,20 L20,20 L23,14 L27,20 L30,34 L35,6 L39,20 L43,25 L47,20 L65,20"
                        fill="none"
                        stroke="#00B712"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        mask="url(#pulseMaskModal)"
                      />
                    </Svg>
                  </View>
            ) : (
              <Image 
                source={inactiveStreak} 
                style={HeaderMenuStyle.icon} 
              />
            )}
          </View>
        </Pressable>

        {/* Subject Section */}
        <Pressable onPress={() => handleClick(1)} style={HeaderMenuStyle.menuItem}>
          <View style={HeaderMenuStyle.itemContainer}>
            <Image source={subImage} style={HeaderMenuStyle.icon} />
            {/* <Text style={HeaderMenuStyle.Text}>
              {appState.home.charAt(0).toUpperCase() + appState.home.slice(1)}
            </Text> */}
          </View>
        </Pressable>

        {/* Plan Section */}
        <Pressable onPress={() => handleClick(2)} style={HeaderMenuStyle.menuItem}>
          <View style={HeaderMenuStyle.itemContainer}>
            <Image
              source={
                (userData?.planValid && userData?.planId?.img) ? { uri: userData?.planId?.img } : Silver
              }
              style={HeaderMenuStyle.icon}
            />
          </View>
        </Pressable>

        {/* NEET Countdown Section */}
        <Pressable onPress={() => handleClick(3)} style={HeaderMenuStyle.menuItem}>
          <View style={HeaderMenuStyle.neetContainer}>
            <View style={HeaderMenuStyle.countdownContainer}>
              <Image
                source={DayBg}
                style={HeaderMenuStyle.countdownBackground}
                resizeMode="cover"
              />
              <View style={HeaderMenuStyle.countdownOverlay}>
                <Text style={HeaderMenuStyle.countdownNumber}>
                  {daysUntil(neetDate)}
                </Text>
              </View>
            </View>
            {/* <View style={HeaderMenuStyle.neetTextContainer}>
              <Text style={HeaderMenuStyle.daysToText}>Days To</Text>
              <Text style={HeaderMenuStyle.neetText}>NEET</Text>
            </View> */}
          </View>
        </Pressable>
      </View>

      <ModalBox
        showModal={showModal}
        modelData={modelData}
        setShowModal={setShowModal}
        showEmoji={showEmoji}
        setSubImage={setSubImage}
        streakData={streakData}
        setSub={setSub}
      />
    </View>
  );
};

const HeaderMenuStyle = StyleSheet.create({
  container: {
    backgroundColor: COLORS.secondary01,
    borderBottomWidth: wp(0.3),
    borderBottomColor: "#0AB8AD",
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(1),
    marginTop: 0},
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: hp(6)},
  menuItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(0.8)},
  itemContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%"},
  icon: {
    width: wp(10),
    height: hp(4),
    resizeMode: "contain",
    marginBottom: hp(0.4)},
  Text: {
    
    color: COLORS.light,
    fontFamily: 'AppFont-Regular', fontSize: wp(3),
    textAlign: "center"},
  neetContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%"},
  neetTextContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    marginLeft: wp(1.5)},
  daysToText: {
    
    color: "white",
    fontFamily: 'AppFont-Regular', fontSize: wp(2.6),
    textAlign: "left",
    lineHeight: hp(1.8)},
  neetText: {
    
    color: "white",
    fontFamily: 'AppFont-Regular', fontSize: wp(3.2),
        textAlign: "left"},
  countdownContainer: {
    position: "relative",
    width: wp(9),
    height: wp(8.5)},
  countdownBackground: {
    width: "100%",
    height: "100%"},
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center"},
  countdownNumber: {
    
    fontFamily: 'AppFont-Bold', fontSize: wp(3.5),
    color: "white",
        textAlign: "center",
      justifyContent: "center"}});

export default HeaderBar;
