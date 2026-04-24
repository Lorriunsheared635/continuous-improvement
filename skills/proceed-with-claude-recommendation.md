---
name: proceed-with-claude-recommendation
description: "Walk a Claude-generated recommendation list top-to-bottom, route each item to the right specialist skill when available, fall back to inline behavior when it is not. Triggers on /proceed-with-claude-recommendation, \"proceed with your recommendation\", \"do all of it\", \"go ahead with the plan\", \"yes do it\", \"all of them\"."
origin: https://github.com/naimkatiman/continuous-improvement
---

# Proceed With Claude Recommendation

## Overview

Continuous, autonomous execution of the recommendations Claude offered in the previous turn(s). Walk the list top-to-bottom, invoke the right specialist skill per item, verify before moving on, and stop only at hard blockers.

Core principle: **execute in order, one concern at a time, verify before advancing.**

This skill is **standalone** — it works on its own. When paired with the `superpowers` plugin, the `continuous-improvement` core skills, and ECC helpers (`schedule`, `loop`, `simplify`, `security-review`, `documentation-lookup`, `update-config`, `commit-commands`), it delegates to those specialists. When any of them are missing, it falls back to a concrete inline behavior per item — never silently no-ops.

## When to Use

- User invokes `/proceed-with-claude-recommendation` right after Claude gave recommendations
- User says "proceed with your recommendation", "do all of it", "go ahead with the plan", "execute the recommendations"
- User confirms a prior Claude suggestion block with "yes do it" or "all of them"
- Auto mode is active and the recommendation list is unambiguous

Do NOT use when:
- No recent recommendation list exists — ask what to proceed with
- Recommendations include destructive actions (deploy, force-push, DB drops, secret changes) without prior explicit authorization
- User scoped the work ("just the first one", "only the safe ones")
- Recommendations conflict with project CLAUDE.md rules

## Pre-Flight

Restate the recommendation list back in one compact block before executing:

1. Numbered list of recommendations
2. Tag each: `safe` / `caution` / `needs-approval`
3. Say which specialist skill each will route to (or "inline fallback" if the specialist is not installed)
4. Proceed without waiting only if all items are `safe` AND user has already said "all of them" or auto mode is active

## Routing Table with Inline Fallbacks

For each recommendation type, TRY the preferred skill via the `Skill` tool. If that skill is not installed on this machine, fall back to the inline behavior in the rightmost column. Always log which path was taken: "Routed to `<skill>`" or "Inline fallback: `<behavior>`".

| Recommendation type | Preferred skill | Inline fallback |
|---|---|---|
| Implement feature / add capability | `superpowers:brainstorming` then `superpowers:writing-plans` | Restate goal → list 3 design options → pick one → outline files to touch → build |
| Fix bug / investigate failure | `superpowers:systematic-debugging` | Hypothesis → add logs/tests → reproduce → smallest fix → verify with the failing repro |
| Write tests / add coverage | `superpowers:test-driven-development` or `tdd-workflow` | RED (failing test) → GREEN (minimal code) → REFACTOR; one test, one behavior |
| Refactor / dead code cleanup | `simplify` | Find dupes/unused exports, delete in place, re-run type check and smallest test |
| Security review / auth audit | `security-review` | Scan for hardcoded secrets, unsanitized input, missing authz, SQL string concat, open CORS |
| Code review before merge | `superpowers:requesting-code-review` or `code-review` | Read diff top-to-bottom, flag CRITICAL / HIGH / MEDIUM |
| Verify before shipping | `superpowers:verification-before-completion` | Smallest check that proves correctness: typecheck + one test + one curl |
| Multiple independent tasks | `superpowers:dispatching-parallel-agents` | Launch N parallel `Agent` tool calls in one message; reconcile results after |
| Merge / close branch | `superpowers:finishing-a-development-branch` | Verify clean tree, rebase on main, green CI, open PR with summary + test plan |
| Schedule a follow-up | `schedule` | Tell user the exact action + cadence; if no scheduler, write a TODO/memory entry |
| Recurring poll / interval task | `loop` | Tell user the cadence + how to re-run manually |
| Library / API docs lookup | `documentation-lookup` | Use `WebFetch` against the official docs URL, cite what changed |
| Frontend / UI design work | `frontend-design:frontend-design` | Build smallest vertical slice first, verify in browser before styling |
| Settings / hooks / permission change | `update-config` | Edit `~/.claude/settings.json` with a minimal patch; restart session |
| Commit and push | `commit-commands:commit` or `commit-commands:commit-push-pr` | `git add <specific files>` → commit with `type(scope): outcome` → push when asked |
| Continuous-improvement discipline check | `continuous-improvement` (core skill) | Walk the 7 Laws checklist manually before claiming done |

