import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Menu, Provider } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '../../config/firebase';
import Button from '../Button';

import languages from '../../utils/languages';
import tw from 'twrnc';
import iso6391 from 'iso-639-1';
import { RootStackParamList } from '../../types';
import { LanguageContext } from '../../contexts/LanguageContext';

type TargetLanguageSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TargetLanguageSelection'>;
type TargetLanguageSelectionScreenRouteProp = RouteProp<RootStackParamList, 'TargetLanguageSelection'>;

type Props = {
  navigation: TargetLanguageSelectionScreenNavigationProp;
  route: TargetLanguageSelectionScreenRouteProp;
};

const TargetLanguageSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { nativeLanguage } = route.params;
  const { saveLanguages } = useContext(LanguageContext);
  const [targetLanguage, setTargetLanguage] = useState<string>('es');
  const [visible, setVisible] = useState<boolean>(false);
  
  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);
  useEffect(() => {
    const checkAuthStatus = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        // Redirect to login screen if not authenticated
        navigation.navigate('Login'); 
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
        console.log('saved targetLanguage: ', targetLanguage)
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
      <View style={tw`flex-1 justify-center p-5`}>
        <Text style={tw`text-2xl text-center mb-4`}>Select Your Target Language</Text>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={<Button onPress={openMenu}>{iso6391.getName(targetLanguage)}</Button>}
        >
          <ScrollView style={{ maxHeight: 300 }}>
            {languages.map((lang) => (
              <Menu.Item
                key={lang.code}
                onPress={() => {
                  setTargetLanguage(lang.code);
                  closeMenu();
                }}
                title={lang.name}
              />
            ))}
          </ScrollView>
        </Menu>
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
