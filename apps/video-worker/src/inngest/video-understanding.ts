import { createPartFromUri, createUserContent, GoogleGenAI, Type } from "@google/genai";

import { sql } from "../db";
import { inngest } from "./client";
import { triggerRevalidation, videoUnderstanding } from "./types";

type JsonValue = null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

function extractJsonResponse(text: string) {
  const trimmed = text.trim();
  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedJson?.[1]) {
    return fencedJson[1].trim();
  }

  const firstObjectBrace = trimmed.indexOf("{");
  const lastObjectBrace = trimmed.lastIndexOf("}");
  if (firstObjectBrace !== -1 && lastObjectBrace > firstObjectBrace) {
    return trimmed.slice(firstObjectBrace, lastObjectBrace + 1);
  }

  return trimmed;
}

function parseJsonResponse(text: string): JsonValue {
  try {
    return JSON.parse(extractJsonResponse(text)) as JsonValue;
  } catch (cause) {
    throw new Error("Failed to parse Gemini JSON response", { cause });
  }
}

export default inngest.createFunction(
  {
    id: "video-understanding",
    concurrency: 5,
    triggers: [videoUnderstanding],
  },
  async ({ event, step }) => {
    const { id, fileUri, part } = event.data;

    const invalidPart = typeof part !== "object" || typeof part.uri !== "string" || typeof part.mimeType !== "string";
    if ((!fileUri && invalidPart) || !id) {
      return { message: `Invalid input: ${JSON.stringify(event.data)}` };
    }

    const text = await step.run("1. Call Gemini for video understanding", async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
      const response = await ai.models.generateContent({
        model: process.env.GOOGLE_GEMINI_MODEL!,
        contents: createUserContent([
          part
            ? createPartFromUri(part.uri, part.mimeType)
            : {
                fileData: {
                  fileUri,
                },
              },
          "Based on the video description, provide the restaurant's name and restaurant's address, give a recommendation rating (out of five points) in terms of price, waiting time, dishes, and service, and offer precautions for diners visiting this place, with all fields in Chinese.",
        ]),
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              restaurantName: {
                type: Type.STRING,
              },
              restaurantAddress: {
                type: Type.STRING,
              },
              rating: {
                type: Type.NUMBER,
              },
              price: {
                type: Type.STRING,
              },
              waitingTime: {
                type: Type.STRING,
              },
              dishes: {
                type: Type.STRING,
              },
              service: {
                type: Type.STRING,
              },
              precautions: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
            },
            propertyOrdering: [
              "restaurantName",
              "restaurantAddress",
              "rating",
              "price",
              "waitingTime",
              "dishes",
              "service",
              "precautions",
            ],
          },
        },
      });
      return response.text;
    });

    if (!text) {
      await step.run("2a. Update status to failed", async () => {
        await sql`
          UPDATE restaurant
          SET status = 'failed'
          WHERE id = ${id}
        `;
      });
      await step.run("2b. Trigger revalidation for failure", async () => {
        await inngest.send(triggerRevalidation.create({ id }));
      });
      return { message: "No response text" };
    }

    let aiSummary: JsonValue;
    try {
      aiSummary = parseJsonResponse(text);
    } catch (error) {
      console.error(error);
      await step.run("2a. Update status to failed", async () => {
        await sql`
          UPDATE restaurant
          SET status = 'failed'
          WHERE id = ${id}
        `;
      });
      await step.run("2b. Trigger revalidation for parse failure", async () => {
        await inngest.send(triggerRevalidation.create({ id }));
      });
      return { message: "Invalid JSON response" };
    }

    await step.run("2. Update database with AI summary and success status", async () => {
      await sql`
        UPDATE restaurant
        SET ai_summarize = ${sql.json(aiSummary)},
            status = 'success'
        WHERE id = ${id}
      `;
    });

    await step.run("3. Trigger revalidation for success", async () => {
      await inngest.send(triggerRevalidation.create({ id }));
    });

    return {
      success: true,
      message: `Successfully processed and revalidated video for id: ${id}`,
    };
  },
);
