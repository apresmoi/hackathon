'use server';

/**
 * @fileOverview An AI agent that suggests a suitable time of day for a reminder based on its description.
 *
 * - suggestReminderTime - A function that suggests a reminder time.
 * - SuggestReminderTimeInput - The input type for the suggestReminderTime function.
 * - SuggestReminderTimeOutput - The return type for the suggestReminderTime function.
 */

import { openai, defaultModel } from '@/lib/openai';
import { z } from 'zod';

const SuggestReminderTimeInputSchema = z.object({
  description: z.string().describe('The description of the reminder.'),
});

export type SuggestReminderTimeInput = z.infer<typeof SuggestReminderTimeInputSchema>;

const SuggestReminderTimeOutputSchema = z.object({
  suggestedTime: z.string().describe('A suggested time of day for the reminder, in HH:MM format.'),
  reasoning: z.string().describe('The reasoning behind the suggested time.'),
});

export type SuggestReminderTimeOutput = z.infer<typeof SuggestReminderTimeOutputSchema>;

export async function suggestReminderTime(input: SuggestReminderTimeInput): Promise<SuggestReminderTimeOutput> {
  const prompt = `You are an AI assistant that suggests a suitable time of day for a reminder, given its description. 
The time should be in HH:MM format (24-hour).

Description: ${input.description}

Consider the description and suggest a time of day that would be appropriate for the reminder. Explain your reasoning.
Format your response as a JSON object with 'suggestedTime' (HH:MM format) and 'reasoning' (string) fields.`;

  try {
    const completion = await openai.chat.completions.create({
      model: defaultModel,
      messages: [
        { 
          role: "system", 
          content: "You are a helpful AI assistant that suggests appropriate times for reminders. You must respond with ONLY a valid JSON object containing suggestedTime and reasoning fields. No other text or formatting." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Clean the response string to ensure it's valid JSON
    const cleanResponse = response.trim().replace(/^```json\s*|\s*```$/g, '');
    
    const parsed = JSON.parse(cleanResponse);
    return SuggestReminderTimeOutputSchema.parse(parsed);
  } catch (error) {
    console.error('Error in suggestReminderTime:', error);
    throw new Error('Failed to suggest reminder time');
  }
}
