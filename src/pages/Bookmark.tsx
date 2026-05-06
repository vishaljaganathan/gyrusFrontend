import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from 'react-native'
import { CustomText as Text } from '../components/CustomText';
import { LinearGradient } from "expo-linear-gradient";
import RadioButton from "../components/RadioButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../styles/themes";
import { SplitStringValues } from "../service/DataShow";
import Animated, { ZoomInDown } from "react-native-reanimated";
import { ThemeContext } from "../service/authContext";
import { Wrapper } from "../components/Wrapper";
import GradientButton from "../components/GradientButton";
import { getSecureStorage } from "../config/SecureStore";
import Net from "@react-native-community/netinfo";
import { axiosInstance } from "../config/indeceptor";

const Bookmark = ({ navigation }: { navigation: any }) => {
  const themeContext = useContext(ThemeContext);
  const [bookmarks, setBookmarks] = useState([]);

  const {
    userData,
    appState,
    setAppState,
  } = themeContext as any;

  useEffect(() => {
    getSecureStorage("token")
      .then((token) => {
        if (token != null && token != undefined && token != "") {
          CheckInternetConnectivity();
        } else {
          navigation.replace("SignUp");
        }
      })
      .catch((err) => {
        navigation.replace("SignUp");
      });
  }, []);

  useEffect(() => {
    axiosInstance
      .get("bookmark")
      .then((res) => {
        if (res && res.data) {
          setBookmarks(res.data.questions);
        }
      })
      .catch((err) => {
        if (err.status == 401) {
          navigation.replace("Login");
        }
      });
  }, []);

  const CheckInternetConnectivity = () => {
    Net.fetch().then((state) => {
      setAppState((prev: any) => ({
        ...prev,
        internetStatus: state.isConnected,
      }));
    });
  };

  return (
    <>
      {!appState.internetStatus && <Wrapper />}
      {appState.internetStatus && (
        <LinearGradient
          style={styles.androidLarge57}
          colors={["#028464", "#0AB7AD", "#0B7960"]}
        >
          <View style={{ flex: 1, alignItems: "center" }}>
            <View style={{ marginTop: userData.planValid ? hp(9) : 0 }}></View>
            <Animated.View entering={ZoomInDown} style={{ flex: 1, width: '100%' }}>
              {userData.planValid ? (
                <ScrollView contentContainerStyle={{ paddingBottom: 40, alignItems: 'center' }}>
                  {bookmarks.length === 0 ? (
                    <Text style={{ color: "white", textAlign: "center", marginTop: 20 }}>
                      No bookmarks available. Please add some questions to your bookmarks.
                    </Text>
                  ) : (
                    bookmarks.map((bmark, index) => (
                      <BookmarkQuestion key={index} MCQ={bmark} />
                    ))
                  )}
                </ScrollView>
              ) : (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <Text style={{ textAlign: "center", color: "white", width: "70%" }}>
                    You couldn't access these features. If you need access, please subscribe.
                  </Text>
                  <GradientButton
                    onPress={() => navigation.navigate("Plans")}
                    colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
                    text="Subscribe now"
                  />
                </View>
              )}
            </Animated.View>
          </View>
        </LinearGradient>
      )}
    </>
  );
};

const BookmarkQuestion = (props: any) => {
  return (
    <View style={styles.qusContainer}>
      <SplitStringValues MCQ={props.MCQ} keyName={"question"} />
      <RadioButton
        labelName={"option"}
        MCQ={[
          { 1: props.MCQ["1"] },
          { 2: props.MCQ["2"] },
          { 3: props.MCQ["3"] },
          { 4: props.MCQ["4"] },
        ]}
        keyName={""}
        answer={props.MCQ.answer}
        showAnswer={true}
        setSelectedIndex={() => {}}
        selectedIndex={null}
      />
      <View>
        <View style={{ backgroundColor: COLORS.secondary04, marginTop: hp(2), paddingVertical: hp(0.9), paddingHorizontal: hp(1), borderRadius: hp(1.5) }}>
          <Text style={{ color: "#FFF" }}>Explanation: </Text>
          <SplitStringValues MCQ={props.MCQ} keyName={"explanation"} />
          {props.MCQ.note && props.MCQ.note.value != "" && (
            <View style={{ backgroundColor: COLORS.secondary04, marginTop: hp(2), paddingVertical: hp(0.9), paddingHorizontal: hp(1), borderRadius: hp(1.5) }}>
              <Text style={{ color: "#FFF" }}>Note: </Text>
              <SplitStringValues MCQ={props.MCQ} keyName={"note"} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  qusContainer: {
    marginTop: hp(4),
    backgroundColor: COLORS.secondary05,
    width: wp(90),
    paddingHorizontal: wp(4),
    paddingVertical: hp(2.8),
    paddingBottom: hp(4),
    borderRadius: hp(4),
    height: "auto",
  },
  androidLarge57: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
    width: "100%",
  },
});

export default Bookmark;
