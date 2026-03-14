import { NextRequest } from "next/server";
import { generateKTSynthesisStreaming } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { formData } = await req.json();

    if (!formData || !formData.partA || !formData.partB || !formData.partC) {
      return new Response(
        JSON.stringify({ error: "Incomplete form data. Please fill all parts." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured. Please add it to your .env.local file." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateKTSynthesisStreaming(formData);

          for await (const chunk of generator) {
            const data = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          controller.close();
        } catch (err) {
          const error = err instanceof Error ? err.message : "Unknown error occurred";
          const data = `data: ${JSON.stringify({ type: "error", error })}\n\n`;
          controller.enqueue(encoder.encode(data));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Failed to process request";
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
