'use client';

import { cn } from '@repo/ui/lib/utils';
import { useTheme } from 'next-themes';

type Props = React.ButtonHTMLAttributes<React.ComponentRef<'div'>>;

const themes = [
  { label: 'light', value: 'light' },
  { label: 'dark', value: 'dark' },
  { label: 'auto', value: 'system' },
];

export default function ColorSchemeToggle({ className }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-solid border-blue-500 p-[1px] text-xs',
        className,
      )}
      role="radiogroup"
      tabIndex={0}
      aria-label="Select a color scheme preference"
    >
      {themes.map(({ label, value }) => (
        <label data-color-scheme-option={label} key={value}>
          <input
            className="peer sr-only"
            type="radio"
            value={value}
            autoComplete="off"
            checked={theme === value}
            onChange={() => setTheme(value)}
          />
          <div className="min-w-[42px] rounded-[10px] px-1.5 py-0.5 text-center capitalize text-blue-500 active:text-blue-500/80 peer-checked:bg-blue-500 peer-checked:text-zinc-100">
            {label}
          </div>
        </label>
      ))}
    </div>
  );
}
