'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import * as z from 'zod';

import {
  insertAuthor,
  insertPostsToRestaurants,
  linkPostToNewRestaurantByPostId,
  updateInvisibleById,
  updateLocationById,
  updateStatusById,
  updateYoutubeLinkById,
} from '#/lib/db/queries';
import { inngest } from '#/lib/inngest/client';

export async function startVideoUnderstanding({
  fileUri,
  id,
  part,
}: {
  fileUri?: string;
  id: string;
  part?: {
    uri: string;
    mimeType: string;
  };
}) {
  await updateStatusById({ id, status: 'processing' });

  await inngest.send({
    name: 'video/understanding',
    data: {
      id,
      fileUri,
      part,
    },
  });

  revalidatePath('/[lang]/dashboard/restaurants', 'page');
  updateTag(`restaurant:${id}`);
}

export type State = {
  errors?: {
    [key: string]: string[] | undefined;
  };
  message?: string | null;
};

const updateYoutubeFormSchema = z.object({
  link: z.url().startsWith('https://www.youtube.com/watch?v='),
  id: z.string().nonempty(),
});

export async function updateYoutubeLink(_prevState: State, formData: FormData) {
  const validatedFields = updateYoutubeFormSchema.safeParse({
    link: formData.get('link'),
    id: formData.get('id'),
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: 'Failed to validate form data.',
    };
  }

  const { link, id } = validatedFields.data;

  try {
    await updateYoutubeLinkById({ link, id });
  } catch {
    return {
      message: 'Failed to update youtube link.',
    };
  }

  revalidatePath('/[lang]/dashboard/restaurants', 'page');

  return {
    message: 'success',
  };
}

const locationSchema = z.object({
  location: z.tuple([z.number(), z.number()]),
  id: z.string().nonempty(),
});

export async function updateLocation(_prevState: State, formData: FormData) {
  const lng = formData.get('location.0');
  const lat = formData.get('location.1');

  const validatedFields = locationSchema.safeParse({
    location: [lng ? Number(lng) : undefined, lat ? Number(lat) : undefined],
    id: formData.get('id'),
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: 'Failed to validate form data.',
    };
  }

  const { location, id } = validatedFields.data;

  try {
    await updateLocationById({ location, id });
  } catch {
    return {
      message: 'Failed to update youtube link.',
    };
  }

  revalidatePath('/[lang]/dashboard/restaurants', 'page');
  updateTag(`restaurant:${id}`);

  return {
    message: 'success',
  };
}

const InvisibleSchema = z.object({
  id: z.string().nonempty(),
  invisible: z.boolean(),
});

export async function updateInvisible(_prevState: State, formData: FormData) {
  const validatedFields = InvisibleSchema.safeParse({
    id: formData.get('id'),
    invisible: formData.get('invisible') === 'true',
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: 'Failed to validate form data.',
    };
  }

  const { invisible, id } = validatedFields.data;

  try {
    await updateInvisibleById({ invisible, id });
  } catch {
    return {
      message: 'Failed to update youtube link.',
    };
  }

  revalidatePath('/[lang]/dashboard/restaurants', 'page');
  updateTag(`restaurant:${id}`);

  return {
    message: 'success',
  };
}

const authorSchema = z.object({
  platform: z.enum(['bilibili']),
  platformId: z.string().nonempty(),
});

export async function addAuthor(_prevState: State, formData: FormData) {
  const validatedFields = authorSchema.safeParse({
    platform: formData.get('platform'),
    platformId: formData.get('platformId'),
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: 'Failed to validate form data.',
    };
  }

  const { platform, platformId } = validatedFields.data;

  try {
    await insertAuthor({ platform, platformId });
  } catch {
    return {
      message: 'Failed to add author.',
    };
  }

  revalidatePath('/[lang]/dashboard/authors', 'page');

  return {
    message: 'success',
  };
}

const linkSchema = z.object({
  postId: z.number(),
});

export async function linkPostToNewRestaurant(
  _prevState: State,
  formData: FormData,
) {
  const validatedFields = linkSchema.safeParse({
    postId: Number(formData.get('postId')),
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: 'Failed to validate form data.',
    };
  }

  const { postId } = validatedFields.data;

  try {
    const { id: restaurantId } = await linkPostToNewRestaurantByPostId({
      postId,
      data: {
        invisible: true,
      },
    });

    await inngest.send({
      name: 'video/process',
      data: {
        postId,
        restaurantId,
      },
    });
  } catch {
    return {
      message: 'Failed to link post to restaurant',
    };
  }

  revalidatePath('/[lang]/dashboard/restaurants', 'page');
  redirect('/dashboard/posts');
}

const linkRestaurantSchema = z.object({
  postId: z.number(),
  restaurantId: z.string().nonempty(),
});

export async function linkPostToRestaurant(
  _prevState: State,
  formData: FormData,
) {
  const validatedFields = linkRestaurantSchema.safeParse({
    postId: Number(formData.get('postId')),
    restaurantId: formData.get('restaurantId'),
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: 'Failed to validate form data.',
    };
  }

  const { postId, restaurantId } = validatedFields.data;

  try {
    await insertPostsToRestaurants({ postId, restaurantId });
  } catch {
    return {
      message: 'Failed to link post to restaurant',
    };
  }

  revalidatePath('/[lang]/dashboard/restaurants', 'page');

  return { message: 'success' };
}
