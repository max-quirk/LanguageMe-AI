import React, { useState, useContext } from 'react';
import { View, Image } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import tw from 'twrnc';
import { LanguageContext } from '../../contexts/LanguageContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { firebase } from '../../config/firebase';
import Button from '../Button';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

type FirebaseAuthError = {
  code: string;
  message: string;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('max.q.807+good@gmail.com');
  const [password, setPassword] = useState<string>('bball4life1');
  const [error, setError] = useState<string | null>(null);
  const { saveLanguages } = useContext(LanguageContext);

  const handleLogin = async () => {
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
      console.log('firebaseError: ', firebaseError.code)

      if (firebaseError.code === 'auth/invalid-credential') {
        setError('Email or password not found. Please try again.');
      } else {
        setError(firebaseError.message);
      }
    }
  };

  return (
    <View style={tw`flex-1 justify-center p-5`}>
      <View style={tw`flex items-center`}>
        <Image source={require('../../assets/images/logo-full.png')} style={tw`w-70 h-70 mb-6`} />
      </View>
      <Text style={tw`text-xl mb-4`}>Login</Text>
      {error && <Text style={tw`text-red-500 mb-4`}>{error}</Text>}
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={tw`mb-4`}
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={tw`mb-4`}
        autoCapitalize="none"
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        style={tw`mt-4 bg-purple-600`}
      >
        Login
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
