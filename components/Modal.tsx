import React from 'react';
import { View } from 'react-native';
import { Dialog, IconButton, Portal } from 'react-native-paper';
import tw from 'twrnc';
import { useTheme } from '../contexts/ThemeContext';

type ModalProps = {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ visible, onDismiss, children }) => {
  const { theme } = useTheme();

  return (
    <Portal>
      {visible && <View style={tw`absolute inset-0 bg-black bg-opacity-50`} />}
      <Dialog visible={visible} onDismiss={onDismiss} style={tw`${theme.classes.backgroundTertiary} relative pt-8`}>
        <View style={tw`absolute right-0 top-[-20px] z-100`}>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
            iconColor={theme.colors.textPrimary}
          />
        </View>
        {children}
      </Dialog>
    </Portal>
  );
};

export default Modal;
