# Changelog

All notable changes to this skill are documented here.

---

## [2.1.0] — 2026-04-05

### Changed
- **Auto-leveling** — system promotes itself from CAPTURE → ANALYZE → SUGGEST → AUTO-APPLY based on observation count and instinct confidence. No user action needed.
- **No background daemon** — analysis runs inline at session start. Removed start-observer.sh, observer-loop.sh, PID management.
- **Simplified directory** — `~/.claude/instincts/` replaces `~/.claude/mulahazah/` with flat structure
- **jq optional** — observe.sh works with pure bash fallback if jq isn't installed
- **Leaner installer** — no daemon files copied, no config.json, no analyze.sh. Just skill + hook + command.
- **Smaller package** — removed agents/ and config.json from published files

### Removed
- Background observer daemon (deferred to v2.2 as opt-in)
- `~/.claude/mulahazah/` directory structure (replaced by `~/.claude/instincts/`)
- `rules.md` (replaced by YAML instinct files with confidence scoring)
- `bin/analyze.sh` (analysis now inline via SKILL.md prompt)

---

## [2.0.1] — 2026-04-05

### Fixed
- SKILL.md rewritten to be honest — removed claims about features that didn't work (YAML instinct auto-loading, graduated confidence enforcement)
- Law 7 now uses `~/.claude/mulahazah/rules.md` — a markdown file Claude can actually read/write reliably
- Added `bin/analyze.sh` — the actual analysis pipeline that was missing (calls Haiku to extract rules from observations)
- Added `commands/continuous-improvement.md` — the actual `/continuous-improvement` command file
- Installer now copies analyze.sh, command file, and initializes rules.md
- observer-loop.sh rewritten to use analyze.sh instead of broken YAML instinct pipeline
- README rewritten to match what the tool actually does

---

## [2.0.0] — 2026-04-05

### Added
- Law 7: Learn From Every Session — Mulahazah learning system
- PreToolUse/PostToolUse hooks for session observation
- Background Haiku observer agent for pattern detection
- Project-scoped observation (per-project JSONL files)
- `/continuous-improvement` command
- `hooks/observe.sh` — lightweight observation hook (<50ms)
- `agents/` — observer agent scripts
- `config.json` — observer configuration

### Changed
- Upgraded from 5-phase framework to 7-Law system
- The Loop: Research → Plan → Execute → Verify → Reflect → Learn → Iterate
- Installer sets up Mulahazah hooks and directories for Claude Code

### Improved
- Law 6 (Iterate) now explicit — one change → verify → next change

---

## [1.1.0] — 2026-04-04

### Improved
- README completely rewritten for cleaner onboarding — hook first, install in 30 seconds, first-task prompt
- Added real example of a successful agent run (rate limiting walkthrough)
- Added QUICKSTART.md for step-by-step first-use guide
- Added CHANGELOG.md for version tracking
- Removed internal references from SKILL.md (now works for any user, any project)
- Red flags section now in README for discoverability before install

### Fixed
- Fake Claude Code marketplace install command removed
- Internal variable references (Naim, PROJECT_REGISTRY, STATE_TEMPLATE) made universal

---

## [1.0.0] — 2026-04-04

### Added
- Initial release
- 5-phase framework: Research → Plan → Execute → Verify → Reflect
- Iron Law with 3 hard constraints
- Phase gates (explicit conditions before proceeding)
- Red Flags list (thought patterns that indicate a skip)
- Common Rationalizations table
- Subagent delegation rules with 4 status handlers
- Pre-completion self-review checklist
- marketplace.json for plugin discoverability
