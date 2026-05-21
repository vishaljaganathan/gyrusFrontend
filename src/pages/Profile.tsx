import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert , Linking, Animated} from 'react-native'
import { useFocusEffect } from '@react-navigation/native';
import { CustomText as Text, CustomTextInput as TextInput } from '../components/CustomText';
import { CustomVerticalScrollbar } from '../components/CustomVerticalScrollbar';
import { LinearGradient } from "expo-linear-gradient";
import {
  faPenToSquare,
  faRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import Theme, { COLORS, Color, FontFamily } from "../styles/themes";
import {
  useSafeAreaInsets,
  SafeAreaView} from "react-native-safe-area-context";
import { horizontalScale, moderateScale } from "../styles/Responsive";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp} from "react-native-responsive-screen";
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
  const neetDateFromState = appState?.neetDate || userData?.examDate;
  const [formData, setFormData] = useState(() =>
    createProfileFields(neetDateFromState),
  );
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
          ...(variable?.payload || {})}));
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
    }});

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
      schoolPin: userData?.schoolPin || ""},
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
        payload});
    }});

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
        internetStatus: state.isConnected}));
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

                  <Text style={styles.displayUserName}>{userData?.firstName} {userData?.lastName}</Text>
                  
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
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#014b51ff"},
  androidLarge57: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
    width: "100%"},
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: hp(2)},
  profileContainer: {
    marginTop: hp(2),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: wp(5),
    width: wp(90),
    maxWidth: 450},
  profileLogoContainer: {
    marginBottom: hp(2),
    alignItems: "center"},
  profileLogo: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: "#0A5051",
    justifyContent: "center",
    alignItems: "center"},
  profileLogoText: {
    
    color: "#FFFFFF",
    fontFamily: 'AppFont-Bold', fontSize: hp(4)},
  inputTotalContainer: {
    backgroundColor: "#2f2f2f73",
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    borderRadius: 10,
    width: "100%",
    alignSelf: "center"},
  profileInfoIcon: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: hp(2),
    paddingHorizontal: wp(2)},
  profileInfoText: {
    
    fontFamily: 'AppFont-Bold', fontSize: hp(1.8),
        color: Theme.COLORS.light},
  inputField: {
    fontFamily: 'AppFont-Regular', 
    fontSize: moderateScale(16),
    marginBottom: hp(2),
    height: hp(6),
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    backgroundColor: "white",
    width: "100%",
    alignSelf: "center"},
  dropdown: {
    height: hp(6),
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    marginBottom: hp(2),
    width: "100%",
    alignSelf: "center"},
  placeholderStyle: { 
    fontFamily: 'AppFont-Regular',
    fontSize: moderateScale(16),
    color: "#999"},
  selectedTextStyle: { 
    fontFamily: 'AppFont-Regular',
    fontSize: moderateScale(16)},
  iconStyle: {
    width: 22,
    height: 22},
  inputSearchStyle: {
    height: 40,
    fontFamily: 'AppFont-Regular', fontSize: 16,
    backgroundColor: "#FFFFFF"},
  errorText: {
    
    fontFamily: 'AppFont-Regular', fontSize: hp(1.7),
    color: "#FFEA00",
    paddingHorizontal: wp(2),
    marginBottom: hp(1),
    textAlign: "center"},
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: hp(2),
    width: "100%",
    alignSelf: "center"},
  linkText: {
    
    color: "white",
    textDecorationLine: "underline",
    fontFamily: 'AppFont-Regular', fontSize: hp(1.6)},
  logoutContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp(3),
    width: "100%",
    alignSelf: "center"},
  logoutButton: {
    display: "flex",
    flexDirection: "row",
    width: wp(40),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    justifyContent: "space-between",
    borderRadius: wp(2),
    backgroundColor: "#ffffff1a"},
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
});

export default Profile;
