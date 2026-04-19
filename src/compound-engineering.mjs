#!/usr/bin/env node

/**
 * Compound Engineering: Iterative development process plugin
 * 
 * Introduces an iterative process: brainstorming → planning → working → reviewing
 * Documents learnings to prevent repeating past mistakes in future sessions.
 */

import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

class CompoundEngineering {
  constructor(options = {}) {
    this.options = {
      workspace: options.workspace || './compound-workspace',
      learningsPath: options.learningsPath || './learnings.json',
      verbose: options.verbose || false,
      ...options
    };
    this.currentSession = null;
    this.learnings = new Map();
  }

  /**
   * Start a new compound engineering session
   */
  async startSession(projectName, objective) {
    const sessionId = this.generateSessionId();
    
    this.currentSession = {
      id: sessionId,
      projectName,
      objective,
      phase: 'brainstorming',
      startTime: new Date().toISOString(),
      phases: {
        brainstorming: { status: 'active', startTime: new Date().toISOString() },
        planning: { status: 'pending' },
        working: { status: 'pending' },
        reviewing: { status: 'pending' }
      },
      artifacts: {},
      learnings: [],
      decisions: []
    };

    await this.ensureWorkspace();
    await this.saveSession();
    await this.loadLearnings();

    this.log(`🚀 Started compound engineering session: ${sessionId}`);
    this.log(`📋 Objective: ${objective}`);
    
    return this.currentSession;
  }

  /**
   * Execute brainstorming phase
   */
  async brainstorm(context = {}) {
    if (!this.currentSession) {
      throw new Error('No active session. Call startSession() first.');
    }

    this.currentSession.phase = 'brainstorming';
    this.currentSession.phases.brainstorming.status = 'active';

    const relevantLearnings = this.getRelevantLearnings('brainstorming');
    
    const brainstormPrompt = this.generateBrainstormPrompt(
      this.currentSession.objective,
      context,
      relevantLearnings
    );

    const brainstormResults = {
      ideas: [],
      constraints: [],
      assumptions: [],
      risks: [],
      opportunities: [],
      timestamp: new Date().toISOString()
    };

    // Save brainstorming artifacts
    this.currentSession.artifacts.brainstorming = brainstormResults;
    await this.saveSession();

    this.log(`💭 Brainstorming phase completed`);
    return brainstormResults;
  }

  /**
   * Execute planning phase
   */
  async plan(brainstormResults, preferences = {}) {
    if (!this.currentSession) {
      throw new Error('No active session. Call startSession() first.');
    }

    this.currentSession.phase = 'planning';
    this.currentSession.phases.brainstorming.status = 'completed';
    this.currentSession.phases.planning.status = 'active';

    const relevantLearnings = this.getRelevantLearnings('planning');
    
    const plan = this.createPlan(
      this.currentSession.objective,
      brainstormResults,
      preferences,
      relevantLearnings
    );

    this.currentSession.artifacts.planning = plan;
    this.currentSession.decisions.push(...plan.decisions);
    await this.saveSession();

    this.log(`📋 Planning phase completed`);
    return plan;
  }

  /**
   * Execute working phase
   */
  async work(plan, progressCallback = null) {
    if (!this.currentSession) {
      throw new Error('No active session. Call startSession() first.');
    }

    this.currentSession.phase = 'working';
    this.currentSession.phases.planning.status = 'completed';
    this.currentSession.phases.working.status = 'active';

    const workLog = {
      steps: [],
      issues: [],
      solutions: [],
      timestamp: new Date().toISOString()
    };

    // Execute each step in the plan
    for (const step of plan.steps) {
      const stepResult = await this.executeStep(step, progressCallback);
      workLog.steps.push(stepResult);
      
      if (stepResult.issues.length > 0) {
        workLog.issues.push(...stepResult.issues);
        workLog.solutions.push(...stepResult.solutions);
      }
    }

    this.currentSession.artifacts.working = workLog;
    await this.saveSession();

    this.log(`🔧 Working phase completed`);
    return workLog;
  }

