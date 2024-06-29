import { useTheme } from '../contexts/ThemeContext';
import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import tw from 'twrnc';

interface ButtonProps extends PaperButtonProps {
  style?: ViewStyle | ViewStyle[];
  contentStyle?: ViewStyle | ViewStyle[];
  labelStyle?: TextStyle | TextStyle[];
}

const Button: React.FC<ButtonProps> = ({ style, contentStyle, labelStyle, disabled, ...props }) => {
  const { theme, isDarkTheme } = useTheme();
  let buttonTypeStyle;
  let buttonTypeContentStyle;
  let buttonTypeLabelStyle;

  switch (props.mode) {
    case 'contained':
      buttonTypeStyle = disabled ? tw`bg-gray-400` : tw`bg-purple-600`;
      buttonTypeContentStyle = tw`text-white`;
      buttonTypeLabelStyle = tw`text-white`;
      break;
    case 'outlined':
      buttonTypeStyle = tw`${theme.classes.backgroundTertiary} ${theme.classes.borderPrimary}`;
      buttonTypeLabelStyle = isDarkTheme ? tw`text-purple-300` : tw`text-purple-600`;
      break;
    default:
      buttonTypeStyle = '';
      buttonTypeContentStyle = '';
      buttonTypeLabelStyle = '';
      break;
  }

  return (
    <PaperButton
      {...props}
      disabled={disabled}
      style={[tw`h-11 justify-center`, buttonTypeStyle, style]}
      contentStyle={[tw`h-11`, buttonTypeContentStyle, contentStyle]}
      labelStyle={[buttonTypeLabelStyle, labelStyle]}
    />
  );
};

export default Button;
