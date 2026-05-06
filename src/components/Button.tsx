import { Box, Button } from "@gluestack-ui/themed-native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { ButtonProps } from "../interface/Interface";



const Buttons = (buttonProps: ButtonProps) => {
  // console.log(buttonProps, "buttonProps");

  return (
    <Button
      style={styles.container}
      width={buttonProps.width}
      height={buttonProps.height}
      fontSize={buttonProps.textSize}
      color={buttonProps.color}
      background={buttonProps.backgroundColor}
            onPress={buttonProps.onSubmit && buttonProps.onSubmit}
      disabled={buttonProps?.disabled}
    >
      {buttonProps.text}
      {/* {buttonProps.disabled=='loading' &&<Loader/>}   */}
    </Button>
  );
};
const styles = StyleSheet.create({
  container: {
     marginTop: 12,
    // width: "80%",
    // height: 50,
    // backgroundColor: "",
    color: "red",
        // fontFamily: 'AppFont-Regular', fontSize: "80%"
  }
});

export default Buttons;
