/** Outbound notifications for lead capture.
 *
 * Optional: set LEAD_WEBHOOK_URL (Zapier / Make / n8n / Google Sheets / WhatsApp
 * Cloud API …) and every enquiry is pushed to your sales team the moment it
 * lands — whether or not the database write succeeded.
 *
 * Never throws: a webhook problem must not break a form submission.
 */
export type NotifyEvent = "lead.created" | "lead.failed" | "visit.created" | "visit.failed";

export type NotifyPayload = {
  event: NotifyEvent;
  lead?: any;
  visit?: any;
  error?: string;
  at?: string;
  project?: string;
};

export const notifyEnabled = !!process.env.LEAD_WEBHOOK_URL;

const TIMEOUT_MS = 6000;

export async function notify(payload: NotifyPayload): Promise<boolean> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Webhook-Event": payload.event },
      body: JSON.stringify({
        project: process.env.PROJECT_NAME || "Saraswati Coral",
        at: payload.at || new Date().toISOString(),
        ...payload,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) console.error(`[notify] ${payload.event} → HTTP ${res.status}`);
    return res.ok;
  } catch (e: any) {
    console.error(`[notify] ${payload.event} failed:`, e?.message);
    return false;
  }
}

/** Await the notification but never throw. */
export async function notifySafe(payload: NotifyPayload): Promise<void> {
  await notify(payload).catch(() => {});
}
