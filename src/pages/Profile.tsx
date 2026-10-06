import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { View, StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator, Modal, Alert, Linking, Animated } from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { CustomText as Text, CustomTextInput as TextInput } from '../components/CustomText';
import { CustomVerticalScrollbar } from '../components/CustomVerticalScrollbar';
import { LinearGradient } from "expo-linear-gradient";
import {
  faPenToSquare,
  faRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import Theme, { COLORS, Color, FontFamily } from "../styles/themes";
import {
  useSafeAreaInsets,
  SafeAreaView
} from "react-native-safe-area-context";
import { horizontalScale, moderateScale } from "../styles/Responsive";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { createProfileFields } from "../service/FormFeilds";
import { ThemeContext } from "../service/authContext";
import GradientButton from "../components/GradientButton";
import DateInput from "../components/DatePicker";
import { getSecureStorage, removeSecureStorage } from "../config/SecureStore";
import { useFormik } from "formik";
import { Wrapper } from "../components/Wrapper";
import HeaderBar from "../navigation/Headerbar";
import { ClipPath, Defs, Path, Rect, Svg, G, Line } from "react-native-svg";
import { Dropdown } from "react-native-element-dropdown";
import Net from "@react-native-community/netinfo";
import { getRequest, putRequest, postRequest } from "../config/Requests";
import { useMutation } from "@tanstack/react-query";
import LogoutPopup from "../components/LogoutPopup";
import { Ionicons } from '@expo/vector-icons';
import { ShineText } from "../components/ShineText";
import ReminderModal from "../components/ReminderModal";
import StatusPopup from "../components/StatusPopup";

const Silver = require("../assets/Silver.png");
const Profile = ({ navigation }: { navigation: any }) => {
  const scrollRef = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: false });
      }
    }, [])
  );

  const [image, setImage] = useState<any>(null);
  const {
    userData,
    setUserData,
    signUpData,
    setSignUpData,
    appState,
    setAppState,
  } = useContext(ThemeContext);
  const [disable, setDisable] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [statusPopup, setStatusPopup] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
  const neetDateFromState = appState?.neetDate || userData?.examDate;
  const [formData, setFormData] = useState(() =>
    createProfileFields(neetDateFromState),
  );

  const [orgType, setOrgType] = useState<"school" | "institute" | "others" | "">("");
  const [institutes, setInstitutes] = useState<{ label: string; value: string }[]>([
    { label: "Pondicherry University", value: "Pondicherry University" },
    { label: "Indian Institute of Technology Madras", value: "Indian Institute of Technology Madras" },
    { label: "Anna University", value: "Anna University" },
    { label: "National Institute of Technology Tiruchirappalli", value: "National Institute of Technology Tiruchirappalli" },
    { label: "Vellore Institute of Technology", value: "Vellore Institute of Technology" }
  ]);

  useEffect(() => {
    getRequest("authentication/institutes")
      .then((res: any) => {
        if (res && Array.isArray(res.data)) {
          const list = res.data.map((name: string) => ({
            label: name,
            value: name
          }));
          setInstitutes(list);
          
          const currentSchool = userData?.schoolName;
          if (currentSchool) {
            const isDbInstitute = res.data.some((name: string) => name === currentSchool);
            if (isDbInstitute) {
              setOrgType("institute");
            } else {
              setOrgType("school");
            }
          } else {
            setOrgType("");
          }
        }
      })
      .catch((err) => {
        console.log("Failed to fetch institutes in profile:", err);
      });
  }, [userData?.schoolName]);

  const handleOrgTypeChange = (type: "school" | "institute" | "others" | "") => {
    setOrgType(type);
    formik.setFieldValue("schoolName", "");
  };

  const formatTo12Hour = (time24?: string) => {
    if (!time24) return '06:00 AM';
    const [hrsStr, minsStr] = time24.split(':');
    let hrs = parseInt(hrsStr, 10);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12;
    const hrsFormatted = hrs < 10 ? `0${hrs}` : hrs;
    return `${hrsFormatted}:${minsStr} ${ampm}`;
  };

  const handleSaveReminders = async (morning: string, evening: string) => {
    try {
      setLoading(true);
      const res = await postRequest({ URL: "authentication/custom-reminders", payload: { morning, evening } });
      if (res && res.data) {
        setUserData(res.data);
        setStatusPopup({
          visible: true,
          type: "success",
          title: "Success",
          message: "Reminder times updated successfully!",
        });
      }
      setShowReminderModal(false);
    } catch (err) {
      console.error("Failed to save custom reminders:", err);
      setStatusPopup({
        visible: true,
        type: "error",
        title: "Error",
        message: "Failed to save settings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  const [loading, setLoading] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [isSocialExpanded, setIsSocialExpanded] = useState(false);
  const socialAnimation = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const response: any = await getRequest("social-links");
      if (response && response.data) {
        setSocialLinks(response.data);
      }
    } catch (error) {
      console.error("Error fetching social links:", error);
    }
  };

  const toggleSocialMenu = () => {
    const toValue = isSocialExpanded ? 0 : 1;
    Animated.spring(socialAnimation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setIsSocialExpanded(!isSocialExpanded);
  };

  useEffect(() => {
    CheckInternetConnectivity();
    getSecureStorage("token")
      .then((token) => {
        if (token != null && token != undefined && token != "") {
        } else {
          navigation.replace("Login");
        }
      })
      .catch((err) => {
        navigation.replace("Login");
      });
  }, []);

  useEffect(() => {
    setFormData(createProfileFields(neetDateFromState));
  }, [neetDateFromState]);

  const validate = (values: any) => {
    const errors: any = {};

    if (!values.firstName) {
      errors.firstName = "First name is required";
    } else if (values.firstName.length < 2) {
      errors.firstName = "First name length grater than 2";
    }
    if (!values.lastName) {
      errors.lastName = "Last name is required";
    } else if (values.lastName.length < 1) {
      errors.firstName = "Last name length grater than 1";
    }
    if (!values.dob) {
      errors.dob = "DOB is required";
    }
    if (!values.std) {
      errors.std = "Standard is required";
    }
    if (!values.gender) {
      errors.gender = "Gender is required";
    }
    if (!values.state) {
      errors.state = "State is required";
    }
    if (!values.phoneNo) {
      errors.phoneNo = "Phone number is required";
    } else if (values.phoneNo.length <= 9) {
      errors.phoneNo = "Phone number minimum length 10";
    }
    if (!values.email) {
      errors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
    ) {
      errors.email = "Invalid email address";
    }

    if (!values.targetYear) {
      errors.targetYear = "Gender is required";
    }

    return errors;
  };

  const createPostMutation = useMutation({
    mutationFn: putRequest,
    onSuccess: (data, variable, context) => {
      if (data.status == 200) {
        setLoading(false);
        setUserData((prev: any) => ({
          ...(prev || {}),
          ...(variable?.payload || {})
        }));
        setDisable(false);
      }
    },
    onError(error: any, variables, context) {
      setLoading(false);
      try {
        console.error("[Profile] Update error:", error?.response || error);
        const serverMsg = error?.response?.data?.message || error?.message || "Unable to update profile. Please try again.";
        Alert.alert("Update Failed", serverMsg);
      } catch (e) {
        console.error("[Profile] onError handling failed:", e);
        Alert.alert("Update Failed", "Unable to update profile. Please try again.");
      }
    }
  });

  const formik: any = useFormik({
    initialValues: {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      dob:
        userData?.dob && typeof userData.dob === "string"
          ? userData.dob.split("T")[0].replaceAll("-", "/")
          : "",
      gender: userData?.gender || "",
      email: userData?.email || "",
      phoneNo: userData?.phoneNo || "",
      std: userData?.std || "",
      state: userData?.state || "Puducherry",
      targetYear: userData?.targetYear || "",
      schoolName: userData?.schoolName || "",
      schoolPin: userData?.schoolPin || ""
    },
    validate: validate,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      // Validate all fields before submitting
      const errors = validate(values);
      if (Object.keys(errors).length > 0) {
        // Mark all fields as touched to show errors
        formik.setTouched(
          Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
        setLoading(false);
        return;
      }

      setLoading(true);

      // Convert DOB back to ISO format (YYYY-MM-DD) before sending to server
      const payload = {
        ...values,
        dob: values.dob ? values.dob.replaceAll("/", "-") : values.dob
      };

      createPostMutation.mutate({
        URL: "authentication/update",
        payload
      });
    }
  });

  const EditProfile = () => {
    setDisable((disable) => !disable);
  };
  const insets = useSafeAreaInsets();

  const SignOut = async () => {
    setShowLogoutPopup(true);
  };

  const handleLogout = async () => {
    setShowLogoutPopup(false);
    try {
      // Notify backend to clear session/deviceId
      await postRequest({ URL: "authentication/log-out", payload: {} });
    } catch (error) {
      console.error("Logout error:", error);
    }
    await removeSecureStorage("token");
    navigation.replace("Login");
  };

  const CheckInternetConnectivity = () => {
    Net.fetch().then((state) => {
      setAppState((prev: any) => ({
        ...prev,
        internetStatus: state.isConnected
      }));
    });
  };

  const handlePress = (num: any) => {
    if (num == 1) {
      Linking.openURL("https://www.gyrusneet.com/termsandconditions");
    } else {
      Linking.openURL("https://www.gyrusneet.com/privacypolicy");
    }
  };

  const getInitials = () => {
    const firstInitial = userData.firstName ? userData.firstName[0] : "";
    return firstInitial.toUpperCase();
  };

  const getPlanName = (plan?: string) => {
    const p = plan?.toLowerCase();
    if (!p || p === 'free' || p === 'silver') return 'SILVER';
    return p.toUpperCase();
  };

  const getPlanColors = (plan?: string) => {
    const p = plan?.toLowerCase();

    // Silver / Free → cohesive soft silver-gray palette
    if (!p || p === "free" || p === "silver") {
      return {
        bg: "rgba(192, 192, 192, 0.15)",     // softer background
        border: "rgba(192, 192, 192, 0.35)", // matching border
        text: "#e3e1e1ff",                      // same silver tone
      };
    }

    // Premium plans → unified blue-cyan palette
    return {
      bg: "rgba(0, 166, 255, 0.15)",        // matches text tone
      border: "rgba(0, 166, 255, 0.35)",    // same family
      text: "#00A6FF",                       // cleaner consistent blue
    };
  };

  const getStandardName = (std?: string) => {
    switch (std) {
      case "XI": return "11th";
      case "XII": return "12th";
      case "R": return "Repeater Course";
      case "C": return "Crash Course";
      default: return std || 'N/A';
    }
  };

  const getHeaderCourseName = (std?: string) => {
    if (std === "XI" || std === "XII") return "Regular Course";
    return getStandardName(std);
  };

  const getGenderName = (gender?: string) => {
    switch (gender) {
      case "M": return "Male";
      case "F": return "Female";
      case "O": return "Others";
      default: return gender || 'N/A';
    }
  };



  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      {/* <View
        style={{
          paddingTop: insets.top,
          paddingRight: insets.right,
          paddingLeft: insets.left,
          backgroundColor: Platform.OS ? "#00474C" : "" } }
      /> */}
      <LinearGradient
        style={styles.androidLarge57}
        colors={["#028464", "#0AB7AD", "#0B7960"]}
      >
        <HeaderBar />
        {!appState.internetStatus && <Wrapper />}

        <CustomVerticalScrollbar
          ref={scrollRef}
          indicatorColor="hsla(185, 100%, 93%, 1.00)"
          style={{ flex: 1 }}
          alwaysBounceVertical={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {appState.internetStatus && (
            <View style={styles.profileContainer}>
              {disable ? (
                <View style={styles.inputTotalContainer}>
                  <View style={styles.profileLogoContainer}>
                    <View style={styles.profileLogo}>
                      <Text style={styles.profileLogoText}>{getInitials()}</Text>
                    </View>
                  </View>
                  <View style={styles.profileInfoIcon}>
                    <Text style={styles.profileInfoText}>EDIT PROFILE</Text>
                    <TouchableOpacity onPress={() => setDisable(false)}>
                      <Ionicons name="close-circle-outline" size={wp(7)} color={Theme.COLORS.light} />
                    </TouchableOpacity>
                  </View>
                  {formData.map((data: any, index: number) => (
                    <View key={data.idx} style={{ marginTop: 2 }}>
                      {data.fieldType == "input" && (
                        data.id === "schoolName" ? (
                          <View style={{ width: "100%", marginTop: hp(0.5), marginBottom: hp(1) }}>
                            {/* Radio Buttons Container */}
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: hp(1.5), width: "100%" }}>
                              {(["school", "institute", "others"] as const).map((type) => {
                                const isSelected = orgType === type;
                                const label = type === "school" ? "School" : type === "institute" ? "Institute/Center" : "Others";
                                return (
                                  <TouchableOpacity
                                    key={type}
                                    onPress={() => handleOrgTypeChange(type)}
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      paddingVertical: hp(0.5)
                                    }}
                                  >
                                    <View
                                      style={{
                                        height: 18,
                                        width: 18,
                                        borderRadius: 9,
                                        borderWidth: 2,
                                        borderColor: "#0AB8AD",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: 6
                                      }}
                                    >
                                      {isSelected && (
                                        <View
                                          style={{
                                            height: 10,
                                            width: 10,
                                            borderRadius: 5,
                                            backgroundColor: "#0AB8AD"
                                          }}
                                        />
                                      )}
                                    </View>
                                    <Text style={{ color: "#FFF", fontSize: wp(3.4), fontFamily: "AppFont-Regular" }}>
                                      {label}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>

                            {/* Conditional input based on selected type */}
                            {orgType === "school" && (
                              <TextInput
                                editable={disable}
                                style={styles.inputField}
                                onChangeText={formik.handleChange("schoolName")}
                                onBlur={formik.handleBlur("schoolName")}
                                value={String(formik.values.schoolName || "")}
                                placeholder="School Name"
                                placeholderTextColor="#999"
                              />
                            )}

                            {orgType === "institute" && (
                              <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                itemTextStyle={{ fontFamily: 'AppFont-Regular', color: '#333' }}
                                data={institutes}
                                labelField="label"
                                valueField="value"
                                disable={!disable}
                                maxHeight={300}
                                placeholder="Select Institute/Center"
                                searchPlaceholder="Search..."
                                value={formik.values.schoolName}
                                onChange={(item) => {
                                  formik.setFieldValue("schoolName", item.value);
                                }}
                              />
                            )}

                            {orgType === "others" && (
                              <TextInput
                                editable={disable}
                                style={styles.inputField}
                                onChangeText={formik.handleChange("schoolName")}
                                onBlur={formik.handleBlur("schoolName")}
                                value={String(formik.values.schoolName || "")}
                                placeholder="Specify Other Name"
                                placeholderTextColor="#999"
                              />
                            )}
                          </View>
                        ) : (
                          <TextInput
                            editable={disable}
                            style={styles.inputField}
                            onChangeText={formik.handleChange(`${data.id}`)}
                            onBlur={formik.handleBlur(`${data.id}`)}
                            value={formik.values[`${data.id}`]}
                            placeholder={data.placeholderName}
                            placeholderTextColor="#999"
                            secureTextEntry={data.id == "password" || data.id == "confirmPassword"}
                            keyboardType={data.id == "phoneNo" || data.id == "schoolPin" ? "numeric" : "default"}
                            maxLength={data.id == "phoneNo" ? 10 : data.id == "schoolPin" ? 6 : undefined}
                          />
                        )
                      )}
                      {data.fieldType == "select" && (
                        <Dropdown
                          style={styles.dropdown}
                          placeholderStyle={styles.placeholderStyle}
                          selectedTextStyle={styles.selectedTextStyle}
                          inputSearchStyle={styles.inputSearchStyle}
                          iconStyle={styles.iconStyle}
                          itemTextStyle={{ fontFamily: 'AppFont-Regular' }}
                          data={data.label}
                          labelField={"label"}
                          valueField={"value"}
                          disable={!disable}
                          maxHeight={300}
                          placeholder={data.placeholderName}
                          searchPlaceholder="Search..."
                          value={formik.values[`${data.id}`]}
                          onChange={(item) => {
                            formik.setFieldValue(`${data.id}`, item.value);
                          }}
                        />
                      )}
                      {data.fieldType == "date" && disable && <DateInput formik={formik} />}
                      {formik.errors[data.id] && formik.touched[data.id] ? (
                        <Text style={styles.errorText}>{formik.errors[`${data.id}`]}</Text>
                      ) : null}
                    </View>
                  ))}
                  <View style={{ marginTop: hp(2) }}>
                    <GradientButton
                      onPress={() => {
                        formik.setTouched(
                          Object.keys(formik.values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                        );
                        formik.handleSubmit();
                      }}
                      loading={loading}
                      colors={["#00b7c2ff", "#c5fff480"]}
                      Text={<Text style={{ fontFamily: 'AppFont-Bold' }}>Update</Text>}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.displayContainer}>
                  {/* Header Section */}
                  <View style={styles.headerTopRow}>
                    <View style={styles.avatarWrapper}>
                      <View style={styles.avatarMain}>
                        <Text style={styles.avatarChar}>{getInitials()}</Text>
                      </View>
                      <View style={[styles.statusDot, { backgroundColor: userData?.planValid ? '#4CAF50' : '#d5d5d5ff' }]} />
                    </View>
                    <TouchableOpacity style={styles.editBtnDisplay} onPress={() => setDisable(true)}>
                      <Ionicons name="create-outline" size={wp(4.5)} color="white" />
                      <Text style={styles.editBtnText}>Edit Profile</Text>
                    </TouchableOpacity>
                  </View>

                  <ShineText
                    text={`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || 'User Name'}
                    fontSize={wp(7)}
                    width={wp(80)}
                    height={wp(7) * 1.5}
                    marginBottom={hp(1)}
                    isReverse={false}
                    align="left"
                    gradientId="profile-username-shine"
                  />

                  <View style={styles.badgeRow}>
                    {/* <View style={styles.badgeItem}>
                      <Text style={styles.badgeText}>{String(userData?.accType || 'Student').charAt(0).toUpperCase() + String(userData?.accType || 'Student').slice(1)}</Text>
                    </View> */}
                    <View style={[styles.badgeItem, styles.badgeActive]}>
                      <Text style={[styles.badgeText, styles.badgeTextActive]}>{getHeaderCourseName(userData?.std).toUpperCase()}</Text>
                    </View>
                    {/* <View style={[styles.badgeItem, { backgroundColor: getPlanColors(userData?.plan).bg, borderColor: getPlanColors(userData?.plan).border }]}>
                      <Text style={[styles.badgeText, { color: getPlanColors(userData?.plan).text, fontFamily: 'AppFont-Bold' }]}>{getPlanName(userData?.plan)}</Text>
                    </View> */}
                    <View style={[styles.badgeItem]}>
                      <Text style={[styles.badgeText, { fontFamily: 'AppFont-Bold' }]}>NEET</Text>
                    </View>
                  </View>

                  {/* Membership Card */}
                  {/* Membership Card */}
                  {(() => {
                    const titleText = userData?.isTrial ? "GOLD" : (userData?.planValid && userData?.planId?.name ? userData.planId.name : "SILVER");
                    const isTrial = !!userData?.isTrial || String(titleText).toLowerCase().includes('trial') || (userData?.planValid && userData?.isTrial);
                    const isGold = !!userData?.isTrial || String(titleText).toLowerCase().includes('gold');
                    const isSilver = !userData?.planValid || String(titleText).toLowerCase().includes('silver');

                    // Determine theme styling dynamically
                    const getTheme = () => {
                      if (isGold) {
                        return {
                          cardStyle: styles.trialCard,
                          titleColor: '#E5C07B',
                          subTitleColor: '#E5C07B',
                          progressColors: ['#F6E27A', '#CB9B51', '#F6E27A'] as const,
                          progressBorder: 'rgba(203, 155, 81, 0.3)',
                          trackBorder: 'rgba(203, 155, 81, 0.2)',
                          btnColors: ["#3A5A58", "#2E4745"] as const,
                          btnBorder: '#E5C07B',
                          textColor: '#E5C07B',
                          subTextColor: '#A0AAB2'
                        };
                      } else if (isSilver) {
                        return {
                          cardStyle: styles.silverCard,
                          titleColor: '#E0E0E0',
                          subTitleColor: '#C0C0C0',
                          progressColors: ['#E0E0E0', '#909090', '#E0E0E0'] as const,
                          progressBorder: 'rgba(192, 192, 192, 0.3)',
                          trackBorder: 'rgba(192, 192, 192, 0.2)',
                          btnColors: ["#505050", "#2b2b2b"] as const,
                          btnBorder: '#C0C0C0',
                          textColor: '#E0E0E0',
                          subTextColor: '#A0AAB2'
                        };
                      } else {
                        return {
                          cardStyle: {}, // default transparent teal background applied by actSilver base
                          titleColor: '#FFFFFF',
                          subTitleColor: '#15BBB1',
                          progressColors: ['#22E2D6', '#15BBB1', '#0D7F78'] as const,
                          progressBorder: 'rgba(21, 187, 177, 0.3)',
                          trackBorder: 'rgba(21, 187, 177, 0.2)',
                          btnColors: ["#22E2D6", "#15BBB1", "#0D7F78"] as const,
                          btnBorder: 'transparent',
                          textColor: '#15BBB1',
                          subTextColor: '#D1D5DB'
                        };
                      }
                    };

                    const theme = getTheme();

                    return (
                      <View style={[styles.actSilver, theme.cardStyle]}>
                        <Image 
                          source={(userData?.planValid && userData?.planId?.img) ? { uri: userData?.planId?.img } : Silver} 
                          style={styles.memberImg} 
                        />
                        <View style={styles.memberDetails}>
                          <Text style={[styles.memberTitle, { color: theme.titleColor, fontSize: wp(5), marginBottom: 0, textTransform: 'uppercase' }]}>{titleText}</Text>
                          <Text style={[styles.memberTitle, { color: theme.subTitleColor, fontSize: wp(3.5), fontWeight: 'normal', letterSpacing: 2, marginBottom: hp(0.5) }]}>
                            {isTrial ? "TRIAL" : "MEMBER"}
                          </Text>

                          {userData?.planValid && (() => {
                            const expiryDate = (() => {
                              if (userData?.isTrial && userData?.planValid && userData?.trialActivatedAt) {
                                return new Date(new Date(userData.trialActivatedAt).getTime() + 14 * 24 * 60 * 60 * 1000);
                              }
                              if (userData?.planValid && userData?.planActivatedAt && userData?.planId?.days) {
                                return new Date(new Date(userData.planActivatedAt).getTime() + Number(userData.planId.days) * 24 * 60 * 60 * 1000);
                              }
                              return userData?.planExpiry;
                            })();

                            return expiryDate ? (
                              <View style={styles.expiryContainer}>
                                {(() => {
                                  const currentMs = new Date().getTime();
                                  const targetMs = new Date(expiryDate).getTime();
                                  let startMs = userData?.trialActivatedAt ? new Date(userData.trialActivatedAt).getTime() : 
                                                userData?.planActivatedAt ? new Date(userData.planActivatedAt).getTime() : 
                                                (targetMs - ((userData?.isTrial ? 14 : (userData?.planId?.days || 30)) * 24 * 60 * 60 * 1000));
                                  
                                  if (startMs >= targetMs) {
                                    startMs = targetMs - (14 * 24 * 60 * 60 * 1000);
                                  }

                                  const totalDuration = targetMs - startMs;
                                  const remainingDuration = targetMs - currentMs;
                                  const progressPercent = Math.min(100, Math.max(0, (remainingDuration / totalDuration) * 100));

                                  let diff = Math.ceil(remainingDuration / (1000 * 60 * 60 * 24));
                                  diff = diff < 0 ? 0 : diff;

                                  return (
                                    <>
                                      {!isSilver && (
                                        <View style={[styles.trialProgressBarContainer, { borderColor: theme.progressBorder }]}>
                                          <View style={[styles.trialProgressBarTrack, { borderColor: theme.trackBorder }]} />
                                          <LinearGradient
                                            colors={theme.progressColors}
                                            start={{ x: 0, y: 0.5 }}
                                            end={{ x: 1, y: 0.5 }}
                                            style={[styles.trialProgressBarFill, { width: `${progressPercent}%` }]}
                                          />
                                        </View>
                                      )}
                                      
                                      <Text style={[styles.daysRemainingText, { color: theme.textColor, marginBottom: hp(0.5), textAlign: 'center' }]}>
                                        {diff} Days Remaining
                                      </Text>

                                      <Text style={[styles.expiryText, { color: theme.subTextColor }]}>
                                        {isTrial ? '*' : ''}Valid until {new Date(expiryDate).toLocaleDateString("en-GB")}
                                      </Text>
                                    </>
                                  );
                                })()}

                                {(() => {
                                  const daysRem = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                  const showButton = isTrial || isSilver || daysRem <= 5;

                                  return showButton ? (
                                    <TouchableOpacity
                                      style={{ marginTop: hp(1), alignSelf: 'center' }}
                                      onPress={() => navigation.navigate("Plans")}
                                    >
                                      <LinearGradient
                                        colors={theme.btnColors}
                                        style={[styles.updateNowButton, { borderColor: theme.btnBorder, borderWidth: theme.btnBorder !== 'transparent' ? 1 : 0 }]}
                                      >
                                        <Text style={[styles.updateNowText, { color: theme.btnBorder !== 'transparent' ? theme.btnBorder : '#FFFFFF' }]}>UPGRADE NOW</Text>
                                      </LinearGradient>
                                    </TouchableOpacity>
                                  ) : null;
                                })()}
                              </View>
                            ) : null;
                          })()}
                          
                          {!userData?.planValid && (
                            <TouchableOpacity
                              style={{ marginTop: hp(0.5), alignSelf: 'center' }}
                              onPress={() => navigation.navigate("Plans")}
                            >
                              <LinearGradient
                                colors={theme.btnColors}
                                style={[styles.updateNowButton, { borderColor: theme.btnBorder, borderWidth: theme.btnBorder !== 'transparent' ? 1 : 0 }]}
                              >
                                <Text style={[styles.updateNowText, { color: theme.btnBorder !== 'transparent' ? theme.btnBorder : '#FFFFFF' }]}>UPGRADE NOW</Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })()}

                  {/* Personal Info */}
                  <Text style={styles.sectionTitle}>PERSONAL INFO</Text>
                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={styles.cardLabel}>FIRST NAME</Text>
                      <Text style={styles.cardValue}>{userData?.firstName || 'N/A'}</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={styles.cardLabel}>LAST NAME</Text>
                      <Text style={styles.cardValue}>{userData?.lastName || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={styles.cardLabel}>GENDER</Text>
                      <Text style={styles.cardValue}>{getGenderName(userData?.gender)}</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={styles.cardLabel}>LOCATION</Text>
                      <Text style={styles.cardValue}>{userData?.state || 'Puducherry'}</Text>
                    </View>
                  </View>

                  {/* Academic Details */}
                  <Text style={styles.sectionTitle}>ACADEMIC DETAILS</Text>
                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={styles.cardLabel}>COURSE</Text>
                      <Text style={styles.cardValue}>NEET</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={styles.cardLabel}>BATCH YEAR</Text>
                      <Text style={styles.cardValue}>{userData?.targetYear || '----'}</Text>
                    </View>
                  </View>
                  <View style={styles.fullWidthCard}>
                    <Text style={styles.cardLabel}>SCHOOL / INSTITUTION</Text>
                    <Text style={styles.cardValue}>{userData?.schoolName || 'N/A'}</Text>
                  </View>
                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={styles.cardLabel}>CLASS</Text>
                      <Text style={styles.cardValue}>{getStandardName(userData?.std)}</Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={styles.cardLabel}>PIN CODE</Text>
                      <Text style={styles.cardValue}>{userData?.schoolPin || 'N/A'}</Text>
                    </View>
                  </View>

                  {/* Contact Info */}
                  <Text style={styles.sectionTitle}>CONTACT INFO</Text>
                  <View style={styles.contactRowItem}>
                    <View style={styles.contactIconContainer}>
                      <Ionicons name="mail-outline" size={wp(5)} color="#e4fff8ff" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.cardLabel}>EMAIL</Text>
                      <Text style={styles.cardValue}>{userData?.email || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.contactRowItem}>
                    <View style={styles.contactIconContainer}>
                      <Ionicons name="call-outline" size={wp(5)} color="#e4fff8ff" />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.cardLabel}>PHONE</Text>
                      <Text style={styles.cardValue}>+91 {userData?.phoneNo || 'N/A'}</Text>
                    </View>
                  </View>

                  {Boolean(userData?.planValid) && (
                    <>
                      <Text style={styles.sectionTitle}>STUDY REMINDERS</Text>
                      <TouchableOpacity
                        style={styles.contactRowItem}
                        onPress={() => setShowReminderModal(true)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.contactIconContainer}>
                          <Ionicons name="time-outline" size={wp(5)} color="#e4fff8ff" />
                        </View>
                        <View style={styles.contactDetails}>
                          <Text style={styles.cardLabel}>CUSTOM PUSH NOTIFICATIONS</Text>
                          <Text style={styles.cardValue}>
                            Morning: {formatTo12Hour(userData?.morningReminderTime || '06:00')}{'\n'}Evening: {formatTo12Hour(userData?.eveningReminderTime || '20:00')}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={wp(5)} color="#C5FFF4" style={{ marginLeft: 'auto' }} />
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Footer Links & Logout */}
                  <View style={styles.footerActionRow}>
                    <View style={styles.legalLinks}>
                      <TouchableOpacity onPress={() => handlePress(1)}>
                        <Text style={styles.legalLinkText}>Terms & Conditions</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handlePress(2)}>
                        <Text style={styles.legalLinkText}>Privacy Policy</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.logoutBtnNew} onPress={SignOut}>
                      <Text style={styles.logoutBtnTextNew}>Logout</Text>
                      <Ionicons name="log-out-outline" size={wp(5)} color="#C5FFF4" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </CustomVerticalScrollbar>
        <LogoutPopup
          visible={showLogoutPopup}
          onClose={() => setShowLogoutPopup(false)}
          onLogout={handleLogout}
        />

        {/* Social Links FAB */}
        {socialLinks.length > 0 && (
          <View style={styles.fabContainer}>
            {socialLinks.map((item, index) => {
              const translateY = socialAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -hp(6) * (index + 1)],
              });
              const opacity = socialAnimation;

              return (
                <Animated.View
                  key={item._id || index}
                  style={[
                    styles.subFab,
                    {
                      transform: [{ translateY }],
                      opacity,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => item.link && Linking.openURL(item.link)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.image }} style={styles.fabIcon} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
            <TouchableOpacity
              style={styles.mainFab}
              onPress={toggleSocialMenu}
              activeOpacity={0.9}
            >
              <Ionicons
                name={isSocialExpanded ? "close" : "link-outline"}
                size={wp(5)}
                color="white"
              />
            </TouchableOpacity>
          </View>
        )}
        <ReminderModal
          isVisible={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          onSave={handleSaveReminders}
          initialMorning={userData?.morningReminderTime}
          initialEvening={userData?.eveningReminderTime}
        />
        <StatusPopup
          visible={statusPopup.visible}
          type={statusPopup.type}
          title={statusPopup.title}
          message={statusPopup.message}
          onClose={() => setStatusPopup(prev => ({ ...prev, visible: false }))}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#014b51ff"
  },
  androidLarge57: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
    width: "100%"
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: hp(2)
  },
  profileContainer: {
    marginTop: hp(2),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: wp(5),
    width: wp(90),
    maxWidth: 450
  },
  profileLogoContainer: {
    marginBottom: hp(2),
    alignItems: "center"
  },
  profileLogo: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: "#0A5051",
    justifyContent: "center",
    alignItems: "center"
  },
  profileLogoText: {

    color: "#FFFFFF",
    fontFamily: 'AppFont-Bold', fontSize: hp(4)
  },
  inputTotalContainer: {
    backgroundColor: "#2f2f2f73",
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    borderRadius: 10,
    width: "100%",
    alignSelf: "center"
  },
  profileInfoIcon: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: hp(2),
    paddingHorizontal: wp(2)
  },
  profileInfoText: {

    fontFamily: 'AppFont-Bold', fontSize: hp(1.8),
    color: Theme.COLORS.light
  },
  inputField: {
    fontFamily: 'AppFont-Regular',
    fontSize: moderateScale(16),
    marginBottom: hp(2),
    height: hp(6),
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    backgroundColor: "white",
    width: "100%",
    alignSelf: "center",
    color: "#333",
  },
  dropdown: {
    height: hp(6),
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    marginBottom: hp(2),
    width: "100%",
    alignSelf: "center"
  },
  placeholderStyle: {
    fontFamily: 'AppFont-Regular',
    fontSize: moderateScale(16),
    color: "#999"
  },
  selectedTextStyle: {
    fontFamily: 'AppFont-Regular',
    fontSize: moderateScale(16),
    color: "#333",
  },
  iconStyle: {
    width: 22,
    height: 22
  },
  inputSearchStyle: {
    height: 40,
    fontFamily: 'AppFont-Regular', fontSize: 16,
    backgroundColor: "#FFFFFF"
  },
  errorText: {

    fontFamily: 'AppFont-Regular', fontSize: hp(1.7),
    color: "#FFEA00",
    paddingHorizontal: wp(2),
    marginBottom: hp(1),
    textAlign: "center"
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: hp(2),
    width: "100%",
    alignSelf: "center"
  },
  linkText: {

    color: "white",
    textDecorationLine: "underline",
    fontFamily: 'AppFont-Regular', fontSize: hp(1.6)
  },
  logoutContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp(3),
    width: "100%",
    alignSelf: "center"
  },
  logoutButton: {
    display: "flex",
    flexDirection: "row",
    width: wp(40),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    justifyContent: "space-between",
    borderRadius: wp(2),
    backgroundColor: "#ffffff1a"
  },
  logoutText: {
    color: COLORS.secondary04,
    fontFamily: 'AppFont-Bold',
    fontSize: hp(2),
    textAlign: "center"
  },
  // New Styles for Display View
  displayContainer: {
    width: "100%",
    paddingHorizontal: wp(2),
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: hp(2),
  },
  avatarWrapper: {
    position: "relative",
  },
  statusDot: {
    position: "absolute",
    bottom: wp(0.5),
    right: wp(1),
    width: wp(4.5),
    height: wp(4.5),
    borderRadius: wp(2.25),
    zIndex: 1,
  },
  avatarMain: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    backgroundColor: "#38C4A0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarChar: {
    color: "white",
    fontFamily: 'AppFont-Bold',
    fontSize: wp(10),
  },
  editBtnDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginTop: hp(1),
  },
  editBtnText: {
    color: "white",
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.5),
    marginLeft: wp(1.5),
  },
  displayUserName: {
    color: "white",
    fontFamily: 'AppFont-Bold',
    fontSize: wp(7),
    marginBottom: hp(1),
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(3),
  },
  badgeItem: {
    paddingVertical: hp(0.4),
    paddingHorizontal: wp(3),
    borderRadius: wp(4),
    backgroundColor: "rgba(10, 80, 81, 0.5)",
    marginRight: wp(2),
  },
  badgeActive: {
    backgroundColor: "rgba(56, 196, 160, 0.2)",
    borderWidth: 1,
    borderColor: "#c6f0e6ff",
  },
  badgeOrange: {
    backgroundColor: "rgba(255, 138, 0, 0.1)",
    borderWidth: 1,
    borderColor: "#FF8A00",
  },
  badgeText: {
    color: "#99D1C1",
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3),
  },
  badgeTextActive: {
    color: "#c6f0e6ff",
    fontFamily: 'AppFont-Bold',
  },
  badgeTextOrange: {
    color: "#FF8A00",
    fontFamily: 'AppFont-Bold',
  },
  sectionTitle: {
    color: "#99D1C1",
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.2),
    letterSpacing: 1,
    marginBottom: hp(1.5),
    marginTop: hp(1),
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1.5),
  },
  gridCol: {
    width: "48%",
    backgroundColor: "rgba(10, 80, 81, 0.4)",
    borderRadius: wp(3),
    padding: wp(3),
  },
  fullWidthCard: {
    width: "100%",
    backgroundColor: "rgba(10, 80, 81, 0.4)",
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(1.5),
  },
  cardLabel: {
    color: "rgba(153, 209, 193, 0.7)",
    fontFamily: 'AppFont-Bold',
    fontSize: wp(2.8),
    marginBottom: hp(0.5),
  },
  cardValue: {
    color: "white",
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.2),
  },
  contactRowItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10, 80, 81, 0.4)",
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(1.5),
  },
  contactIconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2),
    backgroundColor: "rgba(56, 196, 160, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(56, 196, 160, 0.2)",
    marginRight: wp(3),
  },
  contactDetails: {
    flex: 1,
  },
  footerActionRow: {
    marginTop: hp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: hp(2),
  },
  legalLinks: {
    flexDirection: "row",
  },
  legalLinkText: {
    color: "#99D1C1",
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.2),
    textDecorationLine: "underline",
    marginRight: wp(4),
  },
  logoutBtnNew: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  logoutBtnTextNew: {
    color: "#C5FFF4",
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.8),
    marginRight: wp(2),
  },
  fabContainer: {
    position: "absolute",
    bottom: hp(2),
    right: wp(5),
    alignItems: "center",
    justifyContent: "center",
  },
  mainFab: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "#38C4A0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  subFab: {
    position: "absolute",
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  fabIcon: {
    width: wp(8),
    height: wp(8),
    resizeMode: "contain",
  },
  actSilver: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.30)",
    marginTop: hp(2),
    marginBottom: hp(2),
    padding: wp(4),
    borderRadius: wp(4),
    borderWidth: 0,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.15,
    // shadowRadius: 8,
    // elevation: 4,
  },
  memberImg: {
    width: wp(20),
    height: wp(20),
    resizeMode: "contain",
    marginBottom: hp(2),
  },
  memberDetails: {
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
  },
  memberTitle: {
    fontFamily: 'AppFont-Bold', 
    fontSize: wp(4.5),
    color: "#FFFFFF",
    marginBottom: hp(0.5),
    textAlign: "center",
  },
  expiryContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  expiryText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3),
    color: 'rgba(153, 209, 193, 0.9)',
    marginBottom: hp(0.5),
    textAlign: "center",
  },
  daysRemainingBadge: {
    backgroundColor: 'rgba(21, 187, 177, 0.15)',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(1.5),
    borderWidth: 1,
    borderColor: 'rgba(21, 187, 177, 0.5)',
    marginBottom: hp(1),
  },
  daysRemainingText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(2.8),
    color: '#15BBB1',
    textAlign: "center",
  },
  updateNowButton: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(5),
    borderRadius: wp(5),
    marginTop: hp(0.5),
  },
  updateNowText: {
    color: '#FFFFFF',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3),
    textTransform: 'uppercase',
  },
  trialCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    borderColor: '#CB9B51',
    borderWidth: 1.5,
  },
  silverCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    borderColor: '#C0C0C0',
    borderWidth: 1.5,
  },
  trialProgressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    marginTop: hp(0.5),
    marginBottom: hp(1),
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(203, 155, 81, 0.3)',
  },
  trialProgressBarTrack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderRadius: 4,
  },
  trialProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  }
});

export default Profile;
