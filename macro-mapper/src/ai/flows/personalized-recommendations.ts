// src/ai/flows/personalized-recommendations.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized meal and exercise recommendations.
 *
 * The flow takes user profile information, dietary restrictions, preferences, and calorie intake
 * to generate tailored suggestions for meals and exercises that align with the user's fitness goals.
 *
 * @interface PersonalizedRecommendationsInput - Defines the input schema for the personalized recommendations flow.
 * @interface PersonalizedRecommendationsOutput - Defines the output schema for the personalized recommendations flow.
 * @function getPersonalizedRecommendations - An async function that calls the personalizedRecommendationsFlow with the input and returns the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  age: z.number().describe('The user\'s age in years.'),
  gender: z.enum(['male', 'female']).describe('The user\'s gender.'),
  height: z.number().describe('The user\'s height in centimeters.'),
  weight: z.number().describe('The user\'s weight in kilograms.'),
  goal: z.enum(['fat_loss', 'muscle_gain', 'maintenance']).describe('The user\'s fitness goal.'),
  activityLevel: z
    .string()
    .describe(
      'The user\'s activity level (e.g., sedentary, lightly active, moderately active, very active).'
    ),
  dietaryRestrictions: z
    .string()
    .array()
    .describe('An array of dietary restrictions the user has (e.g., vegetarian, gluten-free).'),
  preferences: z
    .string()
    .array()
    .describe('An array of user preferences for meals and exercises.'),
  dailyCaloriesIntake: z
    .number()
    .describe('The user\'s daily calories intake.'),
});

export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const PersonalizedRecommendationsOutputSchema = z.object({
  mealRecommendations: z
    .string()
    .array()
    .describe('An array of personalized meal recommendations.'),
  exerciseRecommendations: z
    .string()
    .array()
    .describe('An array of personalized exercise recommendations.'),
});

export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}

const personalizedRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are a personal fitness and nutrition coach.

  Based on the user's profile and preferences, provide personalized meal and exercise recommendations.

  User Profile:
  - Age: {{{age}}}
  - Gender: {{{gender}}}
  - Height: {{{height}}} cm
  - Weight: {{{weight}}} kg
  - Goal: {{{goal}}}
  - Activity Level: {{{activityLevel}}}
  - Dietary Restrictions: {{#if dietaryRestrictions.length}}{{#each dietaryRestrictions}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
  - Preferences: {{#if preferences.length}}{{#each preferences}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
  - Daily Calorie Intake: {{{dailyCaloriesIntake}}}

  Provide 3 meal recommendations and 3 exercise recommendations that align with the user's profile, goals, and preferences. Take dietary restrictions into account.

  Format the output as a JSON object with 'mealRecommendations' and 'exerciseRecommendations' arrays.
  `,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await personalizedRecommendationsPrompt(input);
    return output!;
  }
);
