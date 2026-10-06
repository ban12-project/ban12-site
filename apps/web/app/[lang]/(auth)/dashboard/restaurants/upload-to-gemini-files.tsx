import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { LoaderCircleIcon } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import type { SelectRestaurant } from '#/lib/db/schema';

import { startVideoUnderstanding } from '../../actions';

const formSchema = z.object({
  key: z.string().nonempty('API key is required'),
  file: z.instanceof(File),
});

export default function UploadToGeminiFiles({
  row,
  setOpen,
}: {
  row: SelectRestaurant;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const { key, file } = values;
      const toastId = toast.loading('Uploading video');
      try {
        await uploadToGeminiFiles(key, file);
        toast.success('Video processing started', { id: toastId });
        setOpen(false);
      } catch {
        toast.error('Upload or processing failed', { id: toastId });
      }
    });
  }

  const [pending, startTransition] = React.useTransition();

  const uploadToGeminiFiles = async (apiKey: string, file: File) => {
    const [{ createGoogle }, { uploadFile }] = await Promise.all([
      import('@ai-sdk/google'),
      import('ai'),
    ]);
    const google = createGoogle({ apiKey });
    const { providerReference, mediaType } = await uploadFile({
      api: google.files(),
      data: new Uint8Array(await file.arrayBuffer()),
      mediaType: file.type || 'video/mp4',
      providerOptions: { google: { displayName: file.name } },
    });
    const uri = providerReference.google;
    if (!uri || !mediaType) throw new Error('Upload failed');

    await startVideoUnderstanding({
      part: { uri, mimeType: mediaType },
      id: row.id,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Upload</DialogTitle>
          <DialogDescription>Upload video to Gemini Files</DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem className="my-2">
              <FormLabel>Gemini API Key</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Gemini API key" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field: { value, onChange, ...fieldProps } }) => {
            return (
              <FormItem className="my-2">
                <FormLabel>File</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    type="file"
                    onChange={(event) => onChange(event.target.files?.[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button
            disabled={pending}
            aria-disabled={pending}
            type="submit"
            variant="primary"
            className="sm:ml-auto"
          >
            Submit
            {pending && <LoaderCircleIcon className="animate-spin" />}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
