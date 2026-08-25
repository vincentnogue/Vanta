import type { InfoPageKey, LocalizedPage } from '@/data/infoTypes';
import { aboutContent, careersContent } from '@/data/pages/aboutCareers';
import { pressContent, contactContent, privacyContent } from '@/data/pages/pressContactPrivacy';
import { termsContent, licensesContent, complianceContent } from '@/data/pages/legal';
import { statusContent, blogContent } from '@/data/pages/statusBlog';

export const infoContent: Record<InfoPageKey, LocalizedPage> = {
  about: aboutContent,
  careers: careersContent,
  press: pressContent,
  contact: contactContent,
  privacy: privacyContent,
  terms: termsContent,
  licenses: licensesContent,
  compliance: complianceContent,
  status: statusContent,
  blog: blogContent,
};

export type { InfoPageKey } from '@/data/infoTypes';
