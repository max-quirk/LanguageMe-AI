import React, { useState } from 'react';
import { View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '../../config/firebase';
import tw from 'twrnc';
import { RootStackParamList } from '../../types';
import Button from '../Button';
import ThemedTextInput from '../ThemedTextInput';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

type FirebaseAuthError = {
  message: string;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      navigation.navigate('LanguageSelection'); 
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      setError(firebaseError.message);
      console.error('Error registering:', error);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={tw`flex-1 justify-center p-5 ${theme.classes.backgroundPrimary}`}>
          <View style={tw`flex items-center`}>
            <Image source={require('../../assets/images/logo-full.png')} style={tw`w-60 h-60 mb-6`} />
          </View>
          <Text style={tw`text-xl mb-4 ${theme.classes.textPrimary}`}>{t('register')}</Text>
          {error && <Text style={tw`text-red-500 mb-4`}>{error}</Text>}
          <ThemedTextInput
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <ThemedTextInput
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <Button
            mode="contained"
            onPress={handleRegister}
            style={tw`mt-4 bg-purple-600`}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" style={tw`pt-[3px]`} /> : t('register')}
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={tw`mt-2 ${theme.classes.textPrimary}`}
          >
            {t('already_have_account')}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
