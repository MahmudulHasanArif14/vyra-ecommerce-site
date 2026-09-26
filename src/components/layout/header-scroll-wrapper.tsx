// "use client";

// import { useEffect, useState } from "react";

// export default function HeaderScrollWrapper({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };

//     handleScroll();
//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <div
//       className={`sticky top-0 z-40 transition-all duration-500 ${
//         scrolled
//           ? "bg-[#0a0a0a]/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] border-b border-white/5"
//           : "bg-transparent border-b border-transparent"
//       }`}
//     >
//       {children}
//     </div>
//   );
// }



