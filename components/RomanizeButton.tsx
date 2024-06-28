import React from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';

type RomanizeButtonProps = {
  show: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const RomanizeButton: React.FC<RomanizeButtonProps> = ({ show, onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[tw`w-12 h-12 flex flex-row items-center`, style]}>
      {show ? (
        <Icon name="eye" size={24} color="black" />
      ) : (
        <Icon name="eye-off" size={24} color="black" />
      )}
    </TouchableOpacity>
  );
};

export default RomanizeButton;
