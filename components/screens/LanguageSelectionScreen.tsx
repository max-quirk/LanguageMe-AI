import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Text, Menu, Provider } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import languages from '../../utils/languages';
import tw from 'twrnc';
import iso6391 from 'iso-639-1';
import { RootStackParamList } from '../../types';

type LanguageSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LanguageSelection'>;

const LanguageSelectionScreen: React.FC = () => {
  const navigation = useNavigation<LanguageSelectionScreenNavigationProp>();
  const [nativeLanguage, setNativeLanguage] = useState<string>('en');
  const [visible, setVisible] = useState<boolean>(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  return (
    <Provider>
      <View style={tw`flex-1 justify-center p-5`}>
        <Text style={tw`text-2xl mb-4 text-center`}>Select Your Native Language</Text>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={<Button onPress={openMenu}>{iso6391.getName(nativeLanguage)}</Button>}
        >
          <ScrollView style={{ maxHeight: 300 }}>
            {languages.map((lang) => (
              <Menu.Item
                key={lang.code}
                onPress={() => {
                  setNativeLanguage(lang.code);
                  closeMenu();
                }}
                title={lang.name}
              />
            ))}
          </ScrollView>
        </Menu>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('TargetLanguageSelection', { nativeLanguage })}
          style={tw`mt-4`}
        >
          Next
        </Button>
      </View>
    </Provider>
  );
};

export default LanguageSelectionScreen;
