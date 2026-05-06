import { COLORS } from '../styles/themes';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React from 'react';
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Alert } from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from './CustomText';

import { Modal } from "@gluestack-ui/themed-native-base";
import { LinearGradient } from 'expo-linear-gradient';





interface LogoutPopupProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function LogoutPopup({ visible, onClose, onLogout }: LogoutPopupProps) {
  return (
    <Modal isOpen={visible} onClose={onClose}>
      <Modal.Content
        maxWidth={wp(95)}
        maxH={hp(85)}
        style={styles.modalContent}
      >
        <Modal.Body style={styles.modalBody}>
          <View style={styles.container}>
            <View style={styles.contentWrapper}>
              <Text style={styles.title}>Logout?</Text>
              <Text style={styles.message}>
                You are about to logout from the app. Do you want to continue?
              </Text>
              <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                  <TestButton
                    onPress={onClose}
                    colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
                    text="Cancel"
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <TestButton
                    onPress={onLogout}
                    colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
                    text="Logout"
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}

const TestButton = ({ onPress, colors, text }: any) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        style={[styles.card, styles.shadow]}
        colors={colors}
        start={{ x: 0.6, y: 0.3 }}
        end={{ x: 0.6, y: 0 }}
      >
        <Text style={styles.buttonTxt}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    borderWidth: wp(0.3),
    borderRadius: wp(2),
    borderColor: "#0AB8AD",
    display: "flex",
    alignItems: "center",
    width: wp(90),
    marginVertical: hp(2),
    paddingHorizontal: wp(3),
    paddingVertical: wp(3),
    backgroundColor: "rgba(47, 47, 47, 0.9)"},
  modalBody: {
    width: "100%",
    paddingHorizontal: 0},
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%"},
  contentWrapper: {
    alignItems: "center",
    width: "100%"},
  title: {
     // Use Bold for the title
    color: "#0AB8AD",
    fontFamily: 'AppFont-Regular', fontSize: hp(2.2),
    textAlign: "center",
    lineHeight: hp(2.8),
    width: "100%",
        marginBottom: hp(1)},
  message: {
    color: "#0AB8AD",
    fontFamily: 'AppFont-Regular', fontSize: hp(1.68),
    textAlign: "center",
    lineHeight: hp(2.4),
    width: "100%",
    marginBottom: hp(2)},
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(2),
    columnGap: wp(2),
    width: "100%",
    rowGap: hp(1)},
  buttonWrapper: {
    flex: 1,
    minWidth: wp(35),
    maxWidth: wp(40)},
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    height: hp(4),
    width: wp(35),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: 'center'},
  shadow: {
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84},
  buttonTxt: {
     // Use Bold for buttons
    fontFamily: 'AppFont-Bold', fontSize: wp(4),
    textTransform: "uppercase",
        color: COLORS.light,
    letterSpacing: wp(0.3),
    textAlign: "center"}});
