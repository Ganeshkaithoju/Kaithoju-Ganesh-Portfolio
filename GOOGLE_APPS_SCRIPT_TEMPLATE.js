/**
 * Google Apps Script Backend for WhatsApp Cloud API Integration
 * 
 * Deploy this as a standalone Google Apps Script web app:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Deploy as web app (Execute as: Me, Who has access: Anyone)
 * 5. Copy the deployment URL and set it as VITE_GOOGLE_APPS_SCRIPT_URL in your .env.local
 * 
 * Environment Variables to set in Google Apps Script:
 * - WHATSAPP_PHONE_NUMBER_ID: Your phone number ID from Facebook Business Account
 * - WHATSAPP_ACCESS_TOKEN: Your access token from Facebook Business Account
 * - OWNER_PHONE_NUMBER: Your WhatsApp number (e.g., 7075409339)
 */

// Store these in Google Apps Script Project Settings > Script Properties
function getScriptProperties() {
  return PropertiesService.getScriptProperties();
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validate the request
    if (!data.action || data.action !== "sendWhatsApp") {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: "Invalid action" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Get credentials from script properties
    const props = getScriptProperties();
    const phoneNumberId = props.getProperty("WHATSAPP_PHONE_NUMBER_ID");
    const accessToken = props.getProperty("WHATSAPP_ACCESS_TOKEN");

    if (!phoneNumberId || !accessToken) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          error: "WhatsApp credentials not configured in Google Apps Script",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Send message to WhatsApp Cloud API
    const response = sendWhatsAppMessage(
      data.message,
      phoneNumberId,
      accessToken
    );

    return ContentService.createTextOutput(
      JSON.stringify(response)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error("Error in doPost:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendWhatsAppMessage(message, phoneNumberId, accessToken) {
  try {
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: message.messaging_product,
      to: message.to,
      type: message.type,
      text: {
        body: message.text.body,
      },
    };

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode === 200) {
      const result = JSON.parse(responseText);
      return {
        success: true,
        messageId: result.messages[0].id,
      };
    } else {
      console.error("WhatsApp API Error:", responseText);
      const errorData = JSON.parse(responseText);
      return {
        success: false,
        error: errorData.error?.message || "Failed to send WhatsApp message",
      };
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return {
      success: false,
      error: error.toString(),
    };
  }
}

// Test function (run this from the Apps Script editor to test)
function testWhatsAppIntegration() {
  const testMessage = {
    messaging_product: "whatsapp",
    to: "7075409339",
    type: "text",
    text: {
      body: "📧 Test Message\n\n👤 Name: Test User\n📧 Email: test@example.com\n📝 Subject: Test\n💬 Message:\nThis is a test message",
    },
  };

  const result = sendWhatsAppMessage(
    testMessage,
    PropertiesService.getScriptProperties().getProperty("WHATSAPP_PHONE_NUMBER_ID"),
    PropertiesService.getScriptProperties().getProperty("WHATSAPP_ACCESS_TOKEN")
  );

  Logger.log("Test Result:", JSON.stringify(result));
}

// Additional helper: Use this to configure credentials via web UI
function doGet(e) {
  if (e.parameter.setup === "true") {
    // This endpoint can be used to update credentials securely
    // Only call from a trusted source
    if (e.parameter.token === PropertiesService.getScriptProperties().getProperty("SETUP_TOKEN")) {
      const props = PropertiesService.getScriptProperties();
      props.setProperty("WHATSAPP_PHONE_NUMBER_ID", e.parameter.phoneNumberId);
      props.setProperty("WHATSAPP_ACCESS_TOKEN", e.parameter.accessToken);
      
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: "Credentials updated" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify({ success: false, error: "Invalid request" })
  ).setMimeType(ContentService.MimeType.JSON);
}
