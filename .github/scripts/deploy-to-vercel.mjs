import { exec } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execPromise = promisify(exec)

async function deployToVercel(url) {
  const rootPath = join(fileURLToPath(url))

  const { stdout } = await execPromise('git log -1 --pretty=%B')

  const paths = stdout
    .trim()
    .split(/\n/)
    .find((i) => i.startsWith('[release]:'))
    .split(/\s/)
    .slice(1)

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
