'use server'

import { GoogleGenAI } from '@google/genai'

export async function videoUnderstanding() {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_KEY })
  const response = await ai.models.generateContent({
    model: process.env.GOOGLE_GEMINI_MODEL!,
    contents: [
      {
        fileData: {
          fileUri: 'https://www.youtube.com/watch?v=lRrB7cOMvaM',
        },
      },
      '根据视频描述出餐馆地址，从价格、等待时间、菜品、服务等方面给出推荐指数，并给来此地的食客提供注意事项',
    ],
  })

  return response.text
}
