import prisma from './db';

/**
 * Dispatch webhook and log the result.
 */
export async function dispatchWebhook({ agentId, webhookUrl, sessionId, payload }) {
  if (!webhookUrl) return;

  let statusCode = null;
  let responseText = null;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    statusCode = res.status;
    responseText = await res.text();
  } catch (err) {
    statusCode = 0;
    responseText = err.message;
  }

  await prisma.webhookLog.create({
    data: {
      agentId,
      sessionId,
      payload,
      statusCode,
      response: responseText?.substring(0, 2000),
    },
  });
}
