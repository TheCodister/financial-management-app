import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    messages: convertToModelMessages(messages),
    system:
      "You are a helpful financial assistant that helps users manage their personal finances effectively and provides insights based on their transaction data.",
  });

  return result.toUIMessageStreamResponse();
}
