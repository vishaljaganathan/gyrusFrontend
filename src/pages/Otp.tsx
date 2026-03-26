
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../styles/themes";
import OTPInputView from "react-native-otp-entry";
import { OtpInput } from "react-native-otp-entry";
import { postRequest } from "../config/Requests";
import { useMutation } from "@tanstack/react-query";
import Animated, { ZoomInLeft } from "react-native-reanimated";
import GradientButton from "../components/GradientButton";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";
import { AxiosError } from "axios";

// Accept navigation as a prop
const Otp = ({ navigation, route }: { navigation: any; route: any }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: postRequest,
    onSuccess: (data, variable, context) => {
      console.log(route.params.operation);
      if (route.params.operation) {
        setOtp("");
        navigation.navigate("Reset", { id: route.params.id }); // Use navigation prop
      } else {
        if (data.status == 200) {
          setOtp("");
          navigation.navigate("Login"); // Use navigation prop
        }
      }
    },
    onError(error: AxiosError, variables, context) {
      console.log(error.message, "fshish");
    },
  });

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
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              width: widthPercentageToDP(90),
              fontSize: widthPercentageToDP(4),
              marginTop: widthPercentageToDP(3),
            }}
          >
            Please Enter the OTP sent to your registered Mobile Number to Verify your
            account
          </Text>

          <View style={{ width: "85%" }}>
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
                if (code.length == 6) {
                  setOtp(code);
                }
              }}
              textInputProps={{
                accessibilityLabel: "One-Time Password",
              }}
              textProps={{
                accessibilityRole: "text",
                accessibilityLabel: "OTP digit",
                allowFontScaling: false,
              }}
              theme={{
                containerStyle: styles.otpContainer,
                pinCodeTextStyle: styles.pinCodeText,
              }}
            />
          </View>
          <GradientButton
            onPress={() => {
              createPostMutation.mutate({
                URL: `authentication${
                  route.params.operation ? "/forgot" : ""
                }/otp/${route.params.id}`,
                payload: { otp: `${otp}` },
              });
            }}
            disable={otp.length == 6 ? false : true}
            loading={loading}
            text={"Validate Otp"}
          />
          <Text
            style={{
              color: COLORS.secondary02,
              fontSize: heightPercentageToDP(2),
              fontWeight: "600",
            }}
            onPress={() => navigation.navigate("Login")} // Use navigation prop
          >
            Back
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
    justifyContent: "center",
  },
  Img: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
  },
  borderStyleBase: {
    width: 30,
    height: 45,
  },
  borderStyleHighLighted: {
    borderColor: "#03DAC6",
  },
  underlineStyleBase: {
    width: 40,
    height: 45,
    borderWidth: 2,
    borderColor: COLORS.light,
    borderRadius: 7,
  },
  underlineStyleHighLighted: {
    borderColor: "#03DAC6",
  },
  otpContainer: {
    margin: 10,
  },
  pinCodeText: {
    color: "white",
  },
});

export default Otp;
