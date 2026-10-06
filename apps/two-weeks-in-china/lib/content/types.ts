export const VISA_POLICIES = [
  'visa_free_15',
  'visa_free_30',
  'transit_240h',
  'visa_required',
] as const;

export type VisaPolicyType = (typeof VISA_POLICIES)[number];
export type ContentFormat = 'md' | 'mdx';

/** JSON values deliberately replace database Date/ORM types. */
export interface Country {
  id: number;
  name: string;
  code: string | null;
  visaPolicy: VisaPolicyType;
  policyDetails: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PageMetadata {
  icon?: string;
  href?: string;
  tags?: string[];
  order?: number;
  [key: string]: unknown;
}

export interface PageFrontmatter {
  id?: number;
  path: string;
  title: string;
  subtitle: string | null;
  metadata: PageMetadata | null;
  createdAt: string;
  updatedAt: string;
  draft: boolean;
}

export interface Page extends PageFrontmatter {
  content: string;
  format: ContentFormat;
}

export interface ContentSnapshot {
  version: 1;
  exportedAt: string;
  pages: Array<
    Omit<PageFrontmatter, 'draft'> & { id: number; content: string }
  >;
  countries: Country[];
}

export interface MigrationManifest {
  version: 1;
  status: 'complete';
  exportedAt: string;
  sourceSha256: string;
  pageCount: number;
  countryCount: number;
  pages: Array<{ path: string; sha256: string }>;
  countriesSha256: string;
}

export interface Catalog {
  pages: Page[];
  countries: Country[];
  migration: MigrationManifest;
}
