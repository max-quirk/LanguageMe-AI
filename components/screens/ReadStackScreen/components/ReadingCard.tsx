import React from 'react';
import { TouchableOpacity, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import { deleteReading } from '../../../../utils/readings';
import { firebase } from '../../../../config/firebase';
import { ReadingsListScreenNavigationProp } from './../ReadingsListScreen';
import ThemedCard from '../../../ThemedCard';

type ReadingCardProps = {
  title: string;
  description: string,
  readingId: string,
  onDelete: (id: string) => void;
};

const ReadingCard: React.FC<ReadingCardProps> = ({ 
  title,
  description,
  readingId, 
  onDelete 
}) => {
  const navigation = useNavigation<ReadingsListScreenNavigationProp>();

  const handleDelete = () => {
    const user = firebase.auth().currentUser;
    if (user) {
      deleteReading({ userId: user.uid, readingId: readingId }).then(() => {
        onDelete(readingId);
      });
    }
  };

  const renderRightActions = () => (
    <TouchableOpacity
      style={tw`bg-red-600 justify-center p-4 mb-4 rounded-lg overflow-hidden`}
      onPress={() => {
        Alert.alert(
          'Confirm Deletion',
          'Are you sure you want to delete this reading?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: handleDelete },
          ]
        );
      }}
    >
      <Text style={tw`text-white`}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <ThemedCard
      onPress={() => navigation.navigate('Reading', { readingId })}
      renderRightActions={renderRightActions}
      title={title}
      description={description}
    />
  );
};

export default ReadingCard;
