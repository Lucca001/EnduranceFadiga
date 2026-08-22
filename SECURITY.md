# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | ✅ |

## Reporting a vulnerability

Please **do not open a public issue** for security vulnerabilities.

Email [lucca.14@hotmail.com](mailto:lucca.14@hotmail.com) with a description of the
issue, steps to reproduce, and the potential impact. You can expect an initial
response within 72 hours.

## Handling of sensitive data

- OAuth access and refresh tokens are stored encrypted at rest and never returned by the API.
- No credentials are committed to the repository; `.env` is git-ignored and `.env.example`
  contains placeholders only.
- Athlete data is scoped per user; every API route resolves the athlete from the
  authenticated session rather than from client-supplied identifiers.
