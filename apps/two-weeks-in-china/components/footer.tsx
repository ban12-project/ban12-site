import { Link } from '@repo/i18n/client';
import NextLink from 'next/link';
import { getGlobalMenu } from '#/lib/db/queries';
import type { Messages } from '#/lib/i18n';

export async function Footer({ dict, lang }: { dict: Messages; lang: string }) {
  const menuItems = await getGlobalMenu(lang);

  return (
    <footer className="bg-dark text-white rounded-t-[45px] mt-20 relative overflow-hidden">
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Brand & Description */}
          <div className="lg:w-1/4 space-y-8">
            <Link href="/" className="block">
              <h2 className="text-3xl font-bold tracking-tighter">
                Two Weeks in <span className="text-primary">China</span>
              </h2>
            </Link>
            <p className="text-white/60 text-lg leading-relaxed">
              {dict.common.description}
            </p>
            {/* <div className="flex items-center gap-4">
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
            </div> */}
          </div>

          {/* Navigation Links */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
            {menuItems.map((menu) => {
              const section = (
                dict.nav_sections as Record<string, Record<string, string>>
              )[menu.title];
              return (
                <div key={menu.title}>
                  <h3 className="font-medium text-lg mb-6 text-white">
                    {section?.title || menu.title}
                  </h3>
                  <ul className="space-y-4">
                    {menu.children.map((item) => (
                      <li key={item.title}>
                        <NextLink
                          href={item.href}
                          className="text-white/60 hover:text-white transition-colors block text-sm"
                        >
                          {item.title}
                        </NextLink>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
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
