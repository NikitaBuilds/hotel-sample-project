/**
 * Email Configuration with Nodemailer
 * For sending group invitation emails
 */

import nodemailer from "nodemailer";

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create reusable transporter
export const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP credentials not configured");
  }

  return nodemailer.createTransport(emailConfig);
};

// Email sender info
export const emailSender = {
  name: process.env.EMAIL_FROM_NAME || "Ski Trip Planner",
  address: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER,
};
