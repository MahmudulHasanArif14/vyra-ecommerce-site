import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  addressLine1: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Area is required"),
  postalCode: z.string().optional(),
  deliveryNotes: z.string().optional(),
  paymentMethod: z.enum(["cash_on_delivery"]), // Extensible for future
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
