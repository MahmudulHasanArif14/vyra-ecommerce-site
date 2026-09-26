type OrderItem = {
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type OrderConfirmationProps = {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress: string;
  deliveryTime: string;
  siteUrl: string;
  storeName: string;
};

export default function OrderConfirmationEmail({
  orderNumber,
  customerName,
  orderDate,
  items,
  subtotal,
  deliveryFee,
  discount,
  total,
  deliveryAddress,
  deliveryTime,
  siteUrl,
  storeName,
}: OrderConfirmationProps) {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">
          <strong>${item.product_name}</strong>
          ${item.variant_name ? `<br><span style="color: #888; font-size: 12px;">${item.variant_name}</span>` : ""}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #555; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #000; text-align: right; font-weight: 600;">
          ৳${item.line_total}
        </td>
      </tr>
    `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; max-width: 600px;">

                <!-- Header -->
                <tr>
                  <td style="background: #000; padding: 30px; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 3px; font-weight: 600;">
                      ${storeName.toUpperCase()}
                    </h1>
                  </td>
                </tr>

                <!-- Welcome -->
                <tr>
                  <td style="padding: 40px 40px 20px;">
                    <h2 style="margin: 0 0 12px; font-size: 22px; color: #000;">
                      Thank you, ${customerName}!
                    </h2>
                    <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.6;">
                      We've received your order and it's being processed. You'll receive another email when it ships.
                    </p>
                  </td>
                </tr>

                <!-- Order Info -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <table width="100%" style="background: #f9f9f9; border-radius: 6px; padding: 16px;">
                      <tr>
                        <td style="font-size: 13px; color: #666; padding: 4px 0;">
                          <strong style="color: #000;">Order Number:</strong>
                        </td>
                        <td style="font-size: 13px; color: #000; text-align: right; font-family: monospace; font-weight: 600;">
                          ${orderNumber}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #666; padding: 4px 0;">
                          <strong style="color: #000;">Order Date:</strong>
                        </td>
                        <td style="font-size: 13px; color: #000; text-align: right;">
                          ${orderDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #666; padding: 4px 0;">
                          <strong style="color: #000;">Delivery:</strong>
                        </td>
                        <td style="font-size: 13px; color: #000; text-align: right;">
                          ${deliveryTime}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Items -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <h3 style="margin: 0 0 12px; font-size: 15px; color: #000; letter-spacing: 1px;">
                      ORDER ITEMS
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${itemRows}
                    </table>
                  </td>
                </tr>

                <!-- Totals -->
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #555;">Subtotal</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #000; text-align: right;">৳${subtotal}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #555;">Delivery</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #000; text-align: right;">
                          ${Number(deliveryFee) === 0 ? "FREE" : `৳${deliveryFee}`}
                        </td>
                      </tr>
                      ${
                        discount > 0
                          ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #16a34a;">Discount</td>
                        <td style="padding: 6px 0; font-size: 14px; color: #16a34a; text-align: right;">-৳${discount}</td>
                      </tr>
                      `
                          : ""
                      }
                      <tr>
                        <td style="padding: 12px 0 6px; border-top: 2px solid #000; font-size: 16px; color: #000; font-weight: 700;">
                          Total
                        </td>
                        <td style="padding: 12px 0 6px; border-top: 2px solid #000; font-size: 16px; color: #000; font-weight: 700; text-align: right;">
                          ৳${total}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Delivery Address -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <h3 style="margin: 0 0 8px; font-size: 15px; color: #000; letter-spacing: 1px;">
                      DELIVERY ADDRESS
                    </h3>
                    <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">
                      ${deliveryAddress}
                    </p>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding: 20px 40px 40px; text-align: center;">
                    <a href="${siteUrl}/track-order?order=${orderNumber}" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none; font-size: 13px; letter-spacing: 2px; font-weight: 600; border-radius: 4px;">
                      TRACK YOUR ORDER
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #f9f9f9; padding: 30px 40px; text-align: center; border-top: 1px solid #eee;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: #888;">
                      Questions? Reply to this email or contact us at ${siteUrl.replace("https://", "")}.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #aaa;">
                      © ${new Date().getFullYear()} ${storeName}. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
