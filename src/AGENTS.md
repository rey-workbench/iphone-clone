<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-09 | Updated: 2026-06-09 -->

# src

## Purpose

Core application source code for the iPhone clone UI, containing layout, routes, and lib functions.

## Key Files

| File              | Description              |
| ----------------- | ------------------------ |
| `app.html`        | Base HTML template       |
| `app.css`         | Global styles (Tailwind) |
| `hooks.server.ts` | SvelteKit server hooks   |

## Subdirectories

| Directory | Purpose                                                                |
| --------- | ---------------------------------------------------------------------- |
| `lib/`    | Shared libraries, apps, state, and UI components (see `lib/AGENTS.md`) |
| `routes/` | SvelteKit file-based routing (see `routes/AGENTS.md`)                  |

## For AI Agents

### Working In This Directory

- Use Svelte 5 syntax (`.svelte.ts` indicates Runes).
- Keep server-side code out of client bundles.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
