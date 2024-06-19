import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Button, ActivityIndicator, Text, IconButton, MD3Colors } from 'react-native-paper';
import { firebase } from '../../../config/firebase';
import tw from 'twrnc';
import { Reading, RootStackParamList } from '../../../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import ReadingCard from './ReadingCard';

export type ReadingsListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reading', 'AddReading'>;

const ReadingsListScreen: React.FC = () => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const navigation = useNavigation<ReadingsListScreenNavigationProp>();

  const fetchReadings = async () => {
    const user = firebase.auth().currentUser;
    if (user) {
      const readingsSnapshot = await firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .collection('readings')
        .orderBy('createdAt', 'desc') // Order by createdAt, latest first
        .get();
      setReadings(readingsSnapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
        id: doc.id,
        description: doc.data().description,
        difficulty: doc.data().difficulty,
        wordCount: doc.data().wordCount,
        passage: doc.data().passage,
        createdAt: doc.data().createdAt.toDate(),
      } as Reading)));
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReadings();
  };

  const handleDelete = (id: string) => {
    setReadings(prevReadings => prevReadings.filter(reading => reading.id !== id));
  };

  return (
    <View style={tw`flex-1 p-5 mt-20 bg-gray-100`}>
      <Text style={tw`text-3xl mb-6 text-center font-bold text-gray-800`}>Readings</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddReading')}
        style={tw`mb-6 bg-purple-600 flex flex-row justify-center items-center w-full`}
        labelStyle={tw`text-white`}
        contentStyle={tw`flex flex-row justify-center items-center w-full`}
      >
        <IconButton
          icon="plus"
          iconColor={MD3Colors.primary100}
          size={30}
          style={tw`m-0 p-0`}
        />
      </Button>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {readings.map(reading => (
            <ReadingCard key={reading.id} reading={reading} onDelete={handleDelete} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default ReadingsListScreen;
