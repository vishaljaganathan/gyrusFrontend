import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, Animated, TouchableOpacity, Alert, Share, Easing } from 'react-native';
import { Svg, Path, Rect, Defs, LinearGradient, Stop, Mask, Circle } from "react-native-svg";
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient as Lin } from "expo-linear-gradient";
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { CustomText as Text, CustomBoldText } from './CustomText';
import TestButton from './TestButton';
import StopwatchCounter from './StopwatchCounter';
import { COLORS } from '../styles/themes';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface RetryViewProps {
  displayScore: number;
  displayTotal: number;
  onRetry: () => void;
  onGoBack: () => void;
  result: any;
  userData: any;
  finalData: any;
  std?: string;
  submittedWrong: number | null;
  wrongQtsIds: any[];
  navigation: any;
}

const RetryView: React.FC<RetryViewProps> = ({
  displayScore,
  displayTotal,
  onRetry,
  onGoBack,
  result,
  userData,
  finalData,
  std,
  submittedWrong,
  wrongQtsIds,
  navigation
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
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

  const quotes = [
    "Mistakes are proof that you are trying. Keep going!",
    "Failure is the opportunity to begin again more intelligently.",
    "Your only limit is you. Keep pushing!",
    "Don't stop when you're tired. Stop when you're done.",
    "Believe you can and you're halfway there."
  ];
  const quote = quotes[displayScore % quotes.length];

  useEffect(() => {
    // Entrance animations
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true
    }).start();

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

    // Stats animations
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(circleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      })
    ]).start();

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

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center', width: wp(100), paddingTop: hp(4) }}
      style={{ flex: 1, backgroundColor: COLORS.secondary02 }}
    >
      <ViewShot 
        ref={viewShotRef} 
        options={{ format: 'jpg', quality: 0.9 }} 
        style={{ 
          flex: 1,
          width: wp(100), 
          minHeight: hp(100),
          alignSelf: 'center', 
          alignItems: 'center', 
          backgroundColor: COLORS.secondary02,
          paddingTop: hp(2), 
          paddingBottom: hp(5), 
          paddingHorizontal: wp(5) 
        }}
      >
        <Lin
          colors={['#00474c', '#002a26']}
          style={StyleSheet.absoluteFill}
        />
        
        <Animated.View style={{ 
          marginBottom: hp(2),
          transform: [{ scale: scaleAnim }, { translateX: shakeAnim }] 
        }}>
           <Lin
            colors={['#0AB8AD', '#007A72']}
            style={{
              width: hp(18), height: hp(18), borderRadius: hp(9),
              alignItems: 'center', justifyContent: 'center', elevation: 10
            }}
          >
            <FontAwesome name="refresh" size={100} color="white"/>
          </Lin>
        </Animated.View>

        <Text
          style={{
            color: "#0AB8AD",
            fontFamily: 'AppFont-Bold', fontSize: hp(3),
            textAlign: "center",
            marginBottom: hp(0.5)
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
          Oops! Keep Trying!
        </Text>

        <Text
          style={{
            color: "#E0E0E0",
            fontFamily: 'AppFont-Bold', fontSize: hp(1.8),
            textAlign: "center",
            marginBottom: hp(2),
            textTransform: 'capitalize',
            opacity: 0.8
          }}
        >
          {finalData.subject === 'neet' ? 'NEET' : finalData.subject} {std ? `• ${getStdLabel(std)}` : ''}
        </Text>

        <View style={[styles.resultCard, { width: '90%', alignSelf: 'center' }]}>
          <View style={styles.resultHeader}>
            <View style={styles.circleContainer}>
              <Svg width={hp(10)} height={hp(10)} viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="45" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" fill="none" />
                <AnimatedCircle
                  cx="50" cy="50" r="45" stroke="#0AB8AD" strokeWidth="8" fill="none"
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
                    duration={2000}
                    delay={1000}
                    key={`retry-score-${displayScore}`}
                  />
                  <Text style={styles.circleScoreText}>/{displayTotal}</Text>
                </View>
                <Text style={styles.circleMcqText}>MCQs</Text>
              </View>
            </View>

            <View style={styles.statsList}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Correct</Text>
                <Text style={[styles.statValue, { color: '#0AB8AD' }]}>{displayScore}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Wrong</Text>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>{submittedWrong ?? wrongQtsIds.length}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Accuracy</Text>
                <Text style={[styles.statValue, { color: '#f59e0b' }]}>{Math.round((displayScore / (displayTotal || 1)) * 100)}%</Text>
              </View>
            </View>
          </View>

          <View style={[styles.streakBar, { backgroundColor: 'rgba(10, 184, 173, 0.1)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.pulseIconContainer, { width: 110, flexDirection: 'row' }]}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }], zIndex: 2 }}>
                  <Ionicons name="heart" size={24} color="#0AB8AD" style={{ marginRight: 4 }} />
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
                      stroke="#0AB8AD"
                      strokeWidth="1.2"
                      opacity={0.3}
                    />
                    <Path
                      d="M0,20 L20,20 L23,14 L27,20 L30,34 L35,6 L39,20 L43,25 L47,20 L80,20"
                      fill="none"
                      stroke="#0AB8AD"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      mask="url(#pulseMask)"
                    />
                  </Svg>
                </View>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.streakTitle, { color: '#0AB8AD' }]}>Active Days!</Text>
                <Text style={[styles.streakSub, { color: 'rgba(255, 255, 255, 0.6)' }]}>Keep the pulse alive</Text>
              </View>
            </View>
            <Text style={[styles.streakNumber, { color: '#0AB8AD' }]}>{userData?.active?.days || 0}</Text>
          </View>
        </View>

        <View style={{ width: '90%', marginTop: hp(2) }}>
          <Text style={{ color: '#0AB8AD', fontFamily: 'AppFont-Bold', fontSize: hp(1.8), textAlign: 'center', fontStyle: 'italic' }}>
            "{quote}"
          </Text>
        </View>

        <View style={{ width: '90%', marginTop: hp(1.5) }}>
           <Text
            style={{
              color: "#E0E0E0",
              fontFamily: 'AppFont-Regular', fontSize: hp(1.5),
              textAlign: "center",
              lineHeight: hp(2.2)
            }}
          >
            Note: You need to correctly answer at least {Math.ceil(Number(result) / 2)} questions to pass this test.
          </Text>
        </View>

        {isSharing && (
          <View style={styles.shareBranding}>
            <Image source={require('../assets/appLogo.png')} style={styles.shareLogo} />
            <View>
              <Text style={styles.shareAppName}>Gyrus NEET</Text>
              <Text style={{ fontFamily: 'AppFont-Regular', fontSize: hp(1.4), color: '#E0E0E0', marginTop: -2 }}>
                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </View>
          </View>
        )}

        {!isSharing && (
          <View style={{ width: '100%', gap: hp(1.5), marginTop: hp(5), alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: wp(4), justifyContent: 'center', width: '90%', alignSelf: 'center' }}>
              <TestButton
                onPress={onRetry}
                colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
                text="Try Again"
                style={{ flex: 1 }}
              />
              <TestButton
                onPress={onGoBack}
                colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
                text="Go Back"
                style={{ flex: 1 }}
              />
            </View>

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
                        const message = `I scored ${displayScore}/${displayTotal} on Gyrus NEET! 📚\nEvery mistake is a lesson. Join me on Gyrus NEET!`;
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
              <Ionicons name="share-social-outline" size={20} color="#0AB8AD" style={{ marginRight: 8 }} />
              <Text style={styles.shareButtonText}>Share Result</Text>
            </TouchableOpacity>
          </View>
        )}
      </ViewShot>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(10, 184, 173, 0.3)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
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
    color: '#ffffff',
  },
  circleMcqText: {
    fontFamily: 'AppFont-Regular',
    fontSize: hp(1.2),
    color: '#E0E0E0',
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
    color: '#E0E0E0',
  },
  statValue: {
    fontFamily: 'AppFont-Bold',
    fontSize: hp(2),
    color: '#ffffff',
  },
  streakBar: {
    width: '100%',
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
  },
  streakSub: {
    fontFamily: 'AppFont-Regular',
    fontSize: hp(1.4),
  },
  streakNumber: {
    fontFamily: 'AppFont-Bold',
    fontSize: hp(2.5),
  },
  shareButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
  },
  shareButtonText: {
    color: '#0AB8AD',
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
    color: '#ffffff',
  },
});

export default RetryView;
