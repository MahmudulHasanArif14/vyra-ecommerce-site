type PasswordResetEmailProps = {
  resetUrl: string;
  customerName: string;
  storeName: string;
};

export default function PasswordResetEmail({
  resetUrl,
  customerName,
  storeName,
}: PasswordResetEmailProps) {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px;">
              <tr>
                <td style="background:#000;padding:30px;text-align:center;">
                  <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:3px;font-weight:600;">
                    ${storeName.toUpperCase()}
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <h2 style="margin:0 0 16px;font-size:22px;color:#000;">
                    Reset your password
                  </h2>
                  <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
                    Hi ${customerName || "there"}, we received a request to reset your password.
                    Click the button below to choose a new one.
                  </p>
                  <p style="margin:0 0 32px;color:#555;font-size:15px;line-height:1.6;">
                    This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.
                  </p>
                  <div style="text-align:center;">
                    <a href="${resetUrl}" style="display:inline-block;background:#000;color:#fff;padding:16px 36px;text-decoration:none;font-size:13px;letter-spacing:2px;font-weight:600;border-radius:4px;">
                      RESET PASSWORD
                    </a>
                  </div>
                  <p style="margin:32px 0 0;color:#888;font-size:12px;line-height:1.6;">
                    Or copy this link into your browser:<br>
                    <span style="color:#555;word-break:break-all;">${resetUrl}</span>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
                  <p style="margin:0;font-size:11px;color:#aaa;">
                    © ${new Date().getFullYear()} ${storeName}. If you didn't request this, ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>
  `;
}
