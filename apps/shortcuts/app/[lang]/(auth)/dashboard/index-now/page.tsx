import { Suspense } from 'react'
import { connection } from 'next/server'

import { submitURLs } from '#/lib/index-now'
import sitemap from '#/app/sitemap'

import Form from './Form'

export default async function IndexNowPage() {
  return (
    <Suspense fallback="Loading">
      <Suspended />
    </Suspense>
  )
}

async function Suspended() {
  await connection()
  const sitemapUrls = await sitemap()

  const submit = async (prevState: string | undefined, formData: FormData) => {
    'use server'

    const urls = (formData.get('urls') as string).split(/\s/g)
    if (!urls.length) return 'No urls.'

    try {
      await submitURLs(urls)
    } catch {
      return 'Failed to submit urls.'
    }
  }

  return <Form urls={sitemapUrls.map(({ url }) => url)} submit={submit} />
}
