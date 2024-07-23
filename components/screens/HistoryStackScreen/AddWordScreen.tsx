import { ScrollView, View, Text, Keyboard } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import React, { useContext, useState, useCallback } from 'react';
import ThemedTextInput from "../../ThemedTextInput";
import tw from "twrnc";
import { useTheme } from "../../../contexts/ThemeContext";
import { useTranslation } from 'react-i18next';
import { getSearchResults } from "../../../services/chatGpt";
import { LanguageContext } from "../../../contexts/LanguageContext";
import debounce from 'lodash/debounce';
import WordRow from "./WordRow";
import AddWordModal from "./AddWordModal";

const AddWordScreen = () => {
  const { targetLanguage, nativeLanguage } = useContext(LanguageContext);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<{ word: string; translation: string }[] | null>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (input: string) => {
      if (!input) {
        setSearchResults([]);
        return;
      }
      try {
        setSearchLoading(true)
        //TODO: make a new getPossibleTranslations that returns a bit more with each
        // translation, e.g. { word: “桌子”， translations: [“table”, “desk”] }， 
        const results = await getSearchResults({
          word: input,
          wordLanguage: nativeLanguage, 
          translateTo: targetLanguage, 
        });
        setSearchResults(results);
        setSearchLoading(false)
      } catch (error) {
        console.error('fetching translations:', error);
      }
    }, 500),
    [nativeLanguage, targetLanguage]
  );

  const handleSearchInputChange = (input: string) => {
    setSearchInput(input);
    debouncedSearch(input);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" style={tw`flex-1 ${theme.classes.backgroundPrimary}`}>
      <View style={tw`flex-1 p-5 pt-20`}>
        <Text style={tw`text-2xl mb-4 ${theme.classes.textPrimary}`}>{t('new_word')}</Text>
        <View>
          <ThemedTextInput
            label={t('search_a_word')}
            value={searchInput}
            onChangeText={handleSearchInputChange}
            style={tw`flex-1 mr-2`}
          />
        </View>
        {searchLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={tw`mt-4`} />
        ): null}
        {!searchLoading && searchResults ? (
          <>
            {searchResults.map((result, idx) => (
              <WordRow
                key={idx}
                word={result.word}
                translation={result.translation}
                onPress={() => {
                  Keyboard.dismiss();
                  setSelectedWord(result.word);
                  setModalVisible(true);
                }}
                isFirst={idx === 0}
                isLast={idx === searchResults.length - 1}
              />
            ))}
          </>
        ) : null}
      </View>
      {selectedWord ? 
        <AddWordModal
          visible={modalVisible}
          word={selectedWord}
          onDismiss={() => setModalVisible(false)}
        />
      : null}
    </ScrollView>
  );
};

export default AddWordScreen;
