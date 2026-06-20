import React, { useContext, useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator, Alert, Animated, Easing } from 'react-native'
import { Svg, Path, Rect, Defs, LinearGradient, Stop, Mask } from "react-native-svg";
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CustomText as Text, CustomTextInput as TextInput } from './CustomText';

import { Center, Modal } from "@gluestack-ui/themed-native-base";
import { ModalProps } from "../interface/Interface";
import { useNavigation } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { COLORS } from "../styles/themes";
import GradientButton from "./GradientButton";
import { ThemeContext } from "../service/authContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp } from "react-native-responsive-screen";
import uuid from 'react-native-uuid';
import { setSecureStorage } from '../config/SecureStore';





const AnimatedRect = Animated.createAnimatedComponent(Rect);

const ModalBox = ({
  showModal,
  modelData,
  setShowModal,
  showEmoji,
  report,
  streakData } : ModalProps) => {
  const StreaksImage = require("../assets/stricks.png");
  const SleepyImage = { uri: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f634/512.gif" };
  const themeContext = useContext(ThemeContext);
  const { userData, setAppState, appState } = themeContext;

  // Pulse Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ekgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showModal && showEmoji) {
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
    }
  }, [showModal, showEmoji]);
  const navigation: any = useNavigation();
  const initialSel = React.useMemo(() => {
    const target = String(appState?.home || "").toLowerCase();
    const match = modelData?.find((it: any) => String(it?.subject || "").toLowerCase() === target);
    return match?.sub || modelData?.[0]?.sub || null;
  }, [modelData, appState?.home]);
  const [selectedItem, setSelectedItem] = useState(initialSel);
  useEffect(() => {
    setSelectedItem(initialSel);
  }, [initialSel]);

  const daysUntil = (mongoDate: string) => {
    const currentDate = new Date();
    const targetDate = new Date(mongoDate);
    const differenceInMs = targetDate.getTime() - currentDate.getTime();
    const daysRemaining = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
    return daysRemaining < 0 ? 0 : daysRemaining;
  };

  const formatDateWithOrdinal = (dateInput: string) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const getOrdinalSuffix = (d: number) => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
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
    <Center>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content
          maxWidth="350"
          style={{ backgroundColor: "rgba(52, 52, 52, 0.9)", borderRadius: 10, borderWidth: 1, borderColor: '#fff' }}
        >
          <TouchableOpacity
            onPress={() => setShowModal(false)}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 15 }}
          >
            <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>

          {/* Emoji Section */}
          {showEmoji ? (
            <Modal.Body style={{ paddingHorizontal: 20, paddingVertical: 20 }}>


              <View style={ModalStyle.emojiContainer}>
                <View style={ModalStyle.statsContainer}>
                  {/* Active Column */}
                  <View style={ModalStyle.statColumn}>
                    <View style={ModalStyle.statIconContainer}>
                      <View style={{ width: 80, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                        <Svg width="65" height="30" viewBox="0 0 80 40">
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
                            strokeWidth="1.2"
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
                    </View>
                    <Text style={[ModalStyle.statValue, { color: '#FFFFFF' }]}>
                      {streakData?.active || 0}
                    </Text>
                    <Text style={ModalStyle.statLabel}>Active Days</Text>
                  </View>

                  {/* Vertical Divider */}
                  <View style={ModalStyle.verticalDivider} />

                  {/* Inactive Column */}
                  <View style={ModalStyle.statColumn}>
                    <View style={ModalStyle.statIconContainer}>
                      <Image source={SleepyImage} style={ModalStyle.sleepyImage} />
                    </View>
                    <Text style={[ModalStyle.statValue, { color: '#FFFFFF' }]}>
                      {Math.max(0, Math.abs(Number(streakData?.inactive) || 0))}
                    </Text>
                    <Text style={ModalStyle.statLabel}>Inactive Days</Text>
                  </View>
                </View>
              </View>
            </Modal.Body>
          ) : (
            <Modal.Header style={{ backgroundColor: "transparent", borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 }}>
              <View style={ModalStyle.emojiContainer} />
            </Modal.Header>
          )}

          {/* Modal Body */}
          <Modal.Body style={{ marginBottom: wp(4) }}>
            {modelData?.map((res) => (
              <View key={String(uuid.v4())}>
                {/* Subject Card */}
                <Pressable
                  onPress={() => {
                    setSelectedItem(res.sub || null);
                    const isLocked = !!res.lock && !userData?.planValid;

                    if (isLocked) {
                      setShowModal(false);
                      navigation.navigate("Plans");
                      return;
                    }

                    if (res.openTest) {
                      if (res.subject != undefined) {
                        setSecureStorage("subject", res.subject);
                      }
                      setAppState((prev: any) => ({
                        ...prev,
                        home: res.subject || "neet" } ));
                      setShowModal(false);

                      // Paid users: if they change subject from the top bar,
                      // always return to the subject's Home tab.
                      if (userData?.planValid) {
                        navigation.navigate("Home");
                      }
                    }
                  }}
                >
                  {res.sub && (
                    <ExpoLinearGradient
                      colors={["#22E2D6", "#15BBB1", "#0D7F78"]}
                      locations={[0, 0.4, 1]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={[
                        ModalStyle.subjectContainer,
                        {
                          borderWidth:
                            selectedItem && res.sub &&
                              String(selectedItem).toLowerCase() === String(res.sub).toLowerCase()
                              ? 2
                              : 0,
                          borderColor:
                            selectedItem && res.sub &&
                              String(selectedItem).toLowerCase() === String(res.sub).toLowerCase()
                              ? "#FFFFFF"
                              : "transparent" } ]}
                    >
                      <View style={ModalStyle.iconWrapper}>
                        {res.sub && res.img && (
                          <Image source={res.img}
             style={ModalStyle.icon} />
                        )}
                      </View>

                      <View style={ModalStyle.textWrapper}>
                        <Text style={ModalStyle.subjectText}>{res.sub}</Text>
                      </View>

                      <View style={ModalStyle.percentageWrapper}>
                        {!!res.lock && !userData?.planValid ? (
                          <FontAwesomeIcon icon={faLock} size={18} color="#BDBDBD" />
                        ) : (
                          <Text style={ModalStyle.percentageText}>
                            {res.percentage}
                          </Text>
                        )}
                      </View>
                    </ExpoLinearGradient>
                  )}
                </Pressable>

                {/* Membership Card */}
                {res.title && res.img && (
                  <View key={String(uuid.v4())}
            style={ModalStyle.actSilver}>
                    {res.img && (
                      <Image source={res.img}
            style={ModalStyle.memberImg} />
                    )}
                    <View style={ModalStyle.memberDetails}>
                      <Text style={ModalStyle.memberTitle}>
                        {res.title} Member
                      </Text>
                      {res.plan && res.expiryDate ? (
                        <View>
                          <Text style={ModalStyle.expiryText}>
                            Validity expires
                          </Text>
                          <Text style={ModalStyle.expiryText}>
                            on {new Date(res.expiryDate).toLocaleDateString("en-GB")}
                          </Text>
                          {(() => {
                            const isTrial = !!userData?.isTrial || String(res.title || '').toLowerCase().includes('trial');
                            const isSilver = String(res.title || '').toLowerCase().includes('silver');
                            const isPremium = !isTrial && !isSilver;
                            const showButton = isTrial || isSilver || (isPremium && daysUntil(res.expiryDate) <= 5);

                            return showButton ? (
                              <TouchableOpacity
                                style={ModalStyle.updateNowButton}
                                onPress={() => {
                                  setShowModal(false);
                                  navigation.navigate("Plans");
                                }}
                              >
                                <Text style={ModalStyle.updateNowText}>Update Now</Text>
                              </TouchableOpacity>
                            ) : null;
                          })()}
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={ModalStyle.updateNowButton}
                          onPress={() => {
                            setShowModal(false);
                            navigation.navigate("Plans");
                          }}
                        >
                          <Text style={ModalStyle.updateNowText}>Update Now</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}

                {/* NEET Date Card */}
                {res.date && (
                  <View key={String(uuid.v4())}
            style={ModalStyle.neetPopUpContainer}>
                    <Text style={ModalStyle.neetDateText}>
                      {daysUntil(String(res.date))} Days to NEET{"\n"}
                      NEET exam will be held on
                    </Text>
                    <Text style={ModalStyle.neetDate}>
                      {formatDateWithOrdinal(String(res.date))}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </Center>
  );
};

/* ---------------- Styles ---------------- */
const ModalStyle = StyleSheet.create({
  modalContent: {
    backgroundColor: "rgba(42, 50, 42,0.8)",
    borderWidth: 2,
    borderColor: "#ADADAD",
    borderStyle: "solid",
    borderRadius: 12,
    overflow: "hidden" }, emojiContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 30 }, 
  closeButtonContainer: {
    position: 'absolute',
    top: hp(5),
    right: wp(6),
    zIndex: 9999,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    width: '100%',
  },
  statColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconContainer: {
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  statValue: {
    fontFamily: 'AppFont-Bold', 
    fontWeight: '800',
    fontSize: wp(5.5),
    lineHeight: wp(6.5),
    textAlign: "center",
  },
  statLabel: {
    fontFamily: 'AppFont-Regular',
    fontWeight: '600',
    fontSize: wp(2.8),
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verticalDivider: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  sleepyImage: {
    width: 32,
    height: 32,
    resizeMode: "contain"
  },

  subjectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#15BBB1",
    marginTop: hp(1.2),
    paddingVertical: 15,
    paddingHorizontal: wp(3),
    borderRadius: 30 }, iconWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center" }, icon: {
    width: wp(7),
    height: hp(3),
    resizeMode: "contain" }, textWrapper: {
    flex: 3,
    alignItems: "center",
    justifyContent: "center" }, subjectText: {
    fontFamily: 'AppFont-Bold', 
    fontWeight: '700',
    fontSize: wp(4.8),
    color: "#FFFFFF",
        textAlign: "center" },
  percentageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center" }, percentageText: {
    fontFamily: 'AppFont-Bold', 
    fontWeight: '700',
    fontSize: wp(4.8),
    color: "#FFFFFF"},

  actSilver: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 183, 194, 0.15)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3
  },
  memberImg: {
    width: 75,
    height: 75,
    resizeMode: "contain",
    marginRight: 16
  },
  memberDetails: {
    flex: 1,
    justifyContent: "center"
  },
  memberTitle: {
    fontFamily: 'AppFont-Bold', 
    fontWeight: '700',
    fontSize: wp(4.4),
    color: COLORS.secondary06,
    marginBottom: 4
  },
  expiryText: {
    fontFamily: 'AppFont-Regular',
    fontWeight: '500',
    fontSize: wp(3.3),
    color: '#4A5568',
    lineHeight: 18
  },

  neetPopUpContainer: {
    backgroundColor: COLORS.light,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    paddingVertical: 20,
    paddingHorizontal: wp(3),
    marginTop: 12 }, neetDate: {
    fontFamily: 'AppFont-Bold', fontSize: 30,
    color: COLORS.secondary06,
        marginTop: 6},
  neetDateText: {
     fontFamily: 'AppFont-Regular', fontSize: 18,
    color: '#2b2b2bff',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 5,
    marginVertical: 10 },
  updateNowButton: {
    backgroundColor: "#15BBB1",
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(4),
    borderRadius: 20,
    marginTop: hp(1.2),
    alignSelf: 'flex-start',
    shadowColor: "#15BBB1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2
  },
  updateNowText: {
    color: '#FFFFFF',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.2),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  } });

export default ModalBox;
