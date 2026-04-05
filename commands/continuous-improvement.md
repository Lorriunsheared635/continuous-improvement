---
name: continuous-improvement
description: "Reflect on the current session, analyze observations for patterns, and show instinct status. Run after finishing significant work."
---

# /continuous-improvement

Run this after completing significant work. It does three things in order.

## Step 1: Reflect

Generate a reflection for this session based on what happened:

```
## Reflection — [Date]
- What worked:
- What failed:
- What I'd do differently:
- Rule to add:
```

If there's a "Rule to add", create an instinct YAML file with 0.6 starting confidence in the project's instinct directory.

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
