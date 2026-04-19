---
name: superpowers
description: "Activate mandatory agent workflows: brainstorming, TDD, code review, git worktrees, and structured development"
---

# /superpowers

Activate the Superpowers mandatory workflow framework. Skills trigger automatically based on context — this is not optional guidance.

## Subcommands

### `/superpowers status`

Show which workflow stages are active:

```
=== Superpowers Status ===

Active Skills:
  [x] brainstorming (trigger: new feature request)
  [ ] using-git-worktrees (waiting: design approval)
  [ ] writing-plans (waiting: worktree ready)
  [ ] test-driven-development (waiting: plan approved)
  [ ] requesting-code-review (waiting: implementation)
  [ ] finishing-a-development-branch (waiting: completion)
```

### `/superpowers enable <skill>`

Explicitly enable a skill for the current session:

```
/superpowers enable test-driven-development
```

### `/superpowers workflow <type>`

Activate a complete workflow preset:

| Preset | Skills Activated |
|--------|------------------|
| `new-feature` | brainstorming → worktrees → plans → TDD → review → finish |
| `bug-fix` | systematic-debugging → verification → TDD → review |
| `refactor` | worktrees → plans → TDD → review → finish |
| `review` | requesting-code-review → receiving-code-review |

Example:
```
/superpowers workflow new-feature
```

## Mandatory Skills

### brainstorming
**Triggers:** New feature requests, vague requirements

1. Ask clarifying questions
2. Explore 2-3 alternatives
3. Present design in sections
4. Wait for explicit approval

### using-git-worktrees
**Triggers:** Design approved, feature branch needed

Creates isolated workspace:
```bash
git worktree add -b feature-name ../feature-name
```

### writing-plans
**Triggers:** Worktree ready, implementation starting

Breaks work into bite-sized tasks (2-5 minutes each). Every task includes:
- Exact file paths
- Complete code
- Verification steps

### test-driven-development
**Triggers:** Plan approved, coding begins

```
RED: Write failing test → Watch it fail
GREEN: Write minimal code → Watch it pass
REFACTOR: Improve while green → Commit
```

**Rule:** Code written before tests is deleted.

### requesting-code-review
**Triggers:** Task complete, before continuing

Two-stage review:
1. Spec compliance — Does it match the plan?
2. Code quality — Clean, tested, maintainable?

Severity levels: Critical (blocks), Warning (note), Info (log)

### finishing-a-development-branch
**Triggers:** All tasks complete

Options presented:
- Merge to main
- Create PR
- Keep branch
- Discard (with confirmation)

## Skill Activation Rules

| User Request | Activates |
|--------------|-----------|
| "Create a feature" | brainstorming → writing-plans → executing-plans |
| "Fix this bug" | systematic-debugging → verification → TDD |
| "Review this code" | requesting-code-review |
| "Refactor this" | using-git-worktrees → writing-plans → TDD |

## Verification Protocol

Every skill requires verification before reporting completion:

1. **Code runs** without errors
2. **Output matches** expected result
3. **Actual result checked** — not assumed
4. **Build passes**
5. **Explained** in one sentence

## Integration

Superpowers integrates with:
- **continuous-improvement** — reflection and learning after each stage
- **ralph** — autonomous execution of planned stories
- **workspace-surface-audit** — verify environment before starting

## Example Session

```
User: "Build a checkout flow"

[brainstorming activates]
AI: "Clarifying questions: 1) Payment provider? 2) Guest checkout?"

User: "Stripe, yes guest checkout"

[writing-plans activates]
AI: "Plan created with 6 tasks. Approve?"

User: "Approved"

[using-git-worktrees activates]
AI: "Created worktree at ../checkout-feature"

[test-driven-development activates]
AI: "Task 1: Write failing test for cart validation..."
```
