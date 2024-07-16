import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevSettings } from 'react-native';

const IS_FIRST_TIME_FLASHCARD_USER_KEY = '@is_first_time_flashcard_user';
const IS_FIRST_TIME_READING_USER_KEY = '@is_first_time_reading_user';

export const isFirstTimeFlashcardUser = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(IS_FIRST_TIME_FLASHCARD_USER_KEY);
    return value === null;
  } catch (e) {
    console.error('Failed to fetch the data from storage', e);
    return false;
  }
};

export const setFirstTimeFlashcardUser = async (val: boolean) => {
  try {
    await AsyncStorage.setItem(IS_FIRST_TIME_FLASHCARD_USER_KEY, val.toString());
  } catch (e) {
    console.error('Failed to save the data to storage', e);
  }
};

export const isFirstTimeReadingUser = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(IS_FIRST_TIME_READING_USER_KEY);
    return value === null;
  } catch (e) {
    console.error('Failed to fetch the data from storage', e);
    return false;
  }
};

export const setFirstTimeReadingUser = async (val: boolean) => {
  try {
    await AsyncStorage.setItem(IS_FIRST_TIME_READING_USER_KEY, val.toString());
  } catch (e) {
    console.error('Failed to save the data to storage', e);
  }
};

export const clearFirstTimeUser = async () => {
  try {
    await AsyncStorage.removeItem(IS_FIRST_TIME_FLASHCARD_USER_KEY);
    await AsyncStorage.removeItem(IS_FIRST_TIME_READING_USER_KEY);
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
