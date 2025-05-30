import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import promptV1 from "@/lib/prompts/v1-ui"
// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4.1"),
    system: promptV1,
    messages,
  })

  return result.toDataStreamResponse()
}
