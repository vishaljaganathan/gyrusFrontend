import React, { useContext, useEffect, useState } from "react";
import { Text, View, Image, StyleSheet, Pressable } from "react-native";
import ModalBox from "../components/Modal";
import { COLORS } from "../styles/themes";
import { PopupModal } from "../interface/Interface";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ThemeContext } from "../service/authContext";
import { moderateScale } from "../styles/Responsive";
import uuid from "react-native-uuid";
import { axiosInstance } from "../config/indeceptor";

const HeaderBar = () => {
  const [modelData, setModelData] = useState<PopupModal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEmoji, setshowEmoji] = useState(false);
  const [streakData, setStreakData] = useState({ active: 0, inactive: 0 });

  const Botany = require("../assets/botany.png");
  const Silver = require("../assets/Silver.png");
  const streak = require("../assets/stricks.png");
  const stethoscope = require("../assets/stethoscope.png");
  const noto_stethoscope = require("../assets/noto_stethoscope.png");
  const chemistry = require("../assets/chemistry.png");
  const physics = require("../assets/physics.png");
  const zoology = require("../assets/zoology.png");
  const DayBg = require("../assets/daybg.png");

  const themeContext = useContext(ThemeContext);
  const { userData, appState, setAppState } = themeContext;

  const FALLBACK_NEET_DATE = "2026-05-03";
  const [neetDate, setNeetDate] = useState<string>(FALLBACK_NEET_DATE);

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
          inactive: userData?.inActive || 0,
        });
        break;

      case 1:
        {
          const isPlanValid = !!userData?.planValid;
          setModelData([
            {
              img: noto_stethoscope,
              sub: "Neet",
              subject: "neet",
              subjectId: "6728835a32ffdd2cd2c55ac3",
              lock: false,
              openTest: true,
            },
            {
              img: physics,
              sub: "Physics",
              subject: "physics",
              subjectId: "659fc324c2444fa264d2b546",
              lock: !isPlanValid,
              openTest: isPlanValid,
            },
            {
              img: chemistry,
              sub: "Chemistry",
              subject: "chemistry",
              subjectId: "659fc329c2444fa264d2b548",
              lock: !isPlanValid,
              openTest: isPlanValid,
            },
            {
              img: Botany,
              sub: "Botany",
              subject: "botany",
              subjectId: "659fc35dc2444fa264d2b54b",
              lock: !isPlanValid,
              openTest: isPlanValid,
            },
            {
              img: zoology,
              sub: "Zoology",
              subject: "zoology",
              subjectId: "659fc3c2c2444fa264d2b553",
              lock: !isPlanValid,
              openTest: isPlanValid,
            },
          ]);
          setshowEmoji(false);
          break;
        }

      case 2:
        setModelData([
          {
            id: 1,
            img: userData?.planId?.img
              ? { uri: userData?.planId?.img }
              : Silver,
            title: userData?.planId?.name,
            plan: userData?.planValid,
            expiryDate: userData?.planExpiry,
          },
        ]);
        setshowEmoji(false);
        break;

      case 3:
        setModelData([
          {
            id: 1,
            title: "NEET exam will held on",
            date: neetDate,
          },
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
            <Image source={streak} style={HeaderMenuStyle.icon} />
            {/* <Text style={HeaderMenuStyle.text}>
              {userData?.active?.days || 0} Active / {userData?.inActive || 0} Inactive
            </Text> */}
          </View>
        </Pressable>

        {/* Subject Section */}
        <Pressable onPress={() => handleClick(1)} style={HeaderMenuStyle.menuItem}>
          <View style={HeaderMenuStyle.itemContainer}>
            <Image source={subImage} style={HeaderMenuStyle.icon} />
            {/* <Text style={HeaderMenuStyle.text}>
              {appState.home.charAt(0).toUpperCase() + appState.home.slice(1)}
            </Text> */}
          </View>
        </Pressable>

        {/* Plan Section */}
        <Pressable onPress={() => handleClick(2)} style={HeaderMenuStyle.menuItem}>
          <View style={HeaderMenuStyle.itemContainer}>
            <Image
              source={
                userData?.planId?.img ? { uri: userData?.planId?.img } : Silver
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
    marginTop: 0,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: hp(6),
  },
  menuItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(0.8),
  },
  itemContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  icon: {
    width: wp(10),
    height: hp(4),
    resizeMode: "contain",
    marginBottom: hp(0.4),
  },
  text: {
    color: COLORS.light,
    fontSize: wp(3),
    textAlign: "center",
    fontWeight: "500",
  },
  neetContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  neetTextContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    marginLeft: wp(1.5),
  },
  daysToText: {
    color: "white",
    fontSize: wp(2.6),
    textAlign: "left",
    lineHeight: hp(1.8),
    fontWeight: "500",
  },
  neetText: {
    color: "white",
    fontSize: wp(3.2),
    fontWeight: "600",
    textAlign: "left",
  },
  countdownContainer: {
    position: "relative",
    width: wp(9),
    height: wp(8.5),
  },
  countdownBackground: {
    width: "100%",
    height: "100%",
  },
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  countdownNumber: {
    fontSize: wp(3.5),
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default HeaderBar;
