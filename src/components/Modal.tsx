import React, { useContext, useState, useEffect } from "react";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Alert } from 'react-native'
import { Ionicons as Icon } from '@expo/vector-icons';
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





const ModalBox = ({
  showModal,
  modelData,
  setShowModal,
  showEmoji,
  report,
  streakData } : ModalProps) => {
  const StreaksImage = require("../assets/stricks.png");
  const SleepyImage = require("../assets/sleepyface.png");
  const themeContext = useContext(ThemeContext);
  const { userData, setAppState, appState } = themeContext;
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
          {/* Emoji Section */}
          {showEmoji ? (
            <Modal.Body style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>

              <View style={ModalStyle.emojiContainer}>
                <View style={ModalStyle.streakContainer}>
                  <Image source={StreaksImage}
            style={ModalStyle.streakImage} />
                  <Text style={ModalStyle.streakText}>
                    {streakData?.active}
                  </Text>
                </View>
                <View style={ModalStyle.sleepyContainer}>
                  <Image source={SleepyImage}
            style={ModalStyle.sleepyImage} />
                  <Text style={ModalStyle.streakText}>
                    {Math.max(0, Math.abs(Number(streakData?.inactive) || 0))}
                  </Text>
                </View>
              </View>
            </Modal.Body>
          ) : (
            <Modal.Header style={{ backgroundColor: "transparent", borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 }}>
              <Modal.CloseButton style={{ padding: 5, zIndex: 2 }} />
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
                    <View
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
                    </View>
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
                          {daysUntil(res.expiryDate) <= 5 && (
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
                      ) : (
                        <GradientButton
                          onPress={() => {
                            setShowModal(false);
                            navigation.navigate("Plans");
                          }}
                          colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
                          Text="Upgrade"
                          textStyle={{ fontWeight: "bold" }}
                        />
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
    paddingVertical: 10,
    gap: 10 }, streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 100 }, sleepyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 100 }, streakImage: {
    width: 40,
    height: hp(4),
    resizeMode: "contain" }, sleepyImage: {
    width: 40,
    height: hp(4),
    resizeMode: "contain" }, streakText: {
    fontFamily: 'AppFont-Bold', 
    fontWeight: '700',
    fontSize: 18,
    color: "#FFFFFF"},

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
    padding: 12,
    borderRadius: 9 }, memberImg: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginRight: 12 }, memberDetails: {
    flex: 1,
    justifyContent: "center" }, memberTitle: {
    fontFamily: 'AppFont-Bold', 
    fontWeight: '700',
    fontSize: wp(4.2),
    color: COLORS.secondary06,
        marginBottom: 6 },
  expiryText: {
    fontFamily: 'AppFont-Regular',
    fontWeight: '500',
    fontSize: wp(3.2),
    color: '#000000' },

  neetPopUpContainer: {
    backgroundColor: COLORS.light,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    paddingVertical: 20,
    paddingHorizontal: wp(3),
    marginTop: 12 }, neetDate: {
    fontFamily: 'AppFont-Regular', fontSize: 22,
    color: COLORS.primary09,
        marginTop: 6,
    textShadowColor: "black",
    textShadowRadius: 0.5,
    textShadowOffset: { width: 1, height: 1 }},
  neetDateText: {
     fontFamily: 'AppFont-Regular', fontSize: 16,
    color: '#2b2b2bff',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 5,
    marginVertical: 10 },
  updateNowButton: {
    backgroundColor: "#15BBB1",
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
    borderRadius: 5,
    marginTop: hp(0.8),
    alignSelf: 'flex-start'
  },
  updateNowText: {
    color: '#FFFFFF',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.2),
    fontWeight: '700'
  } });

export default ModalBox;
