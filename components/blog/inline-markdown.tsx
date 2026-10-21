"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared inline markdown rendering for blog content: links, bold and italic,
 * including nesting such as **[bold link](url)** or [**bold** label](url).
 * Used by the admin editor preview and the public article page so both agree.
 */

/** Turn whatever the author typed into a safe href, or null if it is not a link. */
export function normalizeLinkUrl(raw: string): string | null {
  let url = raw.trim();
  if (!url) return null;
  // Collapse an accidental double scheme such as "https://https://example.com".
  url = url.replace(/^(?:https?:\/\/)+(?=https?:\/\/)/i, "");
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url)) return url;
  // Bare domains like "xelectron.com/product/abc" or "www.example.com".
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(url)) return `https://${url}`;
  return null;
}

/** Links to our own site open in the same tab; everything else opens in a new one. */
export function isInternalLink(url: string): boolean {
  return url.startsWith("/") || url.startsWith("#") || /^https?:\/\/(www\.)?xelectron\.com(\/|$)/i.test(url);
}

// [label](url) | **bold** | *italic*
const INLINE_PATTERN = /\[([^\]]+)\]\(([^\s)]+)\)|\*\*(.+?)\*\*|\*([^*\n]+)\*/g;

export type InlineMarkdownProps = {
  text: string;
  linkClassName?: string;
  strongClassName?: string;
  emClassName?: string;
};

type InlineClasses = Omit<InlineMarkdownProps, "text">;

function renderInline(text: string, classes: InlineClasses, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = new RegExp(INLINE_PATTERN.source, "g");
  let cursor = 0;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text))) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    const key = `${keyPrefix}-${index++}`;

    if (match[1] !== undefined && match[2] !== undefined) {
      const href = normalizeLinkUrl(match[2]);
      const label = renderInline(match[1], classes, key);
      if (!href) {
        parts.push(match[0]);
      } else if (href.startsWith("/")) {
        parts.push(
          <Link key={key} href={href} className={classes.linkClassName}>
            {label}
          </Link>
        );
      } else if (isInternalLink(href)) {
        parts.push(
          <a key={key} href={href} className={classes.linkClassName}>
            {label}
          </a>
        );
      } else {
        parts.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={classes.linkClassName}>
            {label}
          </a>
        );
      }
    } else if (match[3] !== undefined) {
      parts.push(
        <strong key={key} className={classes.strongClassName}>
          {renderInline(match[3], classes, key)}
        </strong>
      );
    } else if (match[4] !== undefined) {
      parts.push(
        <em key={key} className={classes.emClassName}>
          {renderInline(match[4], classes, key)}
        </em>
      );
    }

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export function InlineMarkdown({ text, ...classes }: InlineMarkdownProps) {
  return <>{renderInline(text, classes, "inline")}</>;
}
