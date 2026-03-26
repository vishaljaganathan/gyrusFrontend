import React, { useCallback, useEffect, useState } from "react";
import { COLORS } from "../styles/themes";
import { StyleSheet, View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  heightPercentageToDP,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { IconProp, score } from "../interface/Interface";
import StartButton from "./StartButton";

const returnSide = (index: any, comp: any) => {
  if (index % 2 == 0) {
    return {
      left: comp == 1 ? wp(52) : wp(50),
      bottom: comp == 1 ? 150 : 120,
      elevation: 5,
      right: wp(0),
    };
  } else {
    return {
      right: comp == 1 ? wp(52) : wp(50),
      bottom: comp == 1 ? 138 : 110,
      elevation: 5,
      left: comp == 1 ? wp(4) : wp(2),
    };
  }
};

const ScoreBox = (props: any) => {
  const [lockIcon, setLockIcon] = useState<IconProp>(faLock);
  return (
    <>
      {props.score == "" && (
        <View style={[styles.rectangleScoreParent, returnSide(props.id, 2)]}>
          <LinearGradient
            style={[styles.groupChild1, styles.groupChildPosition2]}
            locations={[0, 0.49, 1]}
            colors={["#f2c112", "#e76d14", "#f2c112"]}
          />
          <LinearGradient
            style={[styles.groupChild2, styles.groupChildPosition1]}
            locations={[0, 0.49, 1]}
            colors={["#f2c112", "#e76d14", "#f2c112"]}
          />
          <LinearGradient
            style={[styles.groupChild3, styles.groupChildPosition]}
            locations={[0, 0.49, 1]}
            colors={["#f2c112", "#e76d14", "#f2c112"]}
          />
          <LinearGradient
            style={[styles.groupChild4, styles.groupChild4Position]}
            locations={[0, 1]}
            colors={["#f89c12", "rgba(255, 181, 71, 0.51)"]}
          />
          <View style={[styles.rectangleView, styles.groupChildBg]} />
          <Text style={styles.textTypo2DP}>
            {props.score != "" ? (
              props.score[1]
            ) : (
              <FontAwesomeIcon
                style={{ color: COLORS.colorWhite }}
                size={wp(5)}
                icon={lockIcon}
              />
            )}
            {/* </Animated.View> */}
          </Text>
          <Text style={styles.textTypo1DP}>
            {props.score != "" ? (
              props.score[0]
            ) : (
              <FontAwesomeIcon
                style={{ color: COLORS.colorWhite }}
                size={wp(5)}
                icon={lockIcon}
              />
            )}
          </Text>
          <Text style={styles.textTypoDP}>
            {props.score != "" ? (
              props.score[2]
            ) : (
              <FontAwesomeIcon
                style={{
                  color: COLORS.colorWhite,
                }}
                size={wp(5)}
                icon={lockIcon}
              />
            )}
          </Text>
          <View style={[styles.groupChild5, styles.groupChildBg]} />
          <View style={[styles.groupChild6, styles.groupChildBg]} />
          <View style={[styles.groupChild7, styles.groupChildBg]} />
        </View>
      )}

      {props.id == 0 && props.score != "" && (
        <View style={[styles.start, returnSide(props.id, 1)]}>
          <StartButton
            onPress={props.start}
            colors={["#00B712", "#5AFF15"]}
            text={(() => {
              if (props.questionCount > 0) return `Start - ${props.questionCount}`;
              return "Start";
            })()}
            loading={props.loading}
            questionCount={props.questionCount}
          />
        </View>
      )}
      {props.score != "" && (
        <View style={[styles.rectangleScoreParent, returnSide(props.id, 2)]}>
          <LinearGradient
            style={[styles.groupChild1, styles.groupChildPosition2]}
            locations={[0, 0.49, 1]}
            colors={["#f2c112", "#e76d14", "#f2c112"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <LinearGradient
            style={[styles.groupChild2, styles.groupChildPosition1]}
            locations={[0, 0.49, 1]}
            colors={["#f2c112", "#e76d14", "#f2c112"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <LinearGradient
            style={[styles.groupChild3, styles.groupChildPosition]}
            locations={[0, 0.49, 1]}
            colors={["#f2c112", "#e76d14", "#f2c112"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <LinearGradient
            style={[styles.groupChild4, styles.groupChild4Position]}
            locations={[0, 1]}
            colors={["#f89c12", "rgba(255, 181, 71, 0.51)"]}
          />
          <View style={[styles.rectangleViewOG, styles.groupChildBgOg]} />
          <Text style={styles.textTypo2}>
            {props.score != "" ? (
              props.score[1]
            ) : (
              <FontAwesomeIcon
                style={{ color: COLORS.colorWhite }}
                size={wp(5)}
                icon={lockIcon}
              />
            )}
            {/* </Animated.View> */}
          </Text>
          <Text style={styles.textTypo1}>
            {props.score != "" ? (
              props.score[0]
            ) : (
              <FontAwesomeIcon
                style={{ color: COLORS.colorWhite }}
                size={wp(5)}
                icon={lockIcon}
              />
            )}
          </Text>
          <Text style={styles.textTypo}>
            {props.score != "" ? (
              props.score[2]
            ) : (
              <FontAwesomeIcon
                style={{ color: COLORS.colorWhite }}
                size={wp(5)}
                icon={lockIcon}
              />
            )}
          </Text>
          <View style={[styles.groupChild8, styles.groupChildBgOg]} />
          <View style={[styles.groupChild9, styles.groupChildBgOg]} />
          <View style={[styles.groupChild10, styles.groupChildBgOg]} />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  groupChildPosition2: {
    left: "34.29%",
    bottom: "11.11%",
    right: "35.29%",
    top: "20.67%",
    width: "29%",
    height: "72%",
  },
  groupChildPosition1: {
    left: "61.71%",
    right: "5.88%",
    bottom: "11.11%",
    top: "20.67%",
    width: "29%",
    height: "72%",
  },
  groupChildPosition: {
    left: "5.9%",
    right: "64.71%",
    bottom: "11.11%",
    top: "20.67%",
    width: "29%",
    height: "72%",
  },
  groupChild4Position: {
    // borderRadius: ,
    left: "0%",
    top: "86.11%",
    height: "13%",
    bottom: "0%",
    right: "0%",
    width: "97%",
  },
  groupChildBg: {
    backgroundColor: COLORS.colorLightgray,
    position: "absolute",
  },
  groupChildBgOg: {
    position: "absolute",
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
  rectangleView: {
    left: "0%",
    top: "86%",
    height: "13.89%",
    bottom: "0%",
    right: "0%",
    width: "97%",
  },
  rectangleViewOG: {
    left: "0%",
    top: "86%",
    height: "13.89%",
    bottom: "0%",
    right: "0%",
    width: "97%",
  },
  textTypo2DP: {
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
    left: "45%",
    top: "46%",
    position: "absolute",
  },
  textTypo1DP: {
    left: "16%",
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
    // left: "45%",
    top: "46%",
    position: "absolute",
  },
  textTypoDP: {
    left: "75%",
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

    top: "46%",
    position: "absolute",
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
    // fontFamily: FontFamily.palanquinBold,
    fontWeight: "700",
    fontSize: 24,
    left: "45%",
    top: "35%",
    position: "absolute",
  },
  textTypo1: {
    left: "16%",
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
    // left: "45%",
    top: "35%",
    position: "absolute",
  },
  textTypo: {
    left: "75%",
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

    top: "35%",
    position: "absolute",
  },
  groupChild5: {
    left: "64%",
    right: "5.88%",
    bottom: "11.11%",
    top: "20.67%",
    width: "27%",
    height: "66%",
  },
  groupChild6: {
    left: "35%",
    right: "35.29%",
    bottom: "11.11%",
    top: "20.67%",
    width: "27%",
    height: "66%",
  },
  groupChild7: {
    left: "5.5%",
    bottom: "11.11%",
    right: "35.29%",
    top: "20.67%",
    width: "27%",
    height: "66%",
  },
  groupChild8: {
    left: "64%",
    right: "5.88%",
    bottom: "11.11%",
    top: "20.67%",
    width: "27%",
    height: "66%",
  },
  groupChild9: {
    left: "35%",
    right: "35.29%",
    bottom: "11.11%",
    top: "20.67%",
    width: "27%",
    height: "66%",
  },
  groupChild10: {
    left: "5.5 %",
    bottom: "11.11%",
    right: "35.29%",
    top: "20.67%",
    width: "27%",
    height: "66%",
  },
  rectangleScoreParent: {
    width: "50%",
    height: wp(20),
    position: "absolute",
  },
  start: {
    width: wp(44),
    height: wp(20),
    position: "absolute",
  },
});
export default ScoreBox;