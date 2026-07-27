import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Groq from "groq-sdk";
const InputSchema = z.object({
  recipient: z.string().optional().default(""),
  age: z.string().optional().default(""),
  relationship: z.string().optional().default(""),
  occasion: z.string().optional().default(""),
  budget: z.number().default(75),
  interests: z.string().optional().default(""),
  traits: z.array(z.string()).default([]),
  surprise: z.boolean().default(false),
  currencyCode: z.string().default("USD"),
  currencySymbol: z.string().default("$"),
  budgetLocal: z.number().default(75),
});

const GiftSchema = z.object({
  title: z.string(),
  emoji: z.string(),
  reason: z.string(),
  price: z.string(),
  match: z.number(),
});

const ResponseSchema = z.object({
  gifts: z.array(GiftSchema).min(3).max(5),
  card: z.string(),
  wrapping: z.array(z.string()).min(2).max(4),
  surprises: z.array(z.string()).min(2).max(3),
  bundle: z.object({
    name: z.string(),
    items: z.string(),
    total: z.string(),
  }),
  matchScore: z.number().min(0).max(100),
  matchLabel: z.string(),
});

export const generateGifts = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY not configured");
}

const groq = new Groq({
  apiKey,
});

    const relationship = data.relationship || "loved one";
    const occasion = data.occasion || "special occasion";
    const recipientName = data.recipient || "Unknown";

    const prompt = `
You are Giftora AI.

Generate exactly one JSON object.

Recipient: ${recipientName}
Age: ${data.age || "Unknown"}
Relationship: ${relationship}
Occasion: ${occasion}
Budget: ${data.currencySymbol}${data.budgetLocal} ${data.currencyCode}
Interests: ${data.interests || "Unknown"}
Traits: ${data.traits.join(", ") || "Unknown"}

${data.surprise ? "Surprise Mode Enabled." : ""}

Return ONLY JSON.

JSON format:
Return ONLY valid JSON.

Generate EXACTLY 3 gift ideas.

The "gifts" array MUST contain exactly 3 objects.

JSON format:

{
  "gifts":[
    {
      "title":"",
      "emoji":"",
      "reason":"",
      "price":"",
      "match":95
    },
    {
      "title":"",
      "emoji":"",
      "reason":"",
      "price":"",
      "match":90
    },
    {
      "title":"",
      "emoji":"",
      "reason":"",
      "price":"",
      "match":88
    }
  ],
  "card":"",
  "wrapping":["","",""],
  "surprises":["",""],
  "bundle":{
    "name":"",
    "items":"",
    "total":""
  },
  "matchScore":92,
  "matchLabel":"Excellent Match"
}
`;    const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  temperature: 0.8,
  response_format: {
    type: "json_object",
  },
  messages: [
    {
      role: "system",
      content: "Return ONLY valid JSON.",
    },
    {
      role: "user",
      content: prompt,
    },
  ],
});

const text = completion.choices[0].message.content;

if (!text) {
  throw new Error("No response from Groq.");
}

const parsedJson = JSON.parse(text);

const parsed = ResponseSchema.parse(parsedJson);

return parsed;
  });
