import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { Text, ActivityIndicator, Divider } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '../../../config/firebase';
import Button from '../../Button';
import tw from 'twrnc';
import { LanguageCode } from 'iso-639-1';
import { RootStackParamList } from '../../../types';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import BackgroundView from '../../BackgroundView';
import LanguageSelector from '../../LanguageSelector';
import MoreSettings from './MoreSettings';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { saveLanguages, nativeLanguage, targetLanguage, displayLanguage } = useContext(LanguageContext);
  const { theme, toggleTheme } = useTheme();
  const [formNativeLanguage, setFormNativeLanguage] = useState<LanguageCode>(nativeLanguage);
  const [formTargetLanguage, setFormTargetLanguage] = useState<LanguageCode>(targetLanguage);
  const [formDisplayLanguage, setFormDisplayLanguage] = useState<LanguageCode>(displayLanguage);

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(firebase.auth().currentUser);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  if (!user) return null;

  const handleSaveLanguages = async () => {
    setLoading(true);
    try {
      await firebase.firestore().collection('users').doc(user.uid).set({
        nativeLanguage: formNativeLanguage,
        targetLanguage: formTargetLanguage,
      });
      saveLanguages({
        nativeLanguage: formNativeLanguage, 
        targetLanguage: formTargetLanguage,
        displayLanguage: formDisplayLanguage,
      });
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

  const themeClasses = theme.classes;
  const languageSelectorClasses = tw`w-32`;

  return (
    <BackgroundView style={tw`${themeClasses.backgroundPrimary}`}>
      <ScrollView contentContainerStyle={tw`p-5 pt-40 `}>
        <Text style={tw`${themeClasses.textPrimary} text-3xl text-center mb-8 font-bold`}>{t('settings')}</Text>

        <View style={tw`mb-6 flex flex-row items-center justify-between`}>
          <Text style={tw`${themeClasses.textPrimary} text-base mb-2`}>{t('native_language')}:</Text>
          <LanguageSelector
            selectedLanguage={formNativeLanguage}
            onSelectLanguage={setFormNativeLanguage}
            style={languageSelectorClasses}
          />
        </View>

        <View style={tw`mb-6 flex flex-row items-center justify-between`}>
          <Text style={tw`${themeClasses.textPrimary} text-base mb-2`}>{t('target_language')}:</Text>
          <LanguageSelector
            selectedLanguage={formTargetLanguage}
            onSelectLanguage={setFormTargetLanguage}
            style={languageSelectorClasses}
          />
        </View>

        <View style={tw`mb-6 flex flex-row items-center justify-between`}>
          <Text style={tw`${themeClasses.textPrimary} text-base mb-2`}>{t('display_language')}:</Text>
          <LanguageSelector
            selectedLanguage={formDisplayLanguage}
            onSelectLanguage={setFormDisplayLanguage}
            style={languageSelectorClasses}
            languageOptions={[formNativeLanguage, formTargetLanguage]}
          />
        </View>

        <View style={tw`mb-6 flex flex-row items-center justify-between`}>
          <Text style={tw`${themeClasses.textPrimary} text-base mb-2`}>{t('theme')}:</Text>
          <TouchableOpacity style={tw`flex-row items-center rounded w-12 h-12`} onPress={toggleTheme}>
            <Icon
              name={theme.dark ? 'white-balance-sunny' : 'weather-night'}
              color={theme.colors.textPrimary}
              size={24}
              onPress={toggleTheme}
            />
          </TouchableOpacity>
        </View>

        <Button
          mode="contained"
          onPress={handleSaveLanguages}
          style={tw`bg-purple-600 mb-4`}
          labelStyle={tw`text-white`}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : (success ? t('saved') : t('save'))}
        </Button>

        <Divider style={tw`my-4`} />

        <MoreSettings navigation={navigation} />
      </ScrollView>
    </BackgroundView>
  );
};

export default SettingsScreen;
