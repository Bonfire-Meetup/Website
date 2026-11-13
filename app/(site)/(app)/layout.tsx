export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-dvh flex-col pb-16 md:pb-0">{children}</main>;
}
