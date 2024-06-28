import React, { useState } from 'react';
import { View, ScrollView, ViewStyle } from 'react-native';
import { Menu, Text, IconButton } from 'react-native-paper';
import tw from 'twrnc';
import iso6391, { LanguageCode } from 'iso-639-1';
import Button from './Button';
import languages from '../utils/languages';
import { useTheme } from '../contexts/ThemeContext';

type Props = {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (language: LanguageCode) => void;
  centerText?: boolean;
  style?: ViewStyle | ViewStyle[]
};

const LanguageSelector: React.FC<Props> = ({ 
  selectedLanguage, 
  onSelectLanguage, 
  centerText,
  style
}) => {
  const [visible, setVisible] = useState(false);
  const { theme } = useTheme();
  const themeClasses = theme.classes;

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={style}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button 
            mode="outlined" 
            onPress={openMenu} 
            style={tw`${themeClasses.backgroundTertiary} ${themeClasses.borderPrimary}`}
          >
            <View style={tw`border-gray-300 text-gray-800 flex flex-row justify-center items-center pt-1 ${centerText ? 'relative' : ''}`}>
              <Text style={tw`${themeClasses.textSecondary}`}>{iso6391.getName(selectedLanguage)}</Text>
              <View style={tw`flex items-center justify-center ${centerText ? 'absolute left-12 bottom-[-6px]' : ''}`}>
                <IconButton 
                  icon={visible ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  style={tw`m-0 pt-2 mr-[-18px]`} 
                  iconColor={`${theme.colors.textSecondary}`}
                />
              </View>
            </View>
          </Button>
        }
      >
        <ScrollView style={{ maxHeight: 300 }}>
          {languages.map((lang) => (
            <Menu.Item
              key={lang.code}
              onPress={() => {
                if (lang.code !== '') {
                  onSelectLanguage(lang.code);
                }
                closeMenu();
              }}
              title={lang.name}
            />
          ))}
        </ScrollView>
      </Menu>
    </View>
  );
};

export default LanguageSelector;
