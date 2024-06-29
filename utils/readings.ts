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

// Removes all punctuation from string except hyphens
export const cleanPunctuation = (str: string) => {
  return str.replace(/^\+/g, '').replace(/[\p{P}\p{S}]/gu, '').trim();
};

// Removes leading hyphens and spaces e.g. "- gg" -> "gg" 
export const cleanLeadingHyphens = (str: string) => {
  return str.replace(/^[-s]+/, '').trim();
};

// Finds spaces and other punctuation between words to split. 
export const splitTextIntoWords = (text: string) => {
  return text.match(/[\p{L}0-9]+|[\p{P}\p{S}]+/gu) || [];
};

export const stripQuotes = (str: string) => {
  return str.replace(/["']/g, '');
}
