import { resend, fromAddress, ADMIN_EMAIL } from "./client";
import OrderConfirmationEmail from "./templates/order-confirmation";
import AdminOrderNotificationEmail from "./templates/admin-order-notification";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vyra.com";
const STORE_NAME = process.env.RESEND_FROM_NAME || "VYRA Accessories";
const DELIVERY_TIME = "3-5 business days";

type SendOrderConfirmationParams = {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: {
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  address: {
    full_name: string;
    phone: string;
    address_line1: string;
    city: string;
    postal_code?: string | null;
  };
};

export async function sendOrderConfirmation(
  params: SendOrderConfirmationParams,
) {
  try {
    const addressString = `${params.address.full_name}, ${params.address.phone}, ${params.address.address_line1}, ${params.address.city}${params.address.postal_code ? `, ${params.address.postal_code}` : ""}`;

    const html = OrderConfirmationEmail({
      orderNumber: params.orderNumber,
      customerName: params.customerName || "Customer",
      orderDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      items: params.items,
      subtotal: params.subtotal,
      deliveryFee: params.deliveryFee,
      discount: params.discount,
      total: params.total,
      deliveryAddress: addressString,
      deliveryTime: DELIVERY_TIME,
      siteUrl: SITE_URL,
      storeName: STORE_NAME,
    });

    const { data, error } = await resend.emails.send({
      from: fromAddress(),
      to: params.customerEmail,
      subject: `Order Confirmed — ${params.orderNumber}`,
      html,
    });

    if (error) {
      console.error("[sendOrderConfirmation] Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log("[sendOrderConfirmation] sent:", data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[sendOrderConfirmation] unexpected:", err);
    return { success: false, error: "Failed to send email" };
  }
}

type SendAdminNotificationParams = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  itemCount: number;
};

export async function sendAdminOrderNotification(
  params: SendAdminNotificationParams,
) {
  try {
    const html = AdminOrderNotificationEmail({
      orderNumber: params.orderNumber,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      total: params.total,
      itemCount: params.itemCount,
      siteUrl: SITE_URL,
    });

    const { data, error } = await resend.emails.send({
      from: fromAddress(),
      to: ADMIN_EMAIL,
      subject: `🎉 New Order ${params.orderNumber} — ৳${params.total}`,
      html,
    });

    if (error) {
      console.error("[sendAdminNotification] Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log("[sendAdminNotification] sent:", data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[sendAdminNotification] unexpected:", err);
    return { success: false, error: "Failed to send email" };
  }
}
