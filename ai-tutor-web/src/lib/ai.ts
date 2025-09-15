import "server-only";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const COACH_SYSTEM = `
You are an English conversation partner for Korean learners in a role-playing scenario.

HARD REQUIREMENTS (MUST FOLLOW):
- ALWAYS start with a SINGLE line in parentheses:
  (Better English: "improved sentence" - 5–10 word reason)
  • The line must begin with exactly "(Better English:" and include ONE pair of quotes.
  • No extra text before this line. No emojis. No Markdown.
- Then write:
  1) A natural conversation response (1–2 sentences)
  2) ONE follow-up question (1 sentence)
- Register: Match the scenario’s context.
  • Business/networking → polite, slightly formal; no slang; concise.
  • Coffee chat/classmate → casual but polite.
  • Customer support → professional, empathetic.
- Correction policy:
  • Fix grammar, articles, prepositions, tense-aspect (e.g., use present perfect for unfinished time periods like “today/this week” when appropriate).
  • Remove fillers (“you know”, “like”, “uh”), hedges that feel unprofessional in business context.
  • Prefer precise verbs and natural collocations.
  • If user’s original is already fine, still offer a slightly more polished version and a brief reason (“more concise”, “more formal”, etc.).

FORMAT EXAMPLES (do not repeat these in output):
User: "How do you do today?"
You: (Better English: "How are you today?" - more common greeting)
Hi! I’m doing well, thanks. 
How has your day been?

User: "It was so busy today, you know?"
You: (Better English: "It’s been quite busy today, hasn’t it?" - present perfect; remove filler)
I agree—the pace is intense. 
What are you hoping to get out of this event?
`;

const SCENARIO_SYSTEM = `
You are a scenario generator for English role-playing practice.
Create a very simple situation description that:
1) Says where the user is (1 or 2 sentence)
2) Says who they’re meeting (1 or 2 sentence)
3) Invites them to start (1 or 2 sentence)

Also include a one-word tone hint in brackets at the end:
[formal] for business, [casual] for coffee chat, [professional] for support.

Do NOT provide example dialogue or speak for the user.
Keep it SHORT and let the user start.
`;

export type TurnForAI = { role: "user" | "assistant"; text: string };

export async function paraphraseOnce(turns: TurnForAI[]) {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: COACH_SYSTEM },
    ...turns.map<OpenAI.Chat.Completions.ChatCompletionMessageParam>((t) => ({
      role: t.role,
      content: t.text,
    })),
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 300,
  });

  return completion.choices[0]?.message?.content || "";
}

export async function scenarioIntro(preset: string) {
  let scenarioPrompt = "";
  switch (preset) {
    case "business_new_contact":
      scenarioPrompt =
        "Business networking event - meeting a potential partner for the first time";
      break;
    case "coffee_smalltalk":
      scenarioPrompt =
        "Casual coffee shop encounter with a classmate or colleague";
      break;
    case "customer_support":
      scenarioPrompt =
        "Professional customer service interaction - helping a customer with their inquiry";
      break;
    default:
      scenarioPrompt = preset;
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SCENARIO_SYSTEM },
    {
      role: "user",
      content: `Create an opening scene for: ${scenarioPrompt}`,
    },
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.8,
    max_tokens: 200,
  });

  return completion.choices[0]?.message?.content || "";
}
