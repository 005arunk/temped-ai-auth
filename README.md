# Temped AI Auth

A demonstration starter for secure application authentication using Amazon Cognito and an optional Claude-powered explanation of **sanitized** authentication events. It is a learning prototype, not a production-ready identity platform.

## Features

- Express backend with Helmet security headers and rate limiting.
- Optional Amazon Cognito JWT verification for protected API routes.
- Claude API endpoint for explaining sanitized security events.
- Static dashboard to test health, auth status, and the explanation endpoint.
- Architecture, security, testing, and Entra federation notes.

## Requirements

- Node.js 20 or later and npm.
- Optional: an Amazon Cognito User Pool for protected endpoints.
- Optional: an Anthropic API key for AI explanations.

## Run locally

```bash
cp .env.example .env
# Edit .env and add values for the services you want to enable
npm install
npm start
```

Open http://localhost:3000. The health endpoint works without cloud credentials. `/api/me` requires a valid Cognito access token and configured User Pool. The Claude endpoint requires `ANTHROPIC_API_KEY`.

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

## Configure Cognito

1. Create a Cognito User Pool in your AWS account.
2. Configure an app client and an OAuth authorization-code flow with PKCE for your eventual frontend domain. Do not create a client secret for a browser-based public client.
3. Set `AWS_REGION`, `COGNITO_USER_POOL_ID`, and `COGNITO_CLIENT_ID` in `.env`.
4. This starter verifies bearer tokens on the backend. The sample UI does not yet implement the Hosted UI/PKCE sign-in flow; follow `docs/architecture.md` before wiring up production sign-in.

## Configure Claude

Set `ANTHROPIC_API_KEY` and optionally `ANTHROPIC_MODEL` in `.env`. The API key must stay server-side. The AI endpoint accepts only a small allowlist of event fields and explicitly warns users not to submit passwords, tokens, email addresses, or other personal data.

## API endpoints

- `GET /api/health` — status and enabled integrations (no secrets returned).
- `GET /api/me` — validates a Cognito access token from `Authorization: Bearer <token>`.
- `POST /api/ai/explain-event` — Claude explanation for sanitized event metadata. Request JSON: `{ "eventType": "LOGIN_FAILURE", "errorCode": "NotAuthorizedException", "timestamp": "2026-01-01T12:00:00Z", "environment": "development" }`.

## Microsoft Entra ID and legacy accounts

Use Cognito as the app's federation broker for Entra users, while keeping enterprise authorization governed by the appropriate Entra groups/app roles and backend policy. Do not copy Entra passwords into Cognito. For local accounts, design and test a verified migration process; a Cognito User Migration Lambda can support just-in-time migration when its constraints fit. Never import password hashes unless the specific supported migration mechanism and security requirements have been verified. See `docs/architecture.md`.

## Testing

```bash
npm test
npm run check
```

## Security limitations

- No login UI or OAuth callback is implemented in this starter.
- No database, user migration Lambda, role mapping, or production deployment is included.
- AI explanations are advisory and must never decide authentication or authorization.
- Add CSRF protection, persistent audit logging, monitoring, deployment hardening, and security review before production use.

## Contributing

Open an issue describing the problem, create a branch, add tests, and submit a pull request. Only claim contributions you personally made and tested.
