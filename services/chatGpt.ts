import OpenAI from 'openai';

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
  targetLanguage: string;
  description: string;
  difficulty: string;
  wordCount: string;
 }) => {
  let difficultyPrompt = ''

  switch (difficulty) {
    case 'easy':
      difficultyPrompt = 'Use AS SIMPLE AS POSSIBLE vocabulary. This is aimed for language learning beginners.'
      break;
    case 'medium':
      difficultyPrompt = 'Use simple vocabulary aimed for an 6 year old child.'
      break;
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ 
        role: "user", 
        content: `Generate a ${wordCount} word passage with the following description: ${description}, in the language with code '${targetLanguage}'. ${difficultyPrompt}` }],
      temperature: 0.7,
      n: 1
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating passage:', error);
    throw error;
  }
};

export const generateExampleSentences = async ({
  word,
  language,
  translateTo,
}: {
  word: string,
  language: string,
  translateTo: string,
}) => {
  try {
    // Generate the example sentence
    const exampleSentenceResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `Generate a short and very simple sentence in the language with code '${language}' to demonstrate the definition of the word "${word}". Try to make all other words easier (in terms of language learning) than "${word}". Aim for about 10 words.` }
      ],
      temperature: 0.7,
      n: 1
    });

    const exampleSentence = exampleSentenceResponse.choices[0].message.content;

    // Translate the example sentence
    const translatedExampleSentenceResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `Translate the following sentence into the language with code ${translateTo}: "${exampleSentence}"` }
      ],
      temperature: 0.7,
      n: 1
    });

    const translatedExampleSentence = translatedExampleSentenceResponse.choices[0].message.content;

    // Translate the word
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `Translate the word "${word}" into the language with code ${translateTo}. Only respond with the word, nothing else.` }
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
  translateTo,
}: { 
  word: string;
  translateTo: string;
}) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `List all possible translations for the word "${word}" in the language with code ${translateTo}. Provide them as a bullet-point list.` }
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

