import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { answerAlbumId, answerTranslate } from "../../shortcuts/lib/prompt.ts";

const envNames = ["GOOGLE_GEMINI_KEY", "GOOGLE_GEMINI_MODEL"];
const originalEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
after(() => {
  for (const name of envNames) {
    if (originalEnv[name] === undefined) delete process.env[name];
    else process.env[name] = originalEnv[name];
  }
});
beforeEach(() => {
  process.env.GOOGLE_GEMINI_KEY = "synthetic-key";
  process.env.GOOGLE_GEMINI_MODEL = "gemini-2.5-flash";
});

function response(text: string) {
  return Response.json({
    candidates: [{ content: { role: "model", parts: [{ text }] }, finishReason: "STOP" }],
    usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1, totalTokenCount: 2 },
  });
}

test("shortcut classification uses its configured Gemini model and API key", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.match(String(url), /models\/gemini-2\.5-flash:generateContent$/);
    assert.equal(new Headers(options?.headers).get("x-goog-api-key"), "synthetic-key");
    const request = JSON.parse(String(options?.body));
    assert.match(request.contents[0].parts[0].text, /fixture shortcut/);
    return response("2");
  });
  assert.equal(await answerAlbumId("fixture shortcut", "1: tools, 2: media", 9), 2);
});

test("invalid classification preserves the caller's fallback album", async (t) => {
  t.mock.method(globalThis, "fetch", async () => response("unclassifiable"));
  assert.equal(await answerAlbumId("fixture", "1: tools", 9), 9);
});

test("translation preserves the supported locale map", async (t) => {
  const translations = { en: "cancel", "zh-CN": "取消", ja: "キャンセル", sv: "Avbryt", ar: "إلغاء" };
  t.mock.method(globalThis, "fetch", async () => response(`\`\`\`json\n${JSON.stringify(translations)}\n\`\`\``));
  assert.deepEqual(await answerTranslate("Cancel"), translations);
});

for (const providerFailure of [false, true]) {
  test(`translation returns the original text in all locales on failure (provider=${providerFailure})`, async (t) => {
    t.mock.method(globalThis, "fetch", async () =>
      providerFailure
        ? Response.json(
            { error: { code: 400, message: "Synthetic failure", status: "INVALID_ARGUMENT" } },
            { status: 400 },
          )
        : response("invalid JSON"),
    );
    assert.deepEqual(await answerTranslate("fixture"), {
      en: "fixture",
      "zh-CN": "fixture",
      ja: "fixture",
      sv: "fixture",
      ar: "fixture",
    });
  });
}

test("missing Gemini configuration keeps fallbacks without a request", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected external request");
  });
  delete process.env.GOOGLE_GEMINI_KEY;
  assert.equal(await answerAlbumId("fixture", "1: tools", 9), 9);
  assert.equal((await answerTranslate("fixture")).en, "fixture");
  assert.equal(fetch.mock.calls.length, 0);
});
