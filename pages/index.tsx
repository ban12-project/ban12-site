import type { InferGetStaticPropsType, GetStaticProps } from 'next'

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Welcome from '@/components/Welcome'

export const getStaticProps: GetStaticProps = async (ctx) => {
  return {
    props: {
      ...await serverSideTranslations(ctx.locale ?? 'en', ['common'])
    },
  }
}

type HomePageProps = InferGetStaticPropsType<typeof getStaticProps>

const Home = (props: HomePageProps) => (
  <>
    <Welcome {...props} />
  </>
)

export default Home
