import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Modal,
  Platform,
 Pressable,
} from "react-native";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { widthPercentageToDP as Wp } from "react-native-responsive-screen";
import { COLORS } from "../styles/themes";

export default function DateInput({ formik }: any) {
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("Date of Birth");
  const [startedDate, setStartedDate] = useState("12/12/2023");

  const handleChangeStartDate = (event: any, date?: Date) => {
    let formattedDate: string | undefined;

    if (date instanceof Date && !isNaN(date.getTime())) {
      formattedDate = dayjs(date).format("DD-MM-YYYY");
    }

    if (formattedDate) {
      formik.setFieldValue("dob", formattedDate);
      setStartedDate(formattedDate);
      setSelectedStartDate(formattedDate);
      setOpenStartDatePicker(false);
    }
  };

  const handleOnPressStartDate = () => {
    setOpenStartDatePicker(!openStartDatePicker);
  };

  const getInitialDate = () => {
    return new Date(2011, 0, 1); // January 1, 2011
  };

  return (
    <KeyboardAvoidingView>
      <View>
        <TouchableOpacity
          style={styles.inputBtn}
          onPress={handleOnPressStartDate}
        >
          <Text
            style={{
              color: formik.values["dob"].length ? "#333" : "#999", // hint color for placeholder
              fontSize: Wp(3.2),
              paddingLeft: Wp(2),
            }}
          >
            {formik.values["dob"].length
              ? formik.values["dob"]
              : selectedStartDate}
          </Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={openStartDatePicker}
          presentationStyle="overFullScreen"
        >
          <Pressable
            style={styles.centeredView}
            onPress={() => setOpenStartDatePicker(false)} 
          >
            <View style={styles.centeredView}>

              <DateTimePicker
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "spinner"} 
                value={getInitialDate()}
                onChange={handleChangeStartDate}
                style={styles.spinnerStyle}
              />
            </View>
          </Pressable>
        </Modal>
      </View >
    </KeyboardAvoidingView >
  );
}

const styles = StyleSheet.create({
  inputBtn: {
    borderRadius: Wp(2),
    height: Wp(14),
    paddingLeft: Wp(2),
    fontSize: 18,
    backgroundColor: COLORS.colorWhite,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0)",
  },

  spinnerStyle: {
    width: "100%",
    height: 150,
  },

});
