#!/usr/bin/env node

/**
 * Unified Continuous-Improvement Plugin
 * 
 * Combines CLI-Anything, Compound Engineering, and PM-Skills into a single
 * cohesive plugin that follows the 7 Laws of AI Agent Discipline.
 */

import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Import individual components
import CLIAnything from './cli-anything.mjs';
import CompoundEngineering from './compound-engineering.mjs';
import PMSkills from './pm-skills.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

class UnifiedContinuousImprovement {
  constructor(options = {}) {
    this.options = {
      workspace: options.workspace || './ci-workspace',
      verbose: options.verbose || false,
      ...options
    };
    
    // Initialize components
    this.cliAnything = new CLIAnything({
      outputDir: join(this.options.workspace, 'generated-clis'),
      verbose: this.options.verbose
    });
    
    this.compoundEngineering = new CompoundEngineering({
      workspace: join(this.options.workspace, 'compound'),
      learningsPath: join(this.options.workspace, 'learnings.json'),
      verbose: this.options.verbose
    });
    
    this.pmSkills = new PMSkills({
      workspace: join(this.options.workspace, 'pm-skills'),
      verbose: this.options.verbose
    });
    
    this.currentSession = null;
    this.projectContext = {};
  }

  /**
   * Initialize a new project with comprehensive analysis
   */
  async initializeProject(projectInfo) {
    this.log(`🚀 Initializing project: ${projectInfo.name}`);
    
    await this.ensureWorkspace();
    
    // Store project context
    this.projectContext = {
      ...projectInfo,
      initializedAt: new Date().toISOString(),
      phases: {
        research: { status: 'pending', startedAt: null },
        planning: { status: 'pending', startedAt: null },
        execution: { status: 'pending', startedAt: null },
        review: { status: 'pending', startedAt: null }
      }
    };
    
    // Run initial PM analysis
    this.log(`📊 Running initial product analysis...`);
    const pmAnalysis = await this.pmSkills.runProductAnalysis({
      product: projectInfo.product || {},
      industry: projectInfo.industry || '',
      targetMarket: projectInfo.targetMarket || {}
    });
    
    this.projectContext.pmAnalysis = pmAnalysis;
    
    // Start compound engineering session
    this.log(`🔧 Starting compound engineering session...`);
    this.currentSession = await this.compoundEngineering.startSession(
      projectInfo.name,
      projectInfo.objective || 'Build and improve the product'
    );
    
    this.projectContext.sessionId = this.currentSession.id;
    
    // Save project context
    await this.saveProjectContext();
    
    this.log(`✅ Project initialized successfully`);
    return {
      projectId: this.projectContext.name,
      sessionId: this.currentSession.id,
      pmAnalysis: pmAnalysis.summary,
      nextSteps: this.getNextSteps('research')
    };
  }

  /**
   * Execute research phase using PM-Skills and existing analysis
   */
  async executeResearchPhase(additionalContext = {}) {
    if (!this.currentSession) {
      throw new Error('No active session. Call initializeProject() first.');
    }
    
    this.log(`🔍 Starting research phase...`);
    this.projectContext.phases.research.status = 'active';
    this.projectContext.phases.research.startedAt = new Date().toISOString();
    
    // Brainstorm with compound engineering
    const brainstormResults = await this.compoundEngineering.brainstorm({
      ...this.projectContext.pmAnalysis,
      ...additionalContext
    });
    
    // Extract key insights from PM analysis
    const keyInsights = this.extractKeyInsights(this.projectContext.pmAnalysis);
    
    // Generate CLI for existing tools if repository provided
    let cliGeneration = null;
    if (additionalContext.repositoryPath) {
      this.log(`🛠️  Generating CLI for repository...`);
      cliGeneration = await this.cliAnything.generateCLI(
        additionalContext.repositoryPath
      );
    }
    
    const researchResults = {
      brainstorm: brainstormResults,
      pmInsights: keyInsights,
      cliTools: cliGeneration,
      recommendations: this.generateResearchRecommendations(brainstormResults, keyInsights),
      completedAt: new Date().toISOString()
    };
    
    this.projectContext.researchResults = researchResults;
    this.projectContext.phases.research.status = 'completed';
    
    await this.saveProjectContext();
    
    this.log(`✅ Research phase completed`);
    return {
      ...researchResults,
      nextSteps: this.getNextSteps('planning')
    };
  }

