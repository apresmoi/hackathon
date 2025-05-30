
'use server';
/**
 * @fileOverview A Genkit flow to estimate nutritional information for a given meal name.
 *
 * - estimateMealNutrition - A function that calls the AI flow to get nutritional estimates.
 * - EstimateMealNutritionInput - The input type for the estimateMealNutrition function.
 * - EstimateMealNutritionOutput - The return type for the estimateMealNutrition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateMealNutritionInputSchema = z.object({
  mealName: z.string().describe('The name of the meal to estimate nutrition for.'),
});
export type EstimateMealNutritionInput = z.infer<typeof EstimateMealNutritionInputSchema>;

const EstimateMealNutritionOutputSchema = z.object({
  calories: z.number().describe('Estimated calories in kcal.'),
  protein: z.number().describe('Estimated protein in grams.'),
  carbs: z.number().describe('Estimated carbohydrates in grams.'),
  fats: z.number().describe('Estimated fats in grams.'),
});
export type EstimateMealNutritionOutput = z.infer<typeof EstimateMealNutritionOutputSchema>;

export async function estimateMealNutrition(
  input: EstimateMealNutritionInput
): Promise<EstimateMealNutritionOutput> {
  return estimateMealNutritionFlow(input);
}

const nutritionPrompt = ai.definePrompt({
  name: 'estimateMealNutritionPrompt',
  input: {schema: EstimateMealNutritionInputSchema},
  output: {schema: EstimateMealNutritionOutputSchema},
  prompt: `You are an expert nutritionist. Given the following meal name, provide an estimate for its nutritional content.
Meal Name: {{{mealName}}}

Return the estimated calories (kcal), protein (grams), carbohydrates (grams), and fats (grams).
If you cannot make a reasonable estimate for any value, return 0 for that specific value. Ensure all returned values are numbers.
Provide only the nutritional information in the requested JSON format.
`,
});

const estimateMealNutritionFlow = ai.defineFlow(
  {
    name: 'estimateMealNutritionFlow',
    inputSchema: EstimateMealNutritionInputSchema,
    outputSchema: EstimateMealNutritionOutputSchema,
  },
  async input => {
    if (!input.mealName.trim()) {
      // Return zeros if mealName is empty or whitespace, as the AI might hallucinate.
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }
    const {output} = await nutritionPrompt(input);
    return output!;
  }
);
