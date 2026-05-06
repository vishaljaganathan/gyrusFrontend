import React, { useContext, useMemo, useState } from "react";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert , Keyboard} from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from '../components/CustomText';
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../service/authContext";
import { COLORS } from "../styles/themes";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp} from "react-native-responsive-screen";

const TesterMcqSearch = () => {
  const navigation: any = useNavigation();
  const { userData } = useContext(ThemeContext);
  const [mcqId, setMcqId] = useState("");

  const isTester = useMemo(() => {
    return (
      String(userData?.accType || "")
        .trim()
        .toLowerCase() === "tester"
    );
  }, [userData?.accType]);

  const onSearch = () => {
    const trimmed = String(mcqId || "").trim();
    if (!trimmed) return;

    Keyboard.dismiss();

    navigation.navigate("Test", {
      params: {
        reviewMcqId: trimmed,
        // Provide minimal params so Test layout conditions remain stable
        type: 1,
        subject: "neet",
        std: userData?.std,
        subjectId: "",
        testId: ""}});
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Search MCQ</Text>

        {!isTester ? (
          <Text style={styles.warn}>
            This section is only for tester accounts.
          </Text>
        ) : (
          <>
            <TextInput
              value={mcqId}
              onChangeText={setMcqId}
              placeholder="Enter MCQ ID"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={onSearch}
            />

            <Pressable
              onPress={onSearch}
              style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.buttonText}>Search</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.secondary01},
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
    justifyContent: "flex-start",
  },
  title: {
    color: "#FFFFFF",
    fontFamily: 'AppFont-Bold', 
    fontSize: hp(2.6),
    marginBottom: hp(2)},
  warn: {
    color: "#FFFFFF",
    opacity: 0.85,
    fontFamily: 'AppFont-Regular', 
    fontSize: hp(1.8)},
  input: {
    backgroundColor: COLORS.secondary04,
    color: "#FFFFFF",
    borderRadius: hp(1.2),
    paddingHorizontal: wp(4),
    height: hp(6),
    fontFamily: 'AppFont-Bold', 
    fontSize: hp(2),
    borderWidth: 1,
    borderColor: "#0AB8AD",
    marginBottom: hp(2),
    textAlign: "left",
    textAlignVertical: "center",
  },
    
  button: {
    backgroundColor: "#0AB8AD",
    borderRadius: hp(1.2),
    paddingVertical: hp(1.6),
    alignItems: "center",
    justifyContent: "center"},
  buttonText: {
    
    color: "#FFFFFF",
    fontFamily: 'AppFont-Bold', fontSize: hp(2)}});

export default React.memo(TesterMcqSearch);
