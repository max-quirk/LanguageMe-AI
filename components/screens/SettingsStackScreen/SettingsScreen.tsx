import React, { useState, useContext } from 'react';
import { View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Menu, Provider, ActivityIndicator, Divider, IconButton } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '../../../config/firebase';
import Button from '../../Button';

import languages from '../../../utils/languages';
import tw from 'twrnc';
import iso6391, { LanguageCode } from 'iso-639-1';
import { RootStackParamList } from '../../../types';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { deleteAllFlashcards } from '../../../utils/flashcards';
import { clearAndReload } from '../../../utils/storageUtils';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { saveLanguages, nativeLanguage, targetLanguage } = useContext(LanguageContext);
  const [formNativeLanguage, setFormNativeLanguage] = useState<LanguageCode>(nativeLanguage);
  const [formTargetLanguage, setFormTargetLanguage] = useState<LanguageCode>(targetLanguage);

  const [nativeVisible, setNativeVisible] = useState<boolean>(false);
  const [targetVisible, setTargetVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [dangerZoneVisible, setDangerZoneVisible] = useState<boolean>(false);

  const openNativeMenu = () => setNativeVisible(true);
  const closeNativeMenu = () => setNativeVisible(false);
  const openTargetMenu = () => setTargetVisible(true);
  const closeTargetMenu = () => setTargetVisible(false);
  const user = firebase.auth().currentUser;
  if (!user) return null;

  const handleSaveLanguages = async () => {
    setLoading(true);
    try {
      await firebase.firestore().collection('users').doc(user.uid).set({
        nativeLanguage,
        targetLanguage,
      });
      saveLanguages(formNativeLanguage, formTargetLanguage);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigation.navigate('Main', { screen: 'Home' });
      }, 2000);
    } catch (error) {
      console.error('Error saving languages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const confirmDeleteAllFlashcards = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete all flashcards?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAllFlashcards(user.uid) },
      ]
    );
  };

  return (
    <Provider>
      <View style={tw`flex-1 justify-center p-5 bg-gray-100`}>
        <Text style={tw`text-3xl text-center mb-8 font-bold text-gray-800`}>Settings</Text>

        <View style={tw`mb-6 flex flex-row items-center justify-between`}>
          <Text style={tw`text-base mb-2 text-gray-600`}>Native Language</Text>
          <Menu
            visible={nativeVisible}
            onDismiss={closeNativeMenu}
            anchor={
              <Button mode="outlined" onPress={openNativeMenu} style={tw`border-gray-300 text-gray-800`}>
                {iso6391.getName(formNativeLanguage)}
                <View style={tw`flex items-center justify-center`}>
                  <IconButton 
                    icon={targetVisible ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    style={tw`m-0 pt-2 mr-[-18px]`} 
                  />
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
                      setFormNativeLanguage(lang.code);
                    }
                    closeNativeMenu();
                  }}
                  title={lang.name}
                />
              ))}
            </ScrollView>
          </Menu>
        </View>

        <View style={tw`mb-6 flex flex-row items-center justify-between`}>
          <Text style={tw`text-base mb-2 text-gray-600`}>Target Language</Text>
          <Menu
            visible={targetVisible}
            onDismiss={closeTargetMenu}
            anchor={
              <Button 
                mode="outlined" 
                onPress={openTargetMenu} 
                style={tw`border-gray-300 text-gray-800 flex flex-row justify-between items-center`}
              >
                {iso6391.getName(formTargetLanguage)}
                <View style={tw`flex items-center justify-center`}>
                  <IconButton 
                    icon={targetVisible ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    style={tw`m-0 pt-2 mr-[-18px]`} 
                  />
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
                      setFormTargetLanguage(lang.code);
                    }
                    closeTargetMenu();
                  }}
                  title={lang.name}
                />
              ))}
            </ScrollView>
          </Menu>
        </View>

        <Button
          mode="contained"
          onPress={handleSaveLanguages}
          style={tw`bg-purple-600 mb-`}
          labelStyle={tw`text-white`}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : (success ? 'Saved!' : 'Save')}
        </Button>

        <Divider style={tw`my-4`} />

        <TouchableOpacity
          onPress={() => setDangerZoneVisible(!dangerZoneVisible)}
          style={tw`flex flex-row justify-between items-center h-11`}
        >
          <Text style={tw`font-bold`}>{dangerZoneVisible ? 'More' : 'More'}</Text>
          <IconButton icon={dangerZoneVisible ? 'chevron-up' : 'chevron-down'} size={20} />
        </TouchableOpacity>
        {dangerZoneVisible && (
          <View style={tw`mt-4`}>
            <Button
              mode="outlined"
              onPress={confirmDeleteAllFlashcards}
              style={tw`border-gray-300 text-gray-800`}
            >
              Delete All Flashcards
            </Button>
            <Button
              mode="outlined"
              onPress={clearAndReload}
              style={tw`border-gray-300 text-gray-800 mt-4`}
            >
              Hard Refresh App
            </Button>
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={tw`border-gray-300 text-gray-800 mt-4`}
            >
              Logout
            </Button>
          </View>
        )}
      </View>
    </Provider>
  );
};

export default SettingsScreen;
