import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MathJaxSvg from 'react-native-mathjax-svg';

const DebugEqScroll = ({ route }: any) => {
  const raw = route?.params?.raw || 'CH3C eq C-CH2CH3';
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Equation Scroll</Text>
      <Text style={styles.subtitle}>Raw: {String(raw).slice(0, 100)}</Text>

      <ScrollView
        horizontal
        nestedScrollEnabled
        scrollEventThrottle={16}
        onScrollBeginDrag={() => console.log('[DebugEqScroll] onScrollBeginDrag')}
        onScrollEndDrag={() => console.log('[DebugEqScroll] onScrollEndDrag')}
        onMomentumScrollBegin={() => console.log('[DebugEqScroll] onMomentumScrollBegin')}
        onMomentumScrollEnd={() => console.log('[DebugEqScroll] onMomentumScrollEnd')}
        onTouchStart={() => console.log('[DebugEqScroll] onTouchStart')}
        onTouchEnd={() => console.log('[DebugEqScroll] onTouchEnd')}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        contentContainerStyle={{ alignItems: 'center' }}
        style={{ maxWidth: wp(100), paddingVertical: hp(4) }}
      >
        <View style={{ minWidth: wp(120), paddingHorizontal: wp(4) }}>
          <MathJaxSvg color="#FFFFFF" fontSize={wp(6)}>
            {String.raw`${raw}`}
          </MathJaxSvg>
        </View>
      </ScrollView>

      <Text style={styles.hint}>Try horizontal swipe and check Metro logs for events above.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#233', padding: wp(4) },
  title: { color: '#fff', fontSize: wp(5), fontWeight: 'bold', marginBottom: hp(1) },
  subtitle: { color: '#ddd', marginBottom: hp(2) },
  hint: { color: '#fff', marginTop: hp(2) },
});

export default DebugEqScroll;
