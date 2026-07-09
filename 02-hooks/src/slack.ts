// Minimal Slack integration used by the daily cron in main.ts.
//
// Uses a bot token (SLACK_BOT_TOKEN) and the chat.postMessage Web API so we can
// target a channel by name (e.g. "#order-alerts"). No SDK dependency — just the
// global fetch available in Node 18+.

const SLACK_POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage";

export interface SlackMessage {
  /** Channel name (e.g. "#order-alerts") or channel ID. */
  channel: string;
  /** Message body. Supports Slack mrkdwn. */
  text: string;
}

/**
 * Posts a message to Slack. Throws if the token is missing or the API responds
 * with an error, so callers can decide whether to fail the job or continue.
 */
export async function sendSlackMessage({
  channel,
  text,
}: SlackMessage): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error(
      "SLACK_BOT_TOKEN is not set — cannot send Slack message. " +
        "Add it to your environment (see .env.example).",
    );
  }

  const response = await fetch(SLACK_POST_MESSAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, text }),
  });

  const data = (await response.json()) as { ok: boolean; error?: string };
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error ?? "unknown_error"}`);
  }
}
