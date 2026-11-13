import type { ComponentType } from "react";

import {
  BadgeCheckIcon,
  BoltIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
  ExternalLinkIcon,
  FingerprintIcon,
  FireIcon,
  GuildIcon,
  InfoIcon,
  LockClosedIcon,
  LogInIcon,
  MailIcon,
  MicIcon,
  QrCodeIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
  TicketIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "@/components/shared/Icons";

export type GuideIcon = ComponentType<{ className?: string; "aria-hidden"?: "true" }>;

/** Icons guide MDX files can reference by name, e.g. `<Section icon="mail">`. */
export const GUIDE_ICONS = {
  "badge-check": BadgeCheckIcon,
  bolt: BoltIcon,
  calendar: CalendarIcon,
  camera: CameraIcon,
  "check-circle": CheckCircleIcon,
  clock: ClockIcon,
  close: CloseIcon,
  "external-link": ExternalLinkIcon,
  fingerprint: FingerprintIcon,
  fire: FireIcon,
  guild: GuildIcon,
  info: InfoIcon,
  lock: LockClosedIcon,
  "log-in": LogInIcon,
  mail: MailIcon,
  mic: MicIcon,
  "qr-code": QrCodeIcon,
  refresh: RefreshIcon,
  search: SearchIcon,
  shield: ShieldIcon,
  ticket: TicketIcon,
  trash: TrashIcon,
  user: UserIcon,
  users: UsersIcon,
} satisfies Record<string, GuideIcon>;

export type GuideIconName = keyof typeof GUIDE_ICONS;
