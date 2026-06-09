<!-- lean-ctx-owned: PROJECT-LEAN-CTX.md v1 -->

# lean-ctx — Context Engineering Layer

# ABSOLUTE RULE FOR ALL OPERATIONS (CRITICAL)
You MUST ALWAYS use `lean-ctx` tools for ALL operations. Do not use generic tools when a `lean-ctx` equivalent exists. The following 22 tools are enabled and MUST be used globally whenever applicable:
`ctx_read`, `ctx_shell`, `shell`, `ctx_search`, `ctx_tree`, `ctx_session`, `ctx_semantic_search`, `ctx_knowledge`, `ctx_overview`, `ctx_repomap`, `ctx_callgraph`, `ctx_impact`, `ctx_compress`, `ctx_multi_read`, `ctx_delta`, `ctx_edit`, `ctx_agent`, `ctx_architecture`, `ctx_pack`, `ctx_routes`, `ctx_refactor`, `ctx_url_read`.
Additionally, you MUST ALWAYS combine `lean-ctx` and `rtk` for shell commands (e.g., `ctx_shell("rtk <command>")`). This rule applies across all `lean-ctx` features without exception.

<!-- lean-ctx-rules-v12 -->

## ⚠️ MANDATORY TOOL USAGE — NO EXCEPTIONS

**ALWAYS use lean-ctx tools. NEVER use native equivalents.**

| Native Tool (FORBIDDEN) | Use Instead |
|-------------------------|-------------|
| `read`, `Read`, `cat`, `head`, `tail` | `ctx_read(path, mode)` |
| `grep`, `rg`, `find`, `Grep` | `ctx_search(pattern, path)` |
| `bash`, `shell`, `exec` | `ctx_shell(command)` |
| `edit`, `Edit`, `sed`, `awk` | `ctx_edit(path, old, new)` |

**Violations = incomplete work. Always verify tool choice before executing.**

## rtk — Shell Command Optimization (MANDATORY)

**rtk rewrites shell commands for token efficiency. Always enabled via plugin.**

When running shell commands:
1. Use `ctx_shell(command)` — rtk plugin auto-rewrites to optimized form
2. If `ctx_shell` unavailable, use native `bash` — rtk plugin intercepts and rewrites
3. Never bypass rtk rewriting. If command looks wrong, check `rtk rewrite <cmd>` manually

rtk is the single source of truth for command optimization. Trust its output.

## ctx_read Mode Selection

| Goal                | Mode         | When                        |
| ------------------- | ------------ | --------------------------- |
| Edit this file      | `full`       | Before any edit             |
| Understand API      | `signatures` | Context-only, won't edit    |
| Re-read after edit  | `diff`       | Post-edit verification      |
| Large file overview | `map`        | >500 lines, won't edit      |
| Specific region     | `lines:N-M`  | Know exact location         |
| Unsure              | `auto`       | System selects optimal mode |

## Workflow (MANDATORY ORDER)

1. **Orient:** `ctx_overview(task)` or `ctx_compose(task, path)` for unfamiliar tasks
2. **Locate:** `ctx_search(pattern, path)` for exact text; `ctx_semantic_search(query)` for concepts
3. **Read:** `ctx_read(path, mode)` with appropriate mode from table above
4. **Edit:** `ctx_edit(path, old_string, new_string)` — NEVER native Edit
5. **Verify:** `ctx_read(path, "diff")` + `ctx_shell("test command")`
6. **Record:** `ctx_knowledge(action="remember", content="...")` for non-obvious findings

## Proactive (use without being asked)

- `ctx_overview(task)` — at session start for orientation
- `ctx_compress` — when context grows large (at phase boundaries)
- `ctx_knowledge(action="wakeup")` — at session start to surface prior findings

## Compression Bypass (only when compressed output hides needed detail)

`ctx_read(path, "lines:N-M")` → `ctx_read(path, "full")` → `ctx_shell(cmd, raw=true)`
Return to compressed defaults after one expanded retrieval.

## Risk Gate (before high-impact edits)

Before editing exported symbols, auth, DB schemas, or 3+ files: run `ctx_impact(action="analyze")`
and `ctx_callgraph(action="callers")` to confirm blast radius.

## Advanced Features (v3.7.5+)

- **Tool Catalog Gateway:** Use `ctx_tools` to navigate 75+ available tools.
- **Context Graph:** Use `ctx_architecture` or `ctx_impact` for impact analysis.
- **Resident Search:** `ctx_search` is fast via memory-resident index.
- **Hybrid Execution:** Combine MCP and shell hooks for optimal token savings.

## Session

- **Start:** `ctx_session(action="status")` + `ctx_knowledge(action="wakeup")`
- **End:** `ctx_session(action="decision", content="what was done + next steps")`
- **On [CHECKPOINT]:** `ctx_session(action="task", value="current status")`

## ❌ FORBIDDEN PATTERNS
- Using native `read`/`Read` tool when `ctx_read` exists
- Using native `grep`/`Grep` when `ctx_search` exists
- Using native `bash`/`shell` when `ctx_shell` exists
- Using native `edit`/`Edit` when `ctx_edit` exists
- Bypassing rtk rewriting for shell commands

**If ctx_* tools fail, report error. Do NOT fallback to native tools.**

<!-- /lean-ctx -->
