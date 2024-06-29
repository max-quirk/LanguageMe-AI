import React from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import { Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import Button from './Button';
import Modal from './Modal'; 

type HelperPopupProps = {
  title: string;
  text: string;
  visible: boolean;
  onClose: () => void;
};

const HelperPopup: React.FC<HelperPopupProps> = ({ title, text, visible, onClose }) => {
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose}>
        <View style={tw`flex flex-row items-center pl-6`}>
          <Icon name="magic-wand" size={25} />
          <Text style={tw`capitalize ml-5 text-xl font-bold`}>{title}</Text>
        </View>
        <View style={tw`p-6`}>
          <Text style={tw`text-base`}>{text}</Text>
        </View>
        <View style={tw`flex-row justify-end p-4`}>
          <Button mode="contained" onPress={onClose} style={tw`bg-purple-600 w-[100px]`}>
            Got it
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default HelperPopup;
