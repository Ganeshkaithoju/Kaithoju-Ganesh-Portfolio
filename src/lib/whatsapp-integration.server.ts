/**
 * WhatsApp Cloud API Integration
 * Sends contact form messages to WhatsApp Cloud API via Google Apps Script backend
 */

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface WhatsAppMessage {
  messaging_product: string;
  to: string;
  type: string;
  text: {
    body: string;
  };
}

/**
 * Sends a contact form submission to WhatsApp Cloud API via Google Apps Script
 * @param contact - Contact form data
 * @param gasUrl - Google Apps Script deployment URL
 * @returns Promise with the API response
 */
export async function sendToWhatsApp(
  contact: ContactMessage,
  gasUrl: string
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    // Format the message for WhatsApp
    const whatsappMessage = formatContactMessageForWhatsApp(contact);

    // Call Google Apps Script to forward to WhatsApp Cloud API
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "sendWhatsApp",
        message: whatsappMessage,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        messageId: result.messageId,
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to send WhatsApp message",
      };
    }
  } catch (error) {
    console.error("WhatsApp integration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Formats contact form data into WhatsApp message format
 */
function formatContactMessageForWhatsApp(contact: ContactMessage): WhatsAppMessage {
  const messageBody = `📧 New Contact Form Submission\n\n` +
    `👤 Name: ${contact.name}\n` +
    `📧 Email: ${contact.email}\n` +
    `📝 Subject: ${contact.subject}\n` +
    `💬 Message:\n${contact.message}`;

  return {
    messaging_product: "whatsapp",
    to: "7075409339", // Your WhatsApp number (without +91)
    type: "text",
    text: {
      body: messageBody,
    },
  };
}
