import { DAY_IN_MS } from "../constants/time";
import { FlashCard, LightWeightFlashCard } from "types";
import { generateExampleSentences, romanizeText } from "../services/chatGpt";
import { firebase } from "@react-native-firebase/auth";
import { getUserDoc } from "./firebase";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { stripQuotes } from "./readings";
import { LanguageCode } from "iso-639-1";
import { romanizableLangauges } from "./languages";

const BATCH_SIZE = 500;

export enum Ease {
  Again = 1,
  Hard,
  Good,
  Easy
}

export const easeLabels = {
  [Ease.Again]: 'Again',
  [Ease.Hard]: 'Hard',
  [Ease.Good]: 'Moderate',
  [Ease.Easy]: 'Easy'
};

const MIN_FACTOR = 1300;
const MAX_FACTOR = 2500;
const FACTOR_DECREASE_HARD = 150;
const FACTOR_DECREASE_AGAIN = 200;
const FACTOR_INCREASE_EASY = 200;
const MIN_INTERVAL = 1 / (24 * 60); 

export const DEFAULT_INTERVALS = {
  [Ease.Again]: 1 * 60 * 1000,
  [Ease.Hard]: 10 * 60 * 1000,
  [Ease.Good]: 1 * DAY_IN_MS,
  [Ease.Easy]: 3 * DAY_IN_MS
};

export function getNextIntervals(card: FlashCard): { [key in Ease]: number } {
  const baseInterval = Math.max(card.interval || MIN_INTERVAL, MIN_INTERVAL);
  const factor = Math.max(card.factor, MIN_FACTOR);

  return {
    [Ease.Again]: 1 * 60 * 1000, 
    [Ease.Hard]: Math.max(10 * 60 * 500, Math.floor(baseInterval * 0.8)), 
    [Ease.Good]: Math.max(10 * 60 * 1000, Math.floor(baseInterval * 1.2)), 
    [Ease.Easy]: Math.max(1 * DAY_IN_MS, Math.floor(baseInterval * factor / 700)) 
  };
}


export async function adjustCard(card: FlashCard, ease: Ease): Promise<{ card: FlashCard }> {
  const now = new Date();
  const user = firebase.auth().currentUser;
  if (user) {
    const nextIntervals = getNextIntervals(card);
    card.interval = nextIntervals[ease];
    switch (ease) {
      case Ease.Again:
        card.factor = Math.max(MIN_FACTOR, card.factor - FACTOR_DECREASE_AGAIN);
        break;
      case Ease.Hard:
        card.factor = Math.max(MIN_FACTOR, card.factor - FACTOR_DECREASE_HARD);
        break;
      case Ease.Good:
        break;
      case Ease.Easy:
        card.factor = Math.min(MAX_FACTOR, card.factor + FACTOR_INCREASE_EASY);
        break;
    }
  }
  card.due = new Date(now.getTime() + card.interval);
  card.reps += 1;
  card.lastEase = ease;

  await editFlashcardOnFirebase(card);

  return { card };
}

export const storeTranslationsFirebase = async (cardId: string, translationsList: string[]) => {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('No user is authenticated');
    }
    const flashcardsCollectionRef = firebase.firestore().collection('users').doc(user.uid).collection('flashcards');
    await flashcardsCollectionRef.doc(cardId).update({ translationsList });
  } catch (error) {
    console.error('Error storing translations:', error);
    throw error;
  }
}

export const editFlashcardOnFirebase = async (card: FlashCard) => {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('No user is authenticated');
    }
    const flashcardsCollectionRef = firebase.firestore().collection('users').doc(user.uid).collection('flashcards');
    await flashcardsCollectionRef.doc(card.id).set(card);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    throw error;
  }
};

export function getNextCard(cards: FlashCard[]): FlashCard | null {
  if (cards.length === 0) {
    return null;
  }
  cards.sort((a, b) => a.due.getTime() - b.due.getTime());
  return cards[0];
}

