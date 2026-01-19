import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";

export default function RecordingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-18">{children}</main>
      <Footer />
    </>
  );
}
