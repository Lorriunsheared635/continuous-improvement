import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const HOOK_SCRIPT = join(__dirname, "..", "hooks", "observe.sh");
describe("observe.sh hook", () => {
    let tempHome = "";
    before(() => {
        tempHome = join(tmpdir(), `ci-hook-test-${Date.now()}`);
        mkdirSync(tempHome, { recursive: true });
    });
    after(() => {
        rmSync(tempHome, { recursive: true, force: true });
    });
    it("exits 0 with empty input", () => {
        execSync(`echo '' | bash "${HOOK_SCRIPT}"`, {
            env: { ...process.env, HOME: tempHome },
            encoding: "utf8",
            timeout: 5000,
        });
        assert.ok(true, "Hook should exit 0 with empty input");
    });
    it("exits 0 with valid tool call JSON", () => {
        const payload = JSON.stringify({
            tool_name: "Read",
            session_id: "test-session-123",
            tool_input: { file_path: "/tmp/test.txt" },
        });
        execSync(`printf '%s' '${payload.replace(/'/g, "'\\''")}' | bash "${HOOK_SCRIPT}"`, {
            env: { ...process.env, HOME: tempHome },
            encoding: "utf8",
            timeout: 5000,
        });
        assert.ok(true, "Hook should exit 0 with valid input");
    });
    it("writes observation to JSONL file", () => {
        const payload = JSON.stringify({
            tool_name: "Bash",
            session_id: "test-session-456",
            tool_input: { command: "ls" },
        });
        execSync(`printf '%s' '${payload.replace(/'/g, "'\\''")}' | bash "${HOOK_SCRIPT}"`, {
            env: {
                ...process.env,
                HOME: tempHome,
                CLAUDE_PROJECT_DIR: "/tmp/test-project",
            },
            encoding: "utf8",
            timeout: 5000,
        });
        const instinctsDir = join(tempHome, ".claude", "instincts");
        assert.ok(existsSync(instinctsDir), "instincts dir should be created");
        const dirs = readdirSync(instinctsDir).filter((dir) => dir !== "global" && dir !== "observe.sh");
        assert.ok(dirs.length > 0, "Should have created a project directory");
        const observationsFile = join(instinctsDir, dirs[0], "observations.jsonl");
        assert.ok(existsSync(observationsFile), "observations.jsonl should exist");
        const content = readFileSync(observationsFile, "utf8").trim();
        const lines = content.split("\n");
        assert.ok(lines.length >= 1, "Should have at least one observation");
        const observation = JSON.parse(lines[lines.length - 1]);
        assert.equal(observation.tool, "Bash", "Tool name should be Bash");
        assert.equal(observation.event, "tool_start", "Event should be tool_start");
        assert.ok(observation.ts, "Should have timestamp");
        assert.ok(observation.project_id, "Should have project_id");
    });
    it("writes project.json for new projects", () => {
        const instinctsDir = join(tempHome, ".claude", "instincts");
        const dirs = readdirSync(instinctsDir).filter((dir) => dir !== "global" && dir !== "observe.sh");
        const projectJson = join(instinctsDir, dirs[0], "project.json");
        assert.ok(existsSync(projectJson), "project.json should exist");
        const project = JSON.parse(readFileSync(projectJson, "utf8"));
        assert.ok(project.id, "Should have id");
        assert.ok(project.name, "Should have name");
        assert.ok(project.created_at, "Should have created_at");
    });
    it("handles tool_complete events", () => {
        const payload = JSON.stringify({
            tool_name: "Read",
            session_id: "test-session-789",
            tool_input: { file_path: "/tmp/test.txt" },
            tool_output: { content: "file contents here" },
        });
        execSync(`printf '%s' '${payload.replace(/'/g, "'\\''")}' | bash "${HOOK_SCRIPT}"`, {
            env: {
                ...process.env,
                HOME: tempHome,
                CLAUDE_PROJECT_DIR: "/tmp/test-project",
            },
            encoding: "utf8",
            timeout: 5000,
        });
        const instinctsDir = join(tempHome, ".claude", "instincts");
        const dirs = readdirSync(instinctsDir).filter((dir) => dir !== "global" && dir !== "observe.sh");
        const observationsFile = join(instinctsDir, dirs[0], "observations.jsonl");
        const lines = readFileSync(observationsFile, "utf8").trim().split("\n");
        const lastObservation = JSON.parse(lines[lines.length - 1]);
        assert.equal(lastObservation.event, "tool_complete", "Should detect tool_complete event");
    });
    it("completes within 200ms", () => {
        const payload = JSON.stringify({
            tool_name: "Grep",
            session_id: "perf-test",
            tool_input: { pattern: "test" },
        });
        const start = performance.now();
        execSync(`printf '%s' '${payload.replace(/'/g, "'\\''")}' | bash "${HOOK_SCRIPT}"`, {
            env: {
                ...process.env,
                HOME: tempHome,
                CLAUDE_PROJECT_DIR: "/tmp/test-project",
            },
            encoding: "utf8",
            timeout: 5000,
        });
        const elapsed = performance.now() - start;
        assert.ok(elapsed < 200, `Hook should complete within 200ms (took ${elapsed.toFixed(0)}ms)`);
    });
});
