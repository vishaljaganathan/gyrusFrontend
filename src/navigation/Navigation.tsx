import React, { useEffect, useState } from "react";
import BottomBar from "./BottomBar";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { getSecureStorage } from "../config/SecureStore";
import SignUp from "../pages/Signup";
import Otp from "../pages/Otp";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Plans from "../pages/Plans";
import Test from "../screens/Test";



const Stack = createStackNavigator();

const Navigation = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    getSecureStorage("token")
      .then((res) => {
        if (res) {
          setLoggedIn(true);
        } else {
          console.warn("No token found, redirecting to Login.");
          setLoggedIn(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching token:", err);
        setLoggedIn(false);
      });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {loggedIn ? (
          <Stack.Screen
            options={{ headerShown: false }}
            name="BottomBar"
            component={BottomBar}
          />
        ) : (
          <>
            <Stack.Screen
              name="SignUp"
              options={{ headerShown: false }}
              component={SignUp}
            />
            <Stack.Screen
              name="Otp"
              options={{ headerShown: false }}
              component={Otp}
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
              name="Test"
              options={{ headerShown: false }}
              component={Test}
            />
            <Stack.Screen
              name="Plans"
              options={{ headerShown: false }}
              component={Plans}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default React.memo(Navigation);
