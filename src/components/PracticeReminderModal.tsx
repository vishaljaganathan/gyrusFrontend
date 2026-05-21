import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { CustomText as Text } from './CustomText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';

const PracticeReminderModal = ({ 
  isVisible, 
  onClose 
}: { 
  isVisible: boolean; 
  onClose: () => void; 
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} />
        
        <LinearGradient
          colors={['#006B3E', '#004D2C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.container}
        >
          {/* Left Logo Circle */}
          <View style={styles.leftCircle}>
            <Image 
              source={require('../assets/appLogo.png')}
              style={styles.logo}
            />
          </View>

          {/* Middle Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Have you practiced today?</Text>
            <Text style={styles.body}>One quick practice keeps the pulse alive!</Text>
          </View>

          {/* Right Section: Pulse and Stethoscope */}
          <View style={styles.rightSection}>
            <MaterialCommunityIcons name="pulse" size={wp(10)} color="#00FF00" />
            <View style={styles.rightCircle}>
              <MaterialCommunityIcons name="stethoscope" size={wp(7)} color="#004D2C" />
            </View>
          </View>

          {/* Close Button Overlay */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={wp(5)} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: wp(92),
    height: hp(14),
    borderRadius: wp(5),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  leftCircle: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: wp(12),
    height: wp(12),
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(3),
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.5),
    color: '#32FF32', // Bright green
    marginBottom: hp(0.2),
  },
  body: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.8),
    color: 'white',
    lineHeight: wp(4.8),
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: wp(22),
  },
  rightCircle: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#D1D1D1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(-2), // Overlap with pulse icon
  },
  closeButton: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
  }
});

export default PracticeReminderModal;
