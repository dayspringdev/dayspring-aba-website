// FILE: src/components/NavLink.tsx

import Link from "next/link";
import type { LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";

type NavLinkProps = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>;

export function NavLink(props: NavLinkProps) {
  // This component now simply passes all props through to the underlying
  // Next.js Link component, allowing the browser to handle scrolling.
  return <Link {...props} />;
}
