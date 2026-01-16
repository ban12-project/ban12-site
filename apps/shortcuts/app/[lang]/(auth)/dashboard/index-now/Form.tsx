'use client';

import { Button } from '@repo/ui/components/button';
import { useActionState } from 'react';

type Props = {
  urls: string[];
  submit: (
    prevState: string | undefined,
    formData: FormData,
  ) => Promise<string | undefined>;
};

export default function Form({ submit, urls }: Props) {
  const [errorMessage, dispatch, pending] = useActionState(submit, undefined);

  return (
    <form action={dispatch}>
      <textarea
        name="urls"
        className="h-64 w-full resize"
        defaultValue={urls.join('\n')}
      />
      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </div>

      <Button type="submit" disabled={pending}>
        Submit
      </Button>
    </form>
  );
}
