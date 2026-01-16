'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import * as z from 'zod';

import { signIn } from '#/lib/auth';
import {
  cfTurnstileResponseSchema,
  cfTurnstileVerify,
} from '#/lib/cloudflare-turnstile';
import {
  deleteAlbumById,
  deleteCollectionById,
  deleteShortcutByUuid,
  saveAlbum,
  saveCollection,
  updateAlbumById,
  updateCollectionById,
  updateShortcutByUuid,
} from '#/lib/db/queries';
import { answerTranslate } from '#/lib/prompt';
import { LocalizedHelper } from '#/lib/utils';

const authFormSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  ...cfTurnstileResponseSchema.shape,
});

export async function login(
  _prevState: string | undefined,
  formData: FormData,
) {
  try {
    const validatedFields = authFormSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      response: formData.get('cf-turnstile-response'),
    });

    if (!validatedFields.success) {
      return 'Failed to validate form data';
    }

    const { email, password, response } = validatedFields.data;

    const result = await cfTurnstileVerify(response);
    if (!result.success)
      return result['error-codes'].join(', ').replace(/-/g, ' ');

    await signIn('credentials', {
      email,
      password,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

const shortcutSchema = z.object({
  icloud: z
    .url()
    .startsWith(
      'https://www.icloud.com/shortcuts/',
      'must be start with https://www.icloud.com/shortcuts/',
    )
    .regex(/\/[0-9a-f]{32}\/?$/, 'iCloud url is broken'),
  name: LocalizedHelper.schema,
  description: LocalizedHelper.schema,
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
  uuid: z.string(),
  albumId: z.string().nullable(),
  collectionId: z.string().nullable(),
});

export async function updateShortcut(
  _prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = shortcutSchema.safeParse({
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
  });

  if (!validatedFields.success) {
    return 'Failed to validate form data';
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
  } = validatedFields.data;

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
      collectionId: collectionId ? Number.parseInt(collectionId, 10) : null,
      albumId: albumId ? Number.parseInt(albumId, 10) : null,
    });
  } catch {
    return 'Failed to insert data.';
  }

  revalidatePath('/dashboard');
  revalidatePath('/[lang]/(public)/(with-search)', 'page');
  revalidatePath(`/get/${uuid}`);
  updateTag('shortcut');
  redirect('/dashboard');
}

export async function deleteShortcut(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    return 'Parameters missing';
  }

  try {
    await deleteShortcutByUuid(id);
  } catch {
    return 'Failed to delete data.';
  }

  revalidatePath('/dashboard');
  revalidatePath('/[lang]/(public)/(with-search)', 'page');
  updateTag('shortcut');
  redirect('/dashboard');
}

const collectionCreateSchema = z.object({
  title: z.string().min(1),
  image: z.string().min(1),
  textColor: z.string().min(4),
});
export async function createCollection(
  _prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = collectionCreateSchema.safeParse({
    title: formData.get('title'),
    image: formData.get('image'),
    textColor: formData.get('textColor'),
  });

  if (!validatedFields.success) {
    return 'Failed to validate form data';
  }

  const { title, image, textColor } = validatedFields.data;
  const path = new URL(image, process.env.S3_DOMAIN).href;
  const translatedTitle = await answerTranslate(title);

  try {
    await saveCollection({
      title: translatedTitle,
      image: path,
      textColor,
    });
  } catch {
    return 'Failed to insert data.';
  }

  revalidatePath('/dashboard/collection');
  revalidatePath('/[lang]/(public)/(with-search)', 'page');
  updateTag('collection');
  redirect('/dashboard/collection');
}

export async function updateCollection(
  _prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = z
    .intersection(
      collectionCreateSchema.omit({ title: true }),
      z.object({
        title: LocalizedHelper.schema,
        id: z.string().min(0),
      }),
    )
    .safeParse({
      id: formData.get('id'),
      title: formData.get('title'),
      image: formData.get('image'),
      textColor: formData.get('textColor'),
    });

  if (!validatedFields.success) {
    return 'Failed to validate form data';
  }

  const { id, title, image, textColor } = validatedFields.data;
  const path = new URL(image, process.env.S3_DOMAIN).href;

  try {
    await updateCollectionById({
      id: Number.parseInt(id, 10),
      title,
      image: path,
      textColor,
    });
  } catch {
    return 'Failed to update data.';
  }

  revalidatePath('/dashboard/collection');
  revalidatePath(`/collection/${id}`);
  updateTag('collection');
  redirect('/dashboard/collection');
}

export async function deleteCollection(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    return 'Parameters missing';
  }

  try {
    await deleteCollectionById(Number.parseInt(id, 10));
  } catch {
    return 'Failed to delete data.';
  }

  revalidatePath('/dashboard/collection');
  revalidatePath('/[lang]/(public)/(with-search)', 'page');
  updateTag('collection');
  redirect('/dashboard/collection');
}

const albumAddSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  collectionId: z
    .string()
    .optional()
    .transform((val) => val || null),
});

export async function createAlbum(
  _prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = albumAddSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    collectionId: formData.get('collectionId'),
  });

  if (!validatedFields.success) {
    return 'Failed to validate form data';
  }

  const { title, description, collectionId } = validatedFields.data;
  const [translatedTitle, translatedDescription] = await Promise.all([
    answerTranslate(title as string),
    answerTranslate(description as string),
  ]);

  try {
    await saveAlbum({
      title: translatedTitle,
      description: translatedDescription,
      collectionId: collectionId ? Number.parseInt(collectionId, 10) : null,
    });
  } catch {
    return 'Failed to insert data.';
  }

  revalidatePath('/dashboard/album');
  revalidatePath('/[lang]/(public)/(with-search)', 'page');
  updateTag('album');
  redirect('/dashboard/album');
}

export async function updateAlbum(
  _prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = z
    .intersection(
      albumAddSchema.omit({ title: true, description: true }),
      z.object({
        title: LocalizedHelper.schema,
        description: LocalizedHelper.schema,
        id: z.string().min(0),
      }),
    )
    .safeParse({
      id: formData.get('id'),
      title: formData.get('title'),
      description: formData.get('description'),
      collectionId: formData.get('collectionId'),
    });

  if (!validatedFields.success) {
    return 'Failed to validate form data';
  }

  const { id, title, description, collectionId } = validatedFields.data;

  try {
    await updateAlbumById({
      id: Number.parseInt(id, 10),
      title,
      description,
      collectionId: collectionId ? Number.parseInt(collectionId, 10) : null,
    });
  } catch {
    return 'Failed to update data.';
  }

  revalidatePath('/dashboard/album');
  revalidatePath(`/album/${id}`);
  revalidatePath('/[lang]/(public)/(with-search)', 'page');
  updateTag('album');
  redirect('/dashboard/album');
}

export async function deleteAlbum(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    return 'Parameters missing';
  }

  try {
    await deleteAlbumById(Number.parseInt(id, 10));
  } catch {
    return 'Failed to delete data.';
  }

  revalidatePath('/dashboard/album');
  revalidatePath('/[lang]/(public)/(with-search)', 'page');
  updateTag('album');
  redirect('/dashboard/album');
}
