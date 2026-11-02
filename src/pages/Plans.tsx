import { axiosInstance } from '../config/indeceptor';
import React, { useEffect, useState, useContext } from "react";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Alert, ScrollView, NativeModules, Linking, Share } from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from '../components/CustomText';
import { Modal } from "@gluestack-ui/themed-native-base";
import { LinearGradient } from "expo-linear-gradient";
import Theme, { FontFamily } from "../styles/themes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp } from "react-native-responsive-screen";
import {
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faQrcode,
  faShareNodes,
  faExternalLinkAlt,
  faBolt,
  faCopy,
  faChevronDown,
  faChevronUp,
  faChevronRight,
  faCheck,
  faArrowRight,
  faClock,
  faCrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import RazorpayCheckout from "react-native-razorpay";
import { WebView } from "react-native-webview";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { ThemeContext } from "../service/authContext";
import SubscribeBtn from "../components/SubscribeButton";

// Branded vector icons for UPI payment apps
const GPayIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="11.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={0.8} />
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </Svg>
);

const PhonePeIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Circle cx="16" cy="16" r="15" fill="#5F259F" />
    <Path
      d="M17.8 6.5 C19.2 5 21.5 5.5 21.8 7 C21.2 8.2 19.5 9 17.5 9.8 Z"
      fill="#FFFFFF"
    />
    <Rect x="8.5" y="10" width="14.5" height="2.2" rx="1.1" fill="#FFFFFF" />
    <Rect x="18" y="10" width="2.4" height="13" rx="1.2" fill="#FFFFFF" />
    <Path
      d="M11 10 V16.5 C11 18.2 12.5 19.5 14.5 19.5 H18 V17.3 H14.5 C13.7 17.3 13.2 16.8 13.2 16 V10 Z"
      fill="#FFFFFF"
    />
  </Svg>
);

const PaytmIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 36 36">
    <Rect x="1" y="1" width="34" height="34" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1} />
    <Path
      d="M6 13h4.2c1.8 0 3 1.1 3 2.7 0 1.7-1.2 2.8-3 2.8H8.5V23H6V13zm2.5 3.8h1.5c.5 0 .9-.3.9-.9 0-.5-.4-.8-.9-.8H8.5v1.7z"
      fill="#002970"
    />
    <Path
      d="M14.5 17.5c0-1.8 1.3-2.8 2.8-2.8 1.4 0 2.4.9 2.6 2.1h-1.8c-.1-.4-.4-.6-.8-.6-.6 0-1 .4-1 1.3s.4 1.3 1 1.3c.4 0 .7-.2.8-.6h1.8c-.2 1.2-1.2 2.1-2.6 2.1-1.6 0-2.8-1-2.8-2.8z"
      fill="#002970"
    />
    <Path
      d="M21.5 15h3.6v1.7h-1v6.3h-1.7v-6.3h-.9V15z"
      fill="#00BAF2"
    />
    <Path
      d="M25.6 15h1.7v1.2c.3-.8 1-1.3 1.9-1.3.8 0 1.5.4 1.8 1.2.4-.8 1.1-1.2 2-1.2 1.2 0 2 .8 2 2.2V23h-1.7v-4.5c0-.6-.3-.9-.8-.9s-.8.3-.8.9V23h-1.7v-4.5c0-.6-.3-.9-.8-.9s-.8.3-.8.9V23h-1.7V15z"
      fill="#00BAF2"
    />
  </Svg>
);

const BhimIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Circle cx="16" cy="16" r="15" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1} />
    <Path d="M9 22 L14 10 H17.5 L12.5 22 Z" fill="#00A651" />
    <Path d="M15 22 L20 10 H23.5 L18.5 22 Z" fill="#F37021" />
  </Svg>
);

const CredIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Circle cx="16" cy="16" r="15" fill="#121212" />
    <Path
      d="M16 8 C12 8 10 10 10 14 V19 C10 22.5 13 25 16 25 C19 25 22 22.5 22 19 V14 C22 10 20 8 16 8 Z M19.5 18.5 C19.5 20.5 18 22.5 16 22.5 C14 22.5 12.5 20.5 12.5 18.5 V14 C12.5 12 13.5 10.5 16 10.5 C18.5 10.5 19.5 12 19.5 14 V18.5 Z"
      fill="#FFFFFF"
    />
  </Svg>
);





