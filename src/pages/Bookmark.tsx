// import React, { useContext, useEffect, useState } from "react";
// import { View, Text, StyleSheet } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import RadioButton from "../components/RadioButton";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import { COLORS } from "../styles/themes";
// import { SplitStringValues } from "../service/DataShow";
// import { ScrollView } from "react-native";
// import Animated, { ZoomInDown } from "react-native-reanimated";
// import { ThemeContext } from "../service/authContext";
// import { Wrapper } from "../components/Wrapper";
// import GradientButton from "../components/GradientButton";
// import { getSecureStorage } from "../config/SecureStore";
// import Net from "@react-native-community/netinfo";
// import { axiosInstance } from "../config/indeceptor";

// // Accept navigation as a prop
// const Bookmark = ({ navigation }: { navigation: any }) => {
//   const themeContext = useContext(ThemeContext);
//   const [bookmarks, setBookmarks] = useState([]);

//   // Destructure the context value as an object
//   const {
//     userData,
//     setUserData,
//     signUpData,
//     setSignUpData,
//     appState,
//     setAppState,
//   } = themeContext;

//   useEffect(() => {
//     getSecureStorage("token")
//       .then((token) => {
//         if (token != null && token != undefined && token != "") {
//           CheckInternetConnectivity();
//         } else {
//           navigation.navigate("SignUp"); // Use navigation prop
//         }
//       })
//       .catch((err) => {
//         navigation.navigate("SignUp"); // Use navigation prop
//       });
//   }, []);

//   useEffect(() => {
//     axiosInstance
//       .get("bookmark")
//       .then((res) => {
//         if (res && res.data) {
//           setBookmarks(res.data.questions);
//         }
//       })
//       .catch((err) => {
//         if (err.status == 401) {
//           navigation.navigate("Login"); // Use navigation prop
//         }
//       });
//   }, []);

//   const CheckInternetConnectivity = () => {
//     Net.fetch().then((state) => {
//       setAppState((prev: any) => ({
//         ...prev,
//         internetStatus: state.isConnected,
//       }));
//     });
//   };

//   return (
//     <>
//       {!appState.internetStatus && <Wrapper />}
//       {appState.internetStatus && (
//         <LinearGradient
//           style={styles.androidLarge57}
//           colors={["#028464", "#0AB7AD", "#0B7960"]}
//         >
//           <View
//             style={{
//               flex: 1,
//               alignItems: "center",
//             }}
//           >
//             <View
//               style={{
//                 marginTop: userData.planValid ? hp(9) : 0,
//               }}
//             ></View>
//             <Animated.View entering={ZoomInDown}>
//               {userData.planValid ? (
//                 <ScrollView>
//                   {bookmarks.length === 0 ? (
//                     <Text
//                       style={{
//                         color: "white",
//                         textAlign: "center",
//                       }}
//                     >
//                       No bookmarks available. Please add some questions to your
//                       bookmarks.
//                     </Text>
//                   ) : (
//                     bookmarks.map((bmark, index) => {
//                       return <BookmarkQuestion key={index} MCQ={bmark} />;
//                     })
//                   )}
//                 </ScrollView>
//               ) : (
//                 <View
//                   style={{
//                     flex: 1,
//                     justifyContent: "center",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Text
//                     style={{
//                       textAlign: "center",
//                       color: "white",
//                       width: "70%",
//                     }}
//                   >
//                     You couldn't access these features. If you need access,
//                     please subscribe.
//                   </Text>
//                   <GradientButton
//                     onPress={() => {
//                       navigation.navigate("Plans"); // Use navigation prop
//                     }}
//                     colors={[
//                       "rgba(0, 183, 194, 1))",
//                       "rgba(197, 255, 244, 0.5)",
//                     ]}
//                     text="Subscribe now"
//                   />
//                 </View>
//               )}
//             </Animated.View>
//           </View>
//         </LinearGradient>
//       )}
//     </>
//   );
// };

// export default Bookmark;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   note: {
//     color: COLORS.light,
//     fontSize: hp(3),
//     fontFamily: "CroissantOne-Regular",
//   },
//   searchContainer: {
//     display: "flex",
//     backgroundColor: COLORS.grey,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: wp(4),
//     width: wp(90),
//   },
//   qusContainer: {
//     marginTop: hp(4),
//     backgroundColor: COLORS.secondary05,
//     width: wp(90),
//     paddingHorizontal: wp(4),
//     paddingVertical: hp(2.8),
//     paddingBottom: hp(4),
//     borderRadius: hp(4),
//     height: "auto",
//   },
//   qus: {
//     fontSize: hp(1.9),
//     alignItems: "center",
//     justifyContent: "center",
//     color: COLORS.light,
//     fontFamily: "Amiko-Regular",
//   },
//   androidLarge57: {
//     flex: 1,
//     overflow: "hidden",
//     backgroundColor: "transparent",
//     height: 800,
//     width: "100%",
//   },
//   Img: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "contain",
//     zIndex: 1000,
//   },
// });

// const BookmarkQuestion = (props: any) => {
//   return (
//     <View style={styles.qusContainer}>
//       <SplitStringValues MCQ={props.MCQ} keyName={"question"} />
//       <RadioButton
//         labelName={"option"}
//         MCQ={[
//           { 1: props.MCQ["1"] },
//           { 2: props.MCQ["2"] },
//           { 3: props.MCQ["3"] },
//           { 4: props.MCQ["4"] },
//         ]}
//         keyName={""}
//         answer={props.MCQ.answer}
//         showAnswer={true}
//         setSelectedIndex={() => {}}
//         selectedIndex={null}
//       />
//       <View>
//         <View
//           style={{
//             backgroundColor: COLORS.secondary04,
//             marginTop: hp(2),
//             paddingVertical: hp(0.9),
//             paddingHorizontal: hp(1),
//             borderRadius: hp(1.5),
//           }}
//         >
//           <Text style={{ color: "#FFF" }}>Explanation: </Text>
//           <SplitStringValues MCQ={props.MCQ} keyName={"explanation"} />
//           {props.MCQ.note && props.MCQ.note.value != "" && (
//             <View
//               style={{
//                 backgroundColor: COLORS.secondary04,
//                 marginTop: hp(2),
//                 paddingVertical: hp(0.9),
//                 paddingHorizontal: hp(1),
//                 borderRadius: hp(1.5),
//               }}
//             >
//               <Text style={{ color: "#FFF" }}>Note: </Text>
//               <SplitStringValues MCQ={props.MCQ} keyName={"note"} />
//             </View>
//           )}
//         </View>
//       </View>
//     </View>
//   );
// };import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../styles/themes";

const Bookmark = () => {
  return (
    <LinearGradient
      style={styles.container}
      colors={["#028464", "#0AB7AD", "#0B7960"]}
    >
      <View style={styles.content}>
        <Text style={styles.text}>Coming Soon</Text>
      </View>
    </LinearGradient>
  );
};

export default Bookmark;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    color: COLORS.light,
    fontWeight: "bold",
  },
});