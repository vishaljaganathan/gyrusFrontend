import React, { useEffect, useMemo, useRef, useState } from "react";
import { View,  StyleSheet, Pressable, Image, TouchableOpacity, ActivityIndicator,  Modal, Alert , Dimensions, ScrollView, LayoutChangeEvent} from 'react-native'
import { CustomText as Text, CustomTextInput as TextInput } from './CustomText';

import { COLORS } from "../styles/themes";
import MathJaxSvg from "react-native-mathjax-svg";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons as Icon } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming } from "react-native-reanimated";



const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.min(Math.max(value, min), max);
};

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
      } })
    .onEnd(() => {
      if (scale.value <= 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0); } });

  const pan = Gesture.Pan()
    .onBegin(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (scale.value <= 1) return;

      const maxX =
        viewWidth.value > 0 ? (viewWidth.value * (scale.value - 1)) / 2 : 0;
      const maxY =
        viewHeight.value > 0 ? (viewHeight.value * (scale.value - 1)) / 2 : 0;

      translateX.value = clamp(
        savedTranslateX.value + e.translationX,
        -maxX,
        maxX
      );
      translateY.value = clamp(
        savedTranslateY.value + e.translationY,
        -maxY,
        maxY
      );
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
        translateY.value = withTiming(0); } });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value } ] };
  });

  return (
    <Pressable
      style={styles.previewImageWrap}
      onLayout={(e) => {
        viewWidth.value = e.nativeEvent.layout.width;
        viewHeight.value = e.nativeEvent.layout.height;
      }}
    >
      <GestureDetector gesture={composed}>
        <Animated.Image
          source={{ uri }}
            style={[styles.previewImage, animatedStyle]}
        />
      </GestureDetector>
    </Pressable>
  );
};

const ScrollableEquationCell = ({
  content,
  fontSize,
  onMeasure } : {
  content: string;
  fontFamily: 'AppFont-Regular', fontSize: number;
  onMeasure?: (w: number) => void;
}) => {
  // Render the equation without an inner horizontal ScrollView so the
  // table's outer horizontal ScrollView handles overflow. Measure the
  // rendered equation width and report it via `onMeasure` so the table
  // can expand the column if necessary.
  const handleInnerLayout = (e: LayoutChangeEvent) => {
    const w = Math.ceil(e.nativeEvent.layout.width);
    if (onMeasure) onMeasure(w);
  };

  return (
    <View style={styles.cellEquationWrap}>
      <View onLayout={handleInnerLayout}
            style={styles.cellEquationInnerMeasure}>
        <MathJaxSvg color="#FFFFFF" fontSize={fontSize}
            style={styles.mathSvg}>
          {String.raw`${content}`}
        </MathJaxSvg>
      </View>
    </View>
  );
};

