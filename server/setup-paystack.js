cat > /tmp/bp2/utils/email.js << 'EOF'
// ============================================================
// utils/email.js — SendGrid email service with HTML templates
// ============================================================
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM = {
  email: process.env.EMAIL_FROM       || "no-reply@chopchooo.com",
  name:  process.env.EMAIL_FROM_NAME  || "Chopchooo Food Deliveries",
};

// ── Base HTML Layout ─────────────────────────────────────────
const baseTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body{margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;}
    .wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;
             overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);}
    .header{background:linear-gradient(135deg,#e8430a,#f97316);padding:36px 40px;text-align:center;}
    .header h1{margin:0;color:#fff;font-size:26px;font-weight:700;}
    .header p{margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;}
    .body{padding:40px;color:#374151;line-height:1.7;font-size:15px;}
    .body h2{color:#111827;font-size:20px;margin-top:0;}
    .btn{display:inline-block;margin:24px 0;padding:14px 32px;background:#e8430a;
         color:#fff!important;text-decoration:none;border-radius:8px;
         font-weight:600;font-size:15px;}
    .btn-green{background:#10b981;}
    .btn-red{background:#ef4444;}
    .info-box{background:#fff7ed;border-left:4px solid #e8430a;padding:16px 20px;
              border-radius:0 8px 8px 0;margin:20px 0;}
    .amount{font-size:32px;font-weight:700;color:#10b981;}
    .divider{border:none;border-top:1px solid #e5e7eb;margin:24px 0;}
    .footer{background:#f8fafc;padding:24px 40px;text-align:center;
            color:#9ca3af;font-size:13px;border-top:1px solid #e5e7eb;}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🍔 Chopchooo</h1>
      <p>${title}</p>
    </div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Chopchooo Food Deliveries. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
// ── Core send helper ─────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  const msg = {
    to,
    from: FROM,
    subject,
    html,
  };
  const info = await sgMail.send(msg);
  console.log(`📧 Email sent to ${to}: ${subject}`);
  return info;
};

// ============================================================
// 1. Email Verification
// ============================================================
const sendVerificationEmail = (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendEmail({
    to:      user.email,
    subject: "Verify your Chopchooo account",
    html: baseTemplate("Verify Your Email", `
      <h2>Hi ${user.firstName}! 👋</h2>
      <p>Welcome to <strong>Chopchooo</strong>. Click below to verify your email and activate your account.</p>
      <center><a href="${url}" class="btn">Verify Email Address</a></center>
      <div class="info-box">⏰ This link expires in <strong>24 hours</strong>.</div>
    `),
  });
};

// ============================================================
// 2. Welcome Email
// ============================================================
const sendWelcomeEmail = (user) =>
  sendEmail({
    to:      user.email,
    subject: "Welcome to Chopchooo! 🎉",
    html: baseTemplate("You're in!", `
      <h2>Hey ${user.firstName}, welcome aboard! 🎊</h2>
      <p>Your account is verified and pending admin approval. We'll notify you once you're approved.</p>
      <center><a href="${process.env.CLIENT_URL}/login" class="btn btn-green">Go to Login</a></center>
    `),
  });

// ============================================================
// 3. Password Reset
// ============================================================
const sendPasswordResetEmail = (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendEmail({
    to:      user.email,
    subject: "Reset your Chopchooo password",
    html: baseTemplate("Password Reset", `
      <h2>Reset your password</h2>
      <p>Hi <strong>${user.firstName}</strong>, click below to reset your password.</p>
      <center><a href="${url}" class="btn btn-red">Reset Password</a></center>
      <div class="info-box">⏰ This link expires in <strong>1 hour</strong>. If you didn't request this, ignore it.</div>
    `),
  });
};

// ============================================================
// 4. Account Approved
// ============================================================
const sendAccountApprovedEmail = (user) =>
  sendEmail({
    to:      user.email,
    subject: "Your Chopchooo account is approved ✅",
    html: baseTemplate("Account Approved", `
      <h2>Great news, ${user.firstName}! 🎉</h2>
      <p>Your account has been <strong>approved</strong>. You now have full access.</p>
      <center><a href="${process.env.CLIENT_URL}/login" class="btn btn-green">Login Now</a></center>
    `),
  });

// ============================================================
// 5. Account Rejected
// ============================================================
const sendAccountRejectedEmail = (user, reason) =>
  sendEmail({
    to:      user.email,
    subject: "Update on your Chopchooo application",
    html: baseTemplate("Application Update", `
      <h2>Hi ${user.firstName},</h2>
      <p>We couldn't approve your account at this time.</p>
      ${reason ? `<div class="info-box"><strong>Reason:</strong> ${reason}</div>` : ""}
      <p>Contact us at <a href="mailto:support@chopchooo.com">support@chopchooo.com</a> with any questions.</p>
    `),
  });

// ============================================================
// 6. Payment Success (MoMo / Card)
// ============================================================
const sendPaymentSuccessEmail = (user, payment) => {
  const units = { NGN: "₦", GHS: "GH₵", USD: "$", ZAR: "R", KES: "KSh" };
  const symbol = units[payment.currency] || "";
  const amount = (payment.amount / 100).toFixed(2);
  const isMomo = ["mobile_money", "mobile_money_ghana", "mobile_money_kenya"].includes(payment.channel);

  return sendEmail({
    to:      user.email,
    subject: `Payment confirmed — ${symbol}${amount}`,
    html: baseTemplate("Payment Successful ✅", `
      <h2>Payment Confirmed! ✅</h2>
      <p>Hi <strong>${user.firstName}</strong>, your payment was processed successfully.</p>
      <hr class="divider"/>
      <center><div class="amount">${symbol}${amount} ${payment.currency}</div></center>
      <div class="info-box">
        <strong>Reference:</strong> ${payment.paystackReference}<br/>
        <strong>Channel:</strong> ${isMomo ? "📱 Mobile Money" : "💳 Card"} ${payment.channel ? `(${payment.channel})` : ""}<br/>
        ${payment.last4 ? `<strong>Card:</strong> **** **** **** ${payment.last4}<br/>` : ""}
        ${payment.bank  ? `<strong>Bank:</strong> ${payment.bank}<br/>` : ""}
        <strong>Date:</strong> ${new Date().toLocaleString()}<br/>
        ${payment.description ? `<strong>Description:</strong> ${payment.description}` : ""}
      </div>
      <center><a href="${process.env.CLIENT_URL}/dashboard/orders" class="btn btn-green">View Order</a></center>
    `),
  });
};

// ============================================================
// 7. Payment Failed
// ============================================================
const sendPaymentFailedEmail = (user, amountKobo, currency = "NGN") => {
  const units = { NGN: "₦", GHS: "GH₵", USD: "$", ZAR: "R", KES: "KSh" };
  const symbol = units[currency] || "";
  return sendEmail({
    to:      user.email,
    subject: "Payment failed — Action required",
    html: baseTemplate("Payment Failed ❌", `
      <h2>Payment Unsuccessful ❌</h2>
      <p>Hi <strong>${user.firstName}</strong>, your payment of <strong>${symbol}${(amountKobo / 100).toFixed(2)}</strong> could not be completed.</p>
      <div class="info-box">Common reasons: insufficient funds, wrong PIN, or network timeout.</div>
      <center><a href="${process.env.CLIENT_URL}/checkout" class="btn btn-red">Retry Payment</a></center>
    `),
  });
};

// ============================================================
// 8. Refund Processed
// ============================================================
const sendRefundEmail = (user, payment) => {
  const units = { NGN: "₦", GHS: "GH₵", USD: "$", ZAR: "R", KES: "KSh" };
  const symbol = units[payment.currency] || "";
  return sendEmail({
    to:      user.email,
    subject: `Refund processed — ${symbol}${(payment.refundAmount / 100).toFixed(2)}`,
    html: baseTemplate("Refund Confirmed 💸", `
      <h2>Refund Processed 💸</h2>
      <p>Hi <strong>${user.firstName}</strong>, your refund has been initiated.</p>
      <div class="info-box">
        <strong>Refund Amount:</strong> ${symbol}${(payment.refundAmount / 100).toFixed(2)}<br/>
        <strong>Original Reference:</strong> ${payment.paystackReference}<br/>
        <strong>Processing Time:</strong> 3–5 business days
      </div>
    `),
  });
};

// ============================================================
// 9. Password Changed
// ============================================================
const sendPasswordChangedEmail = (user) =>
  sendEmail({
    to:      user.email,
    subject: "Your password has been changed",
    html: baseTemplate("Password Changed 🔐", `
      <h2>Password Updated</h2>
      <p>Hi <strong>${user.firstName}</strong>, your password was changed successfully.</p>
      <div class="info-box">If this wasn't you, secure your account immediately.</div>
      <center><a href="${process.env.CLIENT_URL}/forgot-password" class="btn btn-red">Secure My Account</a></center>
    `),
  });

// ============================================================
// 10. Profile Updated
// ============================================================
const sendProfileUpdatedEmail = (user) =>
  sendEmail({
    to:      user.email,
    subject: "Your profile was updated",
    html: baseTemplate("Profile Updated ✏️", `
      <h2>Profile Updated</h2>
      <p>Hi <strong>${user.firstName}</strong>, your profile was recently updated.</p>
      <center><a href="${process.env.CLIENT_URL}/dashboard/profile" class="btn">View Profile</a></center>
    `),
  });

// ============================================================
// 11. Order Confirmation (real-time fallback)
// ============================================================
const sendOrderConfirmationEmail = (user, order) =>
  sendEmail({
    to:      user.email,
    subject: `Order confirmed — #${order.reference}`,
    html: baseTemplate("Order Confirmed 🍔", `
      <h2>Your order is confirmed! 🎉</h2>
      <p>Hi <strong>${user.firstName}</strong>, we've received your order and it's being prepared.</p>
      <div class="info-box">
        <strong>Order ID:</strong> #${order.reference}<br/>
        <strong>Amount:</strong> ${order.amount}<br/>
        <strong>Estimated Time:</strong> 25–40 minutes
      </div>
      <center><a href="${process.env.CLIENT_URL}/orders/${order.reference}" class="btn btn-green">Track Order</a></center>
    `),
  });

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendRefundEmail,
  sendPasswordChangedEmail,
  sendProfileUpdatedEmail,
  sendOrderConfirmationEmail,
};
EOF
 "email.js written"