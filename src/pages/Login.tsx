import { ThemeContext } from "../service/authContext";
import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { CustomText as Text, CustomTextInput as TextInput } from "../components/CustomText";
import { COLORS } from "../styles/themes";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useMutation } from "@tanstack/react-query";
import { postRequest } from "../config/Requests";
import { LoginFields } from "../service/FormFeilds";
import { setSecureStorage } from "../config/SecureStore";
import { moderateScale } from "../styles/Responsive";
import { useFormik } from "formik";
import GradientButton from "../components/GradientButton";
import { AxiosError } from "axios";
import { axiosInstance } from "../config/indeceptor";
import { Ionicons as Icon } from "@expo/vector-icons";
import * as Application from "expo-application";

interface LoginProps {
  navigation: any;
  onSwitchTab?: () => void;
}

const Login = ({ navigation, onSwitchTab }: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const [status, setStatus] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");
  const { setUserData } = useContext(ThemeContext);

  const validate = (values: any) => {
    const errors: any = {};

    if (!values.password) {
      errors.password = "Password is required";
    } else if (values.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!values.phoneNo) {
      errors.phoneNo = "Phone number is required";
    } else if (values.phoneNo.length <= 9) {
      errors.phoneNo = "Phone number minimum length 10";
    }

    return errors;
  };

  const createPostMutation = useMutation({
    mutationFn: postRequest,
    onSuccess: async (data: any, variable, context) => {
      setStatus(data.status);
      setLoading(false);
      if (data.status == 200) {
        await setSecureStorage("token", data.data.access_token);
        await setSecureStorage("newUser", "false");
        axiosInstance
          .get("authentication/user")
          .then((res) => {
            if (res && res.data) {
              setUserData(res.data);
              navigation.reset({
                index: 0,
                routes: [{ name: "BottomBar" }],
              });
            }
          })
          .catch((err) => {
            if (err.status == 401) {
              navigation.navigate("Login");
            }
          });
      }
    },
    onError: (error: AxiosError, variable, context) => {
      setLoading(false);
      console.error("Login error:", error);

      if (!error.response) {
        setLoginMsg("Network error. Please check your connection and try again.");
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 5000);
        return;
      }

      let Error: any = error.response?.data;

      let displayMessage = "An error occurred. Please try again.";
      if (typeof Error?.message === "string") {
        displayMessage = Error.message;
      } else if (typeof Error?.message?.message === "string") {
        displayMessage = Error.message.message;
      }

      const statusCode = error.response?.status;

      if (statusCode == 400) {
        setLoginMsg(displayMessage || "Invalid credentials");
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 5000);
      } else if (statusCode == 406) {
        const otpUserId = Error.id || Error._id || Error.data?.id || Error.data?._id;
        console.log("[Login] 406 Error - Navigating to Otp with id:", otpUserId);
        navigation.navigate("Otp", {
          id: otpUserId,
          phoneNo: variable.payload.phoneNo,
          msgHint: displayMessage,
        });
      } else if (statusCode == 404) {
        setLoginMsg(displayMessage || "User not found");
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 5000);
      } else if (statusCode == 403) {
        console.log("[Login] 403 Forbidden - Showing session block message:", displayMessage);
        setLoginMsg(displayMessage || "Account already logged in on another device");
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 15000);
      } else {
        setLoginMsg(displayMessage);
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 5000);
      }
    },
  });

  const formik: any = useFormik({
    initialValues: {
      phoneNo: "",
      password: "",
    },
    validate: validate,
    onSubmit: async (values) => {
      setLoading(true);

      let deviceId = "";
      try {
        if (Platform.OS === "android") {
          deviceId = Application.getAndroidId() || "";
        } else {
          deviceId = await Application.getIosIdForVendorAsync() || "";
        }

        if (!deviceId || deviceId === "" || deviceId === "null") {
          const { getSecureStorage, setSecureStorage: storeSS } = require("../config/SecureStore");
          const uuid = require("react-native-uuid").default;

          let storedId = await getSecureStorage("persistent_device_id");
          if (!storedId) {
            storedId = uuid.v4().toString();
            await storeSS("persistent_device_id", storedId);
          }
          deviceId = "UUID-" + storedId;
        }
      } catch (e) {
        console.error("Error getting deviceId:", e);
        deviceId = "ERROR-FALLBACK";
      }

      console.log("[Login] Sending login request with deviceId:", deviceId);

      createPostMutation.mutate({
        URL: "authentication/log-in",
        payload: {
          ...values,
          deviceId,
        },
      });
    },
  });

  return (
    <View style={styles.innerFormContainer}>
      {/* Input Fields */}
      <View style={styles.inputsContainer}>
        {LoginFields.map((data: any, index) => {
          return (
            <View key={data.idx} style={styles.inputWrapper}>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    data.id === "password" && styles.passwordInput,
                  ]}
                  keyboardType={data.phonePad ? "numeric" : "default"}
                  placeholder={data.placeholderName}
                  placeholderTextColor="#999"
                  secureTextEntry={
                    data.id === "password" ? !showPassword : false
                  }
                  maxLength={data.id === "phoneNo" ? 10 : undefined}
                  onChangeText={(Text) => {
                    if (data.id === "phoneNo") {
                      formik.setFieldValue("phoneNo", Text.replace(/[^0-9]/g, ""));
                    } else {
                      formik.setFieldValue(data.id, Text);
                    }
                  }}
                  onBlur={formik.handleBlur(`${data.id}`)}
                  value={formik.values[`${data.id}`]}
                />
                {data.id === "password" && (
                  <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    style={styles.eyeIconContainer}
                  >
                    <Icon
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                )}
              </View>

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

      {/* Forgot Password Link */}
      <TouchableOpacity
        onPress={() => navigation.navigate("ForgotPassword")}
        style={styles.forgotPasswordContainer}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <View style={styles.buttonContainer}>
        <GradientButton
          onPress={formik.handleSubmit}
          disable={!formik.isValid}
          loading={loading}
          colors={
            formik.isValid
              ? [COLORS.button_enable01, COLORS.button_enable02]
              : [COLORS.button_disable01, COLORS.button_disable02]
          }
          Text={<Text style={{ fontFamily: "AppFont-Bold" }}>Sign In</Text>}
        />
      </View>

      {/* Sign Up Link */}
      <View style={styles.signUpLinkContainer}>
        <Text style={styles.signUpText}>
          If you don't have an account?{" "}
          <Text
            style={styles.signUpLinkText}
            onPress={onSwitchTab}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  innerFormContainer: {
    width: "100%",
  },
  inputsContainer: {
    width: "100%",
    marginBottom: hp(1),
  },
  inputWrapper: {
    marginBottom: hp(2),
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
  eyeIconContainer: {
    position: "absolute",
    right: wp(3),
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: wp(1),
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: hp(3),
  },
  forgotPasswordText: {
    fontFamily: "AppFont-Regular",
    fontSize: hp(1.6),
    color: "#FFEFFF",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: hp(2),
  },
  signUpLinkContainer: {
    alignItems: "center",
    marginTop: hp(1),
  },
  signUpText: {
    color: COLORS.colorWhite,
    fontFamily: "AppFont-Regular",
    fontSize: wp(3.8),
    textAlign: "center",
    lineHeight: wp(5),
  },
  signUpLinkText: {
    color: COLORS.colorWhite,
    fontFamily: "AppFont-Bold",
    fontSize: wp(3.8),
    textDecorationLine: "underline",
  },
});

export default Login;
