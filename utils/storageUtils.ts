import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevSettings } from 'react-native';

const IS_FIRST_TIME_USER_KEY = '@is_first_time_user';

export const isFirstTimeUser = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(IS_FIRST_TIME_USER_KEY);
    return value === null;
  } catch (e) {
    console.error('Failed to fetch the data from storage', e);
    return false;
  }
};

export const setFirstTimeUser = async (val: boolean) => {
  try {
    await AsyncStorage.setItem(IS_FIRST_TIME_USER_KEY, val.toString());
  } catch (e) {
    console.error('Failed to save the data to storage', e);
  }
};

export const clearFirstTimeUser = async () => {
  try {
    await AsyncStorage.removeItem(IS_FIRST_TIME_USER_KEY);
  } catch (e) {
    console.error('Failed to clear the data from storage', e);
  }
};

export const clearAndReload = async () => {
  try {
    await AsyncStorage.clear();
    DevSettings.reload();
  } catch (e) {
    console.error('Failed to clear the data and reload the app', e);
  }
};
