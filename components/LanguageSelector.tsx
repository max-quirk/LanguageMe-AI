import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Menu, Text, IconButton } from 'react-native-paper';
import tw from 'twrnc';
import iso6391, { LanguageCode } from 'iso-639-1';
import Button from './Button';
import languages from '../utils/languages';

type Props = {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (language: LanguageCode) => void;
  title?: string;
};

const LanguageSelector: React.FC<Props> = ({ selectedLanguage, onSelectLanguage, title }) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={tw`mb-3`}>
      <Text style={tw`text-base mb-2 text-gray-600`}>{title}</Text>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        contentStyle={tw`flex-row items-center justify-between`}

        anchor={
          <Button mode="outlined" onPress={openMenu} style={tw`border-gray-300 text-gray-800`}>
            <View style={tw`border-gray-300 text-gray-800 flex flex-row justify-center items-center pt-1 relative`}>
              <Text style={tw`font-medium`}>{iso6391.getName(selectedLanguage)}</Text>
              <View style={tw`flex items-center justify-center absolute left-13`}>
                <IconButton 
                  icon={visible ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  style={tw`m-0 pt-1`} 
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
                if (lang.code != '') {
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
