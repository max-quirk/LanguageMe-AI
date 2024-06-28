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

const Button: React.FC<ButtonProps> = ({ style, contentStyle, labelStyle, ...props }) => {
  const { theme } = useTheme();
  let buttonTypeStyle;
  let buttonTypeContentStyle;
  let buttonTypeLabelStyle;

  switch (props.mode) {
    case 'contained':
      buttonTypeStyle = tw`bg-purple-600`;
      buttonTypeContentStyle = tw`text-white`;
      buttonTypeLabelStyle = tw`text-white`;
      break;
    case 'outlined':
      buttonTypeStyle = tw`${theme.classes.backgroundTertiary} ${theme.classes.borderPrimary}`;
      buttonTypeLabelStyle = tw`text-purple-600`;
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
      style={[tw`h-11 justify-center`, buttonTypeStyle, style]}
      contentStyle={[tw`h-11`, buttonTypeContentStyle, contentStyle]}
      labelStyle={[buttonTypeLabelStyle, labelStyle]}
    />
  );
};

export default Button;
