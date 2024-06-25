import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';

interface BackButtonProps {
  onPress: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={tw`w-12 h-12 justify-center items-center ml-4`}>
    <Icon name="arrow-left" size={25} color="black" />
  </TouchableOpacity>
);

export default BackButton;
