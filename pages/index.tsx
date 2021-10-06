import loadIntlMessages from '../helper/loadIntlMessages'
import Welcome from '@/components/Welcome'

import type { InferGetStaticPropsType, GetStaticProps } from 'next'


export const getStaticProps: GetStaticProps = async (ctx) => {
  return {
    props: {
      intlMessages: await loadIntlMessages(ctx)
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
