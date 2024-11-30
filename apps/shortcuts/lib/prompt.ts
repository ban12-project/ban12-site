import { GoogleGenerativeAI } from '@google/generative-ai'

import type { LocalizedString } from './db/schema'
import { LocalizedHelper } from './utils'

export async function answerAlbumId(
  source: string,
  options: string,
  albumId = 1,
) {
  try {
    if (!process.env.GOOGLE_GEMINI_KEY || !process.env.GOOGLE_GEMINI_MODEL)
      throw new Error('Google Gemini API key or model not set')

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY)
    const model = genAI.getGenerativeModel({
      model: process.env.GOOGLE_GEMINI_MODEL,
    })
    const prompt = `
      Which of the following options describes "${source}" Answer with numbers:
      Options:
      ${options}
      The answer is:
    `
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const id = Number.parseInt(text)
    if (Number.isNaN(id)) throw new Error('Failed to get album id')
    return id
  } catch {
    return albumId
  }
}

export async function answerTranslate(input: string): Promise<LocalizedString> {
  try {
    if (!input) throw new Error('Input is empty')
    if (!process.env.GOOGLE_GEMINI_KEY || !process.env.GOOGLE_GEMINI_MODEL)
      throw new Error('Google Gemini API key or model not set')

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY)
    const model = genAI.getGenerativeModel({
      model: process.env.GOOGLE_GEMINI_MODEL,
    })

    const prompt = `
        Objective: Automatically detect the language of user input and translate it into several other languages.
        Languages: ${LocalizedHelper.locales.join(', ')}
  
        Example:
        input: Cancel
        output: { "zh-CN": "取消", "en": "cancel", "ja": "キャンセル", "sv": "Avbryt", "ar": "إلغاء" }
  
        input: ${input}
        output:
      `
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return JSON.parse(text.replace(/```json|\n|```/g, ''))
  } catch {
    return LocalizedHelper.locales.reduce(
      (result, locale) => ({ ...result, [locale]: input }),
      {} as LocalizedString,
    )
  }
}
