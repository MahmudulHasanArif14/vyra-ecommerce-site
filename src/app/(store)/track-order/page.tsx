import { Suspense } from "react";
import TrackOrderClient from "./track-order-client";

export const metadata = {
  title: "Track Your Order | VYRA Accessories",
  description: "Track your VYRA order in real-time.",
};

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  );
}
