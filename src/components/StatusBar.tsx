import React from "react";
import { StatusBar } from "expo-status-bar";



const Statusbar = ({ bgColor, indicatorsColor }: any) => {
  // @ts-ignore
  return <StatusBar backgroundColor={bgColor} translucent style={indicatorsColor} />;
};

export default Statusbar;
