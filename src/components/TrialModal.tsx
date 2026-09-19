import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { axiosInstance } from '../config/indeceptor';
import { ThemeContext } from '../service/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface TrialModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TrialModal: React.FC<TrialModalProps> = ({ isVisible, onClose, onSuccess }) => {
  const insets = useSafeAreaInsets();
  const [activating, setActivating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { setUserData } = useContext(ThemeContext);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // 1. Pulsing scale loop for the gold ring
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1800,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 1800,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // 2. Parallax vertical floating loop for the DAYS label
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -5,
            duration: 2200,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2200,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
      floatAnim.setValue(0);
    }
  }, [isVisible]);

  const handleClose = async () => {
    try {
      await AsyncStorage.setItem('trialModalLastDismissed', Date.now().toString());
    } catch (e) {
      console.log('Error saving trial modal dismiss time:', e);
    }
    onClose();
  };

  const handleActivateTrial = () => {
    setShowConfirm(true);
  };

  const onConfirmTrial = async () => {
    try {
      setShowConfirm(false);
      setActivating(true);
      const res = await axiosInstance.post('authentication/activate-trial');
      if (res.data) {
        setUserData(res.data);
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error('Trial activation error:', err);
      Alert.alert('Error', 'Could not activate trial. Please try again later.');
    } finally {
      setActivating(false);
    }
  };

  return (
    <>
      <Modal visible={isVisible} transparent={false} animationType="slide" statusBarTranslucent>
        <LinearGradient
          colors={['#002D30', '#00474C', '#001A1C']}
          style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(16, insets.bottom) }]}
        >
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleClose} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Golden 14 Badge Graphic with premium double-ring medallion style and 3D embossing */}
          <View style={styles.badgeContainer}>
            <Animated.View style={[styles.goldRing, { transform: [{ scale: scaleAnim }] }]}>
              {/* Inner Medallion Dashed Ring */}
              <View style={styles.innerRing} />

              {/* Gold Fourteen */}
              <Text style={styles.goldSevenText}>14 </Text>

              <Animated.View style={[styles.daysBadge, { transform: [{ translateY: floatAnim }] }]}>
                <Text style={styles.daysText}>DAYS</Text>
              </Animated.View>
            </Animated.View>
          </View>

          {/* Gold Trial Header */}
          <View style={styles.header}>
            <Text style={styles.goldTrialText}>✨ GOLD TRIAL ✨</Text>
            <Text style={styles.tryNowTitle}>TRY NOW FOR FREE</Text>
            <Text style={styles.tryNowDesc}>
              To Access <Text style={{ color: '#F4DC00', fontFamily: 'AppFont-Bold' }}>Gold Membership</Text> Features like Subject-Wise Practices and Detailed Analytics.
            </Text>
          </View>

          {/* Feature Lists */}
          <View style={styles.featuresList}>
            {/* Card 1: Subject-Wise Practices */}
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="library-outline" size={wp(8)} color="#0AB8AD" />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>SUBJECT-WISE PRACTICES</Text>
                <Text style={styles.featureDesc}>
                  Practice targeted questions across all subjects to strengthen your concepts.
                </Text>
              </View>
            </View>

            {/* Card 2: Detailed Analytics */}
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="analytics-outline" size={wp(8)} color="#0AB8AD" />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>DETAILED ANALYTICS</Text>
                <Text style={styles.featureDesc}>
                  Track your performance with in-depth insights and improve smarter every day.
                </Text>
              </View>
            </View>
          </View>

          {/* Value Props Row */}
          <View style={styles.valuePropsRow}>
            <View style={styles.valueItem}>
              <Ionicons name="ribbon-outline" size={24} color="#F4DC00" />
              <Text style={styles.valueText}>Premium{"\n"}Content</Text>
            </View>
            <View style={styles.valueItem}>
              <Ionicons name="locate-outline" size={24} color="#F4DC00" />
              <Text style={styles.valueText}>Personalized{"\n"}Practice</Text>
            </View>
            <View style={styles.valueItem}>
              <Ionicons name="trophy-outline" size={24} color="#F4DC00" />
              <Text style={styles.valueText}>Performance{"\n"}Insights</Text>
            </View>
            <View style={styles.valueItem}>
              <Ionicons name="flash-outline" size={24} color="#F4DC00" />
              <Text style={styles.valueText}>Faster{"\n"}Progress</Text>
            </View>
          </View>

          {/* Golden Capsule Try Button */}
          <View style={styles.actionButtonContainer}>
            <LinearGradient
              colors={['#E3A638', '#FFF0A6', '#C18424']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.goldButtonGradient}
            >
              <TouchableOpacity
                style={styles.goldButton}
                onPress={handleActivateTrial}
                disabled={activating}
                activeOpacity={0.8}
              >
                {activating ? (
                  <ActivityIndicator color="#002D30" />
                ) : (
                  <>
                    <View style={styles.buttonArrowCircle}>
                      <Ionicons name="arrow-forward" size={20} color="#FFF0A6" />
                    </View>
                    <Text style={styles.goldButtonText}>TRY NOW FOR FREE</Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Footer cancel info */}
          <View style={styles.footerRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#0AB8AD" />
            <Text style={styles.footerText}>No payment needed.</Text>
          </View>
        </LinearGradient>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal visible={showConfirm} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Start Free Trial</Text>
            <Text style={styles.confirmBody}>
              To start your 14-day Gold trial, press Confirm to continue.
            </Text>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.cancelBtn]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>

              <LinearGradient
                colors={['#E3A638', '#FFF0A6', '#C18424']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.confirmBtnGradient}
              >
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={onConfirmTrial}
                >
                  <Text style={styles.confirmBtnText}>CONFIRM</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1),
  },
  badgeContainer: {
    alignItems: 'center',
    marginTop: hp(1),
  },
  goldRing: {
    width: wp(45),
    height: wp(45),
    borderRadius: wp(22.5),
    borderWidth: 2,
    borderColor: '#F4DC00',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(244, 220, 0, 0.03)',
  },
  innerRing: {
    position: 'absolute',
    width: wp(39),
    height: wp(39),
    borderRadius: wp(19.5),
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: 'rgba(244, 220, 0, 0.45)',
  },
  goldSevenText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontWeight: 'bold',
    fontSize: wp(20),
    color: '#F4DC00',
    lineHeight: wp(22),
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 4,
  },
  daysBadge: {
    position: 'absolute',
    bottom: wp(4),
    right: -wp(1),
    backgroundColor: '#b2f5ea',
    borderRadius: 6,
    paddingVertical: hp(0.3),
    paddingHorizontal: wp(2.5),
  },
  daysText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(2.8),
    color: '#00474C',
  },
  header: {
    alignItems: 'center',
    marginTop: hp(1.5),
  },
  goldTrialText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(6.8),
    color: '#F4DC00',
    letterSpacing: 2,
    marginBottom: hp(0.8),
  },
  tryNowTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.5),
    color: '#E0FDFB',
    marginBottom: hp(0.6),
  },
  tryNowDesc: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.1),
    color: 'rgba(197, 255, 250, 0.65)',
    textAlign: 'center',
    lineHeight: wp(4.6),
    paddingHorizontal: wp(4),
  },
  featuresList: {
    width: '100%',
    marginTop: hp(1.5),
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 184, 173, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(10, 184, 173, 0.15)',
    borderRadius: 16,
    padding: wp(3.5),
    marginBottom: hp(1.5),
  },
  featureIconContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: 12,
    backgroundColor: 'rgba(10, 184, 173, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3.5),
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.1),
    color: '#0AB8AD',
    marginBottom: hp(0.4),
  },
  featureDesc: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.8),
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: wp(3.8),
  },
  chevron: {
    marginLeft: wp(1),
  },
  valuePropsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: hp(1),
  },
  valueItem: {
    alignItems: 'center',
    flex: 1,
  },
  valueText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(2.2),
    color: '#E0FDFB',
    textAlign: 'center',
    marginTop: hp(0.6),
    lineHeight: wp(3),
  },
  actionButtonContainer: {
    width: '100%',
    marginTop: hp(1.5),
  },
  goldButtonGradient: {
    width: '100%',
    borderRadius: 30,
  },
  goldButton: {
    width: '100%',
    height: hp(6.2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(3),
    position: 'relative',
  },
  buttonArrowCircle: {
    position: 'absolute',
    left: wp(3),
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#002D30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldButtonText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.8),
    color: '#002D30',
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1),
  },
  footerText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.8),
    color: 'rgba(255, 255, 255, 0.55)',
    marginLeft: wp(1.5),
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCard: {
    width: wp(80),
    backgroundColor: '#00373B',
    borderRadius: wp(5),
    padding: wp(6),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(10, 184, 173, 0.25)',
  },
  confirmTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.5),
    color: '#FFFFFF',
    marginBottom: hp(1.2),
    textAlign: 'center',
  },
  confirmBody: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.4),
    color: 'rgba(197, 255, 250, 0.8)',
    textAlign: 'center',
    lineHeight: wp(4.8),
    marginBottom: hp(2.5),
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: wp(3),
  },
  confirmBtn: {
    paddingVertical: hp(1.2),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: 'rgba(10, 184, 173, 0.3)',
    backgroundColor: 'rgba(10, 184, 173, 0.03)',
    borderRadius: wp(2.5),
  },
  cancelBtnText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.4),
    color: '#0AB8AD',
  },
  confirmBtnGradient: {
    flex: 1,
    borderRadius: wp(2.5),
    overflow: 'hidden',
  },
  confirmBtnText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.4),
    color: '#002D30',
  },
});

export default TrialModal;
