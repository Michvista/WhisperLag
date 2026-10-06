import net from "node:net";
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

/** Send via Resend HTTP API — works on any cloud platform (port 443). */
async function sendViaResend(options: SendMailOptions, recipients: string[]): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "RESEND_API_KEY not set" };

  const from = options.from || env.RESEND_FROM || "WhisperLag UNILAG <onboarding@resend.dev>";

  const payload: Record<string, unknown> = {
    from,
    to: recipients,
    subject: options.subject,
  };
  if (options.html) payload.html = options.html;
  if (options.text) payload.text = options.text;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  const body = await res.json() as { id?: string; message?: string; name?: string };
  if (!res.ok) {
    const errMsg = body.message || body.name || `Resend API error ${res.status}`;
    console.error("[mailer] Resend error:", errMsg);
    return { success: false, error: errMsg };
  }

  console.log("[mailer] Resend delivery OK, id:", body.id);
  return { success: true, messageId: body.id };
}

/**
 * Sends an email. Tries Resend HTTP API first (works on Render free tier),
 * then falls back to raw SMTP (may be blocked on cloud providers).
 */
export async function sendEmail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const rawRecipients = Array.isArray(options.to) ? options.to : [options.to];
  const recipients = Array.from(new Set(rawRecipients.map((e) => e.trim()).filter(Boolean)));

  if (recipients.length === 0) {
    return { success: false, error: "No recipients provided" };
  }

  // --- Primary: Resend HTTP API ---
  if (env.RESEND_API_KEY) {
    return sendViaResend(options, recipients);
  }

  // --- Fallback: raw SMTP (may be blocked on Render free tier) ---
  const host = env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(env.SMTP_PORT) || 587;
  const user = (env.SMTP_USER || "").trim();
  const pass = (env.SMTP_PASS || "").replace(/\s+/g, "");
  const from = options.from || `WhisperLag UNILAG <${user}>`;

  if (!user || !pass) {
    console.warn("[mailer] No RESEND_API_KEY and no SMTP credentials set. Email skipped.");
    return { success: false, error: "No email provider configured. Set RESEND_API_KEY in Render environment." };
  }

  return new Promise((resolve) => {
    let resolved = false;
    function finish(res: { success: boolean; messageId?: string; error?: string }) {
      if (!resolved) {
        resolved = true;
        resolve(res);
      }
    }

    const isDirectTls = port === 465;

    let socket: net.Socket | tls.TLSSocket;
    let dataBuffer = "";
    let awaitingReply: ((lines: string[]) => void) | null = null;

    function handleData(chunk: Buffer | string) {
      dataBuffer += chunk.toString("utf8");
      const lines = dataBuffer.split("\r\n");
      dataBuffer = lines.pop() || "";

      const completeLines: string[] = [];
      let isLast = false;

      for (const line of lines) {
        if (!line) continue;
        completeLines.push(line);
        if (line.length === 3 || (line.length >= 4 && line[3] === " ")) {
          isLast = true;
        }
      }

      if (isLast && awaitingReply) {
        const cb = awaitingReply;
        awaitingReply = null;
        cb(completeLines);
      }
    }

    function readReply(): Promise<string[]> {
      return new Promise((res, rej) => {
        const timer = setTimeout(() => rej(new Error("SMTP read timeout")), 15000);
        awaitingReply = (lines) => {
          clearTimeout(timer);
          res(lines);
        };
      });
    }

    function sendCmd(cmd: string) {
      socket.write(cmd + "\r\n");
    }

    async function runSession() {
      try {
        const greeting = await readReply();
        if (!greeting[greeting.length - 1].startsWith("220")) {
          throw new Error(`Unexpected greeting: ${greeting.join(" ")}`);
        }

        sendCmd(`EHLO localhost`);
        await readReply();

        if (!isDirectTls) {
          sendCmd("STARTTLS");
          const tlsRes = await readReply();
          if (!tlsRes[tlsRes.length - 1].startsWith("220")) {
            throw new Error(`STARTTLS failed: ${tlsRes.join(" ")}`);
          }
          await new Promise<void>((upgraded) => {
            const tlsSocket = tls.connect({ socket: socket as net.Socket, host, rejectUnauthorized: false }, () => {
              socket = tlsSocket;
              socket.on("data", handleData);
              upgraded();
            });
          });
          sendCmd(`EHLO localhost`);
          await readReply();
        }

        sendCmd("AUTH LOGIN");
        const authReq = await readReply();
        if (!authReq[authReq.length - 1].startsWith("334")) {
          throw new Error(`AUTH LOGIN rejected: ${authReq.join(" ")}`);
        }

        sendCmd(Buffer.from(user).toString("base64"));
        const userReq = await readReply();
        if (!userReq[userReq.length - 1].startsWith("334")) {
          throw new Error(`Username rejected: ${userReq.join(" ")}`);
        }

        sendCmd(Buffer.from(pass).toString("base64"));
        const passRes = await readReply();
        if (!passRes[passRes.length - 1].startsWith("235")) {
          throw new Error(`Authentication failed: ${passRes.join(" ")}`);
        }

        sendCmd(`MAIL FROM:<${user}>`);
        const mailRes = await readReply();
        if (!mailRes[mailRes.length - 1].startsWith("250")) {
          throw new Error(`MAIL FROM rejected: ${mailRes.join(" ")}`);
        }

        for (const rcpt of recipients) {
          sendCmd(`RCPT TO:<${rcpt}>`);
          const rcptRes = await readReply();
          if (!rcptRes[rcptRes.length - 1].startsWith("250")) {
            console.warn(`[mailer] Recipient rejected: ${rcpt} (${rcptRes.join(" ")})`);
          }
        }

        sendCmd("DATA");
        const dataRes = await readReply();
        if (!dataRes[dataRes.length - 1].startsWith("354")) {
          throw new Error(`DATA command rejected: ${dataRes.join(" ")}`);
        }

        const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@whisperlag.unilag.edu.ng>`;
        const headers = [
          `From: ${from}`,
          `To: ${recipients.join(", ")}`,
          `Subject: ${options.subject}`,
          `Message-ID: ${messageId}`,
          `Date: ${new Date().toUTCString()}`,
          `MIME-Version: 1.0`,
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          "",
        ];

        let body = "";
        if (options.text) {
          body += `--${boundary}\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n${options.text}\r\n\r\n`;
        }
        if (options.html) {
          body += `--${boundary}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Transfer-Encoding: 8bit\r\n\r\n${options.html}\r\n\r\n`;
        }
        body += `--${boundary}--\r\n.`;

        socket.write(headers.join("\r\n") + "\r\n" + body + "\r\n");

        const sendRes = await readReply();
        if (!sendRes[sendRes.length - 1].startsWith("250")) {
          throw new Error(`Message delivery failed: ${sendRes.join(" ")}`);
        }

        sendCmd("QUIT");
        try { await readReply(); } catch { /* ignore quit timeout */ }

        socket.end();
        finish({ success: true, messageId });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[mailer] SMTP transmission error:", msg);
        try { socket.destroy(); } catch {}
        finish({ success: false, error: msg });
      }
    }

    if (isDirectTls) {
      socket = tls.connect({ host, port, rejectUnauthorized: false }, () => {
        socket.on("data", handleData);
        runSession();
      });
    } else {
      socket = net.connect({ host, port }, () => {
        socket.on("data", handleData);
        runSession();
      });
    }

    socket.setTimeout(25000);
    socket.on("timeout", () => {
      console.error("[mailer] Socket connection timeout");
      socket.destroy();
      finish({ success: false, error: "SMTP connection timeout" });
    });
    socket.on("error", (err) => {
      console.error("[mailer] Socket error:", err.message);
      finish({ success: false, error: err.message });
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

  // If no specific admin recipient is configured, default to the SMTP_USER
  if (recipientSet.size === 0 && env.SMTP_USER && env.SMTP_USER.includes("@")) {
    recipientSet.add(env.SMTP_USER);
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
  if (recipients.length === 0) {
    console.log("[mailer] No admin recipient email found. Set ADMIN_NOTIFICATION_EMAILS in Render environment.");
    return;
  }

  console.log(`[mailer] Dispatching notification for whisper ${data.refNumber} to:`, recipients);

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

  const res = await sendEmail({
    to: recipients,
    subject,
    text: `New UNILAG Whisper (${data.refNumber})\nCategory: ${data.category}\n\nContent:\n${data.content}`,
    html,
  }).catch((err) => {
    console.error("[mailer] Notification failed:", err);
    return { success: false, error: String(err) };
  });

  console.log(`[mailer] Delivery result for whisper ${data.refNumber}:`, res);
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
