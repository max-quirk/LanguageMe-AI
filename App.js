import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from './contexts/LanguageContext';
import { AudioProvider } from './contexts/AudioContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigator from './navigation/RootNavigator';
import { usePlayerSetup } from './setup/PlayerSetup';

const App = () => {
  usePlayerSetup();

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LanguageProvider>
          <AudioProvider>
            <PaperProvider>
              <RootNavigator />
            </PaperProvider>
          </AudioProvider>
        </LanguageProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
};

export default App;
