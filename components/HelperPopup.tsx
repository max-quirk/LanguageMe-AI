import React from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import { Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import Button from './Button';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';

type HelperPopupProps = {
  title: string;
  text: string;
  visible: boolean;
  onClose: () => void;
};

const HelperPopup: React.FC<HelperPopupProps> = ({ title, text, visible, onClose }) => {
  const { theme } = useTheme();

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose}>
        <View style={tw`flex flex-row items-center pl-6`}>
          <Icon name="magic-wand" size={25} color={theme.colors.textPrimary} />
          <Text style={tw`capitalize ml-5 text-xl font-bold ${theme.classes.textPrimary}`}>{title}</Text>
        </View>
        <View style={tw`p-6`}>
          <Text style={tw`text-base ${theme.classes.textSecondary}`}>{text}</Text>
        </View>
        <View style={tw`flex-row justify-end`}>
          <Button mode="contained" onPress={onClose} style={tw`bg-purple-600 w-[100px]`}>
            Got it
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default HelperPopup;
