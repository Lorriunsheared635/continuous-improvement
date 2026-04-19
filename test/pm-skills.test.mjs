#!/usr/bin/env node

/**
 * Test suite for PM-Skills collection
 */

import { strict as assert } from 'node:assert';
import { test, describe } from 'node:test';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import PMSkills from '../src/pm-skills.mjs';

describe('PM-Skills', () => {
  let pmSkills;
  let testDir;

  test.before(async () => {
    testDir = join(process.cwd(), 'test-pm');
    
    pmSkills = new PMSkills({
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

  test('should list available skills', () => {
    const skills = pmSkills.getAvailableSkills();
    
    assert(Array.isArray(skills));
    assert.strictEqual(skills.length, 8);
    
    const skillNames = skills.map(s => s.name);
    assert(skillNames.includes('growthLoops'));
    assert(skillNames.includes('marketResearch'));
    assert(skillNames.includes('gtmStrategy'));
    assert(skillNames.includes('userPersonas'));
    assert(skillNames.includes('competitiveAnalysis'));
    assert(skillNames.includes('valueProposition'));
    assert(skillNames.includes('productRoadmap'));
    assert(skillNames.includes('metricsDefinition'));
  });

  test('should execute growth loops skill', async () => {
    const input = {
      product: { name: 'Test Product' },
      users: [{ type: 'business' }],
      metrics: { revenue: 'subscription' }
    };

    const result = await pmSkills.executeSkill('growthLoops', input);

    assert(result.loops);
    assert(result.loops.acquisition);
    assert(result.loops.activation);
    assert(result.loops.retention);
    assert(result.loops.referral);
    assert(result.loops.revenue);
    assert(result.insights);
    assert(result.recommendations);
    assert(result.kpis);
    assert(result.timestamp);
    assert(result.savedTo);
  });

  test('should execute market research skill', async () => {
    const input = {
      product: { name: 'Test Product' },
      industry: 'Technology',
      targetMarket: { segment: 'SMB' }
    };

    const result = await pmSkills.executeSkill('marketResearch', input);

    assert(result.research);
    assert(result.research.marketSize);
    assert(result.research.trends);
    assert(result.research.competitors);
    assert(result.research.opportunities);
    assert(result.research.threats);
    assert(result.research.customerNeeds);
    assert(result.insights);
    assert(result.recommendations);
    assert(result.risks);
    assert(result.opportunities);
    assert(result.timestamp);
  });

  test('should execute GTM strategy skill', async () => {
    const input = {
      product: { name: 'Test Product' },
      market: { size: 'Large', competition: 'Medium' },
      budget: '$50,000',
      timeline: '12 weeks'
    };

    const result = await pmSkills.executeSkill('gtmStrategy', input);

    assert(result.strategy);
    assert(result.strategy.positioning);
    assert(result.strategy.pricing);
    assert(result.strategy.channels);
    assert(result.strategy.launch);
    assert(result.strategy.sales);
    assert(result.strategy.marketing);
    assert(result.insights);
    assert(result.recommendations);
    assert(result.timeline);
    assert(result.budget);
    assert(result.kpis);
    assert(result.timestamp);
  });

  test('should execute user personas skill', async () => {
    const input = {
      targetUsers: [{ role: 'manager' }, { role: 'developer' }],
      researchData: { interviews: 10, surveys: 50 }
    };

    const result = await pmSkills.executeSkill('userPersonas', input);

    assert(result.personas);
    assert(result.journeys);
    assert(Array.isArray(result.personas));
    assert(result.personas.length > 0);
    assert(result.personas[0].name);
    assert(result.personas[0].role);
    assert(result.personas[0].demographics);
    assert(result.personas[0].goals);
    assert(result.personas[0].painPoints);
    assert(result.insights);
    assert(result.recommendations);
    assert(result.timestamp);
  });

  test('should execute competitive analysis skill', async () => {
    const input = {
      product: { name: 'Test Product', features: ['A', 'B'] },
      competitors: [{ name: 'Competitor A', features: ['A', 'C'] }],
      market: { growth: 'High' }
    };

    const result = await pmSkills.executeSkill('competitiveAnalysis', input);

    assert(result.analysis);
    assert(result.analysis.directCompetitors);
    assert(result.analysis.indirectCompetitors);
    assert(result.analysis.positioning);
    assert(result.analysis.strengths);
    assert(result.analysis.weaknesses);
    assert(result.analysis.opportunities);
    assert(result.analysis.threats);
    assert(result.insights);
    assert(result.recommendations);
    assert(result.timestamp);
  });

  test('should execute value proposition skill', async () => {
    const input = {
      product: { name: 'Test Product', benefits: ['Efficiency', 'Cost savings'] },
      customers: { pains: ['Manual work'], gains: ['Automation'] },
      market: { competition: 'High' }
    };

    const result = await pmSkills.executeSkill('valueProposition', input);

    assert(result.analysis);
    assert(result.analysis.customerJobs);
    assert(result.analysis.pains);
    assert(result.analysis.gains);
    assert(result.analysis.products);
    assert(result.analysis.valueProposition);
    assert(result.analysis.validation);
    assert(result.insights);
    assert(result.recommendations);
    assert(result.timestamp);
  });

  test('should execute product roadmap skill', async () => {
    const input = {
      product: { name: 'Test Product', stage: 'MVP' },
      vision: 'Become market leader',
      goals: ['Increase users', 'Improve retention'],
      resources: { team: 5, budget: '$100k' }
    };

    const result = await pmSkills.executeSkill('productRoadmap', input);

    assert(result.roadmap);
    assert(result.roadmap.vision);
    assert(result.roadmap.strategy);
    assert(result.roadmap.initiatives);
    assert(result.roadmap.features);
    assert(result.roadmap.timeline);
    assert(result.roadmap.dependencies);
    assert(result.roadmap.risks);
    assert(result.insights);
    assert(result.recommendations);
    assert(result.kpis);
    assert(result.timestamp);
  });

  test('should execute metrics definition skill', async () => {
    const input = {
      product: { type: 'SaaS', stage: 'Growth' },
      business: { model: 'Subscription', market: 'B2B' },
      goals: ['Revenue growth', 'User retention']
    };

    const result = await pmSkills.executeSkill('metricsDefinition', input);

    assert(result.metrics);
    assert(result.metrics.productMetrics);
    assert(result.metrics.businessMetrics);
    assert(result.metrics.userMetrics);
    assert(result.metrics.technicalMetrics);
    assert(result.metrics.kpis);
    assert(result.metrics.reporting);
    assert(result.insights);
    assert(result.recommendations);
    assert(result.implementation);
    assert(result.timestamp);
  });

  test('should run comprehensive product analysis', async () => {
    const productInfo = {
      product: { name: 'Test Product', type: 'SaaS' },
      industry: 'Technology',
      targetMarket: { segment: 'SMB', size: 'Medium' }
    };

    const result = await pmSkills.runProductAnalysis(productInfo);

    assert(result.results);
    assert(result.summary);
    assert(result.savedTo);
    
    // Check that all skills were attempted
    assert(Object.keys(result.results).length === 8);
    
    // Check summary
    assert.strictEqual(result.summary.totalSkills, 8);
    assert(result.summary.completedSkills >= 0);
    assert(Array.isArray(result.summary.keyInsights));
    assert(Array.isArray(result.summary.recommendations));
    assert(Array.isArray(result.summary.risks));
    assert(Array.isArray(result.summary.opportunities));
  });

  test('should handle invalid skill names', async () => {
    try {
      await pmSkills.executeSkill('invalidSkill', {});
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert(error.message.includes('Unknown skill'));
    }
  });

  test('should save results to workspace', async () => {
    const input = { product: { name: 'Test' } };
    const result = await pmSkills.executeSkill('growthLoops', input);

    // Check that file was created
    const fs = await import('node:fs/promises');
    try {
      await fs.access(result.savedTo);
      const content = await fs.readFile(result.savedTo, 'utf8');
      const parsed = JSON.parse(content);
      assert(parsed.loops);
      assert(parsed.timestamp);
    } catch (error) {
      assert.fail('Result file was not created or is invalid');
    }
  });
});
