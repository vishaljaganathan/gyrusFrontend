
import React, { useState, useContext } from "react";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert } from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from '../components/CustomText';
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../styles/themes";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useMutation } from "@tanstack/react-query";
import { postRequest } from "../config/Requests";
import { LoginFields, ResetFields } from "../service/FormFeilds";
import Animated, { ZoomInLeft } from "react-native-reanimated";
import { setSecureStorage } from "../config/SecureStore";
import { moderateScale } from "../styles/Responsive";
import { useFormik } from "formik";
import GradientButton from "../components/GradientButton";
import { AxiosError } from "axios";
import { Ionicons } from '@expo/vector-icons';





// Accept navigation and route as props
const ResetPassword = ({ navigation, route }: { navigation: any; route: any }) => {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (values: any) => {
    const errors: any = {};

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

    return errors;
  };

  const createPostMutation = useMutation({
    mutationFn: postRequest,
    onSuccess: async (data: any, variable, context) => {
      setStatus(data.status);
      setLoading(false);
      if (data.status == 200) {
        navigation.replace("Login"); // Replace to avoid stacking
      }
    },
  onError: (error: AxiosError, variable, context) => {
      setLoading(false);
      let Error: any = error.response?.data;
      if (error.status == 400) {
        setLoginMsg(Error.message);
        const timer = setTimeout(() => {
          setLoginMsg("");
          clearTimeout(timer);
        }, 5000);
      } else if (error.status == 404) {
        setLoginMsg(error.message);
        const timer = setTimeout(() => {
          setLoginMsg("");
        }, 5000);
      }
    }
  });

  const formik: any = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "" }, validate: validate,
    onSubmit: (values) => {
      setLoading(true);
      createPostMutation.mutate({
        URL: "authentication/reset/password/" + route.params.id, // Use route prop
        payload: values
      });
    }
  });

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
      <View style={styles.LoginContainer}>
        <Animated.View entering={ZoomInLeft} style={{ alignItems: "center" }}>
          <View
            style={{
              backgroundColor: COLORS.primary05,
              margin: wp(1),
              paddingHorizontal: wp(4),
              paddingTop: wp(6),
              paddingBottom: wp(6),
              borderRadius: wp(3) } }
          >
            <Text
              style={{
                fontFamily: 'AppFont-Bold', fontSize: wp(5),
                                marginBottom: wp(3),
                color: COLORS.colorWhite } }
            ></Text>
            <Text
              style={{
                fontFamily: 'AppFont-Bold', fontSize: wp(5),
                                marginBottom: wp(3),
                color: COLORS.colorWhite } }
            >
              Reset Password
            </Text>
            {ResetFields.map((data: any, index) => {
              return (
                <View key={data.idx} style={{ marginBottom: hp(2) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', width: wp(85), position: 'relative' }}>
                    <TextInput
                      style={styles.inputField}
                      keyboardType={data.phonePad ? "numeric" : "default"}
                      placeholder={data.placeholderName}
                      placeholderTextColor="#999"
                      secureTextEntry={data.id === 'password' ? !showPassword : data.id === 'confirmPassword' ? !showConfirmPassword : true}
                      maxLength={data.id == "phoneNo" ? 10 : undefined}
                      onChangeText={formik.handleChange(`${data.id}`)}
                      onBlur={formik.handleBlur(`${data.id}`)}
                      value={formik.values[`${data.id}`]}
                    />
                    {(data.id === 'password' || data.id === 'confirmPassword') && (
                      <TouchableOpacity
                        onPress={() => {
                          if (data.id === 'password') {
                            setShowPassword(!showPassword);
                          } else if (data.id === 'confirmPassword') {
                            setShowConfirmPassword(!showConfirmPassword);
                          }
                        }} style={{ position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Ionicons
                          name={data.id === 'password' ? (showPassword ? 'eye-off' : 'eye') : (showConfirmPassword ? 'eye-off' : 'eye')}
                          size={20}
                          color="gray"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  {formik.errors[data.id] && formik.touched[data.id] ? (
                    <>
                      <Text
                        style={{
                          fontFamily: 'AppFont-Regular', fontSize: hp(1.5),
                          color: "#FFEA00",
                          paddingHorizontal: wp(1),
                          marginBottom: hp(1) } }
                      >
                        {formik.errors[`${data.id}`]}
                      </Text>
                    </>
                  ) : null}
                </View>
              );
            })}

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
              onPress={formik.handleSubmit}
              disable={!formik.isValid}
              loading={loading}
              colors={
                !formik.isValid
                  ? [COLORS.button_enable01, COLORS.button_enable02]
                  : [COLORS.button_disable01, COLORS.button_disable02]
              }
              Text={"Reset Password"}
            />
            <Text
              style={{
                color: "white",
                fontFamily: 'AppFont-Regular', fontSize: wp(4),
                marginTop: wp(3) } }
            >
              {" "}
              If you don't have an account ?{" "}
              <Text
                style={{
                  color: COLORS.colorWhite,
                  fontFamily: 'AppFont-Regular', fontSize: wp(4)} }
                onPress={() => navigation.replace("SignUp")} // Replace to avoid stacking
              >
                {" "}
                Sign Up
              </Text>{" "}
            </Text>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
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
  LoginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputField: {
    fontFamily: 'AppFont-Regular',
    width: "100%",
    borderRadius: wp(2),
    zIndex: 0,
    borderWidth: 0,
    paddingHorizontal: wp(3),
    borderColor: "transparent",
    backgroundColor: "white",
    height: hp(5.5),
  },
});

export default ResetPassword;
