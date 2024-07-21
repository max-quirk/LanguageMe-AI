import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import HistoryScreen from "./HistoryScreen";
import AddWordScreen from "./AddWordScreen";
import BackButton from "../../BackButton";
import { useTheme } from "../../../contexts/ThemeContext";

export default function HistoryStackScreen() {
  const HistoryStack = createStackNavigator();
  const { theme } = useTheme();

  return (
    <HistoryStack.Navigator 
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.backgroundPrimary, 
        },
        headerTintColor: theme.colors.textPrimary,
      }}
    >
      <HistoryStack.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ headerShown: false }} 
      />
      <HistoryStack.Screen 
        name="AddWord" 
        component={AddWordScreen} 
        options={({ navigation }) => ({
          headerLeft: () => (
            <BackButton onPress={() => navigation.navigate('History')} />
          ),
          title: '',
        })} 
      />
    </HistoryStack.Navigator>
  );
}
