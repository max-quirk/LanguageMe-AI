import React, { useState } from 'react';
import { View } from 'react-native';
import { Menu, IconButton } from 'react-native-paper';
import tw from 'twrnc';
import { useTheme } from '../../../contexts/ThemeContext';
import Entypo from 'react-native-vector-icons/Entypo';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
        title={showTranslations ? t('hide_translations') : t('show_translations')}
      />
      <Menu.Item
        onPress={() => {
          setReverseOrder(!reverseOrder);
          closeMenu();
        }}
        title={reverseOrder ? t('order_added_latest_earliest') : t('order_added_earliest_latest')}
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
