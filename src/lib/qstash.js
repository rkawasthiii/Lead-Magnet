import { Client } from '@upstash/qstash';

const qstash = new Client({ token: process.env.QSTASH_TOKEN || '' });

export function getBaseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function publishStep(step, payload) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/pipeline/${step}`;

  if (baseUrl.includes('localhost')) {
    setTimeout(() => {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dev-bypass': 'true' },
        body: JSON.stringify(payload),
      }).catch((err) => console.error(`[pipeline] ${step} failed:`, err.message));
    }, 100);
    return;
  }

  await qstash.publishJSON({ url, body: payload, retries: 3 });
}

export { qstash };
