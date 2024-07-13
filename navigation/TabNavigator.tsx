import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import tw from 'twrnc';
import { useTheme } from '../contexts/ThemeContext';
import ReadStackScreen from '../components/screens/ReadStackScreen';
import LearnStackScreen from '../components/screens/LearnStackScreen';
import SettingsStackScreen from '../components/screens/SettingsStackScreen';
import HistoryStackScreen from '../components/screens/HistoryStackScreen';
import i18n from '../localization/i18n'; 

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
            iconName = 'brain';
          } else if (route.name === 'My Words') {
            iconName = 'list-ul';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          return <Icon name={iconName} size={size} color={color} style={tw`mt-2`} />;
        },
        headerShown: false,
        tabBarActiveTintColor: 'tomato', 
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: tw`${theme.classes.backgroundSecondary} h-24 flex flex-col items-center justify-center`,
        tabBarLabelStyle: tw``
      })}
    >
      <Tab.Screen 
        name="Read" 
        component={ReadStackScreen} 
        options={{ tabBarLabel: i18n.t('Read') }} 
      />
      <Tab.Screen 
        name="Flashcards" 
        component={LearnStackScreen} 
        options={{ tabBarLabel: i18n.t('Flashcards') }} 
      />
      <Tab.Screen 
        name="My Words" 
        component={HistoryStackScreen} 
        options={{ tabBarLabel: i18n.t('My Words') }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStackScreen} 
        options={{ tabBarLabel: i18n.t('Settings') }} 
      />
    </Tab.Navigator>
  );
}

export default TabNavigator;