  /**
   * Execute planning phase with integrated insights
   */
  async executePlanningPhase(preferences = {}) {
    if (!this.currentSession || !this.projectContext.researchResults) {
      throw new Error('Research phase must be completed first.');
    }
    
    this.log(`📋 Starting planning phase...`);
    this.projectContext.phases.planning.status = 'active';
    this.projectContext.phases.planning.startedAt = new Date().toISOString();
    
    // Create comprehensive plan using compound engineering
    const plan = await this.compoundEngineering.plan(
      this.projectContext.researchResults.brainstorm,
      {
        ...preferences,
        pmInsights: this.projectContext.researchResults.pmInsights,
        availableTools: this.projectContext.researchResults.cliTools
      }
    );
    
    // Enhance plan with GTM strategy from PM-Skills
    let gtmStrategy = null;
    if (this.projectContext.pmAnalysis.results.gtmStrategy) {
      gtmStrategy = this.projectContext.pmAnalysis.results.gtmStrategy;
    }
    
    // Create roadmap with PM-Skills
    let roadmap = null;
    if (this.projectContext.pmAnalysis.results.productRoadmap) {
      roadmap = this.projectContext.pmAnalysis.results.productRoadmap;
    }
    
    const planningResults = {
      corePlan: plan,
      gtmStrategy,
      roadmap,
      metrics: this.projectContext.pmAnalysis.results.metricsDefinition,
      integratedTimeline: this.createIntegratedTimeline(plan, gtmStrategy, roadmap),
      risks: this.aggregateRisks(plan, gtmStrategy, roadmap),
      completedAt: new Date().toISOString()
    };
    
    this.projectContext.planningResults = planningResults;
    this.projectContext.phases.planning.status = 'completed';
    
    await this.saveProjectContext();
    
    this.log(`✅ Planning phase completed`);
    return {
      ...planningResults,
      nextSteps: this.getNextSteps('execution')
    };
  }

  /**
   * Execute working phase with automated tool support
   */
  async executeWorkingPhase(progressCallback = null) {
    if (!this.currentSession || !this.projectContext.planningResults) {
      throw new Error('Planning phase must be completed first.');
    }
    
    this.log(`🔧 Starting execution phase...`);
    this.projectContext.phases.execution.status = 'active';
    this.projectContext.phases.execution.startedAt = new Date().toISOString();
    
    // Execute core plan using compound engineering
    const workResults = await this.compoundEngineering.work(
      this.projectContext.planningResults.corePlan,
      progressCallback
    );
    
    // Apply generated CLI tools if available
    let toolExecution = null;
    if (this.projectContext.researchResults.cliTools) {
      toolExecution = await this.executeGeneratedTools(
        this.projectContext.researchResults.cliTools,
        workResults
      );
    }
    
    // Track metrics during execution
    const metricsTracking = this.trackExecutionMetrics(workResults);
    
    const executionResults = {
      coreWork: workResults,
      toolExecution,
      metrics: metricsTracking,
      issues: workResults.issues || [],
      solutions: workResults.solutions || [],
      completedAt: new Date().toISOString()
    };
    
    this.projectContext.executionResults = executionResults;
    this.projectContext.phases.execution.status = 'completed';
    
    await this.saveProjectContext();
    
    this.log(`✅ Execution phase completed`);
    return {
      ...executionResults,
      nextSteps: this.getNextSteps('review')
    };
  }

