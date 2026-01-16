import HomeHeader from '#/components/home-header';
import R3f from './r3f';

export default async function Home() {
  return (
    <>
      <HomeHeader />
      <main className="relative h-[calc(100dvh-calc(var(--spacing)*16))] w-screen">
        <R3f />
      </main>
    </>
  );
}
