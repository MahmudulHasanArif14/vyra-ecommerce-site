import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export const FROM_NAME = process.env.RESEND_FROM_NAME || "VYRA Accessories";

export const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || "admin@vyra.com";

export function fromAddress() {
  return `${FROM_NAME} <${FROM_EMAIL}>`;
}
