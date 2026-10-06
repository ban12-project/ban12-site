import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { after, beforeEach, mock, test } from "node:test";

// Exercise the real SDK and provider with synthetic HTTP responses. Only the
// database and event transport are replaced; no credentials or services are used.
const require = createRequire(import.meta.url);
const fileUri = "https://generativelanguage.googleapis.com/v1beta/files/pr50";
const summary = {
  restaurantName: "测试餐厅",
  restaurantAddress: "测试地址",
  rating: 4,
  price: "适中",
  waitingTime: "十分钟",
  dishes: "推荐",
  service: "友好",
  precautions: ["提前预约"],
};
let updates: { query: string; values: unknown[] }[] = [];
const post = {
  postId: 1,
  metadata: { bvid: `pr50-test-${process.pid}` },
  authorId: 1,
  platform: "bilibili",
  platformId: "fixture",
};
const sql = Object.assign(
  async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join("?");
    if (query.includes("SELECT")) return [post];
    updates.push({ query, values });
    return [];
  },
  { json: mock.fn((value: unknown) => ({ jsonValue: value })) },
);
const send = mock.fn(async () => undefined);
mock.module(new URL("../dist/db.js", import.meta.url), { defaultExport: { sql } });
mock.module(new URL("../dist/inngest/client.js", import.meta.url), {
  defaultExport: {
    inngest: {
      createFunction: (_options: unknown, handler: unknown) => handler,
      send,
    },
  },
});
const understand = require("../dist/inngest/video-understanding.js").default;
const processPost = require("../dist/inngest/process-post.js").default;
const step = {
  // Match Inngest's serialization between durable steps.
  run: async (_name: string, fn: () => Promise<unknown>) => {
    const result = await fn();
    return result === undefined ? null : JSON.parse(JSON.stringify(result));
  },
};
const envNames = ["GOOGLE_API_KEY", "GOOGLE_GEMINI_MODEL", "SUPABASE_ENDPOINT", "SUPABASE_ANON_KEY"];
const originalEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
after(() => {
  for (const name of envNames) {
    if (originalEnv[name] === undefined) delete process.env[name];
    else process.env[name] = originalEnv[name];
  }
  mock.restoreAll();
});
beforeEach(() => {
  updates = [];
  sql.json.mock.resetCalls();
  send.mock.resetCalls();
  send.mock.mockImplementation(async () => undefined);
  process.env.GOOGLE_API_KEY = "synthetic-key";
  process.env.GOOGLE_GEMINI_MODEL = "gemini-2.5-flash";
  process.env.SUPABASE_ENDPOINT = "https://video-source.invalid";
  process.env.SUPABASE_ANON_KEY = "synthetic-key";
});

function generationResponse(text: string, finishReason = "STOP") {
  return Response.json({
    candidates: [{ content: { role: "model", parts: text ? [{ text }] : [] }, finishReason }],
    usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1, totalTokenCount: 2 },
  });
}

for (const input of [{ part: { uri: fileUri, mimeType: "video/webm" } }, { fileUri }, { fileUri, part: null }]) {
  test(`video generation sends a file URI and stores a JSON object: ${JSON.stringify(input)}`, async (t) => {
    t.mock.method(globalThis, "fetch", async (url, options) => {
      assert.match(String(url), /models\/gemini-2\.5-flash:generateContent$/);
      const request = JSON.parse(String(options?.body));
      const video = request.contents[0].parts[0];
      assert.equal(video.fileData.fileUri, fileUri);
      assert.equal(video.fileData.mimeType, input.part?.mimeType ?? "video/mp4");
      assert.equal(video.inlineData, undefined);
      assert.equal(request.generationConfig.responseMimeType, "application/json");
      assert.equal(request.generationConfig.responseJsonSchema.type, "object");
      return generationResponse(JSON.stringify(summary));
    });
    const result = await understand({ event: { data: { id: "fixture", ...input } }, step });
    assert.equal(result.success, true);
    assert.deepEqual(sql.json.mock.calls[0].arguments, [summary]);
    assert.equal(updates.length, 1);
    assert.match(updates[0].query, /status = 'success'/);
    assert.deepEqual(updates[0].values[0], { jsonValue: summary });
    assert.equal(send.mock.calls[0].arguments[0].name, "web/revalidation.trigger");
    assert.deepEqual(send.mock.calls[0].arguments[0].data, { id: "fixture" });
  });
}

