import { createStackNavigator } from "@react-navigation/stack";
import React from 'react';
import ReadingsListScreen from "./ReadingsListScreen";
import AddReadingScreen from "./AddReadingScreen";
import ReadingScreen from "./ReadingScreen";
import { RootStackParamList } from "types";
import BackButton from '../../BackButton';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ReadStackScreen() {
  const ReadStack = createStackNavigator<RootStackParamList>();
  const { theme } = useTheme();

  return (
    <ReadStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.backgroundPrimary, // Set the background color for the header
        },
        headerTintColor: theme.colors.textPrimary, // Set the text color for the header
      }}
    >
      <ReadStack.Screen name="ReadingsList" component={ReadingsListScreen} options={{ headerShown: false }} />
      <ReadStack.Screen 
        name="AddReading" 
        component={AddReadingScreen} 
        options={({ navigation }) => ({
          headerLeft: () => (
            <BackButton onPress={() => navigation.navigate('ReadingsList')} />
          ),
          title: '',
        })} 
      />
      <ReadStack.Screen 
        name="Reading" 
        component={ReadingScreen} 
        options={({ navigation }) => ({
          headerLeft: () => (
            <BackButton onPress={() => navigation.navigate('ReadingsList')} />
          ),
          title: '',
        })} 
      />
    </ReadStack.Navigator>
  );
}
