import { createStackNavigator } from "@react-navigation/stack";
import React from 'react';
import HomeScreen from "./HomeScreen";

export default function HomeStackScreen() {
  const HomeStack = createStackNavigator();
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}