const Plans = ({ navigation }: any) => {
  const check = require("../assets/check-square.png");
  const insets = useSafeAreaInsets();
  const logo = require("../assets/appLogo.png");

  const [showOrder, setShowOrder] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPaymentStatus, setshowPaymentStatus] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [expandedPlanIds, setExpandedPlanIds] = useState<{ [key: string]: boolean }>({});

  const togglePlanExpand = (planId: string) => {
    setExpandedPlanIds((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };
  const [loading, setLoading] = useState(false);
  const [couponChecked, setCouponChecked] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [verifiedCoupon, setVerifiedCoupon] = useState<any>(null);
  const [useRedeemedPoints, setUseRedeemedPoints] = useState(false);

  const [showQrModal, setShowQrModal] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrOrderData, setQrOrderData] = useState<{
    orderId?: string;
    virtualAccountId?: string;
    upiId?: string;
    upiIntentUri?: string;
    qrCodeId?: string;
    paymentLinkId?: string;
    paymentUrl?: string;
    qrImageUrl?: string;
    amount?: number;
    planName?: string;
  } | null>(null);
  const [qrPolling, setQrPolling] = useState(false);
  const [verifyingStatus, setVerifyingStatus] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [inAppWebPaymentUrl, setInAppWebPaymentUrl] = useState<string | null>(null);

  const [order, setOrder] = useState({
    _id: "",
    amount: 0,
    discountApplicable: false,
    gst: 18,
    gstPrice: 100,
    prices: { discountPrice: "0", offer: 0, price: "0" } });

  const { userData, setUserData } = useContext(ThemeContext);
  const Top = (insets.top = 62);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const getErrorMessage = (value: any): string => {
    if (!value) {
      return "Invalid coupon code";
    }

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return getErrorMessage(value[0]);
    }

    if (typeof value === "object") {
      if (value.message && typeof value.message === "object") {
        return getErrorMessage(value.message);
      }

      if (typeof value.message === "string") {
        if (value.message.includes("Cannot POST /api/authentication/coupon/verify")) {
          return "Coupon verification is not available on the current server yet";
        }

        return value.message;
      }

      if (Array.isArray(value.message)) {
        return getErrorMessage(value.message[0]);
      }

      if (typeof value.error === "string") {
        return value.error;
      }

      if (typeof value.statusCode === "number" && value.statusCode === 404) {
        return "Coupon verification is not available on the current server yet";
      }
    }

    return "Invalid coupon code";
  };

  const resetCouponState = () => {
    setCouponChecked(false);
    setCouponCode("");
    setCouponError("");
    setVerifiedCoupon(null);
    setCouponLoading(false);
  };

  const openOrderSummary = (selectedPlan: any) => {
    setOrder(selectedPlan);
    resetCouponState();
    setShowOrder(true);
  };

  const closeOrderSummary = () => {
    setShowOrder(false);
    resetCouponState();
    setUseRedeemedPoints(false);
  };

  const closePaymentModal = () => {
    const shouldCloseOrderSummary = showPaymentStatus;
    setShowPayment(false);
    if (shouldCloseOrderSummary) {
      closeOrderSummary();
      navigation.navigate("BottomBar", { screen: "Home", params: { fromPaymentSuccess: true } });
    }
  };

  const planAmount = Number(
    order.discountApplicable
      ? order.prices.discountPrice
      : order.prices.price
  );

  const mrp = Number(order.prices?.price || planAmount);
  const planOffer = Number(order.prices?.offer || (mrp > planAmount ? Math.round(((mrp - planAmount) / mrp) * 100) : 0));
  const hasPlanDiscount = mrp > planAmount;

  const couponDiscountPercentage = (couponChecked && verifiedCoupon)
    ? (Number(verifiedCoupon.discountAmount) / Number(verifiedCoupon.originalAmount || mrp || 1))
    : 0;

  const couponDiscountValue = (couponChecked && verifiedCoupon)
    ? (verifiedCoupon.discountAmount !== undefined
        ? Number(verifiedCoupon.discountAmount)
        : Math.round(mrp * couponDiscountPercentage * 100) / 100)
    : 0;

  const rewardPercentage = Number(userData?.availableDiscountPercentage || 0);
  const rewardPercentageUsed = Math.min(rewardPercentage, 50);
  const rewardDiscountValue = (useRedeemedPoints && rewardPercentageUsed > 0)
    ? Math.round(mrp * (rewardPercentageUsed / 100) * 100) / 100
    : 0;

  const effectiveCouponDiscount = couponChecked ? couponDiscountValue : 0;
  const effectiveRewardDiscount = useRedeemedPoints ? rewardDiscountValue : 0;
  const totalDiscount = Math.min(planAmount, Math.round((effectiveCouponDiscount + effectiveRewardDiscount) * 100) / 100);
  const subTotal = Math.max(0, Math.round((planAmount - totalDiscount) * 100) / 100);
  const gstRate = Number(order.gst || 18);
  const gstPrice = subTotal > 0 ? Math.round(subTotal * (gstRate / 100) * 100) / 100 : 0;
  const finalPayableAmount = Math.max(0, Math.round((subTotal + gstPrice) * 100) / 100);
  const displayTotalAmount = subTotal + gstPrice;

  const verifyCoupon = () => {
    const normalizedCouponCode = couponCode.trim().toUpperCase();

    if (!normalizedCouponCode) {
      setCouponError("Enter a coupon code");
      setVerifiedCoupon(null);
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    axiosInstance
      .post("authentication/coupon/verify", {
        planId: order._id,
        couponCode: normalizedCouponCode } )
      .then((res) => {
        setVerifiedCoupon(res.data);
        setCouponCode(res.data?.couponCode || normalizedCouponCode);
      })
      .catch((err) => {
        setVerifiedCoupon(null);
        setCouponError(getErrorMessage(err?.response?.data));
      })
      .finally(() => {
        setCouponLoading(false);
      });
  };

  const resolvePaymentActivation = async (): Promise<boolean> => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        const [userRes, planRes] = await Promise.allSettled([
          axiosInstance.get("authentication/user"),
          axiosInstance.get("authentication/plan-status"),
        ]);

        const userPaid =
          userRes.status === "fulfilled" ? !!userRes.value?.data?.planValid : false;
        const planPaid =
          planRes.status === "fulfilled"
            ? !!planRes.value?.data?.planValid || planRes.value?.data?.status === "paid"
            : false;

        if (userRes.status === "fulfilled" && userRes.value?.data) {
          setUserData(userRes.value.data);
        }

        if (userPaid || planPaid) {
          return true;
        }
      } catch (_) {
        // continue retries
      }

      await sleep(900);
    }

    return false;
  };

  const refreshUserAndResolvePaymentStatus = (onResolved?: (isPaid: boolean) => void) => {
    axiosInstance
      .get("authentication/user")
      .then((res) => {
        const latestUser = res?.data;
        if (latestUser) {
          setUserData(latestUser);
          onResolved?.(!!latestUser?.planValid);
        } else {
          onResolved?.(false);
        } })
      .catch(() => {
        onResolved?.(false);
      });
  };

  // Create order API
  const createOrder = (planId: any) => {
    setLoading(true);
    const activeCouponCode = (couponChecked && verifiedCoupon?.couponCode) ? verifiedCoupon.couponCode : undefined;
    axiosInstance
      .post("authentication/create-order", {
        planId,
        couponCode: activeCouponCode,
        useRedeemedPoints: useRedeemedPoints } )
      .then((orderResponse) => {
        const orderData = orderResponse?.data;

        if (orderData && orderData.requiresPayment === false) {
          axiosInstance
            .put("authentication/payment/update", {
              planId,
              couponCode: activeCouponCode,
              useRedeemedPoints: useRedeemedPoints,
              state: userData?.state } )
            .then((res) => {
              const emailSent = !!res?.data?.emailSent;
              const downloadUrl = res?.data?.downloadUrl;

              setLoading(false);
              setShowPayment(true);
              setshowPaymentStatus(true);
              refreshUserAndResolvePaymentStatus();

              // Success modal will be shown by setShowPayment(true) above
              // No additional Alert needed per user request
              })
            .catch((err) => {
              console.log(err);
              setLoading(false);
              setShowPayment(true);
              setshowPaymentStatus(false);
            });

          return;
        }

        if (orderData && orderData.orderId) {
          setShowOrder(false);
          openRazorpay(
            orderData.orderId,
            orderData.key,
            Number(orderData.amount || finalPayableAmount),
            activeCouponCode
          );
        } else {
          setLoading(false);
          setShowPayment(true);
          setshowPaymentStatus(false);
        } })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setShowPayment(true);
        setshowPaymentStatus(false);
      });
  };


  // Start UPI & QR Payment flow
  const startUpiQrPayment = async () => {
    setQrLoading(true);
    setLoading(true);
    try {
      const activeCouponCode = (couponChecked && verifiedCoupon?.couponCode) ? verifiedCoupon.couponCode : undefined;
      const res = await axiosInstance.post("authentication/create-qr-order", {
        planId: order._id,
        couponCode: activeCouponCode,
        useRedeemedPoints: useRedeemedPoints,
      });

      setLoading(false);
      setQrLoading(false);

      if (res?.data) {
        if (!res.data.requiresPayment) {
          // 100% discount or free
          setShowOrder(false);
          setShowPayment(true);
          setshowPaymentStatus(true);
          refreshUserAndResolvePaymentStatus();
          return;
        }

        const effectiveAmount = res.data.amount || finalPayableAmount;
        const formattedAmount = Number(effectiveAmount).toFixed(2);
        // Verified active working UPI ID for Gyrus NEET / Sri Aurobindo Infotech
        const upiId = (res.data.upiId && !res.data.upiId.startsWith('rpy.payto'))
          ? res.data.upiId
          : 'gyrusneet996295.rzp@rxairtel';
        const upiUri = `upi://pay?pa=${upiId}&pn=GYRUSNEET&am=${formattedAmount}&cu=INR`;
        const cleanQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=10&data=${encodeURIComponent(upiUri)}`;

        setQrOrderData({
          orderId: res.data.orderId,
          virtualAccountId: res.data.virtualAccountId,
          upiId: upiId,
          upiIntentUri: upiUri,
          qrCodeId: res.data.qrCodeId,
          paymentLinkId: res.data.paymentLinkId,
          paymentUrl: res.data.paymentUrl,
          qrImageUrl: cleanQrUrl,
          amount: effectiveAmount,
          planName: res.data.planName || (order as any)?.name || "Plan",
        });

        setShowOrder(false);
        if (res.data.paymentUrl) {
          setInAppWebPaymentUrl(res.data.paymentUrl);
        } else {
          setShowQrModal(true);
        }
        setQrPolling(true);
      }
    } catch (err: any) {
      console.error("Failed to generate UPI QR order", err);
      setLoading(false);
      setQrLoading(false);
      Alert.alert(
        "UPI Payment Issue",
        err?.response?.data?.message || "Failed to initialize UPI QR payment. Please try again or pay with cards/netbanking."
      );
    }
  };

  // Manual payment status check for QR flow
  const checkPaymentStatusManually = async () => {
    if (!qrOrderData) return;
    setVerifyingStatus(true);
    try {
      const res = await axiosInstance.get("authentication/check-payment-status", {
        params: {
          virtualAccountId: qrOrderData.virtualAccountId,
          orderId: qrOrderData.orderId,
          qrCodeId: qrOrderData.qrCodeId,
          paymentLinkId: qrOrderData.paymentLinkId,
          planId: order._id,
          couponCode: verifiedCoupon?.couponCode || undefined,
          useRedeemedPoints: useRedeemedPoints,
        },
      });

      setVerifyingStatus(false);
      if (res?.data?.paid) {
        setQrPolling(false);
        setShowQrModal(false);
        setShowPayment(true);
        setshowPaymentStatus(true);
        refreshUserAndResolvePaymentStatus();
      } else {
        Alert.alert(
          "Payment Pending",
          "We haven't received confirmation for this payment yet. If you have already paid, it may take a few seconds to update. Please check again shortly."
        );
      }
    } catch (err) {
      setVerifyingStatus(false);
      Alert.alert("Status Check", "Could not check payment status at this moment. Please try again.");
    }
  };

  const qrCardViewShotRef = React.useRef<any>(null);
  const [isSharingQr, setIsSharingQr] = useState(false);

  const handleShareQrWithUpi = async () => {
    if (isSharingQr) return;
    setIsSharingQr(true);

    const upiMessage = qrOrderData?.upiId
      ? `Pay \u20B9${qrOrderData.amount ?? finalPayableAmount} to Gyrus NEET via UPI ID: ${qrOrderData.upiId}`
      : `Payment for Gyrus NEET: \u20B9${qrOrderData?.amount ?? finalPayableAmount}`;

    try {
      let imageUri: string | null = null;

      // 1. Capture the QR card containing QR code, plan amount, and UPI ID
      if (qrCardViewShotRef.current?.capture) {
        try {
          imageUri = await qrCardViewShotRef.current.capture();
        } catch (captureErr) {
          console.warn("[Plans] ViewShot capture error:", captureErr);
        }
      }

      // 2. Share the captured image file containing QR and UPI ID
      if (imageUri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(imageUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Gyrus NEET QR Code & UPI ID',
        });
      } else {
        await Share.share({ message: upiMessage });
      }
    } catch (err) {
      console.error("[Plans] Failed to share QR with UPI:", err);
      try {
        await Share.share({ message: upiMessage });
      } catch (_) {}
    } finally {
      setIsSharingQr(false);
    }
  };

  const closeQrModal = () => {
    setQrPolling(false);
    setShowQrModal(false);
    setCopiedUpi(false);
  };

  // Auto-polling for UPI / QR payment
  useEffect(() => {
    if ((!showQrModal && !inAppWebPaymentUrl) || !qrPolling || !qrOrderData) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get("authentication/check-payment-status", {
          params: {
            virtualAccountId: qrOrderData.virtualAccountId,
            orderId: qrOrderData.orderId,
            qrCodeId: qrOrderData.qrCodeId,
            paymentLinkId: qrOrderData.paymentLinkId,
            planId: order._id,
            couponCode: verifiedCoupon?.couponCode || undefined,
            useRedeemedPoints: useRedeemedPoints,
          },
        });

        if (isMounted && res?.data?.paid) {
          clearInterval(interval);
          setQrPolling(false);
          setShowQrModal(false);
          setInAppWebPaymentUrl(null);
          setShowPayment(true);
          setshowPaymentStatus(true);
          refreshUserAndResolvePaymentStatus();
        }
      } catch (err) {
        // silent catch during polling
      }
    }, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showQrModal, inAppWebPaymentUrl, qrPolling, qrOrderData, order._id, verifiedCoupon?.couponCode, useRedeemedPoints]);

  // Open Razorpay Checkout
  const openRazorpay = async (
    orderId: any,
    keyFromOrder?: string,
    payableOverride?: number,
    appliedCouponCode?: string
  ) => {
    const hasCheckoutModule = !!(NativeModules as any)?.RNRazorpayCheckout;
    const canCallOpen = typeof (RazorpayCheckout as any)?.open === "function";
    const razorpayNativeOk = hasCheckoutModule && canCallOpen;

    if (!razorpayNativeOk) {
      const nativeModuleKeys = Object.keys(NativeModules || {});
      console.error("Razorpay native module is unavailable", {
        hasCheckoutModule,
        canCallOpen,
        razorpayRelatedNativeModules: nativeModuleKeys.filter((name) => /razorpay/i.test(name)) } );
      setLoading(false);
      setShowPayment(true);
      setshowPaymentStatus(false);
      Alert.alert(
        "Payment setup issue",
        "Razorpay native module is not available in this build. Please run the app using a development build (not Expo Go) and try again."
      );
      return;
    }

    let razorpayKey = keyFromOrder || userData?.key;
    if (!razorpayKey) {
      try {
        const userRes = await axiosInstance.get("authentication/user");
        razorpayKey = userRes?.data?.key;
      } catch (err) {
        console.log("Unable to fetch user key", err);
      }
    }

    if (!razorpayKey) {
      console.error("Razorpay key missing from app context and backend response");
      setLoading(false);
      setShowPayment(true);
      setshowPaymentStatus(false);
      return;
    }

    const amountInPaise = Math.round(Number(payableOverride ?? finalPayableAmount) * 100);

    const options: any = {
      key: razorpayKey,
      amount: amountInPaise,
      currency: "INR",
      name: "Gyrus NEET",
      description: "Payment for Order",
      image: logo,
      order_id: orderId,
      prefill: {
        email: userData?.email || "",
        contact: userData?.phoneNo || "",
        name: ((userData?.firstName || "") + " " + (userData?.lastName || "")).trim(),
      },
      theme: {
        color: "rgba(2, 134, 134, 1)",
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: "Pay via UPI / QR",
              instruments: [
                {
                  method: "upi",
                  flows: ["qr", "collect", "intent"],
                  apps: ["google_pay", "phonepe", "paytm", "bhim", "cred"],
                },
              ],
            },
            other: {
              name: "Cards, Netbanking & Wallets",
              instruments: [
                { method: "card" },
                { method: "netbanking" },
                { method: "wallet" },
                { method: "emi" },
              ],
            },
          },
          sequence: ["block.upi", "block.other"],
          preferences: {
            show_default_blocks: true,
          },
        },
      },
    };



    try {
      const checkoutPromise = RazorpayCheckout.open(options);

      checkoutPromise.then((paymentData: any) => {
        axiosInstance
          .put("authentication/payment/update", {
            planId: order._id,
            couponCode: appliedCouponCode,
            useRedeemedPoints: useRedeemedPoints,
            state: userData?.state,
            razorpay_payment_id: paymentData?.razorpay_payment_id,
            razorpay_order_id: paymentData?.razorpay_order_id,
            razorpay_signature: paymentData?.razorpay_signature } )
          .then((res) => {
            // If server accepted payment update, show success immediately.
            setShowPayment(true);
            setshowPaymentStatus(true);
            refreshUserAndResolvePaymentStatus();

            // Success modal will be shown by setShowPayment(true) above
            // No additional Alert needed per user request
            })
          .catch(async () => {
            // Fallback: payment may already be captured and user updated by backend/webhook.
            const isPaid = await resolvePaymentActivation();
            setShowPayment(true);
            setshowPaymentStatus(isPaid);

            if (!isPaid) {
              Alert.alert(
                "Payment pending",
                "Payment completed on Razorpay, but activation is still processing. Please wait and try again."
              );
            }
          });

        setLoading(false);
      }).catch((error: any) => {
        console.error("Razorpay checkout failed", error);
        setLoading(false);
        setShowPayment(true);
        setshowPaymentStatus(false);
      });
    } catch (error) {
      console.error("Razorpay checkout threw synchronously", error);
      setLoading(false);
      setShowPayment(true);
      setshowPaymentStatus(false);
      Alert.alert(
        "Payment setup issue",
        "Razorpay checkout is not available in this build. Please reinstall a development build and try again."
      );
    }
  };

  // Fetch Plans
  useEffect(() => {
    axiosInstance
      .get("authentication/plans")
      .then((res) => {
        if (res && res.data) {
          const sorted = [...(res.data || [])].sort((a: any, b: any) => {
            const orderA = a.order !== undefined && a.order !== null ? Number(a.order) : 999;
            const orderB = b.order !== undefined && b.order !== null ? Number(b.order) : 999;
            return orderA - orderB;
          });
          setPlans(sorted);
        }
      })
      .catch(() => {
        // if (err.status == 401) {
        //   navigation.navigate("Login");
        // }
      });
  }, []);

  // Close button navigation
  const Navigate = () => {
    navigation.navigate("BottomBar", { screen: "Home" });
  };

  return (
    <LinearGradient
      colors={[
        Theme.COLORS.one,
        Theme.COLORS.two,
        Theme.COLORS.four,
        Theme.COLORS.five,
      ]}
            style={styles.container}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View
        style={{
          flex: 1,
          paddingTop: Top,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left } }
      >
        {/* Header Bar with Screen Title & Close Button */}
        <View style={styles.plansHeaderBar}>
          <View style={styles.plansHeaderLeft}>
            <Text style={styles.plansHeaderTitle}>Subscription Plans</Text>
          </View>
          <TouchableOpacity
            style={styles.plansCloseButton}
            onPress={Navigate}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <FontAwesomeIcon icon={faCircleXmark} size={wp(7.5)} color="rgba(255, 255, 255, 0.85)" />
          </TouchableOpacity>
        </View>

        {/* Plans List */}
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.plansScrollContainer}
            showsVerticalScrollIndicator={false}
            style={{ width: "100%" }}
          >
            {plans.map((data: any, index: number) => {
              const planId = String(data._id || index);
              const isExpanded = !!expandedPlanIds[planId];

              return (
                <View
                  key={planId}
                  style={styles.modernCardContainer}
                >
                  {/* Plan Header: Image + Bold Name + Duration Badge */}
                  <View style={styles.planCardHeader}>
                    <View style={styles.planIconWrapper}>
                      <Image
                        source={{ uri: data.img }}
                        style={styles.planIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.planTitleCol}>
                      <Text style={styles.planNameBold}>
                        {data.name || data.title}
                      </Text>
                      <Text style={styles.planSubtitle} numberOfLines={1}>
                        {data.title || `${data.days} Days Access`}
                      </Text>
                    </View>
                    <View style={styles.planHeaderRightCol}>
                      <TouchableOpacity
                        style={styles.planDurationPill}
                        onPress={() => togglePlanExpand(planId)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 6, bottom: 2, left: 6, right: 6 }}
                      >
                        <FontAwesomeIcon icon={faClock} size={11} color="#0AB8AD" />
                        <Text style={styles.planDurationPillText}>{data.days} Days</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.moreDetailsBtn}
                        onPress={() => togglePlanExpand(planId)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 4, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.moreDetailsText}>
                          {isExpanded ? "Less details" : "More details"}
                        </Text>
                        <FontAwesomeIcon
                          icon={isExpanded ? faChevronUp : faChevronRight}
                          size={9}
                          color="#0AB8AD"
                          style={{ marginLeft: 4 }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Price Section */}
                  <View style={styles.planPriceSection}>
                    <View style={styles.planPriceLeft}>
                      <View style={styles.planPriceRow}>
                        <Text style={styles.planCurrencySymbol}>₹</Text>
                        <Text style={styles.planMainPrice}>
                          {data.discountApplicable
                            ? data.prices.discountPrice
                            : data.prices.price}
                        </Text>
                        <Text style={styles.planGstText}>+ GST</Text>
                        {data.discountApplicable && (
                          <>
                            <Text style={styles.planOriginalPrice}>
                              ₹{data.prices.price}
                            </Text>
                            <View style={styles.planDiscountBadge}>
                              <Text style={styles.planDiscountText}>
                                {data.prices.offer}% OFF
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                      <Text style={styles.planBilledNote}>
                        One-time payment • Full access for {data.days} days
                      </Text>
                    </View>
                  </View>

                  {/* Expanded Small Card View with Complete Details strictly from DB & Subscribe Button */}
                  {isExpanded && (
                    <View style={styles.detailsCardView}>
                      <View style={styles.detailsCardHeader}>
                        <View style={styles.detailsCardHeaderLeft}>
                          <Text style={styles.detailsCardHeaderTitle}>
                            {data.name || 'Plan Details'}
                          </Text>
                          {data.title ? (
                            <Text style={styles.detailsCardHeaderSubtitle}>
                              {data.title}
                            </Text>
                          ) : null}
                        </View>
                        <View style={styles.detailsDaysTag}>
                          <Text style={styles.detailsDaysTagText}>{data.days} Days</Text>
                        </View>
                      </View>

                      {/* Items strictly from backend database desc ONLY */}
                      {data.desc && data.desc.length > 0 ? (
                        <View style={styles.dbDescContainer}>
                          {data.desc.map((descItem: any, i: number) => {
                            const descText =
                              typeof descItem === 'string'
                                ? descItem
                                : descItem?.desc || '';
                            if (!descText) return null;
                            return (
                              <View key={i} style={styles.dbDescItem}>
                                <View style={styles.dbCheckCircle}>
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    size={10}
                                    color="#10B981"
                                  />
                                </View>
                                <Text style={styles.dbDescText}>{descText}</Text>
                              </View>
                            );
                          })}
                        </View>
                      ) : null}

                      {/* Subscribe Button inside the Details Card */}
                      <TouchableOpacity
                        style={styles.detailsSubscribeBtn}
                        onPress={() => openOrderSummary(data)}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={['#22E2D6', '#15BBB1', '#0D7F78']}
                          locations={[0, 0.4, 1]}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={styles.modernSubscribeBtnGradient}
                        >
                          <Text style={styles.modernSubscribeBtnText}>
                            Subscribe to {data.name || 'Plan'}
                          </Text>
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            size={14}
                            color="#FFFFFF"
                            style={{ marginLeft: 8 }}
                          />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Collapsed Subscribe Button (shown when not expanded) */}
                  {!isExpanded && (
                    <TouchableOpacity
                      style={styles.modernSubscribeBtn}
                      onPress={() => openOrderSummary(data)}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#22E2D6', '#15BBB1', '#0D7F78']}
                        locations={[0, 0.4, 1]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.modernSubscribeBtnGradient}
                      >
                        <Text style={styles.modernSubscribeBtnText}>
                          Subscribe to {data.name || 'Plan'}
                        </Text>
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          size={14}
                          color="#FFFFFF"
                          style={{ marginLeft: 8 }}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

              {/* Order Summary Modal */}
              <Modal
                isOpen={showOrder}
                onClose={closeOrderSummary}
              >
                <Modal.Content
                  maxWidth="304"
                  maxH="420"
                  style={{
                    backgroundColor: "#FFF" } }
                >
                  <Modal.CloseButton style={{ padding: 9 }} />
                  <Modal.Header
                    style={{
                      backgroundColor: "transparent",
                      paddingBottom: hp(2) } }
                  >
                    <View style={styles.emojiContainer}>
                      <Text>Order Summary</Text>
                    </View>
                  </Modal.Header>
                  <Modal.Body style={{ marginVertical: wp(2) }}>
                    {/* 1. Plan Price(MRP) */}
                    <View style={styles.orderSummaryRow}>
                      <Text style={styles.orderSummaryLabel}>Plan Price (MRP)</Text>
                      <Text
                        style={[
                          styles.orderSummaryValue,
                          hasPlanDiscount ? styles.orderSummaryStrikethrough : null,
                        ]}
                      >
                        {"\u20B9"} {hasPlanDiscount ? mrp : planAmount}
                      </Text>
                    </View>

                    {/* 2. Discounted Price(xx%) */}
                    {hasPlanDiscount && (
                      <View style={styles.orderSummaryRow}>
                        <Text style={styles.orderSummaryLabel}>
                          Discounted Price {planOffer > 0 ? `(-${planOffer}%)` : ""}
                        </Text>
                        <Text style={styles.orderSummaryValue}>
                          {"\u20B9"} {planAmount}
                        </Text>
                      </View>
                    )}

                    {/* 3. Coupon Discount - only show when apply coupon check box is selected */}
                    {couponChecked && (
                      <View style={styles.orderSummaryRow}>
                        <Text style={styles.orderSummaryLabel}>Coupon Discount</Text>
                        <Text
                          style={[
                            styles.orderSummaryValue,
                            couponDiscountValue > 0 ? { color: "#028464", fontWeight: "600" } : null,
                          ]}
                        >
                          {couponDiscountValue > 0 ? `- \u20B9 ${couponDiscountValue}` : `\u20B9 0`}
                        </Text>
                      </View>
                    )}

                    {/* Reward Discount if applied */}
                    {rewardDiscountValue > 0 && (
                      <View style={styles.orderSummaryRow}>
                        <Text style={styles.orderSummaryLabel}>Reward Discount</Text>
                        <Text style={[styles.orderSummaryValue, { color: "#028464", fontWeight: "600" }]}>
                          {`- \u20B9 ${rewardDiscountValue}`}
                        </Text>
                      </View>
                    )}

                    {/* Divider 1 */}
                    <View style={styles.orderSummaryDashedLine} />

                    {/* 4. Sub Total */}
                    <View style={styles.orderSummaryRow}>
                      <Text style={styles.orderSummaryLabel}>Sub Total</Text>
                      <Text style={styles.orderSummaryValue}>
                        {"\u20B9"} {subTotal}
                      </Text>
                    </View>

                    {/* 5. GST(18%) */}
                    <View style={styles.orderSummaryRow}>
                      <Text style={styles.orderSummaryLabel}>GST({order.gst || 18}%)</Text>
                      <Text style={styles.orderSummaryValue}>
                        {"\u20B9"} {gstPrice}
                      </Text>
                    </View>

                    {/* Divider 2 */}
                    <View style={styles.orderSummaryDashedLine} />

                    {/* 6. Final Price */}
                    <View style={styles.orderSummaryRow}>
                      <Text style={styles.orderSummaryFinalLabel}>Final Price</Text>
                      <Text style={styles.orderSummaryFinalValue}>
                        {"\u20B9"} {finalPayableAmount}
                      </Text>
                    </View>

                    {/* Divider 3 */}
                    <View style={styles.orderSummaryDashedLine} />

                    {/* Reward Discount Selector Row */}
                    {rewardPercentage > 0 && (
                      <TouchableOpacity 
                        onPress={() => {
                          const nextVal = !useRedeemedPoints;
                          setUseRedeemedPoints(nextVal);
                          if (nextVal) {
                            setCouponChecked(false);
                            setCouponCode("");
                            setCouponError("");
                            setVerifiedCoupon(null);
                            setCouponLoading(false);
                          }
                        }}
                        style={styles.rewardCheckboxContainer}
                      >
                        <View style={[styles.rewardCheckbox, useRedeemedPoints && styles.rewardCheckboxActive]}>
                          {useRedeemedPoints && <FontAwesomeIcon icon={faCircleCheck} size={14} color="#FFF" />}
                        </View>
                        <Text style={styles.rewardCheckboxLabel}>
                          Use {rewardPercentageUsed}% Reward Discount (-{"\u20B9"}{rewardDiscountValue})
                        </Text>
                      </TouchableOpacity>
                    )}
                    <View style={styles.couponContainer}>
                      <TouchableOpacity
                        style={styles.couponToggleRow}
                        onPress={() => {
                          const nextChecked = !couponChecked;
                          setCouponChecked(nextChecked);

                          if (nextChecked) {
                            setUseRedeemedPoints(false);
                          } else {
                            setCouponCode("");
                            setCouponError("");
                            setVerifiedCoupon(null);
                            setCouponLoading(false);
                          }
                        }}
                      >
                        <View style={[styles.checkbox, couponChecked && styles.checkboxChecked]}>
                          {couponChecked ? <Text style={styles.checkboxTick}>✓</Text> : null}
                        </View>
                        <Text style={styles.couponLabel}>Apply Coupon</Text>
                      </TouchableOpacity>
                      {couponChecked ? (
                        <>
                          <TextInput
                            placeholder="Enter coupon code"
                            autoCapitalize="characters"
                            value={couponCode}
                            onChangeText={(value) => {
                              setCouponCode(value.toUpperCase());
                              setCouponError("");
                              setVerifiedCoupon(null);
                            }}
            style={styles.couponInput}
                          />
                          <TouchableOpacity
                            style={styles.verifyButton}
                            disabled={couponLoading}
            onPress={verifyCoupon}
                          >
                            <Text style={styles.verifyButtonText}>
                              {couponLoading ? "Verifying..." : "Verify Coupon"}
                            </Text>
                          </TouchableOpacity>
                          {couponError ? <Text style={styles.couponError}>{couponError}</Text> : null}
                          {verifiedCoupon ? (
                            <View style={styles.couponSummary}>
                              <Text style={styles.couponSuccessText}>
                                Coupon {verifiedCoupon.couponCode} applied
                              </Text>
                            </View>
                          ) : null}
                        </>
                      ) : null}
                    </View>
                    <View style={{ alignItems: "center", marginTop: hp(1.5), width: "100%" }}>
                      {/* Primary Option: Pay via UPI / QR Code */}
                      <TouchableOpacity
                        style={styles.upiPayButton}
                        disabled={loading || couponLoading}
                        onPress={startUpiQrPayment}
                      >
                        {loading && qrLoading ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                            <FontAwesomeIcon icon={faQrcode} size={18} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.upiPayButtonText}>Pay via UPI / QR Code</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      <Text style={styles.upiPaySubtext}>
                        Scan QR with GPay, PhonePe, Paytm, or pay via UPI link
                      </Text>

                      {/* Secondary Option: Cards, Netbanking & Wallets */}
                      <TouchableOpacity
                        style={styles.cardPayButton}
                        disabled={loading || couponLoading}
                        onPress={() => createOrder(order._id)}
                      >
                        {loading && !qrLoading ? (
                          <ActivityIndicator size="small" color="#028464" />
                        ) : (
                          <Text style={styles.cardPayButtonText}>Cards, Netbanking & Wallets</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </Modal.Body>
                </Modal.Content>
              </Modal>

              {/* Dedicated UPI & QR Payment Modal */}
              <Modal
                isOpen={showQrModal}
                onClose={closeQrModal}
              >
                <Modal.Content
                  maxWidth="360"
                  style={styles.qrModalContent}
                >
                  <Modal.CloseButton />
                  <Modal.Header style={styles.qrModalHeader}>
                    <Text style={styles.qrModalTitle}>Pay via UPI / QR</Text>                

                    <View style={styles.qrHeaderBadge}>
                      <Text style={styles.qrHeaderBadgePlan}>
                        {qrOrderData?.planName || (order as any)?.name || "Plan"}
                      </Text>
                      <Text style={styles.qrHeaderBadgeDot}>•</Text>
                      <Text style={styles.qrHeaderBadgeAmount}>
                        {"\u20B9"}{qrOrderData?.amount ?? finalPayableAmount}
                      </Text>
                    </View>
                  </Modal.Header>
                  <Modal.Body style={styles.qrModalBody}>
                    <View style={styles.qrModalBodyContent}>
                    {/* QR Code Image Container */}
                    {qrLoading ? (
                      <View style={styles.qrLoadingBox}>
                        <ActivityIndicator size="large" color="#028464" />
                        <Text style={styles.qrLoadingText}>Generating UPI QR Code...</Text>
                      </View>
                    ) : (
                      <ViewShot
                        ref={qrCardViewShotRef}
                        options={{ format: 'png', quality: 1.0 }}
                        style={styles.qrCardContainer}
                      >
                        <View style={styles.qrCardHeaderRow}>
                          <Text style={styles.qrCardHeaderTitle}>
                            {qrOrderData?.planName || (order as any)?.name || "Gyrus NEET"}
                          </Text>
                          <Text style={styles.qrCardHeaderAmount}>
                            {"\u20B9"}{qrOrderData?.amount ?? finalPayableAmount}
                          </Text>
                        </View>

                        <View style={styles.qrImageWrapper}>
                          {qrOrderData?.qrImageUrl ? (
                            <Image
                              source={{ uri: qrOrderData.qrImageUrl }}
                              style={styles.qrImage}
                              resizeMode="contain"
                            />
                          ) : (
                            <View style={[styles.qrImage, { alignItems: 'center', justifyContent: 'center' }]}>
                              <ActivityIndicator size="small" color="#028464" />
                              <Text style={[styles.qrLoadingText, { marginTop: 6 }]}>Loading QR...</Text>
                            </View>
                          )}
                        </View>

                        {/* Supported Apps Row under QR */}
                        <View style={styles.qrSupportedAppsContainer}>
                          <Text style={styles.qrSupportedAppsTitle}>Scan with any UPI app</Text>
                          <View style={styles.qrIconsRow}>
                            <View style={styles.appIconPill}><GPayIcon size={20} /></View>
                            <View style={styles.appIconPill}><PhonePeIcon size={20} /></View>
                            <View style={styles.appIconPill}><PaytmIcon size={20} /></View>
                            <View style={styles.appIconPill}><BhimIcon size={20} /></View>
                            <View style={styles.appIconPill}><CredIcon size={20} /></View>
                          </View>
                        </View>

                        {/* Payee UPI ID display embedded in the card */}
                        {qrOrderData?.upiId ? (
                          <View style={styles.qrCardUpiPill}>
                            <Text style={styles.qrCardUpiPillLabel}>UPI ID:</Text>
                            <Text style={styles.qrCardUpiPillValue} numberOfLines={1} ellipsizeMode="middle">
                              {qrOrderData.upiId}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.qrCardUpiPill}>
                            <Text style={styles.qrCardUpiPillLabel}>SECURE:</Text>
                            <Text style={styles.qrCardUpiPillValue}>Razorpay Verified UPI</Text>
                          </View>
                        )}
                      </ViewShot>
                    )}

                    {/* Direct on-device UPI pay button with Brand Badges */}
                    <TouchableOpacity
                      style={styles.qrPrimaryPayBtn}
                      onPress={() => {
                        setShowQrModal(false);
                        setQrPolling(false);
                        createOrder(order._id);
                      }}
                    >
                      <View style={styles.qrPrimaryPayLeft}>
                        <FontAwesomeIcon icon={faBolt} size={15} color="#FFF" />
                        <Text style={styles.qrPrimaryPayBtnText}>Pay with UPI App (GPay / PhonePe / Paytm)</Text>
                      </View>
                      <View style={styles.qrPrimaryPayIcons}>
                        <View style={styles.miniIconBadge}><GPayIcon size={16} /></View>
                        <View style={[styles.miniIconBadge, { marginLeft: -5 }]}><PhonePeIcon size={16} /></View>
                        <View style={[styles.miniIconBadge, { marginLeft: -5 }]}><PaytmIcon size={16} /></View>
                      </View>
                    </TouchableOpacity>

                    {/* Payee UPI ID display with integrated Copy and Share */}
                    {qrOrderData?.upiId ? (
                      <View style={styles.qrUpiIdBar}>
                        <View style={styles.qrUpiIdLeft}>
                          <Text style={styles.qrUpiIdLabel}>PAYEE UPI ID</Text>
                          <Text style={styles.qrUpiIdValue} numberOfLines={1} ellipsizeMode="middle">
                            {qrOrderData.upiId}
                          </Text>
                        </View>
                        <View style={styles.qrUpiActionsGroup}>
                          <TouchableOpacity
                            style={styles.qrActionChip}
                            onPress={async () => {
                              const upi = qrOrderData?.upiId || '';
                              let copied = false;
                              try {
                                const RNCClipboard = (NativeModules as any)?.RNCClipboard;
                                if (RNCClipboard?.setString) {
                                  RNCClipboard.setString(upi);
                                  copied = true;
                                }
                              } catch (_) {}
                              if (!copied) {
                                try {
                                  if (Share?.share) {
                                    await Share.share({ message: upi });
                                  }
                                } catch (_) {}
                              }
                              setCopiedUpi(true);
                              setTimeout(() => setCopiedUpi(false), 2000);
                            }}
                          >
                            <FontAwesomeIcon icon={copiedUpi ? faCircleCheck : faCopy} size={11} color="#028464" />
                            <Text style={styles.qrActionChipText}>{copiedUpi ? "Copied" : "Copy"}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.qrActionChip}
                            disabled={isSharingQr}
                            onPress={handleShareQrWithUpi}
                          >
                            {isSharingQr ? (
                              <ActivityIndicator size="small" color="#028464" />
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faShareNodes} size={11} color="#028464" />
                                <Text style={styles.qrActionChipText}>Share</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.qrUpiIdBar}>
                        <View style={styles.qrUpiIdLeft}>
                          <Text style={styles.qrUpiIdLabel}>PAYMENT METHOD</Text>
                          <Text style={styles.qrUpiIdValue} numberOfLines={1}>
                            Razorpay Verified UPI
                          </Text>
                        </View>
                        <View style={styles.qrUpiActionsGroup}>
                          <TouchableOpacity
                            style={styles.qrActionChip}
                            disabled={isSharingQr}
                            onPress={handleShareQrWithUpi}
                          >
                            {isSharingQr ? (
                              <ActivityIndicator size="small" color="#028464" />
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faShareNodes} size={11} color="#028464" />
                                <Text style={styles.qrActionChipText}>Share QR</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Live Polling Status */}
                    <View style={styles.qrLiveStatusPill}>
                      <ActivityIndicator size="small" color="#028464" />
                      <Text style={styles.qrLiveStatusText}>Waiting for payment confirmation...</Text>
                    </View>

                    {/* Secondary Actions in 2-Column Row */}
                    <View style={styles.qrBottomActionsRow}>
                      <TouchableOpacity
                        style={styles.qrVerifyColBtn}
                        disabled={verifyingStatus}
                        onPress={checkPaymentStatusManually}
                      >
                        <Text style={styles.qrVerifyColText}>
                          {verifyingStatus ? "Checking..." : "I Have Paid \u2022 Verify"}
                        </Text>
                      </TouchableOpacity>

                      {order?._id ? (
                        <TouchableOpacity
                          style={styles.qrInAppColBtn}
                          onPress={() => {
                            setShowQrModal(false);
                            setQrPolling(false);
                            createOrder(order._id);
                          }}
                        >
                          <FontAwesomeIcon icon={faBolt} size={12} color="#028464" />
                          <Text style={styles.qrInAppColText}>Pay in App</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    {/* Fallback to Cards / Netbanking */}
                    <TouchableOpacity
                      style={styles.qrSwitchBtn}
                      onPress={() => {
                        setShowQrModal(false);
                        setQrPolling(false);
                        createOrder(order._id);
                      }}
                    >
                      <Text style={styles.qrSwitchText}>Pay with Cards / Netbanking instead</Text>
                    </TouchableOpacity>
                    </View>
                  </Modal.Body>
                </Modal.Content>
              </Modal>

              {/* In-App Razorpay Checkout Modal (shows QR & UPI entering field inside app) */}
              <Modal
                isOpen={!!inAppWebPaymentUrl}
                onClose={() => {
                  setInAppWebPaymentUrl(null);
                  setQrPolling(false);
                }}
                size="full"
              >
                <Modal.Content style={styles.webViewModalContent}>
                  <Modal.CloseButton />
                  <Modal.Header style={styles.webViewModalHeader}>
                    <Text style={styles.webViewModalTitle}>Gyrus NEET Secure Payment</Text>
                  </Modal.Header>
                  <Modal.Body style={styles.webViewModalBody} p={0}>
                    {inAppWebPaymentUrl ? (
                      <WebView
                        source={{ uri: inAppWebPaymentUrl }}
                        originWhitelist={['https://*', 'http://*', 'upi://*', 'intent://*']}
                        onShouldStartLoadWithRequest={(event) => {
                          const { url } = event;
                          if (
                            url.startsWith('upi://') ||
                            url.startsWith('intent://') ||
                            url.startsWith('gpay://') ||
                            url.startsWith('phonepe://') ||
                            url.startsWith('paytmmp://')
                          ) {
                            let targetUrl = url;
                            if (url.startsWith('intent://')) {
                              const upiMatch = url.match(/intent:\/\/pay\?(.*?)#Intent/);
                              if (upiMatch && upiMatch[1]) {
                                targetUrl = `upi://pay?${upiMatch[1]}`;
                              }
                            }
                            Linking.openURL(targetUrl).catch((e) => console.log('Could not open UPI url', e));
                            return false;
                          }
                          if (
                            url.includes('payment_id') ||
                            url.includes('payment/success') ||
                            url.includes('payment-status') ||
                            url.includes('payment.success') ||
                            url.includes('status=paid')
                          ) {
                            setInAppWebPaymentUrl(null);
                            setQrPolling(false);
                            setShowPayment(true);
                            setshowPaymentStatus(true);
                            refreshUserAndResolvePaymentStatus();
                            return false;
                          }
                          return true;
                        }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        renderLoading={() => (
                          <View style={styles.webViewLoading}>
                            <ActivityIndicator size="large" color="#028464" />
                            <Text style={styles.webViewLoadingText}>
                              Loading Razorpay Checkout...
                            </Text>
                          </View>
                        )}
                        style={styles.webViewStyle}
                      />
                    ) : null}
                  </Modal.Body>
                </Modal.Content>
              </Modal>

              {/* Payment Status Modal */}
              <Modal
                isOpen={showPayment}
                onClose={closePaymentModal}
              >
                <Modal.Content
                  maxWidth="340"
                  style={styles.paymentModalContent}
                >
                  <Modal.Body>
                    <LinearGradient
                      colors={
                        showPaymentStatus
                          ? ["#E7FBF4", "#F7FFFC"]
                          : ["#FFF1F0", "#FFF9F8"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
            style={styles.paymentStatusCard}
                    >
                      <View
                        style={[
                          styles.paymentStatusIconWrap,
                          showPaymentStatus
                            ? styles.paymentSuccessIconWrap
                            : styles.paymentFailureIconWrap,
                        ]}
                      >
                        <FontAwesomeIcon
                          icon={showPaymentStatus ? faCircleCheck : faTriangleExclamation}
                          size={wp(10)}
                          color={showPaymentStatus ? Theme.COLORS.success01 : Theme.COLORS.error01}
                        />
                      </View>
                      <Text style={styles.paymentStatusTitle}>
                        {showPaymentStatus ? "Payment Successful" : "Payment Failed"}
                      </Text>
                      <Text style={styles.paymentStatusSubtitle}>
                        {showPaymentStatus
                          ? "Your plan has been activated successfully. You can continue using the app now."
                          : "We could not complete the payment. Please try again or use a different payment method."}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.paymentStatusButton,
                          showPaymentStatus
                            ? styles.paymentSuccessButton
                            : styles.paymentFailureButton,
                        ]}
            onPress={closePaymentModal}
                      >
                        <Text style={styles.paymentStatusButtonText}>
                          {showPaymentStatus ? "Continue" : "Try Again"}
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </Modal.Body>
                </Modal.Content>
              </Modal>

            </ScrollView>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const styles = StyleSheet.create({
  plansHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: wp(92),
    alignSelf: 'center',
    marginTop: hp(1),
    marginBottom: hp(1.5),
  },
  plansHeaderLeft: {
    flex: 1,
    marginRight: wp(3),
  },
  plansHeaderTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(8),
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  plansHeaderSubtitle: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.1),
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 3,
    lineHeight: wp(4.5),
  },
  plansCloseButton: {
    padding: 4,
  },
  plansScrollContainer: {
    alignItems: 'center',
    paddingBottom: hp(8),
    paddingHorizontal: wp(2),
  },
  modernCardContainer: {
    width: wp(92),
    backgroundColor: 'rgba(11, 73, 55, 0.55)',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(10, 184, 173, 0.4)',
    padding: wp(4.5),
    marginVertical: hp(1.2),
    overflow: 'hidden',
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: hp(1.5),
  },
  planIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
  },
  planIcon: {
    width: 38,
    height: 38,
  },
  planTitleCol: {
    flex: 1,
  },
  planNameBold: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(5.2),
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  planSubtitle: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3),
    color: '#A7F3D0',
    marginTop: 2,
  },
  planHeaderRightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  planDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 184, 173, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(10, 184, 173, 0.5)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  moreDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  moreDetailsText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(2.6),
    color: '#0AB8AD',
    fontWeight: '600',
  },
  planDurationPillText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(2.8),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  planPriceSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 14,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3.5),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  planPriceLeft: {
    width: '100%',
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  planCurrencySymbol: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.8),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  planMainPrice: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(6.8),
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  planGstText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3),
    color: '#94A3B8',
    marginLeft: 5,
  },
  planOriginalPrice: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.8),
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  planDiscountBadge: {
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
    alignSelf: 'center',
  },
  planDiscountText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(2.7),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  planBilledNote: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.7),
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 4,
  },
  detailsCardView: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(10, 184, 173, 0.35)',
    padding: wp(3.5),
    marginBottom: hp(1.5),
  },
  detailsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.2),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: hp(1),
  },
  detailsCardHeaderLeft: {
    flex: 1,
    paddingRight: wp(2),
  },
  detailsCardHeaderTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.6),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  detailsCardHeaderSubtitle: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.7),
    color: '#A7F3D0',
    marginTop: 2,
  },
  detailsDaysTag: {
    backgroundColor: 'rgba(10, 184, 173, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(10, 184, 173, 0.5)',
  },
  detailsDaysTagText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(2.6),
    color: '#E0F2FE',
    fontWeight: '600',
  },
  dbDescContainer: {
    marginBottom: hp(1.5),
  },
  dbDescItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(0.5),
  },
  dbCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  dbDescText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.1),
    color: '#F1F5F9',
    flex: 1,
  },
  detailsSubscribeBtn: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: hp(0.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  modernSubscribeBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  modernSubscribeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  modernSubscribeBtnText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.8),
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center" }, Img: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch" }, cardContainer: {
    borderWidth: wp(0.3),
    borderRadius: wp(2),
    borderColor: "#D3D3D3",
    display: "flex",
    alignItems: "center",
    width: wp(90),
    marginVertical: hp(2),
    padding: wp(4),
    backgroundColor: "rgba(47, 47, 47, 0.4)",
    opacity: 34 }, features: {
     color: "#FFFFFF",
    fontFamily: 'AppFont-Regular', fontSize: wp(4.5),
    marginVertical: hp(2),
    marginHorizontal: wp(3) },
  premimum: {
     color: "#D5D5D5",
    fontFamily: 'AppFont-Regular', fontSize: wp(4) },
  pointsCard: {
    borderColor: "black",
    display: "flex",
    paddingVertical: wp(3),
    width: "80%",
    backgroundColor: "#D9D9D9",
    borderBottomEndRadius: wp(9) }, rateContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    width: "80%" }, totalAmnt: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end" }, emojiContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 15 }, summaryRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: hp(0.5) }, line: {
    height: 1,
    backgroundColor: "#000",
    width: "100%",
    marginVertical: 10 }, couponContainer: {
    marginBottom: hp(1.5) }, couponToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1) }, couponLabel: {
     fontFamily: 'AppFont-Regular', fontSize: wp(3.8),
        color: "#222" },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: Theme.COLORS.one,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(2),
    backgroundColor: "#FFF" }, checkboxChecked: {
    backgroundColor: Theme.COLORS.one }, checkboxTick: {
     color: "#FFF"},
  couponInput: {
    
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 8,
    textAlign: "center",
    alignContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: hp(1) }, verifyButton: {
    backgroundColor: Theme.COLORS.one,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: hp(1) }, verifyButtonText: {
     color: "#FFF",
     fontFamily: 'AppFont-Bold'},
  couponError: {
     color: "#C62828",
    marginBottom: hp(1) },
  couponSummary: {
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    padding: 10 }, couponSuccessText: {
     color: Theme.COLORS.one,
        marginBottom: hp(0.8) },
  paymentModalContent: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0 }, paymentModalCloseButton: {
    padding: 10,
    zIndex: 2 }, paymentStatusCard: {
    borderRadius: 24,
    paddingHorizontal: wp(6),
    paddingTop: hp(3),
    paddingBottom: hp(2.8),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    overflow: "hidden" }, paymentStatusIconWrap: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2) }, paymentSuccessIconWrap: {
    backgroundColor: "rgba(33, 163, 0, 0.12)" }, paymentFailureIconWrap: {
    backgroundColor: "rgba(246, 86, 93, 0.12)" }, paymentStatusTitle: {
     fontFamily: 'AppFont-Bold', fontSize: wp(6),
        color: Theme.COLORS.one,
    marginBottom: hp(1),
    textAlign: "center" },
  paymentStatusSubtitle: {
     fontFamily: 'AppFont-Regular', fontSize: wp(3.8),
    lineHeight: wp(5.4),
    color: Theme.COLORS.grey,
    textAlign: "center",
    marginBottom: hp(2.2) },
  paymentStatusButton: {
    minWidth: wp(38),
    borderRadius: 18,
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(5),
    alignItems: "center" }, paymentSuccessButton: {
    backgroundColor: Theme.COLORS.primary06 }, paymentFailureButton: {
    backgroundColor: Theme.COLORS.error01 }, paymentStatusButtonText: {
     color: "#FFF",
    fontFamily: 'AppFont-Bold', fontSize: wp(4), fontWeight: 'bold' },
  rewardCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  rewardCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#16a34a',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardCheckboxActive: {
    backgroundColor: '#16a34a',
  },
  rewardCheckboxLabel: {
    fontFamily: 'AppFont-Bold',
    fontSize: 13,
    color: '#166534',
    flex: 1,
  },
  upiPayButton: {
    backgroundColor: '#028464',
    borderRadius: 12,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#028464',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  upiPayButtonText: {
    color: '#FFF',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.1),
    fontWeight: 'bold',
  },
  upiPaySubtext: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.9),
    color: '#666',
    marginTop: 4,
    marginBottom: hp(1.2),
    textAlign: 'center',
  },
  cardPayButton: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#028464',
    borderRadius: 12,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(5),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPayButtonText: {
    color: '#028464',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.7),
    fontWeight: '600',
  },
  qrModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: wp(3.5),
    paddingTop: hp(1.5),
    paddingBottom: hp(1.2),
  },
  qrModalHeader: {
    borderBottomWidth: 0,
    paddingBottom: hp(0.5),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection:"column"
  },
  qrModalTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  qrHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  qrHeaderBadgePlan: {
    fontFamily: 'AppFont-Bold',
    textAlign:'center',
    fontSize: wp(3.2),
    color: '#166534',
    fontWeight: '700',
  },
  qrHeaderBadgeDot: {
    color: '#86efac',
    marginHorizontal: 6,
    fontSize: wp(3.2),
  },
  qrHeaderBadgeAmount: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.6),
    color: '#15803d',
    fontWeight: '800',
  },
  qrModalBody: {
    paddingTop: hp(0.5),
    paddingHorizontal: 0,
  },
  qrModalBodyContent: {
    width: '100%',
    alignItems: 'center',
  },
  qrCardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: wp(2.5),
    alignItems: 'center',
    width: '100%',
    marginBottom: hp(1),
  },
  qrCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 6,
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  qrCardHeaderTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.4),
    color: '#0f172a',
    fontWeight: '700',
  },
  qrCardHeaderAmount: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.8),
    color: '#028464',
    fontWeight: '800',
  },
  qrCardUpiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 8,
    width: '100%',
  },
  qrCardUpiPillLabel: {
    fontSize: wp(2.6),
    fontFamily: 'AppFont-Bold',
    color: '#64748b',
    marginRight: 5,
    letterSpacing: 0.4,
  },
  qrCardUpiPillValue: {
    fontSize: wp(2.9),
    fontFamily: 'AppFont-Bold',
    color: '#0f172a',
    fontWeight: '700',
  },
  qrImageWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  qrImage: {
    width: wp(45),
    height: wp(45),
  },
  qrSupportedAppsContainer: {
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  qrSupportedAppsTitle: {
    fontFamily: 'AppFont-Medium',
    fontSize: wp(2.7),
    color: '#64748b',
    marginBottom: 5,
  },
  qrIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appIconPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  qrLoadingBox: {
    width: wp(45),
    height: wp(45),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(1.2),
  },
  qrLoadingText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.2),
    color: '#666',
    marginTop: 8,
  },
  qrPrimaryPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#028464',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: 12,
    width: '100%',
    marginBottom: hp(1),
    shadowColor: '#028464',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  qrPrimaryPayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrPrimaryPayBtnText: {
    color: '#FFF',
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.4),
    marginLeft: 8,
    fontWeight: '700',
  },
  qrPrimaryPayIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniIconBadge: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#028464',
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  qrUpiIdBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    width: '100%',
    marginBottom: hp(1),
  },
  qrUpiIdLeft: {
    flex: 1,
    marginRight: 6,
  },
  qrUpiIdLabel: {
    fontSize: wp(2.3),
    fontFamily: 'AppFont-Bold',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  qrUpiIdValue: {
    fontSize: wp(3),
    fontFamily: 'AppFont-Bold',
    color: '#0f172a',
    fontWeight: '600',
    marginTop: 1,
  },
  qrUpiActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qrActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f4ea',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  qrActionChipText: {
    fontSize: wp(2.7),
    fontFamily: 'AppFont-Bold',
    color: '#028464',
    marginLeft: 4,
    fontWeight: '600',
  },
  qrLiveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: hp(1),
  },
  qrLiveStatusText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.8),
    color: '#64748b',
    marginLeft: 6,
  },
  qrBottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: hp(0.8),
    gap: 8,
  },
  qrVerifyColBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrVerifyColText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3),
    color: '#334155',
    fontWeight: '600',
  },
  qrInAppColBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#028464',
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrInAppColText: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3),
    color: '#028464',
    marginLeft: 5,
    fontWeight: '600',
  },
  qrSwitchBtn: {
    paddingVertical: hp(0.5),
    alignItems: 'center',
  },
  qrSwitchText: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(2.9),
    color: '#028464',
    textDecorationLine: 'underline',
  },
  webViewModalContent: {
    width: '95%',
    height: '92%',
    maxHeight: '92%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  webViewModalHeader: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 12,
  },
  webViewModalTitle: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.8),
    color: '#0f172a',
    fontWeight: '700',
  },
  webViewModalBody: {
    height: hp(75),
    minHeight: hp(75),
    padding: 0,
    backgroundColor: '#fff',
  },
  webViewStyle: {
    width: '100%',
    height: hp(75),
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  webViewLoadingText: {
    marginTop: 10,
    fontFamily: 'AppFont-Medium',
    fontSize: wp(3.2),
    color: '#028464',
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: hp(0.4),
  },
  orderSummaryLabel: {
    fontFamily: 'AppFont-Regular',
    fontSize: wp(3.5),
    color: '#334155',
  },
  orderSummaryValue: {
    fontFamily: 'AppFont-Medium',
    fontSize: wp(3.5),
    color: '#0f172a',
  },
  orderSummaryStrikethrough: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  orderSummaryFinalLabel: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.8),
    color: '#0f172a',
    fontWeight: '700',
  },
  orderSummaryFinalValue: {
    fontFamily: 'AppFont-Bold',
    fontSize: wp(3.9),
    color: '#028464',
    fontWeight: '700',
  },
  orderSummaryDashedLine: {
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    width: '100%',
    marginVertical: hp(0.8),
  },
});

export default Plans;
