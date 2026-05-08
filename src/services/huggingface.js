const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

// Try models in order until one responds
const MODELS = [
  'mistralai/Mistral-7B-Instruct-v0.2',
  'HuggingFaceH4/zephyr-7b-beta',
  'microsoft/Phi-3-mini-4k-instruct',
];

async function callHFApi(model, messages) {
  const res = await fetch(
    `https://router.huggingface.co/hf-inference/models/${model}/v1/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 500,
        temperature: 0.4,
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from model');
  return content;
}

export async function chatWithMistral(messages, dashboardContext) {
  const systemPrompt = buildSystemPrompt(dashboardContext);

  const apiMessages = [
    { role: 'user', content: systemPrompt + '\n\nAcknowledge you understand and are ready to help.' },
    { role: 'assistant', content: 'Understood! I am ready to help you with information from the ISS Live Dashboard.' },
    ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
  ];

  // Try each model in order
  for (const model of MODELS) {
    try {
      return await callHFApi(model, apiMessages);
    } catch (err) {
      console.warn(`Model ${model} failed:`, err.message);
      // Continue to next model
    }
  }

  throw new Error('All AI models are currently unavailable. Please try again in a moment.');
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
