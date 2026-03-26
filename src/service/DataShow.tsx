import React from "react";
import { StyleSheet } from "react-native";
import { View } from "@gluestack-ui/themed-native-base";
import Table from "../components/Table";
import { StringSplitQuestion } from "./StringSplit";

export const SplitStringValues = (props: any) => {
  if (!props || !props.MCQ || !props.keyName) {
    console.warn('[SplitStringValues] Missing required props');
    return null;
  }

  const mcqField = props.MCQ[props.keyName];
  let fieldValue: string | null = null;

  if (typeof mcqField === 'string') {
    fieldValue = mcqField;
  } else if (mcqField && typeof mcqField === 'object' && typeof mcqField.value === 'string') {
    fieldValue = mcqField.value;
  } else {
    console.warn(`[SplitStringValues] Invalid MCQ field for key: ${props.keyName}`);
    return null;
  }

  if (!fieldValue || typeof fieldValue !== 'string') {
    console.error(`[SplitStringValues] Invalid or missing value for key: ${props.keyName}`);
    return null;
  }

  try {
    const chunks = fieldValue.split("#@#");
    return (
      <>
        {chunks.map((key: any, index: number) => {
          if (!key || typeof key !== 'string') {
            return null;
          }
          const MCQKey = key.split("#*#");
          const keyType = MCQKey.length >= 2 ? (MCQKey[0] || '') : 'txt';
          const keyValue = MCQKey.length >= 2 ? (MCQKey.slice(1).join('#*#') || '') : key;

          return (
            <View key={`chunk-${index}`}>
              {keyType !== "table" && (
                <StringSplitQuestion
                  MCQ={keyValue}
                  keyName={keyType}
                  color={props.color}
                  content={props.keyName}
                  uniqueId={`chunk-${index}`}
                  onImagePress={props.onImagePress}
                  isOptionContent={props.isOptionContent}
                  onInteractStart={props.onInteractStart}
                  onInteractEnd={props.onInteractEnd}
                />
              )}
              {keyType === "table" && (
                props.centerTable ? (
                  <View style={{ alignItems: 'center' }}>
                    <Table data={key} MCQ={props.MCQ} keyName={props.keyName} />
                  </View>
                ) : (
                  <Table data={key} MCQ={props.MCQ} keyName={props.keyName} />
                )
              )}
            </View>
          );
        })}
      </>
    );
  } catch (error) {
    console.error('[SplitStringValues] Error processing MCQ field:', error);
    return null;
  }
};

const style = StyleSheet.create({
  katex: {
    fontSize: 24,
    margin: 0,
    display: "flex",
    color: "#FFFFFF",
  },
});
