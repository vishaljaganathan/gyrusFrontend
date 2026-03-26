import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFire, faFrown } from '@fortawesome/free-solid-svg-icons';

interface StreakDisplayProps {
  streakData?: {
    active: number;
    inactive: number;
  };
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streakData }) => {
  if (!streakData) return null;

  return (
    <View style={styles.container}>
      <View style={styles.streakItem}>
        <FontAwesomeIcon icon={faFire} size={24} color="#FF6B35" />
        <Text style={styles.streakText}>{streakData.active}</Text>
      </View>

      <View style={styles.streakItem}>
        <FontAwesomeIcon icon={faFrown} size={22} color="#9E9E9E" />
        <Text style={styles.streakText}>{Math.max(0, Math.abs(Number(streakData.inactive) || 0))}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default StreakDisplay;