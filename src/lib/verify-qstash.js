import { Receiver } from '@upstash/qstash';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

export async function verifyQStashSignature(request) {
  const body = await request.text();

  if (process.env.NODE_ENV === 'development' && request.headers.get('x-dev-bypass') === 'true') {
    return JSON.parse(body);
  }

  const signature = request.headers.get('upstash-signature');
  if (!signature) return false;

  try {
    await receiver.verify({ signature, body });
    return JSON.parse(body);
  } catch {
    return false;
  }
}
