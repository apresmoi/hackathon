import OpenAI from 'openai/index.mjs';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ai = {
  async generateText(prompt: string) {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  },

  async suggestReminderTime(description: string) {
    const prompt = `You are an AI assistant that suggests a suitable time of day for a reminder, given its description. The time should be in HH:MM format.

Description: ${description}

Consider the description and suggest a time of day that would be appropriate for the reminder. Explain your reasoning.
Return the response in JSON format with two fields:
- suggestedTime: string (HH:MM format)
- reasoning: string`;

    const response = await this.generateText(prompt);
    try {
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        suggestedTime: '09:00',
        reasoning: 'Default time due to parsing error'
      };
    }
  },

  async suggestReminderIcon(title: string, description?: string) {
    const prompt = `You are an AI assistant that suggests a suitable icon for a reminder from the Lucide React icon library, given its title and optional description. The icon name must be a valid CamelCase name from Lucide (e.g., 'GlassWater', 'Bike', 'BookOpen', 'AlarmClock', 'CalendarDays', 'Mail', 'MessageSquare').

If the title or description is vague or no specific icon seems appropriate, suggest a generic icon like 'ClipboardList' or 'Bell'.

Reminder Title: ${title}
${description ? `Reminder Description: ${description}` : ''}

Consider the title and description to suggest an icon. Explain your reasoning for choosing that specific icon.
Return the response in JSON format with two fields:
- suggestedIconName: string (valid Lucide icon name)
- reasoning: string`;

    const response = await this.generateText(prompt);
    try {
      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        suggestedIconName: 'ClipboardList',
        reasoning: 'Default icon due to parsing error'
      };
    }
  }
};
