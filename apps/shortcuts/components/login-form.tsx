'use client';

import { Button } from '@repo/ui/components/button';
import { Loader2 } from 'lucide-react';
import { type FormEventHandler, useActionState, useTransition } from 'react';

import { login } from '#/app/[lang]/(auth)/actions';
import { authClient } from '#/lib/auth-client';

import CloudflareTurnstile from './cloudflare-turnstile';

export default function LoginForm() {
  const [errorMessage, dispatch, pending] = useActionState(login, undefined);
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [isPending, startTransition] = useTransition();

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');

    startTransition(async () => {
      try {
        if (session) {
          await authClient.passkey.addPasskey({
            name: typeof name === 'string' ? name : undefined,
          });
          return;
        }

        await authClient.signIn.passkey();
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <div className="space-y-3 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
      <form action={dispatch} className="space-y-4">
        <h1 className="text-2xl">Please log in to continue.</h1>
        <div>
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 px-5 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>
        <div>
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 px-5 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>
        </div>

        <CloudflareTurnstile />

        <Button className="w-full" aria-disabled={pending} disabled={pending}>
          Log in
          {pending && (
            <Loader2 className="ml-auto h-5 w-5 animate-spin text-gray-50" />
          )}
        </Button>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      </form>

      <form onSubmit={onSubmit} className="space-y-4">
        {session && (
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="name"
            >
              Name
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 px-5 py-[9px] text-sm outline-2 placeholder:text-gray-500"
                id="name"
                type="name"
                name="name"
                placeholder="Enter your name"
                required
                autoComplete="name webauthn"
              />
            </div>
          </div>
        )}
        <div>
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 px-5 py-[9px] text-sm outline-2 placeholder:text-gray-500"
              id="email-passkey"
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
              autoComplete="email webauthn"
            />
          </div>
        </div>

        <Button
          className="w-full"
          aria-disabled={isSessionPending || isPending}
          disabled={isSessionPending || isPending}
        >
          {session
            ? 'Register new Passkey'
            : !isSessionPending
              ? 'Sign in with Passkey'
              : 'Loading...'}
          {isPending && (
            <Loader2 className="ml-auto h-5 w-5 animate-spin text-gray-50" />
          )}
        </Button>
      </form>
    </div>
  );
}
