import React, { useState } from "react";
import {
  faChevronDown,
  faChevronRight} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert } from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from './CustomText';

import { SplitStringValues } from "../service/DataShow";
import { quesProps } from "../interface/Interface";





function CollapsibleText(props: quesProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleCollapse}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"}}
        >
          <Text style={{  }}>
            {isCollapsed ? "Explaination More" : "Explaination Less"}
          </Text>

          <View>
            {isCollapsed ? (
              <FontAwesomeIcon icon={faChevronRight} />
            ) : (
              <FontAwesomeIcon icon={faChevronDown} />
            )}
          </View>
        </View>
      </TouchableOpacity>
      {!isCollapsed && (
        <SplitStringValues keyName={props.explanation}>
          {props.explanation}
        </SplitStringValues>
      )}
    </View>
  );
}

export default CollapsibleText;
