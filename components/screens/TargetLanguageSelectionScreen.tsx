import React, { useState, useEffect, useContext } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '../../config/firebase';
import tw from 'twrnc';
import { RootStackParamList } from '../../types';
import { LanguageContext } from '../../contexts/LanguageContext';
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
  const { saveLanguages } = useContext(LanguageContext);
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

  const handleFinish = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        await firebase.firestore().collection('users').doc(user.uid).set({
          nativeLanguage,
          targetLanguage,
        });
        saveLanguages(nativeLanguage, targetLanguage);
        navigation.navigate('Main', { screen: 'Home' });
      } else {
        console.error('No user is authenticated');
      }
    } catch (error) {
      console.error('Error saving languages:', error);
    }
  };

  return (
    <View style={tw`flex-1 justify-center px-5 mt-[-100px] ${themeClasses.backgroundPrimary}`}>
      <Text style={tw`text-2xl text-center mb-4 ${themeClasses.textPrimary}`}>Select Your Target Language</Text>
      <LanguageSelector
        selectedLanguage={targetLanguage}
        onSelectLanguage={setTargetLanguage}
        centerText
        style={tw`py-3`}
      />
      <Button
        mode="contained"
        onPress={handleFinish}
        style={tw`mt-4`}
      >
        Let&apos;s go
      </Button>
    </View>
  );
};

export default TargetLanguageSelectionScreen;
