'use client'

import { useTransition } from 'react'
import { Button } from '@repo/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { cn } from '@repo/ui/lib/utils'
import { LoaderCircleIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { signIn } from 'next-auth/webauthn'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { status } = useSession()
  const [isPending, startTransition] = useTransition()

  const onSubmit: React.ReactEventHandler = (e) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    // const name = formData.get('name')
    const email = formData.get('email')

    startTransition(async () => {
      try {
        // if (status === 'authenticated') {
        //   await signIn('passkey', { action: 'register', name, email })
        // }

        // if (status === 'unauthenticated') {
        //   await signIn('passkey', { email })
        // }
        await signIn('passkey', { action: 'authenticate', email })
      } catch (error) {
        console.error(error)
      }
    })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  aria-disabled={status === 'loading' || isPending}
                  disabled={status === 'loading' || isPending}
                >
                  {status === 'authenticated'
                    ? 'Register new Passkey'
                    : status === 'unauthenticated'
                      ? 'Sign in with Passkey'
                      : 'Loading...'}
                  {isPending && (
                    <LoaderCircleIcon className="ml-auto h-5 w-5 animate-spin text-gray-50" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
