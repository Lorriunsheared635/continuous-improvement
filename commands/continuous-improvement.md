---
name: continuous-improvement
description: "Reflect on the current session, analyze observations for patterns, and show instinct status. Runs on-demand to save tokens."
---

# /continuous-improvement

Run this when you want to reflect and learn — not every session. Three steps in order.

## Step 1: Reflect

Generate a reflection for this session based on what happened:

```
## Reflection — [Date]
- What worked:
- What failed:
- What I'd do differently:
- Rule to add:
- Iteration — Next best recommendation:
```

If there's a "Rule to add", create an instinct YAML file with 0.6 starting confidence in the project's instinct directory.

The "Iteration — Next best recommendation" field is the Law 6 handoff. Point to the next **core development** move — what to build, fix, refactor, or investigate next so the feature/system advances. NOT git steps (commit, push, PR), NOT verification re-runs, NOT deploy actions — those belong in the end-of-run summary.

Format: `<verb> <object at path:line> (<why, one clause grounded in current context>)`.

If the goal is fully met and nothing else advances the system, write `None — goal met, stop.` Never leave this blank, never list more than one item.

## Step 2: Analyze Observations

Check `~/.claude/instincts/` for the current project (detect via git root → SHA-256 first 12 chars).

Look at `~/.claude/instincts/<hash>/observations.jsonl`. If 20+ lines exist:

1. Read the last 500 lines
2. Read existing instinct `*.yaml` files (project + global)
3. Detect patterns:
   - User corrections → "don't do X" instincts
   - Error→fix sequences → "when X fails, try Y"
   - Repeated workflows (3+ times) → "for X, do A→B→C"
   - Tool preferences → "use tool Y for task X"
4. Create/update instinct YAML files
5. Be conservative: only create instincts for 3+ observations of the same pattern

If fewer than 20 observations, skip analysis and note the count.

### Multi-Agent Analysis (500+ observations)

When observation backlog is large, parallelize:
- **Agent 1:** User corrections + error→fix patterns
- **Agent 2:** Repeated workflows + tool preferences
- **Agent 3:** Cross-reference existing instincts for updates

Merge results and deduplicate before writing YAML files.

## Step 3: Show Status

Display all instincts for the current project + global:

```
=== continuous-improvement ===

## Level: [CAPTURE | ANALYZE | SUGGEST | AUTO-APPLY]

## Session Reflection
- What worked: [from this session]
- What failed: [from this session]
- What I'd do differently: [from this session]
- Rule to add: [captured as instinct]
- Iteration — Next best recommendation: [one concrete next action, or "None — goal met, stop."]

## Learning
  NEW  [instinct-id]        [domain]  [confidence]  (from reflection)
   ↑   [instinct-id]        [domain]  [old]→[new]   (+N observations)

## Instincts — [project-name] ([hash])
  ● [0.85] instinct-id       domain   auto-apply
  ◐ [0.60] instinct-id       domain   suggest
  ○ [0.35] instinct-id       domain   silent

## Instincts — global
  ● [0.90] instinct-id       domain   auto-apply

## Next
- Keep working — hooks capture automatically
- System auto-levels as instincts gain confidence
```

If no instincts or observations exist yet, explain this is expected — the system is in CAPTURE level and will create instincts after 20+ observations accumulate.

## Subcommands

### `/continuous-improvement weekly`

Set up a weekly analysis schedule:
1. Create a cron/loop schedule that runs `/continuous-improvement analyze` every 7 days
2. Confirm the schedule to the user
3. Show next scheduled run date

### `/continuous-improvement always-on`

Toggle always-on mode for the current project:
1. Find project hash
2. Create/update `~/.claude/instincts/<hash>/config.yaml` with `always_on: true|false`
3. Confirm the change

**Default is off** — observations accumulate silently, analysis only runs when you ask.
