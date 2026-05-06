import React, { useEffect, useState } from "react";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert } from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from '../components/CustomText';
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../styles/themes";
import OTPInputView from "react-native-otp-inputs";
import { postRequest } from "../config/Requests";
import { useMutation } from "@tanstack/react-query";
import Animated, { ZoomInLeft } from "react-native-reanimated";
import GradientButton from "../components/GradientButton";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp } from "react-native-responsive-screen";
import { moderateScale } from "../styles/Responsive";
import { AxiosError } from "axios";



// Accept navigation as a prop
const ForgotPassword = ({ navigation }: { navigation: any }) => {
  const [loading, setLoading] = useState(false);
  const [phoneNo, setPhoneNo] = useState("");
  const [loginMsg, setLoginMsg] = useState("");

  const createPostMutation = useMutation({
    mutationFn: postRequest,
    onSuccess: async (data: any, variable, context) => {
        if (data.status == 200) {
        const otpUserId = data.data.id || data.data._id;
        navigation.replace("Otp", { 
          id: otpUserId, 
          operation: "fp",
          phoneNo: variable.payload.phoneNo
        }); // Replace to avoid stacking
      }
    },
  onError: (error: AxiosError, variable, context) => {
      setLoading(false);
      let Error: any = error.response?.data;
      if (error.status == 400) {
        const otpUserId = Error.id || Error._id || Error.data?.id || Error.data?._id;
        navigation.replace("Otp", { 
          id: otpUserId, 
          operation: "fp",
          phoneNo: variable.payload.phoneNo
        }); // Replace to avoid stacking
      } else if (error.status == 406) {
      } else if (error.status == 404) {
        setLoginMsg(Error.message);
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 5000);
      }
    }
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
            justifyContent: "center" } }
        >
          <View
            style={{
              backgroundColor: COLORS.primary05,
              margin: wp(1),
              paddingHorizontal: wp(4),
              paddingTop: wp(9),
              paddingBottom: wp(10),
              borderRadius: wp(3) } }
          >
            <Text
              style={{
                fontFamily: 'AppFont-Bold', fontSize: wp(5),
                                marginBottom: wp(3),
                color: COLORS.colorWhite } }
            >
              Forgot Password
            </Text>
            <>
              <TextInput
                style={{
                  
                  fontFamily: 'AppFont-Regular', fontSize: moderateScale(12),
                  marginBottom: wp(1),
                  width: wp(80),
                  height: hp(5.5),
                  borderRadius: wp(2),
                  zIndex: 0,
                  borderWidth: 0,
                  paddingHorizontal: wp(3),
                  borderColor: "transparent",
                  backgroundColor: "white" } }
                keyboardType={"numeric"}
                placeholder={"Mobile Number"}
                placeholderTextColor="gray"
                secureTextEntry={false}
                maxLength={10}
                onChangeText={(Text) => {
                  setPhoneNo(Text.replace(/[^0-9]/g, ""));
                }}
                value={phoneNo}
              />
              {loginMsg.length ? (
                <>
                  <Text
                    style={{
                      fontFamily: 'AppFont-Regular', fontSize: hp(1.5),
                      color: "#FFEA00",
                      paddingHorizontal: wp(1),
                      marginBottom: hp(1) } }
                  >
                    {loginMsg}
                  </Text>
                </>
              ) : null}

              <GradientButton
                onPress={() => {
                  setLoading(true);
                  createPostMutation.mutate({
                    URL: "authentication/forgot-password",
                    payload: { phoneNo: phoneNo } });
                }}
            disable={phoneNo.length == 10 ? false : true}
                loading={loading}
            Text={<Text style={{ fontFamily: 'AppFont-Bold' }}>Submit</Text>}
              />
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: 'AppFont-Bold', fontSize: hp(2),
                                    textAlign: "center" } }
            onPress={() => navigation.replace("Login")} // Replace to avoid stacking
              >
                Back
              </Text>
            </>
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center" }, Img: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch" }, borderStyleBase: {
    width: 30,
    height: 45 }, borderStyleHighLighted: {
    borderColor: "#03DAC6" }, underlineStyleBase: {
    width: 40,
    height: 45,
    borderWidth: 2,
    borderColor: COLORS.light,
    borderRadius: 7 }, underlineStyleHighLighted: {
    borderColor: "#03DAC6" } });

export default ForgotPassword;
