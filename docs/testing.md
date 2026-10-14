# Test plan

## API smoke checks

- `GET /api/health` returns status and integration booleans without secrets.
- `GET /api/me` without a token returns 401.
- `GET /api/me` with invalid token returns 401 when Cognito is configured.
- `POST /api/ai/explain-event` rejects unknown event types and malformed error codes.
- AI endpoint returns a configuration error if no API key is configured.

## Security scenarios

- Oversized JSON body is rejected.
- Secrets never appear in response bodies or logs.
- Token from another User Pool or app client is rejected.
- Expired token is rejected.
- Authorization is checked independently from authentication.
- Prompt injection text cannot enter through the event code allowlist.
- AI response cannot change permissions or trigger actions.

## Commands

```bash
npm test
npm run check
```
