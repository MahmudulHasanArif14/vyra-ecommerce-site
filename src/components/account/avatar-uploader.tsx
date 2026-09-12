"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, User, Loader2 } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setImgError(false);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatar(formData);

    if (result.success) {
      toast.success("Avatar updated");
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
    <div className="relative">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50">
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
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
            {initials || <User className="w-8 h-8" />}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition disabled:bg-gray-400"
        title="Change photo"
      >
        <Camera className="w-4 h-4" />
      </button>

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
