'use server'

import 'server-only'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { signIn } from '#/auth'
import { AuthError } from 'next-auth'
import { z } from 'zod'

import prisma from './prisma'
import type { ShortcutRecord } from './shortcut'

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

  const exists = await prisma.shortcut.findUnique({
    where: { uuid },
  })

  if (exists) {
    return {
      message: 'Shortcut already exists.',
    }
  }

  const res = await fetch(
    `https://www.icloud.com/shortcuts/api/records/${uuid}`,
  )

  if (!res.ok) {
    return {
      message: 'Failed to fetch data.',
    }
  }

  const data: ShortcutRecord = await res.json()

  return {
    data,
  }
}

const shortcutSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
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
const formSchema = z.intersection(icloudSchema, shortcutSchema)

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
  } = validatedFields.data
  const uuid = new URL(icloud).pathname.split('/').pop()

  if (!uuid) {
    return {
      message: 'Failed to get uuid',
    }
  }

  let albumId: number = NaN
  try {
    if (!process.env.GOOGLE_GEMINI_KEY || !process.env.GOOGLE_GEMINI_MODEL)
      throw new Error('Google Gemini API key or model not set')

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY)
    const model = genAI.getGenerativeModel({
      model: process.env.GOOGLE_GEMINI_MODEL,
    })
    const albums = await prisma.album.findMany()
    const prompt = `Which of the following options describes "${name}, ${description}" Answer with numbers:
        Options:
        ${albums
          .map((item) => `${item.id}: ${item.title} ${item.description}`)
          .join('\n')}
        The answer is:
      `
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    albumId = Number.parseInt(text)
  } catch (e) {}

  const result = await prisma.shortcut.create({
    data: {
      updatedAt: new Date(),
      uuid,
      icloud,
      name,
      description,
      icon,
      backgroundColor,
      details,
      language,
      collectionId: null,
      albumId: albumId || null,
    },
  })

  if (!result) {
    return {
      message: 'Failed to insert data.',
    }
  }

  revalidatePath('/')
  redirect('/')
}

export const fetchAlbums = cache(async () => {
  const albums = await prisma.album.findMany({
    include: {
      shortcuts: true,
    },
  })

  return albums
})

export const fetchCollections = cache(async () => {
  const collections = await prisma.collection.findMany()

  return collections
})

export const fetchShortcutByID = cache(async (uuid: string) => {
  const shortcut = await prisma.shortcut.findUnique({
    where: { uuid },
  })

  return shortcut
})

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

  const shortcuts = await prisma.shortcut.findMany({
    where: {
      OR: [
        {
          name: {
            contains: validatedFields.data.query,
          },
        },
        {
          description: {
            contains: validatedFields.data.query,
          },
        },
      ],
    },
  })

  return shortcuts
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.'
        default:
          return 'Something went wrong.'
      }
    }
    throw error
  }
}

const updateSchema = z.intersection(
  formSchema,
  z.object({
    uuid: z.string(),
    albumId: z.string().nullable(),
    collectionId: z.string().nullable(),
  }),
)

