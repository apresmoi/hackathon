
'use server';
/**
 * @fileOverview A Genkit flow to estimate calories burned for a given exercise and duration.
 *
 * - estimateExerciseCalories - A function that calls the AI flow to get calorie burn estimates.
 * - EstimateExerciseCaloriesInput - The input type for the estimateExerciseCalories function.
 * - EstimateExerciseCaloriesOutput - The return type for the estimateExerciseCalories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateExerciseCaloriesInputSchema = z.object({
  exerciseName: z.string().describe('The name of the exercise.'),
  duration: z.number().min(1).describe('The duration of the exercise in minutes.'),
});
export type EstimateExerciseCaloriesInput = z.infer<typeof EstimateExerciseCaloriesInputSchema>;

const EstimateExerciseCaloriesOutputSchema = z.object({
  caloriesBurned: z.number().describe('Estimated calories burned.'),
});
export type EstimateExerciseCaloriesOutput = z.infer<typeof EstimateExerciseCaloriesOutputSchema>;

export async function estimateExerciseCalories(
  input: EstimateExerciseCaloriesInput
): Promise<EstimateExerciseCaloriesOutput> {
  return estimateExerciseCaloriesFlow(input);
}

const exerciseCaloriesPrompt = ai.definePrompt({
  name: 'estimateExerciseCaloriesPrompt',
  input: {schema: EstimateExerciseCaloriesInputSchema},
  output: {schema: EstimateExerciseCaloriesOutputSchema},
  prompt: `You are an expert fitness AI. Given the following exercise name and its duration in minutes, provide an estimate for the calories burned.
Exercise Name: {{{exerciseName}}}
Duration: {{{duration}}} minutes

Return the estimated calories burned.
If you cannot make a reasonable estimate, return 0. Ensure the returned value is a number.
Provide only the calorie information in the requested JSON format.
`,
});

const estimateExerciseCaloriesFlow = ai.defineFlow(
  {
    name: 'estimateExerciseCaloriesFlow',
    inputSchema: EstimateExerciseCaloriesInputSchema,
    outputSchema: EstimateExerciseCaloriesOutputSchema,
  },
  async input => {
    if (!input.exerciseName.trim() || input.duration <= 0) {
      return { caloriesBurned: 0 };
    }
    const {output} = await exerciseCaloriesPrompt(input);
    return output!;
  }
);
