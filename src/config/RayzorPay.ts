import RazorpayCheckout from "react-native-razorpay";
import { Alert, NativeModules } from "react-native";
import { COLORS } from "../styles/themes";

export const RayzorPay = () => {
  const logo = require("../assets/appLogo.png");

  const hasCheckoutModule = !!(NativeModules as any)?.RNRazorpayCheckout;
  if (!hasCheckoutModule) {
    Alert.alert(
      "Payment setup issue",
      "Razorpay native module is not available in this build. Please reinstall a development build (not Expo Go)."
    );
    return;
  }

  var options: any = {
    description: "Credits towards consultation",
    image: logo,
    currency: "INR",
    key: "rzp_test_EGohGUN7qRk6qM", // Your api key
    amount: "1000",
    name: "Jetcode",
    prefill: {
      email: "info@jetcode.in",
      contact: "6369312738",
      name: "Razorpay Software",
    },
    theme: { color: COLORS.secondary01 },
  };
  RazorpayCheckout.open(options)
    .then((data) => {
      // handle success
      alert(`Success: ${data.razorpay_payment_id}`);
    })
    .catch((error: any) => {
      console.log(error, "rayzorpay Errrr");
      // handle failure
      alert(`Error: ${error.code} | ${error.description}`);
    });
}