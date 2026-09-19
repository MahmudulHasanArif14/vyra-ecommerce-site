import Header from "@/components/layout/header";

import AnnouncementBar from "@/components/layout/announcement-bar";
import Footer from "@/components/layout/footer";
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
