#!/usr/bin/env node

/**
 * Test suite for Compound Engineering plugin
 */

import { strict as assert } from 'node:assert';
import { test, describe } from 'node:test';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import CompoundEngineering from '../src/compound-engineering.mjs';

describe('Compound Engineering', () => {
  let compoundEngineering;
  let testDir;

  test.before(async () => {
    testDir = join(process.cwd(), 'test-compound');
    
    compoundEngineering = new CompoundEngineering({
      workspace: join(testDir, 'workspace'),
      learningsPath: join(testDir, 'learnings.json'),
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

  test('should start a new session', async () => {
    const session = await compoundEngineering.startSession(
      'Test Project',
      'Build a new feature for user management'
    );

    assert(session.id);
    assert.strictEqual(session.projectName, 'Test Project');
    assert.strictEqual(session.objective, 'Build a new feature for user management');
    assert.strictEqual(session.phase, 'brainstorming');
    assert(session.phases.brainstorming.status === 'active');
    assert(session.startTime);
  });

  test('should execute brainstorming phase', async () => {
    await compoundEngineering.startSession('Test Project', 'Test objective');
    
    const brainstormResults = await compoundEngineering.brainstorm({
      context: 'Some context for brainstorming'
    });

    assert(brainstormResults.ideas);
    assert(brainstormResults.constraints);
    assert(brainstormResults.assumptions);
    assert(brainstormResults.risks);
    assert(brainstormResults.opportunities);
    assert(brainstormResults.timestamp);
  });

  test('should execute planning phase', async () => {
    await compoundEngineering.startSession('Test Project', 'Test objective');
    
    const brainstormResults = {
      ideas: ['Idea 1', 'Idea 2'],
      constraints: ['Constraint 1'],
      assumptions: ['Assumption 1'],
      risks: ['Risk 1'],
      opportunities: ['Opportunity 1']
    };

    const plan = await compoundEngineering.plan(brainstormResults, {
      timeline: '2 weeks',
      budget: '$1000'
    });

    assert(plan.objective);
    assert(plan.approach);
    assert(plan.steps);
    assert(plan.timeline);
    assert(plan.resources);
    assert(plan.risks);
    assert(plan.mitigations);
    assert(plan.successCriteria);
    assert(plan.timestamp);
  });

  test('should execute working phase', async () => {
    await compoundEngineering.startSession('Test Project', 'Test objective');
    
    const plan = {
      steps: [
        { description: 'Step 1', estimatedTime: '30 minutes' },
        { description: 'Step 2', estimatedTime: '1 hour' }
      ]
    };

    const workResults = await compoundEngineering.work(plan);

    assert(workResults.steps);
    assert.strictEqual(workResults.steps.length, 2);
    assert(workResults.issues);
    assert(workResults.solutions);
    assert(workResults.timestamp);
    
    // Check each step result
    workResults.steps.forEach(step => {
      assert(step.step);
      assert(step.status);
      assert(step.startTime);
      assert(step.endTime);
    });
  });

  test('should execute reviewing phase', async () => {
    await compoundEngineering.startSession('Test Project', 'Test objective');
    
    const workResults = {
      steps: [
        { step: 'Step 1', status: 'completed', issues: [], solutions: [] },
        { step: 'Step 2', status: 'completed', issues: [], solutions: [] }
      ],
      issues: [],
      solutions: []
    };

    const reviewResults = await compoundEngineering.review(workResults);

    assert(reviewResults.review);
    assert(reviewResults.learnings);
    assert(reviewResults.review.sessionId);
    assert(reviewResults.review.overallScore);
    assert(reviewResults.review.strengths);
    assert(reviewResults.review.weaknesses);
    assert(reviewResults.review.improvements);
    assert(reviewResults.review.recommendations);
  });

  test('should save and load learnings', async () => {
    // Start and complete a session to generate learnings
    await compoundEngineering.startSession('Test Project', 'Test objective');
    
    const brainstormResults = await compoundEngineering.brainstorm();
    const plan = await compoundEngineering.plan(brainstormResults);
    const workResults = await compoundEngineering.work(plan);
    await compoundEngineering.review(workResults);

    // Load learnings
    await compoundEngineering.loadLearnings();
    
    const allLearnings = compoundEngineering.getAllLearnings();
    assert(Array.isArray(allLearnings));
    
    // Test search functionality
    const searchResults = compoundEngineering.searchLearnings('test');
    assert(Array.isArray(searchResults));
  });

  test('should generate session IDs and learning IDs correctly', () => {
    const sessionId1 = compoundEngineering.generateSessionId();
    const sessionId2 = compoundEngineering.generateSessionId();
    
    assert(sessionId1 !== sessionId2);
    assert(sessionId1.startsWith('session_'));
    assert(sessionId2.startsWith('session_'));
    
    const learningId1 = compoundEngineering.generateLearningId();
    const learningId2 = compoundEngineering.generateLearningId();
    
    assert(learningId1 !== learningId2);
    assert(learningId1.startsWith('learning_'));
    assert(learningId2.startsWith('learning_'));
  });

  test('should categorize scripts correctly', () => {
    const testCases = [
      { step: { description: 'Set up development environment' }, expected: true },
      { step: { description: 'Implement core functionality' }, expected: true },
      { step: { description: 'Test and validate' }, expected: true }
    ];

    testCases.forEach(({ step, expected }) => {
      const steps = compoundEngineering.createExecutionSteps({ description: 'Test approach' }, []);
      assert(Array.isArray(steps));
      assert(steps.length > 0);
      steps.forEach(s => {
        assert(s.description);
        assert(s.estimatedTime);
      });
    });
  });

  test('should calculate process metrics correctly', () => {
    const mockSession = {
      id: 'test-session',
      startTime: '2024-01-01T10:00:00.000Z',
      endTime: '2024-01-01T12:00:00.000Z',
      phases: {
        brainstorming: { startTime: '2024-01-01T10:00:00.000Z', endTime: '2024-01-01T10:30:00.000Z' },
        planning: { startTime: '2024-01-01T10:30:00.000Z', endTime: '2024-01-01T11:00:00.000Z' },
        working: { startTime: '2024-01-01T11:00:00.000Z', endTime: '2024-01-01T11:45:00.000Z' },
        reviewing: { startTime: '2024-01-01T11:45:00.000Z', endTime: '2024-01-01T12:00:00.000Z' }
      }
    };

    const metrics = compoundEngineering.calculateProcessMetrics(mockSession);
    
    assert(metrics.totalDuration);
    assert(metrics.phaseDurations);
    assert(metrics.phaseDurations.brainstorming);
    assert(metrics.phaseDurations.planning);
    assert(metrics.phaseDurations.working);
    assert(metrics.phaseDurations.reviewing);
  });

  test('should calculate outcome metrics correctly', () => {
    const workResults = {
      steps: [
        { status: 'completed' },
        { status: 'completed' },
        { status: 'failed' }
      ],
      issues: ['Issue 1', 'Issue 2'],
      solutions: ['Solution 1']
    };

    const metrics = compoundEngineering.calculateOutcomeMetrics(workResults);
    
    assert.strictEqual(metrics.stepsCompleted, 2);
    assert.strictEqual(metrics.issuesEncountered, 2);
    assert.strictEqual(metrics.solutionsApplied, 1);
  });
});