## Execution Loop

For each item in the original order:

1. If `needs-approval` — stop and ask, do not proceed to later items silently
2. Try the preferred skill; if unavailable, apply the inline fallback
3. Run the smallest verification that proves correctness:
   - Code change → typecheck + the one targeted unit test
   - Migration → apply to dev DB, read back schema
   - Config → parse + one consuming command
   - UI → start dev server, visit the page in a browser
   - API → one curl with expected status and body
4. Emit one line: `Done: <item>. Verified: <check>. Routed to: <skill|inline>.`
5. Move to the next item

"Should work" is not verification. If verification is impossible, mark the item as unverified and say why.

## Persistence

- Create a `TodoWrite` list mirroring the recommendations at the start
- For >3 items or >150 LOC, write a plan doc at `docs/plans/YYYY-MM-DD-<slug>.md` per project CLAUDE.md convention
- One concern per commit — no bundled infra + product changes

## Stop Conditions

Stop immediately on:
- A `needs-approval` item
- Verification failed and the fix is non-obvious
- User course-corrects mid-loop
- New information contradicts the remaining list (root-cause shifted)
- Context >80% full — write a Context Bridge before clearing

## Red Flags (STOP and Ask)

- "I'll deploy to check" — run local verification instead
- "Skip verification for speed" — smallest check is 30 seconds
- "Batch these into one commit" — one concern per commit
- "Also fix this drive-by thing" — log as deferred, do not silently implement
- "User will probably be fine with me doing X" — X was not in the list

## End-of-Run Summary

One compact block:
- Completed: N items with names
- Deferred: M items with reason
- Blocked: K items with blocker and next action for the user
- Files touched and commits created
- Next step for the user (push, deploy, review)

## Common Mistakes

| Mistake | Fix |
|---|---|
| Reordering the list silently | Walk in original order unless user reorders |
| Adding new items not in the list | Log as deferred follow-up |
| Skipping verification on "easy" items | Every item gets the smallest proof |
| Running 3 specialist skills in parallel for one item | One skill per item unless items are truly parallel |
| Forgetting the end-of-run summary | Always emit it |
| Proceeding past a `needs-approval` item | Stop, ask, wait |
| Silent no-op when a routed skill is missing | Always run the inline fallback — never skip the item |

## Installation (standalone)

Copy into your Claude Code skills directory:

```bash
mkdir -p ~/.claude/skills/proceed-with-claude-recommendation
curl -L https://raw.githubusercontent.com/naimkatiman/continuous-improvement/main/skills/proceed-with-claude-recommendation.md \
  -o ~/.claude/skills/proceed-with-claude-recommendation/SKILL.md
```

Restart the Claude Code session so the skill registry picks it up. No other plugins are required — the skill falls back to inline behavior for any specialist skill that is not present.

## Pairs best with

- `superpowers` — brainstorming, writing-plans, TDD, systematic-debugging, verification-before-completion, dispatching-parallel-agents
- `continuous-improvement` (core) — 7 Laws of discipline enforcement
- ECC helpers — `schedule`, `loop`, `simplify`, `security-review`, `documentation-lookup`, `update-config`, `commit-commands`
