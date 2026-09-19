import StartButton from './StartButton';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import React, { useCallback, useEffect, useState } from "react";
import { COLORS } from "../styles/themes";
import { View, StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from './CustomText';

import { LinearGradient } from "expo-linear-gradient";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  heightPercentageToDP,
  widthPercentageToDP as wp
} from "react-native-responsive-screen";
import { Colors } from "react-native/Libraries/NewAppScreen";





const returnSide = (index: any, comp: any) => {
  if (index % 2 == 0) {
    return {
      left: comp == 1 ? wp(52) : wp(50),
      bottom: comp == 1 ? 150 : 120,
      elevation: 5,
      right: wp(0)
    };
  } else {
    return {
      right: comp == 1 ? wp(52) : wp(50),
      bottom: comp == 1 ? 138 : 110,
      elevation: 5,
      left: comp == 1 ? wp(4) : wp(2)
    };
  }
};

export const EmptyScoreShelf = ({
  label,
  style,
  onPress,
  isLocked,
}: {
  label?: string;
  style?: any;
  onPress?: () => void;
  isLocked?: boolean;
}) => {
  const Container: any = onPress ? TouchableOpacity : View;
  const locked = Boolean(isLocked || (label && label.toLowerCase().includes('lock')));
  const boxOverlayStyle = locked ? styles.groupChildBg : styles.groupChildBgOg;

  return (
    <Container
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.rectangleScoreParent, style, !locked && styles.shelfElevated]}
    >
      <LinearGradient
        style={[styles.groupChild1, styles.groupChildPosition2, !locked && styles.gradientPanelElevated]}
        locations={[0, 0.49, 1]}
        colors={["#f2c112", "#e76d14", "#f2c112"]}
        {...(!locked ? { start: { x: 0, y: 0 }, end: { x: 0.5, y: 1 } } : {})}
      />
      <LinearGradient
        style={[styles.groupChild2, styles.groupChildPosition1, !locked && styles.gradientPanelElevated]}
        locations={[0, 0.49, 1]}
        colors={["#f2c112", "#e76d14", "#f2c112"]}
        {...(!locked ? { start: { x: 0, y: 0 }, end: { x: 0.5, y: 1 } } : {})}
      />
      <LinearGradient
        style={[styles.groupChild3, styles.groupChildPosition, !locked && styles.gradientPanelElevated]}
        locations={[0, 0.49, 1]}
        colors={["#f2c112", "#e76d14", "#f2c112"]}
        {...(!locked ? { start: { x: 0, y: 0 }, end: { x: 0.5, y: 1 } } : {})}
      />
      <LinearGradient
        style={[styles.groupChild4, styles.groupChild4Position, !locked && styles.gradientPanelElevated]}
        locations={[0, 1]}
        colors={["#f89c12", "rgba(255, 181, 71, 0.51)"]}
      />
      <View style={[styles.rectangleView, boxOverlayStyle]} />

      {label ? (
        <View style={styles.practiceLabelContainer} pointerEvents="none">
          <Text
            style={[
              styles.practiceLabelText,
              locked ? styles.practiceLabelTextLocked : styles.practiceLabelTextUnlocked
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {label}
          </Text>
        </View>
      ) : null}

      <View style={[styles.groupChild7, boxOverlayStyle]} />
      <View style={[styles.groupChild6, boxOverlayStyle]} />
      <View style={[styles.groupChild5, boxOverlayStyle]} />
    </Container>
  );
};

