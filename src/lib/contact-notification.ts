export interface ContactNotificationPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Sends contact notification to Google Apps Script Web App for free email delivery.
 * Uses text/plain to prevent CORS pre-flight failures on Google Apps Script endpoints.
 */
export async function sendContactNotification(
  payload: ContactNotificationPayload,
  scriptUrl: string
): Promise<void> {
  if (!scriptUrl || !scriptUrl.trim()) return;

  try {
    await fetch(scriptUrl.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      mode: "no-cors", // Ensures request completes cleanly without browser CORS blocking
    });
  } catch (err) {
    console.warn("Contact notification dispatch warning:", err);
  }
}
