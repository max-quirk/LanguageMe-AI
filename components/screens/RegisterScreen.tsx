import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { firebase } from '../../config/firebase';
import tw from 'twrnc';
import { RootStackParamList } from '../../types';

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

  const handleRegister = async () => {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      navigation.navigate('LanguageSelection'); 
    } catch (error) {
      const firebaseError = error as FirebaseAuthError;
      setError(firebaseError.message);
      console.error('Error registering:', error);
    }
  };

  return (
    <View style={tw`flex-1 justify-center p-5`}>
      <Text style={tw`text-2xl mb-4`}>Register</Text>
      {error && <Text style={tw`text-red-500 mb-4`}>{error}</Text>}
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={tw`mb-4`}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={tw`mb-4`}
      />
      <Button
        mode="contained"
        onPress={handleRegister}
        style={tw`mt-4`}
      >
        Register
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
