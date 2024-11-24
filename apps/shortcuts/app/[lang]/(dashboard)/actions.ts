'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { z } from 'zod'

import { signIn } from '#/lib/auth'
import {
  deleteAlbumById,
  deleteCollectionById,
  deleteShortcutByUuid,
  saveAlbum,
  saveCollection,
  updateAlbumById,
  updateCollectionById,
  updateShortcutByUuid,
} from '#/lib/db/queries'

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(prevState: string | undefined, formData: FormData) {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
    })
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
  z.object({
    icloud: z
      .string()
      .url()
      .startsWith(
        'https://www.icloud.com/shortcuts/',
        'must be start with https://www.icloud.com/shortcuts/',
      )
      .regex(/\/[0-9a-f]{32}\/?$/, 'iCloud url is broken'),
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
  }),
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

  try {
    await updateShortcutByUuid({
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
    })
  } catch {
    return 'Failed to insert data.'
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function deleteShortcut(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) {
    return 'Parameters missing'
  }

  try {
    await deleteShortcutByUuid(id)
  } catch {
    return 'Failed to delete data.'
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

const collectionSchema = z.object({
  title: z.string().min(1),
  image: z.string().min(1),
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
  const path = new URL(image, process.env.S3_DOMAIN).href

  try {
    await saveCollection({
      title,
      image: path,
      textColor,
    })
  } catch {
    return 'Failed to insert data.'
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
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
  const path = new URL(image, process.env.S3_DOMAIN).href

  try {
    await updateCollectionById({
      id: Number.parseInt(id),
      title,
      image: path,
      textColor,
    })
  } catch {
    return 'Failed to update data.'
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function deleteCollection(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) {
    return 'Parameters missing'
  }

  try {
    await deleteCollectionById(Number.parseInt(id))
  } catch {
    return 'Failed to delete data.'
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
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

  try {
    await saveAlbum({
      title,
      description,
      collectionId: collectionId ? Number.parseInt(collectionId) : null,
    })
  } catch {
    return 'Failed to insert data.'
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
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

  try {
    await updateAlbumById({
      id: Number.parseInt(id),
      title,
      description,
      collectionId: collectionId ? Number.parseInt(collectionId) : null,
    })
  } catch {
    return 'Failed to update data.'
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function deleteAlbum(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) {
    return 'Parameters missing'
  }

  try {
    await deleteAlbumById(Number.parseInt(id))
  } catch {
    return 'Failed to delete data.'
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
