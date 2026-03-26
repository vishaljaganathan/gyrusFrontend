import React, { useState } from "react";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { View, Text, TouchableOpacity } from "react-native";
import { quesProps } from "../interface/Interface";
import { SplitStringValues } from "../service/DataShow";

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
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>
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
