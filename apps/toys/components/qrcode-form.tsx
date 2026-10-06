'use client';

import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import Image from 'next/image';
import { type FormEvent, useState } from 'react';
import qrcode, { type ErrorCorrectionLevel } from '#/lib/qrcode';
import { type ToolLocale, toolCopy } from '#/lib/tool-copy';
import ToolHeader from './tool-header';

export const supportedDataTypes = [
  { 'data-type': 'URL', action: 'Open URL in browser or an app' },
  { 'data-type': 'Text', action: 'Show text' },
  { 'data-type': 'Email', action: 'Compose an email in Mail' },
  { 'data-type': 'Phone number', action: 'Call the phone number' },
  { 'data-type': 'WiFi Configuration', action: 'Join a Wi-Fi network' },
] as const;

type DataType = (typeof supportedDataTypes)[number]['data-type'];

function escapeWifiValue(value: string) {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

export function QRCodeForm({ locale }: { locale: ToolLocale }) {
  const copy = toolCopy[locale].qr;
  const typeLabels =
    locale === 'zh-CN'
      ? {
          URL: '链接',
          Text: '文本',
          Email: '邮箱',
          'Phone number': '电话号码',
          'WiFi Configuration': 'Wi-Fi 配置',
        }
      : {
          URL: 'URL',
          Text: 'Text',
          Email: 'Email',
          'Phone number': 'Phone number',
          'WiFi Configuration': 'WiFi Configuration',
        };
  const [dataType, setDataType] = useState<DataType>('URL');
  const [value, setValue] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [level, setLevel] = useState<ErrorCorrectionLevel>('M');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const primaryValue = value.trim();
    let content = primaryValue;

    if (dataType === 'Email') {
      if (!/^\S+@\S+\.\S+$/.test(primaryValue)) {
        setError(copy.invalidEmail);
        setImage('');
        return;
      }
      content = `mailto:${primaryValue}`;
    } else if (dataType === 'Phone number') {
      if (!/^[+\d][\d\s().-]{5,}$/.test(primaryValue)) {
        setError(copy.invalidPhone);
        setImage('');
        return;
      }
      content = `tel:${primaryValue.replace(/[^+\d]/g, '')}`;
    } else if (dataType === 'WiFi Configuration') {
      if (!primaryValue) {
        setError(copy.wifiName);
        setImage('');
        return;
      }
      content = `WIFI:T:${wifiSecurity};S:${escapeWifiValue(primaryValue)};P:${escapeWifiValue(wifiPassword)};H:${wifiHidden ? 'true' : 'false'};;`;
    }

    if (!content) {
      setError(copy.empty);
      setImage('');
      return;
    }

    try {
      const code = qrcode(0, level);
      code.addData(content);
      code.make();
      setImage(code.createDataURL(8, 4));
      setError('');
    } catch {
      setImage('');
      setError(copy.tooLong);
    }
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-12"
    >
      <ToolHeader title={copy.title} description={copy.description} />
      <form onSubmit={generate} className="w-full space-y-5">
        <div className="space-y-2">
          <Label htmlFor="qr-data-type">{copy.type}</Label>
          <select
            id="qr-data-type"
            name="data-type"
            value={dataType}
            onChange={(event) => {
              setDataType(event.target.value as DataType);
              setError('');
            }}
            className="h-10 w-full rounded-md border bg-transparent px-3"
          >
            {supportedDataTypes.map(({ 'data-type': type }) => (
              <option key={type} value={type}>
                {typeLabels[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="qr-value">{copy.value}</Label>
          <Input
            id="qr-value"
            name="value"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError('');
            }}
            placeholder={
              dataType === 'URL'
                ? copy.urlPlaceholder
                : dataType === 'Email'
                  ? copy.emailPlaceholder
                  : dataType === 'Phone number'
                    ? copy.phonePlaceholder
                    : dataType === 'WiFi Configuration'
                      ? copy.wifiPlaceholder
                      : copy.textPlaceholder
            }
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'qr-error' : undefined}
          />
        </div>
        {dataType === 'WiFi Configuration' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="qr-wifi-password">{copy.password}</Label>
              <Input
                id="qr-wifi-password"
                type="password"
                value={wifiPassword}
                onChange={(event) => setWifiPassword(event.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-wifi-security">{copy.security}</Label>
              <select
                id="qr-wifi-security"
                value={wifiSecurity}
                onChange={(event) => setWifiSecurity(event.target.value)}
                className="h-10 w-full rounded-md border bg-transparent px-3"
              >
                <option value="WPA">WPA/WPA2/WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No password</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={wifiHidden}
                onChange={(event) => setWifiHidden(event.target.checked)}
              />
              {copy.hidden}
            </label>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="qr-level">{copy.errorCorrection}</Label>
          <select
            id="qr-level"
            name="level"
            value={level}
            onChange={(event) =>
              setLevel(event.target.value as ErrorCorrectionLevel)
            }
            className="h-10 w-full rounded-md border bg-transparent px-3"
          >
            <option value="L">
              {locale === 'zh-CN' ? '低 — 二维码更小' : 'Low — smaller code'}
            </option>
            <option value="M">{locale === 'zh-CN' ? '中' : 'Medium'}</option>
            <option value="Q">
              {locale === 'zh-CN' ? '四分位' : 'Quartile'}
            </option>
            <option value="H">
              {locale === 'zh-CN'
                ? '高 — 更耐损坏'
                : 'High — more resistant to damage'}
            </option>
          </select>
        </div>
        <Button type="submit" className="touch-manipulation">
          {copy.generate}
        </Button>
        {error && (
          <p
            id="qr-error"
            className="text-sm text-red-700 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </form>

      {image && (
        <section
          className="mt-8 flex flex-col items-center gap-4 rounded-2xl border bg-white/70 p-6 shadow-sm dark:bg-slate-950/40"
          aria-live="polite"
        >
          <h2 className="font-medium">{copy.ready}</h2>
          <Image
            src={image}
            alt={locale === 'zh-CN' ? '生成的二维码' : 'Generated QR code'}
            width={320}
            height={320}
            unoptimized
          />
          <a
            href={image}
            download="ban12-qr-code.png"
            className="rounded-md border px-4 py-2 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-slate-800"
          >
            {copy.download}
          </a>
          <button
            type="button"
            className="text-sm text-slate-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-slate-300"
            onClick={() => setImage('')}
          >
            {copy.clear}
          </button>
        </section>
      )}
    </main>
  );
}
