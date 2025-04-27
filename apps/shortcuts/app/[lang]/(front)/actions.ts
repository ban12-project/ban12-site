'use server'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import {
  cfTurnstileResponseSchema,
  cfTurnstileVerify,
} from '#/lib/cloudflare-turnstile'
import {
  getAlbums,
  getShortcutByAlbumId,
  getShortcutByUuid,
  saveShortcut,
  searchShortcutsByQuery,
} from '#/lib/db/queries'
import { answerAlbumId, answerTranslate } from '#/lib/prompt'
import type { ShortcutRecord } from '#/lib/shortcut'

const icloudSchema = z.object({
  icloud: z
    .string()
    .url()
    .startsWith(
      'https://www.icloud.com/shortcuts/',
      'must be start with https://www.icloud.com/shortcuts/',
    )
    .regex(/\/[0-9a-f]{32}\/?$/, 'iCloud url is broken'),
})

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    icloud?: string[]
    name?: string[]
    description?: string[]
    icon?: string[]
    backgroundColor?: string[]
    details?: string[]
    language?: string[]
  }
  message?: string | null
}

export async function getShortcutByiCloud(
  prevState: State,
  formData: FormData,
) {
  const validatedFields = icloudSchema.safeParse({
    icloud: formData.get('icloud'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data.',
    }
  }

  const uuid = new URL(validatedFields.data.icloud).pathname.split('/').pop()

  if (!uuid) {
    return {
      message: 'Failed to get uuid.',
    }
  }

  try {
    const shortcut = await getShortcutByUuid(uuid)
    if (shortcut) {
      return {
        message: 'Shortcut already exists.',
      }
    }
  } catch {
    return {
      message: 'Failed to query shortcut.',
    }
  }

  const res = await fetch(
    `https://www.icloud.com/shortcuts/api/records/${uuid}`,
  )

  if (!res.ok) {
    return {
      message: 'Failed to get shortcut from iCloud.',
    }
  }

  const data = (await res.json()) as ShortcutRecord

  return {
    data,
  }
}

const shortcutSchema = z.object({
  name: z.string(),
  description: z.string(),
  icon: z
    .string()
    .nullable()
    .transform((val) => (val === null ? '' : val)),
  backgroundColor: z.string(),
  details: z
    .array(
      z.enum([
        'SHARE_SHEET',
        'APPLE_WATCH',
        'MENU_BAR_ON_MAC',
        'QUICK_ACTIONS_ON_MAC',
        'RECEIVES_SCREEN',
      ]),
    )
    .transform((val) => val.join(','))
    .nullable(),
  language: z.enum(['zh-CN', 'en']),
})
const formSchema = icloudSchema
  .merge(shortcutSchema)
  .merge(cfTurnstileResponseSchema)

export async function postShortcut(prevState: State, formData: FormData) {
  if (formData.get('name') === null)
    return getShortcutByiCloud(prevState, formData)

  const validatedFields = formSchema.safeParse({
    icloud: formData.get('icloud'),
    name: formData.get('name'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    backgroundColor: formData.get('backgroundColor'),
    details: formData.getAll('details'),
    language: formData.get('language'),
    response: formData.get('cf-turnstile-response'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data',
    }
  }

  const {
    icloud,
    name,
    description,
    icon,
    backgroundColor,
    details,
    language,
    response,
  } = validatedFields.data

  const result = await cfTurnstileVerify(response)
  if (!result.success)
    return {
      message: result['error-codes'].join(', ').replace(/-/g, ' '),
    }

  const uuid = new URL(icloud).pathname.split('/').pop()
  if (!uuid) {
    return {
      message: 'Failed to get uuid',
    }
  }

  const albums = await getAlbums()

  const [albumId, translatedName, translatedDescription] = await Promise.all([
    answerAlbumId(
      `"${name}, ${description}"`,
      albums
        .map((item) => `${item.id}: ${item.title} ${item.description}`)
        .join('\n'),
    ),
    answerTranslate(name),
    answerTranslate(description),
  ])

  try {
    await saveShortcut({
      uuid,
      icloud,
      name: translatedName,
      description: translatedDescription,
      icon,
      backgroundColor,
      details,
      language,
      collectionId: null,
      albumId,
    })
  } catch {
    return {
      message: 'Failed to save shortcut.',
    }
  }

  revalidatePath('/[lang]/(front)/(with-search)', 'page')
  revalidatePath(`/get/${uuid}`)
  redirect('/')
}

export const fetchShortcutsByAlbumID = cache(
  async (albumId: number, pageSize: number, currentPage: number) => {
    try {
      const shortcuts = await getShortcutByAlbumId(
        albumId,
        pageSize,
        currentPage,
      )

      return shortcuts
    } catch (error) {
      console.error('Failed to get shortcuts from database')
      throw error
    }
  },
)

const searchSchema = z.object({
  query: z.string().min(1).max(64),
})

export async function searchShortcuts(query: string) {
  const validatedFields = searchSchema.safeParse({
    query,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data.',
    }
  }

  try {
    const shortcuts = await searchShortcutsByQuery(validatedFields.data.query)

    return shortcuts
  } catch {
    return {
      message: 'Failed to search shortcuts.',
    }
  }
}
