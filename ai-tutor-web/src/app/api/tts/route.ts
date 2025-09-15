import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { text, voice = "alloy" } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const resp = await client.audio.speech.create({
      model: "tts-1",
      voice,
      input: text,
      response_format: "mp3",
    });

    const arrayBuf = await resp.arrayBuffer();
    return new NextResponse(Buffer.from(arrayBuf), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("TTS error:", e);
    return NextResponse.json({ error: "tts_failed" }, { status: 500 });
  }
}
