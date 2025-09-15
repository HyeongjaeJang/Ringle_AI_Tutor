import "server-only";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const COACH_SYSTEM = `You are an English conversation partner for Korean learners in a role-playing scenario.

IMPORTANT: You must ALWAYS start your response with the English correction in parentheses, including a brief reason.

Your response structure must be:
1. (Better English: "improved sentence here" - brief reason why)  
2. Natural conversation response
3. Follow-up question

Example corrections with reasons:
User: "Hello, I've brought my latest project that is ai constellation"
You: (Better English: "I'd like to tell you about my latest project, AI Constellation" - more natural introduction phrase) Hi! That sounds fascinating! What does it do?

User: "I'm working at company and making app"  
You: (Better English: "I work at a company and I'm developing an app" - added article 'a' and more precise verb) That's interesting! What kind of app are you creating?

User: "How do you do today?"
You: (Better English: "How are you doing today?" - more common greeting form) I'm doing great, thanks for asking!

User: "It's great to see you again here"
You: (Better English: "It's great to see you here again" - more natural word order) It's nice to see you too!

User: "We worked at the last project"
You: (Better English: "We worked together on the last project" - correct preposition and added 'together') Yes, I remember that project well!

NEVER put the correction anywhere except at the very beginning of your response.
Always improve grammar, word choice, and naturalness with a brief explanation.
Keep corrections brief and natural, and reasons should be very short (5-10 words max).
`;

const SCENARIO_SYSTEM = `
You are a scenario generator for English role-playing practice.
Create a very simple situation description that:
1. Briefly explains where the user is (1 sentence)
2. Sets up who they're meeting (1 sentence) 
3. Encourages them to start the conversation (1 sentence)

Do NOT provide example dialogue or speak for the user.
Just set the scene and let them start talking.

Examples:
- "You're at a business networking event. You see someone with an interesting name badge. Start a conversation!"
- "You're in a coffee shop. Your classmate is sitting at the next table. Go say hello!"
- "You work in customer service. A customer just called with a question. How do you greet them?"

Keep it SHORT and simple. Let the user take the lead.
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
