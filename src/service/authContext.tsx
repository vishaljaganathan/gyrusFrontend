import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";
import { axiosInstance } from "../config/indeceptor";
import { getSecureStorage } from "../config/SecureStore";

import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  ReactNode } from "react";

// Define the context type (optional but recommended)
interface ThemeContextType {
  userData: any;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
  signUpData: any;
  setSignUpData: React.Dispatch<React.SetStateAction<any>>;
  appState: any;
  setAppState: React.Dispatch<React.SetStateAction<any>>;
  notificationRefreshTrigger: number;
  setNotificationRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  unreadNotificationCount: number;
  setUnreadNotificationCount: React.Dispatch<React.SetStateAction<number>>;
}

export const ThemeContext = createContext<ThemeContextType>({
  userData: {},
  setUserData: () => {},
  signUpData: {},
  setSignUpData: () => {},
  appState: {},
  setAppState: () => { },
  notificationRefreshTrigger: 0,
  setNotificationRefreshTrigger: () => { },
  unreadNotificationCount: 0,
  setUnreadNotificationCount: () => { }
});

interface ThemeProviderProps {
  children: ReactNode; // `children` can be any valid React element or nodes
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children } : any) => {
  const [userData, setUserData] = useState<any>({
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
    planValid: false } );
  const [signUpData, setSignUpData] = useState<any>({
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
    page2Valid: false } );
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
      wrongQtsId: [] } });

  const [notificationRefreshTrigger, setNotificationRefreshTrigger] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    const loadAppState = async () => {
      try {
        const savedAppState = await AsyncStorage.getItem("appState");
        if (savedAppState) {
          setAppState(JSON.parse(savedAppState));
        }
      } catch (error) {
        console.error("Error loading appState", error);
      }
    };

    loadAppState();
  }, []);

  useEffect(() => {
    const saveAppState = async () => {
      if (appState !== null) {
        try {
          await AsyncStorage.setItem("appState", JSON.stringify(appState));
        } catch (error) {
          console.error("Error saving appState", error);
        }
      }
    };

    saveAppState();
  }, [appState]);

  // Handle background-to-foreground transitions to sync plan status and manage reminders
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('[authContext] App became active. Syncing user data...');
        getSecureStorage("token")
          .then((token: any) => {
            if (token) {
              axiosInstance
                .get("authentication/user")
                .then((res: any) => {
                  if (res && res.data) {
                    setUserData(res.data);
                  } })
                .catch((err: any) => {
                  console.log('[authContext] Background sync failed (likely offline/unauth)');
                });
            } })
          .catch(() => {});
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      userData,
      setUserData,
      signUpData,
      setSignUpData,
      appState,
      setAppState,
      notificationRefreshTrigger,
      setNotificationRefreshTrigger,
      unreadNotificationCount,
      setUnreadNotificationCount } ),
    [userData, signUpData, appState, notificationRefreshTrigger, unreadNotificationCount]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
