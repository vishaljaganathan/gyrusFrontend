import * as Notifications from 'expo-notifications';
import { Svg, Circle } from 'react-native-svg';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true})});
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert , Platform} from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from '../components/CustomText';
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../styles/themes";
import { moderateScale } from "../styles/Responsive";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { ThemeContext } from "../service/authContext";
import { Wrapper } from "../components/Wrapper";
import { getSecureStorage } from "../config/SecureStore";
import { getRequest, postRequest } from "../config/Requests";
import HeaderBar from "../navigation/Headerbar";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";





const NotificationDot = ({ color }: { color: string }) => (
  <Svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <Circle cx="5" cy="5" r="5" fill={color} />
  </Svg>
);

const Notification = ({ navigation }: { navigation: any }) => {
  // Notification screen temporarily disabled for Play Store build
  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <LinearGradient style={styles.androidLarge57}
            colors={["#028464", "#0AB7AD", "#0B7960"]}>
        <HeaderBar />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.emptyText}>No notification</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#014b51ff" }, androidLarge57: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
    height: 800,
    width: "100%" }, scrollContent: {
    alignItems: "center",
    paddingTop: hp(3),
    paddingBottom: hp(4),
    gap: hp(2.2) }, emptyText: {
     color: COLORS.light80,
    fontFamily: 'AppFont-Bold', fontSize: wp(5)},
  card: {
    width: wp(92),
    backgroundColor: COLORS.light08,
    borderRadius: moderateScale(20),
    borderWidth: 0,
    paddingVertical: moderateScale(18),
    paddingHorizontal: moderateScale(18),
    gap: hp(1.5),
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 }
      },
      android: {
        elevation: 8
      }
    })
  },
  cardUnread: {
    backgroundColor: COLORS.light20,
    borderWidth: 2,
    borderColor: COLORS.success02 }, cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(6) }, statusIndicator: {
    width: moderateScale(12),
    height: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center' }, cardContent: {
    flex: 1,
    gap: moderateScale(8) }, cardFooter: {
    marginTop: moderateScale(8),
    alignItems: 'center' }, accentLine: {
    width: wp(20),
    height: 3,
    backgroundColor: COLORS.primary03,
    borderRadius: 2,
    opacity: 0.7 }, timestampText: {
     fontFamily: 'AppFont-Regular', fontSize: wp(3.1),
    color: COLORS.light80,
        letterSpacing: 0.5 },
  titleText: {
     fontFamily: 'AppFont-Regular', fontSize: wp(4.5),
    color: COLORS.light,
        letterSpacing: 0.3,
    lineHeight: moderateScale(22) },
  bodyText: {
     fontFamily: 'AppFont-Regular', fontSize: wp(3.8),
    color: COLORS.light80,
    lineHeight: moderateScale(19),
        letterSpacing: 0.2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5) }, modalContainer: {
    width: wp(90),
    maxHeight: hp(80),
    backgroundColor: COLORS.light,
    borderRadius: moderateScale(24),
    paddingVertical: moderateScale(24),
    paddingHorizontal: moderateScale(20),
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.dark,
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 }
      },
      android: {
        elevation: 10
      }
    })
  },
  modalCloseButton: {
    position: 'absolute',
    top: moderateScale(16),
    right: moderateScale(16),
    zIndex: 10,
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: COLORS.grey02,
    justifyContent: 'center',
    alignItems: 'center' }, modalCloseButtonText: {
     color: COLORS.dark,
    fontFamily: 'AppFont-Regular', fontSize: wp(5.5),
        lineHeight: wp(6) },
  modalContent: {
    flex: 1,
    paddingTop: moderateScale(16) }, modalHeader: {
    marginBottom: moderateScale(20) }, modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginBottom: moderateScale(12) }, modalTimestamp: {
     fontFamily: 'AppFont-Regular', fontSize: wp(3.2),
    color: COLORS.grey01},
  modalTitle: {
     fontFamily: 'AppFont-Regular', fontSize: wp(5.2),
    color: COLORS.dark,
        lineHeight: moderateScale(26),
    letterSpacing: 0.3 },
  modalBody: {
     fontFamily: 'AppFont-Regular', fontSize: wp(4.1),
    color: COLORS.dark80,
    lineHeight: moderateScale(22),
        letterSpacing: 0.2 } });

export default Notification;
