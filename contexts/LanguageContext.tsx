import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebase } from '../config/firebase';
import { getUserLanguageFromFirebase } from '../utils/firebase';

const DEFAULT_LANGUAGE = 'en'

interface LanguageContextType {
  nativeLanguage: string;
  targetLanguage: string;
  saveLanguages: (nativeLanguage: string, targetLanguage: string) => Promise<void>;
}

export const LanguageContext = createContext<LanguageContextType>({
  nativeLanguage: DEFAULT_LANGUAGE,
  targetLanguage: DEFAULT_LANGUAGE,
  saveLanguages: async () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [nativeLanguage, setNativeLanguage] = useState<string>(DEFAULT_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState<string>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const storedNativeLanguage = await AsyncStorage.getItem('nativeLanguage');
        const storedTargetLanguage = await AsyncStorage.getItem('targetLanguage');
        if (storedNativeLanguage && storedTargetLanguage) {
          setNativeLanguage(storedNativeLanguage);
          setTargetLanguage(storedTargetLanguage);
        } else {
          const user = firebase.auth().currentUser;
          if (user) {
            const data = await getUserLanguageFromFirebase(user.uid);
            if (data) {
              const { nativeLanguage, targetLanguage } = data;
              setNativeLanguage(nativeLanguage);
              setTargetLanguage(targetLanguage);
              await AsyncStorage.setItem('nativeLanguage', nativeLanguage);
              await AsyncStorage.setItem('targetLanguage', targetLanguage);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load languages:', error);
      }
    };

    loadLanguages();
  }, []);

  const saveLanguages = async (newNativeLanguage: string, newTargetLanguage: string) => {
    try {
      await AsyncStorage.setItem('nativeLanguage', newNativeLanguage);
      await AsyncStorage.setItem('targetLanguage', newTargetLanguage);
      setNativeLanguage(newNativeLanguage);
      setTargetLanguage(newTargetLanguage);

      const user = firebase.auth().currentUser;
      if (user) {
        await firebase.firestore().collection('users').doc(user.uid).set(
          {
            nativeLanguage: newNativeLanguage,
            targetLanguage: newTargetLanguage,
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Failed to save languages:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ nativeLanguage, targetLanguage, saveLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};
