
'use server';
/**
 * @fileOverview A Genkit flow to simulate sending an invitation email to a new user.
 *
 * - sendInviteEmail - A function that simulates sending an invite.
 * - SendInviteEmailInput - The input type for the sendInviteEmail function.
 * - SendInviteEmailOutput - The return type for the sendInviteEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendInviteEmailInputSchema = z.object({
  email: z.string().email().describe('The email address of the person to invite.'),
  familyName: z.string().describe('The name of the family they are invited to join.'),
  adminName: z.string().describe('The name of the admin sending the invitation.'),
});
export type SendInviteEmailInput = z.infer<typeof SendInviteEmailInputSchema>;

const SendInviteEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the invitation email was "sent" successfully.'),
  message: z.string().describe('A message indicating the outcome of the simulated email sending.'),
});
export type SendInviteEmailOutput = z.infer<typeof SendInviteEmailOutputSchema>;

export async function sendInviteEmail(input: SendInviteEmailInput): Promise<SendInviteEmailOutput> {
  return sendInviteEmailFlow(input);
}

const sendInviteEmailFlow = ai.defineFlow(
  {
    name: 'sendInviteEmailFlow',
    inputSchema: SendInviteEmailInputSchema,
    outputSchema: SendInviteEmailOutputSchema,
  },
  async (input) => {
    console.log(`Simulating sending invitation email to: ${input.email}`);
    console.log(`Family Name: ${input.familyName}`);
    console.log(`Invited by (Admin): ${input.adminName}`);
    
    // In a real scenario, this is where you would integrate with an email service.
    // For now, we just simulate success.
    
    return {
      success: true,
      message: `An invitation email has been "sent" to ${input.email}. They can join '${input.familyName}' after signing up.`,
    };
  }
);
