import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { firebase } from '../../config/firebase';
import tw from 'twrnc';
import { RootStackParamList } from '../../types';
import Button from '../Button';
import ThemedTextInput from '../ThemedTextInput';
import { useTheme } from '../../contexts/ThemeContext';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

type FirebaseAuthError = {
  message: string;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
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
    <View style={tw`flex-1 justify-center p-5 ${theme.classes.backgroundPrimary}`}>
      <View style={tw`flex items-center`}>
        <Image source={require('../../assets/images/logo-full.png')} style={tw`w-70 h-70 mb-6`} />
      </View>
      <Text style={tw`text-xl mb-4 ${theme.classes.textPrimary}`}>Register</Text>
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
      <Button
        mode="contained"
        onPress={handleRegister}
        style={tw`mt-4 ${'bg-purple-600'}`}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" style={tw`pt-[3px]`} /> : 'Register'}
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate('Login')}
        style={tw`mt-2 ${theme.classes.textPrimary}`}
      >
        Already have an account? Login
      </Button>
    </View>
  );
};

export default RegisterScreen;
