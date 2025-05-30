'use server';
/**
 * @fileOverview An AI agent that suggests a suitable Lucide icon for a reminder based on its title and description.
 *
 * - suggestReminderIcon - A function that suggests a reminder icon.
 * - SuggestReminderIconInput - The input type for the suggestReminderIcon function.
 * - SuggestReminderIconOutput - The return type for the suggestReminderIcon function.
 */

import { openai, defaultModel } from '@/lib/openai';
import { z } from 'zod';

const SuggestReminderIconInputSchema = z.object({
  title: z.string().describe('The title of the reminder.'),
  description: z.string().describe('The description of the reminder.'),
});

export type SuggestReminderIconInput = z.infer<typeof SuggestReminderIconInputSchema>;

const SuggestReminderIconOutputSchema = z.object({
  suggestedIconName: z.enum(['Coffee', 'BookOpen', 'ClipboardList', 'Calendar', 'Bell', 'CheckCircle', 'Clock', 'Star']).describe('The suggested Lucide icon name.'),
  reasoning: z.string().describe('The reasoning behind the suggested icon.'),
});

export type SuggestReminderIconOutput = z.infer<typeof SuggestReminderIconOutputSchema>;

export async function suggestReminderIcon(input: SuggestReminderIconInput): Promise<SuggestReminderIconOutput> {
  const prompt = `You are an AI assistant that suggests a suitable Lucide icon for a reminder based on its details.
Available icons are: Coffee, BookOpen, ClipboardList, Calendar, Bell, CheckCircle, Clock, Star.

Reminder Details:
Title: ${input.title}
Description: ${input.description}

Consider the reminder details and suggest an appropriate icon from the available options. Explain your reasoning.
Format your response as a JSON object with 'suggestedIconName' (one of the available icons) and 'reasoning' (string) fields.`;

  try {
    const completion = await openai.chat.completions.create({
      model: defaultModel,
      messages: [
        { 
          role: "system", 
          content: "You are a helpful AI assistant that suggests appropriate icons for reminders. You must respond with ONLY a valid JSON object containing suggestedIconName and reasoning fields. No other text or formatting." 
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
    return SuggestReminderIconOutputSchema.parse(parsed);
  } catch (error) {
    console.error('Error in suggestReminderIcon:', error);
    throw new Error('Failed to suggest reminder icon');
  }
}
