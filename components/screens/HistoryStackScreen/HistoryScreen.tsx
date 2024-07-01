import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { firebase } from '../../../config/firebase';
import tw from 'twrnc';
import { FlashCard } from '../../../types';
import WordModal from './WordModal';
import { useTheme } from '../../../contexts/ThemeContext';
import BackgroundView from '../../BackgroundView';
import { deleteFlashcard, fetchFlashcardsPaginated } from '../../../utils/flashcards';
import { ScreenTitle } from '../../ScreenTitle';
import RefreshableScrollView from '../../RefreshableScrollView';
import WordRow from './WordRow';
import WordListSettings from './WordListSettings';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types';
import Button from '../../Button';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Define the type for the navigation prop
type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const HistoryScreen = () => {
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [lastDoc, setLastDoc] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | undefined>(undefined);
  const [loadedCardIds, setLoadedCardIds] = useState<Set<string>>(new Set());
  const [showTranslations, setShowTranslations] = useState(false);
  const [selectedCard, setSelectedCard] = useState<FlashCard | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reverseOrder, setReverseOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { theme } = useTheme();
  const navigation = useNavigation<HistoryScreenNavigationProp>();

  const loadInitialFlashcards = async () => {
    setLoading(true);
    const { newFlashcards, lastDoc } = await fetchFlashcardsPaginated();
    const newCardIds = new Set(newFlashcards.map(card => card.id));
    setFlashcards(newFlashcards);
    setLoadedCardIds(newCardIds);
    setLastDoc(lastDoc);
    setLoading(false);
  };

  const loadMoreFlashcards = async () => {
    if (loadingMore || !lastDoc) return; // Avoid multiple concurrent fetches
    setLoadingMore(true);
    const { newFlashcards, lastDoc: newLastDoc } = await fetchFlashcardsPaginated(lastDoc);
    const uniqueNewFlashcards = newFlashcards.filter(card => !loadedCardIds.has(card.id));
    setFlashcards(prevFlashcards => [...prevFlashcards, ...uniqueNewFlashcards]);
    setLoadedCardIds(prevIds => {
      uniqueNewFlashcards.forEach(card => prevIds.add(card.id));
      return new Set(prevIds);
    });
    setLastDoc(newLastDoc);
    setLoadingMore(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadInitialFlashcards();
    }, [])
  );

  useEffect(() => {
    loadInitialFlashcards();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialFlashcards();
    setRefreshing(false);
  };

  const groupedFlashcards = useMemo(() => {
    return flashcards.reduce((acc, card) => {
      if (card.created) {
        const date = card.created.toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(card);
      }
      return acc;
    }, {} as { [key: string]: FlashCard[] });
  }, [flashcards]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedFlashcards).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('-')).getTime();
      const dateB = new Date(b.split('/').reverse().join('-')).getTime();
      return reverseOrder ? dateA - dateB : dateB - dateA;
    });
  }, [groupedFlashcards, reverseOrder]);

  const sortedGroupedFlashcards = useMemo(() => {
    const sortedGroup = { ...groupedFlashcards };
    Object.keys(sortedGroup).forEach(date => {
      sortedGroup[date] = sortedGroup[date].sort((a, b) => reverseOrder ? a.created.getTime() - b.created.getTime() : b.created.getTime() - a.created.getTime());
    });
    return sortedGroup;
  }, [groupedFlashcards, reverseOrder]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMoreFlashcards();
    }
  };

  if (loading) {
    return (
      <BackgroundView>
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={theme.colors.purplePrimary} />
        </View>
      </BackgroundView>
    );
  }

  if (flashcards.length === 0) {
    return (
      <BackgroundView>
        <RefreshableScrollView
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={tw`flex-1 justify-center items-center p-5`}
        >
          <Text style={tw`text-xl mb-8 text-center px-4 ${theme.classes.textPrimary}`}>You haven&apos;t added any flashcards from your readings yet!</Text>
          <Button
            mode="contained"
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Read' } }],
            })}
            style={tw`bg-purple-600`}
          >
            <Text style={tw`text-white`}>Go to Readings</Text>
          </Button>
        </RefreshableScrollView>
      </BackgroundView>
    );
  }

  const handleDeleteFlashcard = async (id: string) => {
    await deleteFlashcard(id);
    setFlashcards(prevFlashcards => prevFlashcards.filter(card => card.id !== id));
  };

  return (
    <BackgroundView style={tw`pt-25`}>
      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={handleRefresh}
        style={tw`p-4`}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <ScreenTitle title="My Words" />
        <WordListSettings
          showTranslations={showTranslations}
          setShowTranslations={setShowTranslations}
          reverseOrder={reverseOrder}
          setReverseOrder={setReverseOrder}
        />
        <View style={tw`pb-10`}>
          {sortedDates.map(date => (
            <View key={date} style={tw`mb-5`}>
              <Text style={tw`text-base font-medium mb-3 ${theme.classes.textPrimary}`}>{date}:</Text>
              {sortedGroupedFlashcards[date].map((card, idx) => (
                <WordRow
                  key={card.id}
                  onDelete={handleDeleteFlashcard}
                  card={card}
                  showTranslations={showTranslations}
                  onPress={() => {
                    setSelectedCard(card);
                    setModalVisible(true);
                  }}
                  isFirst={idx === 0}
                  isLast={idx === sortedGroupedFlashcards[date].length - 1}
                />
              ))}
            </View>
          ))}
        </View>
        {loadingMore && (
          <ActivityIndicator style={tw`mt-5`} size="large" color={theme.colors.purplePrimary} />
        )}
        {selectedCard && (
          <WordModal
            visible={modalVisible}
            word={selectedCard.front.word}
            flashcard={selectedCard}
            onDismiss={() => setModalVisible(false)}
          />
        )}
      </RefreshableScrollView>
    </BackgroundView>
  );
};

export default HistoryScreen;
