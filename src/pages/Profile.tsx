import React, { useEffect, useState, useContext } from "react";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert , Linking, ScrollView} from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from '../components/CustomText';
import { LinearGradient } from "expo-linear-gradient";
import {
  faPenToSquare,
  faRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import Theme, { COLORS, Color } from "../styles/themes";
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
import { putRequest, postRequest } from "../config/Requests";
import { useMutation } from "@tanstack/react-query";
import LogoutPopup from "../components/LogoutPopup";





const Profile = ({ navigation }: { navigation: any }) => {
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

        <ScrollView
          style={{ flex: 1 }}
          alwaysBounceVertical={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {appState.internetStatus && (
            <View style={styles.profileContainer}>
              <View style={styles.inputTotalContainer}>
                <View style={styles.profileLogoContainer}>
                  <View style={styles.profileLogo}>
                    <Text style={styles.profileLogoText}>{getInitials()}</Text>
                  </View>
                </View>
                <View style={styles.profileInfoIcon}>
                  <Text style={styles.profileInfoText}>PROFILE INFO</Text>
                  {!disable && (
                    <TouchableOpacity onPress={EditProfile}>
                      <FontAwesomeIcon
                        size={wp(5.5)}
                        icon={faPenToSquare}
                        color={Theme.COLORS.light}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {formData.map((data: any, index: number) => {
                  return (
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
                          secureTextEntry={
                            data.id == "password" ||
                            data.id == "confirmPassword"
                              ? true
                              : false
                          }
                          keyboardType={
                            data.id == "phoneNo" || data.id == "schoolPin"
                              ? "numeric"
                              : "default"
                          }
                          maxLength={
                            data.id == "phoneNo"
                              ? 10
                              : data.id == "schoolPin"
                                ? 6
                                : undefined
                          }
                        />
                      )}
                      {data.fieldType == "select" && (
                        <>
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
                        </>
                      )}
                      {data.fieldType == "date" && disable && (
                        <DateInput formik={formik} />
                      )}
                      {formik.errors[data.id] && formik.touched[data.id] ? (
                        <Text style={styles.errorText}>
                          {formik.errors[`${data.id}`]}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}

                <View style={{ marginTop: hp(2) }}>
                  {disable ? (
                    <GradientButton
                      onPress={() => {
                        // Mark all fields as touched to show validation errors
                        formik.setTouched(
                          Object.keys(formik.values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                        );
                        formik.handleSubmit();
                      }}
                      loading={loading}
                      colors={["#00b7c2ff)", "#c5fff480"]}
                      Text={<Text style={{ fontFamily: 'AppFont-Bold' }}>Update</Text>}
                    />
                  ) : null}
                  <View style={styles.linksContainer}>
                    <TouchableOpacity onPress={() => handlePress(1)}>
                      <Text style={styles.linkText}>Terms & Conditions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handlePress(2)}>
                      <Text style={styles.linkText}>Privacy Policy</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.logoutContainer}>
                    <Pressable style={styles.logoutButton} onPress={SignOut}>
                      <Text style={styles.logoutText}>Logout</Text>
                      <FontAwesomeIcon
                        style={{ paddingVertical: hp(1.3) }}
                        color={COLORS.secondary04}
                        icon={faRightFromBracket}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
        <LogoutPopup
          visible={showLogoutPopup}
          onClose={() => setShowLogoutPopup(false)}
          onLogout={handleLogout}
        />
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
    fontFamily: 'AppFont-Bold', fontSize: hp(2),
        textAlign: "center"}});

export default Profile;
