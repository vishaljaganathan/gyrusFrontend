import React, { useEffect, useState, useContext, useCallback } from "react";
import { 
  View, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform,
  Dimensions,
  RefreshControl,
  Modal,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomText as Text } from '../components/CustomText';
import { CustomVerticalScrollbar } from '../components/CustomVerticalScrollbar';
import { LinearGradient } from "expo-linear-gradient";
import TrialModal from "../components/TrialModal";
import { COLORS } from "../styles/themes";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import PremiumBanner from "../components/PremiumBanner";
import HeaderBar from "../navigation/Headerbar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from "../service/authContext";
import { getRequest, postRequest } from "../config/Requests";
import { axiosInstance } from "../config/indeceptor";

const { width } = Dimensions.get('window');

const Notification = ({ navigation }: { navigation: any }) => {
  const { userData, setUserData, notificationRefreshTrigger, setUnreadNotificationCount } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showPremiumBanner, setShowPremiumBanner] = useState(false);
  const [notificationGroups, setNotificationGroups] = useState<any>({
    TODAY: [],
    YESTERDAY: [],
    EARLIER: []
  });
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDeleteOption, setShowDeleteOption] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Load read notifications from storage
  useEffect(() => {
    const loadReadIds = async () => {
      try {
        const saved = await AsyncStorage.getItem('readNotificationIds');
        if (saved) {
          setReadIds(new Set(JSON.parse(saved)));
        }
      } catch (e) {
        console.error("Error loading read status:", e);
      }
    };
    loadReadIds();
  }, []);

  const markAsRead = async (id: string) => {
    if (readIds.has(id)) return;
    const newReadIds = new Set(readIds);
    newReadIds.add(id);
    setReadIds(newReadIds);
    try {
      await AsyncStorage.setItem('readNotificationIds', JSON.stringify(Array.from(newReadIds)));
    } catch (e) {
      console.error("Error saving read status:", e);
    }
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotification || !userData?._id) return;
    
    try {
      await axiosInstance.post('notifications/dismiss', {
        userId: userData._id,
        notificationId: selectedNotification._id
      });
      
      // Update local state to remove the notification from groups
      const updatedGroups = { ...notificationGroups };
      Object.keys(updatedGroups).forEach(key => {
        updatedGroups[key] = updatedGroups[key].filter((n: any) => n._id !== selectedNotification._id);
      });
      setNotificationGroups(updatedGroups);
      
      // Close modal
      setModalVisible(false);
      setShowDeleteOption(false);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!userData?._id) return;

    try {
      setLoading(true);
      
      const std = userData?.std || 'all';
      
      // Fetch individual, group, and broadcast notifications
      const [individualRes, groupRes, broadcastRes] = await Promise.all([
        getRequest(`notifications/individual/${userData._id}`),
        getRequest(`notifications/group/${std}?userId=${userData._id}`),
        getRequest(`notifications/broadcast?userId=${userData._id}`)
      ]);

      const individual = (individualRes.data || []).map((n: any) => ({ ...n, origin: 'individual' }));
      const group = (groupRes.data || []).map((n: any) => ({ ...n, origin: 'group' }));
      const broadcast = (broadcastRes.data || []).map((n: any) => ({ ...n, origin: 'broadcast' }));

      // Combine and sort by date
      const allNotifications = [...individual, ...group, ...broadcast].sort((a, b) => {
        const dateA = new Date(a.sentAt || a.createdAt).getTime();
        const dateB = new Date(b.sentAt || b.createdAt).getTime();
        return dateB - dateA;
      });

      // Group them
      const groups: any = { TODAY: [], YESTERDAY: [], EARLIER: [] };
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      allNotifications.forEach(item => {
        const date = new Date(item.sentAt || item.createdAt);
        if (date.toDateString() === now.toDateString()) {
          groups.TODAY.push(item);
        } else if (date.toDateString() === yesterday.toDateString()) {
          groups.YESTERDAY.push(item);
        } else {
          groups.EARLIER.push(item);
        }
      });

      setNotificationGroups(groups);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData?._id, setUnreadNotificationCount]);

  // Update unread count whenever groups or readIds change
  useEffect(() => {
    const all = [
      ...notificationGroups.TODAY, 
      ...notificationGroups.YESTERDAY, 
      ...notificationGroups.EARLIER
    ];
    if (all.length > 0) {
      const unreadCount = all.filter((n: any) => !readIds.has(n._id)).length;
      setUnreadNotificationCount(unreadCount);
    }
  }, [notificationGroups, readIds, setUnreadNotificationCount]);

  // Trial activation logic handled by TrialModal component

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, notificationRefreshTrigger]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getIconName = (item: any) => {
    // 1. Origin-based icons as requested
    if (item.origin === 'broadcast') return 'megaphone-outline';
    if (item.origin === 'group') return 'people-outline';
    if (item.origin === 'individual') return 'person-outline';

    // 2. Fallback to existing content-based logic if origin is missing
    const type = item.notificationType?.toLowerCase() || '';
    const title = item.header?.toLowerCase() || '';
    
    if (type.includes('live') || title.includes('live')) return 'play-circle-outline';
    if (type.includes('test') || title.includes('test')) return 'clipboard-outline';
    if (type.includes('result') || title.includes('result')) return 'analytics-outline';
    if (type.includes('badge') || title.includes('badge')) return 'trophy-outline';
    if (type.includes('schedule') || title.includes('schedule')) return 'calendar-outline';
    return 'notifications-outline';
  };

  const getTimeLabel = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHrs < 24) {
      if (date.toDateString() === now.toDateString()) {
        return `${diffHrs} hr ago`;
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const NotificationCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedNotification(item);
        setModalVisible(true);
        markAsRead(item._id);
      }}
      activeOpacity={0.9}
    >
      {!readIds.has(item._id) && (
        <View style={[styles.unreadDot, { backgroundColor: '#10b981' }]} />
      )}
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <View style={styles.iconPlaceholder}>
            <Ionicons name={getIconName(item)} size={wp(5)} color="rgba(255,255,255,0.7)" />
          </View>
        </View>
        <View style={styles.textContent}>
          <View style={styles.cardTopRow}>
            <Text style={styles.titleText}>{item.header}</Text>
          </View>
          <Text style={styles.timeText}>{getTimeLabel(item.sentAt || item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGroup = (label: string, items: any[]) => {
    if (items.length === 0) return null;
    return (
      <View style={styles.groupContainer}>
        <Text style={styles.groupLabel}>{label}</Text>
        {items.map((item, idx) => (
          <NotificationCard key={item._id || idx} item={item} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <LinearGradient 
        style={styles.container}
        colors={["#00474C", "#0AB8AD", "#028464"]}
      >
        <HeaderBar />
        {loading && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : (
          <CustomVerticalScrollbar 
            indicatorColor="hsla(185, 100%, 93%, 1.00)"
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
            }
          >
            {/* Pinned Trial Offer */}
            {userData && !userData.planValid && !userData.trialUsed && (
              <View style={styles.pinnedContainer}>
                <Text style={styles.groupLabel}>OFFER FOR YOU</Text>
                <TouchableOpacity 
                  style={[styles.card, styles.trialCardPinned]}
                  onPress={() => setShowTrialModal(true)}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                      <View style={[styles.iconPlaceholder, { backgroundColor: '#FFD700' }]}>
                        <Ionicons name="gift" size={wp(6)} color="#00474C" />
                      </View>
                    </View>
                    <View style={styles.textContent}>
                      <View style={styles.cardTopRow}>
                        <Text style={[styles.titleText, { color: '#FFD700' }]}>7-Day Gold Trial</Text>
                        <View style={[styles.unreadDot, { backgroundColor: '#FFD700' }]} />
                      </View>
                      <Text style={[styles.timeText, { color: '#FFD700', fontFamily: 'AppFont-Bold' }]}>VIEW OFFER</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {notificationGroups.TODAY.length === 0 && 
             notificationGroups.YESTERDAY.length === 0 && 
             notificationGroups.EARLIER.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={wp(15)} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            ) : (
              <>
                {renderGroup('TODAY', notificationGroups.TODAY)}
                {renderGroup('YESTERDAY', notificationGroups.YESTERDAY)}
                {renderGroup('EARLIER', notificationGroups.EARLIER)}
              </>
            )}
          </CustomVerticalScrollbar>
        )}

        {/* Notification Detail Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.menuButton} 
                onPress={() => setShowDeleteOption(!showDeleteOption)}
              >
                <Ionicons name="ellipsis-vertical" size={wp(6)} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>

              {showDeleteOption && (
                <TouchableOpacity 
                  style={styles.deleteOption} 
                  onPress={handleDeleteNotification}
                >
                  <Ionicons name="trash-outline" size={wp(4.5)} color="#ef4444" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={() => {
                  setModalVisible(false);
                  setShowDeleteOption(false);
                }}
              >
                <Ionicons name="close" size={wp(7)} color="white" />
              </TouchableOpacity>
              
              {selectedNotification && (
                <CustomVerticalScrollbar showsVerticalScrollIndicator={false} indicatorColor="hsla(185, 100%, 93%, 1.00)">
                  <View style={styles.modalIconContainer}>
                    <View style={styles.modalIconPlaceholder}>
                      <Ionicons 
                        name={getIconName(selectedNotification)} 
                        size={wp(10)} 
                        color="white" 
                      />
                    </View>
                  </View>
                  
                  <Text style={styles.modalTitle}>{selectedNotification.header}</Text>
                  <View style={styles.modalDivider} />
                  <Text style={styles.modalBody}>{selectedNotification.body}</Text>
                  <Text style={styles.modalTime}>{getTimeLabel(selectedNotification.sentAt || selectedNotification.createdAt)}</Text>
                </CustomVerticalScrollbar>
              )}
            </View>
          </View>
        </Modal>

        {/* 7-Day Free Trial Modal */}
        <TrialModal 
          isVisible={showTrialModal} 
          onClose={() => setShowTrialModal(false)}
          onSuccess={() => setShowPremiumBanner(true)}
        />

        {/* Premium Banner Overlay */}
        <PremiumBanner 
          isVisible={showPremiumBanner} 
          onClose={() => setShowPremiumBanner(false)} 
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#00474C"
  },
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  groupContainer: {
    marginBottom: hp(2),
  },
  groupLabel: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.8),
    color: 'rgba(255,255,255,0.6)',
    marginBottom: hp(2),
    marginLeft: wp(1),
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    borderRadius: wp(5),
    marginBottom: hp(1.5),
    padding: wp(4),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.30)',
  },
  cardContent: {
    flexDirection: 'row',
  },
  iconContainer: {
    justifyContent:'center',
    alignItems:'center',
    marginRight: wp(4),
  },
  iconPlaceholder: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  titleText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.2),
    color: '#FFFFFF',
    flex: 1,
    marginRight: wp(2),
  },
  unreadDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    position: 'absolute',
    top: wp(3),
    right: wp(3),
    zIndex: 10,
  },
  bodyText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.6),
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: wp(5),
    marginBottom: hp(1),
  },
  timeText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.2),
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyContainer: {
    flex: 1,
    height: hp(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(5),
    color: 'rgba(255,255,255,0.4)',
    marginTop: hp(2),
  },
  pinnedContainer: {
    marginBottom: hp(2),
  },
  trialCardPinned: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderWidth: 1.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: wp(90),
    maxHeight: hp(70),
    backgroundColor: '#2e6d5eff',
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
    fontSize: wp(5.5),
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
    fontSize: wp(4.2),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: wp(6),
    marginBottom: hp(3),
    textAlign: 'justify',
  },
  modalTime: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.5),
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  trialFooter: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.2),
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  menuButton: {
    position: 'absolute',
    top: wp(4.5),
    left: wp(4.5),
    zIndex: 10,
    padding: wp(1),
  },
  deleteOption: {
    position: 'absolute',
    top: wp(12),
    left: wp(4.5),
    backgroundColor: '#1f4d42',
    borderRadius: wp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.5),
    color: '#ef4444',
    marginLeft: wp(2),
  },
});

export default Notification;
