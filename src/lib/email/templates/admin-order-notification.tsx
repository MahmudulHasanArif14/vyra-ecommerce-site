type AdminOrderNotificationProps = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  itemCount: number;
  siteUrl: string;
};

export default function AdminOrderNotificationEmail({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  total,
  itemCount,
  siteUrl,
}: AdminOrderNotificationProps) {
  return `
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 8px; overflow: hidden; max-width: 600px;">
                <tr>
                  <td style="background: #000; padding: 24px; text-align: center;">
                    <h1 style="color: #fff; margin: 0; font-size: 18px; letter-spacing: 2px;">
                      🎉 NEW ORDER
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px;">
                    <p style="font-size: 15px; color: #333; margin: 0 0 20px;">
                      A new order has been placed on your store.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9f9f9; border-radius: 6px; padding: 16px;">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666;">Order</td>
                        <td style="padding: 6px 0; font-size: 13px; text-align: right; font-family: monospace; font-weight: 600;">
                          ${orderNumber}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666;">Customer</td>
                        <td style="padding: 6px 0; font-size: 13px; text-align: right;">${customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666;">Email</td>
                        <td style="padding: 6px 0; font-size: 13px; text-align: right;">${customerEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666;">Phone</td>
                        <td style="padding: 6px 0; font-size: 13px; text-align: right;">${customerPhone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666;">Items</td>
                        <td style="padding: 6px 0; font-size: 13px; text-align: right;">${itemCount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0 4px; border-top: 1px solid #ddd; font-size: 16px; color: #000; font-weight: 700;">
                          Total
                        </td>
                        <td style="padding: 10px 0 4px; border-top: 1px solid #ddd; font-size: 16px; color: #000; font-weight: 700; text-align: right;">
                          ৳${total}
                        </td>
                      </tr>
                    </table>

                    <div style="text-align: center; margin-top: 24px;">
                      <a href="${siteUrl}/admin/orders" style="display: inline-block; background: #000; color: #fff; padding: 12px 28px; text-decoration: none; font-size: 13px; letter-spacing: 1.5px; font-weight: 600; border-radius: 4px;">
                        VIEW IN ADMIN
                      </a>
                    </div>
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