const Table = (props: any) => {
  // Set to `true` to emit debug logs about measured widths and scrollability.
  const DEBUG_TABLE = true;
  const [tableWidth, setTableWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  
  const screenWidth = Dimensions.get("window").width;
  const scrollRef = useRef<ScrollView | null>(null);
  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const panStartOffset = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const parsed = useMemo(() => {
    try {
      if (!props || !props.data) {
        console.error('[Table] Missing props or data');
        return null;
      }
      if (typeof props.data !== 'string') {
        console.error('[Table] props.data is not a string:', typeof props.data);
        return null;
      }
      const parsedData = JSON.parse(props.data.slice(8));
      return {
        tableHead: parsedData.th || [],
        tableRow: parsedData.tr || [] };
    } catch (error) {
      console.error('[Table] Error parsing table data:', error);
      return null;
    }
  }, [props?.data]);

  if (!parsed) return null;

  // Safe early parser used before the main `parseCell` declaration below.
  const parseCellEarly = (value: any): { type: 'txt' | 'eq' | 'img'; content: string } => {
    const extractFirstDisplayStringLocal = (input: any, depth = 4, seen?: Set<any>): string | null => {
      if (input === null || input === undefined) return null;
      if (typeof input === 'string') return input;
      if (typeof input === 'number' || typeof input === 'boolean') return String(input);
      if (depth <= 0) return null;

      if (typeof input === 'object') {
        const localSeen = seen ?? new Set<any>();
        if (localSeen.has(input)) return null;
        localSeen.add(input);

        if (Array.isArray(input)) {
          for (const item of input) {
            const found = extractFirstDisplayStringLocal(item, depth - 1, localSeen);
            if (typeof found === 'string' && found.trim()) return found;
          }
          return null;
        }

        const obj: any = input;
        const preferredKeys = ['value', 'key', 'Text', 'content', 'label', 'title', 'name', 'uri', 'url', 'src'];
        for (const k of preferredKeys) {
          if (Object.prototype.hasOwnProperty.call(obj, k)) {
            const found = extractFirstDisplayStringLocal(obj[k], depth - 1, localSeen);
            if (typeof found === 'string' && found.trim()) return found;
          }
        }

        for (const v of Object.values(obj)) {
          const found = extractFirstDisplayStringLocal(v, depth - 1, localSeen);
          if (typeof found === 'string' && found.trim()) return found;
        }
      }

      return null;
    };

    const rawCandidate = extractFirstDisplayStringLocal(value);
    if (!rawCandidate) return { type: 'txt', content: '' };

    const raw = String(rawCandidate);
    if (!raw.includes('#*#')) {
      return { type: 'txt', content: raw };
    }

    const parts = raw.split('#*#');
    const t = (parts[0] || 'txt').trim();
    const c = parts.slice(1).join('#*#');
    if (t === 'eq' || t === 'img' || t === 'txt') {
      return { type: t, content: c };
    }
    return { type: 'txt', content: raw };
  };

  // If the parsed tableHead exists but all its cells are empty, treat
  // the table as having no header row so we don't render an empty header
  // (and avoid measuring it). This keeps small tables compact.
  const rawTableHead = parsed.tableHead;
  const tableHead = Array.isArray(rawTableHead)
    ? (() => {
        try {
          const hasContent = rawTableHead.some((h: any) => {
            const c = parseCellEarly(h).content;
            return typeof c === 'string' && String(c).trim().length > 0;
          });
          return hasContent ? rawTableHead : [];
        } catch (e) {
          return rawTableHead;
        } })()
    : [];
  const tableRow = parsed.tableRow;

  const normalizeRow = (row: any): any[] => {
    if (Array.isArray(row)) return row;
    if (row && typeof row === 'object') return Object.values(row);
    return [];
  };

  const extractFirstDisplayString = (input: any, depth = 4, seen?: Set<any>): string | null => {
    if (input === null || input === undefined) return null;
    if (typeof input === 'string') return input;
    if (typeof input === 'number' || typeof input === 'boolean') return String(input);
    if (depth <= 0) return null;

    if (typeof input === 'object') {
      const localSeen = seen ?? new Set<any>();
      if (localSeen.has(input)) return null;
      localSeen.add(input);

      if (Array.isArray(input)) {
        for (const item of input) {
          const found = extractFirstDisplayString(item, depth - 1, localSeen);
          if (typeof found === 'string' && found.trim()) return found;
        }
        return null;
      }

      const obj: any = input;
      const preferredKeys = ['value', 'key', 'Text', 'content', 'label', 'title', 'name', 'uri', 'url', 'src'];
      for (const k of preferredKeys) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
          const found = extractFirstDisplayString(obj[k], depth - 1, localSeen);
          if (typeof found === 'string' && found.trim()) return found;
        }
      }

      for (const v of Object.values(obj)) {
        const found = extractFirstDisplayString(v, depth - 1, localSeen);
        if (typeof found === 'string' && found.trim()) return found;
      }
    }

    return null;
  };

  const widestRow = (Array.isArray(tableRow) ? tableRow : []).reduce(
    (maxCols: number, row: any) => Math.max(maxCols, normalizeRow(row).length),
    Math.max(1, Array.isArray(tableHead) ? tableHead.length : 0)
  );
  const availableWidth = screenWidth * 0.92;

  const columnCount = Math.max(
    1,
    Array.isArray(tableHead) ? tableHead.length : 0,
    ...(Array.isArray(tableRow) ? tableRow.map((row: any) => normalizeRow(row).length) : [])
  );

  const parseCell = (value: any): { type: 'txt' | 'eq' | 'img'; content: string } => {
    const rawCandidate = extractFirstDisplayString(value);
    if (!rawCandidate) return { type: 'txt', content: '' };

    const raw = String(rawCandidate);
    if (!raw.includes('#*#')) {
      return { type: 'txt', content: raw };
    }

    const parts = raw.split('#*#');
    const t = (parts[0] || 'txt').trim();
    const c = parts.slice(1).join('#*#');
    if (t === 'eq' || t === 'img' || t === 'txt') {
      return { type: t, content: c };
    }
    // Unknown type: fall back to showing the full raw string.
    return { type: 'txt', content: raw };
  };

  // Measure intrinsic (unconstrained) widths offscreen, then render the table
  // using those exact column widths.
  const CELL_PADDING = 7;
  const CELL_BORDER = 1;
  // Ensure there is always some room to render Text inside a cell.
  // If MIN_COL_WIDTH is too small, padding+border can consume all inner space
  // and the table looks like "only structure".
  const MIN_CONTENT_WIDTH = 10;
  const MIN_COL_WIDTH = CELL_PADDING * 2 + CELL_BORDER * 2 + MIN_CONTENT_WIDTH;
  const [measuredColumnWidths, setMeasuredColumnWidths] = useState<number[] | null>(null);
  const measurementRef = useRef<{ maxByCol: number[]; seen: Set<string> }>({
    maxByCol: [],
    seen: new Set<string>() } );

  const expectedMeasurements = useMemo(() => {
    const headerCount = Array.isArray(tableHead) ? tableHead.length : 0;
    const bodyCount = Array.isArray(tableRow)
      ? tableRow.reduce((sum: number, row: any) => sum + (Array.isArray(row) ? row.length : 0), 0)
      : 0;
    return headerCount + bodyCount;
  }, [tableHead, tableRow]);

  useEffect(() => {
    measurementRef.current = { maxByCol: new Array(columnCount).fill(0), seen: new Set() };
    setMeasuredColumnWidths(null);
  }, [props?.data, columnCount]);

  useEffect(() => {
    if (measuredColumnWidths !== null) return;

    // Safety net: if some cells never report a measurable width (e.g. empty
    // Text, MathJax not laying out offscreen), finalize with whatever we have
    // so the table still displays.
    if (expectedMeasurements <= 0) {
      setMeasuredColumnWidths(new Array(columnCount).fill(MIN_COL_WIDTH));
      return;
    }

    const timer = setTimeout(() => {
      if (measuredColumnWidths !== null) return;
      const state = measurementRef.current;
      const baseWidths = (state.maxByCol.length
        ? state.maxByCol
        : new Array(columnCount).fill(0)
      ).map((w) => Math.max(MIN_COL_WIDTH, w || 0));

      // If some columns never measured (common when RN doesn't fire onLayout for
      // the hidden measurement pass), estimate widths from Text content so the
      // table doesn't degrade into an empty grid.
      const estimatedWidths = baseWidths.map((w, colIndex) => {
        if (w > MIN_COL_WIDTH) return w;

        let maxLen = 0;
        const headText = String(parseCell((Array.isArray(tableHead) ? tableHead[colIndex] : '')).content ?? '').trim();
        maxLen = Math.max(maxLen, headText.length);

        if (Array.isArray(tableRow)) {
          for (const row of tableRow) {
            const rowValues = normalizeRow(row);
            if (colIndex >= rowValues.length) continue;
            const parsed = parseCell(rowValues[colIndex]);
            if (parsed.type === 'img') continue;
            const s = String(parsed.content ?? '').trim();
            if (s.length > maxLen) maxLen = s.length;
          }
        }

        // Estimate width from the longest single word so words don't wrap mid-word.
        // Use responsive width per char (bold headers are wider than regular Text).
        const CHAR_PX = widthPercentageToDP(3); // responsive char width approximation
        // find longest word in head + cells for this column
        let maxWordLen = 0;
        const headWords = headText.split(/\s+/).filter(Boolean);
        headWords.forEach(w => { if (w.length > maxWordLen) maxWordLen = w.length; });
        if (Array.isArray(tableRow)) {
          for (const row of tableRow) {
            const rowValues = normalizeRow(row);
            if (colIndex >= rowValues.length) continue;
            const parsed = parseCell(rowValues[colIndex]);
            if (parsed.type === 'img') continue;
            const s = String(parsed.content ?? '').trim();
            const words = s.split(/\s+/).filter(Boolean);
            words.forEach(w => { if (w.length > maxWordLen) maxWordLen = w.length; });
          }
        }

        const cappedLen = Math.min(Math.max(maxWordLen, 1), 60);
        const estimated = CELL_PADDING * 2 + CELL_BORDER * 2 + cappedLen * CHAR_PX;
        return Math.max(MIN_COL_WIDTH, estimated);
      });

      let finalWidths = estimatedWidths.map((w) => Math.max(MIN_COL_WIDTH, w || 0));

      try {
        // If this Table was rendered specifically from an MCQ question field,
        // and any column contains images, give image-columns more width so images
        // inside question-tables are not tiny. Restrict to `keyName === 'question'`
        // to avoid affecting other table usages.
        // Boost for common MCQ content fields so images in explanations/options/notes
        // also get reasonable space: question, explanation, note, and option `value`.
        const boostKeys = new Set(['question', 'explanation', 'note', 'value']);
        if (props && props.MCQ && boostKeys.has(props.keyName)) {
          const imgCols = new Set<number>();

          // check header
          (Array.isArray(tableHead) ? tableHead : []).forEach((h: any, c: number) => {
            try {
              if (parseCell(h).type === 'img') imgCols.add(c);
            } catch { } });

          // check body rows
          (Array.isArray(tableRow) ? tableRow : []).forEach((row: any) => {
            const vals = normalizeRow(row);
            vals.forEach((v: any, c: number) => {
              try {
                if (parseCell(v).type === 'img') imgCols.add(c);
              } catch { } });
          });

          if (imgCols.size > 0) {
            const imgColsCount = imgCols.size;
            const otherColsCount = Math.max(0, columnCount - imgColsCount);

            // Allocate 60% of available width to image columns, rest to others.
            const imgTotal = Math.floor(availableWidth * 0.6);
            const otherTotal = Math.max(0, availableWidth - imgTotal);

            const imgWidth = Math.max(MIN_COL_WIDTH, Math.floor(imgTotal / imgColsCount));
            const otherWidth = Math.max(MIN_COL_WIDTH, otherColsCount > 0 ? Math.floor(otherTotal / otherColsCount) : Math.floor((availableWidth - imgWidth * imgColsCount) / Math.max(1, columnCount)));

            const adjusted = new Array(columnCount).fill(otherWidth);
            // Preserve estimated widths for non-image columns where possible so
            // long Text doesn't get forced into extremely narrow columns.
            for (let ci = 0; ci < columnCount; ci++) {
              if (imgCols.has(ci)) {
                adjusted[ci] = imgWidth;
              } else {
                const est = (estimatedWidths && estimatedWidths[ci]) || MIN_COL_WIDTH;
                adjusted[ci] = Math.max(otherWidth, Math.max(MIN_COL_WIDTH, est));
              }
            }
            finalWidths = adjusted;
          }
        }
      } catch (e) {
        console.error('[Table] Error adjusting widths for image columns:', e);
      }

      setMeasuredColumnWidths(finalWidths);
    }, 900);

    return () => clearTimeout(timer);
  }, [measuredColumnWidths, expectedMeasurements, columnCount]);

  const reportMeasurement = (key: string, colIndex: number, contentWidth: number) => {
    const state = measurementRef.current;
    if (state.seen.has(key)) return;

    state.seen.add(key);
    const safeContentWidth = Number.isFinite(contentWidth) ? Math.max(0, Math.ceil(contentWidth)) : 0;
    // IMPORTANT: match render box model exactly (content + padding + border)
    // so short tokens like "(A)" don't wrap due to off-by-a-few pixels.
    // Add 8px safety buffer so sub-pixel rounding never causes word-wrap.
    const padded = Math.max(
      MIN_COL_WIDTH,
      safeContentWidth + CELL_PADDING * 2 + CELL_BORDER * 2 + 8
    );
    state.maxByCol[colIndex] = Math.max(state.maxByCol[colIndex] || 0, padded);

    if (state.seen.size >= expectedMeasurements && expectedMeasurements > 0) {
      const finalWidths = state.maxByCol.map((w) => Math.max(MIN_COL_WIDTH, w || 0));
      setMeasuredColumnWidths(finalWidths);
    }
  };

  const columnWidths = measuredColumnWidths;
  // Compute the exact content width from measured column widths.
  // Do NOT force a minimum of availableWidth here â€” if the table is
  // naturally smaller than the screen, keep it small so the ScrollView
  // doesn't get treated as overflowing due to parent paddings.
  const tableContentWidth = columnWidths
    ? Math.max(0, columnWidths.reduce((sum, width) => sum + width, 0))
    : availableWidth;
  // Prefer runtime-measured content/container widths when available so the
  // scrollability decision survives hot-reloads and navigation reloads.
  const effectiveContentWidth = contentWidth || tableContentWidth;
  const effectiveContainerWidth = containerWidth || availableWidth;

  // Add a small tolerance to avoid showing the horizontal scrollbar for
  // sub-pixel or tiny measurement differences. Also ensure we consider the
  // measured table content width as authoritative when deciding scrollability.
  const displayedContentWidth = Math.max(effectiveContentWidth, tableContentWidth);
  const SCROLL_TOLERANCE_PX = 6; // small buffer to avoid false positives

  // Account for the ScrollView contentContainer horizontal padding when
  // deciding whether content truly overflows the container. This prevents
  // the padding from causing a false-positive scrollable state.
  const totalScrollPadding = widthPercentageToDP(1) + widthPercentageToDP(4);

  // Prefer the actual rendered `tableWidth` (from onLayout) if available,
  // otherwise fall back to measured content widths. This avoids false
  // positives when measurement/estimation differs from the real layout.
  const renderedTableWidth = tableWidth && tableWidth > 0 ? tableWidth : displayedContentWidth;

  // Sometimes containerWidth can be slightly smaller than the device's
  // available width due to parent layout; prefer the larger of the two
  // when determining whether the table truly needs horizontal scrolling.
  const effectiveViewportWidth = Math.max(effectiveContainerWidth, availableWidth);

  // If the rendered table fits within the screen's available width (with tolerance),
  // don't treat it as scrollable even if containerWidth was reported smaller.
  const fitsAvailable = renderedTableWidth + totalScrollPadding <= availableWidth + SCROLL_TOLERANCE_PX;

  const isHorizontallyScrollable = !fitsAvailable && (renderedTableWidth + totalScrollPadding > effectiveViewportWidth + SCROLL_TOLERANCE_PX);
  const maxScrollX = Math.max(0, effectiveContentWidth - effectiveContainerWidth);
  const canScrollLeft = isHorizontallyScrollable && scrollOffsetX > 5;
  const canScrollRight = isHorizontallyScrollable && scrollOffsetX < maxScrollX - 5;
  // Only show a visible custom scrollbar when the overflow exceeds tolerance
  const overflowAmount = Math.max(0, (renderedTableWidth + totalScrollPadding) - effectiveViewportWidth);
  const shouldShowScrollTrack = isHorizontallyScrollable && overflowAmount > SCROLL_TOLERANCE_PX;

  const scrollBy = (delta: number) => {
    if (!scrollRef.current) return;
    const curr = scrollOffsetX || 0;
    const next = Math.max(0, Math.min(maxScrollX, Math.round(curr + delta)));
    try {
      scrollRef.current.scrollTo({ x: next, animated: true });
    } catch (err) {}
  };
  const scrollLeft = () => scrollBy(-Math.round(availableWidth * 0.6));
  const scrollRight = () => scrollBy(Math.round(availableWidth * 0.6));

  // No custom pan gesture â€” rely on ScrollView's nestedScrollEnabled and
  // directionalLockEnabled to allow horizontal scrolling inside vertical parent.

  if (DEBUG_TABLE) {
    try {
      console.log('[Table][DEBUG] availableWidth:', availableWidth);
      console.log('[Table][DEBUG] containerWidth:', containerWidth);
      console.log('[Table][DEBUG] contentWidth:', contentWidth);
      console.log('[Table][DEBUG] tableContentWidth:', tableContentWidth);
      console.log('[Table][DEBUG] tableWidth(rendered):', tableWidth);
      console.log('[Table][DEBUG] displayedContentWidth:', displayedContentWidth);
      console.log('[Table][DEBUG] totalScrollPadding:', totalScrollPadding);
      console.log('[Table][DEBUG] effectiveContainerWidth:', effectiveContainerWidth);
      console.log('[Table][DEBUG] isHorizontallyScrollable:', isHorizontallyScrollable);
    } catch (e) {}
  }

  return (
    <View style={styles.wrapper}>
      {/* Offscreen measurement pass (intrinsic widths) */}
      {measuredColumnWidths === null ? (
        <View style={styles.measureWrap} pointerEvents="none">
          <View style={styles.measureRow}>
            {tableHead.map((res: any, c: number) => (
              <Text
                key={`mh-${c}`}
                numberOfLines={1}
                onLayout={(e) => reportMeasurement(`h-${c}`, c, e.nativeEvent.layout.width)}
            style={styles.measureHeadText}
              >
                {String(parseCell(res).content ?? '').trim()}
              </Text>
            ))}
          </View>

          {(Array.isArray(tableRow) ? tableRow : []).map((row: any, r: number) => (
            <View key={`mr-${r}`}
            style={styles.measureRow}>
              {normalizeRow(row).map((value: any, c: number) => {
                const { type: cellType, content: cellContentRaw } = parseCell(value);
                const cellContent = String(cellContentRaw ?? '').trim();
                const key = `c-${r}-${c}`;

                if (cellType === 'eq') {
                  return (
                    <View key={key} onLayout={(e) => reportMeasurement(key, c, e.nativeEvent.layout.width)}
            style={styles.measureCell}>
                      <MathJaxSvg color="#FFFFFF" fontSize={widthPercentageToDP(4.3)}
            style={styles.measureMathSvg}>
                        {String.raw`${cellContent}`}
                      </MathJaxSvg>
                    </View>
                  );
                }

                if (cellType === 'img') {
                  // Images have no intrinsic layout width until loaded; estimate a reasonable width
                  // based on available table width per column so question tables get larger images.
                  // Keep a robust fallback so non-question tables keep reasonable image sizes.
                  const perCol = Math.max(1, columnCount);
                  const estimatedFromTable = Math.floor((availableWidth / perCol) * 0.9);
                  const imgWidth = Math.min(availableWidth, Math.max(widthPercentageToDP(70), estimatedFromTable));
                  return (
                    <View
                      key={key}
            style={[styles.measureCell, { width: imgWidth }]}
                      onLayout={(e) => reportMeasurement(key, c, e.nativeEvent.layout.width)}
                    />
                  );
                }

                return (
                  <Text
                    key={key}
                    numberOfLines={1}
                    onLayout={(e) => reportMeasurement(key, c, e.nativeEvent.layout.width)}
            style={styles.measureCellText}
                  >
                    {cellContent}
                  </Text>
                );
              })}
            </View>
          ))}
        </View>
      ) : null}

      {/* Render table once widths are measured */}
      {columnWidths ? (
      <View style={{ position: 'relative', width: '100%' }} onLayout={(e) => setContainerWidth(Math.max(0, e.nativeEvent.layout.width))}>
      <ScrollView
        ref={scrollRef}
        horizontal
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        scrollEnabled={isHorizontallyScrollable}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={(w, h) => setContentWidth(Math.max(0, w))}
        onStartShouldSetResponderCapture={(e) => {
          const t = (e.nativeEvent as any);
          touchStartRef.current = { x: t.pageX, y: t.pageY };
          return false;
        }}
        onMoveShouldSetResponderCapture={(e) => {
          const t = (e.nativeEvent as any);
          const s = touchStartRef.current;
          if (!s) return false;
          const dx = t.pageX - s.x;
          const dy = t.pageY - s.y;
          return Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2;
        }}
        onScroll={(e) => setScrollOffsetX(e.nativeEvent.contentOffset.x)}
              scrollEventThrottle={16}
              contentContainerStyle={[
                styles.scrollContent,
                { justifyContent: isHorizontallyScrollable ? 'flex-start' : 'center' } ]}
      >
        {/* Table Container */}
        <View
            style={[styles.table, { width: tableContentWidth }]}
            onLayout={(e) => setTableWidth(Math.max(0, e.nativeEvent.layout.width))}
          >
          {/* Table Head */}
          <View style={styles.table_head}>
            {tableHead.map((res: any, index: any) => {
              const headText = String(parseCell(res).content ?? '').trim();
              return (
                <View
                  key={index}
            style={{
                    width: columnWidths[index] ?? MIN_COL_WIDTH,
                    borderWidth: CELL_BORDER,
                    borderColor: "#ddd",
                    padding: CELL_PADDING,
                    alignItems: 'center',
                    justifyContent: 'center' } }
                >
                  <Text style={styles.table_head_captions}>{headText}</Text>
                </View>
              );
            })}
          </View>

        {/* Table Body - Single Row */}
          {(Array.isArray(tableRow) ? tableRow : []).map((res: any, index: any) => {
            const rowValues = normalizeRow(res);
            return (
              <View key={index}
            style={styles.table_body_single_row}>
                {rowValues.map((value: any, k: any) => {
                try {
                  const { type: cellType, content: cellContent } = parseCell(value);
                  const cellWidth = columnWidths[k] ?? MIN_COL_WIDTH;

                  return (
                    <View
                      key={k}
            style={{
                        width: cellWidth,
                        borderWidth: CELL_BORDER,
                        borderColor: "#ddd",
                        padding: CELL_PADDING,
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        overflow: 'visible'
                      } }
                    // ensure cell is at least as tall as the row measurement
                    // so MathJaxSvg isn't visually clipped by sibling cells
                    // (React Native sometimes requires explicit minHeight)
                    // apply measuredRowHeights[index] when available
                    >
                      {cellType === "eq" ? (
                        <View style={{ overflow: 'visible', width: '100%' }}>
                        <ScrollableEquationCell
                          content={cellContent}
                          fontFamily="AppFont-Regular"
                          fontSize={widthPercentageToDP(4.3)}
                          onMeasure={() => {}}
                        />
                        </View>
                      ) : cellType === "img" ? (
                        <View style={{ width: "100%", position: 'relative' }}>
                          <Pressable
                            onPress={() => {
                              setPreviewUri(cellContent);
                              setPreviewVisible(true);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Open image preview"
                            style={{ width: '100%' }}
                          >
                              <Image
                                source={{ uri: cellContent }}
            style={{
                                  width: cellWidth - (CELL_PADDING * 2) - (CELL_BORDER * 2),
                                  height: (cellWidth - (CELL_PADDING * 2) - (CELL_BORDER * 2)) * 0.6,
                                  resizeMode: "contain" } }
                              />
                          </Pressable>

                          <Pressable
                            onPress={() => {
                              setPreviewUri(cellContent);
                              setPreviewVisible(true);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="Open image preview"
                            style={styles.magnifyIconWrap}
                          >
                            <Icon name="search" size={16} color="#fff" />
                          </Pressable>
                        </View>
                      ) : (
                        <Text style={styles.table_data}>{String(cellContent).trim()}</Text>
                      )}
                    </View>
                  );
                } catch (cellError) {
                  console.error(`[Table] Error processing cell at row ${index}, col ${k}:`, cellError);
                  return (
                    <View
                      key={k}
            style={{
                        width: columnWidths[k] ?? MIN_COL_WIDTH,
                        borderWidth: CELL_BORDER,
                        borderColor: "#ddd",
                        padding: CELL_PADDING,
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        overflow: 'visible' } }
                    >
                      <Text style={styles.table_data}>Error</Text>
                    </View>
                  );
                } })}
              </View>
            );
          })}

        {/* <View style={{ width: "45%" }}>
            <Text style={styles.table_data}>All data</Text>
          </View> */}

        {/* Table Body - Single Row */}
        </View>
      </ScrollView>

        {/* Always-visible custom horizontal scroll bar */}
        {shouldShowScrollTrack ? (
          <View style={styles.scrollTrack} pointerEvents="none">
            <View
              style={[
                styles.scrollThumb,
                {
                  width: Math.max(30, (effectiveContainerWidth / Math.max(1, effectiveContentWidth)) * effectiveContainerWidth),
                  transform: [{
                    translateX:
                      (scrollOffsetX / Math.max(1, maxScrollX)) *
                      Math.max(0, effectiveContainerWidth - Math.max(30, (effectiveContainerWidth / Math.max(1, effectiveContentWidth)) * effectiveContainerWidth)) } ] } ]}
            />
          </View>
        ) : null}
      </View>
      ) : null}

      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Pressable
            style={styles.previewOverlay}
            onPress={() => setPreviewVisible(false)}
          >
            <Pressable
              style={styles.previewCard}
            onPress={() => {
                // prevent overlay close
              }}
            >
              <Pressable
                onPress={() => setPreviewVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close image preview"
                style={styles.previewClose}
              >
                <Text
                  style={styles.previewCloseText}
                >
                  ✖
                </Text>
              </Pressable>

              {previewUri ? <ZoomablePreviewImage uri={previewUri} /> : null}
            </Pressable>
          </Pressable>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

export default Table;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignSelf: 'stretch',
  },
  scrollContent: {
    paddingLeft: widthPercentageToDP(1),
    paddingRight: widthPercentageToDP(4),
    alignItems: 'center',
  },
  table_head: {
    flexDirection: 'row',
    backgroundColor: '#2C4B48',
  },
  table_head_captions: {
    fontFamily: 'AppFont-Bold',
    fontSize: widthPercentageToDP(4.3),
    color: 'white',
    textAlign: 'center',
    width: '100%',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  table_body_single_row: {
    backgroundColor: '#2C4B48',
    flexDirection: 'row',
    color: '#FFF',
  },
  table_data: {
    fontFamily: 'AppFont-Regular',
    fontSize: widthPercentageToDP(4.3),
    color: '#FFF',
    flexWrap: 'wrap',
    lineHeight: Math.round(widthPercentageToDP(4.3) * 1.6),
    textAlign: 'left',
    alignSelf: 'stretch',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  table: {
    marginVertical: 15,
    marginHorizontal: 0,
    elevation: 1,
    alignSelf: 'center',
  },
  mathSvg: {
    marginBottom: 0,
    alignSelf: 'center',
    paddingVertical: 6,
    height: undefined,
    overflow: 'visible',
  },
  cellEquationWrap: {
    width: '100%',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEquationInnerMeasure: {
    alignSelf: 'center',
    overflow: 'visible',
  },
  measureWrap: {
    position: 'absolute',
    opacity: 0,
    width: 10000,
    transform: [{ translateX: -10000 }],
  },
  measureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },
  measureCell: {
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  measureHeadText: {
    fontFamily: 'AppFont-Bold',
    fontSize: widthPercentageToDP(4.3),
    color: 'white',
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  measureCellText: {
    fontFamily: 'AppFont-Regular',
    fontSize: widthPercentageToDP(4.3),
    color: '#FFF',
    lineHeight: 22,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  measureMathSvg: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    minHeight: 56,
    flexShrink: 0,
  },
  scrollTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    marginHorizontal: widthPercentageToDP(1),
    marginBottom: 8,
    overflow: 'hidden',
  },
  scrollThumb: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 2,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: COLORS.dark80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: widthPercentageToDP(4),
  },
  previewCard: {
    width: '100%',
    height: '75%',
    borderRadius: 12,
    backgroundColor: COLORS.dark,
    overflow: 'hidden',
  },
  previewImageWrap: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.dark,
  },
  previewClose: {
    position: 'absolute',
    top: 8,
    right: 10,
    zIndex: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewCloseText: {
    color: '#808080',
    fontFamily: 'AppFont-Regular',
    fontSize: 18,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: COLORS.dark,
  },
  magnifyIconWrap: {
    position: 'absolute',
    right: widthPercentageToDP(2),
    bottom: widthPercentageToDP(2),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: widthPercentageToDP(4),
    padding: widthPercentageToDP(1.2),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
