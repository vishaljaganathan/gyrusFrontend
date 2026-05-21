import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions
} from 'react-native';
import { CustomText as Text } from './CustomText';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CustomVerticalScrollbar } from './CustomVerticalScrollbar';

const GlobalNotificationModal = ({ 
  isVisible, 
  onClose, 
  notification 
}: { 
  isVisible: boolean; 
  onClose: () => void; 
  notification: any 
}) => {
  if (!notification) return null;

  const content = notification?.request?.content || notification;
  const title = content.title || content.header || 'New Notification';
  const body = content.body || '';

  const getIconName = (item: any) => {
    const type = (item.notificationType || item.data?.type || '').toLowerCase();
    const titleLower = (item.title || item.header || '').toLowerCase();
    
    if (type.includes('live') || titleLower.includes('live')) return 'play-circle-outline';
    if (type.includes('test') || titleLower.includes('test')) return 'clipboard-outline';
    if (type.includes('result') || titleLower.includes('result')) return 'analytics-outline';
    if (type.includes('badge') || titleLower.includes('badge')) return 'trophy-outline';
    if (type.includes('schedule') || titleLower.includes('schedule')) return 'calendar-outline';
    
    // Origin-based icons as requested
    if (item.origin === 'broadcast') return 'megaphone-outline';
    if (item.origin === 'group') return 'people-outline';
    if (item.origin === 'individual') return 'person-outline';
    
    return 'notifications-outline';
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={onClose}
          >
            <Ionicons name="close" size={wp(7)} color="white" />
          </TouchableOpacity>
          
          <CustomVerticalScrollbar showsVerticalScrollIndicator={false} indicatorColor="hsla(185, 100%, 93%, 1.00)">
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIconPlaceholder}>
                <Ionicons 
                  name={getIconName(content)} 
                  size={wp(10)} 
                  color="white" 
                />
              </View>
            </View>
            
            <Text style={styles.modalTitle}>{title}</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalBody}>{body}</Text>
            <TouchableOpacity 
              style={styles.okButton}
              onPress={onClose}
            >
              <Text style={styles.okButtonText}>Got it</Text>
            </TouchableOpacity>
          </CustomVerticalScrollbar>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: wp(85),
    maxHeight: hp(60),
    backgroundColor: '#028464',
    borderRadius: wp(6),
    padding: wp(6),
    position: 'relative',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  modalCloseButton: {
    position: 'absolute',
    top: wp(4),
    right: wp(4),
    zIndex: 10,
  },
  modalIconContainer: {
    alignItems: 'center',
    marginBottom: hp(2),
    marginTop: hp(2),
  },
  modalIconPlaceholder: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(5),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(5),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: hp(1.5),
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
    marginBottom: hp(2),
  },
  modalBody: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(4),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: wp(5.5),
    marginBottom: hp(3),
    textAlign: 'justify',
  },
  okButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    alignItems: 'center',
    marginTop: hp(1),
  },
  okButtonText: {
    fontFamily: 'AppFont-Bold',
    color: 'white',
    fontSize: wp(4),
  }
});

export default GlobalNotificationModal;
