import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../components/screens/LoginScreen';
import RegisterScreen from '../components/screens/RegisterScreen';
import LanguageSelectionScreen from '../components/screens/LanguageSelectionScreen';
import TargetLanguageSelectionScreen from '../components/screens/TargetLanguageSelectionScreen';
import TabNavigator from './TabNavigator';
import BackButton from '../components/BackButton';

const RootStack = createStackNavigator();

const RootNavigator = () => (
  <NavigationContainer>
    <RootStack.Navigator initialRouteName="Login">
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
        name="Main" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
    </RootStack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;
