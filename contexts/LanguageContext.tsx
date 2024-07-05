import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebase } from '../config/firebase';
import { getUserLanguageFromFirebase } from '../utils/firebase';
import { LanguageCode } from 'iso-639-1';
import { romanizableLangauges } from '../utils/languages';
import i18n from '../localization/i18n'; 

const DEFAULT_LANGUAGE = 'en';

interface LanguageContextType {
  nativeLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  displayLanguage: LanguageCode;
  saveLanguages: ({
    nativeLanguage,
    targetLanguage,
    displayLanguage
  }: {
    nativeLanguage: LanguageCode, 
    targetLanguage: LanguageCode,
    displayLanguage: LanguageCode,
  }) => Promise<void>;
  targetLanguageRomanizable: boolean;
}

export const LanguageContext = createContext<LanguageContextType>({
  nativeLanguage: DEFAULT_LANGUAGE,
  targetLanguage: DEFAULT_LANGUAGE,
  displayLanguage: DEFAULT_LANGUAGE,
  saveLanguages: async () => {},
  targetLanguageRomanizable: false,
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [displayLanguage, setDisplayLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const storedNativeLanguage = await AsyncStorage.getItem('nativeLanguage') as LanguageCode;
        const storedTargetLanguage = await AsyncStorage.getItem('targetLanguage') as LanguageCode;
        const storedDisplayLanguage = await AsyncStorage.getItem('displayLanguage') as LanguageCode;
        if (storedNativeLanguage && storedTargetLanguage && storedDisplayLanguage) {
          setNativeLanguage(storedNativeLanguage);
          setTargetLanguage(storedTargetLanguage);
          setDisplayLanguage(storedDisplayLanguage);
          i18n.changeLanguage(storedDisplayLanguage);
        } else {
          const user = firebase.auth().currentUser;
          if (user) {
            const data = await getUserLanguageFromFirebase(user.uid);
            if (data) {
              const { nativeLanguage, targetLanguage, displayLanguage } = data;
              setNativeLanguage(nativeLanguage as LanguageCode);
              setTargetLanguage(targetLanguage as LanguageCode);
              setDisplayLanguage(displayLanguage as LanguageCode);
              i18n.changeLanguage(displayLanguage as LanguageCode); 
              await AsyncStorage.setItem('nativeLanguage', nativeLanguage);
              await AsyncStorage.setItem('targetLanguage', targetLanguage);
              await AsyncStorage.setItem('displayLanguage', displayLanguage);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load languages:', error);
      }
    };

    loadLanguages();
  }, []);

  const saveLanguages = async ({
    nativeLanguage,
    targetLanguage,
    displayLanguage
  }: {
    nativeLanguage: LanguageCode, 
    targetLanguage: LanguageCode,
    displayLanguage: LanguageCode
  }
  ) => {
    try {
      await AsyncStorage.setItem('nativeLanguage', nativeLanguage);
      await AsyncStorage.setItem('targetLanguage', targetLanguage);
      await AsyncStorage.setItem('displayLanguage', displayLanguage); 
      setNativeLanguage(nativeLanguage);
      setTargetLanguage(targetLanguage);
      setDisplayLanguage(displayLanguage);

      i18n.changeLanguage(displayLanguage); 

      const user = firebase.auth().currentUser;
      if (user) {
        await firebase.firestore().collection('users').doc(user.uid).set(
          {
            nativeLanguage: nativeLanguage,
            targetLanguage: targetLanguage,
            displayLanguage: displayLanguage,
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Failed to save languages:', error);
    }
  };

  const targetLanguageRomanizable = romanizableLangauges.has(targetLanguage);

  return (
    <LanguageContext.Provider 
      value={{ 
        nativeLanguage, 
        targetLanguage, 
        displayLanguage,
        saveLanguages,
        targetLanguageRomanizable
      }}>
      {children}
    </LanguageContext.Provider>
  );
};
