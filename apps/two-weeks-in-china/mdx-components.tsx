import {
  AlertTriangle,
  CheckCircle,
  Info,
  type LucideIcon,
  MapPin,
  Plane,
  Smartphone,
  Train,
  Wallet,
} from 'lucide-react';
import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

// Icon mapping for metadata.icon
const iconMap: Record<string, LucideIcon> = {
  plane: Plane,
  train: Train,
  smartphone: Smartphone,
  wallet: Wallet,
  'map-pin': MapPin,
  info: Info,
  check: CheckCircle,
  warning: AlertTriangle,
};

// LinkCard component for navigation with icon, title, href
interface LinkCardProps {
  icon?: string;
  title: string;
  href: string;
  description?: string;
}

function LinkCard({ icon, title, href, description }: LinkCardProps) {
  const Icon = icon ? iconMap[icon] : null;

  return (
    <Link
      href={href}
      className="group block p-6 rounded-2xl border border-grey bg-white hover:shadow-lg transition-all"
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="p-2 rounded-lg bg-grey text-dark">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-dark group-hover:text-primary transition-colors">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-dark/60">{description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

// InfoBox component for callouts
interface InfoBoxProps {
  type?: 'info' | 'warning' | 'success';
  title?: string;
  children: React.ReactNode;
}

function InfoBox({ type = 'info', title, children }: InfoBoxProps) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    success: 'border-green-200 bg-green-50 text-green-900',
  };

  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
  };

  const Icon = icons[type];

  return (
    <div className={`p-4 rounded-xl border ${styles[type]} my-4`}>
      <div className="flex gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          {title && <strong className="block mb-1">{title}</strong>}
          {children}
        </div>
      </div>
    </div>
  );
}

// Section component for content sections
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold text-dark mb-4">{title}</h2>
      {children}
    </section>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override default elements
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold tracking-tight text-dark mb-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-dark mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold text-dark mt-6 mb-3">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-dark/80 leading-relaxed mb-4">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-dark/80">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-dark/80">
        {children}
      </ol>
    ),
    a: ({ href, children }) => (
      <Link href={href ?? '#'} className="text-primary hover:underline">
        {children}
      </Link>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-dark/60 my-4">
        {children}
      </blockquote>
    ),
    // Custom components
    LinkCard,
    InfoBox,
    Section,
    ...components,
  };
}
