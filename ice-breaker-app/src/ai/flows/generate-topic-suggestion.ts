// 'use server'
'use server';

/**
 * @fileOverview An AI chat assistant for drafting icebreaker topic ideas and providing alternative headline suggestions.
 *
 * - generateTopicSuggestion - A function that handles the topic suggestion process.
 * - GenerateTopicSuggestionInput - The input type for the generateTopicSuggestion function.
 * - GenerateTopicSuggestionOutput - The return type for the generateTopicSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTopicSuggestionInputSchema = z.object({
  userInput: z.string().describe('The user input for the icebreaker topic.'),
});
export type GenerateTopicSuggestionInput = z.infer<typeof GenerateTopicSuggestionInputSchema>;

const GenerateTopicSuggestionOutputSchema = z.object({
  polishedTopic: z.string().describe('A polished version of the user input.'),
  alternativeHeadlines: z.array(z.string()).describe('Three alternative headline suggestions.'),
});
export type GenerateTopicSuggestionOutput = z.infer<typeof GenerateTopicSuggestionOutputSchema>;

export async function generateTopicSuggestion(input: GenerateTopicSuggestionInput): Promise<GenerateTopicSuggestionOutput> {
  return generateTopicSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTopicSuggestionPrompt',
  input: {schema: GenerateTopicSuggestionInputSchema},
  output: {schema: GenerateTopicSuggestionOutputSchema},
  prompt: `You are an AI chat assistant that helps users draft icebreaker topic ideas and receive alternative headline suggestions.

  User Input: {{{userInput}}}

  Instructions: Provide a polished version of the user input and three alternative headline suggestions. Format the alternative headlines as a numbered list.

  Output Format:
  {
    "polishedTopic": "polished version of user input",
    "alternativeHeadlines": ["headline suggestion 1", "headline suggestion 2", "headline suggestion 3"]
  }
  `,
});

const generateTopicSuggestionFlow = ai.defineFlow(
  {
    name: 'generateTopicSuggestionFlow',
    inputSchema: GenerateTopicSuggestionInputSchema,
    outputSchema: GenerateTopicSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
