import { exec } from 'node:child_process'
import { statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execPromise = promisify(exec)

async function deployToVercel(url) {
  try {
    const rootPath = join(fileURLToPath(url))

    const { stdout, stderr } = await execPromise('git log -1 --pretty=%B')
    if (stderr) {
      console.error('Error:', stderr)
      return
    }

    const paths = stdout
      .trim()
      .split(/\n/)
      .find((i) => i.startsWith('[release]:'))
      .split(/\s/)
      .slice(1)

    for (const path of paths) {
      const appPath = join(rootPath, path)
      if (!statSync(appPath).isDirectory()) {
        console.error(`Error: ${path} is not a directory`)
        return
      }

      console.log(`Deploying ${appPath} to Vercel...`)
      const { stdout, stderr } = await execPromise(
        `
        vercel pull --yes --environment=production --token=${process.env.VERCEL_TOKEN} &&
        vercel build --prod --token=${process.env.VERCEL_TOKEN} &&
        vercel deploy --prebuilt --prod --token=${process.env.VERCEL_TOKEN}
      `,
        {
          cwd: appPath,
        },
      )
      if (stderr) {
        console.error('Error:', stderr)
        return
      }
      console.log(stdout)
    }
  } catch (error) {
    console.error(error)
  }
}

deployToVercel(new URL('../../', import.meta.url))
