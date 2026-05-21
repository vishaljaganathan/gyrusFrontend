import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { axiosInstance } from '../config/indeceptor';
import { ThemeContext } from '../service/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TrialModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TrialModal: React.FC<TrialModalProps> = ({ isVisible, onClose, onSuccess }) => {
  const [activating, setActivating] = useState(false);
  const { setUserData } = useContext(ThemeContext);

  const handleClose = async () => {
    try {
      await AsyncStorage.setItem('trialModalLastDismissed', Date.now().toString());
    } catch (e) {
      console.log("Error saving trial modal dismiss time:", e);
    }
    onClose();
  };

  const handleActivateTrial = async () => {
    Alert.alert(
      "Start Free Trial",
      "To start your 7-day Gold trial, press Confirm to continue.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            try {
              setActivating(true);
              const res = await axiosInstance.post('authentication/activate-trial');
              if (res.data) {
                setUserData(res.data);
                onClose();
                if (onSuccess) onSuccess();
              }
            } catch (err) {
              console.error("Trial activation error:", err);
              Alert.alert("Error", "Could not activate trial. Please try again later.");
            } finally {
              setActivating(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.trialOverlay}>
        <View style={styles.trialCard}>
          <TouchableOpacity 
            style={styles.trialCloseBtn} 
            onPress={handleClose}
          >
            <Ionicons name="close" size={wp(6)} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <View style={styles.trialIconBox}>
            <Ionicons name="gift" size={wp(12)} color="#FFD700" />
          </View>

          <Text style={styles.trialTitle}>7-Day Gold Trial</Text>
          <Text style={styles.trialBody}>
            Get full access to all premium features, mock tests, and detailed analytics for 7 days. No payment required!
          </Text>

          <LinearGradient
            colors={["#00b7c2", "#0AB8AD"]}
            style={styles.trialBtnGradient}
          >
            <TouchableOpacity 
              style={styles.trialBtn}
              onPress={handleActivateTrial}
              disabled={activating}
            >
              {activating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.trialBtnText}>TRY NOW FOR FREE</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
          
          <TouchableOpacity 
            style={styles.trialSecondaryBtn}
            onPress={handleClose}
          >
            <Text style={styles.trialSecondaryBtnText}>MAYBE LATER</Text>
          </TouchableOpacity>
          
          <Text style={styles.trialFooter}>Experience the Gold Membership Benefits Today!</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  trialOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trialCard: {
    width: wp(85),
    backgroundColor: '#00474C',
    borderRadius: wp(8),
    padding: wp(8),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 20,
  },
  trialCloseBtn: {
    position: 'absolute',
    top: wp(5),
    right: wp(5),
  },
  trialIconBox: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  trialTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(6),
    color: '#FFFFFF',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  trialBody: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.8),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: wp(5.5),
    marginBottom: hp(3),
  },
  trialBtnGradient: {
    width: '100%',
    borderRadius: wp(3),
    marginBottom: hp(1),
  },
  trialBtn: {
    paddingVertical: hp(1.8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialBtnText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4),
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  trialSecondaryBtn: {
    width: '100%',
    paddingVertical: hp(1.2),
    alignItems: 'center',
    marginBottom: hp(1),
  },
  trialSecondaryBtnText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.5),
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
  },
  trialFooter: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.2),
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
});

export default TrialModal;
