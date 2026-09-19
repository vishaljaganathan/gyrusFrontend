import React, { useState, useEffect, useContext, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { CustomText as Text, CustomTextInput as TextInput } from "../components/CustomText";
import { COLORS } from "../styles/themes";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { createSignUpFields } from "../service/FormFeilds";
import { postRequest } from "../config/Requests";
import { useMutation } from "@tanstack/react-query";
import { ThemeContext } from "../service/authContext";
import GradientButton from "../components/GradientButton";
import { useFormik } from "formik";
import { moderateScale } from "../styles/Responsive";
import { Dropdown } from "react-native-element-dropdown";
import DateInput from "../components/DatePicker";
import { Ionicons as Icon } from "@expo/vector-icons";
import { AxiosError } from "axios";
import { axiosInstance } from "../config/indeceptor";

interface SignUpProps {
  navigation: any;
  route: any;
  onSwitchTab?: () => void;
}

const SignUp = ({ navigation, route, onSwitchTab }: SignUpProps) => {
  const selectedStd = route?.params?.selectedStd;
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const { signUpData, setSignUpData, appState, userData, setAppState } =
    useContext(ThemeContext);
  const [loginMsg, setLoginMsg] = useState("");
  const [orgType, setOrgType] = useState<"school" | "institute" | "others" | "">("");
  const [institutes, setInstitutes] = useState<{ label: string; value: string }[]>([
    { label: "Pondicherry University", value: "Pondicherry University" },
    { label: "Indian Institute of Technology Madras", value: "Indian Institute of Technology Madras" },
    { label: "Anna University", value: "Anna University" },
    { label: "National Institute of Technology Tiruchirappalli", value: "National Institute of Technology Tiruchirappalli" },
    { label: "Vellore Institute of Technology", value: "Vellore Institute of Technology" }
  ]);

  useEffect(() => {
    axiosInstance.get("authentication/institutes")
      .then((res) => {
        if (Array.isArray(res.data)) {
          const list = res.data.map((name: string) => ({
            label: name,
            value: name
          }));
          setInstitutes(list);
        }
      })
      .catch((err) => {
        console.log("Failed to fetch institutes:", err);
      });
  }, []);

  const handleOrgTypeChange = (type: "school" | "institute" | "others" | "") => {
    setOrgType(type);
    formik.setFieldValue("schoolName", "");
  };

  // Fetch neet-date from api on mount if it's not set
  useEffect(() => {
    if (!appState?.neetDate) {
      axiosInstance
        .get("neet-date")
        .then((res) => {
          const dateFromApi = res?.data?.date;
          if (dateFromApi) {
            setAppState((prev: any) => ({
              ...prev,
              neetDate: dateFromApi,
            }));
          }
        })
        .catch((err) => {
          console.log("Failed to fetch neet-date on signup mount:", err);
        });
    }
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: postRequest,
    onSuccess: (data, variable, context) => {
      if (data.status == 201) {
        setLoading(false);
        setSignUpData(data.data);
        navigation.navigate("Otp", {
          id: data.data._id,
          phoneNo: variable.payload.phoneNo,
        });
      }
    },
    onError(error: AxiosError, variables, context) {
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

      if (!values.schoolName) {
        errors.schoolName = "School/Institution/Center name is required";
      }

      if (!values.schoolPin) {
        errors.schoolPin = "School/Institution/Center pincode is required";
      } else if (!/^\d{6}$/.test(String(values.schoolPin))) {
        errors.schoolPin = "School/Institution/Center pincode must be 6 digits";
      }
    } else {
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
      const trimmedEmail = (values.email || "").toString().trim();
      if (!values.email) {
        errors.email = "Email is required";
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(trimmedEmail)
      ) {
        errors.email = "Invalid email address";
      }

      if (!values.state) {
        errors.state = "State is required";
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
      std: selectedStd || "",
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
            email: String(formik.values.email || "").trim(),
          },
        });
      } else {
        const schoolPin = String(values.schoolPin || "");
        if (schoolPin.length > 0 && !/^\d{6}$/.test(schoolPin)) {
          formik.setFieldTouched("schoolPin", true);
          formik.setFieldError("schoolPin", "School/Institution/Center pincode must be exactly 6 digits");
          return;
        }

        setLoading(true);
        const { confirmPassword, ...newUserData }: any = values;
        if (newUserData.email) {
          newUserData.email = String(newUserData.email).trim();
        }
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
  const signUpFields = useMemo(() => {
    const fields = createSignUpFields(neetDateFromState);
    return fields;
  }, [neetDateFromState]);

  return (
    <View style={styles.innerFormContainer}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressStep,
              {
                backgroundColor:
                  page === 0 ? COLORS.colorWhite : "rgba(255,255,255,0.3)",
              },
            ]}
          />
          <View
            style={[
              styles.progressStep,
              {
                backgroundColor:
                  page === 1 ? COLORS.colorWhite : "rgba(255,255,255,0.3)",
              },
            ]}
          />
        </View>
      </View>

      {/* Input Fields */}
      <View style={styles.inputsContainer}>
        {signUpFields[page].map((data: any, index: number) => {
          const isPhone = data.id === "phoneNo";
          const isPinLike =
            data.id === "schoolPin" || data.id === "schoolPincode";
          const numericMaxLen = isPhone ? 10 : isPinLike ? 6 : undefined;
          const isPassword = data.id === "password";
          const isConfirmPassword = data.id === "confirmPassword";
          const isPasswordField = isPassword || isConfirmPassword;

          return (
            <View key={data.idx} style={styles.inputWrapper}>
              {/* Text Input Field */}
              {data.fieldType === "input" && (
                data.id === "schoolName" ? (
                  <View style={{ width: "100%", marginTop: hp(0.5) }}>
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
                      <View style={styles.inputFieldContainer}>
                        <TextInput
                          style={styles.textInput}
                          onChangeText={(Text) => formik.setFieldValue("schoolName", Text)}
                          onBlur={formik.handleBlur("schoolName")}
                          value={String(formik.values.schoolName || "")}
                          placeholder="School Name"
                          placeholderTextColor="#999"
                        />
                      </View>
                    )}

                    {orgType === "institute" && (
                      <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        itemTextStyle={{ fontFamily: "AppFont-Regular", color: "#333" }}
                        data={institutes}
                        labelField="label"
                        valueField="value"
                        maxHeight={300}
                        placeholder="Select Institute/Center"
                        value={formik.values.schoolName}
                        onChange={(item) => {
                          formik.setFieldValue("schoolName", item.value);
                        }}
                      />
                    )}

                    {orgType === "others" && (
                      <View style={styles.inputFieldContainer}>
                        <TextInput
                          style={styles.textInput}
                          onChangeText={(Text) => formik.setFieldValue("schoolName", Text)}
                          onBlur={formik.handleBlur("schoolName")}
                          value={String(formik.values.schoolName || "")}
                          placeholder="Specify Other Name"
                          placeholderTextColor="#999"
                        />
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.inputFieldContainer}>
                    <TextInput
                      style={[
                        styles.textInput,
                        isPasswordField && styles.passwordInput,
                      ]}
                      onChangeText={(Text) => {
                        if (isPhone || isPinLike) {
                          const digitsOnly = String(Text || "").replace(/\D/g, "");
                          const clipped = numericMaxLen
                            ? digitsOnly.slice(0, numericMaxLen)
                            : digitsOnly;
                          formik.setFieldValue(`${data.id}`, clipped);
                          return;
                        }
                        
                        if (data.id === "firstName" || data.id === "lastName") {
                          const lettersOnly = String(Text || "").replace(/[^a-zA-Z\s]/g, "");
                          formik.setFieldValue(`${data.id}`, lettersOnly);
                          return;
                        }

                        formik.setFieldValue(`${data.id}`, Text);
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
                )
              )}

              {/* Dropdown Field */}
              {data.fieldType === "select" && (
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  itemTextStyle={{ fontFamily: "AppFont-Regular" }}
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
          disable={!formik.isValid || !formik.dirty}
          colors={
            (formik.isValid && formik.dirty)
              ? [COLORS.button_enable01, COLORS.button_enable02]
              : [COLORS.button_disable01, COLORS.button_disable02]
          }
          loading={loading}
          Text={
            <Text style={{ fontFamily: "AppFont-Bold" }}>
              {page === 0 ? "Next" : "Sign Up"}
            </Text>
          }
        />
      </View>

      {/* Sign In Link */}
      <View style={styles.signInLinkContainer}>
        <Text style={styles.signInText}>Do you have an account? </Text>
        <Text style={styles.signInLinkText} onPress={onSwitchTab}>
          Sign In
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  innerFormContainer: {
    width: "100%",
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
    fontFamily: "AppFont-Regular",
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
    paddingRight: wp(12),
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
    height: hp(6),
  },
  placeholderStyle: {
    fontFamily: "AppFont-Regular",
    fontSize: moderateScale(12),
    textAlign: "left",
    color: "#999",
  },
  selectedTextStyle: {
    fontFamily: "AppFont-Regular",
    fontSize: moderateScale(12),
    textAlign: "left",
    color: "#333",
  },
  errorText: {
    fontFamily: "AppFont-Regular",
    fontSize: hp(1.4),
    color: "#FFEA00",
    marginTop: hp(0.5),
    marginLeft: wp(1),
  },
  loginErrorText: {
    fontFamily: "AppFont-Regular",
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
    flexDirection: "row",
    justifyContent: "center",
  },
  signInText: {
    color: COLORS.colorWhite,
    fontFamily: "AppFont-Regular",
    fontSize: wp(3.8),
    textAlign: "center",
    lineHeight: wp(5),
  },
  signInLinkText: {
    color: COLORS.colorWhite,
    fontFamily: "AppFont-Bold",
    fontSize: wp(3.8),
    textDecorationLine: "underline",
  },
  inputSearchStyle: {
    height: 40,
    fontFamily: "AppFont-Regular",
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
