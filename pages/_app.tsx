import Head from 'next/head'
import Link from 'next/link'
import { appWithTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
// import nextI18NextConfig from '../next-i18next.config.js'

import '../styles/index.css'

import type { AppProps } from 'next/app'

type Props = { children: React.ReactNode }

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter()

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="icon" href="/favicon.ico" />
        <title>ban12.com</title>
      </Head>

      {children}

      <style jsx global>{`
        // iOS safe area
        body {
          padding-left: calc(0 + constant(safe-area-inset-left)) !important;
          padding-right: calc(0 + constant(safe-area-inset-right)) !important;
          padding-bottom: calc(0 + constant(safe-area-inset-bottom)) !important;
        }

        @supports (padding: calc(max(0px))) {
          body {
            padding-left: calc(max(0, env(safe-area-inset-left))) !important;
            padding-right: calc(max(0, env(safe-area-inset-right))) !important;
            padding-bottom: calc(
              max(0, env(safe-area-inset-bottom))
            ) !important;
          }
        }
      `}</style>
    </>
  )
}

function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

// https://github.com/i18next/next-i18next#unserialisable-configs
export default appWithTranslation(App /*, nextI18NextConfig */)
