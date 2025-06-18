'use client'

import { writeTags } from '#/lib/maker-notes'

export default function Form() {
  const onChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const newFile = await writeTags(file)
    if (!newFile) return

    const url = URL.createObjectURL(newFile)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <form>
      <input type="file" onChange={onChange} />
    </form>
  )
}