  /**
   * Execute review phase with comprehensive analysis
   */
  async executeReviewPhase(criteria = null) {
    if (!this.currentSession || !this.projectContext.executionResults) {
      throw new Error('Execution phase must be completed first.');
    }
    
    this.log(`🔍 Starting review phase...`);
    this.projectContext.phases.review.status = 'active';
    this.projectContext.phases.review.startedAt = new Date().toISOString();
    
    // Core review using compound engineering
    const coreReview = await this.compoundEngineering.review(
      this.projectContext.executionResults.coreWork,
      criteria
    );
    
    // Product performance review using PM-Skills metrics
    const performanceReview = this.conductPerformanceReview(
      this.projectContext.executionResults,
      this.projectContext.planningResults.metrics
    );
    
    // Process improvement analysis
    const processImprovements = this.analyzeProcessImprovements(
      this.projectContext,
      coreReview
    );
    
    // Generate comprehensive report
    const comprehensiveReport = this.generateComprehensiveReport({
      project: this.projectContext,
      coreReview,
      performanceReview,
      processImprovements
    });
    
    const reviewResults = {
      coreReview,
      performanceReview,
      processImprovements,
      comprehensiveReport,
      learnings: coreReview.learnings,
      recommendations: this.aggregateRecommendations(
        coreReview,
        performanceReview,
        processImprovements
      ),
      completedAt: new Date().toISOString()
    };
    
    this.projectContext.reviewResults = reviewResults;
    this.projectContext.phases.review.status = 'completed';
    this.projectContext.completedAt = new Date().toISOString();
    
    await this.saveProjectContext();
    
    this.log(`✅ Review phase completed`);
    return reviewResults;
  }

  /**
   * Execute complete workflow end-to-end
   */
  async executeCompleteWorkflow(projectInfo, options = {}) {
    this.log(`🚀 Starting complete continuous improvement workflow...`);
    
    // Initialize
    const init = await this.initializeProject(projectInfo);
    
    // Research
    const research = await this.executeResearchPhase(options.researchContext || {});
    
    // Planning
    const planning = await this.executePlanningPhase(options.planningPreferences || {});
    
    // Execution
    const execution = await this.executeWorkingPhase(options.progressCallback);
    
    // Review
    const review = await this.executeReviewPhase(options.reviewCriteria);
    
    const workflowResults = {
      project: projectInfo.name,
      sessionId: this.currentSession.id,
      phases: {
        initialization: init,
        research,
        planning,
        execution,
        review
      },
      summary: this.generateWorkflowSummary(init, research, planning, execution, review),
      completedAt: new Date().toISOString()
    };
    
    this.log(`🎉 Complete workflow finished successfully`);
    return workflowResults;
  }

  /**
   * Get project status and current context
   */
  async getProjectStatus() {
    if (!this.projectContext.name) {
      return { status: 'No active project' };
    }
    
    return {
      project: this.projectContext.name,
      sessionId: this.currentSession?.id,
      currentPhase: this.getCurrentPhase(),
      phaseStatus: this.projectContext.phases,
      progress: this.calculateProgress(),
      nextSteps: this.getNextSteps(this.getCurrentPhase())
    };
  }

