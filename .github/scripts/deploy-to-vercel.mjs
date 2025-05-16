import { exec } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execPromise = promisify(exec)

async function deployToVercel(url) {
  const rootPath = join(fileURLToPath(url))
  let paths = []

  try {
    const string = await readFile(
      new URL('../../.vercel/repo.json', import.meta.url),
      { encoding: 'utf-8' },
    )
    const repo = JSON.parse(string)
    const directories = repo.projects.map((item) => item.directory)

    paths = JSON.parse(process.env.PROJECTS).filter((path) => directories.includes(path))
  } catch (error) {
    console.error('Failed to parse PROJECTS as JSON:', error)
  }

  try {
    for (const path of paths) {
      const appPath = join(rootPath, path)

      console.log(`Deploying ${path} to Vercel...`)
      await execPromise(
        `vercel pull --yes --environment=production --token=${process.env.VERCEL_TOKEN}`,
        { cwd: appPath },
      )
      await execPromise(
        `vercel env pull --environment=production .env --token=${process.env.VERCEL_TOKEN}`,
        { cwd: appPath },
      )
      await execPromise(
        `vercel build --prod --token=${process.env.VERCEL_TOKEN}`,
        { cwd: appPath },
      )
      await execPromise(
        `vercel deploy --prebuilt --prod --token=${process.env.VERCEL_TOKEN}`,
        { cwd: appPath },
      )
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

deployToVercel(new URL('../../', import.meta.url))
