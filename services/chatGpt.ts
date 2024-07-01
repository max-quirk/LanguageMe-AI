import { LanguageCode } from 'iso-639-1';
import OpenAI from 'openai';
import RNFS from 'react-native-fs';
import { languageCodeToName, romanizableLangauges } from '../utils/languages';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANISATION_ID,
    project: process.env.OPENAI_PROJECT_ID,
});

// Force correct openAi url with no trailing slash 
openai.baseURL = 'https://api.openai.com/v1';
openai.buildURL = (path) => `${openai.baseURL}${path}`;

export const generateReadingPassage = async ({
  targetLanguage,
  description, 
  difficulty, 
  wordCount
}: {
  targetLanguage: LanguageCode;
  description: string;
  difficulty: string;
  wordCount: string;
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
        content: `Generate a ${wordCount}-word passage about "${description}" in ${targetLanguageName} with each word separated by a space. For example, in Chinese and other character-based languages, words should be spaced like "当 我们 谈到 撒旦 时， 我们 常常 ...". ${difficultyPrompt}. Only respond with the passage, no extra text.` }],
      temperature: 0.7,
      n: 1
    });
    console.log('response: ', response)

    return response.choices[0].message.content;
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
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `Translate the following sentence into ${translateToName}: "${exampleSentence}". No quotation marks. ${dontRomanizeClause}` }
      ],
      temperature: 0.7,
      n: 1
    });

    const translatedExampleSentence = translatedExampleSentenceResponse.choices[0].message.content;
    
    // Translate the word
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
}) => {
  const wordLanguageName = languageCodeToName(wordLanguage)
  const translateToName = languageCodeToName(translateTo)
  let dontRomanizeClause;
  if (romanizableLangauges.has(translateTo)) {
    dontRomanizeClause = `Only return original ${translateToName}, no roman characters.`
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "user", 
          content: 
            `List all possible unique translations for the ${wordLanguageName} word "${word}" in ${translateToName} as a bullet-point list. ${dontRomanizeClause}` }
      ],
      temperature: 0.7,
      n: 1
    });

    return response.choices[0].message.content;
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
      model: "gpt-3.5-turbo",
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


