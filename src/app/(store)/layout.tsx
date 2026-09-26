import Header from "@/components/layout/header";
import AnnouncementBar from "@/components/layout/announcement-bar";
import Footer from "@/components/layout/footer";
import PageTransition from "@/components/animation/page-transition";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a00] text-white flex flex-col">
      <AnnouncementBar />

      <Header />

      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>

      <Footer />
    </div>
  );
}
