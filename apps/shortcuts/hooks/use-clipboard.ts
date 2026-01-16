import { useState } from 'react';

export default function useClipboard() {
  const [clipText, setClipText] = useState('');

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // continue regardless of error
    }
  };

  const read = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipText(text);
      return text;
    } catch {
      // continue regardless of error
    }
  };

  return {
    copy,
    clipText,
    read,
  };
}
