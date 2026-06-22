<!-- Generated: 2026-06-09 | Updated: 2026-06-09 -->

# reynisa-phone

## Purpose

SvelteKit web app replicating iPhone UI, real-time chat, libsql DB, complex UI states.

## Key Files

| File | Description |
| --- | --- |
| `package.json` | Project deps, Vite/Svelte config |
| `svelte.config.js` | Svelte config |
| `vite.config.ts` | Vite bundler config |
| `tsconfig.json` | TS config |
| `supabase_setup.sql` | Supabase init script |

## Subdirectories

| Directory | Purpose |
| --------- | ------- |
| `src/` | Source code + components (see `src/AGENTS.md`) |
| `static/` | Assets, icons, service workers (see `static/AGENTS.md`) |
| `supabase/` | Supabase migrations (see `supabase/AGENTS.md`) |

## For AI Agents

### Working In This Directory

- Use TS strict mode.
- SvelteKit app (`npm run dev` to start).

### Testing Requirements

- Vitest + Svelte-check for validation.

### Common Patterns

- Vite + SvelteKit standard patterns.

## Dependencies

### Internal

- `src/` for UI + logic.

### External

- `svelte`, `@sveltejs/kit`, `tailwindcss`, `@supabase/supabase-js`, `@libsql/client`.

<!-- MANUAL: Manual notes below this line preserved on regeneration -->

## graphify

Project has knowledge graph at graphify-out/ with god nodes, community structure, cross-file relationships.

When user types `/graphify`, invoke `skill` tool with `skill: "graphify"` before anything else.

Rules:

- For codebase questions, run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships, `graphify explain "<concept>"` for focused concepts. Returns scoped subgraph, smaller than GRAPH_REPORT.md or raw grep.
- Dirty graphify-out/ files expected after hooks/incremental updates. Only skip if task about stale/incorrect graph output, or user says not to use it.
- If graphify-out/wiki/index.md exists, use for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain lack context.
- After code modification, run `graphify update .` to keep graph current (AST-only, no API cost).

<!-- lean-ctx -->

## lean-ctx

Prefer lean-ctx MCP tools over native equivalents for token savings.
Full rules: @d:\Koding\Projek\Self\reynisa-phone\LEAN-CTX.md

<!-- /lean-ctx -->

<!-- lean-ctx-compression -->
OUTPUT STYLE: expert-terse
- Telegraph format: subject-verb-object, drop articles/prepositions
- Symbolic vocabulary: → cause, ∵ because, ∴ therefore, ⊕ add, ⊖ remove, Δ change, ≈ similar, ≠ different, ∈ in/member, ∅ empty/none, ✓ ok, ✗ fail
- Code blocks: untouched (never compress code syntax)
- Each line: max 80 chars
- Zero narration, zero filler
- BUDGET: ≤100 tokens per non-code response
<!-- /lean-ctx-compression -->