export const addFlashcard = async ({
  word,
  romanizedWord,
  wordLanguage,
  translateTo,
  translationsList,
}: {
  word: string,
  romanizedWord: string | null,
  wordLanguage: LanguageCode,
  translateTo: LanguageCode,
  translationsList: string[] | null
}) => {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      console.error('No user is authenticated');
      return;
    }

    const userDoc = await getUserDoc(user.uid);
    if (!userDoc) {
      console.error('User document not found.');
      return;
    }

    const { exampleSentence, translation, translatedExampleSentence } = await generateExampleSentences({
      word,
      wordLanguage,
      translateTo
    });

    const romanizable = romanizableLangauges.has(wordLanguage)
    let _romanizedWord = romanizedWord
    let _exampleSentenceRomanized;
    if (romanizable && exampleSentence) {
      _exampleSentenceRomanized = await romanizeText({ text: exampleSentence, language: wordLanguage })
    }
    if (romanizable && !_romanizedWord) {
      _romanizedWord = await romanizeText({ text: word, language: wordLanguage })
    }

    const newFlashcard: Omit<FlashCard, 'id'> = {
      front: {
        word,
        wordRomanized: _romanizedWord,
        example: stripQuotes(exampleSentence ?? ''),
        exampleRomanized: stripQuotes(_exampleSentenceRomanized ?? '')
      },
      back: {
        word: translation ?? '',
        example: stripQuotes(translatedExampleSentence ?? ''),
      },
      due: new Date(Date.now()),
      created: new Date(Date.now()),
      interval: 1,
      factor: 2500,
      lastEase: null,
      reps: 0,
      translationsList,
    };
    const flashcardsCollectionRef = firebase.firestore().collection('users').doc(user.uid).collection('flashcards');
    await flashcardsCollectionRef.add(newFlashcard);
  } catch (error) {
    console.error('Error adding flashcard:', error);
    throw error;
  }
};

export const deleteAllFlashcards = async (userId: string) => {
  try {
    const db = firebase.firestore();
    const flashcardsRef = db.collection('users').doc(userId).collection('flashcards');

    const deleteQueryBatch = async (querySnapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      const batch = db.batch();
      querySnapshot.docs.forEach((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    };

    let snapshot: FirebaseFirestoreTypes.QuerySnapshot = await flashcardsRef.limit(BATCH_SIZE).get();
    while (!snapshot.empty) {
      await deleteQueryBatch(snapshot);
      snapshot = await flashcardsRef.limit(BATCH_SIZE).get();
    }

    console.info('All flashcards deleted successfully.');
  } catch (error) {
    console.error('Error deleting flashcards: ', error);
  }
};

const fetchAllFlashcards = async (userId: string): Promise<FlashCard[]> => {
  const flashcardsSnapshot = await firebase.firestore()
    .collection('users')
    .doc(userId)
    .collection('flashcards')
    .get();
  const cards: FlashCard[] = flashcardsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      due: data.due.toDate(),
      created: data.created.toDate()
    } as FlashCard;
  });
  return cards;
};

export const fetchFlashcardsPaginated = async (lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot, pageSize=20) => {
  const user = firebase.auth().currentUser;
  if (user) {
    let query = firebase.firestore()
      .collection('users')
      .doc(user.uid)
      .collection('flashcards')
      .orderBy('created', 'desc')
      .limit(pageSize);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    const newFlashcards: LightWeightFlashCard[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        front: {
          word: data.front.word,
          wordRomanized: data.front.wordRomanized,
        }, 
        back: {
          word: data.back.word,
        },
        created: data.created.toDate()
      } as LightWeightFlashCard;
    });
    return { newFlashcards, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  }
  return { newFlashcards: [], lastDoc: undefined };
};


export const fetchFullFlashcard = async (id: string): Promise<FlashCard | null> => {
  const user = firebase.auth().currentUser;
  if (user) {
    const doc = await firebase.firestore()
      .collection('users')
      .doc(user.uid)
      .collection('flashcards')
      .doc(id)
      .get();

    if (doc.exists) {
      const data = doc.data();
      return {
        id: doc.id,
        front: data?.front,
        back: data?.back,
        due: data?.due.toDate(),
        created: data?.created.toDate(),
        interval: data?.interval,
        factor: data?.factor,
        reps: data?.reps,
        lastEase: data?.lastEase,
        translationsList: data?.translationsList
      };
    }
  }
  return null;
};

export const deleteFlashcard = async (flashcardId: string) => {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('No user is authenticated');
    }
    const flashcardsCollectionRef = firebase.firestore().collection('users').doc(user.uid).collection('flashcards');
    await flashcardsCollectionRef.doc(flashcardId).delete();
    console.info(`Flashcard with ID ${flashcardId} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    throw error;
  }
};

export const checkIfWordAdded = async (word: string): Promise<boolean> => {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('No user is authenticated');
    }

    const flashcardsCollectionRef = firebase.firestore()
      .collection('users')
      .doc(user.uid)
      .collection('flashcards');

    const querySnapshot = await flashcardsCollectionRef
      .where('front.word', '==', word)
      .limit(1)
      .get();

    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if word exists:', error);
    throw error;
  }
};

export default fetchAllFlashcards;
