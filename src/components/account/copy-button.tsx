"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all duration-300 ${
        copied
          ? "text-green-400 bg-green-500/10"
          : "text-gray-500 hover:text-white hover:bg-white/5"
      }`}
      title={copied ? "Copied" : "Copy"}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="w-4 h-4" strokeWidth={2.5} />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}
