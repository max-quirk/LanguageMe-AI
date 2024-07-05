import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import SettingsScreen from "./SettingsScreen";

export default function SettingsStackScreen() {
  const SettingsStack = createStackNavigator();

  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsScreen" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}
