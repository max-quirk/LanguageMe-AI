import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import tw from 'twrnc';
import { useTheme } from '../contexts/ThemeContext';
import ReadStackScreen from '../components/screens/ReadStackScreen';
import LearnStackScreen from '../components/screens/LearnStackScreen';
import SettingsStackScreen from '../components/screens/SettingsStackScreen';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Read') {
            iconName = 'book-open';
          } else if (route.name === 'Flashcards') {
            iconName = 'clone';
          } else if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Settings') {
            iconName = 'bars';
          }

          return <Icon name={iconName} size={size} color={color} style={tw`mt-2`} />;
        },
        headerShown: false,
        tabBarActiveTintColor: 'tomato', 
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: tw`${theme.classes.backgroundSecondary} h-24`,
      })}
    >
      <Tab.Screen name="Read" component={ReadStackScreen} />
      <Tab.Screen name="Flashcards" component={LearnStackScreen} />
      <Tab.Screen name="Settings" component={SettingsStackScreen} />
    </Tab.Navigator>
  );
}

export default TabNavigator;
