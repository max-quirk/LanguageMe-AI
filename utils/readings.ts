import { firebase } from '../config/firebase';

export const deleteReading = async ({
  userId,
  readingId,
}: {
  userId: string, 
  readingId: string
}) => {
  try {
    await firebase.firestore()
      .collection('users')
      .doc(userId)
      .collection('readings')
      .doc(readingId)
      .delete();
    console.log('Reading deleted successfully');
  } catch (error) {
    console.error('Error deleting reading:', error);
  }
};
export const cleanPunctuation = (str: string) => {
  return str.replace(/^-+/g, '').replace(/[\p{P}\p{S}]/gu, '').trim();
};

export const stripQuotes = (str: string) => {
  return str.replace(/["']/g, '');
}
