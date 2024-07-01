import { WordSegment } from '../services/whisper';
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
export const extractPunctuation = (word: string) => {
  const punctuationBeforeMatch = word.match(/^[,.\u3002\uff0c！？，。、،？]+/);
  const punctuationAfterMatch = word.match(/[,.\u3002\uff0c！？，。、،？]+$/);
  const punctuationBefore = punctuationBeforeMatch ? punctuationBeforeMatch[0] : '';
  const punctuationAfter = punctuationAfterMatch ? punctuationAfterMatch[0] : '';
  const coreWord = word.replace(/^[,.\u3002\uff0c！？，。、،？]+/, '').replace(/[,.\u3002\uff0c！？，。、،？]+$/, '');
  
  return { punctuationBefore, punctuationAfter, coreWord };
};

export const stripQuotes = (str: string) => {
  return str.replace(/["']/g, '');
}

export const updateFirebaseReadingWordTimestamps = async (readingId: string, segments: WordSegment[]) => {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('No user is authenticated');
    }
    const readingRef = firebase.firestore().collection('users').doc(user.uid).collection('readings').doc(readingId);
    await readingRef.update({ wordTimestamps: segments });
  } catch (error) {
    console.error('Error updating reading with segments:', error);
    throw error;
  }
};
