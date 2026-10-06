import type { Metadata } from 'next';
import Exif from '#/components/exif';
import type { Locale } from '#/lib/i18n';

export const instant = true;

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/exif'>): Promise<Metadata> {
  const { lang } = await params;
  return {
    title:
      lang === 'zh-CN'
        ? '在线 EXIF 元数据查看器'
        : 'Online EXIF Metadata Viewer',
    description:
      lang === 'zh-CN'
        ? '在浏览器中读取图片 EXIF 元数据，包括相机、时间、曝光和 GPS 信息。文件不会上传。'
        : 'Read image EXIF metadata in your browser, including camera, time, exposure, and GPS information. Files stay local.',
    alternates: { canonical: `/${lang}/exif` },
  };
}

export default async function Page({ params }: PageProps<'/[lang]/exif'>) {
  const { lang } = await params;
  return <Exif locale={lang as Locale} />;
}