  /**
   * Helper methods
   */
  async ensureWorkspace() {
    try {
      await mkdir(this.options.workspace, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  async saveProjectContext() {
    const contextPath = join(this.options.workspace, 'project-context.json');
    await writeFile(contextPath, JSON.stringify(this.projectContext, null, 2));
  }

  extractKeyInsights(pmAnalysis) {
    const insights = [];
    
    if (pmAnalysis.summary) {
      insights.push(...pmAnalysis.summary.keyInsights);
    }
    
    Object.values(pmAnalysis.results || {}).forEach(result => {
      if (result.insights) {
        insights.push(...result.insights);
      }
    });
    
    return insights.slice(0, 10); // Top 10 insights
  }

  generateResearchRecommendations(brainstormResults, pmInsights) {
    return [
      ...brainstormResults.ideas.slice(0, 3).map(idea => `Explore: ${idea}`),
      ...pmInsights.slice(0, 3).map(insight => `Consider: ${insight}`)
    ];
  }

  createIntegratedTimeline(corePlan, gtmStrategy, roadmap) {
    const timeline = {
      development: corePlan.timeline || {},
      marketing: gtmStrategy?.timeline || {},
      product: roadmap?.roadmap?.timeline || {}
    };
    
    return {
      phases: timeline,
      dependencies: this.extractDependencies(corePlan, gtmStrategy, roadmap),
      milestones: this.extractMilestones(corePlan, gtmStrategy, roadmap)
    };
  }

  aggregateRisks(corePlan, gtmStrategy, roadmap) {
    const risks = [];
    
    if (corePlan.risks) risks.push(...corePlan.risks);
    if (gtmStrategy?.strategy?.risks) risks.push(...gtmStrategy.strategy.risks);
    if (roadmap?.roadmap?.risks) risks.push(...roadmap.roadmap.risks);
    
    return [...new Set(risks)]; // Remove duplicates
  }

  async executeGeneratedTools(cliTools, workResults) {
    // Placeholder for tool execution logic
    return {
      toolsGenerated: cliTools.commands?.length || 0,
      executionStatus: 'ready',
      integrationPoints: this.identifyIntegrationPoints(cliTools, workResults)
    };
  }

  identifyIntegrationPoints(cliTools, workResults) {
    // Analyze where generated CLI tools can be integrated
    const integrationPoints = [
      'build automation',
      'testing automation',
      'deployment automation'
    ];
    
    if (!workResults?.steps) {
      return integrationPoints.slice(0, 1); // Return first one as default
    }
    
    return integrationPoints.filter(point => 
      workResults.steps.some(step => 
        step.description && step.description.toLowerCase().includes(point)
      )
    );
  }

  trackExecutionMetrics(workResults) {
    return {
      stepsCompleted: workResults.steps?.filter(s => s.status === 'completed').length || 0,
      issuesResolved: workResults.solutions?.length || 0,
      timeSpent: this.calculateTimeSpent(workResults),
      qualityScore: this.calculateQualityScore(workResults)
    };
  }

  conductPerformanceReview(executionResults, plannedMetrics) {
    // Compare actual vs planned metrics
    return {
      actualMetrics: executionResults.metrics,
      plannedMetrics: plannedMetrics?.metrics,
      variance: this.calculateMetricVariance(executionResults.metrics, plannedMetrics?.metrics),
      performanceScore: this.calculatePerformanceScore(executionResults)
    };
  }

  analyzeProcessImprovements(projectContext, coreReview) {
    return {
      processEfficiencies: this.identifyProcessEfficiencies(projectContext),
      bottleneckAnalysis: this.analyzeBottlenecks(projectContext),
      improvementOpportunities: this.identifyImprovementOpportunities(coreReview),
      automationPotential: this.assessAutomationPotential(projectContext)
    };
  }

  generateComprehensiveReport(data) {
    return {
      executiveSummary: this.createExecutiveSummary(data),
      detailedAnalysis: this.createDetailedAnalysis(data),
      recommendations: this.createStrategicRecommendations(data),
      nextPhasePlanning: this.planNextPhase(data),
      appendices: this.createAppendices(data)
    };
  }

  aggregateRecommendations(coreReview, performanceReview, processImprovements) {
    const recommendations = [];
    
    if (coreReview.review?.recommendations) {
      recommendations.push(...coreReview.review.recommendations);
    }
    
    if (performanceReview.recommendations) {
      recommendations.push(...performanceReview.recommendations);
    }
    
    if (processImprovements.improvementOpportunities) {
      recommendations.push(...processImprovements.improvementOpportunities);
    }
    
    return [...new Set(recommendations)]; // Remove duplicates
  }

  getCurrentPhase() {
    const phases = this.projectContext.phases || {};
    
    for (const [phase, data] of Object.entries(phases)) {
      if (data.status === 'active') return phase;
      if (data.status === 'pending') return phase;
    }
    
    return 'completed';
  }

  calculateProgress() {
    const phases = this.projectContext.phases || {};
    const totalPhases = Object.keys(phases).length;
    const completedPhases = Object.values(phases).filter(p => p.status === 'completed').length;
    
    return {
      completed: completedPhases,
      total: totalPhases,
      percentage: Math.round((completedPhases / totalPhases) * 100)
    };
  }

  getNextSteps(currentPhase) {
    const stepMap = {
      research: ['Execute brainstorming', 'Generate CLI tools', 'Analyze market insights'],
      planning: ['Create detailed project plan', 'Define GTM strategy', 'Establish metrics'],
      execution: ['Implement core features', 'Use generated tools', 'Track progress'],
      review: ['Conduct comprehensive review', 'Document learnings', 'Plan improvements'],
      completed: ['Start new iteration', 'Apply learnings to next project', 'Begin next phase']
    };
    
    return stepMap[currentPhase] || ['Initialize project'];
  }

  // Additional helper methods (simplified for brevity)
  extractDependencies() { return []; }
  extractMilestones() { return []; }
  calculateTimeSpent() { return '2 hours'; }
  calculateQualityScore() { return 0.85; }
  calculateMetricVariance() { return {}; }
  calculatePerformanceScore() { return 0.8; }
  identifyProcessEfficiencies() { return []; }
  analyzeBottlenecks() { return []; }
  identifyImprovementOpportunities() { return []; }
  assessAutomationPotential() { return 'high'; }
  createExecutiveSummary() { return 'Project completed successfully'; }
  createDetailedAnalysis() { return {}; }
  createStrategicRecommendations() { return []; }
  planNextPhase() { return 'Ready for next iteration'; }
  createAppendices() { return {}; }
  generateWorkflowSummary() { return 'All phases completed successfully'; }

  log(message) {
    if (this.options.verbose) {
      console.log(`[Unified-CI] ${message}`);
    }
  }
}

// Export for use as module
export default UnifiedContinuousImprovement;

// CLI interface for direct usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, command, ...args] = process.argv;
  
  if (!command || command === '--help' || command === '-h') {
    console.log(`
Usage: unified-plugin <command> [options]

Commands:
  init <project-name> <objective>     Initialize new project
  research                           Execute research phase
  planning                           Execute planning phase
  execution                          Execute execution phase
  review                             Execute review phase
  workflow <project-name> <objective> Run complete workflow
  status                             Show project status

Options:
  --workspace <dir>     Workspace directory (default: ./ci-workspace)
  --verbose             Enable verbose logging
  --repo <path>         Repository path for CLI generation
`);
    process.exit(0);
  }
  
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--workspace' && args[i + 1]) {
      options.workspace = args[i + 1];
      i++;
    } else if (args[i] === '--verbose') {
      options.verbose = true;
    } else if (args[i] === '--repo' && args[i + 1]) {
      options.repositoryPath = args[i + 1];
      i++;
    }
  }
  
