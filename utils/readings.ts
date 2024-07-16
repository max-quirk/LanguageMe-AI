import { ReadingWithWordTimeStamps } from '../services/whisper';
import { firebase } from '../config/firebase';
import { Reading } from 'types';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ReadingSkeleton = {
  title: string,
  description: string,
  id: string,
}

export const getReadingsPaginated = async (
  lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  pageSize = 7
) => {
  const user = firebase.auth().currentUser;
  if (user) {
    let query = firebase.firestore()
      .collection('users')
      .doc(user.uid)
      .collection('readings')
      .orderBy('createdAt', 'desc')
      .limit(pageSize);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return { readings: [], lastDoc };
    }

    const readings: ReadingSkeleton[] = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
      id: doc.id,
      title: doc.data().title,
      description: doc.data().description,
    }));

    return { readings, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  }
  return { readings: [] as ReadingSkeleton[], lastDoc: undefined };
};

export const getReading = async (id: string) => {
  const user = firebase.auth().currentUser;
  if (user) {
    const doc = await firebase.firestore()
      .collection('users')
      .doc(user.uid)
      .collection('readings')
      .doc(id)
      .get();

    if (doc.exists) {
      return {
        id: doc.id,
        title: doc.data()?.title,
        description: doc.data()?.description,
        difficulty: doc.data()?.difficulty,
        wordCount: doc.data()?.wordCount,
        passage: doc.data()?.passage,
        createdAt: doc.data()?.createdAt.toDate(),
        wordTimestamps: doc.data()?.wordTimestamps,
      } as Reading;
    }
  }
  return null;
};

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
    console.info('Reading deleted successfully');
  } catch (error) {
    console.error('Error deleting reading:', error);
  }
};

// Removes all punctuation from string except hyphens and single quotes within words
export const cleanPunctuation = (str: string) => {
  return str.replace(/(?!\B['’]|\b['’])[\p{P}\p{S}]/gu, '').trim();
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

// Removes quotes from the start or end of a string
export const stripQuotes = (str: string) => {
  return str.trim().replace(/^["']|["']$/g, '');
}

export const updateFirebaseReadingWordTimestamps = async (readingId: string, timeStamps: ReadingWithWordTimeStamps | null) => {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('No user is authenticated');
    }
    const readingRef = firebase.firestore().collection('users').doc(user.uid).collection('readings').doc(readingId);
    if (timeStamps !== null) {
      await readingRef.update({ wordTimestamps: timeStamps });
    }
  } catch (error) {
    console.error('Error updating reading with segments:', error);
    throw error;
  }
};

export function hasTrailingPunctuation(word: string): boolean {
  return /[.,;:!?。，；！？]$/.test(word);
}

export const processGeneratedReading = (passage: string) => {
  // Ensure spaces are placed after punctuation, ignoring newline characters
  const spacedPunctuationPassage = passage.replace(/([.,。，，、！；：？])/g, '$1 ');

  // Replace weird whitespace with normal spaces, but keep newline characters
  const normalizedWhitespacePassage = spacedPunctuationPassage.replace(/[^\S\r\n]+/g, ' ');

  // Remove double spaces (excluding newlines)
  const cleanedPassage = normalizedWhitespacePassage.replace(/ {2,}/g, ' ');

  // Ensure there are never double punctuation marks
  const noDoublePunctuationPassage = cleanedPassage.replace(/([.,。，，、！；：？])\s*\1/g, '$1');

  // Ensure there are never spaces before full stops or commas
  const noSpaceBeforePunctuationPassage = noDoublePunctuationPassage.replace(/\s+([.,。，，、！；：？])/g, '$1');

  // Ensure there are never double new lines
  const singleNewlinePassage = noSpaceBeforePunctuationPassage.replace(/\n{2,}/g, '\n');
  
  // Remove single quotes that are both preceded and followed by a space
  const noExtraSingleQuotesPassage = singleNewlinePassage.replace(/ (?=')'(?!\s)/g, '');

  // Adjusted regex for removing single quotes that are both preceded and followed by a space
  const finalPassage = noExtraSingleQuotesPassage.replace(/ ' /g, ' ');
  return finalPassage.trim();
};

export function filterBlankWords(word: string): boolean {
  // Check that the word contains at least one letter or number character from any language
  return /\p{L}|\p{N}/u.test(word);
}




