// ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import tw from 'twrnc';
import { firebase } from '../../config/firebase';
import Button from '../Button';
import ThemedTextInput from '../ThemedTextInput';
import { useTheme } from '../../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

type Props = {
  navigation: ForgotPasswordScreenNavigationProp;
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handlePasswordReset = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      setMessage('Password reset link has been sent to your email.');
    } catch (error) {
      setError(error as string);
    }
    setLoading(false);
  };

  return (
    <View style={tw`flex-1 justify-center p-5 ${theme.classes.backgroundPrimary}`}>
      <Text style={tw`text-xl mb-4 ${theme.classes.textPrimary}`}>Forgot Password</Text>
      {error && <Text style={tw`text-red-500 mb-4`}>{error}</Text>}
      {message && <Text style={tw`text-green-500 mb-4`}>{message}</Text>}
      <ThemedTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Button
        mode="contained"
        onPress={handlePasswordReset}
        style={tw`mt-4 bg-purple-600`}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" style={tw`pt-[3px]`} /> : 'Get Link'}
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.goBack()}
        style={tw`mt-2 ${theme.classes.textPrimary}`}
      >
        Back to Login
      </Button>
    </View>
  );
};

export default ForgotPasswordScreen;
