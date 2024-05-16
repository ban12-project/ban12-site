import prisma from "../lib/prisma"

async function main() {
  const posts = await prisma.shortcut.findMany()

  console.dir(posts, { depth: Infinity })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
