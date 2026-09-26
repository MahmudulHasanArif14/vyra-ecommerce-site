"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { changePassword } from "@/actions/account";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Check } from "lucide-react";

const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function PasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const password = watch("password") || "";
  const confirmPassword = watch("confirm_password") || "";

  // Password strength
  const getStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    if (pwd.length < 6)
      return { level: 1, label: "Too short", color: "bg-red-500" };
    if (pwd.length < 10)
      return { level: 2, label: "Weak", color: "bg-amber-500" };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && pwd.length >= 10)
      return { level: 4, label: "Strong", color: "bg-green-500" };
    return { level: 3, label: "Good", color: "bg-blue-500" };
  };

  const strength = getStrength(password);
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;

  const onSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("password", data.password);
    formData.append("confirm_password", data.confirm_password);

    const result = await changePassword(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Password changed successfully");
      reset();
    } else {
      toast.error(result.error || "Failed to change password");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5"
    >
      {/* New Password */}
      <div>
        <label className="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition"
            placeholder="At least 6 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Strength meter */}
        {password && (
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${strength.color}`}
                style={{ width: `${(strength.level / 4) * 100}%` }}
              />
            </div>
            <span
              className={`text-[10px] uppercase tracking-wider font-medium ${
                strength.level >= 3
                  ? "text-green-400"
                  : strength.level === 2
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {strength.label}
            </span>
          </div>
        )}

        {errors.password && (
          <p className="text-red-400 text-xs mt-1.5">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            {...register("confirm_password")}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition"
            placeholder="Re-enter password"
          />

          {/* Match indicator */}
          {passwordsMatch && (
            <span className="absolute right-11 top-1/2 -translate-y-1/2 text-green-400">
              <Check className="w-4 h-4" />
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition p-1"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.confirm_password && (
          <p className="text-red-400 text-xs mt-1.5">
            {errors.confirm_password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2 flex items-center gap-4 flex-wrap">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-black px-6 py-3 rounded-lg text-xs tracking-[0.2em] font-medium hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 transition-all duration-300 flex items-center gap-2"
        >
          <Lock className="w-3.5 h-3.5" />
          {isSubmitting ? "UPDATING..." : "UPDATE PASSWORD"}
        </button>

        <p className="text-xs text-gray-500">
          Use 10+ characters with uppercase and numbers for a strong password.
        </p>
      </div>
    </form>
  );
}
