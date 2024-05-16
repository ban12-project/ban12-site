import { useState } from 'react'
import { toast } from 'sonner'

export default function useClipboard() {
  const [clipText, setClipText] = useState('')

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast('Copied to clipboard', { icon: '📋' })
    } catch (error) {
      toast(error as string, { icon: '❌' })
    }
  }

  const read = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setClipText(text)
      return text
    } catch (error) {
      toast(error as string, { icon: '❌' })
    }
  }

  return {
    copy,
    clipText,
    read,
  }
}
