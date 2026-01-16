import type { Metadata } from 'next';
import FileExplorer from '#/components/file-explorer';
import { getDictionary, type Locale } from '#/lib/i18n';

export async function generateMetadata(
  props: PageProps<'/[lang]/hash'>,
): Promise<Metadata> {
  const params = await props.params;
  const messages = await getDictionary(params.lang as Locale);

  return {
    title: messages['page-hash'].title,
    description: messages['page-hash'].description,
  };
}

export default function HashPage() {
  return <FileExplorer />;
}
