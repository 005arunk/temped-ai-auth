# Security checklist

- Keep `.env` out of version control; rotate any secret accidentally committed.
- Never send passwords, MFA codes, access/refresh/ID tokens, session cookies, or personal identifiers to the Claude API.
- Validate all request fields and cap payload sizes.
- Keep Anthropic API keys on the server; never embed them in browser code.
- Verify Cognito access tokens server-side; never trust decoded-but-unverified JWT claims.
- Apply authorization checks to every protected resource, not just login.
- Use TLS in deployed environments, least-privilege IAM, secret management, and log redaction.
- Add CSRF protection if using cookies; configure CORS narrowly if frontend and API origins differ.
- Add monitoring, audit retention, abuse controls, dependency scanning, and incident response procedures before production.
- Treat AI-generated explanations as untrusted advice; require human review.