  /**
   * Execute reviewing phase
   */
  async review(workResults, criteria = null) {
    if (!this.currentSession) {
      throw new Error('No active session. Call startSession() first.');
    }

    this.currentSession.phase = 'reviewing';
    this.currentSession.phases.working.status = 'completed';
    this.currentSession.phases.reviewing.status = 'active';

    const review = this.performReview(
      this.currentSession,
      workResults,
      criteria
    );

    // Extract learnings from the session
    const sessionLearnings = this.extractLearnings(this.currentSession, review);
    this.currentSession.learnings = sessionLearnings;

    // Save learnings to global store
    await this.saveLearnings(sessionLearnings);

    this.currentSession.artifacts.reviewing = review;
    this.currentSession.phases.reviewing.status = 'completed';
    this.currentSession.endTime = new Date().toISOString();
    
    await this.saveSession();

    this.log(`🔍 Reviewing phase completed`);
    this.log(`📚 Extracted ${sessionLearnings.length} learnings`);
    
    return { review, learnings: sessionLearnings };
  }

  /**
   * Generate brainstorming prompt
   */
  generateBrainstormPrompt(objective, context, relevantLearnings) {
    let prompt = `Brainstorm ideas for: ${objective}\n\n`;
    
    if (Object.keys(context).length > 0) {
      prompt += `Context:\n${JSON.stringify(context, null, 2)}\n\n`;
    }

    if (relevantLearnings.length > 0) {
      prompt += `Relevant past learnings:\n`;
      relevantLearnings.forEach(learning => {
        prompt += `- ${learning.summary}\n`;
      });
      prompt += '\n';
    }

    prompt += `Please brainstorm:
1. Potential approaches and solutions
2. Constraints and limitations
3. Key assumptions
4. Potential risks
5. Opportunities and innovations

Structure your response as JSON with keys: ideas, constraints, assumptions, risks, opportunities`;

    return prompt;
  }

  /**
   * Create structured plan
   */
  createPlan(objective, brainstormResults, preferences, relevantLearnings) {
    const plan = {
      objective,
      approach: this.selectApproach(brainstormResults.ideas, preferences),
      steps: [],
      timeline: this.estimateTimeline(brainstormResults),
      resources: this.identifyResources(brainstormResults),
      risks: brainstormResults.risks,
      mitigations: this.createMitigations(brainstormResults.risks),
      decisions: [],
      successCriteria: this.defineSuccessCriteria(objective),
      timestamp: new Date().toISOString()
    };

    // Break down approach into executable steps
    plan.steps = this.createExecutionSteps(plan.approach, brainstormResults.constraints);

    // Add relevant learnings as considerations
    if (relevantLearnings.length > 0) {
      plan.considerations = relevantLearnings.map(l => l.summary);
    }

    return plan;
  }

  /**
   * Execute a single work step
   */
  async executeStep(step, progressCallback) {
    const stepResult = {
      step: step.description,
      status: 'pending',
      startTime: new Date().toISOString(),
      issues: [],
      solutions: [],
      artifacts: []
    };

    try {
      this.log(`⚡ Executing: ${step.description}`);
      
      if (progressCallback) {
        progressCallback(`Starting: ${step.description}`);
      }

      // Simulate step execution (in real implementation, this would call actual tools)
      stepResult.status = 'in_progress';
      
      // Check for known issues based on learnings
      const knownIssues = this.checkForKnownIssues(step);
      if (knownIssues.length > 0) {
        stepResult.issues.push(...knownIssues);
        
        // Apply known solutions
        knownIssues.forEach(issue => {
          const solutions = this.getKnownSolutions(issue);
          stepResult.solutions.push(...solutions);
        });
      }

      stepResult.status = 'completed';
      stepResult.endTime = new Date().toISOString();

      if (progressCallback) {
        progressCallback(`Completed: ${step.description}`);
      }

    } catch (error) {
      stepResult.status = 'failed';
      stepResult.error = error.message;
      stepResult.endTime = new Date().toISOString();
    }

    return stepResult;
  }

  /**
   * Perform comprehensive review
   */
  performReview(session, workResults, criteria = null) {
    const review = {
      sessionId: session.id,
      objective: session.objective,
      overallScore: 0,
      strengths: [],
      weaknesses: [],
      improvements: [],
      unexpectedOutcomes: [],
      processMetrics: this.calculateProcessMetrics(session),
      outcomeMetrics: this.calculateOutcomeMetrics(workResults),
      recommendations: [],
      timestamp: new Date().toISOString()
    };

    // Analyze each phase
    Object.entries(session.artifacts).forEach(([phase, artifact]) => {
      const phaseReview = this.reviewPhase(phase, artifact);
      review.strengths.push(...phaseReview.strengths);
      review.weaknesses.push(...phaseReview.weaknesses);
      review.improvements.push(...phaseReview.improvements);
    });

    // Calculate overall score
    review.overallScore = this.calculateOverallScore(review);

    // Generate recommendations
    review.recommendations = this.generateRecommendations(review);

    return review;
  }

