import { DAY_IN_MS } from "../constants/time";
import { FlashCard } from "types";
import { generateExampleSentences } from "../services/chatGpt";
import { firebase } from "@react-native-firebase/auth";
import { getUserDoc, recordProgress } from "./firebase";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

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
        if (!card.firstMarkedEasy) {
          card.firstMarkedEasy = now; 
          recordProgress({ userId: user?.uid, type: 'learnt' });
        } else {
          card.lastMarkedEasy = now;  
          recordProgress({ userId: user?.uid, type: 'revised' });
        }
        break;
    }
  }
  card.due = new Date(now.getTime() + card.interval);
  card.reps += 1;

  await editFlashcardOnFirebase(card);

  return { card };
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
  language,
  translateTo,
}: {
  word: string,
  language: string,
  translateTo: string,
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
      language,
      translateTo
    });

    const newFlashcard = {
      front: {
        word,
        example: exampleSentence,
      },
      back: {
        word: translation,
        example: translatedExampleSentence,
      },
      due: new Date(Date.now()),
      interval: 1,
      factor: 2500,
      reps: 0,
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

    console.log('All flashcards deleted successfully.');
  } catch (error) {
    console.error('Error deleting flashcards: ', error);
  }
};
