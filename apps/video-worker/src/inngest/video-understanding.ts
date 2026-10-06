import { createGoogle } from "@ai-sdk/google";
import { generateText, NoObjectGeneratedError, NoOutputGeneratedError, Output } from "ai";
import { z } from "zod";

import { sql } from "../db";
import { inngest } from "./client";
import { triggerRevalidation, videoUnderstanding } from "./types";

const restaurantSchema = z.object({
  restaurantName: z.string(),
  restaurantAddress: z.string(),
  rating: z.number(),
  price: z.string(),
  waitingTime: z.string(),
  dishes: z.string(),
  service: z.string(),
  precautions: z.array(z.string()),
});

export default inngest.createFunction(
  {
    id: "video-understanding",
    concurrency: 5,
    triggers: [videoUnderstanding],
  },
  async ({ event, step }) => {
    const { id, fileUri, part } = event.data;

    const validPart = part != null && typeof part.uri === "string" && typeof part.mimeType === "string";
    const uri = validPart ? part.uri : fileUri;
    if (!uri || !id) {
      return { message: `Invalid input: ${JSON.stringify(event.data)}` };
    }

    const aiSummary = await step.run("1. Generate structured restaurant summary", async () => {
      if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_GEMINI_MODEL) {
        throw new Error("Google Gemini API key or model not set");
      }

      const google = createGoogle({ apiKey: process.env.GOOGLE_API_KEY });
      try {
        const { output } = await generateText({
          model: google(process.env.GOOGLE_GEMINI_MODEL),
          output: Output.object({ schema: restaurantSchema }),
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "file",
                  data: new URL(uri),
                  mediaType: validPart ? part.mimeType : "video/mp4",
                },
                {
                  type: "text",
                  text: "Based on the video description, provide the restaurant's name and restaurant's address, give a recommendation rating (out of five points) in terms of price, waiting time, dishes, and service, and offer precautions for diners visiting this place, with all fields in Chinese.",
                },
              ],
            },
          ],
        });
        return output;
      } catch (error) {
        if (!NoObjectGeneratedError.isInstance(error) && !NoOutputGeneratedError.isInstance(error)) throw error;
        return null;
      }
    });

    if (!aiSummary) {
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
      return { message: "Invalid or empty response output" };
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
