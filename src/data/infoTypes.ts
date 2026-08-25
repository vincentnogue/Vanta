import type { Language } from '@/i18n/translations';

export type InfoPageKey =
  | 'about'
  | 'careers'
  | 'press'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'licenses'
  | 'compliance'
  | 'status'
  | 'blog';

export type InfoItem = { title: string; meta?: string; body?: string };
export type InfoSection = { title: string; body: string };
export type InfoPageContent = {
  title: string;
  subtitle: string;
  sections: InfoSection[];
  itemsTitle?: string;
  items?: InfoItem[];
};

export type LocalizedPage = Record<Language, InfoPageContent>;
