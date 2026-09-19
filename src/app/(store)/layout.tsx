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
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
