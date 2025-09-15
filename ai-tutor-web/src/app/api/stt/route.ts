import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("audio") as File | null;
    if (!file) {
      return NextResponse.json({ error: "no audio" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({ text: transcription.text || "" });
  } catch (e) {
    console.error("STT error:", e);
    return NextResponse.json({ error: "stt_failed" }, { status: 500 });
  }
}
