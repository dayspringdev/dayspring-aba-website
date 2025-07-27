// src/lib/emails/templates.ts

import type { EmailDataMap } from "./types";

// The base template function. This creates the consistent wrapper for all emails.
const baseTemplate = (
  title: string,
  content: string,
  preheader?: string
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f8f9fa;">
  ${preheader ? `<span style="display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</span>` : ""}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="40" style="max-width: 600px; width: 100%; margin: 40px auto; background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px;">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <h1 style="font-size: 28px; font-weight: 700; color: #343a40; margin: 0;">Dayspring Behavioural</h1>
              <p style="font-size: 14px; color: #868e96; margin: 4px 0 0;">THERAPEUTIC SERVICES</p>
            </td>
          </tr>
          <tr>
            <td>
              <h2 style="font-size: 24px; font-weight: 600; color: #212529; margin-top: 0;">${title}</h2>
              ${content}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="font-size: 12px; color: #adb5bd; margin: 0;">
                © ${new Date().getFullYear()} Dayspring Behavioural Therapeutic Services. All Rights Reserved.
              </p>
              <p style="font-size: 12px; color: #adb5bd; margin: 4px 0 0;">
                This is an automated email. Please do not reply.
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

// A generic interface for a single template, using a generic type parameter `T` for the data.
interface EmailTemplate<T> {
  subject: (data: T) => string;
  body: (data: T) => string;
}

// A TypeScript Mapped Type.
type TemplatesObject = {
  [K in keyof EmailDataMap]: EmailTemplate<EmailDataMap[K]>;
};

// The main templates object.
export const templates: TemplatesObject = {
  // --- Admin Notifications ---
  adminNewBookingNotice: {
    subject: (data) =>
      `New Consultation Request: ${data.firstName} ${data.lastName}`,
    body: (data) => {
      const title = "New Consultation Request";
      const content = `
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">
            A new consultation has been requested with status: <strong>${data.status.toUpperCase()}</strong>.
          </p>
          <ul style="font-size: 16px; color: #495057; line-height: 1.6; list-style-type: none; padding: 15px; margin: 0; border-left: 4px solid #eee;">
            <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Requested Time:</strong> ${data.formattedDate}</li>
            <li><strong>Notes:</strong> ${data.notes || "N/A"}</li>
          </ul>
          <p style="font-size: 14px; color: #868e96; margin: 4px 0 0;">*This is an automated notification. Please do not reply to this email.*</p>
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
            <tr>
              <td align="center">
                <a href="${data.adminLink}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; background-color: hsl(210, 35%, 45%); border-radius: 8px;">
                  View in Admin Panel
                </a>
              </td>
            </tr>
          </table>
        `;
      return baseTemplate(title, content);
    },
  },

  // --- Client-Facing Emails ---
  bookingRequestUser: {
    subject: () => "Consultation Request Received - Dayspring BTS",
    body: (data) => {
      const title = "Request Received!";
      const preheader = `We've received your request for a consultation on ${data.formattedDate}.`;
      const content = `
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">Hi ${data.firstName},</p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">
            Thank you for your request! We've received your request for a consultation on <strong>${data.formattedDate}</strong>.
          </p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">
            Our team will review it shortly and send a separate confirmation email once it's approved. We look forward to speaking with you!
          </p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">*This is an automated notification. Please do not reply to this email. For any questions, please contact us through the website.*</p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">Sincerely,<br>The Dayspring Team</p>
        `;
      return baseTemplate(title, content, preheader);
    },
  },

  bookingConfirmed: {
    subject: () => "Your Consultation is Confirmed!",
    body: (data) => {
      const title = "Booking Confirmed";
      const preheader = `Your consultation is confirmed for ${data.formattedDate}.`;
      const content = `
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">Hi ${data.firstName},</p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">
            Great news! Your consultation with Dayspring Behavioural Therapeutic Services is confirmed for <strong>${data.formattedDate}</strong>.
          </p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">
            We look forward to speaking with you. If you have any questions before then, please visit our website at and use the contact form!
          </p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">*This is an automated notification. Please do not reply to this email.*</p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">Sincerely,<br>The Dayspring Team</p>
        `;
      return baseTemplate(title, content, preheader);
    },
  },

  bookingCancelled: {
    subject: () => "Your Consultation Has Been Cancelled",
    body: (data) => {
      const title = "Booking Cancelled";
      const preheader = "Your consultation with Dayspring has been cancelled.";
      const content = `
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">Hi ${data.firstName},</p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">
            This is a notification that your consultation with Dayspring Behavioural Therapeutic Services has been cancelled.
          </p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">
            If you believe this was in error, or if you would like to schedule a new time, please visit our booking page. We apologize for any inconvenience.
          </p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">*This is an automated notification. Please do not reply to this email. For any questions, please contact us through the website.*</p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">Sincerely,<br>The Dayspring Team</p>
        `;
      return baseTemplate(title, content, preheader);
    },
  },

  bookingRescheduled: {
    subject: () => "Your Consultation Has Been Rescheduled",
    body: (data) => {
      const title = "Booking Rescheduled";
      const preheader = `Your consultation has been rescheduled to ${data.formattedDate}.`;
      const content = `
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">Hi ${data.firstName},</p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">
            Please note that your consultation with Dayspring Behavioural Therapeutic Services has been rescheduled to a new time: <strong>${data.formattedDate}</strong>.
          </p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">
            This new time is confirmed. We look forward to speaking with you then.
          </p>
           <p style="font-size: 16px; color: #495057; line-height: 1.6;">*This is an automated notification. Please do not reply to this email. For any questions, please contact us through the website.*</p>
          <p style="font-size: 16px; color: #495057; line-height: 1.6;">Sincerely,<br>The Dayspring Team</p>
        `;
      return baseTemplate(title, content, preheader);
    },
  },

  contactFormToBusiness: {
    subject: (data) =>
      `New Contact Message from ${data.firstName} ${data.lastName}`,
    body: (data) => {
      const title = "New Website Message";
      const content = `
            <p style="font-size: 16px; color: #495057; line-height: 1.6;">
              You have received a new message from your website's contact form.
            </p>
            <ul style="font-size: 16px; color: #495057; line-height: 1.6; list-style-type: none; padding: 15px; margin:0; border-left: 4px solid #eee;">
              <li><strong>Name:</strong> ${data.firstName} ${data.lastName}</li>
              <li><strong>Email:</strong> ${data.email}</li>
              <li><strong>Phone:</strong> ${data.phone || "Not provided"}</li>
            </ul>
            <h3 style="font-size: 18px; font-weight: 600; color: #212529; margin-top: 20px;">Message:</h3>
            <p style="font-size: 16px; color: #495057; line-height: 1.6; padding: 15px; margin: 0; border-left: 4px solid #eee; white-space: pre-wrap;">${data.message.replace(/\n/g, "<br>")}</p>
          `;
      return baseTemplate(title, content);
    },
  },

  contactFormAutoReply: {
    subject: () => "We've Received Your Message!",
    body: (data) => {
      const title = "Thank You For Reaching Out!";
      const preheader =
        "We've received your message, and someone will be in contact soon!";
      const content = `
            <p style="font-size: 16px; color: #495057; line-height: 1.6;">Hi ${data.firstName},</p>
            <p style="font-size: 16px; color: #495057; line-height: 1.6;">
              This is an automated confirmation that we have successfully received your message. Our team will review it and get back to you as soon as possible.
            </p>
            <p style="font-size: 16px; color: #495057; line-height: 1.6;">*This is an automated notification. Please do not reply to this email. For any questions, please contact us through the website.*</p>
            <p style="font-size: 16px; color: #495057; line-height: 1.6;">Sincerely,<br>The Dayspring Team</p>
          `;
      return baseTemplate(title, content, preheader);
    },
  },
};
