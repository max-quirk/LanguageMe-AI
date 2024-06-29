import iso6391, { LanguageCode } from 'iso-639-1';

import ISO6391 from 'iso-639-1';

const chatGptSupportedLanguages = new Set([
  'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Bengali', 'Bosnian', 'Bulgarian', 
  'Burmese', 'Catalan', 'Chinese', 'Croatian', 'Czech', 'Danish', 'Dutch', 'Estonian', 'English',
  'Finnish', 'French', 'Georgian', 'German', 'Greek', 'Gujarati', 'Hindi', 'Hungarian', 
  'Icelandic', 'Indonesian', 'Italian', 'Japanese', 'Kannada', 'Kazakh', 'Korean', 
  'Latvian', 'Lithuanian', 'Macedonian', 'Malay', 'Malayalam', 'Marathi', 'Mongolian', 
  'Norwegian', 'Persian', 'Polish', 'Portuguese', 'Punjabi', 'Romanian', 'Russian', 
  'Serbian', 'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Swahili', 'Swedish', 'Tagalog', 
  'Tamil', 'Telugu', 'Thai', 'Turkish', 'Ukrainian', 'Urdu', 'Vietnamese'
]);

export const romanizableLangauges = new Set([
  'zh', 'ja', 'th', 'ko',
  //'Chinese', 'Japanese', 'Thai', 'Korean'
])

const languages = ISO6391.getAllNames().map((name) => ({
  name,
  code: ISO6391.getCode(name),
})).filter(language => chatGptSupportedLanguages.has(language.name))
  .sort((a, b) => a.name.localeCompare(b.name));

export const languageCodeToName = (code: LanguageCode) => {
  if (code == 'zh') return 'Chinese (simplified)'
  return iso6391.getName(code);
};

export default languages;
