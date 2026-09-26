"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, User, Loader2, Check } from "lucide-react";
import { uploadAvatar } from "@/actions/account";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AvatarUploader({
  currentUrl,
  userName,
}: {
  currentUrl: string | null;
  userName: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keep preview in sync when currentUrl changes from server
  useEffect(() => {
    if (!uploading) setPreview(currentUrl);
  }, [currentUrl, uploading]);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side before uploading
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setImgError(false);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatar(formData);

    if (result.success) {
      toast.success("Avatar updated");
      setJustUploaded(true);
      setTimeout(() => setJustUploaded(false), 2000);
      router.refresh();
    } else {
      toast.error(result.error || "Upload failed");
      setPreview(currentUrl);
    }

    URL.revokeObjectURL(objectUrl);
    e.target.value = "";
    setUploading(false);
  };

  const initials = userName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const showImage = preview && !imgError;

  return (
    <div className="relative inline-block group">
      {/* Main avatar */}
      <div
        className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden transition-all duration-300 ${
          justUploaded
            ? "ring-4 ring-green-500/40"
            : "ring-2 ring-white/10 group-hover:ring-white/25"
        }`}
      >
        {showImage ? (
          <Image
            src={preview}
            alt={userName}
            fill
            sizes="96px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-cyan-300 bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            {initials || <User className="w-8 h-8" />}
          </div>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}

        {/* Success check */}
        {justUploaded && !uploading && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center animate-in fade-in duration-300">
            <Check className="w-8 h-8 text-green-400" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Camera button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-0.5 -right-0.5 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-gray-100 hover:scale-110 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        title="Change photo"
        aria-label="Change profile photo"
      >
        <Camera className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSelect}
        disabled={uploading}
        className="hidden"
        form=""
      />
    </div>
  );
}
