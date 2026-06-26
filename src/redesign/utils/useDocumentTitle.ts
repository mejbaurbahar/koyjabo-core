import { useEffect } from 'react';

const HOME_TITLE = 'KoyJabo — Bangladesh Bus, Metro & Travel Guide | কই যাবো';

export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    const next = title ? `${title} — কই যাবো` : HOME_TITLE;
    if (document.title !== next) document.title = next;
    return () => {
      if (document.title !== HOME_TITLE) document.title = HOME_TITLE;
    };
  }, [title]);
}

export function setCanonicalUrl(path: string) {
  const href = `https://koyjabo.com${path.startsWith('/') ? path : '/' + path}`;
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}
