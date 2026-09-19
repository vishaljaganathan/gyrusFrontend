import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { CustomText as Text, CustomBoldText } from './CustomText';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface AppToastProps {
  visible: boolean;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number; // duration in ms, 0 to disable auto-dismiss
  onClose: () => void;
  onPress?: () => void;
}

const THEME_CONFIG: Record<
  ToastType,
  {
    accent: string;
    bgTint: string;
    border: string;
    icon: keyof typeof Ionicons.glyphMap;
    defaultTitle: string;
  }
> = {
  error: {
    accent: '#F6565D',
    bgTint: 'rgba(246, 86, 93, 0.15)',
    border: 'rgba(246, 86, 93, 0.65)',
    icon: 'alert-circle',
    defaultTitle: 'Error',
  },
  warning: {
    accent: '#F2C112',
    bgTint: 'rgba(242, 193, 18, 0.15)',
    border: 'rgba(242, 193, 18, 0.65)',
    icon: 'warning',
    defaultTitle: 'Warning',
  },
  success: {
    accent: '#0AB8AD',
    bgTint: 'rgba(10, 184, 173, 0.15)',
    border: 'rgba(10, 184, 173, 0.65)',
    icon: 'checkmark-circle',
    defaultTitle: 'Success',
  },
  info: {
    accent: '#00D1FF',
    bgTint: 'rgba(0, 209, 255, 0.15)',
    border: 'rgba(0, 209, 255, 0.65)',
    icon: 'information-circle',
    defaultTitle: 'Notice',
  },
};

export const AppToast: React.FC<AppToastProps> = ({
  visible,
  type = 'error',
  title,
  message,
  duration = 4000,
  onClose,
  onPress,
}) => {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentTheme = THEME_CONFIG[type] || THEME_CONFIG.error;
  const displayTitle = title || currentTheme.defaultTitle;

  const dismiss = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 75,
          friction: 9,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          dismiss();
        }, duration);
      }
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, message, title, type]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => {
          if (onPress) {
            onPress();
          }
          dismiss();
        }}
        style={[
          styles.toastCard,
          {
            borderColor: currentTheme.border,
          },
        ]}
      >
        {/* Leading Icon */}
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: currentTheme.bgTint },
          ]}
        >
          <Ionicons
            name={currentTheme.icon}
            size={wp(5.8)}
            color={currentTheme.accent}
          />
        </View>

        {/* Content */}
        <View style={styles.textWrapper}>
          {!!displayTitle && (
            <CustomBoldText
              style={[styles.title, { color: currentTheme.accent }]}
              numberOfLines={1}
            >
              {displayTitle}
            </CustomBoldText>
          )}
          <Text style={styles.message} numberOfLines={3}>
            {message}
          </Text>
        </View>

        {/* Dismiss Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={dismiss}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={wp(4.8)} color="rgba(255, 255, 255, 0.55)" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp(6) : (StatusBar.currentHeight || hp(2)) + hp(1.2),
    left: wp(4),
    right: wp(4),
    zIndex: 999999,
    elevation: 999999,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 25, 23, 0.98)', // Dark teal slate matching app theme
    borderRadius: wp(3.5),
    borderWidth: 1.2,
    paddingHorizontal: wp(3.8),
    paddingVertical: hp(1.4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
  },
  iconWrapper: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  textWrapper: {
    flex: 1,
    marginRight: wp(2),
  },
  title: {
    fontSize: wp(3.8),
    marginBottom: hp(0.2),
  },
  message: {
    fontSize: wp(3.3),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: wp(4.5),
  },
  closeBtn: {
    padding: wp(1),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppToast;
