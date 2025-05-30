// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate fair reward points for a chore based on the average dislike values of other family members.
 *
 * - generateFairRewardPoints - A function that generates fair reward points for a chore.
 * - GenerateFairRewardPointsInput - The input type for the generateFairRewardPoints function.
 * - GenerateFairRewardPointsOutput - The output type for the generateFairRewardPoints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFairRewardPointsInputSchema = z.object({
  dislikeValues: z
    .array(z.number().min(1).max(10))
    .describe('An array of dislike values (1-10) from other family members for the chore.'),
});
export type GenerateFairRewardPointsInput = z.infer<typeof GenerateFairRewardPointsInputSchema>;

const GenerateFairRewardPointsOutputSchema = z.object({
  rewardPoints: z
    .number()
    .describe('The calculated fair reward points for the chore, based on the average dislike values.'),
});
export type GenerateFairRewardPointsOutput = z.infer<typeof GenerateFairRewardPointsOutputSchema>;

export async function generateFairRewardPoints(input: GenerateFairRewardPointsInput): Promise<GenerateFairRewardPointsOutput> {
  return generateFairRewardPointsFlow(input);
}

const generateFairRewardPointsFlow = ai.defineFlow(
  {
    name: 'generateFairRewardPointsFlow',
    inputSchema: GenerateFairRewardPointsInputSchema,
    outputSchema: GenerateFairRewardPointsOutputSchema,
  },
  async input => {
    const {
      dislikeValues,
    } = input;

    const sum = dislikeValues.reduce((a, b) => a + b, 0);
    const avg = dislikeValues.length > 0 ? sum / dislikeValues.length : 0;

    // Round to the nearest integer
    const rewardPoints = Math.round(avg);

    return {
      rewardPoints,
    };
  }
);
