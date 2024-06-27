import React from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import { Portal, Dialog } from 'react-native-paper';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import Button from './Button';

type HelperPopupProps = {
  title: string;
  text: string;
  visible: boolean;
  onClose: () => void;
};

const HelperPopup: React.FC<HelperPopupProps> = ({ title, text, visible, onClose }) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onClose}>
        <View style={tw`flex flex-row items-center pl-6`}>
          <Icon name="magic-wand" size={25} />
          <Dialog.Title style={tw`capitalize ml-5`}>{title}</Dialog.Title>
        </View>
        <Dialog.Content>
          <Text style={tw`text-base`}>{text}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button mode="contained" onPress={onClose} style={tw`bg-purple-600 w-[100px]`}>
            Got it
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default HelperPopup;
