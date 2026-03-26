import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Animated } from "react-native";
import { Defs, LinearGradient, Path, Rect, Stop, Svg } from "react-native-svg";
import ScoreBox from "./ScoreBox";
import StartButton from "./StartButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const returnSide = (index: any) => {
  if (index % 2 == 0) {
    return { position: "absolute", bottom: 60 };
  } else {
    return { position: "absolute", bottom: 60 };
  }
};
const StartTest = () => {
  // navigation.navigate("Test", {
  //   params: { subjectName: subName },
  // });
};

const DummyArrow = () => {
  return (
    <Svg width="177" height="203" viewBox="0 0 177 203" fill="#C0C0C0">
      <Path
        d="M141.943 37.7321L140.789 89.3622L91.4318 48.4853L141.943 37.7321Z"
        fill="#C0C0C0"
      />
      <Path
        d="M136.586 43.4162L138.794 84.1976L96.1074 48.8446L136.586 43.4162Z"
        fill="#A5A5A5"
      />
      <Rect
        x="108.71"
        y="55.9287"
        width="27"
        height="150.325"
        transform="rotate(44.8955 108.71 55.9287)"
        fill="#C0C0C0"
      />
      <Rect
        x="113.208"
        y="57.7063"
        width="18"
        height="150"
        transform="rotate(44.8955 113.208 57.7063)"
        fill="url(#paint0_linear_613_92)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_613_92"
          x1="122.208"
          y1="57.7063"
          x2="122.208"
          y2="207.706"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#A5A5A5" />
          <Stop offset="1" stopColor="#A5A5A5" stopOpacity="0" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

const ArrowSvg = (props: any) => {
  return (
    <Svg
      // style={returnSide(props.id)}
      width="177"
      height="203"
      viewBox="0 0 177 206"
      fill="none"
    >
      <Path
        d="M141.943 37.7321L140.789 89.3622L91.4318 48.4853L141.943 37.7321Z"
        fill={props.valid ? "#C0C0C0" : "#C0C0C0"}
      />
      <Path
        d="M136.586 43.4162L138.794 84.1976L96.1074 48.8446L136.586 43.4162Z"
        fill={props.valid ? "#06B002" : "#06B002"}
      />
      <Rect
        x="108.71"
        y="55.9287"
        width="27"
        height="150.325"
        transform="rotate(44.8955 108.71 55.9287)"
        fill={props.valid ? "#C0C0C0" : "#C0C0C0"}
      />
      <Rect
        x="113.208"
        y="57.7063"
        width="18"
        height="150"
        transform="rotate(44.8955 113.208 57.7063)"
        fill="url(#paint0_linear_613_92)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_613_92"
          x1="122.208"
          y1="57.7063"
          x2="122.208"
          y2="207.706"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor={props.valid ? "#06B002" : "#06B002"} />
          <Stop
            offset="1"
            stopColor={props.valid ? "#06B002" : "#06B002"}
            stopOpacity="0"
          />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

const SingleStage = ({ id, score, start, loading, questionCount, label }: any) => {
  return (
    <View style={styles.container}>
      {/* Slanted arrow body */}
      <View
        style={{
          transform: [{ rotate: id % 2 == 0 ? "-5deg" : "-85deg" }],
          position: "absolute",
          bottom: hp(-6),
        }}
      >
        {score == "" && <DummyArrow key={id} />}
        {score != "" && (
          <ArrowSvg key={id} id={id} valid={score == "" ? false : true} />
        )}
      </View>

      <ScoreBox
        key={id}
        id={id}
        score={score}
        start={start}
        loading={loading}
        questionCount={questionCount}
        label={label}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: hp(20),
  },
  stageContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20, // Space between stages
  },
  stageButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40, // Rounded corners
    width: 80,
    height: 80,
    elevation: 5, // Shadow effect
  },
  stageText: {
    position: "absolute",
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  arrow: {
    marginTop: 10,
    width: 30,
    height: 30, // Adjust size as needed
  },
});

export default SingleStage;
