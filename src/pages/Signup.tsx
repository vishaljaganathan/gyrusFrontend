import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ScrollView,
  TouchableOpacity, // Added TouchableOpacity
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../styles/themes";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { createSignUpFields } from "../service/FormFeilds";
import { postRequest } from "../config/Requests";
import { useMutation } from "@tanstack/react-query";
import { ThemeContext } from "../service/authContext";
import Animated, { ZoomInDown } from "react-native-reanimated";
import GradientButton from "../components/GradientButton";
import { useFormik } from "formik";
import { moderateScale } from "../styles/Responsive";
import { Dropdown } from "react-native-element-dropdown";
import DateInput from "../components/DatePicker";
import { AxiosError } from "axios";
import Icon from "react-native-vector-icons/Feather";

const SignUp = ({ navigation }: { navigation: any }) => {
  const logo = require("../assets/appLogo.png");
  const [page, setPage] = useState(0);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userData, setUserData, signUpData, setSignUpData, appState } =
    useContext(ThemeContext);
  const [loginMsg, setLoginMsg] = useState("");

  const [showPassword, setShowPassword] = useState(false); // Ensure state is declared
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Ensure state is declared

  const createPostMutation = useMutation({
    mutationFn: postRequest,
    onSuccess: (data, variable, context) => {
      // console.log(data);
      // console.log(data.data);
      if (data.status == 201) {
        setLoading(false);
        setSignUpData(data.data);
        navigation.navigate("Otp", { id: data.data._id, otp: Number(data.data.otp) }); // Use navigation prop
      }
    },
    onError(error: AxiosError, variables, context) {
      // console.log(error.response, "ffe");
      setLoading(false);
      let Error: any = error.response?.data;
      if (error.status == 400) {
        setLoginMsg(Error.message);
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 5000);
      }
    },
  });

  const checkPostMutation = useMutation({
    mutationFn: postRequest,
    onSuccess: (data, variable, context) => {
      if (data.status == 200) {
        setLoading(false);
        setPage(1);
        formik.resetForm({
          values: formik.values,
          isValid: false,
          dirty: false,
        });
      }
    },
    onError(error: AxiosError, variables, context) {
      setLoading(false);
      let Error: any = error.response?.data;
      if (error.status == 406) {
        setLoginMsg(Error.message);
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 5000);
      }
    },
  });

  const validate = (values: any) => {
    const errors: any = {};
    if (page) {
      if (!values.password) {
        errors.password = "Password is required";
      } else if (values.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
      if (!values.confirmPassword) {
        errors.confirmPassword = "Confirm password is required";
      } else if (values.confirmPassword != values.password) {
        errors.confirmPassword = "Confirm password must be same as password";
      }

      if (!values.targetYear) {
        errors.targetYear = "Target Year is required";
      }
      if (!values.std) {
        errors.std = "Standard is required";
      }
    } else {
      // Validate email
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

      if (!values.gender) {
        errors.gender = "Gender is required";
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

      if (!values.state) {
        errors.state = "State is required";
      }
    }

    // Pincode rules (digits only, exactly 6 when provided)
    if (values.pinCode !== undefined) {
      const pin = String(values.pinCode || "");
      if (pin.length > 0 && !/^\d{6}$/.test(pin)) {
        errors.pinCode = "Pincode must be exactly 6 digits";
      }
    }
    if (values.schoolPin !== undefined) {
      const schoolPin = String(values.schoolPin || "");
      if (schoolPin.length > 0 && !/^\d{6}$/.test(schoolPin)) {
        errors.schoolPin = "School pincode must be exactly 6 digits";
      }
    }

    return errors;
  };

  const formik: any = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      email: "",
      phoneNo: "",
      state: "",
      std: "",
      targetYear: "",
      password: "",
      schoolName: "",
      schoolPin: "",
    },
    validate: validate,
    onSubmit: (values) => {
      if (page == 0) {
        setLoading(true);
        checkPostMutation.mutate({
          URL: "authentication/validate",
          payload: {
            phoneNo: formik.values.phoneNo,
            email: formik.values.email,
          },
        });
      } else {
        // Hard guard: never allow submitting with an invalid pincode.
        const schoolPin = String(values.schoolPin || "");
        if (schoolPin.length > 0 && !/^\d{6}$/.test(schoolPin)) {
          formik.setFieldTouched("schoolPin", true);
          formik.setFieldError("schoolPin", "School pincode must be exactly 6 digits");
          return;
        }
        const pinCode = (values as any).pinCode !== undefined ? String((values as any).pinCode || "") : "";
        if (pinCode.length > 0 && !/^\d{6}$/.test(pinCode)) {
          formik.setFieldTouched("pinCode", true);
          formik.setFieldError("pinCode", "Pincode must be exactly 6 digits");
          return;
        }

        setLoading(true);
        const { confirmPassword, ...newUserData }: any = values;
        createPostMutation.mutate({
          URL: "authentication/register",
          payload: newUserData,
        });
      }
    },
  });

  const initialButtonState = {
    disable: !formik.isValid || !formik.dirty,
    colors: [COLORS.button_disable01, COLORS.button_disable02],
    isValid: formik.isValid,
  };

  const neetDateFromState = appState?.neetDate || userData?.examDate;
  const signUpFields = useMemo(
    () => createSignUpFields(neetDateFromState),
    [neetDateFromState]
  );

  return (
    <LinearGradient
      colors={[
        COLORS.primary01,
        COLORS.primary02,
        COLORS.primary03,
        COLORS.primary05,
      ]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.signUpContainer}>
            <Animated.View entering={ZoomInDown} style={styles.animatedContainer}>
              {/* Logo Section */}
              <View style={styles.logoContainer}>
                <Image source={logo} style={styles.logoImage} />
              </View>

              {/* Sign Up Form Section */}
              <View style={styles.formContainer}>
                <Text style={styles.signUpTitle}>Sign Up</Text>

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressStep,
                      { backgroundColor: page === 0 ? COLORS.colorWhite : 'rgba(255,255,255,0.3)' }
                    ]} />
                    <View style={[
                      styles.progressStep,
                      { backgroundColor: page === 1 ? COLORS.colorWhite : 'rgba(255,255,255,0.3)' }
                    ]} />
                  </View>
                </View>

                {/* Input Fields */}
                <View style={styles.inputsContainer}>
                  {signUpFields[page].map((data: any, index: number) => {
                    const isPhone = data.id === "phoneNo";
                    const isPinLike =
                      data.id === "pinCode" ||
                      data.id === "schoolPin" ||
                      data.id === "schoolPincode";
                    const numericMaxLen = isPhone ? 10 : isPinLike ? 6 : undefined;
                    const isPassword = data.id === "password";
                    const isConfirmPassword = data.id === "confirmPassword";
                    const isPasswordField = isPassword || isConfirmPassword;

                    return (
                      <View key={data.idx} style={styles.inputWrapper}>
                        {/* Text Input Field */}
                        {data.fieldType === "input" && (
                          <View style={styles.inputFieldContainer}>
                            <TextInput
                              style={[
                                styles.textInput,
                                isPasswordField && styles.passwordInput,
                              ]}
                              onChangeText={(text) => {
                                if (isPhone || isPinLike) {
                                  const digitsOnly = String(text || "").replace(/\D/g, "");
                                  const clipped = numericMaxLen
                                    ? digitsOnly.slice(0, numericMaxLen)
                                    : digitsOnly;
                                  formik.setFieldValue(`${data.id}`, clipped);
                                  return;
                                }
                                formik.setFieldValue(`${data.id}`, text);
                              }}
                              onBlur={formik.handleBlur(`${data.id}`)}
                              value={String(formik.values?.[`${data.id}`] ?? "")}
                              placeholder={data.placeholderName}
                              placeholderTextColor="#999"
                              secureTextEntry={
                                isPasswordField
                                  ? isPassword
                                    ? !showPassword
                                    : !showConfirmPassword
                                  : false
                              }
                              maxLength={numericMaxLen}
                              keyboardType={
                                isPhone || isPinLike ? "number-pad" : "default"
                              }
                            />
                            {isPasswordField && (
                              <TouchableOpacity
                                onPress={() => {
                                  if (isPassword) {
                                    setShowPassword(!showPassword);
                                  } else {
                                    setShowConfirmPassword(!showConfirmPassword);
                                  }
                                }}
                                style={styles.eyeIconContainer}
                              >
                                <Icon
                                  name={
                                    isPassword
                                      ? showPassword
                                        ? "eye-off"
                                        : "eye"
                                      : showConfirmPassword
                                      ? "eye-off"
                                      : "eye"
                                  }
                                  size={20}
                                  color="#666"
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        )}

                        {/* Dropdown Field */}
                        {data.fieldType === "select" && (
                          <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={data.label}
                            labelField={"label"}
                            valueField={"value"}
                            maxHeight={300}
                            placeholder={data.placeholderName}
                            value={formik.values[`${data.id}`]}
                            onChange={(item) => {
                              formik.setFieldValue(`${data.id}`, item.value);
                            }}
                          />
                        )}

                        {/* Date Input Field */}
                        {data.fieldType === "date" && (
                          <View style={styles.dateInputWrapper}>
                            <DateInput formik={formik} />
                          </View>
                        )}

                        {/* Error Messages */}
                        {formik.errors[data.id] && formik.touched[data.id] && (
                          <Text style={styles.errorText}>
                            {formik.errors[`${data.id}`]}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Login Error Message */}
                {loginMsg.length > 0 && (
                  <Text style={styles.loginErrorText}>{loginMsg}</Text>
                )}

                {/* Sign Up Button */}
                <View style={styles.buttonContainer}>
                  <GradientButton
                    onPress={formik.handleSubmit}
                    disable={initialButtonState.disable}
                    colors={initialButtonState.colors}
                    loading={loading}
                    text={page === 0 ? "Next" : "Sign Up"}
                  />
                </View>

                {/* Sign In Link */}
                <View style={styles.signInLinkContainer}>
                  <Text style={styles.signInText}>
                    Do you have an account?{" "}
                    <Text
                      style={styles.signInLinkText}
                      onPress={() => navigation.navigate("Login")} // Use navigation prop
                    >
                      Sign In
                    </Text>
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: hp(2),
  },
  signUpContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(5),
  },
  animatedContainer: {
    width: "100%",
    maxWidth: wp(90),
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: hp(2),
  },
  logoImage: {
    width: wp(37),
    height: hp(17),
    resizeMode: "contain",
  },
  formContainer: {
    backgroundColor: COLORS.primary05,
    width: "100%",
    paddingHorizontal: wp(6),
    paddingVertical: hp(3),
    borderRadius: wp(4),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  signUpTitle: {
    fontSize: wp(6),
    fontWeight: "600",
    color: COLORS.colorWhite,
    marginBottom: hp(2),
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: hp(2.5),
  },
  progressBar: {
    flexDirection: "row",
    width: wp(20),
    justifyContent: "space-between",
  },
  progressStep: {
    width: wp(8),
    height: hp(0.5),
    borderRadius: wp(1),
  },
  progressText: {
    fontSize: wp(3.2),
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  inputsContainer: {
    width: "100%",
    marginBottom: hp(1),
  },
  inputWrapper: {
    marginBottom: hp(1.5),
  },
  inputFieldContainer: {
    position: "relative",
    width: "100%",
  },
  textInput: {
    fontSize: moderateScale(12),
    width: "100%",
    height: hp(6),
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  passwordInput: {
    paddingRight: wp(12), // Extra padding for eye icon
  },
  dropdown: {
    height: hp(6),
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dateInputWrapper: {
    width: "100%",
    height: hp(6), // Same height as other inputs
  },
  placeholderStyle: {
    fontSize: moderateScale(12),
    color: "#999",
  },
  selectedTextStyle: {
    fontSize: moderateScale(12),
    color: "#333",
  },
  errorText: {
    fontSize: hp(1.4),
    color: "#FFEA00",
    marginTop: hp(0.5),
    marginLeft: wp(1),
  },
  loginErrorText: {
    fontSize: hp(1.5),
    color: "#FFEA00",
    textAlign: "center",
    marginBottom: hp(1),
  },
  buttonContainer: {
    width: "100%",
    marginBottom: hp(2),
  },
  signInLinkContainer: {
    alignItems: "center",
  },
  signInText: {
    color: COLORS.colorWhite,
    fontSize: wp(3.8),
    textAlign: "center",
    lineHeight: wp(5),
  },
  signInLinkText: {
    color: COLORS.colorWhite,
    fontSize: wp(3.8),
    fontWeight: "700",
  },
  validation: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: COLORS.answer_wrong01,
    textAlign: "left",
    width: wp(78),
  },
  disabledDropdown: {
    backgroundColor: "#f0f0f0",
  },
  toggleButton: {
    marginTop: 15,
    color: "blue",
  },
  icon: {
    marginRight: 5,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  eyeIconContainer: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SignUp;