  const unifiedPlugin = new UnifiedContinuousImprovement(options);
  
  switch (command) {
    case 'init':
      if (args.length < 2) {
        console.error('Error: Project name and objective required');
        process.exit(1);
      }
      unifiedPlugin.initializeProject({
        name: args[0],
        objective: args.slice(1).join(' ')
      })
        .then(result => {
          console.log(`✅ Project initialized: ${result.projectId}`);
          console.log(`📊 Session: ${result.sessionId}`);
        })
        .catch(error => {
          console.error(`❌ Error: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'workflow':
      if (args.length < 2) {
        console.error('Error: Project name and objective required');
        process.exit(1);
      }
      unifiedPlugin.executeCompleteWorkflow({
        name: args[0],
        objective: args.slice(1).join(' ')
      }, options)
        .then(result => {
          console.log(`🎉 Workflow completed for: ${result.project}`);
          console.log(`📊 Session: ${result.sessionId}`);
        })
        .catch(error => {
          console.error(`❌ Error: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'status':
      unifiedPlugin.getProjectStatus()
        .then(status => {
          console.log('📊 Project Status:');
          console.log(JSON.stringify(status, null, 2));
        })
        .catch(error => {
          console.error(`❌ Error: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'research':
    case 'planning':
    case 'execution':
    case 'review':
      // Load existing project context first
      // This would need additional implementation to restore state
      console.log(`⚠️  Phase execution requires prior initialization. Use 'init' or 'workflow' commands.`);
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}
