import { COLORS } from '../styles/themes';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert , KeyboardAvoidingView, Platform, TouchableWithoutFeedback} from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from './CustomText';
import { moderateScale } from '../styles/Responsive';

import React, { useState } from "react";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);





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
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: getValueDate(),
        onChange: handleChangeStartDate,
        mode: 'date',
        display: 'spinner',
        maximumDate: new Date(),
        minimumDate: new Date(1900, 0, 1),
      });
    } else {
      setOpenStartDatePicker(!openStartDatePicker);
    }
  };

  const getInitialDate = () => {
    // Default to a reasonable birth-year (approx. 16 years old)
    const year = new Date().getFullYear() - 16;
    return new Date(year, 0, 1);
  };

  const getValueDate = () => {
    const dob = formik.values["dob"];
    if (dob && typeof dob === "string") {
      // Try a few common formats used in the app and by the server
      const formats = [
        "DD-MM-YYYY",
        "DD/MM/YYYY",
        "YYYY/MM/DD",
        "YYYY-MM-DD",
        "YYYY-MM-DDTHH:mm:ssZ",
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
      ];
      for (const fmt of formats) {
        const parsed = dayjs(dob, fmt as any, true);
        if (parsed.isValid()) return parsed.toDate();
      }
      // Try flexible parsing via dayjs (handles many ISO variants)
      const parsedFree = dayjs(dob);
      if (parsedFree.isValid()) return parsedFree.toDate();
      // Last-resort: try native Date parsing
      const native = new Date(dob);
      if (!isNaN(native.getTime())) return native;
    }
    return getInitialDate();
  };

  return (
      <View>
        <TouchableOpacity
          style={styles.inputBtn}
          onPress={handleOnPressStartDate}
        >
          <Text
            style={{
              color: formik.values["dob"].length ? "#333" : "#999", // hint color for placeholder
              fontFamily: 'AppFont-Regular', fontSize: moderateScale(12),
              textAlign: 'left',
              }}
          >
            {formik.values["dob"].length
              ? formik.values["dob"]
              : selectedStartDate}
          </Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={openStartDatePicker}
            presentationStyle="overFullScreen"
          >
            <View style={[styles.centeredView, styles.backdropVisible]}>
              {/* Backdrop: tapping outside the picker closes the modal */}
              <Pressable style={styles.backdropFull} onPress={() => setOpenStartDatePicker(false)} />
              <View style={[styles.pickerContainer, styles.pickerElevated]}>
                <DateTimePicker
                  mode="date"
                  display="spinner"
                  value={getValueDate()}
                  onChange={handleChangeStartDate}
                  style={styles.spinnerStyle}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              </View>
            </View>
          </Modal>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  inputBtn: {
    borderRadius: wp(2),
    height: hp(6),
    width: "100%",
    paddingLeft: wp(4),
    fontFamily: 'AppFont-Regular',
    fontSize: moderateScale(12),
    backgroundColor: COLORS.colorWhite,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  centeredView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  pickerContainer: {
    width: Math.min(340, wp(90)),
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinnerStyle: {
    width: "100%",
    height: 150
  },
  // additional styles to control modal/backdrop/elevation
  backdropFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent'
  },
  backdropVisible: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  pickerElevated: {
    elevation: 30,
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  }
});
