import { createStackNavigator } from "@react-navigation/stack";
import React from 'react';
import ReadingsListScreen from "./ReadingsListScreen";
import AddReadingScreen from "./AddReadingScreen";
import ReadingScreen from "./ReadingScreen";
import { RootStackParamList } from "types";
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
            <TouchableOpacity onPress={() => navigation.navigate('ReadingsList')}>
              <Icon name="arrow-left" size={25} color="black" style={{ marginLeft: 15 }} />
            </TouchableOpacity>
          ),
          title: '',
        })} 
      />
      <ReadStack.Screen 
        name="Reading" 
        component={ReadingScreen} 
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate('ReadingsList')}>
              <Icon name="arrow-left" size={25} color="black" style={{ marginLeft: 15 }} />
            </TouchableOpacity>
          ),
          title: '',
        })} 
      />
    </ReadStack.Navigator>
  );
}
