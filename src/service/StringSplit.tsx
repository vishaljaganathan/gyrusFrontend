import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  Image,
  ScrollView,
  Animated as RNAnimated,
  Modal,
  Pressable,
  LayoutChangeEvent,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLORS } from "../styles/themes";
import { View } from "@gluestack-ui/themed-native-base";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import MathJaxSvg from "react-native-mathjax-svg";
import { debounce } from "lodash";
import Icon from "react-native-vector-icons/Feather";

const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.min(Math.max(value, min), max);
};

const preprocessChemTex = (input: string) => {
  if (!input || typeof input !== 'string') return input;
  let s = input;

  // Remove stray double dollar markers that sometimes appear around arrow macros
  s = s.replace(/\$\$/g, '');

  // Unwrap \ce{...} if present
  s = s.replace(/\\ce\{([^}]*)\}/g, (_m, inner) => inner);

  // Replace arrow with labeled forms: ->[above][below] -> \xrightarrow[below]{above}
  s = s.replace(/->\s*\[(.*?)\]\s*\[(.*?)\]/g, (_m, aboveRaw, belowRaw) => {
    const labelToTex = (lbl: string) => {
      if (!lbl) return '';
      const parts = lbl.trim().split(/\s+/).filter(Boolean);
      const mapped = parts.map((p) => {
        // keep math-like tokens (subscripts, LaTeX commands) as-is
        if (/[_\\^{}]/.test(p)) return p;
        // numbers or parenthesized numbers should be text
        if (/^\(\d+\)$/.test(p) || /^\d+$/.test(p)) return `\\text{${p}}`;
        // otherwise wrap in text to preserve spacing
        return `\\text{${p}}`;
      });
      return mapped.join('\\,');
    };

    const above = labelToTex(aboveRaw);
    const below = labelToTex(belowRaw);
    // Estimate arrow length (in em) from label lengths and produce a stretched arrow.
    const lenChars = Math.max(6, Math.ceil((aboveRaw.replace(/\s+/g, '').length + belowRaw.replace(/\s+/g, '').length) / 2) + 4);
    const lenEm = `${lenChars}`; // em units
    // Create an xrightarrow whose visible width is provided by an hspace, then overlay the above label.
    return `\\overset{${above}}{\\xrightarrow[${below}]{\\hspace{${lenEm}em}}}`;
  });

  // Fallback: simple arrow to \rightarrow
  s = s.replace(/->/g, '\\rightarrow');

  return s;
};

// Vertical gap used between content chunks (text, equation, image)
const CHUNK_V_GAP = hp(0.8);

const ZoomablePreviewImage = ({ uri }: { uri: string }) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const viewWidth = useSharedValue(0);
  const viewHeight = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const nextScale = clamp(savedScale.value * e.scale, 1, 4);
      scale.value = nextScale;

      if (nextScale <= 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });

  const pan = Gesture.Pan()
    .onBegin(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (scale.value <= 1) return;

      const maxX = viewWidth.value > 0 ? (viewWidth.value * (scale.value - 1)) / 2 : 0;
      const maxY = viewHeight.value > 0 ? (viewHeight.value * (scale.value - 1)) / 2 : 0;

      translateX.value = clamp(savedTranslateX.value + e.translationX, -maxX, maxX);
      translateY.value = clamp(savedTranslateY.value + e.translationY, -maxY, maxY);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      const zoomedIn = scale.value > 1;
      const next = zoomedIn ? 1 : 2.5;
      scale.value = withTiming(next);
      if (next === 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Pressable
      style={style.previewImageWrap}
      onLayout={(e) => {
        viewWidth.value = e.nativeEvent.layout.width;
        viewHeight.value = e.nativeEvent.layout.height;
      }}
    >
      <GestureDetector gesture={composed}>
        <Animated.Image
          source={{ uri }}
          style={[style.previewImage, animatedStyle]}
        />
      </GestureDetector>
    </Pressable>
  );
};

