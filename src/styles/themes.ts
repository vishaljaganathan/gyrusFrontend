import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Error
  error01: 'rgba(246, 86, 93, 1)',
  error02: 'rgba(246, 86, 93, 0.8)',
  error03: 'rgba(246, 86, 93, 0.6)',
  error04: 'rgba(246, 86, 93, 0.2)',
  error05: 'rgba(246, 86, 93, 0.08)',
  error06: 'RGB(255 32 32)',


  // Primary
  primary01: 'rgba(0, 209, 255, 0.85)',
  primary02: 'rgba(2, 188, 188, 1)',
  primary03: 'rgba(10, 184, 173, 1)',
  primary05: 'rgba(0, 148, 148, 1)',
  primary06: 'rgba(2, 134, 134, 1)',
  primary07: 'rgba(9, 163, 163, 0.75)',
  primary08: 'rgba(64, 182, 175, 0.84)',
  primary09: 'rgba(0, 254, 179, 0.88)',
  one: "#283F38",
  two: "#0AB8AD",
  three: "#0AB8AD",
  four: "#0AB8AD",
  five: "#3E4543",



  // Secondary
  secondary01: '#00474ceb',
  secondary02: '#003c31ff',
  secondary03: 'rgba(4, 182, 0, 1)',
  secondary04: 'rgba(197, 255, 244, 0.5)',
  secondary07: 'rgba(120, 255, 244, 0.5)',
  secondary05: 'rgba(0, 71, 76, 0.67)',
  secondary06: 'rgba(11, 73, 55, 1)',

  // Yellow
  yellow01: ' rgba(233, 209, 0, 1)',
  yellow02: 'rgba(244, 220, 0, 1)',
  yellow03: 'rgba(219, 134, 6, 1)',

  // Success 
  success01: 'rgba(33, 163, 0, 1)',
  success02: 'rgba(4, 182, 0, 1)',
  success03: 'rgba(158, 255, 0, 1)',


  // Dark
  dark: 'rgba(13, 15, 35, 1)',
  dark80: 'rgba(13, 15, 35, 0.8)',
  dark60: 'rgba(13, 15, 35, 0.6)',
  dark20: 'rgba(13, 15, 35, 0.2)',
  dark08: 'rgba(13, 15, 35, 0.08)',

  // Grey
  grey: 'rgba(80, 83, 82, 1)',
  grey01: 'rgba(160, 160, 160, 1)',
  grey02: 'rgba(255, 255, 255, 0.19)',
  grey60: 'rgba(160, 161, 180, 0.6)',
  grey20: 'rgba(160, 161, 180, 0.2)',
  grey08: 'rgba(160, 161, 180, 0.08)',
  grey09: 'rgba(189, 189, 189, 1)',

  // Light Grey
  lightGrey: 'rgba(255, 255, 255, 0.51)',
  lightGrey10: 'rgba(158, 158, 158, 1)',
  lightGrey80: 'rgba(217, 217, 217, 1)',
  lightGrey60: 'rgba(238, 238, 238, 1)',
  lightGrey20: 'rgba(220, 220, 220, 0.79)',
  lightGrey21: 'rgba(86, 83, 83, 1)',
  lightGrey08: 'rgba(247, 247, 247, 0.08)',
  Arrowgray: 'rgba(174, 173, 173, 1)',


  // Light
  light: 'rgba(255, 255, 255, 1)',
  light80: 'rgba(255, 255, 255, 0.8)',
  light60: 'rgba(255, 255, 255, 0.6)',
  light20: 'rgba(255, 255, 255, 0.2)',
  light08: 'rgba(255, 255, 255, 0.08)',

  // Answer success Support 1
  answer_succs01: 'rgba(33, 163, 0, 1)',
  answer_succs02: 'rgba(158, 255, 0, 1)',

  //Answer Wrong Support 2
  answer_wrong01: 'rgba(255, 0, 0, 1)',
  answer_wrong02: 'rgba(255, 77, 0, 1)',

  //Button enable Support 3
  button_enable01: 'rgba(0, 183, 194, 1)',
  button_enable02: 'rgba(197, 255, 244, 0.5)',

  //Button disable Support 4
  button_disable01: 'rgba(137, 137, 137, 1)',
  button_disable02: 'rgba(197, 255, 244, 0.5)',

  colorLightgray: "rgba(204, 204, 204, 0.7)",
  colorWhite: "#fff",
  colorSilver: "#c0c0c0",
};
export const katexInlineStyle = `
html, body {
  display: flex;
  background-color: #fafafa;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: 0;
  padding: 0;
}
.katex {
  font-size: 4em;
  margin: 0;
  display: flex;
  padding: 12px 10px;

}
`;
export const SIZES = {
  // global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,

  // font sizes
  largeTitle: 40,
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  h5: 12,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,

  // app dimensions
  width,
  height,
};

export const FONTS = {
  largeTitle: { fontFamily: 'Manrope-VariableFont_wght', fontSize: SIZES.largeTitle, textAlign: 'justify' },
  h1: {
    fontFamily: 'Manrope-VariableFont_wght',
    fontSize: SIZES.h1,
    lineHeight: 36,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'justify',
  },
  h2: { fontFamily: 'Manrope-VariableFont_wght', fontSize: SIZES.h2, lineHeight: 30, textAlign: 'justify' },
  h3: { fontFamily: 'Manrope-VariableFont_wght', fontSize: SIZES.h3, lineHeight: 22, textAlign: 'justify' },
  h4: { fontFamily: 'Manrope-VariableFont_wght', fontSize: SIZES.h4, lineHeight: 22, textAlign: 'justify' },
  h5: { fontFamily: 'Manrope-VariableFont_wght', fontSize: SIZES.h5, lineHeight: 22, textAlign: 'justify' },
  body1: { fontFamily: 'Manrope-VariableFont_wght', fontSize: SIZES.body1, lineHeight: 36, textAlign: 'justify' },
  body2: { fontFamily: 'Manrope-VariableFont_wght', fontSize: SIZES.body2, lineHeight: 30, textAlign: 'justify' },
  body3: { fontFamily: 'Manrope-VariableFont_wght', fontSize: SIZES.body3, lineHeight: 22, textAlign: 'justify' },
  body4: { fontFamily: 'Manrope-VariableFont_wght', fontSize: SIZES.body4, lineHeight: 22, textAlign: 'justify' },
  body5: { fontFamily: 'Manrope-VariableFont_wght', fontSize: SIZES.body5, lineHeight: 22, textAlign: 'justify' },
};

// export const darkTheme = {
//   backgroundColor: COLORS.darkBackground,
// };

// export const lightTheme = {
//   backgroundColor: COLORS.white,
// };

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;

/* fonts */
export const FontFamily = {
  palanquinBold: "Palanquin-Bold",
};
/* font sizes */
export const FontSize = {
  size_21xl: 40,
};
/* Colors */
export const Color = {
  colorLightgray: "rgba(204, 204, 204, 0.7)",
  colorWhite: "#fff",
  colorSilver: "#c0c0c0",
};
/* border radiuses */
export const Border = {
  br_3xs: 10,
};