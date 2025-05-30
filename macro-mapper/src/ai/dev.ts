
import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-recommendations.ts';
import '@/ai/flows/estimate-meal-nutrition-flow.ts';
import '@/ai/flows/estimate-exercise-calories-flow.ts';
import '@/ai/flows/summarize-day-flow.ts';
