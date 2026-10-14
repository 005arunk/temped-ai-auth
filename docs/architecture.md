# Architecture and implementation plan

## Current prototype

- Browser dashboard: `public/`
- Express API: `src/server.js`
- Cognito JWT verification: `src/auth/cognito.js`
- Claude API client: `src/ai/claude.js`
- No database, account-management endpoints, or browser sign-in callback is implemented.

## Intended sign-in architecture

1. Browser redirects to Cognito managed login using OAuth 2.0 authorization code flow with PKCE.
2. Cognito authenticates local users or federates enterprise users through Microsoft Entra ID.
3. The browser receives an authorization code, exchanges it according to the PKCE flow, and sends an access token to the API.
4. API verifies signature, issuer, token use, client ID, and expiry with `aws-jwt-verify`.
5. Backend authorizes each request using verified claims and server-side policy. Authentication alone does not grant permission to every resource.

For a production app, consider a backend-for-frontend session using Secure, HttpOnly, SameSite cookies rather than exposing long-lived tokens to browser JavaScript. Configure CSRF protections if cookie sessions are used.

## Microsoft Entra federation

Configure Entra as a Cognito identity provider and map only the required claims. Entra remains authoritative for enterprise identity. Keep group/app-role authorization aligned with the organization's access policy; verify how groups and roles are represented, including overage and token-size cases. Do not assume a federated login alone proves authorization to every application feature.

## Local account migration

Evaluate Cognito's User Migration Lambda for just-in-time migration, with strict validation against the existing identity store and rate limiting. Never log passwords. Ensure account linking is based on verified, stable identifiers and test duplicate-email and account-takeover edge cases. If bulk import is selected, plan a safe password reset path because imported users generally need to establish credentials.

## Claude integration

The backend sends only allowlisted, sanitized event fields to Claude. Model output is for human troubleshooting only and must not make authentication, authorization, or remediation decisions automatically.
