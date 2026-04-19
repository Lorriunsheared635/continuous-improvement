#!/usr/bin/env node

/**
 * Test suite for Unified Continuous Improvement Plugin
 */

import { strict as assert } from 'node:assert';
import { test, describe } from 'node:test';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import UnifiedContinuousImprovement from '../src/unified-plugin.mjs';

describe('Unified Continuous Improvement Plugin', () => {
  let unifiedPlugin;
  let testDir;

  test.before(async () => {
    testDir = join(process.cwd(), 'test-unified');
    
    unifiedPlugin = new UnifiedContinuousImprovement({
      workspace: join(testDir, 'workspace'),
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

  test('should initialize plugin with correct configuration', () => {
    assert(unifiedPlugin);
    assert(unifiedPlugin.cliAnything);
    assert(unifiedPlugin.compoundEngineering);
    assert(unifiedPlugin.pmSkills);
    assert.strictEqual(unifiedPlugin.options.workspace, join(testDir, 'workspace'));
  });

  test('should initialize new project successfully', async () => {
    const projectInfo = {
      name: 'TestProject',
      objective: 'Build a test application',
      industry: 'Technology',
      targetMarket: { segment: 'SMB' }
    };

    const result = await unifiedPlugin.initializeProject(projectInfo);

    assert(result.projectId);
    assert.strictEqual(result.projectId, 'TestProject');
    assert(result.sessionId);
    assert(result.pmAnalysis);
    assert(result.nextSteps);
    assert(Array.isArray(result.nextSteps));
    
    // Check that project context is set
    assert(unifiedPlugin.projectContext.name);
    assert.strictEqual(unifiedPlugin.projectContext.name, 'TestProject');
    assert(unifiedPlugin.currentSession);
    assert.strictEqual(unifiedPlugin.currentSession.objective, 'Build a test application');
  });

  test('should execute research phase', async () => {
    // First initialize a project
    await unifiedPlugin.initializeProject({
      name: 'ResearchTest',
      objective: 'Test research phase'
    });

    const result = await unifiedPlugin.executeResearchPhase({
      repositoryPath: './test-repo'
    });

    assert(result.brainstorm);
    assert(result.pmInsights);
    assert(result.recommendations);
    assert(result.completedAt);
    
    // Check brainstorm results
    assert(result.brainstorm.ideas);
    assert(result.brainstorm.constraints);
    assert(result.brainstorm.assumptions);
    assert(result.brainstorm.risks);
    assert(result.brainstorm.opportunities);
    
    // Check that phase is marked as completed
    assert.strictEqual(unifiedPlugin.projectContext.phases.research.status, 'completed');
  });

  test('should execute planning phase', async () => {
    // Initialize and complete research phase
    await unifiedPlugin.initializeProject({
      name: 'PlanningTest',
      objective: 'Test planning phase'
    });
    await unifiedPlugin.executeResearchPhase();

    const result = await unifiedPlugin.executePlanningPhase({
      timeline: '2 weeks',
      budget: '$5000'
    });

    assert(result.corePlan);
    assert(result.integratedTimeline);
    assert(result.risks);
    assert(result.completedAt);
    
    // Check core plan structure
    assert(result.corePlan.objective);
    assert(result.corePlan.approach);
    assert(result.corePlan.steps);
    assert(result.corePlan.timeline);
    assert(result.corePlan.successCriteria);
    
    // Check that phase is marked as completed
    assert.strictEqual(unifiedPlugin.projectContext.phases.planning.status, 'completed');
  });

  test('should execute execution phase', async () => {
    // Initialize and complete previous phases
    await unifiedPlugin.initializeProject({
      name: 'ExecutionTest',
      objective: 'Test execution phase'
    });
    await unifiedPlugin.executeResearchPhase();
    await unifiedPlugin.executePlanningPhase();

    const progressCallback = (message) => {
      assert(typeof message === 'string');
    };

    const result = await unifiedPlugin.executeWorkingPhase(progressCallback);

    assert(result.coreWork);
    assert(result.metrics);
    assert(result.issues);
    assert(result.solutions);
    assert(result.completedAt);
    
    // Check work results
    assert(result.coreWork.steps);
    assert(Array.isArray(result.coreWork.steps));
    
    // Check that phase is marked as completed
    assert.strictEqual(unifiedPlugin.projectContext.phases.execution.status, 'completed');
  });

  test('should execute review phase', async () => {
    // Initialize and complete all previous phases
    await unifiedPlugin.initializeProject({
      name: 'ReviewTest',
      objective: 'Test review phase'
    });
    await unifiedPlugin.executeResearchPhase();
    await unifiedPlugin.executePlanningPhase();
    await unifiedPlugin.executeWorkingPhase();

    const result = await unifiedPlugin.executeReviewPhase({
      quality: 'high',
      performance: 'fast'
    });

    assert(result.coreReview);
    assert(result.performanceReview);
    assert(result.processImprovements);
    assert(result.comprehensiveReport);
    assert(result.learnings);
    assert(result.recommendations);
    assert(result.completedAt);
    
    // Check review structure
    assert(result.coreReview.review);
    assert(result.coreReview.learnings);
    assert(Array.isArray(result.coreReview.learnings));
    
    // Check that phase is marked as completed
    assert.strictEqual(unifiedPlugin.projectContext.phases.review.status, 'completed');
    assert(unifiedPlugin.projectContext.completedAt);
  });

  test('should execute complete workflow end-to-end', async () => {
    const projectInfo = {
      name: 'WorkflowTest',
      objective: 'Test complete workflow',
      industry: 'Software',
      targetMarket: { segment: 'Enterprise' }
    };

    const result = await unifiedPlugin.executeCompleteWorkflow(projectInfo, {
      researchContext: { repositoryPath: './test-repo' },
      progressCallback: (message) => {
        assert(typeof message === 'string');
      }
    });

    assert(result.project);
    assert.strictEqual(result.project, 'WorkflowTest');
    assert(result.sessionId);
    assert(result.phases);
    assert(result.summary);
    assert(result.completedAt);
    
    // Check all phases are present
    assert(result.phases.initialization);
    assert(result.phases.research);
    assert(result.phases.planning);
    assert(result.phases.execution);
    assert(result.phases.review);
    
    // Check that project is marked as completed
    assert.strictEqual(unifiedPlugin.projectContext.phases.review.status, 'completed');
  });

  test('should get project status', async () => {
    // Test with no active project
    const emptyPlugin = new UnifiedContinuousImprovement({
      workspace: join(testDir, 'empty-workspace'),
      verbose: false
    });
    
    const emptyStatus = await emptyPlugin.getProjectStatus();
    assert.strictEqual(emptyStatus.status, 'No active project');

    // Test with active project
    await unifiedPlugin.initializeProject({
      name: 'StatusTest',
      objective: 'Test status reporting'
    });

    const status = await unifiedPlugin.getProjectStatus();
    
    assert(status.project);
    assert.strictEqual(status.project, 'StatusTest');
    assert(status.sessionId);
    assert(status.currentPhase);
    assert(status.phaseStatus);
    assert(status.progress);
    assert(status.nextSteps);
    
    // Check progress calculation
    assert(typeof status.progress.completed === 'number');
    assert(typeof status.progress.total === 'number');
    assert(typeof status.progress.percentage === 'number');
  });

  test('should handle errors gracefully', async () => {
    // Test research phase without initialization
    const newPlugin = new UnifiedContinuousImprovement({
      workspace: join(testDir, 'error-test'),
      verbose: false
    });

    try {
      await newPlugin.executeResearchPhase();
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert(error.message.includes('No active session'));
    }

    // Test planning phase without research
    await newPlugin.initializeProject({
      name: 'ErrorTest',
      objective: 'Test error handling'
    });

    try {
      await newPlugin.executePlanningPhase();
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert(error.message.includes('Research phase must be completed first'));
    }
  });

  test('should generate next steps correctly', () => {
    const nextSteps = unifiedPlugin.getNextSteps('research');
    assert(Array.isArray(nextSteps));
    assert(nextSteps.some(step => step.includes('brainstorming')));
    
    const planningSteps = unifiedPlugin.getNextSteps('planning');
    assert(planningSteps.some(step => step.includes('plan')));
    
    const completedSteps = unifiedPlugin.getNextSteps('completed');
    assert(completedSteps.some(step => step.includes('next iteration')) || completedSteps.some(step => step.includes('Apply learnings')));
  });

  test('should calculate progress correctly', () => {
    // Mock project context with different phase statuses
    unifiedPlugin.projectContext.phases = {
      research: { status: 'completed' },
      planning: { status: 'completed' },
      execution: { status: 'active' },
      review: { status: 'pending' }
    };

    const progress = unifiedPlugin.calculateProgress();
    
    assert.strictEqual(progress.completed, 2);
    assert.strictEqual(progress.total, 4);
    assert.strictEqual(progress.percentage, 50);
  });

  test('should identify current phase correctly', () => {
    // Test with active phase
    unifiedPlugin.projectContext.phases = {
      research: { status: 'completed' },
      planning: { status: 'active' },
      execution: { status: 'pending' },
      review: { status: 'pending' }
    };

    assert.strictEqual(unifiedPlugin.getCurrentPhase(), 'planning');

    // Test with no active phases
    unifiedPlugin.projectContext.phases = {
      research: { status: 'completed' },
      planning: { status: 'completed' },
      execution: { status: 'completed' },
      review: { status: 'completed' }
    };

    assert.strictEqual(unifiedPlugin.getCurrentPhase(), 'completed');

    // Test with pending phases
    unifiedPlugin.projectContext.phases = {
      research: { status: 'pending' },
      planning: { status: 'pending' },
      execution: { status: 'pending' },
      review: { status: 'pending' }
    };

    assert.strictEqual(unifiedPlugin.getCurrentPhase(), 'research');
  });

  test('should extract key insights from PM analysis', () => {
    const mockPMAnalysis = {
      summary: {
        keyInsights: ['Insight 1', 'Insight 2']
      },
      results: {
        skill1: { insights: ['Skill Insight 1'] },
        skill2: { insights: ['Skill Insight 2', 'Skill Insight 3'] }
      }
    };

    const insights = unifiedPlugin.extractKeyInsights(mockPMAnalysis);
    
    assert(Array.isArray(insights));
    assert(insights.length <= 10); // Should limit to top 10
    assert(insights.includes('Insight 1'));
    assert(insights.includes('Skill Insight 1'));
  });

  test('should aggregate risks from multiple sources', () => {
    const corePlan = { risks: ['Risk 1', 'Risk 2'] };
    const gtmStrategy = { strategy: { risks: ['Risk 2', 'Risk 3'] } };
    const roadmap = { roadmap: { risks: ['Risk 4'] } };

    const risks = unifiedPlugin.aggregateRisks(corePlan, gtmStrategy, roadmap);
    
    assert(Array.isArray(risks));
    assert.strictEqual(risks.length, 4); // Should remove duplicates
    assert(risks.includes('Risk 1'));
    assert(risks.includes('Risk 2'));
    assert(risks.includes('Risk 3'));
    assert(risks.includes('Risk 4'));
  });

  test('should save and load project context', async () => {
    await unifiedPlugin.initializeProject({
      name: 'PersistenceTest',
      objective: 'Test persistence'
    });

    // Check that project context is saved
    const contextPath = join(unifiedPlugin.options.workspace, 'project-context.json');
    const fs = await import('node:fs/promises');
    
    try {
      const content = await fs.readFile(contextPath, 'utf8');
      const savedContext = JSON.parse(content);
      
      assert.strictEqual(savedContext.name, 'PersistenceTest');
      assert.strictEqual(savedContext.objective, 'Test persistence');
      assert(savedContext.initializedAt);
    } catch (error) {
      assert.fail('Project context file was not saved');
    }
  });
});
