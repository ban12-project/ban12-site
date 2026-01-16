import HomeHeader from '#/components/home-header';
import HomeLanding from '#/components/home-landing';
import { getDictionary, type Locale } from '#/lib/i18n';

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  const messages = await getDictionary(lang as Locale);

  return (
    <>
      <HomeHeader />
      <main className="h-[calc(100dvh-calc(var(--spacing)*16))] w-screen">
        <HomeLanding messages={messages} />
      </main>
    </>
  );
}
