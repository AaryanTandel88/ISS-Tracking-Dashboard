/* global process */

const HF_CHAT_COMPLETIONS_URL = 'https://router.huggingface.co/v1/chat/completions';
const MISTRAL_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2:featherless-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.HF_TOKEN || process.env.VITE_HF_TOKEN;

  if (!token || token === 'REPLACE_WITH_YOUR_HUGGINGFACE_TOKEN') {
    return res.status(500).json({ error: 'Missing HF_TOKEN environment variable' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const messages = Array.isArray(body?.messages) ? body.messages : null;

    if (!messages) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    const hfResponse = await fetch(HF_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages,
        max_tokens: 500,
        temperature: 0.4,
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await hfResponse.json().catch(async () => ({
      error: await hfResponse.text(),
    }));

    if (!hfResponse.ok) {
      return res.status(hfResponse.status).json({
        error: data.error || 'Hugging Face request failed',
      });
    }

    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return res.status(502).json({ error: 'Empty response from model' });
    }

    return res.status(200).json({ content });
  } catch (err) {
    console.error('Chat API failed:', err);
    return res.status(500).json({ error: 'Chat API failed' });
  }
}
