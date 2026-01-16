import * as z from 'zod';

import type { LocalizedString } from './db/schema';
import type { Locale } from './i18n';

/**
 * @param size bytes
 */
export const formatSize = (size: number) => {
  if (size < 1024) {
    return `${size} bytes`;
  } else if (size >= 1024 && size < 1048576) {
    return `${(size / 1024).toFixed(1)} KB`;
  } else if (size >= 1048576 && size < 1073741824) {
    return `${(size / 1048576).toFixed(1)} MB`;
  } else {
    return `${(size / 1073741824).toFixed(1)} GB`;
  }
};

export const IN_BROWSER = typeof window !== 'undefined';

export function negativeToHexColor(color: string) {
  const negativeNumber = Number.parseInt(color, 10);

  // 将负数转换为 32 位无符号整数
  const unsignedNumber = negativeNumber >>> 0;

  // 将无符号整数转换为 16 进制
  let hexValue = unsignedNumber.toString(16);

  // 确保长度为 8 位，不足的前面补 0
  while (hexValue.length < 8) {
    hexValue = `0${hexValue}`;
  }

  // 返回 ARGB 颜色值
  return `#${hexValue}`;
}

export class LocalizedHelper<T extends Locale[]> {
  static locales: Locale[] = ['en', 'zh-CN', 'ja', 'sv', 'ar'];
  separator: string = '.';
  static schema = z
    .string()
    .transform<{ [key in Locale]: string }>((val) => JSON.parse(val))
    .pipe(
      z.object(
        Object.fromEntries(
          LocalizedHelper.locales.map((locale) => [locale, z.string()]),
        ) as { [key in Locale]: z.ZodString },
      ),
    );

  constructor(locales?: T, separator?: string) {
    if (locales) LocalizedHelper.locales = locales;
    if (separator) this.separator = separator;
  }

  protected generateKey(...args: string[]) {
    return args.join(this.separator);
  }

  render(
    parentKey: string,
    data: LocalizedString,
    render: (
      key: keyof LocalizedString,
      value: LocalizedString[keyof LocalizedString],
      name: string,
      separator: string,
    ) => React.ReactNode,
  ): React.ReactNode {
    return Object.entries(data).map(([key, value]) =>
      render(
        key as keyof LocalizedString,
        value,
        this.generateKey(parentKey, key),
        this.separator,
      ),
    );
  }

  resolveFormData(formData: FormData, key: string, clear = true) {
    const data = Object.fromEntries(
      LocalizedHelper.locales.map((locale) => {
        const value = formData.get(this.generateKey(key, locale));
        if (clear) formData.delete(this.generateKey(key, locale));
        return [locale, value];
      }),
    );
    return data;
  }
}
