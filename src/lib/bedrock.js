export async function invokeBedrock(prompt, userSettings, { systemPrompt = null, maxTokens = 4096, timeoutMs = 120000, retries = 0 } = {}) {
  const region = userSettings.aws_region || 'us-east-1';
  const modelId = userSettings.model_id || 'us.anthropic.claude-sonnet-4-6';
  const token = userSettings.bearer_token;

  if (!token) {
    throw new Error('Bedrock bearer token not configured. Go to Settings to add your API key.');
  }

  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(modelId)}/converse`;

  const body = {
    messages: [
      {
        role: 'user',
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      maxTokens,
      temperature: 0.4,
    },
  };

  if (systemPrompt) {
    body.system = [{ text: systemPrompt }];
  }

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        throw new Error(`AI model timed out after ${Math.round(timeoutMs / 1000)}s. Try again — the model may be under heavy load.`);
      }
      lastError = new Error(`Network error reaching Bedrock: ${err.message}`);
      if (attempt < retries) continue;
      throw lastError;
    }

    if (response.status === 429) {
      lastError = new Error('Bedrock rate limit hit. Wait a moment and try again.');
      if (attempt < retries) continue;
      throw lastError;
    }

    if (response.status === 529 || response.status === 503) {
      lastError = new Error(`Bedrock temporarily unavailable (${response.status}). Retrying...`);
      if (attempt < retries) continue;
      throw new Error(`Bedrock unavailable after ${retries + 1} attempts. Try again shortly.`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bedrock API error (${response.status}): ${errorText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Bedrock returned invalid JSON — may be a network issue. Try again.');
    }

    const text = data?.output?.message?.content?.[0]?.text;
    if (!text) {
      throw new Error(`Unexpected Bedrock response shape: ${JSON.stringify(data).slice(0, 200)}`);
    }

    return text;
  }

  throw lastError || new Error('Bedrock call failed after retries');
}
