import React, { useEffect, useState } from "react";
import "react-native-gesture-handler";
import { Image, LogBox, StyleSheet, Text, TextInput, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GluestackUIProvider } from "@gluestack-ui/themed-native-base";
import { config } from "@gluestack-ui/config";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold, useFonts as useRobotoFonts } from '@expo-google-fonts/roboto';
import { ThemeProvider } from "./src/service/authContext";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { userProps } from "./src/interface/Interface";
import BottomBar from "./src/navigation/BottomBar";
import TesterMcqSearch from "./src/pages/TesterMcqSearch";
import SignUp from "./src/pages/Signup";
import Otp from "./src/pages/Otp";
import Login from "./src/pages/Login";
import ForgotPassword from "./src/pages/ForgotPassword";
import Plans from "./src/pages/Plans";
import Test from "./src/screens/Test";
import Default from "./src/pages/Default";
import ResetPassword from "./src/pages/ResetPassword";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore (can happen during fast refresh)
});

const DEFAULT_FONT_FAMILY = Platform.OS === 'android' ? 'Roboto' : 'Manrope-VariableFont_wght';

const Stack = createNativeStackNavigator();

export default function App() {
  LogBox.ignoreAllLogs();
  const [loggedIn, setLoggedIn] = useState(false);

  //   const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? 20 : '';
  // const HEADER_HEIGHT = Platform.OS === "ios" ? 44 : 56;

  let navigationRef = useNavigationContainerRef();
  const queryClient = new QueryClient();

  const [userData, setUserData] = useState<userProps>({
    _id: "",
    email: "",
    firstName: "",
    lastName: "",
    gender: "",
    password: "",
    phoneNo: "",
    std: "",
    targetYear: "",
    pinCode: "",
    schoolName: "",
    schoolPin: "",
    residentialPin: "",
    notificationId: {},
    plan: "",
    examDate: "",
    planValid: false,
  });

  // const queryClient = new QueryClient();
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    std: "",
    email: "",
    targetYear: "",
    phoneNo: "",
    password: "",
    pincode: "",
    schoolName: "",
    schoolPin: "",
    residentialPin: "",
    page1Valid: false,
    page2Valid: false,
  });

  const [appState, setAppState] = useState<any>({
    bgColor: "#00474C",
    indicatorColor: "light",
    internetStatus: true,
    home: "neet",
    currentTest: {
      subjectId: "",
      testId: "",
      scores: 0,
      subject: "",
      correctQtsId: [],
      wrongQtsId: [],
    },
  });

  const [fontsLoaded] = useFonts({
    "Manrope-Light": require("./src/assets/fonts/Manrope-Light.ttf"),
    "Manrope-VariableFont_wght": require("./src/assets/fonts/Manrope-VariableFont_wght.ttf"),
    "Quicksand-VariableFont_wght": require("./src/assets/fonts/Quicksand-VariableFont_wght.ttf"),
    "Raleway-Light": require("./src/assets/fonts/Raleway-Light.ttf"),
    "CroissantOne-Regular": require("./src/assets/fonts/CroissantOne-Regular.ttf"),
    "Amiko-Regular": require("./src/assets/fonts/Amiko-Regular.ttf"),
    "Rowdies-Regular": require("./src/assets/fonts/Rowdies-Regular.ttf"),
    "Comfortaa-SemiBold": require("./src/assets/fonts/Comfortaa-SemiBold.ttf"),
  });

  // Load Roboto from @expo-google-fonts (bundled via node_modules)
  const [robotoLoaded] = useRobotoFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });

  useEffect(() => {
    // Wait for both local fonts and Roboto (from package) to load.
    if (!fontsLoaded || !robotoLoaded) return;

    (Text as any).defaultProps = {
      ...((Text as any).defaultProps ?? {}),
      allowFontScaling: false,
      maxFontSizeMultiplier: 1,
      style: [
        { fontFamily: DEFAULT_FONT_FAMILY },
        (Text as any).defaultProps?.style,
      ],
    };

    (TextInput as any).defaultProps = {
      ...((TextInput as any).defaultProps ?? {}),
      allowFontScaling: false,
      maxFontSizeMultiplier: 1,
      style: [
        { fontFamily: DEFAULT_FONT_FAMILY },
        (TextInput as any).defaultProps?.style,
      ],
    };

    void SplashScreen.hideAsync().catch(() => {
      // ignore (can happen if already hidden)
    });
  }, [fontsLoaded, robotoLoaded]);

  if (!fontsLoaded || !robotoLoaded) {
    return null;
  }

  navigationRef.addListener("state", (e) => {
    let route = navigationRef.getCurrentRoute();
    if (route) {
      switch (route.name) {
        case "Home":
          setAppState((prev: any) => ({
            ...prev,
            bgColor: "#00474C",
            indicatorColor: "light",
            internetStatus: true,
          }));
          break;
        default:
          setAppState((prev: any) => ({
            ...prev,
            bgColor: "transparent",
            indicatorColor: "light",
            internetStatus: true,
          }));
          break;
      }
    }
  });

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationContainer ref={navigationRef}>
          <QueryClientProvider client={queryClient}>
            <GluestackUIProvider config={config}>
              <StatusBar
                backgroundColor={appState.bgColor}
                style={appState.indicatorColor}
                translucent={true}
              />
              {/* <ProgressBar /> */}
              {/* <Navigation /> */}
              {/* <Wrapper/> */}
              {/* <Login/> */}
              <Stack.Navigator initialRouteName="DefaultScreen">
                <Stack.Screen
                  name="DefaultScreen"
                  options={{ headerShown: false }}
                  component={Default}
                />
                <Stack.Screen
                  options={{ headerShown: false }}
                  name="BottomBar"
                  component={BottomBar}
                />
                <>
                  <Stack.Screen
                    name="SignUp"
                    options={{ headerShown: false }}
                    component={SignUp}
                  />
                  <Stack.Screen
                    options={{
                      headerShown: false,
                    }}
                    name="Otp"
                    component={Otp}
                  />
                  <Stack.Screen
                    options={{
                      headerShown: false,
                    }}
                    name="Fpassword"
                    component={ForgotPassword}
                  />
                  <Stack.Screen
                    options={{
                      headerShown: false,
                    }}
                    name="Reset"
                    component={ResetPassword}
                  />
                  <Stack.Screen
                    name="Login"
                    options={{ headerShown: false }}
                    component={Login}
                  />
                  <Stack.Screen
                    name="ForgotPassword"
                    options={{ headerShown: false }}
                    component={ForgotPassword}
                  />
                  <Stack.Screen
                    options={{ headerShown: false, gestureEnabled: false }}
                    name="Test"
                    component={Test}
                  />
                  <Stack.Screen
                    options={{ headerShown: false }}
                    name="MCQSearch"
                    component={TesterMcqSearch}
                  />
                  <Stack.Screen
                    options={{ headerShown: false }}
                    name="Plans"
                    component={Plans}
                  />
                </>
              </Stack.Navigator>
            </GluestackUIProvider>
          </QueryClientProvider>
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  androidLarge57: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "transparent",
    height: 800,
    width: "100%",
  },
  Img: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    zIndex: 1000,
  },
});