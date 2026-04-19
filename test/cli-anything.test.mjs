#!/usr/bin/env node

/**
 * Test suite for CLI-Anything tool
 */

import { strict as assert } from 'node:assert';
import { test, describe } from 'node:test';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import CLIAnything from '../src/cli-anything.mjs';

describe('CLI-Anything', () => {
  let cliAnything;
  let testDir;
  let testRepoPath;

  test.before(async () => {
    testDir = join(process.cwd(), 'test-temp');
    testRepoPath = join(testDir, 'test-repo');
    
    // Create test directory and repository
    await mkdir(testRepoPath, { recursive: true });
    
    // Create a mock package.json
    const packageJson = {
      name: 'test-app',
      version: '1.0.0',
      description: 'Test application for CLI generation',
      scripts: {
        start: 'node server.js',
        dev: 'nodemon server.js',
        build: 'webpack --mode production',
        test: 'jest',
        lint: 'eslint src/'
      },
      dependencies: {
        express: '^4.18.0'
      }
    };
    
    await writeFile(
      join(testRepoPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create a mock README
    await writeFile(
      join(testRepoPath, 'README.md'),
      '# Test App\n\nThis is a test application.'
    );
    
    cliAnything = new CLIAnything({
      outputDir: join(testDir, 'generated-clis'),
      verbose: false
    });
  });

  test.after(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  test('should analyze repository structure', async () => {
    const repoInfo = await cliAnything.analyzeRepository(testRepoPath);
    
    assert.strictEqual(repoInfo.name, 'test-app');
    assert.strictEqual(repoInfo.version, '1.0.0');
    assert.strictEqual(repoInfo.description, 'Test application for CLI generation');
    assert.strictEqual(repoInfo.projectType, 'node-server');
    assert(repoInfo.scripts);
    assert.strictEqual(repoInfo.scripts.start, 'node server.js');
  });

  test('should extract commands from repository', async () => {
    const repoInfo = await cliAnything.analyzeRepository(testRepoPath);
    const commands = await cliAnything.extractCommands(testRepoPath, repoInfo);
    
    assert(commands.length > 0);
    
    const startCommand = commands.find(cmd => cmd.name === 'start');
    assert(startCommand);
    assert.strictEqual(startCommand.type, 'script');
    assert.strictEqual(startCommand.command, 'node server.js');
    
    const devCommand = commands.find(cmd => cmd.name === 'dev');
    assert(devCommand);
    assert.strictEqual(devCommand.category, 'lifecycle');
  });

  test('should generate CLI wrapper', async () => {
    const repoInfo = await cliAnything.analyzeRepository(testRepoPath);
    const commands = await cliAnything.extractCommands(testRepoPath, repoInfo);
    const wrapper = await cliAnything.generateCLIWrapper(repoInfo, commands);
    
    assert(wrapper.includes('testapp'));
    assert(wrapper.includes('CLI wrapper'));
    assert(wrapper.includes('class testappCLI'));
    assert(wrapper.includes('start:'));
    assert(wrapper.includes('dev:'));
  });

  test('should generate complete CLI', async () => {
    const result = await cliAnything.generateCLI(testRepoPath);
    
    assert(result.outputPath);
    assert(result.repoInfo);
    assert(result.commands);
    assert(result.commands.length > 0);
    
    // Check that the file was actually created
    const fs = await import('node:fs/promises');
    try {
      await fs.access(result.outputPath);
      const content = await fs.readFile(result.outputPath, 'utf8');
      assert(content.includes('test-app'));
      assert(content.includes('CLI wrapper'));
    } catch (error) {
      assert.fail('CLI file was not created');
    }
  });

  test('should categorize scripts correctly', () => {
    const testCases = [
      { name: 'start', expected: 'lifecycle' },
      { name: 'dev', expected: 'lifecycle' },
      { name: 'build', expected: 'build' },
      { name: 'test', expected: 'testing' },
      { name: 'lint', expected: 'quality' },
      { name: 'deploy', expected: 'deployment' },
      { name: 'custom', expected: 'general' }
    ];

    testCases.forEach(({ name, expected }) => {
      const result = cliAnything.categorizeScript(name);
      assert.strictEqual(result, expected, `Script ${name} should be categorized as ${expected}`);
    });
  });

  test('should detect project types', () => {
    const testCases = [
      { 
        packageJson: { dependencies: { express: '4.0.0' } }, 
        expected: 'node-server' 
      },
      { 
        packageJson: { dependencies: { react: '18.0.0' } }, 
        expected: 'react-app' 
      },
      { 
        packageJson: { dependencies: { next: '13.0.0' } }, 
        expected: 'next-app' 
      },
      { 
        packageJson: {}, 
        expected: 'generic' 
      }
    ];

    testCases.forEach(({ packageJson, expected }) => {
      const result = cliAnything.detectProjectType('.', packageJson);
      assert.strictEqual(result, expected);
    });
  });
});
