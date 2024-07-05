import { createStackNavigator } from "@react-navigation/stack";
import React from 'react';
import FlashcardsScreen from "./FlashcardsScreen";

export default function LearnStackScreen() {
  const LearnStack = createStackNavigator();

  return (
    <LearnStack.Navigator screenOptions={{ headerShown: false }}>
      <LearnStack.Screen name="FlashcardsScreen" component={FlashcardsScreen} />
    </LearnStack.Navigator>
  );
}
