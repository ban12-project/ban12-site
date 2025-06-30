import LoginForm from '#/components/login-form'

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto max-w-[400px] p-4 md:-mt-32">
        <LoginForm />
      </div>
    </main>
  )
}
