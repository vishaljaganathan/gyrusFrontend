import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, Pressable, LayoutChangeEvent } from "react-native";
import { RadioButtonProps } from "../interface/Interface";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SplitStringValues } from "../service/DataShow";
import { StringSplitQuestion } from "../service/StringSplit";
import { Radio } from "@gluestack-ui/themed-native-base";

const RadioButton = ({
  labelName,
  options,
  report,
  keys,
  MCQ,
  keyName,
  answer,
  showAnswer,
  setSelectedIndex,
  selectedIndex,
}: RadioButtonProps) => {
  const [maxOptionHeight, setMaxOptionHeight] = useState<number>(0);
  const touchStateRef = useRef<Record<number, { startX: number; startY: number; moved: boolean }>>({});
  const interactionRef = useRef<Record<number, boolean>>({});
  const measuredOptionHeightsRef = useRef<Record<number, number>>({});

  // Reset measured height whenever the MCQ set changes so single-line questions don't inherit
  // a taller height from previous questions.
  useEffect(() => {
    setMaxOptionHeight(0);
    measuredOptionHeightsRef.current = {};
  }, [MCQ]);

  const returnColor = (index: number) => {
    if (showAnswer === true) {
      if (
        selectedIndex !== undefined &&
        selectedIndex !== Number(answer) &&
        selectedIndex === index
      ) {
        return "#FF7676"; // wrong selection
      } else if (index === Number(answer)) {
        return "#04B600"; // correct answer
      }
    }

    if (selectedIndex === index) {
      return "#0AB8AD"; // selected (before reveal)
    }

    return "#7499A1"; // default
  };

  const getEmphasisBackground = (idx: number) => {
    const isSelected = selectedIndex === idx && showAnswer !== true;
    const isCorrect = showAnswer === true && Number(answer) === idx;
    const isWrongSelected =
      showAnswer === true &&
      selectedIndex !== undefined &&
      selectedIndex !== Number(answer) &&
      selectedIndex === idx;

    if (isCorrect) return "rgba(4, 182, 0, 0.12)"; // subtle green tint
    if (isWrongSelected) return "rgba(255, 118, 118, 0.14)"; // subtle red tint
    if (isSelected) return "rgba(10, 184, 173, 0.12)"; // subtle teal tint
    return "transparent";
  };

  const onOptionContentLayout = (index: number, e: LayoutChangeEvent, hasImage: boolean) => {
    const contentHeight = e.nativeEvent.layout.height;
    const verticalPadding = hasImage ? hp(3.6) : hp(2);
    const nextHeight = Math.ceil(contentHeight + verticalPadding);

    const prevHeight = measuredOptionHeightsRef.current[index] || 0;
    // Math/equation rendering can report fluctuating heights across frames.
    // Ignore decreases to prevent visible up/down layout flicker.
    if (nextHeight <= prevHeight) return;

    measuredOptionHeightsRef.current[index] = nextHeight;

    // Keep max option height monotonic for the current question.
    if (nextHeight > maxOptionHeight) {
      setMaxOptionHeight(nextHeight);
    }
  };

  return (
    <>
      {MCQ && Array.isArray(MCQ) && MCQ.length > 0 ? (
        MCQ.map((res: any, index: number) => {
          if (!res || typeof res !== 'object') {
            console.warn('[RadioButton] Invalid option at index:', index, res);
            return null;
          }

          const idx = index + 1;
          const optionKey = Object.keys(res)[0];
          const optionValue = res[optionKey];

          console.log('[RadioButton] Processing option:', {
            idx,
            optionKey,
            optionValue,
            hasValue: optionValue?.value ? true : false,
            valueType: typeof optionValue?.value,
            optionValueStructure: JSON.stringify(optionValue)
          });

          if (!optionValue) {
            console.warn('[RadioButton] Missing option value at index:', index);
            return (
              <View key={index} style={[Styles.container, { minHeight: maxOptionHeight || undefined }]}>
                <Text style={Styles.optionIndex}>{idx})</Text>
                <Text style={{ color: '#999' }}>Option not available</Text>
              </View>
            );
          }

          // Handle case where optionValue is directly a string (simple text)
          let optionText = null;
          let hasComplexContent = false;

          console.log('[RadioButton] Processing option:', { 
            idx, 
            optionValue, 
            type: typeof optionValue,
            isObject: typeof optionValue === 'object',
            hasValueProp: optionValue && typeof optionValue === 'object' ? 'value' in optionValue : false,
            valueType: optionValue && typeof optionValue === 'object' && 'value' in optionValue ? typeof optionValue.value : 'N/A'
          });

          if (typeof optionValue === 'string') {
            // optionValue is directly a string
            optionText = optionValue;
            hasComplexContent = optionText.includes('#@#') || optionText.includes('#*#');
          } else if (typeof optionValue === 'object' && optionValue !== null && optionValue.value) {
            // optionValue is { value: "text" } - extract the value
            optionText = String(optionValue.value); // Force to string
            hasComplexContent = optionText.includes('#@#') || optionText.includes('#*#');
          } else if (typeof optionValue === 'object' && optionValue !== null) {
            // Object but no value property - try to stringify
            console.warn('[RadioButton] Object without value property:', optionValue);
            optionText = JSON.stringify(optionValue);
            hasComplexContent = false;
          }

          console.log('[RadioButton] Resolved:', { optionText: optionText?.substring(0, 80), hasComplexContent, idx });

          // Heuristic: complex MCQ strings encode segments like "img#*#<url>".
          // Use this to detect options that contain images.
          const hasImage =
            typeof optionText === "string" &&
            optionText.includes("img#*#");

          // Flag to differentiate a direct image tap from a container tap.
          let ignoreNextSelect = false;

          const setInteractionStart = () => {
            interactionRef.current[idx] = true;
            console.log(`[RadioButton] interactionStart idx=${idx}`);
          };

          const setInteractionEnd = () => {
            // Clear interaction flag immediately so normal taps aren't incorrectly suppressed.
            interactionRef.current[idx] = false;
            console.log(`[RadioButton] interactionEnd idx=${idx}`);
          };

          const handleImagePress = () => {
            ignoreNextSelect = true;
          };

          const handleOptionPress = () => {
            if (touchStateRef.current[idx]?.moved) {
              delete touchStateRef.current[idx];
              return;
            }
            if (ignoreNextSelect) {
              ignoreNextSelect = false;
              return;
            }

            if (interactionRef.current[idx]) {
              // user is interacting with nested content (e.g., horizontal scroll);
              // don't treat this as an option press.
              console.log(`[RadioButton] suppressed option press due to interaction idx=${idx}`);
              // clear the flag to avoid permanently suppressing future taps
              interactionRef.current[idx] = false;
              return;
            }
            if (showAnswer === false) {
              setSelectedIndex(idx);
            }
          };

          const handleTouchStart = (event: any) => {
            const { pageX, pageY } = event.nativeEvent;
            touchStateRef.current[idx] = {
              startX: pageX,
              startY: pageY,
              moved: false,
            };
          };

          const handleTouchMove = (event: any) => {
            const state = touchStateRef.current[idx];
            if (!state) return;

            const { pageX, pageY } = event.nativeEvent;
            if (Math.abs(pageX - state.startX) > 6 || Math.abs(pageY - state.startY) > 6) {
              state.moved = true;
            }
          };

          const handleTouchEnd = () => {
            const state = touchStateRef.current[idx];
            if (!state?.moved) {
              delete touchStateRef.current[idx];
              return;
            }

            setTimeout(() => {
              delete touchStateRef.current[idx];
            }, 0);
          };

          const hasScrollableEq = typeof optionText === 'string' && optionText.includes('eq#*#');

          if (hasScrollableEq) {
            // Make container pressable so taps (when not interacting with inner scroll) select the option.
            return (
              <Pressable
                key={index}
                onPress={handleOptionPress}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onStartShouldSetResponder={() => false}
                onMoveShouldSetResponder={() => false}
                onStartShouldSetResponderCapture={() => false}
                onMoveShouldSetResponderCapture={() => false}
              >
                <View
                  style={[
                    labelName === "report" ? Styles.reportContainer : Styles.container,
                    {
                      borderColor: returnColor(idx),
                      backgroundColor: getEmphasisBackground(idx),
                      paddingVertical: hasImage ? hp(1.8) : hp(1),
                      minHeight: maxOptionHeight > 0 ? maxOptionHeight : undefined,
                    },
                  ]}
                >
                  <View style={Styles.optionRow}>
                    <Text style={Styles.optionIndex}>{idx})</Text>
                    <View style={Styles.optionContent}>
                      <View
                        style={Styles.optionContentMeasure}
                        onLayout={(event) => onOptionContentLayout(idx, event, hasImage)}
                      >
                        {optionText ? (
                          hasComplexContent ? (
                            <SplitStringValues
                              MCQ={optionValue}
                              keyName="value"
                              onImagePress={handleImagePress}
                              isOptionContent
                              onInteractStart={setInteractionStart}
                              onInteractEnd={setInteractionEnd}
                            />
                          ) : (
                            <StringSplitQuestion
                              MCQ={optionText}
                              keyName="txt"
                              content="option"
                              uniqueId={`option-${index}`}
                            />
                          )
                        ) : (
                          <Text style={{ color: '#999' }}>No option text</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={index}
              onPress={handleOptionPress}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onStartShouldSetResponder={() => false}
              onMoveShouldSetResponder={() => false}
              onStartShouldSetResponderCapture={() => false}
              onMoveShouldSetResponderCapture={() => false}
            >
              <View
                style={[
                  labelName === "report" ? Styles.reportContainer : Styles.container,
                  {
                    borderColor: returnColor(idx),
                    backgroundColor: getEmphasisBackground(idx),
                    // Give image options a bit more vertical space
                    paddingVertical: hasImage ? hp(1.8) : hp(1),
                      minHeight: maxOptionHeight > 0 ? maxOptionHeight : undefined,
                  },
                ]}
              >
                <View style={Styles.optionRow}>
                  <Text style={Styles.optionIndex}>{idx})</Text>
                  <View style={Styles.optionContent}>
                    <View
                      style={Styles.optionContentMeasure}
                      onLayout={(event) => onOptionContentLayout(idx, event, hasImage)}
                    >
                      {optionText ? (
                        hasComplexContent ? (
                          <SplitStringValues
                            MCQ={optionValue}
                            keyName="value"
                            onImagePress={handleImagePress}
                            isOptionContent
                            onInteractStart={setInteractionStart}
                            onInteractEnd={setInteractionEnd}
                          />
                        ) : (
                          <StringSplitQuestion
                            MCQ={optionText}
                            keyName="txt"
                            content="option"
                            uniqueId={`option-${index}`}
                          />
                        )
                      ) : (
                        <Text style={{ color: '#999' }}>No option text</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })
      ) : (
        <View style={Styles.container}>
          <Text style={{ color: '#999' }}>No options available</Text>
        </View>
      )}
      {
        <Radio.Group
          key={keys}
          defaultValue="1"
          name="exampleGroup"
          accessibilityLabel="favorite colorscheme"
        >
          {report?.map((res, index) => {
            return (
              <>
                <View
                  style={
                    labelName === "report"
                      ? Styles.reportContainer
                      : Styles.container
                  }
                  key={keys}
                >
                  <Radio
                    colorScheme="emerald"
                    value={res.value}
                    my={hp(1)}
                    key={index}
                    size={hp(2)}
                    fontSize={hp(0.1)}
                    backgroundColor={"#707070"}
                  >
                    {res.label}
                  </Radio>
                </View>
              </>
            );
          })}
        </Radio.Group>
      }
    </>
  );
};

const Styles = StyleSheet.create({
  container: {
    marginTop: hp(1),
    width: "100%",
    paddingVertical: hp(1),
    paddingHorizontal: wp(1.6),
    borderRadius: hp(2),
    borderColor: "#7499A1",
    borderWidth: wp(0.5), // keep constant to avoid layout shift
    justifyContent: "center", // Center content vertically within the container
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Align content to the left
    width: "100%",
    paddingHorizontal: wp(2),
  },
  optionIndex: {
    color: "#FFFFFF",
    marginRight: wp(2),
    width: wp(6),
    fontSize: wp(3.8),
    textAlign: "left",
    textAlignVertical: "center", // Ensure vertical centering for Android
    fontFamily: "Manrope-VariableFont_wght",
  },
  optionContent: {
    flex: 1,
    justifyContent: "center", // Center the content vertically
    alignItems: "flex-start",
    alignSelf: "stretch",
  },
  optionContentMeasure: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    paddingVertical: hp(0.4),
  },
  reportContainer: {
    // kept intentionally minimal for report view
  },
});

export default RadioButton;