for (const response of [{ text: "invalid JSON" }, { text: "{}" }, { text: "", finishReason: "SAFETY" }]) {
  test(`invalid output marks the restaurant failed and revalidates: ${JSON.stringify(response)}`, async (t) => {
    t.mock.method(globalThis, "fetch", async () => generationResponse(response.text, response.finishReason));
    const result = await understand({ event: { data: { id: "fixture", fileUri } }, step });
    assert.match(result.message, /Invalid or empty/);
    assert.equal(updates.length, 1);
    assert.match(updates[0].query, /status = 'failed'/);
    assert.equal(sql.json.mock.calls.length, 0);
    assert.equal(send.mock.calls[0].arguments[0].name, "web/revalidation.trigger");
  });
}

test("provider errors propagate so Inngest can retry", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json(
      { error: { code: 400, message: "Synthetic provider failure", status: "INVALID_ARGUMENT" } },
      { status: 400 },
    ),
  );
  await assert.rejects(understand({ event: { data: { id: "fixture", fileUri } }, step }), /Synthetic provider failure/);
  assert.equal(updates.length, 0);
  assert.equal(send.mock.calls.length, 0);
});

test("missing input and missing configuration never call Google", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected external request");
  });
  for (const data of [{ id: "fixture" }, { id: "fixture", part: null }, { fileUri }]) {
    const result = await understand({ event: { data }, step });
    assert.match(result.message, /Invalid input/);
  }
  delete process.env.GOOGLE_API_KEY;
  await assert.rejects(understand({ event: { data: { id: "fixture", fileUri } }, step }), /API key or model not set/);
  assert.equal(fetch.mock.calls.length, 0);
});

for (const failUpload of [false, true]) {
  test(`video upload waits for processing and removes its temporary file (failure=${failUpload})`, async (t) => {
    let polled = false;
    const filePath = `/tmp/${post.metadata.bvid}.mp4`;
    t.mock.method(globalThis, "fetch", async (url, options) => {
      const address = String(url);
      if (address.includes("/functions/v1/bilibili/video-urls/")) {
        return Response.json([{ url: "https://video-source.invalid/video" }]);
      }
      if (address === "https://video-source.invalid/video") return new Response(new Uint8Array([0, 1, 2, 3]));
      if (address.endsWith("/upload/v1beta/files")) {
        assert.equal(existsSync(filePath), true);
        return new Response(null, { headers: { "x-goog-upload-url": "https://video-upload.invalid/upload" } });
      }
      if (address === "https://video-upload.invalid/upload") {
        assert.deepEqual(Array.from(options?.body as Uint8Array), [0, 1, 2, 3]);
        if (failUpload) return new Response("Synthetic upload failure", { status: 400 });
        return Response.json({
          file: { name: "files/pr50", uri: fileUri, mimeType: "video/mp4", state: "PROCESSING" },
        });
      }
      if (address === fileUri) {
        polled = true;
        return Response.json({ name: "files/pr50", uri: fileUri, mimeType: "video/mp4", state: "ACTIVE" });
      }
      throw new Error(`Unexpected external request: ${address}`);
    });
    send.mock.mockImplementation(async () => {
      assert.equal(polled, true, "analysis must start after Google marks the video ACTIVE");
    });
    const run = processPost({ event: { data: { postId: 1, restaurantId: "fixture" } }, step });
    if (failUpload) {
      await assert.rejects(run, /Synthetic upload failure/);
      assert.equal(send.mock.calls.length, 0);
    } else {
      await run;
      assert.equal(send.mock.calls[0].arguments[0].name, "video/understanding");
      assert.deepEqual(send.mock.calls[0].arguments[0].data.part, { uri: fileUri, mimeType: "video/mp4" });
    }
    assert.equal(existsSync(filePath), false);
  });
}
