---
name: planning-with-files
description: Create and maintain task_plan.md, findings.md, and progress.md for persistent file-based planning
---

# /planning-with-files

Use this workflow only when the user explicitly wants persistent, file-based planning. It is opt-in.

## Project Root

1. Run `git rev-parse --show-toplevel 2>/dev/null`
2. If that fails, use the current working directory
3. Create and read planning files in that root only

The planning files are:
- `task_plan.md`
- `findings.md`
- `progress.md`

## `init`

If the files do not exist, create them in the project root.

`task_plan.md` must include:
- `## Goal`
- `## Status`
- `## Phases`
- `## Key Questions`
- `## Decisions Made`
- `## Errors Encountered`

Default phases:
- `Research`
- `Plan`
- `Execute`
- `Verify`
- `Reflect`

Never overwrite existing planning files unless the user explicitly asks you to reset or replace them.

## `status`

Read all three files and summarize:
- Current status from `task_plan.md`
- Checked vs unchecked phases
- Whether `findings.md` has real notes yet
- Whether `progress.md` has real session or verification entries yet

If the files do not exist, say so and offer to initialize them.

## `checkpoint`

After a meaningful work chunk:
- Update `progress.md` with what happened, commands run, and verification notes
- Add new discoveries or sources to `findings.md`
- Update `task_plan.md` progress, decisions, and errors

Do not hide failures. Log them in `## Errors Encountered`.

## `recover`

When resuming after context loss or a new session:
- Re-read `task_plan.md`, `findings.md`, and `progress.md` before making major decisions
- Restate the current goal, phase, open questions, and latest verification state
- Continue from the recorded plan instead of rebuilding context from memory
