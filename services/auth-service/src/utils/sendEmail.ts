import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text }: SendEmailOptions) => {
  await transporter.sendMail({
    from: `"Macrology" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};