import { Link } from '@repo/i18n/client'

export default function DashboardPage() {
  return (
    <main className="flex flex-col gap-4">
      <Link href="/dashboard/authors">Authors</Link>
      <Link href="/dashboard/posts">Posts</Link>
      <Link href="/dashboard/restaurants">Restaurants</Link>
    </main>
  )
}
