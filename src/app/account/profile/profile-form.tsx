"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfile } from "@/actions/account";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

  const {
    register,
    handleSubmit,
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
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update profile");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-lg border space-y-4"
    >
      <h2 className="font-bold mb-2">Personal Information</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          {...register("full_name")}
          className="w-full border p-3 rounded-md"
          placeholder="John Doe"
        />
        {errors.full_name && (
          <p className="text-red-500 text-xs mt-1">
            {errors.full_name.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          value={profile.email}
          disabled
          className="w-full border p-3 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">
          Email cannot be changed. Contact support if needed.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone Number</label>
        <input
          {...register("phone")}
          className="w-full border p-3 rounded-md"
          placeholder="+880 1700-000000"
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">Used for delivery updates</p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="bg-black text-white px-6 py-3 text-xs tracking-widest rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </div>
    </form>
  );
}
