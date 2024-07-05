import React, { useState, useContext } from 'react';
import { View, Image } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import tw from 'twrnc';
import { LanguageContext } from '../../contexts/LanguageContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { firebase } from '../../config/firebase';
import Button from '../Button';
import ThemedTextInput from '../ThemedTextInput';
import { useTheme } from '../../contexts/ThemeContext';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

type FirebaseAuthError = {
  code: string;
  message: string;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { saveLanguages } = useContext(LanguageContext);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = firebase.auth().currentUser;
      if (user) {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const data = userDoc.data();
        if (data && data.nativeLanguage && data.targetLanguage) {
          saveLanguages(data.nativeLanguage, data.targetLanguage);
          navigation.navigate('Main', { screen: 'Home' });
        } else {
          navigation.navigate('LanguageSelection');
        }
      }
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      console.info('firebaseError: ', firebaseError.code)

      if (firebaseError.code === 'auth/invalid-credential') {
        setError('Email or password not found. Please try again.');
      } else {
        setError(firebaseError.message);
      }
    }
    setLoading(false);
  };

  return (
    <View style={tw`flex-1 justify-center mt-12 p-5 ${theme.classes.backgroundPrimary}`}>
      <View style={tw`flex items-center`}>
        <Image source={require('../../assets/images/logo-full.png')} style={tw`w-70 h-70 mb-6`} />
      </View>
      <Text style={tw`text-xl mb-4 ${theme.classes.textPrimary}`}>Login</Text>
      {error && <Text style={tw`text-red-500 mb-4`}>{error}</Text>}
      <ThemedTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <ThemedTextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <View style={tw`flex flex-row justify-end`}>
        <Text
          onPress={() => navigation.navigate('ForgotPassword')}
          style={tw`${theme.classes.textSecondary} py-0 underline text-sm`}
        >
          Forgot Password?
        </Text>
      </View>
      <Button
        mode="contained"
        onPress={handleLogin}
        style={tw`mt-4 ${'bg-purple-600'}`}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" style={tw`pt-[3px]`} /> : 'Login'}
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate('Register')}
        style={tw`mt-2`}
      >
        Don&apos;t have an account? Register
      </Button>
    </View>
  );
};

export default LoginScreen;
