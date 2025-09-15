"use server";
import "server-only";
import { paraphraseOnce, scenarioIntro, TurnForAI } from "@/lib/ai";

type Turn = { role: "ai" | "user"; text: string };

export async function coach(turns: Turn[]) {
  const mapped: TurnForAI[] = turns.map((t) => ({
    role: t.role === "ai" ? "assistant" : "user",
    text: t.text,
  }));
  const text = await paraphraseOnce(mapped);
  return { text };
}

export async function getScenarioIntro(preset: string) {
  const text = await scenarioIntro(preset);
  return { text };
}
