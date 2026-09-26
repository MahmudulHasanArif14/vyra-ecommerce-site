"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { checkoutSchema } from "@/validations/checkout";
import { validateCoupon } from "@/actions/coupons";
import { getSetting, getNumber } from "@/lib/settings";

import { after } from "next/server";
import {
  sendOrderConfirmation,
  sendAdminOrderNotification,
} from "@/lib/email/send";

type OrderItemInput = {
  variantId: string;
  quantity: number;
};

type CreateOrderInput = {
  customer: any;
  items: OrderItemInput[];
  couponCode?: string | null;
};

function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  const year = new Date().getFullYear();
  return `VYRA-${year}-${suffix}`;
}

export async function createOrder(input: CreateOrderInput) {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Get the logged-in user (null for guests)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("[createOrder] user:", user?.id || "guest", user?.email || "");

  // ============================================================
  // 1. Fetch delivery settings
  // ============================================================
  const deliveryCharge = getNumber(await getSetting("delivery_charge"), 100);
  const freeThreshold = getNumber(
    await getSetting("free_delivery_threshold"),
    5000,
  );

  // ============================================================
  // 2. Validate Customer Data
  // ============================================================
  const validation = checkoutSchema.safeParse(input.customer);
  if (!validation.success) {
    return { success: false, error: "Invalid customer data" };
  }
  const customer = validation.data;

  if (input.items.length === 0) {
    return { success: false, error: "Cart is empty" };
  }

  // ============================================================
  // 3. Fetch Real Product Data
  // ============================================================
  const variantIds = input.items.map((i) => i.variantId);
  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select(
      `
      id, sku, price, stock_quantity, color_name, size_name,
      products (id, name, base_price, is_active)
    `,
    )
    .in("id", variantIds);

  if (variantError || !variants) {
    return { success: false, error: "Failed to fetch products" };
  }

  // ============================================================
  // 4. Validate Stock & Calculate Subtotal
  // ============================================================
  let subtotal = 0;
  const orderItemsToInsert: any[] = [];

  for (const item of input.items) {
    const variant: any = variants.find((v) => v.id === item.variantId);

    if (!variant) {
      return { success: false, error: `Product variant not found` };
    }
    if (!variant.products.is_active) {
      return { success: false, error: `Product is no longer available` };
    }
    if (variant.stock_quantity < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for ${variant.products.name}`,
      };
    }

    const unitPrice = variant.price || variant.products.base_price;
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    orderItemsToInsert.push({
      product_id: variant.products.id,
      variant_id: variant.id,
      product_name: variant.products.name,
      variant_name:
        `${variant.color_name || ""} ${variant.size_name || ""}`.trim(),
      sku: variant.sku,
      unit_price: unitPrice,
      quantity: item.quantity,
      line_total: lineTotal,
    });
  }

  // ============================================================
  // 5. Validate Coupon (AFTER subtotal is known — OUTSIDE the loop)
  // ============================================================
  let discount = 0;
  let couponId: string | null = null;

  if (input.couponCode) {
    const couponResult = await validateCoupon(input.couponCode, subtotal);
    if (couponResult.valid && couponResult.coupon) {
      discount = couponResult.coupon.discount;
      couponId = couponResult.coupon.id;
    } else {
      return {
        success: false,
        error: couponResult.error || "Invalid coupon",
      };
    }
  }

  // ============================================================
  // 6. Calculate Delivery & Final Total
  // ============================================================
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const deliveryFee = discountedSubtotal >= freeThreshold ? 0 : deliveryCharge;
  const total = discountedSubtotal + deliveryFee;

  console.log("[createOrder] totals:", {
    subtotal,
    discount,
    discountedSubtotal,
    deliveryCharge,
    freeThreshold,
    deliveryFee,
    total,
    couponCode: input.couponCode,
  });

  // ============================================================
  // 7. Generate Order Number
  // ============================================================
  const orderNumber = generateOrderNumber();

  // ============================================================
  // 8. Atomic RPC — inserts order + items + address, decrements stock
  // ============================================================
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "create_order_transaction",
    {
      p_order_data: {
        order_number: orderNumber,
        user_id: user?.id || null,
        guest_email: customer.email,
        guest_phone: customer.phone,
        subtotal,
        delivery_fee: deliveryFee,
        discount, // ⭐ NOW PASSED
        total,
        notes: null,
      },
      p_order_items: orderItemsToInsert,
      p_address_data: {
        full_name: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        address_line1: customer.addressLine1,
        city: customer.city,
        postal_code: customer.postalCode || null,
        delivery_notes: customer.deliveryNotes || null,
      },
    },
  );

  if (rpcError) {
    console.error("Order transaction failed:", rpcError);
    return {
      success: false,
      error: rpcError.message || "Checkout failed. Please try again.",
    };
  }

  // ============================================================
  // 9. Increment Coupon Usage (AFTER successful order)
  // ============================================================
  if (couponId) {
    const { error: couponErr } = await supabase.rpc("increment_coupon_usage", {
      coupon_id: couponId,
    });
    if (couponErr) {
      console.error("Failed to increment coupon usage:", couponErr);
      // Don't fail the order — the order was already placed
    }
  }

  // ============================================================
  // 10. Clear Cart Cookie
  // ============================================================
  cookieStore.delete("vyra_cart");

  const emailItems = orderItemsToInsert.map((item) => ({
    product_name: item.product_name,
    variant_name: item.variant_name || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.line_total,
  }));

  after(async () => {
    try {
      await sendOrderConfirmation({
        orderNumber,
        customerEmail: customer.email,
        customerName: customer.fullName,
        items: emailItems,
        subtotal,
        deliveryFee,
        discount,
        total,
        address: {
          full_name: customer.fullName,
          phone: customer.phone,
          address_line1: customer.addressLine1,
          city: customer.city,
          postal_code: customer.postalCode || null,
        },
      });

      await sendAdminOrderNotification({
        orderNumber,
        customerName: customer.fullName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        total,
        itemCount: orderItemsToInsert.length,
      });
    } catch (err) {
      console.error("[createOrder] Background email failed:", err);
    }
  });

  return {
    success: true,
    orderNumber: rpcResult.order_number,
  };
}
