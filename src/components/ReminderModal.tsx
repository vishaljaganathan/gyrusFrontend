import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { CustomText as Text, CustomTextInput as TextInput } from './CustomText';

const { width: SCREEN_W } = Dimensions.get('window');

interface ReminderModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (morning: string, evening: string) => void;
  initialMorning?: string;
  initialEvening?: string;
}

export default function ReminderModal({
  isVisible,
  onClose,
  onSave,
  initialMorning = '06:00',
  initialEvening = '20:00',
}: ReminderModalProps) {
  const [morningHrs, setMorningHrs] = useState('');
  const [morningMins, setMorningMins] = useState('');
  const [eveningHrs, setEveningHrs] = useState('');
  const [eveningMins, setEveningMins] = useState('');
  const [morningError, setMorningError] = useState('');
  const [eveningError, setEveningError] = useState('');

  const [isMorningEditable, setIsMorningEditable] = useState(false);
  const [isEveningEditable, setIsEveningEditable] = useState(false);

  const morningHrsRef = useRef<any>(null);
  const eveningHrsRef = useRef<any>(null);

  const handleEditMorning = () => {
    setIsMorningEditable(true);
    setTimeout(() => {
      morningHrsRef.current?.focus();
    }, 100);
  };

  const handleEditEvening = () => {
    setIsEveningEditable(true);
    setTimeout(() => {
      eveningHrsRef.current?.focus();
    }, 100);
  };

  // Sync initial props on mount/visibility change
  useEffect(() => {
    if (isVisible) {
      // Parse morning time (24h format to 12h representation)
      let mTime = initialMorning || '06:00';
      const [mHrs, mMins] = mTime.split(':').map(Number);
      let mHrs12 = mHrs % 12;
      mHrs12 = mHrs12 === 0 ? 12 : mHrs12;
      
      setMorningHrs(mHrs12 < 10 ? `0${mHrs12}` : `${mHrs12}`);
      setMorningMins(mMins < 10 ? `0${mMins}` : `${mMins}`);

      // Parse evening time (24h format to 12h representation)
      let eTime = initialEvening || '20:00';
      const [eHrs, eMins] = eTime.split(':').map(Number);
      let eHrs12 = eHrs % 12;
      eHrs12 = eHrs12 === 0 ? 12 : eHrs12;

      setEveningHrs(eHrs12 < 10 ? `0${eHrs12}` : `${eHrs12}`);
      setEveningMins(eMins < 10 ? `0${eMins}` : `${eMins}`);
      
      setMorningError('');
      setEveningError('');
      setIsMorningEditable(false);
      setIsEveningEditable(false);
    }
  }, [isVisible, initialMorning, initialEvening]);

  const onChangeMorningHrs = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setMorningHrs(cleaned);
    if (cleaned) {
      const num = parseInt(cleaned, 10);
      if (num < 1 || num > 12) {
        setMorningError('Hour must be 1 to 12');
      } else {
        setMorningError('');
      }
    } else {
      setMorningError('Hour is required');
    }
  };

  const onChangeMorningMins = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setMorningMins(cleaned);
    if (cleaned) {
      const num = parseInt(cleaned, 10);
      if (num < 0 || num > 59) {
        setMorningError('Minutes must be 00 to 59');
      } else {
        setMorningError('');
      }
    } else {
      setMorningError('Minutes is required');
    }
  };

  const onChangeEveningHrs = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setEveningHrs(cleaned);
    if (cleaned) {
      const num = parseInt(cleaned, 10);
      if (num < 1 || num > 12) {
        setEveningError('Hour must be 1 to 12');
      } else {
        setEveningError('');
      }
    } else {
      setEveningError('Hour is required');
    }
  };

  const onChangeEveningMins = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setEveningMins(cleaned);
    if (cleaned) {
      const num = parseInt(cleaned, 10);
      if (num < 0 || num > 59) {
        setEveningError('Minutes must be 00 to 59');
      } else {
        setEveningError('');
      }
    } else {
      setEveningError('Minutes is required');
    }
  };

  const handleSave = () => {
    const mH = parseInt(morningHrs, 10);
    const mM = parseInt(morningMins, 10);
    const eH = parseInt(eveningHrs, 10);
    const eM = parseInt(eveningMins, 10);

    let hasError = false;

    if (isNaN(mH) || mH < 1 || mH > 12) {
      setMorningError('Hour must be 1-12');
      hasError = true;
    }
    if (isNaN(mM) || mM < 0 || mM > 59) {
      setMorningError('Minutes must be 00-59');
      hasError = true;
    }
    if (isNaN(eH) || eH < 1 || eH > 12) {
      setEveningError('Hour must be 1-12');
      hasError = true;
    }
    if (isNaN(eM) || eM < 0 || eM > 59) {
      setEveningError('Minutes must be 00-59');
      hasError = true;
    }

    if (hasError) return;

    // Convert back to 24-hour string format
    const mH24 = mH === 12 ? 0 : mH;
    const eH24 = eH === 12 ? 12 : eH + 12;

    const mHrsStr = mH24 < 10 ? `0${mH24}` : `${mH24}`;
    const mMinsStr = mM < 10 ? `0${mM}` : `${mM}`;
    const eHrsStr = eH24 < 10 ? `0${eH24}` : `${eH24}`;
    const eMinsStr = eM < 10 ? `0${eM}` : `${eM}`;

    onSave(`${mHrsStr}:${mMinsStr}`, `${eHrsStr}:${eMinsStr}`);
  };

  const hasChanges = (() => {
    const mH = parseInt(morningHrs, 10);
    const mM = parseInt(morningMins, 10);
    const eH = parseInt(eveningHrs, 10);
    const eM = parseInt(eveningMins, 10);

    const [initMH, initMM] = (initialMorning || '06:00').split(':').map(Number);
    let initMH12 = initMH % 12;
    initMH12 = initMH12 === 0 ? 12 : initMH12;

    const [initEH, initEM] = (initialEvening || '20:00').split(':').map(Number);
    let initEH12 = initEH % 12;
    initEH12 = initEH12 === 0 ? 12 : initEH12;

    return mH !== initMH12 || mM !== initMM || eH !== initEH12 || eM !== initEM;
  })();

  return (
    <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={styles.modalContainer}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={wp(6)} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>

            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.clockIconBox}>
                  <Ionicons name="time" size={wp(7)} color="#00B8AC" />
                </View>
                <Text style={styles.title}>Reminder Settings</Text>
                <Text style={styles.subtitle}>
                  Customize your push notification times for morning and evening learning sessions.
                </Text>
              </View>

              {/* Input Fields */}
              <View style={styles.form}>
                {/* Morning Picker */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Morning Reminder (AM only)</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                    <View style={[
                      styles.timeInputCard,
                      { flex: 1 },
                      isMorningEditable && { borderColor: '#00B8AC', backgroundColor: 'rgba(10, 184, 173, 0.1)' }
                    ]}>
                      <Ionicons name="sunny-outline" size={wp(5)} color="#00B8AC" style={{ marginRight: wp(3) }} />
                      
                      <View style={styles.manualTimeInputContainer}>
                        <TextInput
                          ref={morningHrsRef}
                          style={styles.timeTextInput}
                          value={morningHrs}
                          onChangeText={onChangeMorningHrs}
                          keyboardType="numeric"
                          maxLength={2}
                          placeholder="HH"
                          placeholderTextColor="rgba(197, 255, 250, 0.3)"
                          editable={isMorningEditable}
                        />
                        <Text style={styles.timeColon}>:</Text>
                        <TextInput
                          style={styles.timeTextInput}
                          value={morningMins}
                          onChangeText={onChangeMorningMins}
                          keyboardType="numeric"
                          maxLength={2}
                          placeholder="MM"
                          placeholderTextColor="rgba(197, 255, 250, 0.3)"
                          editable={isMorningEditable}
                        />
                      </View>

                      <View style={styles.ampmBadge}>
                        <Text style={styles.ampmBadgeText}>AM</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.editIconRoundContainer,
                        isMorningEditable && { backgroundColor: 'rgba(10, 184, 173, 0.25)', borderColor: '#00B8AC' }
                      ]}
                      onPress={handleEditMorning}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="pencil" size={wp(4.8)} color={isMorningEditable ? '#00B8AC' : '#E0FDFB'} />
                    </TouchableOpacity>
                  </View>
                  {morningError ? <Text style={styles.errorText}>{morningError}</Text> : null}
                </View>

                {/* Evening Picker */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Evening Reminder (PM only)</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                    <View style={[
                      styles.timeInputCard,
                      { flex: 1 },
                      isEveningEditable && { borderColor: '#00B8AC', backgroundColor: 'rgba(10, 184, 173, 0.1)' }
                    ]}>
                      <Ionicons name="moon-outline" size={wp(5)} color="#00B8AC" style={{ marginRight: wp(3) }} />
                      
                      <View style={styles.manualTimeInputContainer}>
                        <TextInput
                          ref={eveningHrsRef}
                          style={styles.timeTextInput}
                          value={eveningHrs}
                          onChangeText={onChangeEveningHrs}
                          keyboardType="numeric"
                          maxLength={2}
                          placeholder="HH"
                          placeholderTextColor="rgba(197, 255, 250, 0.3)"
                          editable={isEveningEditable}
                        />
                        <Text style={styles.timeColon}>:</Text>
                        <TextInput
                          style={styles.timeTextInput}
                          value={eveningMins}
                          onChangeText={onChangeEveningMins}
                          keyboardType="numeric"
                          maxLength={2}
                          placeholder="MM"
                          placeholderTextColor="rgba(197, 255, 250, 0.3)"
                          editable={isEveningEditable}
                        />
                      </View>

                      <View style={styles.ampmBadge}>
                        <Text style={styles.ampmBadgeText}>PM</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.editIconRoundContainer,
                        isEveningEditable && { backgroundColor: 'rgba(10, 184, 173, 0.25)', borderColor: '#00B8AC' }
                      ]}
                      onPress={handleEditEvening}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="pencil" size={wp(4.8)} color={isEveningEditable ? '#00B8AC' : '#E0FDFB'} />
                    </TouchableOpacity>
                  </View>
                  {eveningError ? <Text style={styles.errorText}>{eveningError}</Text> : null}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                {hasChanges && (
                  <TouchableOpacity style={styles.btnPrimary} onPress={handleSave} activeOpacity={0.8}>
                    <Text style={styles.btnPrimaryText}>Save Settings</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.btnSecondary} onPress={onClose} activeOpacity={0.7}>
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 15, 17, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp(90),
    maxHeight: hp(85),
    backgroundColor: '#00373B',
    borderRadius: wp(5),
    paddingHorizontal: wp(5),
    paddingVertical: hp(3.0),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(10, 184, 173, 0.25)',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: wp(4),
    right: wp(4),
    padding: wp(1),
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  clockIconBox: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: 'rgba(10, 184, 173, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  title: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.6),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: hp(0.8),
  },
  subtitle: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.0),
    color: 'rgba(197, 255, 250, 0.7)',
    textAlign: 'center',
    paddingHorizontal: wp(4),
    lineHeight: wp(4.2),
  },
  form: {
    width: '100%',
    marginBottom: hp(3.0),
  },
  fieldContainer: {
    width: '100%',
    marginBottom: hp(2.0),
  },
  fieldLabel: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.0),
    color: 'rgba(197, 255, 250, 0.65)',
    marginBottom: hp(0.8),
  },
  timeInputCard: {
    width: '100%',
    height: hp(6.5),
    backgroundColor: 'rgba(10, 184, 173, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(10, 184, 173, 0.15)',
    borderRadius: wp(3),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  manualTimeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeTextInput: {
    width: wp(10),
    height: hp(4.5),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: wp(1.5),
    textAlign: 'center',
    color: '#E0FDFB',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.6),
    padding: 0,
  },
  timeColon: {
    color: '#00B8AC',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.5),
    marginHorizontal: wp(1.5),
  },
  ampmBadge: {
    marginLeft: 'auto',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    backgroundColor: 'rgba(10, 184, 173, 0.2)',
    borderRadius: wp(1.5),
  },
  ampmBadgeText: {
    color: '#00B8AC',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.0),
  },
  errorText: {
    color: '#FACC15',
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.8),
    marginTop: hp(0.5),
  },
  actions: {
    width: '100%',
  },
  btnPrimary: {
    width: '100%',
    height: hp(6.0),
    backgroundColor: '#00B8AC',
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(1.2),
  },
  btnPrimaryText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.6),
    color: '#ffffff',
  },
  btnSecondary: {
    width: '100%',
    height: hp(6.0),
    borderWidth: 1,
    borderColor: 'rgba(10, 184, 173, 0.35)',
    borderRadius: wp(3),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 184, 173, 0.04)',
  },
  btnSecondaryText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.6),
    color: '#0AB8AD',
  },
  editIconRoundContainer: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    backgroundColor: 'rgba(10, 184, 173, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(10, 184, 173, 0.2)',
    marginLeft: wp(3),
  },
});
