'use server';
/**
 * @fileOverview An AI flow for generating a weekly meal plan based on a calorie target.
 *
 * - generateMealPlan - A function that handles the meal plan generation process.
 * - GenerateMealPlanInput - The input type for the generateMealPlan function.
 * - GenerateMealPlanOutput - The return type for the generateMealPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MealSchema = z.object({
  name: z.string().describe('The name of the meal.'),
  calories: z.number().describe('The calorie count of the meal.'),
});

const GenerateMealPlanInputSchema = z.object({
  calorieTarget: z
    .number()
    .describe('The target daily calorie intake for the meal plan.'),
  meals: z
    .array(MealSchema)
    .describe('A list of available meals to choose from.'),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

const DailyPlanSchema = z.object({
  breakfast: z.string().describe('The name of the breakfast meal.'),
  lunch: z.string().describe('The name of the lunch meal.'),
  dinner: z.string().describe('The name of the dinner meal.'),
  totalCalories: z.number().describe('The total calories for the day.'),
});

const GenerateMealPlanOutputSchema = z.object({
  plan: z.object({
    monday: DailyPlanSchema,
    tuesday: DailyPlanSchema,
    wednesday: DailyPlanSchema,
    thursday: DailyPlanSchema,
    friday: DailyPlanSchema,
    saturday: DailyPlanSchema,
    sunday: DailyPlanSchema,
  }),
});
export type GenerateMealPlanOutput = z.infer<
  typeof GenerateMealPlanOutputSchema
>;

export async function generateMealPlan(
  input: GenerateMealPlanInput
): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: { schema: GenerateMealPlanInputSchema },
  output: { schema: GenerateMealPlanOutputSchema },
  prompt: `You are a diet and nutrition expert. Your task is to create a 7-day meal plan based on a list of available meals.

The user has a daily calorie target of {{calorieTarget}} kcal.

You must create a full 7-day plan (Monday to Sunday). For each day, you must select one breakfast, one lunch, and one dinner from the provided list of meals.

The total daily calories for each day should be as close as possible to the {{calorieTarget}}, but not significantly over. A little under is acceptable. You must calculate and provide the total calories for each day.

Here is the list of available meals and their calorie counts:
{{#each meals}}
- {{name}} ({{calories}} kcal)
{{/each}}

Please provide the complete 7-day plan in the required format. Only use meals from the list provided.`,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a meal plan.');
    }
    return output;
  }
);
