<!-- Generated: 2026-06-09 | Updated: 2026-06-09 -->

# reynisa-phone

## Purpose
A SvelteKit-based web application replicating an iPhone-like interface, featuring real-time chat, local database (libsql), and complex UI states.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Project dependencies, Vite/Svelte configurations |
| `svelte.config.js` | Svelte configuration |
| `vite.config.ts` | Vite bundler configuration |
| `tsconfig.json` | TypeScript configuration |
| `supabase_setup.sql` | Supabase initial setup script |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | Application source code and Svelte components (see `src/AGENTS.md`) |
| `static/` | Static assets, icons, and service workers (see `static/AGENTS.md`) |
| `supabase/` | Supabase migrations (see `supabase/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Use TypeScript strict mode.
- Understand that this is a SvelteKit app (`npm run dev` to start).

### Testing Requirements
- Vitest and Svelte-check for validation.

### Common Patterns
- Use Vite and SvelteKit standard patterns.

## Dependencies

### Internal
- `src/` for UI and logic.

### External
- `svelte`, `@sveltejs/kit`, `tailwindcss`, `@supabase/supabase-js`, `@libsql/client`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

<!-- lean-ctx -->
## lean-ctx

Prefer lean-ctx MCP tools over native equivalents for token savings.
Full rules: @d:\Koding\Projek\Self\reynisa-phone\LEAN-CTX.md
<!-- /lean-ctx -->
