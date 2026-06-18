import React from 'react';

type IconProps = { s?: number };

const svg = (content: React.ReactNode, s: number, extra?: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...extra}
  >
    {content}
  </svg>
);

export const Icon = {
  search: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="22" y2="22" />
      </>,
      s,
    ),

  pin: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <path d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6z" />
        <circle cx="12" cy="8" r="2.5" />
      </>,
      s,
    ),

  flag: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <line x1="5" y1="2" x2="5" y2="22" />
        <path d="M5 4h12l-3 5 3 5H5" />
      </>,
      s,
    ),

  swap: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <path d="M7 3L3 7l4 4" />
        <path d="M3 7h13" />
        <path d="M17 21l4-4-4-4" />
        <path d="M21 17H8" />
      </>,
      s,
    ),

  bus: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <rect x="3" y="5" width="18" height="13" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="5" x2="8" y2="18" />
        <line x1="16" y1="5" x2="16" y2="18" />
        <circle cx="7.5" cy="18.5" r="1.5" />
        <circle cx="16.5" cy="18.5" r="1.5" />
      </>,
      s,
    ),

  train: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <rect x="4" y="4" width="16" height="13" rx="2" />
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="14" x2="20" y2="14" />
        <line x1="9" y1="4" x2="9" y2="17" />
        <circle cx="8" cy="19.5" r="1.5" />
        <circle cx="16" cy="19.5" r="1.5" />
        <line x1="8" y1="17" x2="6.5" y2="21" />
        <line x1="16" y1="17" x2="17.5" y2="21" />
      </>,
      s,
    ),

  metro: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <rect x="3" y="6" width="18" height="11" rx="3" />
        <line x1="3" y1="11" x2="21" y2="11" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="16.5" cy="17.5" r="1.5" />
        <line x1="8" y1="6" x2="8" y2="3" />
        <line x1="16" y1="6" x2="16" y2="3" />
        <line x1="8" y1="3" x2="16" y2="3" />
      </>,
      s,
    ),

  globe: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9" />
        <path d="M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
      </>,
      s,
    ),

  spark: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 17l-6.2 4-0.1-.1 2.4-7.2L2 9.2h7.6L12 2z" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </>,
      s,
    ),

  bolt: ({ s = 18 }: IconProps) =>
    svg(
      <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2z" />,
      s,
    ),

  sun: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
      </>,
      s,
    ),

  moon: ({ s = 18 }: IconProps) =>
    svg(
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
      s,
    ),

  arrowR: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </>,
      s,
    ),

  arrowL: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 5 5 12 12 19" />
      </>,
      s,
    ),

  bell: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </>,
      s,
    ),

  menu: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </>,
      s,
    ),

  home: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>,
      s,
    ),

  star: ({ s = 18 }: IconProps) =>
    svg(
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill="currentColor"
        stroke="none"
      />,
      s,
    ),

  user: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>,
      s,
    ),

  sos: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <circle cx="12" cy="12" r="9" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="8"
          fontWeight="700"
          fontFamily="system-ui"
          fill="currentColor"
          stroke="none"
        >
          SOS
        </text>
      </>,
      s,
    ),

  clock: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 15" />
      </>,
      s,
    ),

  taka: ({ s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fontFamily="'Hind Siliguri', system-ui, sans-serif"
        fill="currentColor"
      >
        ৳
      </text>
    </svg>
  ),

  wifi: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <path d="M1.42 9A16 16 0 0122.58 9" />
        <path d="M5 12.55a11 11 0 0114.08 0" />
        <path d="M8.53 16.11a6 6 0 016.95 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
      </>,
      s,
    ),

  download: ({ s = 18 }: IconProps) =>
    svg(
      <>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </>,
      s,
    ),
};
