import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from './contexts/LanguageContext';
import { AudioProvider } from './contexts/AudioContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigator from './navigation/RootNavigator';
import { usePlayerSetup } from './setup/PlayerSetup';
import { LogBox } from 'react-native';
import i18n from './localization/i18n';
import { I18nextProvider } from 'react-i18next';

// Ignore specific warning messages
LogBox.ignoreLogs(['When setting overflow to hidden on Surface the shadow will not be displayed correctly']);

const App = () => {
  usePlayerSetup();

  return (
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LanguageProvider>
            <I18nextProvider i18n={i18n}>
              <AudioProvider>
                <PaperProvider>
                  <RootNavigator />
                </PaperProvider>
              </AudioProvider>
            </I18nextProvider>
          </LanguageProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
  );
};

export default App;
