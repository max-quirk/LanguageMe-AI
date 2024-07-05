import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, NativeSyntheticEvent, ActivityIndicator as NativeActivityIndicator, NativeScrollEvent } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import tw from 'twrnc';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types';
import { useTheme } from '../../../contexts/ThemeContext';
import BackgroundView from '../../BackgroundView';
import { ScreenTitle } from '../../ScreenTitle';
import RefreshableScrollView from '../../RefreshableScrollView';
import Button from '../../Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ReadingSkeleton, getReadingsPaginated } from '../../../utils/readings';
import ReadingCard from './components/ReadingCard';
import HelperPopup from '../../HelperPopup';
import { isFirstTimeUser } from '../../../utils/storageUtils';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';

export type ReadingsListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reading', 'AddReading'>;

const ReadingsListScreen: React.FC = () => {
  const { t } = useTranslation();
  const [readings, setReadings] = useState<ReadingSkeleton[]>([]);
  const [lastDoc, setLastDoc] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [helperVisible, setHelperVisible] = useState(false);
  const navigation = useNavigation<ReadingsListScreenNavigationProp>();
  const { theme } = useTheme();

  const fetchInitialReadings = async () => {
    setLoading(true);
    const { readings: newReadings, lastDoc: newLastDoc } = await getReadingsPaginated();
    setReadings(newReadings);
    setLastDoc(newLastDoc);
    setLoading(false);
    setRefreshing(false);
  };

  const fetchMoreReadings = async () => {
    if (loadingMore || !lastDoc) return;
    setLoadingMore(true);
    const { readings: newReadings, lastDoc: newLastDoc } = await getReadingsPaginated(lastDoc);
    setReadings(prevReadings => [...prevReadings, ...newReadings]);
    setLastDoc(newLastDoc);
    setLoadingMore(false);
  };

  useEffect(() => {
    const initialize = async () => {
      const firstTimeUser = await isFirstTimeUser();
      if (firstTimeUser) {
        setTimeout(() => {
          setHelperVisible(true);
        }, 1000);
      }
      fetchInitialReadings();
    };
    initialize();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInitialReadings();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInitialReadings();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      fetchMoreReadings();
    }
  };

  return (
    <BackgroundView>
      <View style={tw`flex-1 px-5 mt-20 ${theme.classes.backgroundPrimary}`}>
        <HelperPopup
          title={t('getting_started')}
          text={t('welcome_popup_text')}
          visible={helperVisible}
          onClose={() => setHelperVisible(false)}
        />
        <ScreenTitle title={t('readings')} />
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddReading')}
          style={tw`mb-6 bg-purple-600 h-14`}
          contentStyle={tw`h-14`}
        >
          <View style={tw`flex flex-row gap-2 pt-1 items-center`}>
            <Icon name="plus" size={28} color="white"/>
            <Text style={tw`text-lg text-white font-bold`}>{t('generate_reading')}</Text>
          </View>
        </Button>
        {loading ? (
          <NativeActivityIndicator size="large" style={tw`mt-10`} color={theme.colors.purplePrimary} />
        ) : (
          <RefreshableScrollView
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onScroll={handleScroll}
            scrollEventThrottle={400}
          >
            {readings.map(reading => (
              <ReadingCard 
                key={reading.id} 
                readingId={reading.id} 
                title={reading.title}
                description={reading.description}
                onDelete={(id) => setReadings(prevReadings => prevReadings.filter(reading => reading.id !== id))} 
              />
            ))}
            {loadingMore && (
              <ActivityIndicator size="small" style={tw`mt-5`} />
            )}
          </RefreshableScrollView>
        )}
      </View>
    </BackgroundView>
  );
};

export default ReadingsListScreen;
