import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, Animated, TouchableOpacity, Alert, Share, Easing, Text as RNText } from 'react-native';
import { Svg, Path, Rect, Defs, LinearGradient, Stop, Mask, Circle } from "react-native-svg";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient as Lin } from "expo-linear-gradient";
import ViewShot from 'react-native-view-shot';
import { COLORS } from '../styles/themes';
import * as Sharing from 'expo-sharing';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { CustomText as Text, CustomBoldText } from './CustomText';
import StopwatchCounter from './StopwatchCounter';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface SuccessViewProps {
  showSuccess: boolean;
  userData: any;
  displayScore: number;
  displayTotal: number;
  submittedWrong: number | null;
  wrongQtsIds: any[];
  lastPoints: number;
  finalData: any;
  navigation: any;
  setShowSuccess: (val: boolean) => void;
  setSubmittedScore: (val: number | null) => void;
  setSubmittedWrong: (val: number | null) => void;
  setSubmittedTotal: (val: number | null) => void;
  std?: string;
}

const SuccessView: React.FC<SuccessViewProps> = ({
  showSuccess,
  userData,
  displayScore,
  displayTotal,
  submittedWrong,
  wrongQtsIds,
  lastPoints,
  finalData,
  navigation,
  setShowSuccess,
  setSubmittedScore,
  setSubmittedWrong,
  setSubmittedTotal,
  std
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [confetti, setConfetti] = useState<any[]>([]);
  const resultScaleAnim = useRef(new Animated.Value(0)).current;
  const resultFloatAnim = useRef(new Animated.Value(0)).current;
  const circleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ekgAnim = useRef(new Animated.Value(0)).current;
  const viewShotRef = useRef<any>(null);

  const getStdLabel = (val?: string) => {
    if (!val) return "";
    const mapping: any = {
      "XI": "11th",
      "XII": "12th",
      "C": "Crash",
      "R": "Repeater"
    };
    return mapping[val] || val;
  };

  useEffect(() => {
    if (showSuccess) {
      // Reset values
      circleAnim.setValue(0);
      resultScaleAnim.setValue(0);
      resultFloatAnim.setValue(0);
      pulseAnim.setValue(1);
      ekgAnim.setValue(0);

      const confettiArray = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 4,
        type: Math.random() > 0.5 ? "❤️" : "❤️",
        fontSize: 16 + Math.random() * 16,
        anim: new Animated.Value(0)
      }));
      setConfetti(confettiArray);

      // Start Animations
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(circleAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        })
      ]).start();

      Animated.spring(resultScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(resultFloatAnim, { toValue: -20, duration: 1500, useNativeDriver: true }),
          Animated.timing(resultFloatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();

      confettiArray.forEach(particle => {
        Animated.sequence([
          Animated.delay(particle.delay * 1000),
          Animated.loop(
            Animated.sequence([
              Animated.timing(particle.anim, {
                toValue: 1,
                duration: particle.duration * 1000,
                useNativeDriver: true
              }),
              Animated.timing(particle.anim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true
              }),
            ])
          )
        ]).start();
      });

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
    } else {
      setConfetti([]);
    }
  }, [showSuccess]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ alignItems: 'center', width: wp(100), paddingTop: hp(6), paddingBottom: hp(5) }}
      style={{ width: '100%', alignSelf: 'center' }}
    >
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={{ width: wp(100), alignSelf: 'center', alignItems: 'center', backgroundColor: '#fff', paddingTop: hp(4), paddingBottom: hp(4), paddingHorizontal: wp(5) }}>
        {/* Animated success icon */}
        <Animated.View style={{
          marginBottom: hp(2),
          transform: [{ scale: resultScaleAnim }, { translateY: resultFloatAnim }]
        }}>
          <Lin
            colors={['#fbbf24', '#f97316']}
            style={{
              padding: hp(3), borderRadius: hp(10),
              alignItems: 'center', justifyContent: 'center', elevation: 10
            }}
          >
            <Image
              source={require("../../assets/trophy.png")}
              style={{ width: hp(10), height: hp(10), resizeMode: 'contain' }}
            />
          </Lin>
        </Animated.View>

        <Text
          style={{
            color: "#0AB8AD",
            fontFamily: 'AppFont-Bold', fontSize: hp(3),
            textAlign: "center",
            marginBottom: hp(1)
          }}
        >
          Hey {userData?.firstName || userData?.name || ''}
        </Text>

        <Text
          style={{
            color: "#0AB8AD",
            fontFamily: 'AppFont-Bold', fontSize: hp(2),
            textAlign: "center",
            marginBottom: hp(0.5)
          }}
        >
          Congratulations, you did it!
        </Text>

        <Text
          style={{
            color: "#64748b",
            fontFamily: 'AppFont-Bold', fontSize: hp(1.6),
            textAlign: "center",
            marginBottom: hp(1.5),
            textTransform: 'capitalize'
          }}
        >
          {finalData.subject === 'neet' ? 'NEET' : finalData.subject} {std ? `• ${getStdLabel(std)}` : ''}
        </Text>

        <View style={[styles.resultCard, { width: '90%', alignSelf: 'center' }]}>
          <View style={styles.resultHeader}>
            <View style={styles.circleContainer}>
              <Svg width={hp(10)} height={hp(10)} viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="45" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                <AnimatedCircle
                  cx="50" cy="50" r="45" stroke="#0062ffff" strokeWidth="8" fill="none"
                  strokeDasharray="283"
                  strokeDashoffset={circleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [283, 283 - (displayScore / (displayTotal || 1)) * 283]
                  })}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </Svg>
              <View style={styles.circleTextContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <StopwatchCounter
                    value={displayScore}
                    style={styles.circleScoreText}
                    duration={2500}
                    delay={1000}
                    key={showSuccess ? `success-score-${displayScore}` : 'hidden'}
                  />
                  <Text style={styles.circleScoreText}>/{displayTotal}</Text>
                </View>
                <Text style={styles.circleMcqText}>MCQs</Text>
              </View>
            </View>

            <View style={styles.statsList}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Correct</Text>
                <Text style={[styles.statValue, { color: '#10b981' }]}>{displayScore}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Wrong</Text>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>{submittedWrong ?? wrongQtsIds.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Accuracy</Text>
                <Text style={[styles.statValue, { color: '#f59e0b' }]}>{Math.round((displayScore / displayTotal) * 100)}%</Text>
              </View>
            </View>
          </View>

          <Text style={styles.rewardsHeader}>REWARDS UNLOCKED</Text>

          <View style={styles.cardsRow}>
            <View style={styles.rewardSmallCard}>
              <Image
                source={
                  Math.round((displayScore / displayTotal) * 100) === 100 ? require("../../assets/dimond-star.png") :
                    Math.round((displayScore / displayTotal) * 100) >= 70 ? require("../../assets/gold-star.png") :
                      require("../../assets/silver-star.png")
                }
                style={{ width: hp(6), height: hp(6), resizeMode: 'contain' }}
              />
              <Text style={styles.rewardCardTitle}>
                {Math.round((displayScore / displayTotal) * 100) === 100 ? "Diamond Star" :
                  Math.round((displayScore / displayTotal) * 100) >= 70 ? "Gold Star" : "Silver Star"}
              </Text>
              <Text style={styles.rewardCardSub}>Badge earned</Text>
            </View>
            <View style={styles.rewardSmallCard}>
              <Image source={require("../../assets/medal.png")} style={{ width: hp(6), height: hp(6), resizeMode: 'contain' }} />
              <Text style={[styles.rewardCardTitle, { color: '#6898ff' }]}>{lastPoints} points</Text>
              <Text style={styles.rewardCardSub}>Reward Earned</Text>
            </View>
          </View>

          <View style={[styles.streakBar, { backgroundColor: '#ecfdf5' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.pulseIconContainer, { width: 110, flexDirection: 'row' }]}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }], zIndex: 2 }}>
                  <Ionicons name="heart" size={24} color="#10B981" style={{ marginRight: 4 }} />
                </Animated.View>
                <View style={{ width: 80, height: 40 }}>
                  <Svg width="80" height="40" viewBox="0 0 80 40">
                    <Defs>
                      <LinearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="white" stopOpacity="0" />
                        <Stop offset="50%" stopColor="white" stopOpacity="0.1" />
                        <Stop offset="90%" stopColor="white" stopOpacity="1" />
                        <Stop offset="100%" stopColor="white" stopOpacity="0" />
                      </LinearGradient>
                      <Mask id="pulseMask">
                        <AnimatedRect
                          x={ekgAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-80, 80]
                          })}
                          y="0"
                          width="80"
                          height="40"
                          fill="url(#pulseGrad)"
                        />
                      </Mask>
                    </Defs>
                    <Path
                      d="M0,20 L20,20 L23,14 L27,20 L30,34 L35,6 L39,20 L43,25 L47,20 L80,20"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="1.2"
                      opacity={0.15}
                    />
                    <Path
                      d="M0,20 L20,20 L23,14 L27,20 L30,34 L35,6 L39,20 L43,25 L47,20 L80,20"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      mask="url(#pulseMask)"
                    />
                  </Svg>
                </View>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.streakTitle, { color: '#10B981' }]}>Active Days!</Text>
                <Text style={[styles.streakSub, { color: '#10B98180' }]}>Keep the pulse alive</Text>
              </View>
            </View>
            <Text style={[styles.streakNumber, { color: '#10B981' }]}>{userData?.active?.days || 0}</Text>
          </View>
        </View>

        {isSharing && (
          <View style={styles.shareBranding}>
            <Image source={require('../assets/appLogo.png')} style={styles.shareLogo} />
            <View>
              <Text style={styles.shareAppName}>Gyrus NEET</Text>
              <Text style={{ fontFamily: 'AppFont-Regular', fontSize: hp(1.4), color: '#64748b', marginTop: -2 }}>
                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </View>
          </View>
        )}

        <View pointerEvents="none" style={{ ...StyleSheet.absoluteFillObject, opacity: isSharing ? 0 : 1, zIndex: 9999 }}>
          {confetti.map(particle => (
            <Animated.View
              key={particle.id}
              style={{
                position: 'absolute',
                bottom: -50,
                left: `${particle.left}%`,
                zIndex: 9999,
                transform: [
                  { translateY: particle.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -hp(120)] }) }
                ],
                opacity: particle.anim.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.8, 0.8, 0] })
              } as any}
            >
              <RNText style={{ fontSize: particle.fontSize }}>{particle.type}</RNText>
            </Animated.View>
          ))}
        </View>
      </ViewShot>

      {!isSharing && (
        <View style={{ width: '100%', gap: hp(1.5), marginTop: hp(2), alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              setShowSuccess(false);
              setSubmittedScore(null);
              setSubmittedWrong(null);
              setSubmittedTotal(null);
              if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.reset({ index: 0, routes: [{ name: 'BottomBar' }] });
              }
            }}
            style={styles.continueButton}
          >
            <Lin colors={['#38E5D8', '#00B8AC']} style={[StyleSheet.absoluteFill, { borderRadius: 30 }]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              try {
                setIsSharing(true);
                setTimeout(async () => {
                  if (viewShotRef.current) {
                    const uri = await viewShotRef.current.capture();
                    if (await Sharing.isAvailableAsync()) {
                      await Sharing.shareAsync(uri);
                    } else {
                      const message = `I scored ${displayScore}/${displayTotal} on Gyrus NEET! 🏆\nAccuracy: ${Math.round((displayScore / displayTotal) * 100)}%\nReward Points: ${lastPoints}\nStreak: ${userData?.active?.days || 0} Days\nJoin me on Gyrus NEET!`;
                      await Share.share({ message });
                    }
                  }
                  setIsSharing(false);
                }, 500);
              } catch (error) {
                console.error('Error sharing image:', error);
                setIsSharing(false);
                Alert.alert("Error", "Failed to capture or share result image.");
              }
            }}
            style={styles.shareButton}
          >
            <Ionicons name="share-social-outline" size={20} color="#6366f1" style={{ marginRight: 8 }} />
            <Text style={styles.shareButtonText}>Share Result</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  resultCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 20,

    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  circleContainer: {
    width: hp(10),
    height: hp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  circleScoreText: {
    fontFamily: 'AppFont-Bold',
    fontSize: hp(1.8),
    color: '#1e293b',
  },
  circleMcqText: {
    fontFamily: 'AppFont-Regular',
    fontSize: hp(1.2),
    color: '#64748b',
  },
  statsList: {
    flex: 1,
    marginLeft: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: 'AppFont-Regular',
    fontSize: hp(1.8),
    color: '#64748b',
  },
  statValue: {
    fontFamily: 'AppFont-Bold',
    fontSize: hp(2),
  },
  rewardsHeader: {
    fontFamily: 'AppFont-Bold',
    fontSize: hp(1.6),
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rewardSmallCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fbbf2433',
  },
  rewardCardTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: hp(1.8),
    color: '#6898ff',
    marginTop: 4,
  },
  rewardCardSub: {
    fontFamily: 'AppFont-Regular',
    fontSize: hp(1.4),
    color: '#94a3b8',
  },
  streakBar: {
    width: '100%',
    backgroundColor: '#ffe4e6',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pulseIconContainer: {
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: hp(1.8),
    color: '#e11d48',
  },
  streakSub: {
    fontFamily: 'AppFont-Regular',
    fontSize: hp(1.4),
    color: '#fb7185',
  },
  streakNumber: {
    fontFamily: 'AppFont-Bold',
    fontSize: hp(2.5),
    color: '#e11d48',
  },
  continueButton: {
    width: '85%',
    backgroundColor: '#00B8AC',
    borderRadius: 30,
    paddingVertical: hp(2),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#00B8AC",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  continueButtonText: {
    color: '#ffffff',
    fontFamily: 'AppFont-Bold',
    fontSize: hp(2.2),
  },
  shareButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
  },
  shareButtonText: {
    color: '#6366f1',
    fontFamily: 'AppFont-Bold',
    fontSize: hp(1.8),
  },
  shareBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: hp(2),
    paddingBottom: hp(2),
  },
  shareLogo: {
    width: hp(4),
    height: hp(4),
    resizeMode: 'contain',
    marginRight: 8,
  },
  shareAppName: {
    fontFamily: 'AppFont-Bold',
    fontSize: hp(2.2),
    color: COLORS.primary03,
  },
});

export default SuccessView;
