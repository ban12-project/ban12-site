import Container from '#/app/_components/container'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <Container>
        <div className="flex flex-col items-center py-10 lg:flex-row">
          <h3 className="mb-10 text-center text-2xl font-bold leading-tight tracking-tighter lg:mb-0 lg:w-1/2 lg:pr-4 lg:text-left lg:text-[2.5rem]">
            Statically Generated with{' '}
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js.
            </a>
          </h3>
          <div className="flex flex-col items-center justify-center lg:w-1/2 lg:flex-row lg:pl-4">
            <a href="http://vercel" target="_blank" rel="noopener noreferrer">
              Powered by Vercel
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
