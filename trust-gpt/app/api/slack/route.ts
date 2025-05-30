// app/api/slack/route.js

import { WebClient } from '@slack/web-api';
import OpenAI from 'openai';

const slackToken = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(slackToken);
import promptV1 from '@/lib/prompts/v1-slack';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

// Define message type
type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Store conversation history
const conversationHistory = new Map<string, Message[]>();

// Add event deduplication cache
const processedEvents = new Set<string>();

// Helper function to generate a unique event ID
function getEventId(event: any): string {
  return `${event.channel}_${event.ts}_${event.user}`;
}

async function getThreadMessages(channelId: string, threadTs: string) {
  try {
    const result = await web.conversations.replies({
      channel: channelId,
      ts: threadTs, // The parent message's ts
    });
    return result.messages?.map(m => ({text: m.text, user: m.user})); // Array of messages in the thread
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return [];
  }
}

const myBotUserId = 'U08TN3R36HM';
const mentionString = `<@${myBotUserId}>`;

export async function POST(req: Request) {
  const body = await req.json();

  // Handle URL verification challenge
  if (body.type === 'url_verification') {
    return new Response(body.challenge, { status: 200 });
  }

  const payload = body;
  const { type, event } = payload;

  // Handle both direct mentions and thread replies
  if (type === 'event_callback' && (event.type === 'app_mention')) {
    
    console.log("event", event);
    // Skip if the message is from a bot or is a bot message
    if (event.subtype === 'bot_message' || event.bot_id) {
      return new Response('Ignoring bot message', { status: 200 });
    }

    // Check if we've already processed this event
    const eventId = getEventId(event);
    if (processedEvents.has(eventId)) {
      return new Response('Event already processed', { status: 200 });
    }

    // Add event to processed set
    processedEvents.add(eventId);

    // Clean up old events (keep last 1000 events)
    if (processedEvents.size > 1000) {
      const oldestEvents = Array.from(processedEvents).slice(0, processedEvents.size - 1000);
      oldestEvents.forEach(event => processedEvents.delete(event));
    }

    if(event.text && !event.text.includes(mentionString)){
      return new Response('Ignoring message', { status: 200 });
    }

    const channelId = event.channel;
    const threadTs = event.thread_ts || event.ts; // Use thread_ts if it exists, otherwise use the message ts
    

    try {
      const threadMessages = await getThreadMessages(channelId, threadTs);
      const historyMessages = threadMessages?.map(message => ({
        role: message.user === 'U08TN3R36HM' ? 'assistant' : 'user',
        content: message.text || ''
      }));

      // Get or initialize conversation history for this thread
      const messages =  [
        {
          role: 'system',
          content: promptV1,
        },
        ...historyMessages || []
      ];


      // Get AI response
      const response = await openai.chat.completions.create({
        model: 'gpt-4.1',
        // @ts-expect-error - OpenAI types are not updated
        messages,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';


      // Update conversation history
      // conversationHistory.set(threadTs, messages);
      console.log("conversationHistory", conversationHistory);
      // Send AI response back to Slack in the same thread
      await web.chat.postMessage({ 
        channel: channelId, 
        text: aiResponse,
        thread_ts: threadTs // This will reply in the thread
      });
      
      return new Response('Message sent', { status: 200 });
    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('Event not handled', { status: 200 });
}