"use client";

import {
  Alert01Icon,
  AlignLeftIcon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Calendar01Icon,
  Cancel01Icon,
  ChartUpIcon,
  ChatIcon,
  CheckmarkBadge01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Delete01Icon,
  Download01Icon,
  File01Icon,
  FileAddIcon,
  FilterIcon,
  HelpCircleIcon,
  LayoutTable01Icon,
  LockIcon,
  Logout01Icon,
  Megaphone01Icon,
  Menu01Icon,
  Notification01Icon,
  PlusSignIcon,
  RadioButtonIcon,
  SchoolIcon,
  SecurityIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  TimelineIcon,
  UserCircleIcon,
  UserSettings01Icon,
} from "hugeicons-react";

/**
 * Icon wrapper that maps the app's semantic icon names to HugeIcons.
 * Using one component means every icon in the app is a HugeIcons glyph.
 */
const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  add: PlusSignIcon,
  arrow_forward: ArrowRight01Icon,
  chevron_right: ArrowRight01Icon,
  auto_awesome: SparklesIcon,
  logout: Logout01Icon,
  download: Download01Icon,
  summarize: File01Icon,
  description: File01Icon,
  forum: ChatIcon,
  send: ArrowRight01Icon,
  report: Alert01Icon,
  close: Cancel01Icon,
  filter_alt_off: FilterIcon,
  filter_list: FilterIcon,
  table_view: LayoutTable01Icon,
  delete: Delete01Icon,
  school: SchoolIcon,
  verified_user: CheckmarkBadge01Icon,
  help: HelpCircleIcon,
  notifications: Notification01Icon,
  account_circle: UserCircleIcon,
  lock: LockIcon,
  security: SecurityIcon,
  expand_more: ArrowDown01Icon,
  expand_less: ArrowUp01Icon,
  check_circle: CheckmarkCircle01Icon,
  pending: Clock01Icon,
  trending_up: ChartUpIcon,
  campaign: Megaphone01Icon,
  timeline: TimelineIcon,
  calendar_today: Calendar01Icon,
  menu: Menu01Icon,
  format_list_bulleted_add: FileAddIcon,
  manage_accounts: UserSettings01Icon,
  linear_scale: SlidersHorizontalIcon,
  short_text: AlignLeftIcon,
  radio_button_checked: RadioButtonIcon,
};

export function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Comp = ICONS[name] ?? (() => <span className="inline-block h-2 w-2 rounded-full bg-current" />);
  return <Comp size={size} className={className} />;
}