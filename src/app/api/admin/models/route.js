import OpenAI from 'openai';
import { requireAdmin } from '@/lib/auth';

export async function POST(request) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { baseUrl, apiKey } = await request.json();

    const client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || 'dummy_key_if_endpoint_doesnt_need_one',
      baseURL: baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    });

    const response = await client.models.list();
    // OpenAI's models.list() returns an object with a data array
    const models = response.data.map(m => m.id);

    return Response.json({ models });
  } catch (err) {
    console.error('Failed to fetch models:', err);
    return Response.json({ error: 'Failed to fetch models.', detail: err.message }, { status: 500 });
  }
}
