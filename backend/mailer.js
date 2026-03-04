import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOrderConfirmation({ to, orderId }) {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: "Order received",
    text: `Thank you! Your order ID is ${orderId}.`,
  });
}
