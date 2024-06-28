import React, { useState, useEffect, useContext } from 'react';
import { View } from 'react-native';
import { Provider, Text } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '../../config/firebase';
import tw from 'twrnc';
import { RootStackParamList } from '../../types';
import { LanguageContext } from '../../contexts/LanguageContext';
import Button from '../Button';
import LanguageSelector from '../LanguageSelector';
import { LanguageCode } from 'iso-639-1';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'TargetLanguageSelection'>;
  route: RouteProp<RootStackParamList, 'TargetLanguageSelection'>;
};

const TargetLanguageSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
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
    <Provider>
      <View style={tw`flex-1 justify-center px-5 mt-[-100px]`}>
        <Text style={tw`text-2xl text-center mb-4`}>Select Your Target Language</Text>
        <LanguageSelector
          selectedLanguage={targetLanguage}
          onSelectLanguage={setTargetLanguage}
        />
        <Button
          mode="contained"
          onPress={handleFinish}
          style={tw`mt-4 bg-purple-600`}
        >
          Let&apos;s go
        </Button>
      </View>
    </Provider>
  );
};

export default TargetLanguageSelectionScreen;
