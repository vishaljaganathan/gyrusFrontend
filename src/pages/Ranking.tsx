// import React, { useEffect, useState, useContext } from "react";
// import { StyleSheet, View, ScrollView, Text, Platform } from "react-native";
// import { Dimensions } from "react-native";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import { LinearGradient } from "expo-linear-gradient";
// import { axiosInstance } from "../config/indeceptor";
// import { Wrapper } from "../components/Wrapper";
// import { getSecureStorage } from "../config/SecureStore";
// import HeaderBar from "../navigation/Headerbar";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import Net from "@react-native-community/netinfo";
// import { ThemeContext } from "../service/authContext";

// const rankSuffix = (index: number) => {
//   switch (index) {
//     case 1:
//       return "st";
//     case 2:
//       return "nd";
//     case 3:
//       return "rd";
//     default:
//       return "th";
//   }
// };

// const rankStyle = (index: number) => {
//   switch (index) {
//     case 1:
//       return {
//         borderWidth: wp(0.6),
//         borderColor: "#009DF6",
//       };
//     case 2:
//       return {
//         borderWidth: wp(0.6),
//         borderColor: "#BDBDBD",
//       };
//     case 3:
//       return {
//         borderWidth: wp(0.6),
//         borderColor: "#BDBDBD",
//       };
//     default:
//       return {};
//   }
// };

// // Accept navigation as a prop
// const Ranking = ({ navigation }: { navigation: any }) => {
//   const insets = useSafeAreaInsets();
//   const {
//     userData,
//     setUserData,
//     signUpData,
//     setSignUpData,
//     appState,
//     setAppState,
//   } = useContext(ThemeContext);

//   useEffect(() => {
//     CheckInternetConnectivity();
//     getSecureStorage("token")
//       .then((token) => {
//         if (token != null && token != undefined && token != "") {
//         } else {
//           navigation.navigate("Login"); // Use navigation prop
//         }
//       })
//       .catch((err) => {
//         navigation.navigate("Login"); // Use navigation prop
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

//   const [rankingList, setRankingList] = useState([]);
//   const [userRank, setUserRank] = useState({ name: "", score: 0, rank: 50 });

//   useEffect(() => {
//     axiosInstance
//       .get("score/rankings")
//       .then((res) => {
//         if (res && res.data && res.data.data) {
//           setRankingList(res.data.data);
//           setUserRank(res.data.user);
//         }
//       })
//       .catch((err) => {});
//   }, []);

//   return (
//     <>
//       <View
//         style={{
//           paddingTop: insets.top,
//           paddingRight: insets.right,
//           paddingLeft: insets.left,
//           backgroundColor: Platform.OS ? "#00474C" : "",
//         }}
//       />
//       <LinearGradient
//         style={style.androidLarge57}
//         colors={["#028464", "#0AB7AD", "#0B7960"]}
//       >
//         <HeaderBar />
//         {!appState.internetStatus && <Wrapper />}

//         {appState.internetStatus && (
//           <ScrollView>
//             <View style={style.rankingList}>
//               {rankingList.length == 0 && (
//                 <Text
//                   style={{ color: "#FFF", fontSize: wp(4), fontWeight: "500" }}
//                 >
//                   Rankings not available Yet!
//                 </Text>
//               )}

