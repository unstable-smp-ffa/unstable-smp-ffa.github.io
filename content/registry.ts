import type { InternalLink, SeoPageDefinition } from "@/config/types";
import { siteConfig } from "@/config/site";
import rawHubPages from "./generated/hubs.json";
import { legalPages } from "./legal";
import { corePages } from "./pages";

/** Index pages that list every page of one topic group (factory site structure v1). Empty on older sites. */
export const hubPages = rawHubPages as SeoPageDefinition[];
export const allPages: SeoPageDefinition[] = [...corePages, ...hubPages, ...legalPages];
export const enabledPages = allPages.filter((page) => page.enabled);
export const enabledCorePages = corePages.filter((page) => page.enabled);
export const enabledHubPages = hubPages.filter((page) => page.enabled);
/** Header/footer navigation. Follows site.navigation order when the generator provides it (capped list), else page order. */
export const visibleCorePages = (() => {
  const visible = [...enabledCorePages, ...enabledHubPages].filter((page) => page.navVisible);
  const order = siteConfig.navigation ?? [];
  if (!order.length) return visible;
  const rank = (slug: string) => { const index = order.indexOf(slug); return index < 0 ? order.length : index; };
  return [...visible].sort((a, b) => rank(a.slug) - rank(b.slug));
})();
/**
 * Header navigation entries. A hub carries its group pages as children (rendered as a dropdown),
 * so every content page has a link in the header of every page, while the bar itself stays short.
 */
export const navMenu: InternalLink[] = visibleCorePages.map((page) => {
  const children = page.pageType === "hub"
    ? enabledCorePages.filter((child) => child.parentSlug === page.slug).map((child) => ({ label: child.navLabel, slug: child.slug }))
    : [];
  return children.length ? { label: page.navLabel, slug: page.slug, children } : { label: page.navLabel, slug: page.slug };
});
export const enabledLegalPages = legalPages.filter((page) => page.enabled);

export function getPageBySlug(slug: string) {
  return enabledPages.find((page) => page.slug === slug);
}

/** Breadcrumb trail between Home and the page: its hub when it has one (URLs stay flat). */
export function breadcrumbParents(slug: string): SeoPageDefinition[] {
  const parentSlug = getPageBySlug(slug)?.parentSlug;
  const parent = parentSlug ? getPageBySlug(parentSlug) : undefined;
  return parent && parent.slug !== slug ? [parent] : [];
}

export function getRelatedPages(page: SeoPageDefinition) {
  return (page.relatedSlugs ?? [])
    .map((slug) => getPageBySlug(slug))
    .filter((related): related is SeoPageDefinition => Boolean(related));
}
