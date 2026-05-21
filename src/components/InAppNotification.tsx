import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { CustomText as Text } from './CustomText';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width } = Dimensions.get('window');

interface InAppNotificationProps {
  isVisible: boolean;
  notification: any;
  onClose: () => void;
  onPress?: () => void;
}

const InAppNotification: React.FC<InAppNotificationProps> = ({
  isVisible,
  notification,
  onClose,
  onPress
}) => {
  const translateY = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }).start();

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!notification && !isVisible) return null;

  const title = notification?.request?.content?.title || notification?.title || 'New Notification';
  const body = notification?.request?.content?.body || notification?.body || '';

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY }] }
      ]}
    >
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9}
        onPress={() => {
            if (onPress) onPress();
            handleClose();
        }}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="notifications" size={wp(5)} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.body} numberOfLines={2}>{body}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={wp(5)} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp(6) : (StatusBar.currentHeight || 0) + hp(1),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: wp(4),
  },
  card: {
    width: '100%',
    backgroundColor: '#028464', // Matching the app theme teal
    borderRadius: wp(4),
    flexDirection: 'row',
    padding: wp(4),
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    marginRight: wp(3),
  },
  iconBackground: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: wp(2),
  },
  title: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4),
    color: '#FFFFFF',
    marginBottom: 2,
  },
  body: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.5),
    color: 'rgba(255,255,255,0.9)',
  },
  closeButton: {
    padding: wp(1),
  }
});

export default InAppNotification;
