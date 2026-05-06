import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

type Props = TextInputProps & {
  placeholder?: string;
  placeholderStyle?: TextStyle;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
};

const PlaceholderTextInput = forwardRef<TextInput, Props>((props, ref) => {
  const {
    placeholder,
    placeholderStyle,
    containerStyle,
    inputStyle,
    value: propValue,
    onChangeText,
    onFocus,
    onBlur,
    style,
    ...rest
  } = props;

  const [value, setValue] = useState<string>((propValue as string) ?? '');
  const [focused, setFocused] = useState(false);

  const currentValue = propValue !== undefined ? (propValue as any) : value;
  
  // Try to determine horizontal padding from styles so placeholder aligns with cursor
  const flattenedInputStyle = StyleSheet.flatten([inputStyle, style]) || {};
  const paddingLeft = 
    (flattenedInputStyle as any).paddingLeft ?? 
    (flattenedInputStyle as any).paddingHorizontal ?? 
    12;

  // try to determine input height from provided styles so placeholder can be vertically centered
  const inputHeight = flattenedInputStyle.height as number | undefined;
  // Pass flex/width from input style to container so it stretches properly
  const containerFlex = (flattenedInputStyle as any).flex;
  const containerWidth = (flattenedInputStyle as any).width;

  const textAlign = (flattenedInputStyle as any).textAlign || 'left';
  const isCentered = textAlign === 'center';

  return (
    <View style={[styles.container, containerStyle, containerFlex !== undefined && { flex: containerFlex }, containerWidth !== undefined && { width: containerWidth }]}>
      {!currentValue && !focused && placeholder ? (
        <View 
          style={[
            styles.placeholderContainer, 
            isCentered ? { left: 0, right: 0 } : { left: paddingLeft },
            inputHeight ? { height: inputHeight } : { top: 0, bottom: 0 }
          ]}
          pointerEvents="none"
        >
          <Text
            style={[
              styles.placeholder,
              isCentered && { textAlign: 'center' },
              placeholderStyle,
              { includeFontPadding: false }
            ]}
          >
            {placeholder}
          </Text>
        </View>
      ) : null}

      <TextInput
        {...rest}
        ref={ref}
        value={currentValue}
        onChangeText={(t) => {
          if (propValue === undefined) setValue(t);
          onChangeText && onChangeText(t);
        }}
        onFocus={(e) => {
          setFocused(true);
          onFocus && onFocus(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur && onBlur(e);
        }}
        style={[styles.input, inputStyle, style]}
      />
    </View>
  );
});

export default PlaceholderTextInput;

const styles = StyleSheet.create({
  container: { position: 'relative' },
  placeholderContainer: {
    position: 'absolute',
    justifyContent: 'center',
    zIndex: 1,
  },
  placeholder: {
    color: '#999',
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});
