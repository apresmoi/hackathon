import {genkit} from 'genkit';
// import {googleAI} from '@genkit-ai/googleai'; // Removed to avoid API key requirement

export const ai = genkit({
  plugins: [
    // googleAI() // Removed to avoid API key requirement
  ],
  // model: 'googleai/gemini-2.0-flash', // Removed as the googleAI plugin is not active
});
