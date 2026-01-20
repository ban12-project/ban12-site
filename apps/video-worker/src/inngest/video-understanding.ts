import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

import { sql } from "../db";
import { inngest } from "./client";

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
  { id: "video-understanding", concurrency: 5 },
  { event: "video/understanding" },
  async ({ event, step }) => {
    const { id, fileUri, part } = event.data;

    const invalidPart = typeof part !== "object" || typeof part.uri !== "string" || typeof part.mimeType !== "string";
    if ((!fileUri && invalidPart) || !id) {
      return { message: `Invalid input: ${JSON.stringify(event.data)}` };
    }

    const result = await step.run("1. Call Gemini for video understanding", async () => {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
      });

      const uri = part ? part.uri : fileUri!;
      const mimeType = part ? part.mimeType : "video/mp4";

      const { output } = await generateText({
        model: google(process.env.GOOGLE_GEMINI_MODEL!),
        output: Output.object({ schema: restaurantSchema }),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "file",
                data: uri,
                mediaType: mimeType,
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
    });

    if (!result) {
      await step.run("2a. Update status to failed", async () => {
        await sql`
          UPDATE restaurant
          SET status = 'failed'
          WHERE id = ${id}
        `;
      });
      await step.run("2b. Trigger revalidation for failure", async () => {
        await inngest.send({
          name: "web/revalidation.trigger",
          data: { id },
        });
      });
      return { message: "No response output" };
    }

    await step.run("2. Update database with AI summary and success status", async () => {
      await sql`
          UPDATE restaurant
          SET ai_summarize = ${JSON.stringify(result)},
              status = 'success'
          WHERE id = ${id}
        `;
    });

    await step.run("3. Trigger revalidation for success", async () => {
      await inngest.send({
        name: "web/revalidation.trigger",
        data: { id },
      });
    });

    return {
      success: true,
      message: `Successfully processed and revalidated video for id: ${id}`,
    };
  },
);
