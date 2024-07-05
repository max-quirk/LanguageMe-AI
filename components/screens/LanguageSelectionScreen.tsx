import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { LanguageCode } from 'iso-639-1';
import { RootStackParamList } from '../../types';
import Button from '../Button';
import LanguageSelector from '../LanguageSelector';
import { useTheme } from '../../contexts/ThemeContext';

type LanguageSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LanguageSelection'>;

const LanguageSelectionScreen: React.FC = () => {
  const navigation = useNavigation<LanguageSelectionScreenNavigationProp>();
  const { theme } = useTheme();
  const themeClasses = theme.classes;
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>('en');

  return (
    <View style={tw`flex-1 justify-center p-5 ${themeClasses.backgroundPrimary}`}>
      <Text style={tw`text-2xl mb-2 text-center ${themeClasses.textPrimary}`}>Select Your Native Language</Text>
      <LanguageSelector
        selectedLanguage={nativeLanguage}
        onSelectLanguage={setNativeLanguage}
        style={tw`py-3`}
      />
      <Button
        mode="contained"
        onPress={() => navigation.navigate('TargetLanguageSelection', { nativeLanguage })}
        style={tw`mt-4`}
      >
        Next
      </Button>
    </View>
  );
};

export default LanguageSelectionScreen;