  /**
   * Extract learnings from session
   */
  extractLearnings(session, review) {
    const learnings = [];

    // Process learnings
    session.learnings.forEach(learning => {
      learnings.push({
        id: this.generateLearningId(),
        type: learning.type || 'process',
        category: learning.category || 'general',
        summary: learning.summary,
        context: learning.context,
        impact: learning.impact || 'medium',
        confidence: learning.confidence || 0.7,
        sessionId: session.id,
        timestamp: new Date().toISOString(),
        tags: this.extractTags(learning)
      });
    });

    // Extract learnings from review
    if (review.weaknesses.length > 0) {
      learnings.push({
        id: this.generateLearningId(),
        type: 'improvement',
        category: 'quality',
        summary: `Address identified weaknesses: ${review.weaknesses.slice(0, 3).join(', ')}`,
        context: { weaknesses: review.weaknesses },
        impact: 'high',
        confidence: 0.8,
        sessionId: session.id,
        timestamp: new Date().toISOString(),
        tags: ['quality', 'improvement']
      });
    }

    return learnings;
  }

  /**
   * Helper methods
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateLearningId() {
    return `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async ensureWorkspace() {
    try {
      await mkdir(this.options.workspace, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  async saveSession() {
    if (!this.currentSession) return;
    
    const sessionPath = join(this.options.workspace, `${this.currentSession.id}.json`);
    await writeFile(sessionPath, JSON.stringify(this.currentSession, null, 2));
  }

  async loadLearnings() {
    try {
      const content = await readFile(this.options.learningsPath, 'utf8');
      const learningsData = JSON.parse(content);
      this.learnings = new Map(learningsData.map(l => [l.id, l]));
    } catch (error) {
      // File doesn't exist or is invalid
      this.learnings = new Map();
    }
  }

  async saveLearnings(newLearnings) {
    newLearnings.forEach(learning => {
      this.learnings.set(learning.id, learning);
    });

    const learningsArray = Array.from(this.learnings.values());
    await writeFile(this.options.learningsPath, JSON.stringify(learningsArray, null, 2));
  }

  getRelevantLearnings(phase) {
    return Array.from(this.learnings.values())
      .filter(learning => learning.phase === phase || learning.category === 'general')
      .filter(learning => learning.confidence >= 0.5)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Top 5 most relevant learnings
  }

  selectApproach(ideas, preferences) {
    // Simple selection logic - in real implementation, this would be more sophisticated
    return ideas[0] || { description: 'Default approach', pros: [], cons: [] };
  }

  estimateTimeline(brainstormResults) {
    // Simple timeline estimation
    return {
      estimated: '2-4 hours',
      phases: {
        brainstorming: '30 minutes',
        planning: '30 minutes',
        working: '1-3 hours',
        reviewing: '30 minutes'
      }
    };
  }

  identifyResources(brainstormResults) {
    return {
      tools: [],
      dependencies: [],
      skills: [],
      time: '2-4 hours'
    };
  }

  createMitigations(risks) {
    return risks.map(risk => ({
      risk: risk,
      mitigation: `Monitor and address ${risk.toLowerCase()} early`
    }));
  }

  defineSuccessCriteria(objective) {
    return [
      'Objective achieved according to specifications',
      'No critical issues or regressions',
      'Process followed all phases correctly',
      'Learnings documented for future use'
    ];
  }

  createExecutionSteps(approach, constraints) {
    return [
      { description: 'Set up development environment', estimatedTime: '15 minutes' },
      { description: 'Implement core functionality', estimatedTime: '1-2 hours' },
      { description: 'Test and validate', estimatedTime: '30 minutes' },
      { description: 'Finalize and document', estimatedTime: '15 minutes' }
    ];
  }

  checkForKnownIssues(step) {
    // Check learnings for known issues related to this step
    return Array.from(this.learnings.values())
      .filter(learning => learning.type === 'issue' && 
              learning.context && 
              learning.context.step === step.description)
      .map(learning => learning.summary);
  }

  getKnownSolutions(issue) {
    return Array.from(this.learnings.values())
      .filter(learning => learning.type === 'solution' && 
              learning.context && 
              learning.context.issue === issue)
      .map(learning => learning.summary);
  }

  reviewPhase(phase, artifact) {
    return {
      strengths: [`Phase ${phase} completed systematically`],
      weaknesses: [],
      improvements: []
    };
  }

  calculateProcessMetrics(session) {
    const phases = session.phases;
    const totalDuration = new Date(session.endTime) - new Date(session.startTime);
    
    return {
      totalDuration: `${Math.round(totalDuration / 60000)} minutes`,
      phaseDurations: Object.entries(phases).reduce((durations, [phase, data]) => {
        if (data.startTime && data.endTime) {
          durations[phase] = `${Math.round((new Date(data.endTime) - new Date(data.startTime)) / 60000)} minutes`;
        }
        return durations;
      }, {})
    };
  }

  calculateOutcomeMetrics(workResults) {
    return {
      stepsCompleted: workResults.steps.filter(s => s.status === 'completed').length,
      issuesEncountered: workResults.issues.length,
      solutionsApplied: workResults.solutions.length
    };
  }

  calculateOverallScore(review) {
    // Simple scoring algorithm
    let score = 70; // Base score
    
    score += review.strengths.length * 5;
    score -= review.weaknesses.length * 10;
    score += review.improvements.length * 2;
    
    return Math.max(0, Math.min(100, score));
  }

  generateRecommendations(review) {
    const recommendations = [];
    
    if (review.weaknesses.length > 0) {
      recommendations.push('Focus on addressing identified weaknesses in future sessions');
    }
    
    if (review.processMetrics.totalDuration.includes('minutes') && 
        parseInt(review.processMetrics.totalDuration) > 180) {
      recommendations.push('Consider breaking down large objectives into smaller sessions');
    }
    
    return recommendations;
  }

  extractTags(learning) {
    const tags = [];
    if (learning.type) tags.push(learning.type);
    if (learning.category) tags.push(learning.category);
    if (learning.context && learning.context.technology) {
      tags.push(learning.context.technology);
    }
    return tags;
  }

  log(message) {
    if (this.options.verbose) {
      console.log(`[CompoundEngineering] ${message}`);
    }
  }

  /**
   * Get session summary
   */
  getSessionSummary(sessionId) {
    // Implementation for retrieving session summary
    return this.currentSession;
  }

