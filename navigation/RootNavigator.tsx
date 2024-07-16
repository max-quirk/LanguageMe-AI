import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../components/screens/LoginScreen';
import RegisterScreen from '../components/screens/RegisterScreen';
import LanguageSelectionScreen from '../components/screens/LanguageSelectionScreen';
import TargetLanguageSelectionScreen from '../components/screens/TargetLanguageSelectionScreen';
import TabNavigator from './TabNavigator';
import BackButton from '../components/BackButton';
import { RootStackParamList } from '../types';
import ForgotPasswordScreen from '../components/screens/ForgotPassword';
import { useTheme } from '../contexts/ThemeContext';
import DisplayLanguageSelection from '../components/screens/DisplayLanguageSelection';
import { ActivityIndicator } from 'react-native-paper';

const RootStack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { theme } = useTheme();
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>();

  useEffect(() => {
    const checkAuthState = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('userToken: ', Boolean(userToken))
      if (userToken) {
        setInitialRoute('Main');
      } else {
        setInitialRoute('Login');
      }
    };
    checkAuthState();
  }, []);

  if (!initialRoute) return <ActivityIndicator size="large" />

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.backgroundPrimary,
          },
          headerTintColor: theme.colors.backgroundPrimary,
        }}
      >
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="LanguageSelection"
          component={LanguageSelectionScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="TargetLanguageSelection"
          component={TargetLanguageSelectionScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: '',
            headerLeft: () => (
              <BackButton onPress={() => navigation.goBack()} />
            ),
          })}
        />
        <RootStack.Screen
          name="DisplayLanguageSelection"
          component={DisplayLanguageSelection}
          options={({ navigation }) => ({
            headerShown: true,
            title: '',
            headerLeft: () => (
              <BackButton onPress={() => navigation.goBack()} />
            ),
          })}
        />
        <RootStack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
