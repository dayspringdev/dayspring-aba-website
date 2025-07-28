// src/lib/emails/send.ts

import { Resend } from "resend";
import { templates } from "./templates";
// Import our new type definitions
import type { EmailDataMap, EmailType } from "./types";

const resend = new Resend(process.env.RESEND_API_KEY);

// Define a type for the payload that is also generic
type EmailPayload<T extends EmailType> = {
  to: string | string[];
  data: EmailDataMap[T]; // The magic: data MUST match the type
  replyTo?: string;
};

// Make the function generic
export async function sendEmail<T extends EmailType>(
  type: T,
  payload: EmailPayload<T>
): Promise<void> {
  const { to, data, replyTo } = payload;

  const template = templates[type];
  if (!template) {
    throw new Error(`Email template "${type}" not found.`);
  }

  const fromAddress =
    type.startsWith("admin") || type.startsWith("contactFormToBusiness")
      ? "DBTS Website <alerts@dayspringaba.ca>"
      : "Dayspring BTS <no-reply@dayspringaba.ca>";

  try {
    // We are deliberately disabling the 'no-explicit-any' rule for these two
    // lines. We have already ensured type safety at the function's public
    // interface with generics. TypeScript, however, cannot infer the connection
    // between the generic `type` and the `data` within the function body.
    // This is a standard and safe way to handle this specific TS limitation.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subject = template.subject(data as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html = template.body(data as any);

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: to,
      subject: subject,
      html: html,
      // FIX: Corrected from `reply_to` to `replyTo` to match the Resend SDK
      replyTo: replyTo,
    });

    if (error) {
      console.error(`Resend error for email type "${type}":`, error);
      // We can also log the full response for more details if needed
      // console.error(error.message, error.name);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } catch (error) {
    console.error(`Error processing email type "${type}":`, error);
    // Re-throw the error to be handled by the calling API route
    throw error;
  }
}
