import React, { useEffect, useState } from "react";
import {
  CheckIcon,
  Icon,
  Input,
  Select} from "@gluestack-ui/themed-native-base";
import { LoginProps } from "../interface/Interface";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert } from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from './CustomText';

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {
  horizontalScale,
  moderateScale,
  verticalScale} from "../styles/Responsive";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp} from "react-native-responsive-screen";
import { COLORS } from "../styles/themes";
import { ThemeContext } from "../service/authContext";





const InputBox: React.FC<LoginProps> = (props) => {
  const [service, setService] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
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
  //     /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8 },$/;
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
    <View>
      {props.data.fieldType === "input" && (
        <View>
          <View style={styles.container}>
            {/* explicit label above input to force app font on placeholder-like text */}
            <Text style={{ fontSize: moderateScale(12), color: '#C6CDD0', marginBottom: 6 }}>
              {props.data.label || props.data.placeholderName}
            </Text>
            <View style={{ width: '100%' }}>
              <Input
              maxLength={props.data.id === "phoneNo" ? 10 : undefined}
              key={props.keys}
              isDisabled={props.disable}
              value={signUpData[props.data.id]}
              type={props.data.inputType == "password" ? (!show ? "password" : "Text") : "Text"}
              outlineColor={"transparent"}
              underlineColorAndroid="transparent"
              borderColor="transparent"
              borderWidth={0}
              defaultValue={""}
              onFocus={(e: any) => {
                setFocused(true);
                setShow(true);
              }}
              onBlur={() => {
                setFocused(false);
                setShow(false);
              }}
              _input={{
                style: {
                  fontFamily: 'AppFont-Regular',
                  fontSize: moderateScale(15),
                  includeFontPadding: false,
                  fontWeight: '400',
                  fontStyle: 'normal',
                  textAlignVertical: 'center'
                }
              }}
              style={{
  
                fontFamily: 'AppFont-Regular',
                fontSize: moderateScale(15),
                width: wp(80),
                height: wp(13),
                borderRadius: wp(2),
                zIndex: 0,
                borderWidth: 0,
                borderColor: "transparent",
                backgroundColor: props.data.placeholderName == "search" ? COLORS.grey : "transparent"
              }}
              onChangeText={(val: string) => {
                // keep existing sync logic
                setSignUpData({ ...signUpData, [props.data.id]: val });
              }}
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
          </View>
          {errors[props.data.id] && (
            <Text style={{ color: COLORS.error01 }}>
              {errors[props.data.id]}
            </Text>
          )}
        </View>
      )}

      {props.data.fieldType === "select" && (
        <View style={styles.container}>
          <Select
            key={props.keys}
            selectedValue={service}
            // accessibilityLabel="Choose Service"
            placeholder={props.data.placeholderName}
            fontSize={moderateScale(15)}
            isDisabled={props.disable}
            height={wp(12)}
            _selectedItem={{
              bg: "teal.600",
              endIcon: <CheckIcon size="5" />}}
            _trigger={{ _text: { fontFamily: 'AppFont-Regular' } }}
            _item={{ _text: { fontFamily: 'AppFont-Regular' } }}
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
                <Select.Item key={index} label={data.Text} value={data.value} />
              );
            })}
          </Select>
        </View>
      )}
      {/* {errors[props.data.id] !== '' && <Text style={{ color: 'red' }}>{errors[props.data.id]}</Text>} */}
    </View>
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
    fontFamily: 'AppFont-Regular', fontSize: hp(2),
    alignItems: "center",
    width: wp(10)},
  username: {
    
    height: verticalScale(50),
    fontFamily: 'AppFont-Regular', fontSize: horizontalScale(20),
    borderColor: "none"}});

export default InputBox;
