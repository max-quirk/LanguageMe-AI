import { LanguageCode } from 'iso-639-1';
import RNFS from 'react-native-fs';
import { languageCodeToName, romanizableLangauges } from '../utils/languages';
import openai from './openai';
import { cleanLeadingHyphens, processGeneratedReading } from '../utils/readings';

export const generateReadingPassage = async ({
  targetLanguage,
  description, 
  difficulty, 
  wordCount
}: {
  targetLanguage: LanguageCode;
  description: string;
  difficulty: string;
  wordCount: number;
 }) => {
  let difficultyPrompt = ''
  const targetLanguageName = languageCodeToName(targetLanguage)

  switch (difficulty) {
    case 'easy':
      difficultyPrompt = 'Use extremely simple words for beginners learning this language.'
      break;
    case 'medium':
      difficultyPrompt = 'Use simple vocabulary for a 6 year old child.'
      break;
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ 
        role: "user", 
        content: `Generate a ${wordCount}-word passage about "${description}" in ${targetLanguageName} with each word separated by a single space. Ensure there is a ' ' between each word, even if separated by puncuation like '。，'. For example, in Chinese and other character-based languages, words should be spaced like "当 我们 谈到 撒旦 时， 我们 常常". ${difficultyPrompt}. Only respond with the passage, no extra text.` }],
      temperature: 0.7,
      n: 1
    });

    return processGeneratedReading(response.choices[0].message.content ?? '');
  } catch (error) {
    console.error('Error generating passage:', error);
    throw error;
  }
};

export const generateExampleSentences = async ({
  word,
  wordLanguage,
  translateTo,
}: {
  word: string,
  wordLanguage: LanguageCode,
  translateTo: LanguageCode,
}) => {
  const wordLanguageName = languageCodeToName(wordLanguage)
  const translateToName = languageCodeToName(translateTo)
  try {
    // Generate the example sentence
    const exampleSentenceResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "user", content: `Generate one short and very simple ~10-word sentence in ${wordLanguageName} that includes and demonstrates the definition of the word "${word}". Try to make all other words easier (in terms of language learning) than "${word}". Respond with a ${wordLanguageName} sentence only.` }
      ],
      temperature: 0.7,
      n: 1
    });

    const exampleSentence = exampleSentenceResponse.choices[0].message.content;
    let dontRomanizeClause;
    if (romanizableLangauges.has(translateTo)) {
      dontRomanizeClause = `Only return original ${translateToName}, no roman characters.`
    }
    // Translate the example sentence
    const translatedExampleSentenceResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: `Translate the following sentence into ${translateToName}: "${exampleSentence}". No quotation marks. ${dontRomanizeClause}` }
      ],
      temperature: 0.7,
      n: 1
    });

    const translatedExampleSentence = translatedExampleSentenceResponse.choices[0].message.content;
    
    // Translate the word
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: `Translate the ${wordLanguageName} word "${word}" into ${translateToName}. Just respond with the word. ${dontRomanizeClause}` }
      ],
      temperature: 0.7,
      n: 1
    });

    const translation = translationResponse.choices[0].message.content;

    return {
      exampleSentence,
      translation,
      translatedExampleSentence
    };
  } catch (error) {
    console.error('Error generating sentences:', error);
    throw error;
  }
};

// Fetches the possible translations for a word in a user's native language
export const getPossibleTranslations = async ({ 
  word,
  wordLanguage,
  translateTo,
}: { 
  word: string;
  wordLanguage: LanguageCode,
  translateTo: LanguageCode;
}): Promise<string[]> => {
  const wordLanguageName = languageCodeToName(wordLanguage)
  const translateToName = languageCodeToName(translateTo)
  let dontRomanizeClause;
  if (romanizableLangauges.has(translateTo)) {
    dontRomanizeClause = `Only return original ${translateToName}, no roman characters.`
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "user", 
          content: 
            `List possible unique translations (as few as possible, don't repeat basically the same word) for the ${wordLanguageName} word "${word}" in ${translateToName} as a bullet-point list. Just respond with the list, no extra text. ${dontRomanizeClause}` }
      ],
      temperature: 0.7,
      n: 1
    });

    const translationsListAsString = response.choices[0].message.content;
    return translationsListAsString
          ?.split('\n')
          .map(item => cleanLeadingHyphens(item))
          .filter(item => item !== '') ?? [];

  } catch (error) {
    console.error('Error getting translations:', error);
    throw error;
  }
};

