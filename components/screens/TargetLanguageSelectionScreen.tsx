import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '../../config/firebase';
import tw from 'twrnc';
import { RootStackParamList } from '../../types';
import Button from '../Button';
import LanguageSelector from '../LanguageSelector';
import { LanguageCode } from 'iso-639-1';
import { useTheme } from '../../contexts/ThemeContext';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'TargetLanguageSelection'>;
  route: RouteProp<RootStackParamList, 'TargetLanguageSelection'>;
};

const TargetLanguageSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const themeClasses = theme.classes;
  const { nativeLanguage } = route.params;
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('es');

  useEffect(() => {
    const checkAuthStatus = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        navigation.navigate('Login'); // Redirect to login screen if not authenticated
      }
    };

    checkAuthStatus();
  }, [navigation]);

  return (
    <View style={tw`flex-1 justify-center px-5 mt-[-100px] ${themeClasses.backgroundPrimary}`}>
      <Text style={tw`text-2xl text-center mb-4 ${themeClasses.textPrimary}`}>Select Your Target Language</Text>
      <LanguageSelector
        selectedLanguage={targetLanguage}
        onSelectLanguage={setTargetLanguage}
        style={tw`py-3`}
      />
      <Button
        mode="contained"
        onPress={() => navigation.navigate('DisplayLanguageSelection', { nativeLanguage, targetLanguage })}
        style={tw`mt-4`}
      >
        Next
      </Button>
    </View>
  );
};

export default TargetLanguageSelectionScreen;
