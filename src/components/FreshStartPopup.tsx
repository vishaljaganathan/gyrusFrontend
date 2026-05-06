import { Dimensions, Animated, Modal, View, TouchableOpacity,  StyleSheet } from 'react-native'
import { CustomText as Text, CustomAnimatedText } from './CustomText';

import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useEffect } from "react";





const { width } = Dimensions.get("window");

export default function FreshStartPopup({
  visible,
  onClose}: {
  visible: boolean;
  onClose: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true}),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true}),
        Animated.loop(
          Animated.sequence([
            Animated.timing(floatAnim, {
              toValue: -10,
              duration: 1500,
              useNativeDriver: true}),
            Animated.timing(floatAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true}),
          ]),
        ),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.popup,
            {
              transform: [
                { translateY: slideAnim },
                {
                  scale: opacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1]})},
              ],
              opacity: opacityAnim},
          ]}
        >
          {/* Header with animated float icons and close button */}
          <LinearGradient
            colors={["#14b8a6", "#0e7490", "#0f766e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={{ color: "#F6F0F0", fontFamily: 'AppFont-Regular', fontSize: 24 }}>✖</Text>
            </TouchableOpacity>
            <Animated.View
              style={[
                styles.floatIcon,
                {
                  top: 0,
                  right: 0,
                  opacity: 0.2,
                  transform: [{ translateY: floatAnim }]},
              ]}
            >
              <Text style={{ fontFamily: 'AppFont-Regular', fontSize: 80 }}>ðŸ”¬</Text>
            </Animated.View>
            <Animated.View
              style={[styles.floatIcon, { bottom: 0, left: 0, opacity: 0.2 }]}
            >
              <Text style={{ fontFamily: 'AppFont-Regular', fontSize: 60 }}>ðŸ§¬</Text>
            </Animated.View>
            <View style={styles.headerIconWrap}>
              <Text style={{ fontFamily: 'AppFont-Regular', fontSize: 48 }}>ðŸ©º</Text>
            </View>
            <Text style={styles.headerTitle}>We've Upgraded!</Text>
            <Text style={styles.headerSubtitle}>
              Your NEET journey just got smarter
            </Text>
          </LinearGradient>
          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.levelText}>
              You'll start from{" "}
              <Text style={styles.levelHighlight}>Level 1</Text>,
            </Text>
            <Text style={styles.learnFaster}>
              but you'll learn faster than before!
            </Text>
            <View style={styles.safeRewardsCard}>
              <View style={styles.safeRewardsHeader}>
                <Text style={styles.safeRewardsTitle}>
                  Don't Worry! Your Rewards Are Safe
                </Text>
              </View>
              <LinearGradient
                colors={["#14b8a6", "#0e7490", "#0f766e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.rewardCard}
              >
                <Text style={{ fontFamily: 'AppFont-Regular', fontSize: 30, marginBottom: 8 }}>ðŸ†</Text>
                <Text style={styles.rewardMain}>All Your Rewards Stay!</Text>
                <Text style={styles.rewardSub}>
                  Points, badges & achievements are yours forever
                </Text>
              </LinearGradient>
            </View>
            <LinearGradient
              colors={["rgba(0, 183, 194, 1)", "rgba(197, 255, 244, 0.5)"]}
              start={{ x: 0.6, y: 0.3 }}
              end={{ x: 0.6, y: 0 }}
              style={styles.ctaButton}
            >
              <TouchableOpacity
                style={{ width: "100%", alignItems: "center" }}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaButtonText}>Let's Start Learning!</Text>
              </TouchableOpacity>
            </LinearGradient>
            <Text style={styles.footerText}>
              Get ready for smarter practice
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16},
  popup: {
    backgroundColor: "#F6F0F0",
    borderRadius: 24,
    width: width - 32,
    maxWidth: 400,
    padding: 0,
    overflow: "hidden",
    elevation: 10},
  closeButton: {
    
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    borderRadius: 20,
    padding: 6,
    color: "#808080", // Gray color
        fontFamily: 'AppFont-Regular', fontSize: 18,
    textAlign: "center"},
  floatIcon: {
    position: "absolute"},
  header: {
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden"},
  headerIconWrap: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 50,
    padding: 10,
    marginBottom: 8},
  headerTitle: {
    
    color: "#F6F0F0",
    fontFamily: 'AppFont-Regular', fontSize: 26,
        marginBottom: 4,
    marginTop: 8},
  headerSubtitle: {
    
    color: "#e0f7f0",
    fontFamily: 'AppFont-Regular', fontSize: 16,
        marginBottom: 8},
  content: {
    padding: 24,
    alignItems: "center"},
  levelText: {
    
    fontFamily: 'AppFont-Regular', fontSize: 20,
    color: "#0AB8AD",
        textAlign: "center"},
  levelHighlight: {
    
    color: "#028464"},
  learnFaster: {
    
    fontFamily: 'AppFont-Regular', fontSize: 20,
        textAlign: "center",
    backgroundColor: "transparent",
    marginBottom: 16,
    color: "#0AB8AD"},
  safeRewardsCard: {
    width: "100%",
    marginBottom: 16,
    marginTop: 16},
  safeRewardsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    gap: 8},
  safeRewardsTitle: {
    
    color: "#0AB8AD",
        fontFamily: 'AppFont-Regular', fontSize: 16,
    marginLeft: 8},
  rewardCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    // Gradient applied via LinearGradient in JSX
  },
  rewardMain: {
    
    color: "#F6F0F0",
        fontFamily: 'AppFont-Regular', fontSize: 16,
    marginBottom: 2},
  rewardSub: {
    
    color: "#e0f7f0",
    fontFamily: 'AppFont-Regular', fontSize: 13,
    textAlign: "center"},
  ctaButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: "#0AB8AD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: "row",
    justifyContent: "center"},
  ctaButtonText: {
    
    color: "#F5F7FA",
        fontFamily: 'AppFont-Regular', fontSize: 18},
  footerText: {
    
    color: "#0AB8AD",
    fontFamily: 'AppFont-Regular', fontSize: 14,
    marginTop: 12,
    textAlign: "center"}});
