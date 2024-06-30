import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import HistoryScreen from "./HistoryScreen";

export default function HistoryStackScreen() {
  const HistoryStack = createStackNavigator();

  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="History" component={HistoryScreen} />
    </HistoryStack.Navigator>
  );
}
