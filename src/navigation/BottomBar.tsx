import React, { useContext, useMemo } from "react";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
  faBookmark,
  faAward,
  faHouse,
  faBell,
  faRankingStar,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Home from "../pages/Home";
// import Bookmark from "../pages/Bookmark";
import Rewards from "../pages/Rewards";
import Profile from "../pages/Profile";
// import Ranking from "../pages/Ranking";
import Notification from "../pages/Notification";
import GyrusNEETAnalytics from "../pages/GyrusNEETAnalytics";
import { COLORS, FONTS } from "../styles/themes";
import { Svg, Path, G, Rect, Defs, ClipPath, Circle as SvgCircle } from "react-native-svg";
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Circle } from "@gluestack-ui/themed-native-base";
import { useSafeAreaInsets, initialWindowMetrics } from "react-native-safe-area-context";
import { View, Animated, Platform, Pressable, Modal, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from "../service/authContext";

const Tab = createBottomTabNavigator();

const HomeIcon = ({ color, size = 28 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* Scale the original 48x48 path down to 40x40 to match other icons' viewBox */}
    <G transform="scale(0.833333)">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.1716 9.17157C22.7337 7.60948 25.2663 7.60948 26.8284 9.17157L39.6569 22C40.4379 22.781 40.875 23.8628 40.875 24.9926V37.25C40.875 39.7353 38.8603 41.75 36.375 41.75H11.625C9.13973 41.75 7.125 39.7353 7.125 37.25V24.9926C7.125 23.8628 7.56214 22.781 8.34315 22L21.1716 9.17157Z
         M21 41.75V30.75C21 29.7835 21.7835 29 22.75 29H25.25C26.2165 29 27 29.7835 27 30.75V41.75H21Z"
        fill={color}
      />
    </G>
  </Svg>
);

// const BookmarkIcon = ({ color }: any) => (
//   <Svg width={25} height={25} viewBox="0 0 40 40" fill="none">
//     <Path
//       d="M27.3125 35.625C25.6684 35.625 24.0613 35.1375 22.6943 34.2241C21.3273 33.3107 20.2619 32.0125 19.6328 30.4936C19.0036 28.9747 18.839 27.3033 19.1597 25.6908C19.4805 24.0783 20.2722 22.5972 21.4347 21.4347C22.5972 20.2722 24.0783 19.4805 25.6908 19.1597C27.3033 18.839 28.9746 19.0036 30.4936 19.6328C32.0125 20.2619 33.3107 21.3273 34.2241 22.6943C35.1375 24.0613 35.625 25.6684 35.625 27.3125C35.6225 29.5163 34.7459 31.6292 33.1876 33.1876C31.6292 34.7459 29.5163 35.6225 27.3125 35.625ZM27.3125 21.375C26.1382 21.375 24.9902 21.7232 24.0138 22.3757C23.0374 23.0281 22.2764 23.9554 21.827 25.0403C21.3776 26.1253 21.26 27.3191 21.4891 28.4709C21.7182 29.6226 22.2837 30.6806 23.1141 31.511C23.9444 32.3413 25.0024 32.9068 26.1542 33.1359C27.3059 33.365 28.4998 33.2474 29.5847 32.798C30.6696 32.3486 31.5969 31.5876 32.2494 30.6112C32.9018 29.6348 33.25 28.4868 33.25 27.3125C33.2484 25.7383 32.6224 24.229 31.5092 23.1158C30.3961 22.0026 28.8867 21.3766 27.3125 21.375Z"
//       fill={color}
//     />
//     <Path
//       d="M30.875 29.1959L28.5 26.8209V23.75H26.125V27.8041L29.1959 30.875L30.875 29.1959ZM9.5 19H16.625V21.375H9.5V19ZM9.5 11.875H23.75V14.25H9.5V11.875Z"
//       fill={color}
//     />
//     <Path
//       d="M30.875 4.75C30.8744 4.1203 30.624 3.51658 30.1787 3.07132C29.7334 2.62605 29.1297 2.37563 28.5 2.375H4.75001C4.12031 2.37563 3.51659 2.62605 3.07132 3.07132C2.62606 3.51658 2.37564 4.1203 2.37501 4.75V20.1875C2.37236 22.5558 3.01474 24.8801 4.23318 26.9109C5.45163 28.9417 7.20013 30.6023 9.29101 31.7146L15.4375 34.9921V32.3L10.4096 29.6186C8.69886 28.7086 7.26817 27.35 6.27109 25.6884C5.274 24.0269 4.74817 22.1252 4.75001 20.1875V4.75H28.5V15.4375H30.875V4.75Z"
//       fill={color}
//     />
//     {/* Add more SVG paths as needed */}
//   </Svg>
// );

const RewardsIcon = ({ color, size = 28 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <G clipPath="url(#clip0_691_203)">
      <Path
        d="M14.6272 20.9142C12.8598 20.3999 11.3071 19.326 10.2022 17.8538C9.09736 16.3816 8.50007 14.5906 8.50008 12.75V1.41663H25.5001V14.1666M8.50008 4.24996H1.41675V9.91663C1.41675 13.471 3.954 15.5833 7.08341 15.5833H8.50008M28.3816 15.4204C30.8012 14.8608 32.5834 12.8959 32.5834 9.91663V4.24996H25.5001M14.1667 26.9166H7.08341V32.5833H23.3751M28.3334 19.8333L21.9584 26.2083L18.4167 22.6666M14.4586 21.8506C13.519 22.3221 12.7292 23.0456 12.1773 23.9402C11.6254 24.8349 11.3332 25.8654 11.3334 26.9166M23.3751 14.1666C20.9329 14.1666 18.5907 15.1368 16.8638 16.8637C15.1369 18.5906 14.1667 20.9328 14.1667 23.375C14.1667 25.8172 15.1369 28.1593 16.8638 29.8862C18.5907 31.6131 20.9329 32.5833 23.3751 32.5833C25.8173 32.5833 28.1595 31.6131 29.8864 29.8862C31.6133 28.1593 32.5834 25.8172 32.5834 23.375C32.5834 20.9328 31.6133 18.5906 29.8864 16.8637C28.1595 15.1368 25.8173 14.1666 23.3751 14.1666Z"
        fill={color}
        stroke="2"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_691_203">
        <Rect width="34" height="34" fill="white" />
      </ClipPath>
    </Defs>
    {/* Add more SVG paths as needed */}
  </Svg>
);

// const RankIcon = ({ color }: any) => (
//   <Svg width={25} height={25} viewBox="0 0 40 40" fill="none">
//     <Path
//       d="M17.4167 15.8333H20.5834C22.8222 15.8333 23.9417 15.8333 24.6367 16.53C25.3334 17.225 25.3334 18.3445 25.3334 20.5833V30.0833C25.3334 27.8445 25.3334 26.725 26.0301 26.03C26.7236 25.3333 27.843 25.3333 30.0834 25.3333C32.3238 25.3333 33.4417 25.3333 34.1367 26.03C34.8334 26.725 34.8334 27.8445 34.8334 30.0833V34.8333H3.16675C3.16675 32.5945 3.16675 31.475 3.86341 30.78C4.55691 30.0833 5.67633 30.0833 7.91675 30.0833C10.1572 30.0833 11.275 30.0833 11.9701 30.78C12.6667 31.4735 12.6667 32.5929 12.6667 34.8333V20.5833C12.6667 18.3445 12.6667 17.225 13.3634 16.53C14.0569 15.8333 15.1763 15.8333 17.4167 15.8333ZM17.6479 4.78638C18.2496 3.70496 18.5504 3.16663 19.0001 3.16663C19.4497 3.16663 19.7506 3.70496 20.3522 4.78638L20.5074 5.06504C20.6784 5.37221 20.7639 5.52421 20.8969 5.62554C21.0315 5.72688 21.1977 5.76488 21.5302 5.83929L21.8311 5.90896C22.9996 6.17338 23.5838 6.30479 23.7232 6.75129C23.8625 7.19779 23.4635 7.66488 22.6671 8.59588L22.4612 8.83654C22.2348 9.10096 22.1208 9.23238 22.0702 9.39704C22.0195 9.56171 22.0369 9.73746 22.0702 10.0905L22.1018 10.412C22.2222 11.6549 22.2823 12.2771 21.9197 12.5526C21.5556 12.8297 21.0077 12.5764 19.9137 12.0729L19.6318 11.943C19.3199 11.8005 19.1647 11.7277 19.0001 11.7277C18.8354 11.7277 18.6802 11.8005 18.3683 11.943L18.0865 12.0729C16.9924 12.5764 16.4446 12.8297 16.0804 12.5526C15.7162 12.2771 15.778 11.6549 15.8983 10.412L15.93 10.0905C15.9632 9.73746 15.9807 9.56171 15.93 9.39704C15.8793 9.23238 15.7653 9.10096 15.5389 8.83654L15.3331 8.59588C14.5367 7.66488 14.1377 7.19938 14.277 6.75129C14.4163 6.30479 15.0006 6.17338 16.1691 5.90896L16.4699 5.83929C16.8024 5.76488 16.9687 5.72846 17.1032 5.62554C17.2362 5.52421 17.3217 5.37221 17.4927 5.06504L17.6479 4.78638Z"
//       fill={color}
//       stroke="2"
//     />
//     {/* Add more SVG paths as needed */}
//   </Svg>
// );

const NotificationIcon = ({ color, size = 28 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Path
      d="M33.25 10.2916C33.25 13.3475 30.7642 15.8333 27.7083 15.8333C24.6525 15.8333 22.1667 13.3475 22.1667 10.2916C22.1667 7.2358 24.6525 4.74997 27.7083 4.74997C30.7642 4.74997 33.25 7.2358 33.25 10.2916ZM30.0833 18.6675C29.2917 18.8733 28.5 19 27.7083 19C25.4 18.9958 23.1875 18.077 21.5552 16.4447C19.923 14.8125 19.0042 12.5999 19 10.2916C19 7.96413 19.9183 5.8583 21.375 4.2908C21.0877 3.93857 20.7254 3.65489 20.3145 3.46041C19.9036 3.26594 19.4546 3.16557 19 3.16663C17.2583 3.16663 15.8333 4.59163 15.8333 6.3333V6.79247C11.1308 8.1858 7.91667 12.5083 7.91667 17.4166V26.9166L4.75 30.0833V31.6666H33.25V30.0833L30.0833 26.9166V18.6675ZM19 36.4166C20.7575 36.4166 22.1667 35.0075 22.1667 33.25H15.8333C15.8333 34.0898 16.167 34.8953 16.7608 35.4891C17.3547 36.083 18.1601 36.4166 19 36.4166Z"
      fill={color}
      stroke="2"
    />
    {/* Add more SVG paths as needed */}
  </Svg>
);

const AnalyticsIcon = ({ color, size = 28 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* Axes */}
    <Path d="M8 32H32" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8 32V8" stroke={color} strokeWidth="2" strokeLinecap="round" />

    {/* Line graph */}
    <Path
      d="M10 26 L15 20 L20 22 L25 16"
      stroke={color}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Data points (final point higher) */}
    <SvgCircle cx="10" cy="26" r="1.8" fill={color} />
    <SvgCircle cx="15" cy="20" r="1.8" fill={color} />
    <SvgCircle cx="20" cy="22" r="1.8" fill={color} />
    <SvgCircle cx="25" cy="16" r="1.8" fill={color} />
  </Svg>
);

const ProfileIcon = ({ color, size = 28 }: any) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.0001 33.25C26.87 33.25 33.2501 26.8699 33.2501 19C33.2501 11.13 26.87 4.74996 19.0001 4.74996C11.1301 4.74996 4.75008 11.13 4.75008 19C4.75008 26.8699 11.1301 33.25 19.0001 33.25ZM19.0001 34.8333C27.7448 34.8333 34.8334 27.7447 34.8334 19C34.8334 10.2552 27.7448 3.16663 19.0001 3.16663C10.2553 3.16663 3.16675 10.2552 3.16675 19C3.16675 27.7447 10.2553 34.8333 19.0001 34.8333Z"
      fill={color}
      stroke="2"
    />
    <Path
      d="M9.5 28.207C9.5 27.3892 10.1112 26.6981 10.925 26.6079C17.0327 25.9318 20.995 25.9927 27.0892 26.6229C27.3936 26.6549 27.682 26.7747 27.9193 26.9679C28.1566 27.1611 28.3325 27.4192 28.4256 27.7107C28.5186 28.0023 28.5247 28.3146 28.4432 28.6095C28.3616 28.9044 28.196 29.1692 27.9664 29.3716C20.7741 35.6408 16.6638 35.5545 10.0067 29.3779C9.68208 29.0771 9.5 28.6496 9.5 28.2078V28.207Z"
      fill={color}
      stroke="2"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M27.0079 27.4099C20.9619 26.7845 17.0566 26.7259 11.0115 27.3948C10.8125 27.418 10.629 27.5138 10.4962 27.6638C10.3635 27.8138 10.2907 28.0076 10.2918 28.2079C10.2918 28.4343 10.386 28.6488 10.5452 28.7977C13.8448 31.8583 16.3449 33.2413 18.7888 33.25C21.2414 33.2587 23.876 31.8868 27.4465 28.7755C27.5599 28.6745 27.6415 28.5428 27.6815 28.3963C27.7215 28.2498 27.718 28.0949 27.6715 27.9503C27.6251 27.8057 27.5376 27.6778 27.4198 27.582C27.302 27.4862 27.1589 27.4267 27.0079 27.4107V27.4099ZM10.8381 25.821C17.0099 25.1378 21.03 25.1995 27.1717 25.8353C27.6296 25.883 28.0635 26.0633 28.4205 26.3539C28.7775 26.6445 29.0419 27.0329 29.1816 27.4715C29.3212 27.9102 29.3299 28.38 29.2066 28.8235C29.0834 29.267 28.8335 29.6649 28.4875 29.9686C24.8656 33.1257 21.8494 34.8452 18.784 34.8333C15.71 34.8223 12.8268 33.0735 9.46929 29.9583C9.2289 29.7344 9.03727 29.4633 8.90637 29.162C8.77547 28.8607 8.70811 28.5356 8.7085 28.2071C8.70735 27.6168 8.924 27.0469 9.31695 26.6065C9.7099 26.1661 10.2515 25.8861 10.8381 25.8202V25.821Z"
      fill={color}
      stroke="2"
    />
    <Path
      d="M25.3334 15.8333C25.3334 17.513 24.6662 19.1239 23.4784 20.3117C22.2907 21.4994 20.6798 22.1667 19.0001 22.1667C17.3204 22.1667 15.7095 21.4994 14.5217 20.3117C13.334 19.1239 12.6667 17.513 12.6667 15.8333C12.6667 14.1536 13.334 12.5427 14.5217 11.355C15.7095 10.1673 17.3204 9.5 19.0001 9.5C20.6798 9.5 22.2907 10.1673 23.4784 11.355C24.6662 12.5427 25.3334 14.1536 25.3334 15.8333Z"
      fill={color}
      stroke="2"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.0001 20.5833C20.2599 20.5833 21.468 20.0829 22.3588 19.1921C23.2496 18.3013 23.7501 17.0931 23.7501 15.8333C23.7501 14.5736 23.2496 13.3654 22.3588 12.4746C21.468 11.5838 20.2599 11.0833 19.0001 11.0833C17.7403 11.0833 16.5321 11.5838 15.6413 12.4746C14.7505 13.3654 14.2501 14.5736 14.2501 15.8333C14.2501 17.0931 14.7505 18.3013 15.6413 19.1921C16.5321 20.0829 17.7403 20.5833 19.0001 20.5833ZM19.0001 22.1667C20.6798 22.1667 22.2907 21.4994 23.4784 20.3117C24.6662 19.1239 25.3334 17.513 25.3334 15.8333C25.3334 14.1536 24.6662 12.5427 23.4784 11.355C22.2907 10.1673 20.6798 9.5 19.0001 9.5C17.3204 9.5 15.7095 10.1673 14.5217 11.355C13.334 12.5427 12.6667 14.1536 12.6667 15.8333C12.6667 17.513 13.334 19.1239 14.5217 20.3117C15.7095 21.4994 17.3204 22.1667 19.0001 22.1667Z"
      fill={color}
      stroke="2"
    />
    {/* Add more SVG paths as needed */}
  </Svg>
);

const NotificationDot = () => (
  <Svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <Circle cx="5" cy="5" r="5" fill="#03A9F4" />
  </Svg>
);

// Animated wrapper to magnify the focused tab icon
const MagnifyIcon: React.FC<{
  focused: boolean;
  children: React.ReactNode;
  scaleFocused?: number;
  scaleUnfocused?: number;
  duration?: number;
}> = ({ focused, children, scaleFocused = 1.12, scaleUnfocused = 1.0, duration = 150 }) => {
  const scale = React.useRef(new Animated.Value(focused ? scaleFocused : scaleUnfocused)).current;

  React.useEffect(() => {
    Animated.timing(scale, {
      toValue: focused ? scaleFocused : scaleUnfocused,
      duration,
      useNativeDriver: true,
    }).start();
  }, [focused, scale, scaleFocused, scaleUnfocused, duration]);

  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
};

const BottomBar: React.FC = () => {
  const { userData } = useContext(ThemeContext);
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const isPlanValid = !!userData?.planValid;
  const tabs = [
    { iconName: "Home", icon: faHouse, screenName: Home },
    // { iconName: "Bookmark", icon: faBookmark, screenName: Bookmark },
    { iconName: "Rewards", icon: faAward, screenName: Rewards },
    { iconName: "Notification", icon: faBell, screenName: Notification },
    { iconName: "Profile", icon: faUser, screenName: Profile },
    // { iconName: "Ranking", icon: faRankingStar, screenName: Ranking },
  ];

  const iconSize = 40;

  const [tick, setTick] = React.useState(0);

  // Small delayed re-render to allow native insets to arrive on cold start.
  React.useEffect(() => {
    const t = setTimeout(() => setTick((s) => s + 1), 250);
    return () => clearTimeout(t);
  }, []);

  const tabBarLayout = useMemo(() => {
    const iconRowHeight = 64;
    // Older Android (API < 29 = Android 9 and below) doesn't reliably report
    // insets.bottom even when a 3-button nav bar is present. The standard nav
    // bar on those devices is 48dp, so we enforce a larger minimum there.
    // Increase minimum bottom padding for older Android versions where
    // the system reports no safe-area inset for 3-button navigation.
    // - API < 23 (very old devices): reserve 56dp
    // - API 23-28 (Android 6..9): reserve 48dp
    // - API >=29 (Android 10+): reserve 28dp (gesture/nav variations handled by insets)
    const androidMinPadding =
      Platform.OS === "android"
        ? Number(Platform.Version) < 23
          ? 56
          : Number(Platform.Version) < 29
          ? 48
          : 28
        : 0;
    // Prefer the safe-area inset if it's non-zero; fall back to the
    // provider's initial metrics (useful on cold start), otherwise use
    // the androidMinPadding.
    const reportedInset = insets.bottom && insets.bottom > 0
      ? insets.bottom
      : (initialWindowMetrics?.insets?.bottom ?? 0);

    const androidNavigationPadding =
      Platform.OS === "android"
        ? Math.max(reportedInset, androidMinPadding)
        : (reportedInset || 0);
    const height = iconRowHeight + androidNavigationPadding;
    return { height, paddingBottom: androidNavigationPadding };
  }, [insets.bottom]);

  const renderTabIcon = (focused: boolean, icon: React.ReactNode) => (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MagnifyIcon focused={focused}>{icon}</MagnifyIcon>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.secondary01 }}>
      <Tab.Navigator
        initialRouteName="Home"
        tabBar={(props: BottomTabBarProps) => {
          const { state, descriptors, navigation } = props;

          return (
            <View
              style={{
                flexDirection: "row",
                height: tabBarLayout.height,
                paddingBottom: tabBarLayout.paddingBottom,
                paddingTop: tabBarLayout.paddingBottom,
                backgroundColor: COLORS.secondary01,
                borderTopColor: "#0AB8AD",
                borderTopWidth: wp(0.6),
              }}
            >
              {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };

                const onLongPress = () => {
                  navigation.emit({
                    type: "tabLongPress",
                    target: route.key,
                  });
                };

                const color = isFocused ? "#F2C112" : "#CCCCCC";
                const icon = options.tabBarIcon
                  ? options.tabBarIcon({
                      focused: isFocused,
                      color,
                      size: iconSize,
                    } as any)
                  : null;

                return (
                  <Pressable
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {icon}
                  </Pressable>
                );
              })}
            </View>
          );
        }}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#F2C112",
          tabBarInactiveTintColor: "#CCCCCC",
        }}
      >
          <Tab.Screen
            name={"Home"}
            component={Home}
            options={{
              tabBarIcon: ({ color, focused }) =>
                renderTabIcon(focused, <HomeIcon color={color} size={iconSize} />),
            }}
          />
          {/* <Tab.Screen
          name={"Bookmark"}
          component={Bookmark}
          options={{
            tabBarIcon: ({ color }: { color: string }) => <BookmarkIcon color={color} />,
          }}
        /> */}
          <Tab.Screen
            name={"Rewards"}
            component={Rewards}
            options={{
              tabBarIcon: ({ color, focused }) =>
                renderTabIcon(focused, <RewardsIcon color={color} size={iconSize} />),
            }}
          />

          <Tab.Screen
            name={"Analytics"}
            component={GyrusNEETAnalytics}
            listeners={({ navigation }: any) => ({
              tabPress: (e: any) => {
                if (!isPlanValid) {
                  e.preventDefault();
                  setShowSubscriptionModal(true);
                }
              },
            })}
            options={{
              tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                  <MagnifyIcon focused={focused}>
                    <AnalyticsIcon color={color} size={40} />
                  </MagnifyIcon>
                </View>
              ),
            }}
          />

          <Tab.Screen
            name={"Notification"}
            component={Notification}
            options={{
              tabBarIcon: ({ color, focused }) =>
                renderTabIcon(focused, <NotificationIcon color={color} size={iconSize} />),
            }}
          />
          <Tab.Screen
            name={"Profile"}
            component={Profile}
            options={{
              tabBarIcon: ({ color, focused }) =>
                renderTabIcon(focused, <ProfileIcon color={color} size={iconSize} />),
            }}
          />
      </Tab.Navigator>
      <Modal visible={showSubscriptionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitleCenteredWhite}>Subscription required</Text>
              <Text style={styles.modalBodyCenteredWhite}>This feature is available for subscribed users. Please consider upgrading to enjoy full access.</Text>
              <View style={styles.modalActionsColumn}>
                <LinearGradient
                  colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
                  start={{ x: 0.6, y: 0.3 }}
                  end={{ x: 0.6, y: 0 }}
                  style={styles.upgradeGradient}
                >
                  <TouchableOpacity
                    style={styles.upgradeInner}
                    onPress={() => {
                      setShowSubscriptionModal(false);
                      navigation.navigate('Plans');
                    }}
                  >
                    <Text style={[styles.upgradeTxt, { color: '#fff' }]}>UPGRADE</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
              <TouchableOpacity style={styles.maybeLaterBtn} onPress={() => setShowSubscriptionModal(false)}>
                <Text style={styles.maybeLaterTxt}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default React.memo(BottomBar);

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modalBox: {
    width: '88%',
    // wrapper to provide space for the outside close button
    alignItems: 'center',
    borderRadius: 30,
    paddingTop: 28,
    paddingBottom: 18,
    paddingHorizontal: 18,
    // elevation/shadow to match app card style
    elevation: 8,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0)'
  },
  modalContent: { width: '100%', backgroundColor: '#dce9f0', borderRadius: 12, paddingTop: 32, paddingBottom: 18, paddingHorizontal: 16, position: 'relative' },
  modalTitleCenteredWhite: { fontSize: 20, fontWeight: '800', color: COLORS.dark, textAlign: 'center', marginTop: 4, marginBottom: 8 },
  modalBodyCenteredWhite: { fontSize: 15, color: COLORS.grey, textAlign: 'center', marginBottom: 16 },
  modalActionsColumn: { alignItems: 'center' },
  upgradeGradient: { width: '100%', borderRadius: 8, overflow: 'hidden', marginBottom: 10 },
  upgradeInner: { paddingVertical: 12, alignItems: 'center' },
  upgradeTxt: { color: COLORS.one, fontWeight: '700', fontSize: 15 },
  maybeLaterBtn: { width: '100%', borderRadius: 8, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(14, 13, 13, 0.04)' },
  maybeLaterTxt: { color: '#101010', fontWeight: '600', fontSize: 15 },
  closeBtn: { position: 'absolute', right: 8, top: 8,bottom: 8 , width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { color: '#121212', fontSize: 20, fontWeight: '700' },
  modalButtonSecondary: { backgroundColor: 'transparent' },
  modalButtonText: { fontSize: 16, fontWeight: '800', color: COLORS.light, fontFamily: FONTS.h4.fontFamily },
});