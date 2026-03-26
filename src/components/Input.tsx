import React, { useEffect, useState } from "react";
import {
  CheckIcon,
  Icon,
  Input,
  Pressable,
  Select,
  View,
} from "@gluestack-ui/themed-native-base";
import { LoginProps } from "../interface/Interface";
import { StyleSheet, Text } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from "../styles/Responsive";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { COLORS } from "../styles/themes";
import { ThemeContext } from "../service/authContext";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const InputBox: React.FC<LoginProps> = (props) => {
  const [service, setService] = React.useState("");
  const [show, setShow] = React.useState(false);
  const { userData, setUserData, signUpData, setSignUpData } =
    React.useContext(ThemeContext);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (props.data.placeholderName === "standard" && service.length) {
      setSignUpData({ ...signUpData, std: service });
    } else if (props.data.placeholderName === "year" && service.length) {
      setSignUpData({ ...signUpData, targetYear: service });
    } else if (props.data.placeholderName === "Gender" && service.length) {
      setSignUpData({ ...signUpData, gender: service });
    }
  }, [service]);

  // const ValidateReg = (value: string, code: string) => {
  //   console.log(value, code);
  //   let email = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  //   let password =
  //     /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  //   if (code == "email") {
  //     return email.test(value);
  //   } else {
  //     return password.test(value);
  //   }
  // };

  // const validateField = (value: any) => {
  //   switch (props.componentName) {
  //     case "Signup":
  //       switch (props.index) {
  //         case 0:
  //           setSignUpData({ ...signUpData, [props.data.id]: value });
  //           if (props.data.id == "email" || props.data.id == "password") {
  //             if (props.data.required && value.trim() == "") {
  //               setErrors((prevErrors: any) => ({
  //                 ...prevErrors,
  //                 [props.data.id]: `${props.data.id} is required`,
  //               }));
  //             } else {
  //               setErrors({
  //                 ...errors,
  //                 [props.data.id]: ValidateReg(value, props.data.id)
  //                   ? ""
  //                   : props.data.error,
  //               });
  //             }
  //           } else if (props.data.id == "confirmPassword") {
  //             if (value !== signUpData.password) {
  //               setErrors((prevErrors: any) => ({
  //                 ...prevErrors,
  //                 [props.data.id]: props.data.error,
  //               }));
  //             }
  //           } else if (props.data.required && value.trim() == "") {
  //             setErrors((prevErrors: any) => ({
  //               ...prevErrors,
  //               [props.data.id]: `${props.data.id} is required`,
  //             }));
  //           } else if (props.data.id == "phoneNo") {
  //             setErrors((prevErrors: any) => ({
  //               ...prevErrors,
  //               [props.data.id]: value.length <= 9 ? props.data.error : "",
  //             }));
  //           }
  //           if(signUpData["firstName"]){

  //           }
  //           break;

  //         case 1:
  //           setSignUpData({ ...signUpData, [props.data.id]: value });
  //           if (props.data.id == "email" || props.data.id == "password") {
  //             if (props.data.required && value.trim() == "") {
  //               setErrors((prevErrors: any) => ({
  //                 ...prevErrors,
  //                 [props.data.id]: `${props.data.id} is required`,
  //               }));
  //             } else {
  //               setErrors({
  //                 ...errors,
  //                 [props.data.id]: ValidateReg(value, props.data.id)
  //                   ? ""
  //                   : props.data.error,
  //               });
  //             }
  //           } else if (props.data.id == "confirmPassword") {
  //             if (value !== signUpData.password) {
  //               setErrors((prevErrors: any) => ({
  //                 ...prevErrors,
  //                 [props.data.id]: props.data.error,
  //               }));
  //             }
  //           } else if (props.data.required && value.trim() == "") {
  //             setErrors((prevErrors: any) => ({
  //               ...prevErrors,
  //               [props.data.id]: `${props.data.id} is required`,
  //             }));
  //           } else if (props.data.id == "phoneNo") {
  //             setErrors((prevErrors: any) => ({
  //               ...prevErrors,
  //               [props.data.id]: value.length <= 9 ? props.data.error : "",
  //             }));
  //           }
  //           break;

  //         default:
  //           break;
  //       }
  //       break;

  //     case "Login":
  //       setSignUpData({ ...signUpData, [props.data.id]: value });
  //       if (props.data.required && value.trim() == "") {
  //         setErrors((prevErrors: any) => ({
  //           ...prevErrors,
  //           [props.data.id]: `${props.data.id} is required`,
  //         }));
  //       } else {
  //         setErrors((prevErrors: any) => ({
  //           ...prevErrors,
  //           [props.data.id]: props.data.error,
  //         }));
  //       }
  //       break;

  //     case "Profile":
  //       setSignUpData({ ...signUpData, [props.data.id]: value });
  //       if (props.data.id == "email" || props.data.id == "password") {
  //         if (props.data.required && value.trim() == "") {
  //           setErrors((prevErrors: any) => ({
  //             ...prevErrors,
  //             [props.data.id]: `${props.data.id} is required`,
  //           }));
  //         } else if (ValidateReg(value, props.data.id)) {
  //           setErrors((prevErrors: any) => ({
  //             ...prevErrors,
  //             [props.data.id]: props.data.error,
  //           }));
  //         }
  //       } else if (props.data.id == "confirmPassword") {
  //         if (value !== signUpData.password) {
  //           setErrors((prevErrors: any) => ({
  //             ...prevErrors,
  //             [props.data.id]: props.data.error,
  //           }));
  //         }
  //       } else if (props.data.required && value.trim() == "") {
  //         setErrors((prevErrors: any) => ({
  //           ...prevErrors,
  //           [props.data.id]: `${props.data.id} is required`,
  //         }));
  //       } else {
  //         setErrors((prevErrors: any) => ({
  //           ...prevErrors,
  //           [props.data.id]: props.data.error,
  //         }));
  //       }
  //       break;
  //     default:
  //       break;
  //   }
  // };

  return (
    <>
      {props.data.fieldType === "input" && (
        <>
          <View style={styles.container}>
            <Input
              maxLength={props.data.id === "phoneNo" ? 10 : undefined}
              key={props.keys}
              isDisabled={props.disable}
              value={signUpData[props.data.id]}
              type={
                props.data.inputType == "password"
                  ? !show
                    ? "password"
                    : "text"
                  : "text"
              }
              // keyboardType={"phone-pad"}
              outlineColor={"transparent"}
              underlineColorAndroid="transparent"
              borderColor="transprent"
              borderWidth={0}
              placeholder={props?.data.placeholderName}
              defaultValue={""}
              onFocus={(e: any) => console.log("eeee")}
              style={{
                fontSize: moderateScale(15),
                width: wp(80),
                height: wp(13),
                borderRadius: wp(2),
                zIndex: 0,
                borderWidth: 0,
                borderColor: "transparent",
                backgroundColor:
                  props.data.placeholderName == "search"
                    ? COLORS.grey
                    : "transparent",
              }}
              // onChangeText={(e) => validateField(e)}
              InputLeftElement={
                <Pressable onPress={() => setShow(!show)}>
                  {props.data.icon == "faUser" && (
                    <Icon
                      as={
                        <FontAwesomeIcon
                          icon={faUser}
                          size={24}
                          style={{ marginLeft: wp(5) }}
                        />
                      }
                      size={10}
                    />
                  )}
                  {props.data.icon == "passIcon" && (
                    <Icon
                      as={
                        <FontAwesomeIcon
                          icon={show ? faEye : faEyeSlash}
                          size={24}
                          style={{ marginLeft: wp(5) }}
                        />
                      }
                      size={10}
                    />
                  )}
                </Pressable>
              }
            ></Input>
          </View>
          {errors[props.data.id] && (
            <Text style={{ color: COLORS.error01 }}>
              {errors[props.data.id]}
            </Text>
          )}
        </>
      )}

      {props.data.fieldType === "select" && (
        <View style={styles.container}>
          <Select
            key={props.keys}
            selectedValue={service}
            // accessibilityLabel="Choose Service"
            placeholder={props.data.placeholderName}
            fontSize={wp("4%")}
            isDisabled={props.disable}
            height={wp(12)}
            _selectedItem={{
              bg: "teal.600",
              endIcon: <CheckIcon size="5" />,
            }}
            mt={1}
            onValueChange={(itemValue: any) => setService(itemValue)}
            // defaultValue={props?.userValue ? props?.userValue[props.data.value] : props?.value}
            defaultValue={props?.value}
            // onValueChange={(e) =>
            //   handleSelectionField(e, props.placeholderName)
            // }
            outlineColor={"transparent"}
            borderColor="transprent"
            borderWidth={0}
          >
            {props?.data?.label.map((data: any, index: any) => {
              // console.log(data, "res values");
              return (
                <Select.Item key={index} label={data.text} value={data.value} />
              );
            })}
          </Select>
        </View>
      )}
      {/* {errors[props.data.id] !== '' && <Text style={{ color: 'red' }}>{errors[props.data.id]}</Text>} */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp(80),
    backgroundColor: "white",
    borderRadius: wp(2),
    marginTop: wp(3),
    // paddingHorizontal:wp(2)
  },
  input: {
    height: hp(12),
    fontSize: hp(2),
    alignItems: "center",
    width: wp(10),
  },
  username: {
    height: verticalScale(50),
    fontSize: horizontalScale(20),
    borderColor: "none",
  },
});

export default InputBox;
