import { Link } from '@repo/i18n/client';
import { Button } from '@repo/ui/components/button';
import { DesktopNav, MobileNav } from '#/components/global-menu';
import type { Messages } from '#/lib/i18n';

function Logo() {
  return (
    <Link href="/" className="relative z-10 group">
      <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
        <span className="bg-primary text-dark px-2 py-1 rounded-lg border-2 border-dark translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
          <span className="md:hidden">2</span>
          <span className="hidden md:inline">Two</span>
        </span>
        <span className="text-dark flex flex-col text-xl leading-none">
          <span>Weeks</span>
          <span>in China</span>
        </span>
      </div>
    </Link>
  );
}

export function Header({ dict }: { dict: Messages }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-dark/10 transition-all duration-300">
      <div className="container mx-auto px-6 h-20 flex items-center gap-4">
        <Logo />

        <DesktopNav dict={dict} />

        {/* CTA & Mobile Menu */}
        <div className="flex items-center gap-4 ml-auto">
          <Button
            variant="outline"
            className="hidden sm:inline-flex bg-transparent border border-dark text-dark hover:bg-dark hover:text-white rounded-[14px] px-6 py-2.5 h-auto text-xl font-normal transition-colors"
            asChild
          >
            <Link href="/eligibility">{dict.nav.check_eligibility}</Link>
          </Button>

          <MobileNav dict={dict} />
        </div>
      </div>
    </header>
  );
}
