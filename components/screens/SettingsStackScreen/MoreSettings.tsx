import React, { useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import Button from '../../Button';
import tw from 'twrnc';
import { useTheme } from '../../../contexts/ThemeContext';
import { deleteAllFlashcards } from '../../../utils/flashcards';
import { clearAndReload } from '../../../utils/storageUtils';
import { firebase } from '../../../config/firebase';
import { SettingsScreenNavigationProp } from './SettingsScreen';

type Props = {
  navigation: SettingsScreenNavigationProp;
};

const MoreSettings: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [dangerZoneVisible, setDangerZoneVisible] = useState<boolean>(false);
  const user = firebase.auth().currentUser;
  if (!user) return null;

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

  const themeClasses = theme.classes;

  return (
    <>
      <TouchableOpacity
        onPress={() => setDangerZoneVisible(!dangerZoneVisible)}
        style={tw`flex flex-row justify-between items-center h-11`}
      >
        <Text style={tw`font-bold ${themeClasses.textPrimary}`}>{dangerZoneVisible ? 'Less' : 'More'}</Text>
        <IconButton icon={dangerZoneVisible ? 'chevron-up' : 'chevron-down'} size={20} iconColor={theme.colors.textPrimary}/>
      </TouchableOpacity>
      {dangerZoneVisible && (
        <View style={tw`mt-4`}>
          <Button
            mode="outlined"
            onPress={confirmDeleteAllFlashcards}
          >
            Delete All Flashcards
          </Button>
          <Button
            mode="outlined"
            onPress={clearAndReload}
            style={tw`${themeClasses.borderPrimary} ${themeClasses.textSecondary} mt-4`}
          >
            Hard Refresh App
          </Button>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={tw`${themeClasses.borderPrimary} ${themeClasses.textSecondary} mt-4`}
          >
            Logout
          </Button>
        </View>
      )}
    </>
  );
};

export default MoreSettings;
