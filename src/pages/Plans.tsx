import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  NativeModules,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Theme from "../styles/themes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import RazorpayCheckout from "react-native-razorpay";
import { ThemeContext } from "../service/authContext";
import SubscribeBtn from "../components/SubscribeButton";
import { axiosInstance } from "../config/indeceptor";
import { Modal } from "@gluestack-ui/themed-native-base";

const Plans = ({ navigation }: any) => {
  const check = require("../assets/check-square.png");
  const insets = useSafeAreaInsets();
  const logo = require("../assets/appLogo.png");

  const [showOrder, setShowOrder] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPaymentStatus, setshowPaymentStatus] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [couponChecked, setCouponChecked] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [verifiedCoupon, setVerifiedCoupon] = useState<any>(null);

  const [order, setOrder] = useState({
    _id: "",
    amount: 0,
    discountApplicable: false,
    gst: 18,
    gstPrice: 100,
    prices: { discountPrice: "0", offer: 0, price: "0" },
  });

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
  };

  const closePaymentModal = () => {
    const shouldCloseOrderSummary = showPaymentStatus;
    setShowPayment(false);
    if (shouldCloseOrderSummary) {
      closeOrderSummary();
    }
  };

  const originalAmount = Number(order.amount || 0);
  const payableAmount = verifiedCoupon?.finalAmount ?? originalAmount;

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
        couponCode: normalizedCouponCode,
      })
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
        }
      })
      .catch(() => {
        onResolved?.(false);
      });
  };

  // Create order API
  const createOrder = (planId: any) => {
    setLoading(true);
    axiosInstance
      .post("authentication/create-order", {
        planId,
        couponCode: verifiedCoupon?.couponCode || undefined,
      })
      .then((orderResponse) => {
        const orderData = orderResponse?.data;

        if (orderData && orderData.requiresPayment === false) {
          axiosInstance
            .put("authentication/payment/update", {
              planId,
              couponCode: verifiedCoupon?.couponCode || undefined,
            })
            .then((res) => {
              const emailSent = !!res?.data?.emailSent;
              const downloadUrl = res?.data?.downloadUrl;

              setLoading(false);
              setShowPayment(true);
              setshowPaymentStatus(true);
              refreshUserAndResolvePaymentStatus();

              if (emailSent) {
                Alert.alert("Plan activated", "Invoice has been sent to your email.");
              } else if (downloadUrl) {
                Alert.alert(
                  "Plan activated",
                  `Invoice email could not be sent. You can download your bill from: ${downloadUrl}`
                );
              }
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
          openRazorpay(
            orderData.orderId,
            orderData.key,
            Number(orderData.amount || payableAmount),
            verifiedCoupon?.couponCode || undefined
          );
        } else {
          setLoading(false);
          setShowPayment(true);
          setshowPaymentStatus(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setShowPayment(true);
        setshowPaymentStatus(false);
      });
  };


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
        razorpayRelatedNativeModules: nativeModuleKeys.filter((name) => /razorpay/i.test(name)),
      });
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

    const amountInPaise = Math.round(Number(payableOverride ?? payableAmount) * 100);

    const options = {
      key: razorpayKey,
      amount: amountInPaise,
      currency: "INR",
      name: "Gyrus Neet",
      description: "Payment for Order",
      image: logo,
      order_id: orderId,
      prefill: {
        email: userData.email,
        contact: userData.phoneNo,
        name: userData.firstName + " " + userData.lastName,
      },
      theme: {
        color: "rgba(2, 134, 134, 1)",
      },
    };

    try {
      const checkoutPromise = RazorpayCheckout.open(options);

      checkoutPromise.then((paymentData: any) => {
        axiosInstance
          .put("authentication/payment/update", {
            planId: order._id,
            couponCode: appliedCouponCode,
            razorpay_payment_id: paymentData?.razorpay_payment_id,
            razorpay_order_id: paymentData?.razorpay_order_id,
            razorpay_signature: paymentData?.razorpay_signature,
          })
          .then((res) => {
            const emailSent = !!res?.data?.emailSent;
            const downloadUrl = res?.data?.downloadUrl;

            // If server accepted payment update, show success immediately.
            setShowPayment(true);
            setshowPaymentStatus(true);
            refreshUserAndResolvePaymentStatus();

            if (emailSent) {
              Alert.alert("Payment successful", "Invoice has been sent to your email.");
            } else if (downloadUrl) {
              console.log("Invoice download URL:", downloadUrl);
              Alert.alert(
                "Payment successful",
                `Invoice email could not be sent. You can download your bill from: ${downloadUrl}`
              );
            } else {
              Alert.alert(
                "Payment successful",
                "Invoice email could not be sent. Please contact support."
              );
            }
          })
          .catch(async () => {
            // Fallback: payment may already be captured and user updated by backend/webhook.
            const isPaid = await resolvePaymentActivation();
            setShowPayment(true);
            setshowPaymentStatus(isPaid);

            if (isPaid) {
              Alert.alert(
                "Payment successful",
                "Payment is active. Invoice email status is unavailable right now."
              );
            } else {
              Alert.alert(
                "Payment pending",
                "Payment completed on Razorpay, but activation is still processing. Please wait and try again."
              );
            }
          });

        setLoading(false);
        navigation.navigate("BottomBar", { screen: "Home" });
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
          setPlans(res.data);
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
          paddingLeft: insets.left,
        }}
      >
        {/* Close Button */}
        <View
          style={{
            width: "90%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity onPress={Navigate}>
            <FontAwesomeIcon icon={faCircleXmark} size={wp(8)} color={Theme.COLORS.grey01} />
          </TouchableOpacity>
        </View>

        {/* Plans */}
        <View style={{ flex: 2 }}>
          <View style={{ display: "flex", alignItems: "center" }}>
            <ScrollView style={{ paddingHorizontal: wp(2) }}>
              {plans.map((data: any, index: number) => {
                return (
                  <View key={index} style={styles.cardContainer}>
                    <View style={{ alignItems: "center" }}>
                      <View style={{ display: "flex", flexDirection: "row" }}>
                        <Image
                          source={{ uri: data.img }}
                          style={{ width: 70, height: 70 }}
                        />
                        <Text style={styles.features}>{data.title}</Text>
                      </View>

                      {/* Price Section */}
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: wp(2),
                          margin: wp(1),
                        }}
                      >
                        <View
                          style={{
                            width: wp(14),
                            justifyContent: "flex-start",
                          }}
                        >
                          {data.discountApplicable && (
                            <>
                              <Text
                                style={{
                                  color: "#FFFFFF",
                                  textDecorationLine: "line-through",
                                  fontSize: wp(4),
                                }}
                              >
                                {"\u20B9"}
                                {data.prices.price}
                              </Text>
                              <Text
                                style={{
                                  marginVertical: wp(1.2),
                                  color: "#002B7B",
                                }}
                              >
                                {data.prices.offer}
                                {"% off"}
                              </Text>
                            </>
                          )}
                        </View>
                        <View>
                          <Text style={{ color: "#FFFFFF", fontSize: wp(5) }}>
                            {"\u20B9"}
                            {data.discountApplicable
                              ? data.prices.discountPrice
                              : data.prices.price}{" "}
                            + GST
                          </Text>
                        </View>
                      </View>

                      {/* Description */}
                      <View>
                        {data.desc.map((desc: any, i: number) => (
                          <View
                            key={i}
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "flex-start",
                            }}
                          >
                            <Image
                              source={check}
                              style={{ width: 20, height: 20, margin: wp(1) }}
                            />
                            <Text
                              style={{
                                color: "#FFFFFF",
                                marginVertical: hp(0.6),
                              }}
                            >
                              {desc.desc}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Subscribe Button */}
                    <SubscribeBtn
                      onPress={() => {
                        openOrderSummary(plans[index]);
                      }}
                      text={"Subscribe Now"}
                    />
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
                    backgroundColor: "#FFF",
                  }}
                >
                  <Modal.CloseButton style={{ padding: 9 }} />
                  <Modal.Header
                    style={{
                      backgroundColor: "transparent",
                      paddingBottom: hp(2),
                    }}
                  >
                    <View style={styles.emojiContainer}>
                      <Text>Order Summary</Text>
                    </View>
                  </Modal.Header>
                  <Modal.Body style={{ marginVertical: wp(2) }}>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginVertical: hp(0.5),
                      }}
                    >
                      <Text>Sub Total</Text>
                      <Text>
                        {"\u20B9"}
                        {order.discountApplicable
                          ? order.prices.discountPrice
                          : order.prices.price}
                      </Text>
                    </View>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginVertical: hp(0.5),
                      }}
                    >
                      <Text>Gst ({order.gst}%) </Text>
                      <Text>
                        {"\u20B9"} {order.gstPrice}
                      </Text>
                    </View>
                    <View style={styles.line} />
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginVertical: hp(0.5),
                      }}
                    >
                      <Text>Total Amount</Text>
                      <Text>{"\u20B9"} {originalAmount}</Text>
                    </View>
                    {verifiedCoupon ? (
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginVertical: hp(0.5),
                        }}
                      >
                        <Text>Coupon Discount</Text>
                        <Text>{"\u20B9"} {verifiedCoupon.discountAmount}</Text>
                      </View>
                    ) : null}
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginVertical: hp(0.5),
                      }}
                    >
                      <Text>Payable Amount</Text>
                      <Text>{"\u20B9"} {payableAmount}</Text>
                    </View>
                    <View style={styles.line} />
                    <View style={styles.couponContainer}>
                      <TouchableOpacity
                        style={styles.couponToggleRow}
                        onPress={() => {
                          const nextChecked = !couponChecked;
                          setCouponChecked(nextChecked);

                          if (!nextChecked) {
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
                    <View style={{ alignItems: "center" }}>
                      <SubscribeBtn
                        disable={loading || couponLoading}
                        text={"Continue"}
                        onPress={() => createOrder(order._id)}
                      />
                    </View>
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
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  Img: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch",
  },
  cardContainer: {
    borderWidth: wp(0.3),
    borderRadius: wp(2),
    borderColor: "#D3D3D3",
    display: "flex",
    alignItems: "center",
    width: wp(90),
    marginVertical: hp(2),
    padding: wp(4),
    backgroundColor: "rgba(47, 47, 47, 0.4)",
    opacity: 34,
  },
  features: {
    color: "#FFFFFF",
    fontSize: wp(4.5),
    marginVertical: hp(2),
    marginHorizontal: wp(3),
  },
  premimum: {
    color: "#D5D5D5",
    fontSize: wp(4),
  },
  pointsCard: {
    borderColor: "black",
    display: "flex",
    paddingVertical: wp(3),
    width: "80%",
    backgroundColor: "#D9D9D9",
    borderBottomEndRadius: wp(9),
  },
  rateContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    width: "80%",
  },
  totalAmnt: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  emojiContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 15,
  },
  summaryRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: hp(0.5),
  },
  line: {
    height: 1,
    backgroundColor: "#000",
    width: "100%",
    marginVertical: 10,
  },
  couponContainer: {
    marginBottom: hp(1.5),
  },
  couponToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
  },
  couponLabel: {
    fontSize: wp(3.8),
    fontWeight: "700",
    color: "#222",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: Theme.COLORS.one,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(2),
    backgroundColor: "#FFF",
  },
  checkboxChecked: {
    backgroundColor: Theme.COLORS.one,
  },
  checkboxTick: {
    color: "#FFF",
    fontWeight: "700",
  },
  couponInput: {
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: hp(1),
  },
  verifyButton: {
    backgroundColor: Theme.COLORS.one,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: hp(1),
  },
  verifyButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },
  couponError: {
    color: "#C62828",
    marginBottom: hp(1),
  },
  couponSummary: {
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    padding: 10,
  },
  couponSuccessText: {
    color: Theme.COLORS.one,
    fontWeight: "700",
    marginBottom: hp(0.8),
  },
  paymentModalContent: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  paymentModalCloseButton: {
    padding: 10,
    zIndex: 2,
  },
  paymentStatusCard: {
    borderRadius: 24,
    paddingHorizontal: wp(6),
    paddingTop: hp(3),
    paddingBottom: hp(2.8),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    overflow: "hidden",
  },
  paymentStatusIconWrap: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2),
  },
  paymentSuccessIconWrap: {
    backgroundColor: "rgba(33, 163, 0, 0.12)",
  },
  paymentFailureIconWrap: {
    backgroundColor: "rgba(246, 86, 93, 0.12)",
  },
  paymentStatusTitle: {
    fontSize: wp(6),
    fontWeight: "800",
    color: Theme.COLORS.one,
    marginBottom: hp(1),
    textAlign: "center",
  },
  paymentStatusSubtitle: {
    fontSize: wp(3.8),
    lineHeight: wp(5.4),
    color: Theme.COLORS.grey,
    textAlign: "center",
    marginBottom: hp(2.2),
  },
  paymentStatusButton: {
    minWidth: wp(38),
    borderRadius: 18,
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(5),
    alignItems: "center",
  },
  paymentSuccessButton: {
    backgroundColor: Theme.COLORS.primary06,
  },
  paymentFailureButton: {
    backgroundColor: Theme.COLORS.error01,
  },
  paymentStatusButtonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: wp(4),
  },
});

export default Plans;
