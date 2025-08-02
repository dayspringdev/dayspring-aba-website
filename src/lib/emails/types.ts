// src/lib/emails/types.ts

// 1. Define the data shape for each specific email template.

export interface AdminNewBookingNoticeData {
  firstName: string;
  lastName: string;
  email: string;
  notes?: string;
  formattedDate: string;
  status: "pending" | "confirmed" | "cancelled";
  adminLink: string;
}

export interface BookingRequestUserData {
  firstName: string;
  formattedDate: string;
}

export interface BookingConfirmedData {
  bookingId: number;
  firstName: string;
  lastName: string;
  email: string;
  slotTime: string;
  notes: string | null;
  formattedDate: string;
  businessEmail: string; // Add business email
}

export interface BookingCancelledData {
  firstName: string;
}

export interface BookingRescheduledData {
  bookingId: number;
  firstName: string;
  lastName: string;
  email: string;
  slotTime: string;
  notes: string | null;
  formattedDate: string;
  businessEmail: string; // Add business email
}

export interface ContactFormToBusinessData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactFormAutoReplyData {
  firstName: string;
}

// 2. Create a "map" that connects the template name (string) to its data type.
// This is the key to our type-safe generic function later.
export interface EmailDataMap {
  adminNewBookingNotice: AdminNewBookingNoticeData;
  bookingRequestUser: BookingRequestUserData;
  bookingConfirmed: BookingConfirmedData;
  bookingCancelled: BookingCancelledData;
  bookingRescheduled: BookingRescheduledData;
  contactFormToBusiness: ContactFormToBusinessData;
  contactFormAutoReply: ContactFormAutoReplyData;
}

// 3. Define a type for our valid email template names.
export type EmailType = keyof EmailDataMap;
