export const LANDING_SECTION_IDS = {
  hero: "hero",
  features: "features",
  howItWorks: "how-it-works",
  faq: "faq",
  footer: "footer",
} as const;

export const LANDING_SCROLL_ORDER = [
  LANDING_SECTION_IDS.hero,
  LANDING_SECTION_IDS.features,
  LANDING_SECTION_IDS.howItWorks,
  LANDING_SECTION_IDS.faq,
  LANDING_SECTION_IDS.footer,
] as const;