  /**
   * Get all learnings
   */
  getAllLearnings() {
    return Array.from(this.learnings.values());
  }

  /**
   * Search learnings by tag or category
   */
  searchLearnings(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.learnings.values()).filter(learning => 
      learning.summary.toLowerCase().includes(lowerQuery) ||
      learning.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      learning.category.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export for use as module
export default CompoundEngineering;

// CLI interface for direct usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, command, ...args] = process.argv;
  
  if (!command || command === '--help' || command === '-h') {
    console.log(`
Usage: compound-engineering <command> [options]

Commands:
  start <project-name> <objective>    Start a new session
  list-sessions                       List all sessions
  learnings                           Show all learnings
  search <query>                      Search learnings

Options:
  --workspace <dir>     Workspace directory (default: ./compound-workspace)
  --learnings <file>    Learnings file path (default: ./learnings.json)
  --verbose             Enable verbose logging
`);
    process.exit(0);
  }
  
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--workspace' && args[i + 1]) {
      options.workspace = args[i + 1];
      i++;
    } else if (args[i] === '--learnings' && args[i + 1]) {
      options.learningsPath = args[i + 1];
      i++;
    } else if (args[i] === '--verbose') {
      options.verbose = true;
    }
  }
  
  const compoundEngineering = new CompoundEngineering(options);
  
  switch (command) {
    case 'start':
      if (args.length < 2) {
        console.error('Error: Project name and objective required');
        process.exit(1);
      }
      compoundEngineering.startSession(args[0], args.slice(1).join(' '))
        .then(session => {
          console.log(`✅ Session started: ${session.id}`);
        })
        .catch(error => {
          console.error(`❌ Error: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'learnings':
      compoundEngineering.loadLearnings()
        .then(() => {
          const learnings = compoundEngineering.getAllLearnings();
          console.log(`📚 Found ${learnings.length} learnings:`);
          learnings.forEach(learning => {
            console.log(`  [${learning.confidence.toFixed(2)}] ${learning.summary}`);
          });
        })
        .catch(error => {
          console.error(`❌ Error: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'search':
      if (args.length === 0) {
        console.error('Error: Search query required');
        process.exit(1);
      }
      compoundEngineering.loadLearnings()
        .then(() => {
          const results = compoundEngineering.searchLearnings(args.join(' '));
          console.log(`🔍 Found ${results.length} matching learnings:`);
          results.forEach(learning => {
            console.log(`  [${learning.confidence.toFixed(2)}] ${learning.summary}`);
          });
        })
        .catch(error => {
          console.error(`❌ Error: ${error.message}`);
          process.exit(1);
        });
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}
