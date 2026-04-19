#!/usr/bin/env node

/**
 * Unified Continuous Improvement CLI
 * 
 * Comprehensive command-line interface for the unified plugin that combines
 * CLI-Anything, Compound Engineering, and PM-Skills.
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Import the unified plugin
import UnifiedContinuousImprovement from '../src/unified-plugin.mjs';

class UnifiedCLI {
  constructor() {
    this.plugin = null;
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = join(process.cwd(), '.ci-config.json');
    if (existsSync(configPath)) {
      try {
        return JSON.parse(readFileSync(configPath, 'utf8'));
      } catch (error) {
        console.warn('Warning: Invalid config file, using defaults');
      }
    }
    return {
      workspace: './ci-workspace',
      verbose: false,
      defaultMode: 'expert'
    };
  }

  async initializePlugin(options = {}) {
    this.plugin = new UnifiedContinuousImprovement({
      workspace: options.workspace || this.config.workspace,
      verbose: options.verbose || this.config.verbose
    });
  }

  async runCommand(command, args, options = {}) {
    await this.initializePlugin(options);

    switch (command) {
      case 'init':
        return await this.handleInit(args, options);
      case 'workflow':
        return await this.handleWorkflow(args, options);
      case 'research':
        return await this.handleResearch(args, options);
      case 'planning':
        return await this.handlePlanning(args, options);
      case 'execution':
        return await this.handleExecution(args, options);
      case 'review':
        return await this.handleReview(args, options);
      case 'status':
        return await this.handleStatus(args, options);
      case 'cli':
        return await this.handleCLI(args, options);
      case 'pm':
        return await this.handlePM(args, options);
      case 'compound':
        return await this.handleCompound(args, options);
      case 'learnings':
        return await this.handleLearnings(args, options);
      case 'config':
        return await this.handleConfig(args, options);
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  async handleInit(args, options) {
    if (args.length < 2) {
      throw new Error('Usage: ci init <project-name> <objective> [options]');
    }

    const [name, ...objectiveParts] = args;
    const objective = objectiveParts.join(' ');

    console.log(`🚀 Initializing project: ${name}`);
    console.log(`📋 Objective: ${objective}`);

    const result = await this.plugin.initializeProject({
      name,
      objective,
      product: options.product ? JSON.parse(options.product) : {},
      industry: options.industry || '',
      targetMarket: options.targetMarket ? JSON.parse(options.targetMarket) : {}
    });

    console.log(`✅ Project initialized successfully!`);
    console.log(`🆔 Project ID: ${result.projectId}`);
    console.log(`🔗 Session ID: ${result.sessionId}`);
    console.log(`📊 PM Analysis: ${result.pmAnalysis.totalSkills} skills completed`);
    console.log(`\n🎯 Next steps:`);
    result.nextSteps.forEach((step, i) => {
      console.log(`   ${i + 1}. ${step}`);
    });

    return result;
  }

  async handleWorkflow(args, options) {
    if (args.length < 2) {
      throw new Error('Usage: ci workflow <project-name> <objective> [options]');
    }

    const [name, ...objectiveParts] = args;
    const objective = objectiveParts.join(' ');

    console.log(`🚀 Starting complete workflow for: ${name}`);
    console.log(`📋 Objective: ${objective}`);

    const progressCallback = (message) => {
      console.log(`   ⏳ ${message}`);
    };

    const result = await this.plugin.executeCompleteWorkflow({
      name,
      objective,
      product: options.product ? JSON.parse(options.product) : {},
      industry: options.industry || '',
      targetMarket: options.targetMarket ? JSON.parse(options.targetMarket) : {}
    }, {
      researchContext: options.repo ? { repositoryPath: options.repo } : {},
      progressCallback
    });

    console.log(`🎉 Complete workflow finished!`);
    console.log(`🆔 Project: ${result.project}`);
    console.log(`🔗 Session: ${result.sessionId}`);
    
    // Display phase summaries
    Object.entries(result.phases).forEach(([phase, data]) => {
      console.log(`\n📊 ${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase:`);
      if (data.summary) {
        console.log(`   ${data.summary}`);
      }
    });

    return result;
  }

  async handleResearch(args, options) {
    console.log(`🔍 Starting research phase...`);

    const context = {};
    if (options.repo) context.repositoryPath = options.repo;
    if (options.context) context.additionalContext = JSON.parse(options.context);

    const result = await this.plugin.executeResearchPhase(context);

    console.log(`✅ Research phase completed!`);
    console.log(`💡 Generated ${result.brainstorm.ideas.length} ideas`);
    console.log(`🔍 Identified ${result.brainstorm.risks.length} risks`);
    if (result.cliTools) {
      console.log(`🛠️  Generated CLI with ${result.cliTools.commands.length} commands`);
    }

    return result;
  }

  async handlePlanning(args, options) {
    console.log(`📋 Starting planning phase...`);

    const preferences = {};
    if (options.preferences) {
      Object.assign(preferences, JSON.parse(options.preferences));
    }

    const result = await this.plugin.executePlanningPhase(preferences);

    console.log(`✅ Planning phase completed!`);
    console.log(`📈 Created plan with ${result.corePlan.steps.length} steps`);
    console.log(`⏱️  Timeline: ${result.corePlan.timeline.estimated}`);
    console.log(`⚠️  Identified ${result.risks.length} risks`);

    return result;
  }

  async handleExecution(args, options) {
    console.log(`🔧 Starting execution phase...`);

    const progressCallback = (message) => {
      console.log(`   ⚡ ${message}`);
    };

    const result = await this.plugin.executeWorkingPhase(progressCallback);

    console.log(`✅ Execution phase completed!`);
    console.log(`📋 Completed ${result.coreWork.steps.length} steps`);
    console.log(`🔧 Resolved ${result.issues.length} issues`);
    console.log(`💡 Applied ${result.solutions.length} solutions`);

    return result;
  }

  async handleReview(args, options) {
    console.log(`🔍 Starting review phase...`);

    const criteria = options.criteria ? JSON.parse(options.criteria) : null;

    const result = await this.plugin.executeReviewPhase(criteria);

    console.log(`✅ Review phase completed!`);
    console.log(`📊 Overall score: ${result.coreReview.review.overallScore}/100`);
    console.log(`💡 Generated ${result.learnings.length} learnings`);
    console.log(`📋 Created ${result.recommendations.length} recommendations`);

    return result;
  }

  async handleStatus(args, options) {
    const status = await this.plugin.getProjectStatus();

    console.log(`📊 Project Status:`);
    console.log(`   Project: ${status.project || 'No active project'}`);
    console.log(`   Session: ${status.sessionId || 'N/A'}`);
    console.log(`   Current Phase: ${status.currentPhase || 'N/A'}`);
    
    if (status.progress) {
      console.log(`   Progress: ${status.progress.completed}/${status.progress.total} (${status.progress.percentage}%)`);
    }

    if (status.nextSteps && status.nextSteps.length > 0) {
      console.log(`\n🎯 Next Steps:`);
      status.nextSteps.forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
      });
    }

    return status;
  }

  async handleCLI(args, options) {
    const [subcommand, ...subArgs] = args;

    switch (subcommand) {
      case 'generate':
        if (subArgs.length === 0) {
          throw new Error('Usage: ci cli generate <repository-path>');
        }
        return await this.handleCLIGenerate(subArgs[0], options);
      case 'list':
        return await this.handleCLIList(options);
      default:
        throw new Error('Usage: ci cli <generate|list> [args]');
    }
  }

  async handleCLIGenerate(repoPath, options) {
    console.log(`🛠️  Generating CLI for: ${repoPath}`);

    const result = await this.plugin.cliAnything.generateCLI(repoPath);

    console.log(`✅ CLI generated successfully!`);
    console.log(`📁 Output: ${result.outputPath}`);
    console.log(`🔧 Commands: ${result.commands.length}`);

    // List generated commands
    console.log(`\n📋 Available Commands:`);
    result.commands.forEach(cmd => {
      console.log(`   ${cmd.name.padEnd(15)} - ${cmd.description}`);
    });

    return result;
  }

  async handleCLIList(options) {
    console.log(`🛠️  CLI Generation Tool Status: Ready`);
    console.log(`   Repository Analysis: Supported`);
    console.log(`   Project Types: Node.js, React, Python, Docker, and more`);
    console.log(`   Output Format: Executable JavaScript`);
  }

  async handlePM(args, options) {
    const [subcommand, ...subArgs] = args;

    switch (subcommand) {
      case 'analyze':
        return await this.handlePMAnalyze(subArgs, options);
      case 'skill':
        return await this.handlePMSkill(subArgs, options);
      case 'list':
        return await this.handlePMList(options);
      default:
        throw new Error('Usage: ci pm <analyze|skill|list> [args]');
    }
  }

  async handlePMAnalyze(args, options) {
    console.log(`📊 Running comprehensive PM analysis...`);

    const productInfo = {
      product: options.product ? JSON.parse(options.product) : {},
      industry: options.industry || 'Technology',
      targetMarket: options.targetMarket ? JSON.parse(options.targetMarket) : {}
    };

    const result = await this.plugin.pmSkills.runProductAnalysis(productInfo);

    console.log(`✅ PM analysis completed!`);
    console.log(`📊 Summary: ${result.summary.completedSkills}/${result.summary.totalSkills} skills completed`);
    console.log(`💡 Key insights: ${result.summary.keyInsights.length}`);
    console.log(`📋 Recommendations: ${result.summary.recommendations.length}`);
    console.log(`📁 Results saved to: ${result.savedTo}`);

    return result;
  }

  async handlePMSkill(args, options) {
    if (args.length === 0) {
      throw new Error('Usage: ci pm skill <skill-name>');
    }

    const [skillName] = args;
    console.log(`📊 Executing PM skill: ${skillName}`);

    // Mock input for demonstration
    const input = {
      product: { name: 'Sample Product' },
      market: { size: 'Medium' }
    };

    const result = await this.plugin.pmSkills.executeSkill(skillName, input);

    console.log(`✅ PM skill ${skillName} completed!`);
    console.log(`📁 Results saved to: ${result.savedTo}`);

    return result;
  }

  async handlePMList(options) {
    const skills = this.plugin.pmSkills.getAvailableSkills();

    console.log(`📊 Available PM Skills:`);
    skills.forEach(skill => {
      console.log(`   ${skill.name.padEnd(20)} - ${skill.description} [${skill.category}]`);
    });
  }

  async handleCompound(args, options) {
    const [subcommand, ...subArgs] = args;

    switch (subcommand) {
      case 'session':
        return await this.handleCompoundSession(subArgs, options);
      case 'learnings':
        return await this.handleCompoundLearnings(options);
      default:
        throw new Error('Usage: ci compound <session|learnings> [args]');
    }
  }

  async handleCompoundSession(args, options) {
    if (args.length < 2) {
      throw new Error('Usage: ci compound session <project-name> <objective>');
    }

    const [name, ...objectiveParts] = args;
    const objective = objectiveParts.join(' ');

    console.log(`🔧 Starting compound engineering session...`);

    const session = await this.plugin.compoundEngineering.startSession(name, objective);

    console.log(`✅ Session started!`);
    console.log(`🆔 Session ID: ${session.id}`);
    console.log(`📋 Objective: ${session.objective}`);
    console.log(`🔄 Current Phase: ${session.phase}`);

    return session;
  }

  async handleCompoundLearnings(options) {
    console.log(`📚 Loading compound engineering learnings...`);

    await this.plugin.compoundEngineering.loadLearnings();
    const learnings = this.plugin.compoundEngineering.getAllLearnings();

    console.log(`📚 Found ${learnings.length} learnings:`);
    learnings.forEach(learning => {
      console.log(`   [${learning.confidence.toFixed(2)}] ${learning.summary}`);
    });

    return learnings;
  }

  async handleLearnings(args, options) {
    const [subcommand, ...subArgs] = args;

    switch (subcommand) {
      case 'search':
        return await this.handleLearningsSearch(subArgs.join(' '), options);
      case 'all':
        return await this.handleLearningsAll(options);
      default:
        throw new Error('Usage: ci learnings <search|all> [query]');
    }
  }

  async handleLearningsSearch(query, options) {
    console.log(`🔍 Searching learnings for: "${query}"`);

    await this.plugin.compoundEngineering.loadLearnings();
    const results = this.plugin.compoundEngineering.searchLearnings(query);

    console.log(`🔍 Found ${results.length} matching learnings:`);
    results.forEach(learning => {
      console.log(`   [${learning.confidence.toFixed(2)}] ${learning.summary}`);
    });

    return results;
  }

  async handleLearningsAll(options) {
    console.log(`📚 Loading all learnings...`);

    await this.plugin.compoundEngineering.loadLearnings();
    const learnings = this.plugin.compoundEngineering.getAllLearnings();

    console.log(`📚 Total learnings: ${learnings.length}`);
    
    // Group by type
    const grouped = learnings.reduce((groups, learning) => {
      const type = learning.type || 'general';
      if (!groups[type]) groups[type] = [];
      groups[type].push(learning);
      return groups;
    }, {});

    Object.entries(grouped).forEach(([type, items]) => {
      console.log(`\n   ${type.charAt(0).toUpperCase() + type.slice(1)} (${items.length}):`);
      items.forEach(learning => {
        console.log(`     [${learning.confidence.toFixed(2)}] ${learning.summary}`);
      });
    });

    return learnings;
  }

  async handleConfig(args, options) {
    const [subcommand, ...subArgs] = args;

    switch (subcommand) {
      case 'show':
        return await this.handleConfigShow(options);
      case 'set':
        return await this.handleConfigSet(subArgs, options);
      default:
        throw new Error('Usage: ci config <show|set> [key] [value]');
    }
  }

  async handleConfigShow(options) {
    console.log(`⚙️  Current Configuration:`);
    console.log(`   Workspace: ${this.config.workspace}`);
    console.log(`   Verbose: ${this.config.verbose}`);
    console.log(`   Default Mode: ${this.config.defaultMode}`);
  }

  async handleConfigSet(args, options) {
    if (args.length < 2) {
      throw new Error('Usage: ci config set <key> <value>');
    }

    const [key, value] = args;
    
    // Update config (simplified - in real implementation would save to file)
    if (key === 'workspace') {
      this.config.workspace = value;
    } else if (key === 'verbose') {
      this.config.verbose = value === 'true';
    } else if (key === 'defaultMode') {
      this.config.defaultMode = value;
    } else {
      throw new Error(`Unknown config key: ${key}`);
    }

    console.log(`✅ Configuration updated: ${key} = ${value}`);
  }
}

// CLI entry point
async function main() {
  const [,, command, ...args] = process.argv;

  if (!command || command === '--help' || command === '-h') {
    console.log(`
Unified Continuous Improvement CLI

Usage: ci <command> [args] [options]

Main Commands:
  init <name> <objective>        Initialize new project with comprehensive analysis
  workflow <name> <objective>    Run complete end-to-end workflow
  research                       Execute research phase
  planning                       Execute planning phase  
  execution                      Execute execution phase
  review                         Execute review phase
  status                         Show project status

Tool Commands:
  cli generate <repo-path>       Generate CLI for repository
  pm analyze                     Run comprehensive PM analysis
  pm skill <name>                Execute specific PM skill
  pm list                        List available PM skills
  compound session <name> <obj>  Start compound engineering session
  compound learnings             Show compound engineering learnings
  learnings search <query>       Search through all learnings
  learnings all                  Show all learnings

Configuration:
  config show                    Show current configuration
  config set <key> <value>       Set configuration value

Global Options:
  --workspace <dir>              Workspace directory
  --verbose                      Enable verbose logging
  --repo <path>                  Repository path for CLI generation
  --product <json>               Product information as JSON
  --industry <name>              Industry name
  --target-market <json>         Target market as JSON

Examples:
  ci init "MyApp" "Build a task management app"
  ci workflow "MyApp" "Build task management" --repo ./my-app
  ci cli generate ./my-repo
  ci pm analyze --industry "SaaS" --target-market '{"segment":"SMB"}'
  ci learnings search "performance"
`);
    process.exit(0);
  }

  const cli = new UnifiedCLI();
  
  // Parse global options
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--workspace' && args[i + 1]) {
      options.workspace = args[i + 1];
      args.splice(i, 2);
      i--;
    } else if (args[i] === '--verbose') {
      options.verbose = true;
      args.splice(i, 1);
      i--;
    } else if (args[i] === '--repo' && args[i + 1]) {
      options.repo = args[i + 1];
      args.splice(i, 2);
      i--;
    } else if (args[i] === '--product' && args[i + 1]) {
      options.product = args[i + 1];
      args.splice(i, 2);
      i--;
    } else if (args[i] === '--industry' && args[i + 1]) {
      options.industry = args[i + 1];
      args.splice(i, 2);
      i--;
    } else if (args[i] === '--target-market' && args[i + 1]) {
      options.targetMarket = args[i + 1];
      args.splice(i, 2);
      i--;
    }
  }

  try {
    const result = await cli.runCommand(command, args, options);
    
    if (options.verbose && result) {
      console.log(`\n🔍 Detailed result:`);
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  });
}

export default UnifiedCLI;