export const StringSplitQuestion = (props: any) => {
  const [showHint, setShowHint] = useState(false);
  const [parentWidth, setParentWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);

  const scrollX = useRef(new RNAnimated.Value(0)).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    setParentWidth(event.nativeEvent.layout.width);
  };

  // Check if content exceeds parent width

  const debouncedHandleContentSizeChange = useCallback(
    debounce((width: number) => {
      setContentWidth(width);
    }, 100),
    [parentWidth]
  );

  const handleContentSizeChange = (width: number) => {
    debouncedHandleContentSizeChange(width);
  };
  useEffect(() => {
    if (parentWidth > 0 && contentWidth > 0) {
      setShowHint(contentWidth > parentWidth);
    }
  }, [parentWidth, contentWidth]);

  // Do not force a large estimated width for option equations — let the
  // rendered content determine if horizontal scrolling is needed. Forcing a
  // wider inner width caused non-scrollable equations to be treated as
  // scrollable, delaying option presses.
  const estimatedOptionEquationWidth = undefined;

  return (
    <View style={props.isOptionContent ? style.optionContentBlock : undefined}>
      {props.keyName == "eq" && (
        <>
          <View
            style={[
              style.equationContainer,
              props.isOptionContent ? style.optionEquationContainer : undefined,
            ]}
            onLayout={handleLayout}
          >
            <ScrollView
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={true}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true} // Ensure scrollbar is always visible
              contentContainerStyle={{
                paddingHorizontal: 0,
                // For option content: vertically center (alignItems) but keep items left-aligned (justifyContent)
                alignItems: props.isOptionContent ? 'center' : 'flex-start',
                justifyContent: props.isOptionContent ? 'flex-start' : 'flex-start',
                paddingTop: props.isOptionContent ? CHUNK_V_GAP / 2 : CHUNK_V_GAP / 2,
                paddingBottom: props.isOptionContent ? CHUNK_V_GAP / 2 : CHUNK_V_GAP / 2,
                // allow vertical centering
                flexGrow: props.isOptionContent ? 1 : 0,
              }}
              onContentSizeChange={(w, h) => handleContentSizeChange(w)}
                style={{
                alignSelf: "stretch",
                width: "100%",
                marginBottom: CHUNK_V_GAP,
                flex: props.isOptionContent ? 1 : undefined,
              }}
              scrollEventThrottle={16}
              onScroll={RNAnimated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              onScrollBeginDrag={() => {
                console.log('[StringSplit] onScrollBeginDrag', props.uniqueId || props.isOptionContent);
                if (showHint && props.onInteractStart) props.onInteractStart();
              }}
              onScrollEndDrag={() => {
                console.log('[StringSplit] onScrollEndDrag', props.uniqueId || props.isOptionContent);
                if (showHint && props.onInteractEnd) props.onInteractEnd();
              }}
              onMomentumScrollBegin={() => {
                console.log('[StringSplit] onMomentumScrollBegin', props.uniqueId || props.isOptionContent);
                if (showHint && props.onInteractStart) props.onInteractStart();
              }}
              onMomentumScrollEnd={() => {
                console.log('[StringSplit] onMomentumScrollEnd', props.uniqueId || props.isOptionContent);
                if (showHint && props.onInteractEnd) props.onInteractEnd();
              }}
              onTouchStart={() => {
                console.log('[StringSplit] onTouchStart', props.uniqueId || props.isOptionContent);
                if (showHint && props.onInteractStart) props.onInteractStart();
              }}
              onTouchEnd={() => {
                console.log('[StringSplit] onTouchEnd', props.uniqueId || props.isOptionContent);
                if (showHint && props.onInteractEnd) props.onInteractEnd();
              }}
            >
              {showHint && <Text style={{ marginRight: 4 }}>➡️</Text>}
              <View style={props.isOptionContent ? style.optionEquationInner : undefined}>
                {(() => {
                  const rawTex = String(props.MCQ || "");
                  const pre = preprocessChemTex(rawTex);
                  // Pass TeX directly to MathJaxSvg without adding explicit \[ \] delimiters
                  const rendered = pre;
                  console.log('[StringSplit] RENDER_TEX:', { isOptionContent: !!props.isOptionContent, rendered });
                  return (
                    <MathJaxSvg
                      color="#FFFFFF"
                      fontSize={wp(4)}
                      style={[style.mathSvg, props.isOptionContent ? { alignSelf: 'flex-start' } : {}]}
                    >
                      {rendered}
                    </MathJaxSvg>
                  );
                })()}
              </View>
              {showHint && <Text style={{ marginLeft: 4 }}>⬅️</Text>}
            </ScrollView>
          </View>
        </>
      )}

      {props.keyName == "img" && (
        <>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: CHUNK_V_GAP / 2,
              marginBottom: CHUNK_V_GAP / 2,
              width: "100%",
            }}
          >
            {/* For images inside options, tapping the image should NOT open preview.
                Only the magnifying-glass icon should trigger preview/zoom. */}
            {props.isOptionContent ? (
              <View style={{ width: "100%", position: "relative" }}>
                <Image
                  source={{ uri: props.MCQ }}
                  style={
                    props.content === "explanation"
                      ? {
                          width: "100%",
                          maxWidth: "100%",
                          aspectRatio: 16 / 9,
                          resizeMode: "contain",
                          borderRadius: 8,
                          backgroundColor: "#f0f0f0",
                          alignSelf: "center",
                        }
                      : {
                          width: "100%",
                          maxWidth: "100%",
                          aspectRatio: 16 / 9,
                          resizeMode: "contain",
                          borderRadius: 8,
                          backgroundColor: "#f0f0f0",
                        }
                  }
                />
                <Pressable
                  onPress={() => {
                    if (props.onImagePress) {
                      props.onImagePress();
                    }
                    setPreviewVisible(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Open image preview"
                  style={style.magnifyIconWrap}
                >
                  <Icon name="search" size={18} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <View style={{ width: "100%", position: "relative" }}>
                <Pressable
                  onPress={() => {
                    setPreviewVisible(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Open image preview"
                  style={{ width: "100%" }}
                >
                  <Image
                    source={{ uri: props.MCQ }}
                    style={
                      props.content === "explanation"
                        ? {
                            width: "100%",
                            maxWidth: "100%",
                            aspectRatio: 16 / 9,
                            resizeMode: "contain",
                            borderRadius: 8,
                            backgroundColor: "#f0f0f0",
                            alignSelf: "center",
                          }
                        : {
                            width: "100%",
                            maxWidth: "100%",
                            aspectRatio: 16 / 9,
                            resizeMode: "contain",
                            borderRadius: 8,
                            backgroundColor: "#f0f0f0",
                          }
                    }
                  />
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (props.onImagePress) props.onImagePress();
                    setPreviewVisible(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Open image preview"
                  style={style.magnifyIconWrap}
                >
                  <Icon name="search" size={18} color="#fff" />
                </Pressable>
              </View>
            )}
          </View>

          <Modal
            visible={previewVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setPreviewVisible(false)}
          >
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Pressable
                style={style.previewOverlay}
                onPress={() => setPreviewVisible(false)}
              >
                <Pressable
                  style={style.previewCard}
                  onPress={() => {
                    // prevent overlay close
                  }}
                >
                  <Pressable
                    onPress={() => setPreviewVisible(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Close image preview"
                    style={style.previewClose}
                  >
                    <Text style={style.previewCloseText}>✕</Text>
                  </Pressable>

                  <ZoomablePreviewImage uri={String(props.MCQ)} />
                </Pressable>
              </Pressable>
            </GestureHandlerRootView>
          </Modal>
        </>
      )}
      {props.keyName == "txt" && (
        <Text
          ellipsizeMode="tail"
          style={[
            props.content === "question" ||
            props.content === "explanation" ||
            props.content === "note"
              ? style.fontQus
              : style.fontOp,
          ]}
        >
          {String(props.MCQ).trim()}
        </Text>
      )}
    </View>
  );
  // });
};

const style = StyleSheet.create({
  katex: {
    fontSize: wp(90),
    margin: 0,
    display: "flex",
    // color:'red',
    paddingVertical: "auto",
    paddingHorizontal: "auto",
    right: wp(20),
    color: "#FFFFFF",
  },
  fontQus: {
    fontSize: wp(4),
    color: COLORS.light,
    marginVertical: CHUNK_V_GAP,
    marginHorizontal: wp(1),
    lineHeight: hp(3),
    textAlign: "justify",
  },
  fontOp: {
    fontSize: wp(4),
    color: COLORS.light,
    marginHorizontal: wp(1),
    marginVertical: CHUNK_V_GAP,
    textAlign: "left",
    textAlignVertical: "center",
  },
  mathSvg: {
    transform: [{ scale: 0.9 }], // Scale down the content
    width: "100%",
    // Let the svg size itself so padding takes effect instead of forcing full height
    height: undefined,
    // Give equal space above and below the equation
    paddingTop: CHUNK_V_GAP / 2,
    paddingBottom: CHUNK_V_GAP / 2,
    marginBottom: 0,
    alignSelf: "flex-start",
  },
  equationContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    // ensure symmetric vertical spacing around equations
    paddingTop: CHUNK_V_GAP / 2,
    paddingBottom: CHUNK_V_GAP / 2,
    width: "100%",
  },
  optionEquationContainer: {
    overflow: "hidden",
  },
  optionEquationInner: {
    minWidth: "100%",
    alignSelf: "flex-start",
    justifyContent: "center",
    // also add vertical padding here to cover option-specific cases
    paddingTop: CHUNK_V_GAP / 2,
    paddingBottom: CHUNK_V_GAP / 2,
  },
  optionContentBlock: {
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: COLORS.dark80,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(4),
  },
  previewCard: {
    width: "100%",
    height: "75%",
    borderRadius: 12,
    backgroundColor: COLORS.dark,
    overflow: "hidden",
  },
  previewImageWrap: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.dark,
  },
  previewClose: {
    position: "absolute",
    top: 8,
    right: 10,
    zIndex: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewCloseText: {
    color: '#808080',
    fontSize: 18,
    fontWeight: "bold",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    backgroundColor: COLORS.dark,
  },
  scrollHint: {
    position: "absolute",
    top: -20,
    right: 10,
    fontSize: 14,
    color: "#FFF",
  },
  scrollContent: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingHorizontal: 0,
  },
  magnifyIconWrap: {
    position: "absolute",
    right: wp(2),
    bottom: wp(2),
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: wp(4),
    padding: wp(1.2),
    justifyContent: "center",
    alignItems: "center",
  },
});