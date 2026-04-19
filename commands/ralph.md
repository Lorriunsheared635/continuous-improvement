---
name: ralph
description: "Convert PRD to executable JSON and run autonomous agent loop until all stories complete"
---

# /ralph

Ralph is an autonomous AI agent loop that runs repeatedly until all PRD items are complete.

## Subcommands

### `/ralph init`

Initialize Ralph in your project:

1. Create `scripts/ralph/` directory
2. Add `ralph.sh` loop script
3. Add prompt templates for Amp and Claude Code
4. Create example `prd.json`

### `/ralph convert <prd-file>`

Convert a markdown PRD to Ralph's executable JSON format:

```
/ralph convert tasks/prd-auth-feature.md
```

Output: `prd.json` with structured user stories

### `/ralph run [iterations]`

Run the autonomous loop:

```
/ralph run 10
```

Default: 10 iterations. Stops early if all stories complete.

## Ralph Loop Behavior

1. **Create branch** from PRD `branchName`
2. **Pick highest priority** story where `passes: false`
3. **Implement story** — fresh context, no pollution
4. **Run quality checks** — typecheck, tests, lint
5. **Commit if passing** — atomic commits per story
6. **Update prd.json** — mark `passes: true`
7. **Log learnings** — append to `progress.txt`
8. **Repeat** until done or max iterations

## Key Files

| File | Purpose |
|------|---------|
| `prd.json` | Executable PRD with user stories |
| `progress.txt` | Accumulated learnings |
| `ralph.sh` | The loop script |
| `AGENTS.md` | Iteration memory (auto-updated) |

## Workflow Integration

Ralph works best with:
- **Superpowers** — for structured development stages
- **continuous-improvement** — for reflection and learning between iterations
- **workspace-surface-audit** — to verify capabilities before starting

## Critical Concepts

### Fresh Context Per Iteration
Each story runs in isolation. Previous work is visible only via git history and `prd.json`.

### AGENTS.md Updates
Ralph updates `AGENTS.md` after each story so subsequent iterations know what's already done.

### Browser Verification
For UI stories, Ralph starts a dev server and uses Playwright to verify rendering.

### Stop Conditions
- All stories pass
- Max iterations reached
- Critical failure (requires human intervention)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Ralph stuck | Check `prd.json` for malformed stories |
| Tests failing | Run `npm test` independently to isolate |
| Uncommitted changes | Check git status, commit or stash |
| Wrong tool | Use `--tool amp` or `--tool claude` flag |

## Example Session

```
User: /ralph convert tasks/prd-checkout.md
[Creates prd.json with 8 stories]

User: /ralph run 15
[Ralph creates branch, implements stories 1-8 over 12 iterations]

[All tests pass, branch ready for PR]
```
