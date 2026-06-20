import { ChatMessage } from './geminiService';

const CF_WORKER_URL =
  import.meta.env.VITE_CF_WORKER_URL ||
  'https://koyjabo-auth-proxy.mejbaur-bahar.workers.dev';

export async function askGitHubModels(
  message: string,
  history: ChatMessage[],
): Promise<string> {
  const res = await fetch(`${CF_WORKER_URL}/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `AI error ${res.status}`);
  }

  const data = await res.json();
  if (!data.text) throw new Error('empty_response');
  return data.text;
}
