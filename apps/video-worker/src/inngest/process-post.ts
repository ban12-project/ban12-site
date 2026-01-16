import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { GoogleGenAI } from "@google/genai";

import { sql } from "../db";
import { inngest } from "./client";

export default inngest.createFunction(
  { id: "video-process", concurrency: 3 },
  { event: "video/process" },
  async ({ event, step }) => {
    const { postId, restaurantId } = event.data;

    const post = await step.run(`1. Get post by postId: ${postId}`, async () => {
      const [post] = await sql<
        {
          postId: number;
          // biome-ignore lint/suspicious/noExplicitAny: unknown
          metadata: any;
          authorId: number;
          platform: string;
          platformId: string;
        }[]
      >`
        SELECT
          p.id as "postId",
          p.metadata,
          a.id as "authorId",
          a.platform,
          a."platformId"
        FROM posts p
        JOIN authors a ON p."authorId" = a.id
        WHERE p.id = ${postId}
      `;

      return post;
    });

    if (!post) {
      return { message: `Post with id ${postId} not found` };
    }

    await step.run(
      `2. Handle post by ${post.authorId}:${post.platform}:${post.platformId}->${restaurantId}`,
      async () => {
        switch (post.platform) {
          case "bilibili":
            return await bilibiliHandler({
              bvid: post.metadata.bvid,
              restaurantId: restaurantId,
            });
          default:
            console.warn(`Unhandled platform: ${post.platform}`);
        }
      },
    );
  },
);

async function bilibiliHandler({ bvid, restaurantId }: { bvid: string; restaurantId: string }) {
  // Fetch video URLs from Supabase function
  const response = await fetch(
    new URL(`/functions/v1/bilibili-get-video-urls/${bvid}`, process.env.SUPABASE_ENDPOINT),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      method: "GET",
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch video URLs for bvid ${bvid}: ${response.statusText}`);
  }
  const data = await response.json();
  const downloadUrl = data[0].url;

  // Download the video file to a temporary location
  const fileName = `${bvid}.mp4`;
  const filePath = `/tmp/${fileName}`;
  const fileResponse = await fetch(downloadUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to download video for bvid ${bvid}: ${fileResponse.statusText}`);
  }
  if (!fileResponse.body) {
    throw new Error(`No response body for video download of bvid ${bvid}`);
  }
  // biome-ignore lint/suspicious/noExplicitAny: nodejs ReadableStream
  await pipeline(Readable.fromWeb(fileResponse.body as any), createWriteStream(filePath));

  // Upload the video file to Google Gemini files
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  const myfile = await ai.files.upload({
    file: filePath,
    config: { mimeType: "video/mp4" },
  });
  if (!myfile.uri || !myfile.mimeType) {
    throw new Error("Upload failed: No URI or MIME type returned");
  }

  // send event to inngest for further processing
  await inngest.send({
    name: "video/understanding",
    data: {
      id: restaurantId,
      part: { uri: myfile.uri, mimeType: myfile.mimeType },
    },
  });

  // Clean up the temporary file
  await fs.unlink(filePath);

  return {
    success: true,
    message: `Video processing for restaurant ${restaurantId} completed successfully.`,
  };
}
