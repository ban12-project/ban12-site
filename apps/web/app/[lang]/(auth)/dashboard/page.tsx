import { Suspense } from 'react'

import { getAuthors, getPosts, getRestaurants } from '#/lib/db/queries'
import { FollowUpChart } from '#/components/dashboard-chart'
import WorkerStatus from '#/components/dashboard-worker-status'

export default function DashboardPage() {
  return (
    <main className="grid gap-3">
      <WorkerStatus className="ml-auto" />

      <Suspense fallback={<div>Loading chart...</div>}>
        <SuspendedFollowUpChart />
      </Suspense>
    </main>
  )
}

async function SuspendedFollowUpChart() {
  const [authors, posts, restaurants] = await Promise.all([
    getAuthors(),
    getPosts(),
    getRestaurants(),
  ])

  return <FollowUpChart dataSource={{ authors, posts, restaurants }} />
}
