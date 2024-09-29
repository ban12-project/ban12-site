import { useState } from 'react'

export default function useClipboard() {
  const [clipText, setClipText] = useState('')

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {}
  }

  const read = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setClipText(text)
      return text
    } catch (error) {}
  }

  return {
    copy,
    clipText,
    read,
  }
}
