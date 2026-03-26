import { Dimensions, PixelRatio } from 'react-native';
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
const fontScale = PixelRatio.getFontScale();
const horizontalScale = (size: number) => {
    const { width, height } = Dimensions.get('window');

    return (width / guidelineBaseWidth) * size
};
const verticalScale = (size: number) => {
    const { width, height } = Dimensions.get('window');

    return(height / guidelineBaseHeight) * size
};
const moderateScale = (size: number, factor = 0.5) => {
    return(size + (horizontalScale(size) - size) * factor)
};
export { horizontalScale, verticalScale, moderateScale };