import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json()

    if (!userInput || userInput.trim().length === 0) {
      return Response.json({ error: "User input is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: `Analyze this user input and return: a mood label, a brief calming message, and a wellness suggestion (breathing exercise, music, or visual activity). 

Format your response as JSON with these exact keys:
- "mood": a single word or short phrase describing the emotional state
- "message": a brief, empathetic and calming message (2-3 sentences) - avoid therapy disclaimers or "I'm sorry" statements
- "suggestion": a specific wellness activity suggestion

Input: ${userInput}`,
      temperature: 0.7,
    })

    // Parse the response to extract structured data
    let parsedResponse
    try {
      parsedResponse = JSON.parse(text)
    } catch {
      // Fallback if GPT doesn't return valid JSON
      parsedResponse = {
        mood: "Reflective",
        message: "Let's take a moment to reset. Here's something that might help:",
        suggestion: "Try taking 5 deep breaths, inhaling for 4 counts and exhaling for 6 counts.",
      }
    }

    // Filter out therapy-style disclaimers and replace with neutral message
    const therapyPhrases = [
      "i'm really sorry",
      "i'm sorry that you're feeling",
      "it sounds like you're going through",
      "i understand this must be difficult",
      "i want you to know that",
      "please consider reaching out",
      "if you're having thoughts of",
    ]

    const messageText = parsedResponse.message?.toLowerCase() || ""
    const hasTherapyDisclaimer = therapyPhrases.some((phrase) => messageText.includes(phrase))

    if (hasTherapyDisclaimer) {
      parsedResponse.message = "Let's take a moment to reset. Here's something that might help:"
    }

    return Response.json(parsedResponse)
  } catch (error) {
    console.error("Error analyzing input:", error)
    return Response.json({ error: "Failed to analyze input" }, { status: 500 })
  }
}
