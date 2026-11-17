import Link from "next/link";
import type { InternalLink } from "@/config/types";
import { routePath } from "@/lib/urls";

/**
 * Header links shared by the portal and skin headers. A hub with children renders as a dropdown group
 * (hub link + its group pages), so every content page is linked from the header of every page.
 */
export function NavItems({ links, linkClassName, isCurrent, onNavigate }: {
  links: InternalLink[];
  linkClassName: string;
  isCurrent: (slug: string) => boolean;
  onNavigate: () => void;
}) {
  const item = (link: InternalLink, extra = "") => {
    const active = isCurrent(link.slug);
    return (
      <Link
        key={link.slug || "home"}
        href={routePath(link.slug)}
        aria-current={active ? "page" : undefined}
        className={`${linkClassName}${extra} ${active ? "is-active" : ""}`}
        onClick={onNavigate}
      >
        {link.label}
      </Link>
    );
  };
  return (
    <>
      {links.map((link) => {
        const children = link.children ?? [];
        if (!children.length) return item(link);
        const open = children.some((child) => isCurrent(child.slug));
        return (
          <span key={link.slug} className="site-nav-group">
            {item(link, ` site-nav-group-head${open ? " is-active" : ""}`)}
            <span className="site-nav-menu">{children.map((child) => item(child, " site-nav-sub"))}</span>
          </span>
        );
      })}
    </>
  );
}