//               {rankingList.map((data: any, i: any) => {
//                 return (
//                   <View key={i} style={style.rankingListCards}>
//                     <View
//                       style={[style.rankingListProfileCard, rankStyle(i + 1)]}
//                     >
//                       <Text style={style.font}>
//                         {i + 1}
//                         {rankSuffix(i + 1)}
//                       </Text>
//                     </View>
//                     <View
//                       style={[style.rankingListDataContainer, rankStyle(i + 1)]}
//                     >
//                       <View style={style.rankingDatacard}>
//                         <View style={{ gap: hp(0.3), padding: hp(0.7) }}>
//                           <Text style={style.font}>{data.name}</Text>
//                           <Text style={style.fontGp}>{data.score} GP</Text>
//                         </View>
//                       </View>
//                     </View>
//                   </View>
//                 );
//               })}
//               {userRank.name && (
//                 <View style={style.rankingListCards}>
//                   <View
//                     style={[
//                       style.rankingListDataContainer,
//                       rankStyle(userRank.rank),
//                     ]}
//                   >
//                     <View style={style.rankingDatacard}>
//                       <View>
//                         <Text style={style.font}>Your Rank</Text>
//                         <Text style={style.font}>
//                           {userRank.rank}
//                           {rankSuffix(userRank.rank)}
//                         </Text>
//                       </View>
//                       <View style={{ gap: hp(0.3), padding: hp(0.7) }}>
//                         <Text style={style.font}>{userRank.name}</Text>
//                         <Text style={style.fontGp}>{userRank.score} GP</Text>
//                       </View>
//                     </View>
//                   </View>
//                 </View>
//               )}
//             </View>
//           </ScrollView>
//         )}
//       </LinearGradient>
//     </>
//   );
// };

// const style = StyleSheet.create({
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
//   },
//   rankingContainer: {
//     flex: 1,
//     alignItems: "center",
//   },
//   profileContainer: {
//     display: "flex",
//     flexDirection: "row",
//     alignItems: "flex-end",
//     columnGap: hp(1.7),
//     justifyContent: "center",
//     marginTop: hp(5),
//   },
//   firstRank: {
//     height: wp(28),
//     width: wp(28),
//     backgroundColor: "white",
//     borderRadius: wp(16),
//     overflow: "hidden",
//     top: hp(4),
//   },
//   commonRank: {
//     height: wp(23),
//     width: wp(23),
//     backgroundColor: "white",
//     borderRadius: wp(12.5),
//     zIndex: 1,
//     top: hp(5),
//   },
//   rankingList: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: hp(2),
//     gap: hp(1),
//   },
//   rankingListCards: {
//     display: "flex",
//     flexDirection: "row",
//     columnGap: hp(1),
//   },
//   rankingListProfileCard: {
//     backgroundColor: "#0A5051",
//     alignItems: "center",
//     justifyContent: "center",
//     width: wp(13),
//     height: hp(6),
//     borderRadius: hp(0.3),
//   },
//   yourProfileCard: {
//     backgroundColor: "white",
//     width: wp(13),
//     height: hp(6),
//     borderRadius: hp(1),
//   },
//   rankingListDataContainer: {
//     backgroundColor: "#0A5051",
//     width: wp(63),
//     height: hp(6),
//     borderRadius: hp(0.3),
//   },
//   yourDataContainer: {
//     backgroundColor: "white",
//     width: wp(63),
//     height: hp(6),
//     borderRadius: hp(1),
//   },
//   rankingDatacard: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: wp(2),
//   },
//   font: {
//     fontSize: hp(1.6),
//     fontWeight: "700",
//     color: "#FFFFFF",
//   },
//   fontGp: {
//     fontSize: hp(1.6),
//     fontWeight: "600",
//     color: "#0AB8AD",
//   },
//   yourFont: {
//     fontSize: hp(2),
//     fontWeight: "500",
//   },
// });

//  export default Ranking;

import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderBar from "../navigation/Headerbar";

const Ranking = () => {
  const insets = useSafeAreaInsets(); // Get safe area insets

  return (
    <View style={[style.safeArea]}>
      <LinearGradient
        style={[style.androidLarge57, { paddingTop: insets.top }]} // Apply paddingTop to LinearGradient
        colors={["#028464", "#0AB7AD", "#0B7960"]}
      >
        <HeaderBar />
        <View style={style.comingSoonContainer}>
          <Text style={style.comingSoonText}>Coming Soon!</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const style = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#028464", // Match the gradient's starting color
  },
  androidLarge57: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
    width: "100%",
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

export default Ranking;