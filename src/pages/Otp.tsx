import React, { useState, useEffect } from "react";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert } from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from '../components/CustomText';
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "../styles/Responsive";
import { AxiosError } from "axios";
import { COLORS } from "../styles/themes";
import { OtpInput } from "react-native-otp-entry";
import { postRequest } from "../config/Requests";
import { useMutation } from "@tanstack/react-query";
import Animated, { ZoomInLeft } from "react-native-reanimated";
import GradientButton from "../components/GradientButton";
import {
  heightPercentageToDP,
  widthPercentageToDP } from "react-native-responsive-screen";



// Accept navigation as a prop
const Otp = ({ navigation, route }: { navigation: any; route: any }) => {
  console.log("[OTP] Route Params:", route.params);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(90); // 1.30 mins = 90 seconds
  const [canResend, setCanResend] = useState(false);
  const { phoneNo, otp: receivedOtp, id, operation, msgHint } = route.params || {};

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (!id) {
      console.warn("[OTP] Warning: User ID is missing in route params. Verification may fail.");
    }
    if (!phoneNo) {
      console.warn("[OTP] Warning: phoneNo is missing in route params. Resend functionality may be limited.");
    }
  }, [id, phoneNo]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const createPostMutation = useMutation({
    mutationFn: postRequest,
    onSuccess: (data, variable, context) => {
      console.log(operation);
        if (operation) {
        setOtp("");
        navigation.replace("Reset", { id: id }); // Replace to avoid stacking
      } else {
        if (data.status >= 200 && data.status < 300) {
          setOtp("");
          navigation.replace("Login"); // Replace to avoid stacking
        }
      }
    },
    onError(error: AxiosError, variables, context) {
      console.log(error.message, "fshish");
      Alert.alert("Error", "Invalid OTP. Please try again.");
    }
  });

  const resendMutation = useMutation({
    mutationFn: postRequest,
    onSuccess: (data: any) => {
      Alert.alert("Success", "OTP has been resent to your mobile number.");
      setTimer(90); // Reset timer on success
    },
    onError: (error: AxiosError) => {
      console.log("Resend error:", error);
      Alert.alert("Error", "Failed to resend OTP. Please try again later.");
    }
  });

  const handleResend = () => {
    if (!canResend) return;
    // For forgot-password flow use the specific endpoint
    if (operation === "fp" && phoneNo) {
      resendMutation.mutate({
        URL: "authentication/forgot-password",
        payload: { phoneNo: phoneNo }
      });
      return;
    }

    // For signup (user created but not verified) the backend accepts
    // a phone-based resend via the same forgot-password path. Use
    // that when phoneNo is available to resend OTP without navigating back.
    if (phoneNo) {
      resendMutation.mutate({
        URL: "authentication/forgot-password",
        payload: { phoneNo: phoneNo }
      });
      return;
    }

    // Fallback: if no phone is available, offer to go back.
    Alert.alert(
      "Resend OTP",
      "Phone number unavailable. Would you like to go back and try again?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Go Back", onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <>
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
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              width: widthPercentageToDP(90),
              fontFamily: 'AppFont-Bold',
              fontSize: widthPercentageToDP(5),
              marginBottom: 10
            }}
          >
            Verification Code
          </Text>
          <Text
            style={{
              color: "white",
              textAlign: "center",
              width: widthPercentageToDP(90),
              fontFamily: 'AppFont-Regular',
              fontSize: widthPercentageToDP(4),
              marginTop: widthPercentageToDP(2)
            }}
          >
            Please Enter the OTP sent to {phoneNo ? `+91 ${phoneNo}` : "your registered Mobile Number"} to Verify your account
          </Text>

          {msgHint && (
            <Text style={{ color: COLORS.secondary04, marginTop: 10, textAlign: 'center', width: '90%' }}>
              {msgHint}
            </Text>
          )}

          <View style={{ width: "85%", marginTop: 20 }}>
            <OtpInput
              numberOfDigits={6}
              focusColor="green"
              autoFocus={true}
              hideStick={true}
              blurOnFilled={true}
              disabled={false}
              type="numeric"
              secureTextEntry={false}
              focusStickBlinkingDuration={500}
              onFocus={() => console.log("Focused")}
              onBlur={() => console.log("Blurred")}
              onTextChange={(code) => {
                console.log("[OTP] Text changed:", code);
                setOtp(code);
              }}
              textInputProps={{
                accessibilityLabel: "One-Time Password"
              }}
              textProps={{
                accessibilityRole: "text",
                accessibilityLabel: "OTP digit",
                allowFontScaling: false
              }}
              theme={{
                containerStyle: styles.otpContainer,
                pinCodeTextStyle: styles.pinCodeText
              }}
            />
          </View>

          <GradientButton
            onPress={() => {
              const validationUrl = `authentication${operation ? "/forgot" : ""}/otp/${id}`;
              console.log("[OTP] Validating with URL:", validationUrl, "Payload:", { otp: `${otp}` });
              createPostMutation.mutate({
                URL: validationUrl,
                payload: { otp: `${otp}` }
              });
            }}
            disable={otp.length == 6 ? false : true}
            loading={createPostMutation.isPending}
            Text={<Text style={{ fontFamily: 'AppFont-Bold' }}>Validate Otp</Text>}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
            <TouchableOpacity 
              onPress={handleResend}
              disabled={!canResend || resendMutation.isPending}
              style={{ opacity: canResend ? 1 : 0.6 }}
            >
              <Text
                style={{
                  color: COLORS.colorWhite,
                  fontFamily: 'AppFont-Bold',
                  fontSize: heightPercentageToDP(2),
                  textDecorationLine: canResend ? 'underline' : 'none'
                }}
              >
                {resendMutation.isPending ? "Sending..." : "Resend OTP"}
              </Text>
            </TouchableOpacity>
            {!canResend && !resendMutation.isPending && (
              <Text
                style={{
                  color: COLORS.colorWhite,
                  fontFamily: 'AppFont-Regular',
                  fontSize: heightPercentageToDP(1.8),
                  marginLeft: 10
                }}
              >
                in {formatTime(timer)}
              </Text>
            )}
          </View>

          <Text
            style={{
              color: COLORS.secondary02,
              fontFamily: 'AppFont-Bold',
              fontSize: heightPercentageToDP(2),
              marginTop: 20
            }}
            onPress={() => navigation.replace("Login")}
          >
            Back to Login
          </Text>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  Img: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch"
  },
  borderStyleBase: {
    width: 30,
    height: 45
  },
  borderStyleHighLighted: {
    borderColor: "#03DAC6"
  },
  underlineStyleBase: {
    width: 40,
    height: 45,
    borderWidth: 2,
    borderColor: COLORS.light,
    borderRadius: 7
  },
  underlineStyleHighLighted: {
    borderColor: "#03DAC6"
  },
  otpContainer: {
    margin: 10
  },
  pinCodeText: {
    fontFamily: 'AppFont-Regular',
    fontSize: moderateScale(20),
    color: "white"
  },
  otpHintContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8
  },
  otpHintText: {
    color: COLORS.secondary02,
    fontFamily: 'AppFont-Bold',
    fontSize: moderateScale(14)
  }
});

export default Otp;
