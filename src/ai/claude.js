import Anthropic from '@anthropic-ai/sdk';

export function claudeConfigured() { return Boolean(process.env.ANTHROPIC_API_KEY); }

export async function explainSecurityEvent(event) {
  if (!claudeConfigured()) {
    const error = new Error('Claude not configured');
    error.code = 'CLAUDE_NOT_CONFIGURED';
    throw error;
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: 'You are a cautious application security support assistant. Explain likely meanings and safe diagnostic steps for sanitized authentication event metadata. Do not ask for or infer secrets or personal data. Never recommend bypassing authentication, weakening MFA, or changing authorization without review. State uncertainty clearly.',
    messages: [{ role: 'user', content: `Explain this sanitized event and suggest safe checks. Do not make access-control decisions.
${JSON.stringify(event)}` }]
  });
  return response.content.filter(part => part.type === 'text').map(part => part.text).join('\n').slice(0, 6000);
}
