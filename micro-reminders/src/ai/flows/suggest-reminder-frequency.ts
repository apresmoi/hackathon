'use server';

import { openai, defaultModel } from '@/lib/openai';
import { z } from 'zod';

const SuggestReminderFrequencyInputSchema = z.object({
  title: z.string().describe('The title of the reminder.'),
  description: z.string().describe('The description of the reminder.'),
  time: z.string().describe('The time of the reminder in HH:MM format.'),
});

export type SuggestReminderFrequencyInput = z.infer<typeof SuggestReminderFrequencyInputSchema>;

const SuggestReminderFrequencyOutputSchema = z.object({
  suggestedFrequency: z.enum(['Once', 'Daily', 'Weekdays', 'Weekends', 'Weekly']).describe('The suggested frequency for the reminder.'),
  reasoning: z.string().describe('The reasoning behind the suggested frequency.'),
});

export type SuggestReminderFrequencyOutput = z.infer<typeof SuggestReminderFrequencyOutputSchema>;

export async function suggestReminderFrequency(input: SuggestReminderFrequencyInput): Promise<SuggestReminderFrequencyOutput> {
  const prompt = `You are an AI assistant that suggests a suitable frequency for a reminder based on its details.
Available frequencies are:
- Once: For one-time reminders
- Daily: For reminders that should occur every day
- Weekdays: For reminders that should occur Monday through Friday
- Weekends: For reminders that should occur Saturday and Sunday
- Weekly: For reminders that should occur once a week

Reminder Details:
Title: ${input.title}
Description: ${input.description}
Time: ${input.time}

Consider the reminder details and suggest an appropriate frequency. Pay special attention to:
1. Whether the reminder is work-related (suggest Weekdays)
2. Whether it's leisure-related (suggest Weekends)
3. Whether it's a daily habit (suggest Daily)
4. Whether it's a one-time event (suggest Once)
5. Whether it's a weekly recurring event (suggest Weekly)

Explain your reasoning.
Format your response as a JSON object with 'suggestedFrequency' (one of: Once, Daily, Weekdays, Weekends, Weekly) and 'reasoning' (string) fields.`;

  try {
    const completion = await openai.chat.completions.create({
      model: defaultModel,
      messages: [
        { 
          role: "system", 
          content: "You are a helpful AI assistant that suggests appropriate frequencies for reminders. You must respond with ONLY a valid JSON object containing suggestedFrequency and reasoning fields. No other text or formatting." 
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
    return SuggestReminderFrequencyOutputSchema.parse(parsed);
  } catch (error) {
    console.error('Error in suggestReminderFrequency:', error);
    throw new Error('Failed to suggest reminder frequency');
  }
} 