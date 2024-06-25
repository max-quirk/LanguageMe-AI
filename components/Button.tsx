import React from 'react';
import { ViewStyle } from 'react-native';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import tw from 'twrnc';

interface ButtonProps extends PaperButtonProps {
  style?: ViewStyle | ViewStyle[];
  contentStyle?: ViewStyle | ViewStyle[];
}

const Button: React.FC<ButtonProps> = ({ style, contentStyle, ...props }) => {
  return (
    <PaperButton
      {...props}
      style={[tw`h-11 justify-center`, style]} 
      contentStyle={[tw`h-11`, contentStyle]}
    />
  );
};

export default Button;
