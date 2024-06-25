import { createStackNavigator } from "@react-navigation/stack";
import React from 'react';
import ReadingsListScreen from "./ReadingsListScreen";
import AddReadingScreen from "./AddReadingScreen";
import ReadingScreen from "./ReadingScreen";
import { RootStackParamList } from "types";
import BackButton from '../../BackButton';

export default function ReadStackScreen() {
  const ReadStack = createStackNavigator<RootStackParamList>();

  return (
    <ReadStack.Navigator screenOptions={{ headerShown: true }}>
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
