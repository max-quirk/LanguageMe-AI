import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome5';

import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import LanguageSelectionScreen from './components/screens/LanguageSelectionScreen';
import TargetLanguageSelectionScreen from './components/screens/TargetLanguageSelectionScreen';

import ReadStackScreen from './components/screens/ReadStackScreen';
import LearnStackScreen from './components/screens/LearnStackScreen';
import SettingsStackScreen from './components/screens/SettingsStackScreen';

import { PaperProvider } from 'react-native-paper';
import { LanguageProvider } from './contexts/LanguageContext';
import { AudioProvider } from './contexts/AudioContext';
import TrackPlayer from 'react-native-track-player';

import BackButton from './components/BackButton';

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Read') {
            iconName = 'book-open';
          } else if (route.name === 'Learn') {
            iconName = 'brain';
          } else if (route.name === 'Settings') {
            iconName = 'bars';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        headerShown: false,
      })}
      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Read" component={ReadStackScreen} />
      <Tab.Screen name="Learn" component={LearnStackScreen} />
      <Tab.Screen name="Settings" component={SettingsStackScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    const setupPlayer = async () => {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        stopWithApp: true,
        capabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_STOP,
          TrackPlayer.CAPABILITY_SEEK_TO,
        ],
        compactCapabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
        ],
      });
    };

    setupPlayer();
  }, []);

  return (
    <LanguageProvider>
      <AudioProvider>
        <PaperProvider>
          <NavigationContainer>
            <RootStack.Navigator initialRouteName="Login">
              <RootStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <RootStack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
              <RootStack.Screen name="LanguageSelection" component={LanguageSelectionScreen} options={{ headerShown: false }} />
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
              <RootStack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
            </RootStack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </AudioProvider>
    </LanguageProvider>
  );
}
