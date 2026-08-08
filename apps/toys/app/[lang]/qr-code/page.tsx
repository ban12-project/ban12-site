import type { Metadata } from 'next';
import { QRCodeForm } from '#/components/qrcode-form';
import type { Locale } from '#/lib/i18n';

export const unstable_instant = { prefetch: 'static' };

export async function generateMetadata(
  props: PageProps<'/[lang]/qr-code'>,
): Promise<Metadata> {
  const params = await props.params;
  const lang = params.lang as Locale;

  return {
    title: lang === 'zh-CN' ? '在线二维码生成器' : 'Online QR Code Generator',
    description:
      lang === 'zh-CN'
        ? '在浏览器中生成链接、邮箱、电话、Wi-Fi 和联系人二维码。'
        : 'Generate QR codes for links, email, phone numbers, Wi-Fi, and contacts in your browser.',
    alternates: { canonical: `/${lang}/qr-code` },
  };
}

export default async function QRCodePage({
  params,
}: PageProps<'/[lang]/qr-code'>) {
  const { lang } = await params;
  return <QRCodeForm locale={lang as Locale} />;
}
