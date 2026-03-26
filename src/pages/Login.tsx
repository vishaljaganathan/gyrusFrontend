
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../styles/themes";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useMutation } from "@tanstack/react-query";
import { postRequest } from "../config/Requests";
import { LoginFields } from "../service/FormFeilds";
import Animated, { ZoomInLeft } from "react-native-reanimated";
import { setSecureStorage } from "../config/SecureStore";
import { moderateScale } from "../styles/Responsive";
import { useFormik } from "formik";
import GradientButton from "../components/GradientButton";
import { AxiosError } from "axios";
import { axiosInstance } from "../config/indeceptor";
import { ThemeContext } from "../service/authContext";
import Icon from "react-native-vector-icons/Feather";

// Accept navigation as a prop
const Login = ({ navigation }: { navigation: any }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const logo = require("../assets/appLogo.png");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");
  const {
    userData,
    setUserData,
    signUpData,
    setSignUpData,
    appState,
    setAppState,
  } = useContext(ThemeContext);
  const data = {
    email,
    password,
  };

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
              navigation.navigate("BottomBar", { screen: "Home" }); // Use navigation prop
            }
          })
          .catch((err) => {
            if (err.status == 401) {
              navigation.navigate("Login"); // Use navigation prop
            }
          });
      }
    },

    onError: (error: AxiosError, variable, context) => {
      setLoading(false);
      console.error("Login error:", error);

      // Handle network errors (no response from server - timeout, connection refused, etc.)
      if (!error.response) {
        setLoginMsg("Network error. Please check your connection and try again.");
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 5000);
        return;
      }

      // Handle server errors with response
      let Error: any = error.response?.data;
      if (error.status == 400) {
        setLoginMsg(Error.message || "Invalid credentials");
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 5000);
      } else if (error.status == 406) {
        navigation.navigate("Otp", { id: Error.id });
      } else if (error.status == 404) {
        setLoginMsg(Error.message || "User not found");
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 5000);
      } else {
        setLoginMsg("An error occurred. Please try again.");
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
    onSubmit: (values) => {
      setLoading(true);
      createPostMutation.mutate({
        URL: "authentication/log-in",
        payload: values,
      });
    },
  });

  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

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
      <View style={styles.loginContainer}>
        <Animated.View entering={ZoomInLeft} style={styles.animatedContainer}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logoImage} />
          </View>

          {/* Login Form Section */}
          <View style={styles.formContainer}>
            <Text style={styles.signInTitle}>Sign In</Text>

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
                        onChangeText={(text) => {
                          if (data.id === "phoneNo") {
                            formik.setFieldValue("phoneNo", text.replace(/[^0-9]/g, ""));
                          } else {
                            formik.handleChange(data.id)(text);
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
              onPress={() => navigation.navigate("Fpassword")} // Use navigation prop
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
                  !formik.isValid
                    ? [COLORS.button_enable01, COLORS.button_enable02]
                    : [COLORS.button_disable01, COLORS.button_disable02]
                }
                text={"Sign In"}
              />
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpLinkContainer}>
              <Text style={styles.signUpText}>
                If you don't have an account?{" "}
                <Text
                  style={styles.signUpLinkText}
                  onPress={() => navigation.navigate("SignUp")} // Use navigation prop
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loginContainer: {
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
    paddingVertical: hp(4),
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
  signInTitle: {
    fontSize: wp(6),
    fontWeight: "600",
    color: COLORS.colorWhite,
    marginBottom: hp(3),
    textAlign: "center",
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
  eyeIconContainer: {
    position: "absolute",
    right: wp(3),
    top: "50%",
    transform: [{ translateY: -12 }],
    padding: wp(1),
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: hp(3),
  },
  forgotPasswordText: {
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
    fontSize: wp(3.8),
    textAlign: "center",
    lineHeight: wp(5),
  },
  signUpLinkText: {
    color: COLORS.colorWhite,
    fontSize: wp(3.8),
    fontWeight: "700",
  },
});

export default Login;
