import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Image,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient as Lin } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const IMG_H = Math.min(SCREEN_W * (16 / 9), SCREEN_H);

interface PremiumBannerProps {
  isVisible: boolean;
  onClose: () => void;
}

const PremiumBanner: React.FC<PremiumBannerProps> = ({ isVisible, onClose }) => {
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const [buttonsEnabled, setButtonsEnabled] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setButtonsEnabled(false);
      const timer = setTimeout(() => {
        setButtonsEnabled(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleContinue = () => {
    onClose();
    try {
      navigation.navigate("BottomBar", { screen: "Home" });
    } catch (error) {
      try {
        navigation.navigate("Home");
      } catch (err) {
        console.log("[PremiumBanner] Navigation to home failed:", err);
      }
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.bannerOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.bannerImageWrapper}>
          <Image
            source={require("../assets/premiumBanner.png")}
            style={styles.bannerImage}
            resizeMode="contain"
          />

          {/* X close button — overlaid inside image, top-right */}
          {buttonsEnabled && (
            <TouchableOpacity
              style={styles.bannerCloseBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.bannerCloseBtnText}>✕</Text>
            </TouchableOpacity>
          )}

          {/* Continue button — overlaid inside image, bottom */}
          {buttonsEnabled && (
            <TouchableOpacity
              style={styles.bannerContinueBtn}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Lin colors={['#38E5D8', '#00B8AC']} style={[StyleSheet.absoluteFill, { borderRadius: 30 }]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
              <Text style={styles.bannerContinueBtnText}>CONTINUE</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bannerOverlay: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerImageWrapper: {
    width: SCREEN_W,
    height: IMG_H,
  },
  bannerImage: {
    width: SCREEN_W,
    height: IMG_H,
  },
  bannerCloseBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerCloseBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 19,
  },
  bannerContinueBtn: {
    position: "absolute",
    bottom: 20,
    width: "60%",
    alignSelf: "center",
    zIndex: 10,
    paddingVertical: 10,
    marginTop: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  bannerContinueBtnText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
    fontFamily: 'AppFont-Bold'
  },
});

export default PremiumBanner;
