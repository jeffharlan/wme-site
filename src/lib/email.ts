import { db } from './db';
import { settings } from './schema';
import { eq } from 'drizzle-orm';
import { decrypt } from './encrypt';

interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
}

async function getSMTPSettings() {
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.key, 'smtp2go_api_key'));

  const apiKeyRow = rows[0];
  if (!apiKeyRow) return null;

  const senderRows = await db
    .select()
    .from(settings)
    .where(eq(settings.key, 'smtp2go_sender_email'));
  const nameRows = await db
    .select()
    .from(settings)
    .where(eq(settings.key, 'smtp2go_sender_name'));

  return {
    apiKey: decrypt(apiKeyRow.value),
    senderEmail: senderRows[0]?.value || 'noreply@worldmissionsevangelism.com',
    senderName: nameRows[0]?.value || 'World Missions & Evangelism',
  };
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const config = await getSMTPSettings();
  if (!config) {
    return { success: false, error: 'SMTP2GO is not configured. Go to Admin > Settings to add your API key.' };
  }

  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  try {
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: config.apiKey,
        to: recipients,
        sender: `${config.senderName} <${config.senderEmail}>`,
        subject: options.subject,
        html_body: options.htmlBody,
        text_body: options.textBody || '',
      }),
    });

    const data = await response.json();

    if (data.data?.succeeded > 0) {
      return { success: true };
    }

    return { success: false, error: data.data?.error || 'Unknown SMTP2GO error' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to connect to SMTP2GO' };
  }
}

export async function testEmailConnection(): Promise<{ success: boolean; error?: string }> {
  const config = await getSMTPSettings();
  if (!config) {
    return { success: false, error: 'SMTP2GO is not configured.' };
  }

  // Just verify the API key works
  try {
    const response = await fetch('https://api.smtp2go.com/v3/stats/email_bounces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: config.apiKey }),
    });

    const data = await response.json();
    if (response.ok) {
      return { success: true };
    }
    return { success: false, error: data.data?.error || 'Invalid API key' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
