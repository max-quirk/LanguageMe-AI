import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANISATION_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

// Force correct OpenAI URL with no trailing slash 
openai.baseURL = 'https://api.openai.com/v1';
openai.buildURL = (path) => `${openai.baseURL}${path}`;

export default openai;