const ScoreBox = (props: any) => {
  const [lockIcon, setLockIcon] = useState<IconProp>(faLock);

  // Extract score value from object or use as number
  const getScoreValue = (score: any): number => {
    if (typeof score === 'object' && score !== null && 'score' in score) {
      return Number(score.score) || 0;
    }
    return Number(score) || 0;
  };

  const scoreValue = getScoreValue(props.score);

  // Derive digits for the locked display (padding 20 to 020 per user request)
  const qCount = Number(props.questionCount) || 0;
  const qDigits = qCount.toString().padStart(3, "0").split("");

  return (
    <>
      {props.practiceLabel ? (
        <>
          {props.isLatest && (
            <View style={[styles.startBehind, returnSide(props.id, 1), { zIndex: 1, elevation: 0 }]}>
              <StartButton
                onPress={props.start}
                colors={["#00B712", "#5AFF15"]}
                Text={(() => {
                  if (props.questionCount > 0)
                    return `Start - ${props.questionCount}`;
                  return "Start";
                })()}
                loading={props.loading}
                questionCount={props.questionCount}
                elevation={0}
              />
            </View>
          )}
          <EmptyScoreShelf
            label={props.practiceLabel}
            onPress={undefined}
            style={returnSide(props.id, 2)}
            isLocked={props.isLocked}
          />
        </>
      ) : (
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

              {/* Box 2 (Center) */}
              {props.showNumber ? (
                <Text style={styles.textTypo2DP}>{qDigits[1]}</Text>
              ) : (
                <View style={styles.lockBoxCenter}>
                  <FontAwesomeIcon style={{ color: COLORS.colorWhite }} size={wp(5)} icon={lockIcon} />
                </View>
              )}

              {/* Box 1 (Left) */}
              {props.showNumber ? (
                <Text style={styles.textTypo1DP}>{qDigits[0]}</Text>
              ) : (
                <View style={styles.lockBoxLeft}>
                  <FontAwesomeIcon style={{ color: COLORS.colorWhite }} size={wp(5)} icon={lockIcon} />
                </View>
              )}

              {/* Box 3 (Right) */}
              {props.showNumber ? (
                <Text style={styles.textTypoDP}>{qDigits[2]}</Text>
              ) : (
                <View style={styles.lockBoxRight}>
                  <FontAwesomeIcon style={{ color: COLORS.colorWhite }} size={wp(5)} icon={lockIcon} />
                </View>
              )}

              <View style={[styles.groupChild5, styles.groupChildBg]} />
              <View style={[styles.groupChild6, styles.groupChildBg]} />
              <View style={[styles.groupChild7, styles.groupChildBg]} />
            </View>
          )}

          {props.isLatest && props.score != "" && (
            <View style={[styles.start, returnSide(props.id, 1)]}>
              <StartButton
                onPress={props.start}
                colors={["#00B712", "#5AFF15"]}
                Text={(() => {
                  if (props.questionCount > 0)
                    return `Start - ${props.questionCount}`;
                  return "Start";
                })()}
                loading={props.loading}
                questionCount={props.questionCount}
              />
            </View>
          )}
          {props.score != "" && (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => props.onScorePress && props.onScorePress(props.score, props.id)}
              style={[styles.rectangleScoreParent, returnSide(props.id, 2)]}
            >
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

              {/* Center Box */}
              <Text style={styles.textTypo2}>{scoreValue.toString().padStart(3, "0")[1]}</Text>

              {/* Left Box */}
              <Text style={styles.textTypo1}>{scoreValue.toString().padStart(3, "0")[0]}</Text>

              {/* Right Box */}
              <Text style={styles.textTypo}>{scoreValue.toString().padStart(3, "0")[2]}</Text>

              <View style={[styles.groupChild8, styles.groupChildBgOg]} />
              <View style={[styles.groupChild9, styles.groupChildBgOg]} />
              <View style={[styles.groupChild10, styles.groupChildBgOg]} />
            </TouchableOpacity>
          )}
        </>
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
    height: "72%"
  },
  groupChildPosition1: {
    left: "61.71%",
    right: "5.88%",
    bottom: "11.11%",
    top: "20.67%",
    width: "29%",
    height: "72%"
  },
  groupChildPosition: {
    left: "5.9%",
    right: "64.71%",
    bottom: "11.11%",
    top: "20.67%",
    width: "29%",
    height: "72%"
  },
  groupChild4Position: {
    // borderRadius: ,
    left: "0%",
    top: "86.11%",
    height: "13%",
    bottom: "0%",
    right: "0%",
    width: "97%"
  },
  groupChildBg: {

    backgroundColor: COLORS.colorLightgray,
    position: "absolute"
  },
  groupChildBgOg: {
    position: "absolute"
  },
  groupChild1: {
    position: "absolute",
    backgroundColor: "transparent"
  },
  groupChild2: {
    position: "absolute",
    backgroundColor: "transparent"
  },
  groupChild3: {
    position: "absolute",
    backgroundColor: "transparent"
  },
  groupChild4: {
    position: "absolute",
    backgroundColor: "transparent"
  },
  rectangleView: {
    left: "0%",
    top: "86%",
    height: "13.89%",
    bottom: "0%",
    right: "0%",
    width: "97%"
  },
  rectangleViewOG: {
    left: "0%",
    top: "86%",
    height: "13.89%",
    bottom: "0%",
    right: "0%",
    width: "97%"
  },
  textTypo2DP: {
    textShadowRadius: 4,
    textShadowOffset: { width: 4, height: 0 },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    fontFamily: 'AppFont-Bold',
    fontWeight: '700',
    fontSize: 24,
    left: "34.29%",
    width: "29%",
    top: "50%",
    marginTop: -12,
    position: "absolute",
    textAlignVertical: 'center',
  },
  textTypo1DP: {
    textShadowRadius: 4,
    textShadowOffset: { width: 4, height: 0 },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    fontFamily: 'AppFont-Bold',
    fontWeight: '700',
    fontSize: 24,
    left: "5.9%",
    width: "29%",
    top: "50%",
    marginTop: -12,
    position: "absolute",
    textAlignVertical: 'center',
  },
  textTypoDP: {
    textShadowRadius: 4,
    textShadowOffset: { width: 4, height: 0 },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    fontFamily: 'AppFont-Bold',
    fontWeight: '700',
    fontSize: 24,
    left: "61.71%",
    width: "29%",
    top: "50%",
    marginTop: -12,
    position: "absolute",
    textAlignVertical: 'center',
  },
  textTypo2: {
    textShadowRadius: 4,
    textShadowOffset: { width: 4, height: 0 },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    fontFamily: 'AppFont-Bold',
    fontWeight: '700',
    fontSize: 24,
    left: "34.29%",
    width: "29%",
    top: "50%",
    marginTop: -12,
    position: "absolute",
    textAlignVertical: 'center',
  },
  textTypo1: {
    textShadowRadius: 4,
    textShadowOffset: { width: 4, height: 0 },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    fontFamily: 'AppFont-Bold',
    fontWeight: '700',
    fontSize: 24,
    left: "5.9%",
    width: "29%",
    top: "50%",
    marginTop: -12,
    position: "absolute",
    textAlignVertical: 'center',
  },
  textTypo: {
    textShadowRadius: 4,
    textShadowOffset: { width: 4, height: 0 },
    textShadowColor: "rgba(255, 154, 98, 0.87)",
    textAlign: "center",
    color: COLORS.colorWhite,
    fontFamily: 'AppFont-Bold',
    fontWeight: '700',
    fontSize: 24,
    left: "61.71%",
    width: "29%",
    top: "50%",
    marginTop: -12,
    position: "absolute",
    textAlignVertical: 'center',
  },
  lockBoxCenter: {
    left: "45%",
    top: "46%",
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '10%'
  },
  lockBoxLeft: {
    left: "16%",
    top: "46%",
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '10%'
  },
  lockBoxRight: {
    left: "75%",
    top: "46%",
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '10%'
  },
  groupChild5: {
    left: "64%",
    right: "5.88%",
    bottom: "11.11%",
    top: "20.67%",
    width: "27%",
    height: "66%"
  },
  groupChild6: {
    left: "35%",
    right: "35.29%",
    bottom: "11.11%",
    top: "20.67%",
    width: "27%",
    height: "66%"
  },
  groupChild7: {
    left: "5.5%",
    bottom: "11.11%",
    right: "35.29%",
    top: "20.67%",
    width: "27%",
    height: "66%"
  },
  groupChild8: {
    left: "64%",
    right: "5.88%",
    bottom: "11.11%",
    top: "20.67%",
    width: "27%",
    height: "66%"
  },
  groupChild9: {
    left: "35%",
    right: "35.29%",
    bottom: "11.11%",
    top: "20.67%",
    width: "27%",
    height: "66%"
  },
  groupChild10: {
    left: "5.5%",
    bottom: "11.11%",
    right: "35.29%",
    top: "20.67%",
    width: "27%",
    height: "66%"
  },
  rectangleScoreParent: {
    width: "50%",
    height: wp(20),
    position: "absolute"
  },
  start: {
    width: wp(44),
    height: wp(20),
    position: "absolute"
  },
  startBehind: {
    width: wp(44),
    height: wp(20),
    position: "absolute",
    zIndex: 1,
    elevation: 0,
  },
  shelfElevated: {
    zIndex: 15,
    elevation: 8,
  },
  gradientPanelElevated: {
    elevation: 4,
  },
  practiceLabelContainer: {
    position: "absolute",
    left: "5.9%",
    width: "84.8%",
    top: "20%",
    height: "66%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 16,
    elevation: 6,
  },
  practiceLabelText: {
    color: COLORS.colorWhite,
    fontFamily: 'AppFont-Bold',
    fontWeight: '700',
    fontSize: 24,
    textAlign: "center",
    textAlignVertical: "center",
    letterSpacing: 0.5,
  },
  practiceLabelTextLocked: {
    textShadowRadius: 4,
    textShadowOffset: { width: 1, height: 1 },
    textShadowColor: "rgba(100, 100, 100, 0.95)",
  },
  practiceLabelTextUnlocked: {
    textShadowRadius: 4,
    textShadowOffset: { width: 2, height: 2 },
    textShadowColor: "rgba(160, 50, 0, 0.95)",
  }
});
export default ScoreBox;
