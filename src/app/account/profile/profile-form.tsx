"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfile } from "@/actions/account";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Check, Save } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 10,
      "Phone number must be at least 10 digits",
    ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm({
  profile,
}: {
  profile: { full_name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      phone: profile.phone,
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("full_name", data.full_name);
    if (data.phone) formData.append("phone", data.phone);

    const result = await updateProfile(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Profile updated");
      reset(data); // reset form to new values (makes isDirty false)
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update profile");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5"
    >
      {/* Full Name */}
      <div>
        <label className="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            {...register("full_name")}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition"
            placeholder="John Doe"
          />
        </div>
        {errors.full_name && (
          <p className="text-red-400 text-xs mt-1.5">
            {errors.full_name.message}
          </p>
        )}
      </div>

      {/* Email — read-only */}
      <div>
        <label className="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
          <input
            value={profile.email}
            disabled
            className="w-full bg-white/[0.02] border border-white/5 text-gray-500 rounded-lg pl-11 pr-4 py-3 text-sm cursor-not-allowed"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-gray-600">
            Locked
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1.5">
          Email cannot be changed. Contact support if needed.
        </p>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            {...register("phone")}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition"
            placeholder="+880 1700-000000"
          />
        </div>
        {errors.phone && (
          <p className="text-red-400 text-xs mt-1.5">{errors.phone.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1.5">
          Used for delivery updates
        </p>
      </div>

      {/* Submit */}
      <div className="pt-2 flex items-center gap-4 flex-wrap">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className={`px-6 py-3 rounded-lg text-xs tracking-[0.2em] font-medium transition-all duration-300 flex items-center gap-2 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-white text-black hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
          }`}
        >
          {saved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              SAVED
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
            </>
          )}
        </button>

        {!isDirty && !saved && (
          <p className="text-xs text-gray-500">
            Make a change to enable saving
          </p>
        )}
      </div>
    </form>
  );
}
