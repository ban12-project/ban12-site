'use client'

import { useFormState, useFormStatus } from 'react-dom'

import { notification } from '#/lib/actions'

type Props = {
  id: number
}

export default function Trigger({ id }: Props) {
  const [errorMessage, dispatch] = useFormState(notification, undefined)

  return (
    <form action={dispatch}>
      <input type="hidden" name="id" value={id} />
      <input type="text" name="title" defaultValue="Hello Web Push" />
      <input
        type="text"
        name="body"
        defaultValue="Your web push notification is here!"
      />
      <SubmitButton />

      {errorMessage && <p>{errorMessage}</p>}
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      Send
    </button>
  )
}
