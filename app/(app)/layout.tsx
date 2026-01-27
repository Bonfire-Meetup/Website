import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();

  return (
    <>
      <Header locale={locale} />
      {children}
      <Footer locale={locale} />
    </>
  );
}
