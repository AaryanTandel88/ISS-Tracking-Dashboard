const HF_CHAT_COMPLETIONS_URL = 'https://router.huggingface.co/v1/chat/completions';
const MISTRAL_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2:featherless-ai';

async function callServerChatApi(messages) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
    signal: AbortSignal.timeout(30000),
  });

  const data = await res.json().catch(async () => ({
    error: await res.text(),
  }));

  if (!res.ok) {
    throw new Error(`${res.status}: ${data.error || 'Chat API request failed'}`);
  }

  if (!data.content) throw new Error('Empty response from chat API');
  return data.content;
}

async function callHFApiFromBrowser(messages) {
  const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

  if (!HF_TOKEN || HF_TOKEN === 'REPLACE_WITH_YOUR_HUGGINGFACE_TOKEN') {
    throw new Error('Missing VITE_HF_TOKEN in .env');
  }

  const res = await fetch(HF_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
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

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from model');
  return content;
}

async function callHFApi(messages) {
  if (!import.meta.env.DEV) {
    return callServerChatApi(messages);
  }

  return callHFApiFromBrowser(messages);
}

export async function chatWithMistral(messages, dashboardContext) {
  const systemPrompt = buildSystemPrompt(dashboardContext);

  const apiMessages = [
    { role: 'user', content: systemPrompt + '\n\nAcknowledge you understand and are ready to help.' },
    { role: 'assistant', content: 'Understood! I am ready to help you with information from the ISS Live Dashboard.' },
    ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
  ];

  return callHFApi(apiMessages);
}

function buildSystemPrompt(ctx) {
  const {
    issPosition,
    issSpeed,
    issLocation,
    issAstronauts,
    issTrajectoryCount,
    newsArticles,
  } = ctx || {};

  const newsSummary = newsArticles && newsArticles.length > 0
    ? newsArticles.slice(0, 6).map((a, i) =>
        `${i + 1}. [${(a.category || 'NEWS').toUpperCase()}] "${a.title}" — ${a.source}. ${(a.description || '').slice(0, 120)}`
      ).join('\n')
    : 'No news articles currently loaded.';

  const astronautList = issAstronauts?.people?.map(p => `${p.name} (${p.craft})`).join(', ') || 'Loading...';

  return `You are an AI assistant STRICTLY limited to answering questions about data from the ISS Live Dashboard below. Do NOT use external knowledge. If asked about anything not in this data, say "I can only answer questions based on the current dashboard data."

DASHBOARD DATA:
- ISS Latitude: ${issPosition?.lat?.toFixed(4) ?? 'Loading'}°
- ISS Longitude: ${issPosition?.lng?.toFixed(4) ?? 'Loading'}°
- ISS Current Location: ${issLocation || 'Calculating...'}
- ISS Speed: ${issSpeed ? issSpeed.toLocaleString() + ' km/h' : 'Calculating...'}
- Positions Tracked: ${issTrajectoryCount ?? 0}
- People in Space: ${issAstronauts?.number ?? 'Loading'}
- Astronauts: ${astronautList}

LATEST NEWS:
${newsSummary}

Answer helpfully and concisely using ONLY the above data.`;
}
