
'use server';
/**
 * @fileOverview A Genkit flow to generate a daily summary and achievement status.
 *
 * - summarizeDay - A function that calls the AI flow to get a daily summary.
 * - SummarizeDayInput - The input type for the summarizeDay function.
 * - SummarizeDayOutput - The return type for the summarizeDay function.
 * - AchievementStatus - The type for achievement status.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { AchievementStatus as AchievementStatusType } from '@/lib/types';

const SummarizeDayInputSchema = z.object({
  userName: z.string().optional().describe("The user's name, if available."),
  date: z.string().describe("The date of the log, e.g., YYYY-MM-DD."),
  caloriesConsumed: z.number().describe("Total calories consumed."),
  caloriesBurned: z.number().describe("Total calories burned from exercise."),
  netCalories: z.number().describe("Net calories (consumed - burned)."),
  goalCalories: z.number().describe("The user's target daily calorie intake."),
  userGoal: z.enum(['fat_loss', 'muscle_gain', 'maintenance']).describe("The user's primary fitness goal."),
  loggedMealNames: z.string().array().max(3).optional().describe("Up to 3 names of meals logged by the user for the day. Do not mention these in the summaryText."),
  loggedExerciseNames: z.string().array().max(3).optional().describe("Up to 3 names of exercises logged by the user for the day."),
});
export type SummarizeDayInput = z.infer<typeof SummarizeDayInputSchema>;

const SummarizeDayOutputSchema = z.object({
  summaryText: z.string().describe("A short, positive, and motivational summary of the user's day (2-3 sentences). This summary should NOT mention specific meals logged."),
  achievementStatus: z.enum(['achieved', 'nearly_achieved', 'needs_improvement'])
    .describe("The user's achievement status based on their net calories versus their goal calories, considering their primary goal."),
});
export type SummarizeDayOutput = z.infer<typeof SummarizeDayOutputSchema>;
export type AchievementStatus = AchievementStatusType;


export async function summarizeDay(
  input: SummarizeDayInput
): Promise<SummarizeDayOutput> {
  return summarizeDayFlow(input);
}

const summaryPrompt = ai.definePrompt({
  name: 'summarizeDayPrompt',
  input: {schema: SummarizeDayInputSchema},
  output: {schema: SummarizeDayOutputSchema},
  prompt: `You are a friendly and encouraging fitness coach. Your user, {{#if userName}}{{{userName}}}{{else}}there{{/if}}, is looking for a summary of their day on {{date}}.

User's Goal: {{{userGoal}}}
Target Daily Calories: {{{goalCalories}}} kcal
Actual Net Calories: {{{netCalories}}} kcal (Consumed: {{{caloriesConsumed}}} kcal, Burned: {{{caloriesBurned}}} kcal)

{{#if loggedExerciseNames.length}}
Exercises logged include: {{#each loggedExerciseNames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}

Based on this information, provide a 'summaryText' (2-3 sentences) that is positive and motivational.
The summaryText should NOT mention any specific meals the user logged.
If specific exercises are mentioned, you can incorporate one briefly into the summaryText in a positive way.
Also, determine the 'achievementStatus' based on the following rules:

1.  If userGoal is 'fat_loss':
    - 'achieved': netCalories <= goalCalories
    - 'nearly_achieved': netCalories > goalCalories AND netCalories <= goalCalories + 150
    - 'needs_improvement': netCalories > goalCalories + 150
2.  If userGoal is 'muscle_gain':
    - 'achieved': netCalories >= goalCalories
    - 'nearly_achieved': netCalories < goalCalories AND netCalories >= goalCalories - 150
    - 'needs_improvement': netCalories < goalCalories - 150
3.  If userGoal is 'maintenance':
    - 'achieved': ABS(netCalories - goalCalories) <= 100
    - 'nearly_achieved': ABS(netCalories - goalCalories) > 100 AND ABS(netCalories - goalCalories) <= 250
    - 'needs_improvement': ABS(netCalories - goalCalories) > 250

Keep the summaryText concise and uplifting.
Example for 'fat_loss' and 'achieved': "Great job staying on track with your fat loss goal today, {{#if userName}}{{{userName}}}{{else}}there{{/if}}! Looks like that [Example Exercise if provided] really helped. Keep up the fantastic work!"
Example for 'muscle_gain' and 'nearly_achieved': "You're so close to your muscle gain target for today, {{#if userName}}{{{userName}}}{{else}}there{{/if}}! That [Example Exercise if provided] session was a great effort. A little more fuel tomorrow and you'll nail it!"

Return only the JSON object with 'summaryText' and 'achievementStatus'.
`,
});

const summarizeDayFlow = ai.defineFlow(
  {
    name: 'summarizeDayFlow',
    inputSchema: SummarizeDayInputSchema,
    outputSchema: SummarizeDayOutputSchema,
  },
  async input => {
    const {output} = await summaryPrompt(input);
    if (!output) {
        return {
            summaryText: "I couldn't generate a summary right now. Please ensure you've logged some data for today.",
            achievementStatus: 'needs_improvement' as AchievementStatusType,
        };
    }
    return output;
  }
);

