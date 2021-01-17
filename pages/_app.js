import Head from 'next/head'
import '../styles/index.css'

const Layout = ({ children }) => (
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
          padding-bottom: calc(max(0, env(safe-area-inset-bottom))) !important;
        }
      }
    `}</style>
  </>
)

function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default App
