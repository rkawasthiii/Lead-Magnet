import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bearerToken, modelId, region } = await request.json();

    if (!bearerToken) {
      return NextResponse.json({ error: 'Bearer token is required' }, { status: 400 });
    }

    const url = `https://bedrock-runtime.${region || 'us-east-1'}.amazonaws.com/model/${encodeURIComponent(modelId || 'us.anthropic.claude-opus-4-6-v1')}/converse`;

    const startTime = Date.now();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: [{ text: 'Say hello in one word. Respond with just that one word.' }] }],
        inferenceConfig: { maxTokens: 10, temperature: 0 },
      }),
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: errorText.slice(0, 500),
        elapsed,
      });
    }

    const data = await response.json();
    const text = data?.output?.message?.content?.[0]?.text;

    return NextResponse.json({
      success: true,
      text,
      elapsed,
      inputTokens: data?.usage?.inputTokens,
      outputTokens: data?.usage?.outputTokens,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