export async function updateShortcut(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = updateSchema.safeParse({
    uuid: formData.get('uuid'),
    albumId: formData.get('albumId'),
    collectionId: formData.get('collectionId'),
    icloud: formData.get('icloud'),
    name: formData.get('name'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    backgroundColor: formData.get('backgroundColor'),
    details: [],
    language: formData.get('language'),
  })

  if (!validatedFields.success) {
    return 'Failed to validate form data'
  }

  const {
    uuid,
    albumId,
    collectionId,
    icloud,
    name,
    description,
    icon,
    backgroundColor,
    details,
    language,
  } = validatedFields.data

  const result = await prisma.shortcut.update({
    where: { uuid },
    data: {
      updatedAt: new Date(),
      uuid,
      icloud,
      name,
      description,
      icon,
      backgroundColor,
      details,
      language,
      collectionId: collectionId ? Number.parseInt(collectionId) : null,
      albumId: albumId ? Number.parseInt(albumId) : null,
    },
  })

  if (!result) {
    return 'Failed to insert data.'
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function deleteShortcut(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) {
    return 'Parameters missing'
  }

  await prisma.shortcut.delete({
    where: { uuid: id },
  })

  revalidatePath('/admin')
  redirect('/admin')
}

export const uploadFileToSupabaseStorage = async (file: File) => {
  const formData = new FormData()
  formData.append(file.name, file)
  const result = await fetch(
    new URL(
      '/functions/v1/file-upload-storage',
      process.env.SUPABASE_EDGE_FUNCTIONS_URL,
    ),
    {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
    },
  )

  if (!result.ok) {
    throw new Error('Failed to upload file')
  }

  const { path } = await result.json()
  return path as string
}

const collectionSchema = z.object({
  title: z.string().min(1),
  // image: z.string().min(1),
  image: z.instanceof(File).superRefine((val, ctx) => {
    // 10MB limit
    const MB_BYTES = 1024 * 1024
    if (val.size > 10 * MB_BYTES) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        type: 'array',
        message: `The file must not be larger than ${10 * MB_BYTES} bytes: ${
          val.size
        }`,
        maximum: 10 * MB_BYTES,
        inclusive: true,
      })
    }
  }),
  textColor: z.string().min(4),
})
export async function createCollection(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = collectionSchema.safeParse({
    title: formData.get('title'),
    image: formData.get('image'),
    textColor: formData.get('textColor'),
  })

  if (!validatedFields.success) {
    return 'Failed to validate form data'
  }

  const { title, image, textColor } = validatedFields.data

  const path = await uploadFileToSupabaseStorage(image)

  const result = await prisma.collection.create({
    data: {
      updatedAt: new Date(),
      title,
      image: path,
      textColor,
    },
  })

  if (!result) {
    return 'Failed to insert data.'
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function updateCollection(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = z
    .intersection(
      collectionSchema,
      z.object({
        id: z.string().min(0),
      }),
    )
    .safeParse({
      id: formData.get('id'),
      title: formData.get('title'),
      image: formData.get('image'),
      textColor: formData.get('textColor'),
    })

  if (!validatedFields.success) {
    return 'Failed to validate form data'
  }

  const { id, title, image, textColor } = validatedFields.data

  const path = await uploadFileToSupabaseStorage(image)

  const result = await prisma.collection.update({
    where: { id: Number.parseInt(id) },
    data: {
      updatedAt: new Date(),
      title,
      image: path,
      textColor,
    },
  })

  if (!result) {
    return 'Failed to update data.'
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function deleteCollection(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) {
    return 'Parameters missing'
  }

  await prisma.collection.delete({
    where: { id: Number.parseInt(id) },
  })

  revalidatePath('/admin')
  redirect('/admin')
}

const albumSheetSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  collectionId: z
    .string()
    .optional()
    .transform((val) => val || null),
})

export async function createAlbum(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = albumSheetSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    collectionId: formData.get('collectionId'),
  })

  if (!validatedFields.success) {
    return 'Failed to validate form data'
  }

  const { title, description, collectionId } = validatedFields.data

  const result = await prisma.album.create({
    data: {
      updatedAt: new Date(),
      title,
      description,
      collectionId: collectionId ? Number.parseInt(collectionId) : null,
    },
  })

  if (!result) {
    return 'Failed to insert data.'
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function updateAlbum(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = z
    .intersection(
      albumSheetSchema,
      z.object({
        id: z.string().min(0),
      }),
    )
    .safeParse({
      id: formData.get('id'),
      title: formData.get('title'),
      description: formData.get('description'),
      collectionId: formData.get('collectionId'),
    })

  if (!validatedFields.success) {
    return 'Failed to validate form data'
  }

  const { id, title, description, collectionId } = validatedFields.data

  const result = await prisma.album.update({
    where: { id: Number.parseInt(id) },
    data: {
      updatedAt: new Date(),
      title,
      description,
      collectionId: collectionId ? Number.parseInt(collectionId) : null,
    },
  })

  if (!result) {
    return 'Failed to update data.'
  }

  revalidatePath('/admin')
  redirect('/admin')
}

export async function deleteAlbum(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) {
    return 'Parameters missing'
  }

  await prisma.album.delete({
    where: { id: Number.parseInt(id) },
  })

  revalidatePath('/admin')
  redirect('/admin')
}

export async function getShortcuts() {
  const shortcuts = await prisma.shortcut.findMany()

  return shortcuts
}

export async function getCollections() {
  const collections = await prisma.collection.findMany()

  return collections
}

export async function getAlbums() {
  const albums = await prisma.album.findMany()

  return albums
}
