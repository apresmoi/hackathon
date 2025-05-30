// 'use server'
'use server';

import { generateTopicSuggestion as genkitGenerateTopicSuggestion } from '@/ai/flows/generate-topic-suggestion';
import type { GenerateTopicSuggestionInput, GenerateTopicSuggestionOutput } from '@/ai/flows/generate-topic-suggestion';
import { z } from 'zod';

const GenerateTopicSchema = z.object({
  userInput: z.string().min(3, { message: 'Please enter at least 3 characters for your topic idea.' }),
});

interface FormState {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  data?: GenerateTopicSuggestionOutput;
}

export async function generateTopicSuggestionAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const userInput = formData.get('userInput') as string;

  const validatedFields = GenerateTopicSchema.safeParse({ userInput });

  if (!validatedFields.success) {
    const issues = validatedFields.error.issues.map((issue) => issue.message);
    return {
      message: 'Validation failed. Please check your input.',
      issues,
      fields: { userInput },
    };
  }

  try {
    const aiInput: GenerateTopicSuggestionInput = { userInput: validatedFields.data.userInput };
    const result = await genkitGenerateTopicSuggestion(aiInput);
    
    if (result) {
      return {
        message: 'Successfully generated topic suggestions!',
        data: result,
      };
    } else {
      return {
        message: 'AI could not generate suggestions for this input. Please try a different topic.',
        fields: { userInput },
      };
    }
  } catch (error) {
    console.error('Error calling AI for topic suggestion:', error);
    let errorMessage = 'An unexpected error occurred while generating topic suggestions.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return {
      message: errorMessage,
      fields: { userInput },
    };
  }
}
