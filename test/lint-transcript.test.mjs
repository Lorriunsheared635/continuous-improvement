import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const LINTER = join(__dirname, "..", "bin", "lint-transcript.mjs");
function lintEvents(events, flags = []) {
    const dir = join(tmpdir(), `ci-lint-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "transcript.jsonl");
    writeFileSync(file, events.map((event) => JSON.stringify(event)).join("\n") + "\n");
    try {
        return execFileSync("node", [LINTER, file, ...flags], { encoding: "utf8" });
    }
    finally {
        rmSync(dir, { recursive: true, force: true });
    }
}
describe("lint-transcript.mjs", () => {
    it("shows help with --help", () => {
        const output = execFileSync("node", [LINTER, "--help"], { encoding: "utf8" });
        assert.match(output, /Agent Transcript Linter/);
        assert.match(output, /--stdin/);
        assert.match(output, /--strict/);
        assert.match(output, /--json/);
    });
    it("exits 0 with no events from stdin", () => {
        const dir = join(tmpdir(), `ci-lint-empty-${Date.now()}`);
        mkdirSync(dir, { recursive: true });
        const file = join(dir, "empty.jsonl");
        writeFileSync(file, "\n");
        try {
            const output = execFileSync("node", [LINTER, file], { encoding: "utf8" });
            assert.match(output, /No events found/);
        }
        finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });
    it("detects Law 1 violation (writes without research)", () => {
        const events = [
            { tool: "Write", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
            { tool: "Write", event: "tool_start", tool_input: { file_path: "/tmp/b.ts" } },
        ];
        const output = lintEvents(events);
        assert.match(output, /Law 1/);
        assert.match(output, /Research Before Executing/);
    });
    it("no Law 1 violation when research precedes writes", () => {
        const events = [
            { tool: "Grep", event: "tool_start", tool_input: { pattern: "test" } },
            { tool: "Read", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
            { tool: "Write", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
        ];
        const result = JSON.parse(lintEvents(events, ["--json"]));
        const law1Violations = result.violations.filter((violation) => violation.law === 1);
        assert.equal(law1Violations.length, 0, "Should have no Law 1 violations");
    });
    it("detects Law 4 violation (no verification)", () => {
        const events = [
            { tool: "Read", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
            { tool: "Edit", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
        ];
        const output = lintEvents(events);
        assert.match(output, /Law 4/);
        assert.match(output, /Verify Before Reporting/);
    });
    it("no Law 4 violation when tests are run", () => {
        const events = [
            { tool: "Read", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
            { tool: "Edit", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
            { tool: "Bash", event: "tool_start", tool_input: { command: "npm test" } },
        ];
        const result = JSON.parse(lintEvents(events, ["--json"]));
        const law4Violations = result.violations.filter((violation) => violation.law === 4);
        assert.equal(law4Violations.length, 0, "Should have no Law 4 violations");
    });
    it("detects Law 3 violation (too many consecutive edits)", () => {
        const events = [
            { tool: "Read", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
            ...Array.from({ length: 7 }, (_, index) => ({
                tool: "Edit",
                event: "tool_start",
                tool_input: { file_path: `/tmp/file${index}.ts` },
            })),
        ];
        const output = lintEvents(events);
        assert.match(output, /Law 3/);
    });
    it("outputs JSON with --json flag", () => {
        const events = [{ tool: "Read", event: "tool_start", tool_input: {} }];
        const result = JSON.parse(lintEvents(events, ["--json"]));
        assert.ok("violations" in result);
        assert.ok("stats" in result);
        assert.ok("score" in result);
        assert.ok(typeof result.score === "number");
    });
    it("calculates discipline score", () => {
        const events = [
            { tool: "Grep", event: "tool_start", tool_input: { pattern: "test" } },
            { tool: "Read", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
            { tool: "Edit", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
            { tool: "Bash", event: "tool_start", tool_input: { command: "npm test" } },
        ];
        const result = JSON.parse(lintEvents(events, ["--json"]));
        assert.equal(result.score, 100, "Perfect discipline should score 100");
    });
    it("reads from file path", () => {
        const tempDir = join(tmpdir(), `ci-lint-test-${Date.now()}`);
        mkdirSync(tempDir, { recursive: true });
        const filePath = join(tempDir, "transcript.jsonl");
        writeFileSync(filePath, '{"tool":"Read","event":"tool_start","tool_input":{}}\n');
        const output = execFileSync("node", [LINTER, filePath], { encoding: "utf8" });
        assert.match(output, /Agent Discipline Report/);
        rmSync(tempDir, { recursive: true, force: true });
    });
    it("--strict exits 1 on violations", () => {
        const events = [
            { tool: "Write", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
        ];
        let exitCode = 0;
        try {
            lintEvents(events, ["--strict"]);
        }
        catch (error) {
            exitCode = typeof error.status === "number"
                ? error.status
                : 0;
        }
        assert.equal(exitCode, 1, "Should exit 1 with --strict and violations");
    });
    it("--strict exits 0 on clean transcript", () => {
        const events = [
            { tool: "Grep", event: "tool_start", tool_input: { pattern: "x" } },
            { tool: "Read", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
            { tool: "Edit", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
            { tool: "Bash", event: "tool_start", tool_input: { command: "npm test" } },
        ];
        const output = lintEvents(events, ["--strict"]);
        assert.match(output, /No law violations/);
    });
    it("tracks stats correctly", () => {
        const events = [
            { tool: "Grep", event: "tool_start", tool_input: {} },
            { tool: "Read", event: "tool_start", tool_input: {} },
            { tool: "Glob", event: "tool_start", tool_input: {} },
            { tool: "Write", event: "tool_start", tool_input: { file_path: "/tmp/a.ts" } },
            { tool: "Edit", event: "tool_start", tool_input: { file_path: "/tmp/b.ts" } },
            { tool: "Bash", event: "tool_start", tool_input: { command: "jest" } },
        ];
        const result = JSON.parse(lintEvents(events, ["--json"]));
        assert.equal(result.stats.researchTools, 3);
        assert.equal(result.stats.writeTools, 2);
        assert.equal(result.stats.verifyTools, 1);
    });
});
