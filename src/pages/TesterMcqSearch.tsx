import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../service/authContext";
import { COLORS } from "../styles/themes";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const TesterMcqSearch = () => {
  const navigation: any = useNavigation();
  const { userData } = useContext(ThemeContext);
  const [mcqId, setMcqId] = useState("");

  const isTester = useMemo(() => {
    return String(userData?.accType || "")
      .trim()
      .toLowerCase() === "tester";
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
        testId: "",
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Search MCQ</Text>

        {!isTester ? (
          <Text style={styles.warn}>This section is only for tester accounts.</Text>
        ) : (
          <>
            <TextInput
              value={mcqId}
              onChangeText={setMcqId}
              placeholder="Enter MCQ ID"
              placeholderTextColor="#A5A5A5"
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={onSearch}
            />

            <Pressable
              onPress={onSearch}
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
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
    backgroundColor: COLORS.secondary01,
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(3),
  },
  title: {
    color: "#FFFFFF",
    fontSize: hp(2.6),
    fontWeight: "700",
    marginBottom: hp(2),
  },
  warn: {
    color: "#FFFFFF",
    opacity: 0.85,
    fontSize: hp(1.8),
  },
  input: {
    backgroundColor: COLORS.secondary04,
    color: "#FFFFFF",
    borderRadius: hp(1.2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.6),
    fontSize: hp(2),
    borderWidth: 1,
    borderColor: "#0AB8AD",
    marginBottom: hp(2),
  },
  button: {
    backgroundColor: "#0AB8AD",
    borderRadius: hp(1.2),
    paddingVertical: hp(1.6),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: hp(2),
    fontWeight: "700",
  },
});

export default React.memo(TesterMcqSearch);
