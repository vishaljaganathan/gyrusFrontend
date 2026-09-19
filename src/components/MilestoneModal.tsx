import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, Text as SvgText, Path } from 'react-native-svg';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CustomText as Text } from './CustomText';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CONFETTI_COLORS = ['#00b7c2', '#0AB8AD', '#028464', '#ffca28', '#ff6b6b', '#FFFFFF'];

interface MilestoneModalProps {
  isVisible: boolean;
  onClose: () => void;
  milestoneValue: number;
  userData: any;
  navigation: any;
}

// Individual particle with customized native driver transitions
const CustomParticle = ({ delay, isBurst, isVisible }: { delay: number; isBurst: boolean; isVisible: boolean }) => {
  const animY = useRef(new Animated.Value(isBurst ? SCREEN_H * 0.85 : -20)).current;
  const animX = useRef(new Animated.Value(isBurst ? SCREEN_W / 2 : Math.random() * SCREEN_W)).current;
  const animRotate = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(isBurst ? 1 : 0)).current;

  const color = useRef(CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]).current;
  const size = useRef(6 + Math.random() * 6).current;
  const isCircle = useRef(Math.random() > 0.5).current;

  useEffect(() => {
    if (!isVisible) return;
    let animation: Animated.CompositeAnimation;

    if (isBurst) {
      // Phase 1 Burst: flow from bottom to top once
      const targetX = Math.random() * SCREEN_W;
      const targetY = SCREEN_H * 0.15 + Math.random() * (SCREEN_H * 0.35);

      animation = Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animX, {
            toValue: targetX,
            duration: 900,
            easing: Easing.out(Easing.back(1)),
            useNativeDriver: true,
          }),
          Animated.timing(animY, {
            toValue: targetY,
            duration: 900,
            easing: Easing.out(Easing.back(1)),
            useNativeDriver: true,
          }),
          Animated.timing(animRotate, {
            toValue: 1,
            duration: 900,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        // After reaching the peak, drift down to the bottom and fade out
        Animated.parallel([
          Animated.timing(animY, {
            toValue: SCREEN_H + 20,
            duration: 2500 + Math.random() * 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(animOpacity, {
            toValue: 0,
            duration: 2500 + Math.random() * 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ]);
      animation.start();
    } else {
      // Phase 2 Continuous Rain: flow from top to bottom continuously
      const startRainAnimation = () => {
        const startX = Math.random() * SCREEN_W;
        animY.setValue(-20);
        animX.setValue(startX);
        animOpacity.setValue(0.8 + Math.random() * 0.2);
        animRotate.setValue(0);

        const duration = 4000 + Math.random() * 2000;
        const swayOffset = Math.random() > 0.5 ? 40 : -40;

        Animated.parallel([
          Animated.timing(animY, {
            toValue: SCREEN_H + 20,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(animRotate, {
            toValue: 1,
            duration: duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(animX, {
              toValue: Math.max(10, Math.min(SCREEN_W - 10, startX + swayOffset)),
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animX, {
              toValue: Math.max(10, Math.min(SCREEN_W - 10, startX + swayOffset * 2)),
              duration: duration / 2,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]).start(({ finished }) => {
          if (finished && isVisible) {
            startRainAnimation();
          }
        });
      };

      animation = Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animOpacity, {
          toValue: 0.8 + Math.random() * 0.2,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);

      animation.start(() => {
        if (isVisible) startRainAnimation();
      });
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [isVisible]);

  const rotateInterpolate = animRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : 2,
          opacity: animOpacity,
          position: 'absolute',
          transform: [
            { translateX: animX },
            { translateY: animY },
            { rotate: rotateInterpolate },
          ],
        },
      ]}
    />
  );
};

// Continuous Confetti Manager
const CustomConfetti = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;

  // Stagger particles for optimal performance and visuals
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Burst Particles (Bottom to Top peak, then falls and fades) */}
      {Array.from({ length: 35 }).map((_, idx) => (
        <CustomParticle key={`burst-${idx}`} delay={idx * 15} isBurst={true} isVisible={isVisible} />
      ))}

      {/* Infinite Rain Particles (Top to Bottom loop) */}
      {Array.from({ length: 30 }).map((_, idx) => (
        <CustomParticle key={`rain-${idx}`} delay={900 + idx * 180} isBurst={false} isVisible={isVisible} />
      ))}
    </View>
  );
};

const getPlanImage = (planValid?: boolean, planName?: string) => {
  const p = (planValid && planName) ? planName.toLowerCase() : 'silver';
  if (p.includes('gold')) {
    return require('../../assets/gold-star.png');
  }
  if (p.includes('diamond')) {
    return require('../../assets/dimond-star.png');
  }
  return require('../../assets/silver-star.png');
};

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isVisible,
  onClose,
  milestoneValue,
  userData,
  navigation,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const barProgressAnim = useRef(new Animated.Value(0)).current;

  // Milestone progression tiers: 2000, 4000, 8000, 12000, 16000...
  const MILESTONES = useMemo(() => {
    const list = [2000, 4000];
    let val = 8000;
    while (val <= 200000) {
      list.push(val);
      val += 4000;
    }
    return list;
  }, []);

  const currentPoints = Number(userData?.rewards?.current || 0);
  const currentEarned = Number(userData?.rewards?.earned || 0);
  const isClaimable = currentPoints >= 40000;

  // Days Active Calculation
  const daysActive = useMemo(() => {
    return userData?.active?.days || 0;
  }, [userData?.active?.days]);

  // User Plan Calculation
  const userPlan = useMemo(() => {
    if (userData?.isTrial && userData?.planValid) {
      const exp = userData?.planExpiry ? new Date(userData.planExpiry) : null;
      const remainingDays = exp ? Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
      const daysLeft = remainingDays > 0 ? remainingDays : 0;
      return `${daysLeft} Days Gold Trial`;
    }
    const planName = (userData?.planValid && userData?.planId?.name)
      ? userData?.planId?.name
      : 'Silver';
    return planName.charAt(0).toUpperCase() + planName.slice(1).toLowerCase();
  }, [userData?.planValid, userData?.isTrial, userData?.planExpiry, userData?.planId?.name]);

  // Find next milestone and progress math
  const nextMilestone = useMemo(() => {
    return MILESTONES.find((m) => m > currentEarned) || currentEarned + 4000;
  }, [currentEarned, MILESTONES]);

  const progressPct = useMemo(() => {
    return Math.min(100, Math.floor((currentEarned / nextMilestone) * 100));
  }, [currentEarned, nextMilestone]);

  // Animations when modal opens
  useEffect(() => {
    if (isVisible) {
      // Fade in and slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();

      // Slow loop rotation for outer ring
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Progress bar fill animation
      barProgressAnim.setValue(0);
      Animated.timing(barProgressAnim, {
        toValue: progressPct / 100,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // width percentage needs non-native
      }).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      barProgressAnim.setValue(0);
    }
  }, [isVisible, progressPct]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = barProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const formatNumber = (num: number) => {
    return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleClaimReward = () => {
    if (!isClaimable) return;
    onClose();
    navigation.navigate('Rewards');
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Ambient Background Glow Layer */}
          <LinearGradient
            colors={['rgba(10, 184, 173, 0.08)', 'transparent', 'rgba(0, 183, 194, 0.06)']}
            style={styles.ambientGlow}
          />

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={wp(6)} color="#64748b" />
          </TouchableOpacity>



          {/* Top Pill Tag */}
          <View style={styles.topTag}>
            <Text style={styles.topTagText}>🏆 Achievement Unlocked</Text>
          </View>

          {/* Badge SVG Circular Outer Ring and inner content */}
          <View style={styles.badgeWrap}>
            <Animated.View style={[styles.ringSvgContainer, { transform: [{ rotate: rotateInterpolate }] }]}>
              <Svg style={StyleSheet.absoluteFill} viewBox="0 0 200 200">
                <Defs>
                  <SvgGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#00b7c2" />
                    <Stop offset="50%" stopColor="#0AB8AD" />
                    <Stop offset="100%" stopColor="#028464" />
                  </SvgGradient>
                </Defs>
                {/* Background Ring */}
                <Circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                {/* Glowing Active Segment */}
                <Circle
                  cx="100"
                  cy="100"
                  r="92"
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="340, 238"
                  strokeDashoffset={85}
                />
                {/* Subtle Inner Rings */}
                <Circle cx="100" cy="100" r="82" fill="none" stroke="rgba(10, 184, 173, 0.08)" strokeWidth="1" />
                <Circle cx="100" cy="100" r="72" fill="none" stroke="rgba(10, 184, 173, 0.04)" strokeWidth="0.5" />
              </Svg>
            </Animated.View>

            {/* Inner Badge Details */}
            <View style={styles.badgeInner}>
              <Text style={styles.badgeEmoji}>🎉</Text>
              <Text style={styles.badgeLabel}>Milestone Achieved</Text>
              {/* Gradient text using Svg */}
              <View style={styles.svgTextWrapper}>
                <Svg height="26" width="110" viewBox="0 0 140 35">
                  <Defs>
                    <SvgGradient id="ptsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#00b7c2" />
                      <Stop offset="50%" stopColor="#0AB8AD" />
                      <Stop offset="100%" stopColor="#00b7c2" />
                    </SvgGradient>
                  </Defs>
                  <SvgText
                    fill="url(#ptsGrad)"
                    fontSize="26"
                    fontWeight="bold"
                    x="70"
                    y="26"
                    textAnchor="middle"
                  >
                    {formatNumber(milestoneValue)}
                  </SvgText>
                </Svg>
              </View>
              <Text style={styles.badgeSub}>Reward Points</Text>
            </View>
          </View>

          {/* Heading */}
          <Text style={styles.achievedTitle}>You're on fire! 🔥</Text>
          <Text style={styles.achievedDesc}>
            You've reached the {formatNumber(milestoneValue)} milestone.{'\n'}Keep going — bigger rewards await!
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Image source={require('../assets/Rewards.png')} style={styles.statImage} />
              <Text style={styles.statVal}>{formatNumber(currentEarned)}</Text>
              <Text style={styles.statLbl}>Total Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Image source={getPlanImage(userData?.planValid, userData?.planId?.name)} style={styles.statImage} />
              <Text style={styles.statVal}>{userPlan}</Text>
              <Text style={styles.statLbl}>User Plan</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.pulseContainer}>
                <Svg width="50" height="25" viewBox="0 0 80 40">
                  <Path
                    d="M2,20 L20,20 L23,14 L27,20 L30,34 L35,6 L39,20 L43,25 L47,20 L65,20"
                    fill="none"
                    stroke="#0AB8AD"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={styles.statVal}>{daysActive}</Text>
              <Text style={styles.statLbl}>Days Active</Text>
            </View>
          </View>

          {/* Next Milestone Card */}
          <View style={styles.nextCard}>
            <View style={styles.nextHeader}>
              <Text style={styles.nextTitle}>Next Milestone</Text>
              <Text style={styles.nextTarget}>{formatNumber(nextMilestone)} points</Text>
            </View>
            <View style={styles.nextBody}>
              <View style={styles.nextIconBox}>
                <Text style={styles.nextIcon}>🎁</Text>
              </View>
              <View style={styles.nextInfo}>
                <Text style={styles.nextMotivate}>
                  You're getting closer! Only {formatNumber(nextMilestone - currentEarned)} pts away.
                </Text>
                {/* Progress bar */}
                <View style={styles.progressTrack}>
                  <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                    <LinearGradient
                      colors={['#14e6b0', '#64d4ff']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.progressDot} />
                  </Animated.View>
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabelText}>{formatNumber(currentEarned)}</Text>
                  <Text style={styles.progressLabelText}>{progressPct}% complete</Text>
                  <Text style={styles.progressLabelText}>{formatNumber(nextMilestone)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Claim Button */}
          {isClaimable ? (
            <TouchableOpacity style={styles.btnPrimaryWrap} onPress={handleClaimReward} activeOpacity={0.8}>
              <LinearGradient
                colors={['#F4DC00', '#DB8606']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnPrimaryGradient}
              >
                <Text style={styles.btnPrimaryText}>Claim Reward ✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={[styles.btnPrimaryWrap, styles.btnDisabled]}>
              <Text style={styles.btnDisabledText}>Claim Reward (40k points needed) 🔒</Text>
            </View>
          )}

          {/* Continue Button */}
          <TouchableOpacity style={styles.btnSecondary} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>Continue Earning →</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Custom Confetti system to overlay on top of the screen */}
        <CustomConfetti isVisible={isVisible} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 15, 17, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp(90),
    backgroundColor: '#ffffff',
    borderRadius: wp(6),
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  ambientGlow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 184, 172, 0.01)',
    pointerEvents: 'none',
  },
  closeBtn: {
    position: 'absolute',
    top: wp(4),
    right: wp(4),
    padding: wp(1),
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topTag: {
    backgroundColor: '#ecfdf5',
    borderWidth: 0.5,
    borderColor: '#bbf7d0',
    borderRadius: 20,
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3.5),
    marginBottom: hp(1.2),
  },
  topTagText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.0),
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  badgeWrap: {
    width: wp(38),
    height: wp(38),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.2),
  },
  ringSvgContainer: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  badgeInner: {
    width: wp(29),
    height: wp(29),
    borderRadius: wp(14.5),
    backgroundColor: '#f0fdfa',
    borderWidth: 1.5,
    borderColor: 'rgba(10, 184, 173, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  badgeEmoji: {
    fontSize: wp(6.0),
    marginBottom: hp(0.2),
  },
  badgeLabel: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(1.9),
    color: '#0AB8AD',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  svgTextWrapper: {
    height: 26,
    width: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSub: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.1),
    color: 'rgba(0, 71, 76, 0.6)',
    marginTop: hp(0.1),
  },
  achievedTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.8),
    color: '#00474C',
    marginBottom: hp(0.4),
    textAlign: 'center',
  },
  achievedDesc: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.0),
    color: 'rgba(0, 71, 76, 0.7)',
    textAlign: 'center',
    lineHeight: wp(4.2),
    marginBottom: hp(1.5),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: hp(1.5),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: wp(3.5),
    paddingVertical: hp(1.0),
    paddingHorizontal: wp(1),
    marginHorizontal: wp(0.8),
    alignItems: 'center',
    justifyContent: 'space-between',
    height: hp(12.5),
  },
  statImage: {
    width: wp(6.5),
    height: wp(6.5),
    resizeMode: 'contain',
  },
  pulseContainer: {
    height: wp(6.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  statVal: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.0),
    color: '#00474C',
    lineHeight: wp(3.8),
    textAlign: 'center',
  },
  statLbl: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.4),
    color: 'rgba(0, 71, 76, 0.65)',
    marginTop: hp(0.4),
  },
  nextCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: wp(4.5),
    padding: wp(3),
    marginBottom: hp(1.5),
  },
  nextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  nextTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(2.8),
    color: 'rgba(0, 71, 76, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  nextTarget: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.2),
    color: '#0AB8AD',
  },
  nextBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextIconBox: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2.5),
    backgroundColor: 'rgba(10, 184, 173, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(10, 184, 173, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  nextIcon: {
    fontSize: wp(5.5),
  },
  nextInfo: {
    flex: 1,
  },
  nextMotivate: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.8),
    color: 'rgba(0, 71, 76, 0.7)',
    marginBottom: hp(0.5),
    lineHeight: wp(4),
  },
  progressTrack: {
    height: 7,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: hp(0.6),
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    position: 'relative',
  },
  progressDot: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -4.5 }],
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#0AB8AD',
    shadowColor: '#0AB8AD',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabelText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.4),
    color: 'rgba(0, 71, 76, 0.5)',
  },
  btnPrimaryWrap: {
    width: '100%',
    borderRadius: wp(3.5),
    overflow: 'hidden',
    marginBottom: hp(1.0),
  },
  btnPrimaryGradient: {
    paddingVertical: hp(1.3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.6),
    color: '#002D30',
  },
  btnDisabled: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: hp(1.3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabledText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.4),
    color: '#94a3b8',
  },
  btnSecondary: {
    width: '100%',
    borderRadius: wp(3.5),
    paddingVertical: hp(1.2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B8AC',
    marginBottom: 0,
  },
  btnSecondaryText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.4),
    color: '#ffffff',
  },
});
