const emailShell = (bodyHtml) => `
<div style="background-color:#f3f4f6;padding:32px 16px;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background-color:#16233c;padding:24px 32px;">
      <span style="color:#e6a92f;font-size:20px;font-weight:800;">Haven Realty</span>
    </div>
    <div style="padding:32px;color:#1f2937;">
      ${bodyHtml}
    </div>
    <div style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        If you didn't request this, you can safely ignore this email. Haven Realty will never ask for your password.
      </p>
    </div>
  </div>
</div>
`;

const passwordResetEmailTemplate = ({ name, resetUrl, expiresInMinutes = 15 }) =>
  emailShell(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#16233c;">Reset your Haven Realty password</h2>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">Hi ${name},</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;">
      We received a request to reset your password. Click the button below to choose a new one.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${resetUrl}" style="display:inline-block;background-color:#16233c;color:#ffffff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
        Reset Password
      </a>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#4b5563;line-height:1.6;">
      Or copy and paste this link into your browser:<br/>
      <a href="${resetUrl}" style="color:#37578a;word-break:break-all;">${resetUrl}</a>
    </p>
    <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
      This link expires in ${expiresInMinutes} minutes. If you didn't request a password reset, please secure your
      account and ignore this email.
    </p>
  `);

module.exports = { passwordResetEmailTemplate };
