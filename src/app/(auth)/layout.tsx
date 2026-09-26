import Header from "@/components/layout/header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden px-4 py-12">
        {/* Responsive Background Image Container */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('assets/bglogin.jfif')" }}
        />

        {/* Dark Overlay with subtle blur for readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-md mx-auto">{children}</div>
      </div>
    </>
  );
}
