import React from 'react';
import { Alert } from 'react-native';
import Button from '../../Button';
import tw from 'twrnc';
import { useTheme } from '../../../contexts/ThemeContext';
import { deleteAllFlashcards } from '../../../utils/flashcards';
import { clearAndReload } from '../../../utils/storageUtils';
import { firebase } from '../../../config/firebase';
import { SettingsScreenNavigationProp } from './SettingsScreen';
import Collapse from '../../Collapse';
import { useTranslation } from 'react-i18next';

type Props = {
  navigation: SettingsScreenNavigationProp;
};

const MoreSettings: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
      t('confirm_deletion'),
      t('confirm_deletion_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => deleteAllFlashcards(user.uid) },
      ]
    );
  };

  const themeClasses = theme.classes;

  return (
    <Collapse label={t('more')} hideLabel={t('less')} contentStyle={tw`mt-4`}>
      <Button
        mode="outlined"
        onPress={confirmDeleteAllFlashcards}
      >
        {t('delete_all_flashcards')}
      </Button>
      {__DEV__ && (
        <Button
          mode="outlined"
          onPress={clearAndReload}
          style={tw`${themeClasses.borderPrimary} ${themeClasses.textSecondary} mt-4`}
        >
          {t('hard_refresh_app')}
        </Button>
      )}
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={tw`${themeClasses.borderPrimary} ${themeClasses.textSecondary} mt-4`}
      >
        {t('logout')}
      </Button>
    </Collapse>
  );
};

export default MoreSettings;
