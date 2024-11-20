import sharedConfig from '@repo/tailwind-config'
import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import tailwindcssAnimate from 'tailwindcss-animate'
import tailwindcssSafeArea from '@ban12/tailwindcss-safe-area'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [sharedConfig],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      keyframes: {
        slideDownAndFade: {
          from: {
            opacity: '0',
            transform: 'translateY(-2px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideLeftAndFade: {
          from: {
            opacity: '0',
            transform: 'translateX(2px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        slideUpAndFade: {
          from: {
            opacity: '0',
            transform: 'translateY(2px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideRightAndFade: {
          from: {
            opacity: '0',
            transform: 'translateX(-2px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        enterFromRight: {
          from: {
            opacity: '0',
            transform: 'translateX(200px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        enterFromLeft: {
          from: {
            opacity: '0',
            transform: 'translateX(-200px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        exitToRight: {
          from: {
            opacity: '1',
            transform: 'translateX(0)',
          },
          to: {
            opacity: '0',
            transform: 'translateX(200px)',
          },
        },
        exitToLeft: {
          from: {
            opacity: '1',
            transform: 'translateX(0)',
          },
          to: {
            opacity: '0',
            transform: 'translateX(-200px)',
          },
        },
        scaleIn: {
          from: {
            opacity: '0',
            transform: 'rotateX(-10deg) scale(0.9)',
          },
          to: {
            opacity: '1',
            transform: 'rotateX(0deg) scale(1)',
          },
        },
        scaleOut: {
          from: {
            opacity: '1',
            transform: 'rotateX(0deg) scale(1)',
          },
          to: {
            opacity: '0',
            transform: 'rotateX(-10deg) scale(0.95)',
          },
        },
        fadeIn: {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        fadeOut: {
          from: {
            opacity: '1',
          },
          to: {
            opacity: '0',
          },
        },
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        slideDownAndFade:
          'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideLeftAndFade:
          'slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideRightAndFade:
          'slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        scaleIn: 'scaleIn 200ms ease',
        scaleOut: 'scaleOut 200ms ease',
        fadeIn: 'fadeIn 200ms ease',
        fadeOut: 'fadeOut 200ms ease',
        enterFromLeft: 'enterFromLeft 250ms ease',
        enterFromRight: 'enterFromRight 250ms ease',
        exitToLeft: 'exitToLeft 250ms ease',
        exitToRight: 'exitToRight 250ms ease',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      colors: {
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [
    tailwindcssAnimate,
    tailwindcssSafeArea,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    plugin(({ matchUtilities, addBase, addComponents }) => {
      matchUtilities({
        perspective: (value) => ({
          perspective: value,
        }),
      })

      addBase({
        ':root': {
          '&:not([dir=rtl])': {
            '--safe-area-inset-start': 'env(safe-area-inset-left)',
            '--safe-area-inset-end': 'env(safe-area-inset-right)',
          },
          '&[dir=rtl]': {
            '--safe-area-inset-start': 'env(safe-area-inset-right)',
            '--safe-area-inset-end': 'env(safe-area-inset-left)',
          },

          '--container-inset-start': 'var(--safe-area-inset-start)',
          '--container-inset-end': 'var(--safe-area-inset-end)',
          // 16 -> 1rem default use by padding inline
          // lg 1024 * a - b = 16
          // 2xl 1536 * a - b = 140
          // a=?
          // b=?
          '@media screen(lg)': {
            '--container-inset': 'calc(24.21875vw - 232px)',
            '--container-inset-start': 'calc(24.21875vw - 232px)',
            '--container-inset-end': 'calc(24.21875vw - 232px)',
          },
          '@media screen(2xl)': {
            '--container-inset': '140px',
            '--container-inset-start': '140px',
            '--container-inset-end': '140px',
          },
        },
      })

      addComponents({
        '.hidden-scrollbar': {
          'scrollbar-width': 'none' /* Firefox */,
          ['&::-webkit-scrollbar']: {
            display: 'none' /* Safari and Chrome */,
          },
        },
        '.mask-image-paint-smooth-corners': {
          'mask-image': 'paint(smooth-corners)',
        },
        '.container-full': {
          'padding-inline':
            'max(1rem, var(--container-inset-start)) max(1rem, var(--container-inset-end))',
        },
      })
    }),
  ],
}
export default config
