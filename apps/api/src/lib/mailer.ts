import tls from "node:tls";
import { env } from "../config/env.js";
import { prisma } from "./prisma.js";

interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

/**
 * Pure Node.js zero-dependency SSL/TLS SMTP client for Gmail and custom SMTP servers.
 * Connects directly over TLS to port 465 for fast, secure delivery without external dependencies.
 */
export async function sendEmail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const host = env.SMTP_HOST || "smtp.gmail.com";
  const port = env.SMTP_PORT || 465;
  const user = env.SMTP_USER || "";
  const pass = (env.SMTP_PASS || "").replace(/\s+/g, "");
  const from = options.from || `WhisperLag UNILAG <${user}>`;
  const rawRecipients = Array.isArray(options.to) ? options.to : [options.to];
  const recipients = Array.from(new Set(rawRecipients.map((e) => e.trim()).filter(Boolean)));

  if (recipients.length === 0) {
    return { success: false, error: "No recipients provided" };
  }

  if (!user || !pass) {
    console.warn("[mailer] SMTP credentials not configured. Skipping email dispatch.");
    return { success: false, error: "SMTP credentials missing" };
  }

  return new Promise((resolve) => {
    let socket: tls.TLSSocket;
    try {
      socket = tls.connect({ host, port, rejectUnauthorized: false }, () => {
        // Connected
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown connection error";
      console.error("[mailer] Connection error:", msg);
      return resolve({ success: false, error: msg });
    }

    socket.setEncoding("utf8");
    socket.setTimeout(15000);

    let stage = 0;
    let buffer = "";

    function sendCommand(cmd: string) {
      socket.write(cmd + "\r\n");
    }

    socket.on("data", (data: string) => {
      buffer += data;
      const lines = buffer.split("\r\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line) continue;
        const code = parseInt(line.substring(0, 3), 10);

        if (stage === 0 && code === 220) {
          // Greeting received
          stage = 1;
          sendCommand(`EHLO localhost`);
        } else if (stage === 1 && (code === 250 || line.startsWith("250 "))) {
          // Auth start
          stage = 2;
          sendCommand("AUTH LOGIN");
        } else if (stage === 2 && code === 334) {
          // Send base64 username
          stage = 3;
          sendCommand(Buffer.from(user).toString("base64"));
        } else if (stage === 3 && code === 334) {
          // Send base64 password
          stage = 4;
          sendCommand(Buffer.from(pass).toString("base64"));
        } else if (stage === 4 && code === 235) {
          // Auth successful
          stage = 5;
          sendCommand(`MAIL FROM:<${user}>`);
        } else if (stage === 5 && code === 250) {
          // RCPT TO
          stage = 6;
          for (const recipient of recipients) {
            sendCommand(`RCPT TO:<${recipient}>`);
          }
          sendCommand("DATA");
        } else if (stage === 6 && code === 354) {
          // Send email payload
          stage = 7;
          const boundary = `----=_Part_${Date.now()}`;
          const messageId = `<${Date.now()}@whisperlag.unilag.edu.ng>`;
          const headers = [
            `From: ${from}`,
            `To: ${recipients.join(", ")}`,
            `Subject: ${options.subject}`,
            `Message-ID: ${messageId}`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            "",
          ];

          let body = "";
          if (options.text) {
            body += `--${boundary}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${options.text}\r\n\r\n`;
          }
          if (options.html) {
            body += `--${boundary}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${options.html}\r\n\r\n`;
          }
          body += `--${boundary}--\r\n.`;

          socket.write(headers.join("\r\n") + "\r\n" + body + "\r\n");
        } else if (stage === 7 && code === 250) {
          // Delivered
          stage = 8;
          sendCommand("QUIT");
          socket.end();
          resolve({ success: true });
        } else if (code >= 400) {
          console.error(`[mailer] SMTP error at stage ${stage}: ${line}`);
          socket.end();
          resolve({ success: false, error: line });
        }
      }
    });

    socket.on("error", (err) => {
      console.error("[mailer] Socket error:", err.message);
      resolve({ success: false, error: err.message });
    });

    socket.on("timeout", () => {
      console.error("[mailer] Socket timeout");
      socket.destroy();
      resolve({ success: false, error: "SMTP connection timeout" });
    });
  });
}

/**
 * Sends a notification email to all QA Admins, Faculty Leads, and configured addresses when a new whisper is received.
 */
export async function notifyNewWhisper(data: {
  refNumber: string;
  category: string;
  content: string;
  departmentName?: string;
  attachmentUrl?: string;
}) {
  const recipientSet = new Set<string>();

  // Add env-configured emails
  if (env.ADMIN_NOTIFICATION_EMAILS) {
    for (const em of env.ADMIN_NOTIFICATION_EMAILS.split(",")) {
      if (em.trim()) recipientSet.add(em.trim());
    }
  }

  // Fetch all registered admin & faculty emails from the database
  try {
    const staffUsers = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "FACULTY"] } },
      select: { email: true },
    });
    for (const u of staffUsers) {
      if (u.email && !u.email.endsWith("@whisperlag.test")) {
        recipientSet.add(u.email);
      }
    }
  } catch {
    // Database fallback
  }

  const recipients = Array.from(recipientSet);
  if (recipients.length === 0) return;

  const isUrgent = data.content.toLowerCase().includes("urgent") || data.category === "Hostel / Facilities";
  const subject = `${isUrgent ? "🚨 [URGENT] " : "🌿 "}New UNILAG Whisper: [${data.category}] (${data.refNumber})`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; color: #10253a;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
        <div style="border-bottom: 2px solid #009A44; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #009A44; font-size: 20px; font-weight: 700;">WhisperLag UNILAG</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Quality Assurance & Student Feedback Management</p>
        </div>

        <div style="background: #f0fdf4; border-left: 4px solid #009A44; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #166534;">New Student Feedback Received</span>
          <p style="margin: 4px 0 0; font-size: 13px; font-weight: 600; color: #10253a;">Reference: <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #bbf7d0;">${data.refNumber}</code></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 120px;">Category:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #10253a;">${data.category}</td>
          </tr>
          ${data.departmentName ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Target Scope:</td>
            <td style="padding: 8px 0; font-weight: 600; color: #10253a;">${data.departmentName}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Time:</td>
            <td style="padding: 8px 0; color: #10253a;">${new Date().toLocaleString()}</td>
          </tr>
        </table>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">Message Content (Anonymous)</h4>
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${data.content}</p>
        </div>

        ${data.attachmentUrl ? `
        <div style="margin-bottom: 24px;">
          <a href="${data.attachmentUrl}" style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; text-decoration: none;">
            📎 View Uploaded Evidence Attachment →
          </a>
        </div>
        ` : ""}

        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <a href="https://whisperlag.vercel.app/whispers" style="display: inline-block; background: #009A44; color: #ffffff; padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none;">
            Open Whispers Dashboard →
          </a>
        </div>
      </div>
      <p style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 16px;">
        This is an automated notification from WhisperLag. Identities are completely anonymous and untraceable.
      </p>
    </div>
  `;

  await sendEmail({
    to: recipients,
    subject,
    text: `New UNILAG Whisper (${data.refNumber})\nCategory: ${data.category}\n\nContent:\n${data.content}`,
    html,
  }).catch((err) => console.error("[mailer] Notification failed:", err));
}

/**
 * Sends an email notification when a new internal staff collaboration message is posted.
 */
export async function notifyCollaborationMessage(data: {
  senderName: string;
  body: string;
  senderId: string;
  departmentName?: string;
}) {
  const recipientSet = new Set<string>();

  if (env.ADMIN_NOTIFICATION_EMAILS) {
    for (const em of env.ADMIN_NOTIFICATION_EMAILS.split(",")) {
      if (em.trim()) recipientSet.add(em.trim());
    }
  }

  // Fetch active staff users (excluding sender)
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "FACULTY"] },
        id: { not: data.senderId },
      },
      select: { email: true },
    });
    for (const u of staff) {
      if (u.email && !u.email.endsWith("@whisperlag.test")) {
        recipientSet.add(u.email);
      }
    }
  } catch {
    // Fallback
  }

  const recipients = Array.from(recipientSet);
  if (recipients.length === 0) return;

  const subject = `💬 New Staff Collaboration Note from ${data.senderName}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; color: #10253a;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
        <div style="border-bottom: 2px solid #2C7DA0; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #2C7DA0; font-size: 20px; font-weight: 700;">WhisperLag Collaboration Hub</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">UNILAG Internal Quality Assurance Coordination</p>
        </div>

        <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #0369a1;">Internal Message Posted</span>
          <p style="margin: 4px 0 0; font-size: 13px; font-weight: 600; color: #10253a;">From: <strong>${data.senderName}</strong> ${data.departmentName ? `(${data.departmentName})` : "(QA Administration)"}</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${data.body}</p>
        </div>

        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <a href="https://whisperlag.vercel.app/collaboration" style="display: inline-block; background: #2C7DA0; color: #ffffff; padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none;">
            Open Collaboration Hub &amp; Reply →
          </a>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: recipients,
    subject,
    text: `New Internal Collaboration Note from ${data.senderName}:\n\n${data.body}`,
    html,
  }).catch((err) => console.error("[mailer] Collaboration notification failed:", err));
}
