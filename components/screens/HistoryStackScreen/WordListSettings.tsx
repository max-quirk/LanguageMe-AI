import React, { useState } from 'react';
import { View } from 'react-native';
import { Menu, IconButton } from 'react-native-paper';
import tw from 'twrnc';
import { useTheme } from '../../../contexts/ThemeContext';
import Entypo from 'react-native-vector-icons/Entypo';

type WordListSettingsProps = {
  showTranslations: boolean;
  setShowTranslations: (value: boolean) => void;
  reverseOrder: boolean;
  setReverseOrder: (value: boolean) => void;
};

const WordListSettings: React.FC<WordListSettingsProps> = ({
  showTranslations,
  setShowTranslations,
  reverseOrder,
  setReverseOrder,
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  // Pre-rendered Menu items
  const menuItems = (
    <>
      <Menu.Item
        onPress={() => {
          setShowTranslations(!showTranslations);
          closeMenu();
        }}
        title={showTranslations ? 'Hide translations' : 'Show translations'}
      />
      <Menu.Item
        onPress={() => {
          setReverseOrder(!reverseOrder);
          closeMenu();
        }}
        title={reverseOrder ? 'Order added latest-earliest' : 'Order added earliest-latest'}
      />
    </>
  );

  return (
    <View style={tw`flex-row justify-end items-center mb-0 absolute right-0 top-[-6px]`}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<IconButton icon={() => <Entypo name="dots-three-vertical" size={20} color={theme.colors.textPrimary} />} onPress={openMenu} />}
      >
        {menuItems}
      </Menu>
    </View>
  );
};

export default WordListSettings;
