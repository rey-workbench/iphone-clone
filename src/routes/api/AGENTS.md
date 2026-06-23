<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-23 | Updated: 2026-06-23 -->

# api

## Purpose

SvelteKit API endpoints for backend communication, services, and integrations.

## Subdirectories

| Directory        | Purpose                        |
| ---------------- | ------------------------------ |
| `auth/`          | Authentication endpoints       |
| `chat/`          | Chat and messaging endpoints   |
| `iptv/`          | IPTV integration endpoints     |
| `keepalive/`     | Connection keepalive endpoints |
| `messages/`      | Message fetching endpoints     |
| `netflix/`       | Netflix proxy/mock endpoints   |
| `notes/`         | Notes management endpoints     |
| `proxy/`         | General API proxy endpoints    |
| `safari-search/` | Search proxy endpoints         |
| `turn/`          | TURN server endpoints          |
| `users/`         | User management endpoints      |
| `ytsearch/`      | YouTube search proxy endpoints |

## For AI Agents

- Implement endpoints strictly inside `+server.ts` files.
- Return structured JSON responses using SvelteKit's `json()` helper.

<!-- MANUAL: -->
