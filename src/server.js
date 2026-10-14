import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyCognitoAccessToken, cognitoConfigured } from './auth/cognito.js';
import { explainSecurityEvent, claudeConfigured } from './ai/claude.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const here = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"] } } }));
app.use(express.json({ limit: '10kb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use(express.static(path.join(here, '../public')));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', integrations: { cognito: cognitoConfigured(), claude: claudeConfigured() } }));

app.get('/api/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Bearer access token required.' });
  try {
    const claims = await verifyCognitoAccessToken(token);
    return res.json({ authenticated: true, user: { sub: claims.sub, username: claims.username || null, scope: claims.scope || null } });
  } catch (err) {
    const status = err.code === 'AUTH_NOT_CONFIGURED' ? 503 : 401;
    return res.status(status).json({ error: status === 503 ? 'Cognito verification is not configured.' : 'Token is invalid or expired.' });
  }
});

app.post('/api/ai/explain-event', async (req, res) => {
  const allowedTypes = new Set(['LOGIN_FAILURE', 'MFA_FAILURE', 'TOKEN_EXPIRED', 'ACCESS_DENIED', 'CONFIGURATION_ERROR']);
  const { eventType, errorCode, timestamp, environment } = req.body || {};
  if (!allowedTypes.has(eventType)) return res.status(400).json({ error: 'eventType is missing or unsupported.' });
  if (typeof errorCode !== 'string' || errorCode.length < 1 || errorCode.length > 100 || !/^[A-Za-z0-9_.:-]+$/.test(errorCode)) {
    return res.status(400).json({ error: 'errorCode must be a short code containing only letters, numbers, _, ., :, or -.' });
  }
  const safeTimestamp = typeof timestamp === 'string' && !Number.isNaN(Date.parse(timestamp)) ? new Date(timestamp).toISOString() : 'not provided';
  const safeEnvironment = ['development', 'staging', 'production'].includes(environment) ? environment : 'not provided';
  try {
    const explanation = await explainSecurityEvent({ eventType, errorCode, timestamp: safeTimestamp, environment: safeEnvironment });
    res.json({ explanation, disclaimer: 'AI-generated troubleshooting guidance only; verify before acting. Do not use it for access-control decisions.' });
  } catch (err) {
    const status = err.code === 'CLAUDE_NOT_CONFIGURED' ? 503 : 502;
    res.status(status).json({ error: status === 503 ? 'Claude API is not configured.' : 'Could not generate an explanation.' });
  }
});

app.get('*catchall', (_req, res) => res.sendFile(path.join(here, '../public/index.html')));

if (process.env.NODE_ENV !== 'test') app.listen(port, () => console.log(`Temped AI Auth running at http://localhost:${port}`));

export default app;
