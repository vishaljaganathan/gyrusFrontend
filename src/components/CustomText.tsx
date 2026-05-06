import { Text as RNText, TextProps, TextInput as RNTextInput, TextInputProps, StyleSheet, Animated, TextStyle } from 'react-native';
import { moderateScale } from '../styles/Responsive';
import PlaceholderTextInput from './PlaceholderTextInput';

// Custom Text wrapper that forces AppFont-Regular
export const CustomText: React.FC<TextProps> = (props) => {
  const { style, ...otherProps } = props;
  const mergedStyle = {
    ...StyleSheet.flatten(style),
  } as any;
  // Allow explicit bold requests: either via fontWeight: '700' or explicit AppFont-Bold
  const requestedWeight = mergedStyle?.fontWeight;
  const requestedFamily = mergedStyle?.fontFamily;
  if (requestedWeight === '700' || requestedWeight === 700 || requestedFamily === 'AppFont-Bold' || requestedWeight === '800' || requestedWeight === '900' || requestedWeight === 'bold') {
    mergedStyle.fontFamily = 'AppFont-Bold';
    mergedStyle.fontWeight = '900'; // Increase weight for bold
  } else {
    mergedStyle.fontFamily = 'AppFont-Regular';
    delete mergedStyle.fontWeight;
  }
  // Remove style props to avoid Android font mismatch issues
  delete mergedStyle.fontStyle;
  mergedStyle.includeFontPadding = false;

  return (
    <RNText
      {...otherProps}
      allowFontScaling={false}
      style={mergedStyle}
    />
  );
};

// Custom TextInput wrapper that forces AppFont-Regular
export const CustomTextInput: React.FC<TextInputProps & { placeholderStyle?: TextStyle }> = (props) => {
  const { style, placeholderStyle, placeholderTextColor, placeholder, ...otherProps } = props as any;

  const mergedStyle = {
    fontFamily: 'AppFont-Regular',
    includeFontPadding: false,
    textAlignVertical: 'center',
    ...StyleSheet.flatten(style),
  } as any;
  // Respect bold requests on TextInput as well
  const inputRequestedWeight = mergedStyle?.fontWeight;
  const inputRequestedFamily = mergedStyle?.fontFamily;
  if (inputRequestedWeight === '700' || inputRequestedWeight === 700 || inputRequestedFamily === 'AppFont-Bold' || inputRequestedWeight === '800' || inputRequestedWeight === '900' || inputRequestedWeight === 'bold') {
    mergedStyle.fontFamily = 'AppFont-Bold';
    mergedStyle.fontWeight = '900';
  } else {
    mergedStyle.fontFamily = 'AppFont-Regular';
    delete mergedStyle.fontWeight;
  }
  delete mergedStyle.fontStyle;

  const mergedPlaceholderStyle = {
    color: placeholderTextColor || '#999',
    fontFamily: mergedStyle.fontFamily,
    fontSize: mergedStyle.fontSize || moderateScale(15),
    ...StyleSheet.flatten(placeholderStyle),
  } as any;
  // allow placeholderStyle to request bold font
  const phRequestedWeight = mergedPlaceholderStyle?.fontWeight;
  const phRequestedFamily = mergedPlaceholderStyle?.fontFamily;
  if (phRequestedWeight === '700' || phRequestedWeight === 700 || phRequestedFamily === 'AppFont-Bold' || phRequestedWeight === '800' || phRequestedWeight === '900' || phRequestedWeight === 'bold') {
    mergedPlaceholderStyle.fontFamily = 'AppFont-Bold';
    mergedPlaceholderStyle.fontWeight = '900';
  } else {
    delete mergedPlaceholderStyle.fontWeight;
  }

  return (
    <PlaceholderTextInput
      {...otherProps}
      placeholder={placeholder}
      placeholderStyle={mergedPlaceholderStyle}
      inputStyle={mergedStyle}
      allowFontScaling={false}
    />
  );
};

export const CustomAnimatedText: React.FC<any> = (props) => {
  const { style, ...otherProps } = props;
  const mergedStyle = {
    ...StyleSheet.flatten(style),
  } as any;
  const aRequestedWeight = mergedStyle?.fontWeight;
  const aRequestedFamily = mergedStyle?.fontFamily;
  if (aRequestedWeight === '800' || aRequestedWeight === 700 || aRequestedFamily === 'AppFont-Bold' || aRequestedWeight === '900' || aRequestedWeight === 'bold') {
    mergedStyle.fontFamily = 'AppFont-Bold';
    mergedStyle.fontWeight = '900';
  } else {
    mergedStyle.fontFamily = 'AppFont-Regular';
    delete mergedStyle.fontWeight;
  }
  delete mergedStyle.fontStyle;
  mergedStyle.includeFontPadding = false;

  return (
    <Animated.Text
      {...otherProps}
      allowFontScaling={false}
      style={mergedStyle}
    />
  );
};

// Custom Bold Text wrapper that forces AppFont-Bold
export const CustomBoldText: React.FC<TextProps> = (props) => {
  const { style, ...otherProps } = props;
  const mergedStyle = {
    ...StyleSheet.flatten(style),
  } as any;
  delete mergedStyle.fontStyle;
  mergedStyle.fontFamily = 'AppFont-Bold';
  mergedStyle.fontWeight = '900';
  mergedStyle.includeFontPadding = false;

  return (
    <RNText
      {...otherProps}
      allowFontScaling={false}
      style={mergedStyle}
    />
  );
};
