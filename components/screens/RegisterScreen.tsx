import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { TextInput, Text, ActivityIndicator } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { firebase } from '../../config/firebase';
import tw from 'twrnc';
import { RootStackParamList } from '../../types';
import Button from '../Button';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;
type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
  route: RegisterScreenRouteProp;
};

type FirebaseAuthError = {
  message: string;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
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
    <View style={tw`flex-1 justify-center p-5`}>
      <View style={tw`flex items-center`}>
        <Image source={require('../../assets/images/logo-full.png')} style={tw`w-70 h-70 mb-6`} />
      </View>
      <Text style={tw`text-xl mb-4`}>Register</Text>
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
        onPress={handleRegister}
        style={tw`mt-4 bg-purple-600`}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : 'Register'}
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate('Login')}
        style={tw`mt-2`}
      >
        Already have an account? Login
      </Button>
    </View>
  );
};

export default RegisterScreen;
