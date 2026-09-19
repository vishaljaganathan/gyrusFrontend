import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CustomText as Text, CustomBoldText } from './CustomText';
import TestButton from './TestButton';
import { COLORS } from '../styles/themes';

interface StatusPopupProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
}

export default function StatusPopup({
  visible,
  type,
  title,
  message,
  onClose,
}: StatusPopupProps) {
  const isSuccess = type === 'success';
  const themeColor = isSuccess ? '#0AB8AD' : '#F6565D';
  const iconName = isSuccess ? 'checkmark-circle' : 'alert-circle';
  const buttonColors = isSuccess 
    ? ['rgba(0, 183, 194, 1)', 'rgba(197, 255, 244, 0.5)'] as const
    : ['rgba(246, 86, 93, 1)', 'rgba(246, 86, 93, 0.5)'] as const;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { borderColor: themeColor }]}>
          {/* Close Icon (Top Right) */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={wp(5.5)} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          {/* Status Icon */}
          <View style={[styles.iconContainer, { backgroundColor: isSuccess ? 'rgba(10, 184, 173, 0.15)' : 'rgba(246, 86, 93, 0.15)' }]}>
            <Ionicons name={iconName} size={wp(12)} color={themeColor} />
          </View>

          {/* Text Content */}
          <CustomBoldText style={[styles.title, { color: themeColor }]}>
            {title}
          </CustomBoldText>
          
          <Text style={styles.message}>
            {message}
          </Text>

          {/* Action Button */}
          <View style={styles.buttonWrapper}>
            <TestButton
              onPress={onClose}
              colors={buttonColors}
              text="OK"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: wp(85),
    backgroundColor: 'rgba(13, 25, 23, 0.98)',
    borderRadius: wp(5),
    borderWidth: wp(0.4),
    paddingHorizontal: wp(6),
    paddingVertical: hp(3.5),
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  closeBtn: {
    position: 'absolute',
    top: hp(1.8),
    right: wp(4.5),
    padding: wp(1),
    zIndex: 10,
  },
  iconContainer: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  title: {
    fontSize: wp(5),
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  message: {
    fontSize: wp(3.8),
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: wp(5.5),
    marginBottom: hp(3.5),
    paddingHorizontal: wp(2),
  },
  buttonWrapper: {
    width: wp(35),
    alignItems: 'center',
  },
});
