import twilio from "twilio";
import { Resend } from "resend";

// Initialize the clients (they will automatically pull from your .env)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSms(toPhone: string, body: string) {
  if (!process.env.TWILIO_PHONE_NUMBER) {
    console.error("Missing TWILIO_PHONE_NUMBER in .env");
    return { success: false };
  }

  try {
    const message = await twilioClient.messages.create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error(`Twilio failed to send to ${toPhone}:`, error);
    return { success: false, error };
  }
}

export async function sendEmail(
  toEmail: string,
  subject: string,
  body: string,
) {
  try {
    // 1. Destructure both data and error from the response
    const { data, error } = await resend.emails.send({
      from: "RepFit <onboarding@resend.dev>", // (Keep your existing 'from' address)
      to: toEmail,
      subject: subject,
      text: body,
    });

    // 2. Check if Resend returned an API error
    if (error) {
      console.error(`Resend API error for ${toEmail}:`, error);
      return { success: false, error };
    }

    // 3. Safely return the ID using the optional chaining operator (?)
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error(`Resend failed to send to ${toEmail}:`, error);
    return { success: false, error };
  }
}
