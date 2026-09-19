import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import NewsletterForm from "./newsletter-form";
import { getSettings } from "@/lib/settings";

export default async function Footer() {
  const settings = await getSettings();

  const storeName = settings.store_name || "VYRA Accessories";
  const storeEmail = settings.store_email || "hello@vyra.com";
  const storePhone = settings.store_phone || "+880 1700-000000";
  const storeAddress = settings.store_address || "Sylhet, Bangladesh";

  const facebookUrl = settings.facebook_url || "#";
  const instagramUrl = settings.instagram_url || "#";
  const youtubeUrl = settings.youtube_url || "#";

  const brandWord = storeName.split(" ")[0].toUpperCase();

  return (
    <footer className="bg-white border-t mt-24">
      {/* ============================================================ */}
      {/* 1. Newsletter */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center border-b">
        <p className="text-red-500 text-xs font-medium mb-3 tracking-widest">
          SALE
        </p>
        <h2 className="text-lg md:text-xl tracking-[0.3em] font-medium">
          BE A VYRA ARMY
        </h2>
        <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
          Be the first to know about new collections and exclusive offers.
        </p>

        <div className="max-w-md mx-auto mt-6">
          <NewsletterForm />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. Three-column links */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-3 gap-10">
        {/* Products */}
        <div>
          <h3 className="text-xs tracking-[0.2em] font-semibold mb-5">
            PRODUCTS
          </h3>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li>
              <Link
                href="/category/accessories"
                className="hover:text-black transition"
              >
                Accessories
              </Link>
            </li>
            <li>
              <Link
                href="/category/clothing"
                className="hover:text-black transition"
              >
                Clothing
              </Link>
            </li>
            <li>
              <Link
                href="/category/bags"
                className="hover:text-black transition"
              >
                Bags
              </Link>
            </li>
            <li>
              <Link
                href="/category/mobile-cases"
                className="hover:text-black transition"
              >
                Mobile Cases
              </Link>
            </li>
            <li>
              <Link
                href="/category/airpods-cases"
                className="hover:text-black transition"
              >
                AirPods Cases
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xs tracking-[0.2em] font-semibold mb-5">
            SUPPORT
          </h3>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li>
              <Link href="/about" className="hover:text-black transition">
                About us
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-black transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-black transition">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-black transition">
                Refund &amp; Exchange
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-black transition">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/track-order" className="hover:text-black transition">
                Track Order
              </Link>
            </li>
          </ul>
        </div>

        {/* About Us */}
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-xs tracking-[0.2em] font-semibold mb-5">
            ABOUT US
          </h3>
          <p className="text-sm text-gray-600 italic">
            Elevate your everyday style.
          </p>
          <ul className="space-y-2.5 text-sm text-gray-600 mt-4">
            <li>
              <span className="text-gray-400">Phone:</span>{" "}
              <a href={`tel:${storePhone}`} className="hover:text-black">
                {storePhone}
              </a>
            </li>
            <li>
              <span className="text-gray-400">Mail:</span>{" "}
              <a href={`mailto:${storeEmail}`} className="hover:text-black">
                {storeEmail}
              </a>
            </li>
            <li>
              <span className="text-gray-400">Location:</span> {storeAddress}
            </li>
          </ul>

          {/* Social icons */}
          <div className="flex gap-3 mt-6">
            {facebookUrl && facebookUrl !== "#" && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
              </a>
            )}
            {instagramUrl && instagramUrl !== "#" && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} className="w-4 h-4" />
              </a>
            )}
            {youtubeUrl && youtubeUrl !== "#" && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition"
                aria-label="YouTube"
              >
                <FontAwesomeIcon icon={faYoutube} className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. Giant brand name */}
      {/* ============================================================ */}
      <section className="border-t overflow-hidden">
        <h2
          className="text-center font-bold text-black select-none tracking-[-0.02em] leading-[0.8] py-8"
          style={{
            fontSize: "clamp(4rem, 18vw, 20rem)",
            fontFamily: "Georgia, serif",
          }}
        >
          {brandWord}
        </h2>
      </section>

      {/* ============================================================ */}
      {/* 4. Bottom bar */}
      {/* ============================================================ */}
      <section className="border-t">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-black">BDT ৳</span>
            <span className="cursor-pointer hover:text-black">EN</span>
          </div>
          <p>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-black">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-black">
              Terms
            </Link>
          </div>
        </div>
      </section>
    </footer>
  );
}
