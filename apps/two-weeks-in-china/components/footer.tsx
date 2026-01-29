import { Link } from '@repo/i18n/client';
import { Github, Twitter } from 'lucide-react';
import type { Messages } from '#/lib/i18n';

export function Footer({ dict }: { dict: Messages }) {
  const navItems = [
    { key: 'policy', href: '#policy' },
    { key: 'destinations', href: '#rules' },
    { key: 'essentials', href: '#survival' },
    { key: 'itinerary', href: '#itinerary' },
  ];

  return (
    <footer className="bg-dark text-white rounded-t-[45px] mt-20 relative overflow-hidden">
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          {/* Brand & Description */}
          <div className="space-y-8">
            <Link href="/" className="block">
              <h2 className="text-3xl font-bold tracking-tighter">
                China<span className="text-primary">Guide</span>
              </h2>
            </Link>
            <p className="text-white/60 max-w-md text-lg leading-relaxed">
              {dict.common.description}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
              >
                <Twitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://github.com"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
              >
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium text-lg mb-6 text-white">
                {dict.nav.destinations}
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#rules"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    Beijing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#rules"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    Shanghai
                  </Link>
                </li>
                <li>
                  <Link
                    href="#rules"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    Xi'an
                  </Link>
                </li>
                <li>
                  <Link
                    href="#rules"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    Guangzhou
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-6 text-white">Guide</h3>
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {dict.nav[item.key as keyof typeof dict.nav]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <p>{dict.common.footer_copyright}</p>
          <p>{dict.common.footer_note}</p>
        </div>
      </div>
    </footer>
  );
}
