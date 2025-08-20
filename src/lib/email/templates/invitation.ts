/**
 * Email Templates for Group Invitations
 * Modern, responsive HTML email templates
 */

import type { InvitationEmailData } from "@/services/group/invitations/types";

export const generateInvitationEmailHTML = (
  data: InvitationEmailData
): string => {
  const {
    inviterName,
    groupName,
    groupDescription,
    checkInDate,
    checkOutDate,
    invitationUrl,
    expiresAt,
    personalMessage,
  } = data;

  // Format dates nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatExpiry = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join ${groupName}!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .header p { font-size: 18px; opacity: 0.9; }
    .content { padding: 40px 30px; }
    .trip-card { background: #f1f5f9; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #667eea; }
    .trip-dates { display: flex; justify-content: space-between; margin: 16px 0; }
    .date-item { text-align: center; flex: 1; }
    .date-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; }
    .date-value { font-size: 16px; font-weight: 600; color: #1e293b; margin-top: 4px; }
    .message-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .message-box p { color: #92400e; font-style: italic; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0; transition: background 0.2s; }
    .cta-button:hover { background: #5a67d8; }
    .footer { background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 14px; color: #64748b; margin: 4px 0; }
    .expiry-notice { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin: 16px 0; }
    .expiry-notice p { color: #dc2626; font-size: 14px; }
    @media (max-width: 600px) {
      .container { margin: 0 16px; }
      .header, .content { padding: 24px 20px; }
      .trip-dates { flex-direction: column; gap: 12px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎿 You're Invited!</h1>
      <p>Join us for an awesome ski trip</p>
    </div>
    
    <div class="content">
      <p>Hey there! 👋</p>
      <p><strong>${inviterName}</strong> has invited you to join their ski trip planning group:</p>
      
      <div class="trip-card">
        <h2 style="color: #1e293b; margin-bottom: 8px;">${groupName}</h2>
        ${
          groupDescription
            ? `<p style="color: #64748b; margin-bottom: 16px;">${groupDescription}</p>`
            : ""
        }
        
        <div class="trip-dates">
          <div class="date-item">
            <div class="date-label">Check In</div>
            <div class="date-value">${formatDate(checkInDate)}</div>
          </div>
          <div class="date-item">
            <div class="date-label">Check Out</div>
            <div class="date-value">${formatDate(checkOutDate)}</div>
          </div>
        </div>
      </div>

      ${
        personalMessage
          ? `
        <div class="message-box">
          <p><strong>Personal message from ${inviterName}:</strong></p>
          <p>"${personalMessage}"</p>
        </div>
      `
          : ""
      }

      <p>Ready to hit the slopes together? Join the group to:</p>
      <ul style="margin: 16px 0 16px 24px; color: #4b5563;">
        <li>🏨 Vote on hotels and accommodations</li>
        <li>💬 Chat with your trip buddies</li>
        <li>📅 Coordinate dates and activities</li>
        <li>💰 Track group expenses</li>
      </ul>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${invitationUrl}" class="cta-button">Accept Invitation</a>
      </div>

      <div class="expiry-notice">
        <p><strong>⏰ This invitation expires on ${formatExpiry(
          expiresAt
        )}</strong></p>
      </div>

      <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
        If you can't make it, no worries! Just ignore this email and the invitation will expire automatically.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Ski Trip Planner</strong></p>
      <p>Making group ski trips easier, one slope at a time ⛷️</p>
      <p style="margin-top: 16px;">
        <a href="${invitationUrl}" style="color: #667eea;">View Invitation</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

export const generateInvitationEmailText = (
  data: InvitationEmailData
): string => {
  const {
    inviterName,
    groupName,
    groupDescription,
    checkInDate,
    checkOutDate,
    invitationUrl,
    expiresAt,
    personalMessage,
  } = data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatExpiry = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return `
🎿 You're Invited to Join ${groupName}!

Hey there!

${inviterName} has invited you to join their ski trip planning group: ${groupName}

${groupDescription ? `About this trip: ${groupDescription}` : ""}

Trip Dates:
• Check In: ${formatDate(checkInDate)}
• Check Out: ${formatDate(checkOutDate)}

${
  personalMessage
    ? `Personal message from ${inviterName}: "${personalMessage}"`
    : ""
}

Ready to hit the slopes together? Join the group to:
• 🏨 Vote on hotels and accommodations
• 💬 Chat with your trip buddies
• 📅 Coordinate dates and activities
• 💰 Track group expenses

Accept your invitation here:
${invitationUrl}

⏰ This invitation expires on ${formatExpiry(expiresAt)}

If you can't make it, no worries! Just ignore this email and the invitation will expire automatically.

---
Ski Trip Planner
Making group ski trips easier, one slope at a time ⛷️
  `.trim();
};
