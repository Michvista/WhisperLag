"use client";

import React from "react";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * Self-contained SVG icon set with crisp 24×24 viewBox and stroke-width 1.5.
 */
const PATHS: Record<string, React.ReactNode> = {
  home: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m3 9.5 9-7 9 7V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z M9 21V12h6v9" />
  ),
  chat: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 0 1-4-.837L3 21l1.1-3.5C3.4 16.13 3 14.614 3 13c0-4.418 4.03-8 9-8s9 3.582 9 7Z" />
  ),
  lock: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 10V7a4 4 0 0 0-8 0v3M5 10h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Zm7 4v2" />
  ),
  add: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  ),
  close: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
  ),
  check: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  ),
  check_circle: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  ),
  search: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
  ),
  edit: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232 18.768 8.768M7 17l-3 1 1-3L15 5.5a2.121 2.121 0 0 1 3 3L7 17Z" />
  ),
  filter: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M7 10h10M11 15h2" />
  ),
  filter_list: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M7 10h10M11 15h2" />
  ),
  filter_alt_off: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M7 10h10M11 15h2" />
  ),
  logout: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3" />
  ),
  download: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2 M7 10l5 5 5-5 M12 15V3" />
  ),
  file: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z M14 2v6h6M8 13h8M8 17h5" />
  ),
  summarize: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z M14 2v6h6M8 13h8M8 17h5" />
  ),
  description: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z M14 2v6h6M8 13h8M8 17h5" />
  ),
  document: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z M14 2v6h6M8 13h8M8 17h5" />
  ),
  format_list_bulleted_add: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h12M3 18h9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16v5M14.5 18.5h5" />
    </>
  ),
  forum: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v3l-3-3H9a2 2 0 0 1-2-2M3 4h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8l-3 3V6a2 2 0 0 1 2-2Z" />
  ),
  send: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" />
  ),
  report: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
  ),
  alert: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
  ),
  error: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
  ),
  info: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  ),
  help: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  ),
  school: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 2 9l10 6 10-6-10-6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
      <path strokeLinecap="round" d="M22 9v5" />
    </>
  ),
  academic: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 2 9l10 6 10-6-10-6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
    </>
  ),
  book: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm4 0v16M4 9h4M4 14h4" />
  ),
  building: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4M9 8h1M14 8h1M9 12h1M14 12h1" />
  ),
  facility: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-4h6v4M9 8h1M14 8h1" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>
  ),
  manage_accounts: (
    <>
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>
  ),
  attachment: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  ),
  star: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674Z" />
  ),
  verified_user: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016Z" />
  ),
  user: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
  ),
  account_circle: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
    </>
  ),
  security: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
  ),
  shield: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
  ),
  notifications: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V4a1 1 0 0 0-2 0v1.083A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
  ),
  sparkles: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </>
  ),
  auto_awesome: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </>
  ),
  delete: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3" />
  ),
  pending: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  ),
  trending_up: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 7l-8.5 8.5-5-5L2 17M16 7h6v6" />
  ),
  campaign: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6M5.436 13.683A4.001 4.001 0 0 0 7.028 6H4a4 4 0 0 0 0 8h.272a4 4 0 0 0 2.164-.682l-.999-3.317" />
  ),
  timeline: (
    <>
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="20" cy="18" r="1" fill="currentColor" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8M12 18h8" />
    </>
  ),
  calendar_today: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
  ),
  menu: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  ),
  table_view: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3V3Zm0 6h18M3 15h18M9 3v18" />
  ),
  expand_more: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
  ),
  chevron_down: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
  ),
  expand_less: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 15 6-6 6 6" />
  ),
  chevron_up: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 15 6-6 6 6" />
  ),
  arrow_forward: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
  ),
  arrow_back: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
  ),
  chevron_right: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
  ),
  chevron_left: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m15 6-6 6 6 6" />
  ),
  linear_scale: (
    <>
      <circle cx="4" cy="12" r="1.5" fill="currentColor" />
      <circle cx="10" cy="12" r="1.5" fill="currentColor" />
      <circle cx="16" cy="12" r="1.5" fill="currentColor" />
      <circle cx="22" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  short_text: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h10" />
  ),
  radio_button_checked: (
    <>
      <circle cx="12" cy="12" r="9" strokeLinecap="round" />
      <circle cx="12" cy="12" r="5" fill="currentColor" />
    </>
  ),
  tune: (
    <>
      <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="8" cy="6" r="2" fill="white" stroke="currentColor" />
      <circle cx="16" cy="12" r="2" fill="white" stroke="currentColor" />
      <circle cx="10" cy="18" r="2" fill="white" stroke="currentColor" />
    </>
  ),
  refresh: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
  ),
};

/**
 * Renders a named SVG icon. Falls back to a lock icon for unknown names.
 * All icons: 24×24 viewBox, stroke-based, strokeWidth 1.5.
 */
export function Icon({ name, size = 20, className = "" }: IconProps) {
  const paths = PATHS[name] ?? PATHS.lock;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}