// e.g. converts 你好 to nǐhaǒ
export const romanizeText = async ({
  text, 
  language
}: {
  text: string,
  language: LanguageCode,
}) => {
  const languageName = languageCodeToName(language)
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "user", 
          content: `Romanize the following ${languageName} text with appropriate tones if necessary: "${text}". e.g. 你好 -> nǐhǎo. No quotes.` 
        }
      ],
      temperature: 0.7,
      n: 1
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error romanizing text:', error);
    throw error;
  }
};

export const fetchSpeechUrl = async ({
  text,
  type,
  id
}: {
  text: string,
  type: 'reading' | 'flashcard' | 'word',
  id: string
}): Promise<string | null> => {
  try {
    const speechFileUrl = `${RNFS.DocumentDirectoryPath}/tts_${type}_${id}.mp3`

    const fileExists = await RNFS.exists(speechFileUrl);

    if (fileExists) {
      return `file://${speechFileUrl}`;
    }

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      input: text,
      voice: 'fable',
      response_format: 'mp3'
    });

    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Audio = base64data.split(',')[1];
        try {
          await RNFS.writeFile(speechFileUrl, base64Audio, 'base64');
          resolve(`file://${speechFileUrl}`);
        } catch (error) {
          console.error('Error writing file:', error);
          reject(null);
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading blob:', error);
        reject(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
};


// Fetches the possible translations for a word in a user's native language with some extra detail
// e.g.  'table' returns: [{ word: '桌子', translation: 'furniture, desk' }, ...]
export const getSearchResults = async ({ 
  word,
  wordLanguage,
  translateTo,
}: { 
  word: string;
  wordLanguage: LanguageCode,
  translateTo: LanguageCode;
}): Promise<{ word: string; translation: string }[]> => {
  const wordLanguageName = languageCodeToName(wordLanguage)
  const translateToName = languageCodeToName(translateTo)
  let dontRomanizeClause;
  if (romanizableLangauges.has(translateTo)) {
    dontRomanizeClause = `Do not make any ${translateToName} words into their romanized versions (e.g. no Pinyin).`
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "user", 
          content: 
            `List all possible unique translations for the ${wordLanguageName} word "${word}" in ${translateToName} as a bullet-point list. Next to each ${translateToName} word (separate with |), add as few ${wordLanguageName} words as possible to clarify the definition of the ${translateToName} word. Just respond with the list, no extra text. ${dontRomanizeClause}` }
      ],
      temperature: 0.7,
      n: 1
    });

    const resultsAsString = response.choices[0].message.content;
    const results = resultsAsString
      ?.split('\n')
      .map(item => cleanLeadingHyphens(item))
      .filter(item => item !== '') ?? [];

    return results.map(item => {
      const [word, translation] = item.split(' | ');
      return { word, translation };
    });
  } catch (error) {
    console.error('Error getting translations:', error);
    throw error;
  }
};

export async function useHardestWord(passage: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "user", 
          content: 
            `${passage}\n. Tell me what the hardest word within this passage's first words in. Just respond with one number - the index of the word (first word is 0), nothing else.` }
      ],
      temperature: 0.7,
      n: 1
    });

    return parseInt(response.choices[0].message.content ?? '')
  } catch (error) {
    console.error('Error getting hardest word:', error);
    throw error;
  }
}


export async function translatePassage({
  passage,
  language,
  translateTo,
}: {
  passage: string
  language: LanguageCode
  translateTo: LanguageCode
}) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "user", 
          content: 
            `Translate the follow ${language} passage into ${translateTo}: \n\n${passage}. Only respond with the translated passage.` }
      ],
      temperature: 0.7,
      n: 1
    });

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error getting hardest word:', error);
    throw error;
  }
}
