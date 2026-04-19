# Bundled Companion Skills

This directory ships three companion skills alongside `SKILL.md` at the project root. They are **not** installed automatically by `npx continuous-improvement install` — the default installer only deploys the core 7 Laws skill and its commands.

Use these when you want to extend your agent beyond discipline enforcement.

## Skills in this directory

| File | What it does | Source |
|------|--------------|--------|
| `ralph.md` | Autonomous loop that executes a PRD story-by-story with quality checks between iterations | [snarktank/ralph](https://github.com/snarktank/ralph) |
| `superpowers.md` | Activates task-appropriate skills automatically (brainstorming, git-worktrees, TDD, code review, etc.) | [obra/superpowers](https://github.com/obra/superpowers) |
| `workspace-surface-audit.md` | Audits the active repo, MCP servers, plugins, and environment, then recommends high-value skills and workflows | ECC |

## How to install one

Pick the skill file you want and drop it into your agent's skills directory. For Claude Code:

```bash
cp skills/ralph.md ~/.claude/skills/ralph.md
```

Or paste the file's contents directly into your agent's system prompt.

## Relationship to the core skill

The core `SKILL.md` (project root) defines the 7 Laws of discipline. The skills here are independent tools you can mix in. They do not depend on `SKILL.md` and `SKILL.md` does not depend on them.
