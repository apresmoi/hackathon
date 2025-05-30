// Este es un chatbot de camarero impulsado por IA diseñado para ayudar a los clientes a seleccionar sus pedidos de comida.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiWaiterChatbotInputSchema = z.object({
  userInput: z.string().describe('El mensaje de entrada del usuario.'),
  menu: z.string().describe('El menú del restaurante.'),
  orderHistory: z.string().optional().describe('El historial de pedidos del usuario, si existe.'),
});
export type AiWaiterChatbotInput = z.infer<typeof AiWaiterChatbotInputSchema>;

const AiWaiterChatbotOutputSchema = z.object({
  response: z.string().describe('La respuesta del chatbot camarero con IA.'),
});
export type AiWaiterChatbotOutput = z.infer<typeof AiWaiterChatbotOutputSchema>;

export async function aiWaiterChatbot(input: AiWaiterChatbotInput): Promise<AiWaiterChatbotOutput> {
  return aiWaiterChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiWaiterChatbotPrompt',
  input: {schema: AiWaiterChatbotInputSchema},
  output: {schema: AiWaiterChatbotOutputSchema},
  prompt: `Eres un chatbot camarero con IA que ayuda a los clientes con sus pedidos de comida. Debes responder siempre en ESPAÑOL.

Tienes acceso al menú del restaurante, que puedes usar para sugerir platos basados en las preferencias del cliente.

Menú: {{{menu}}}

Historial de Pedidos: {{{orderHistory}}}

Entrada del Cliente: {{{userInput}}}

Basándote en el menú, el historial de pedidos y la entrada del cliente, proporciona una respuesta útil y amigable para guiar al cliente en la selección de su pedido. Responde siempre en ESPAÑOL.

Considera los turnos anteriores de la conversación al responder.

Respuesta (en ESPAÑOL):`,
});

const aiWaiterChatbotFlow = ai.defineFlow(
  {
    name: 'aiWaiterChatbotFlow',
    inputSchema: AiWaiterChatbotInputSchema,
    outputSchema: AiWaiterChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
