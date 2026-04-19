# New Tools Integration Guide

This document describes the three new tools implemented for the continuous-improvement project:

## 1. CLI-Anything

**Purpose**: Turn any open-source software into an agent-native CLI, enabling language models to interact with tools automatically.

### Features
- **Repository Analysis**: Automatically detects project type (Node.js, React, Python, Docker, etc.)
- **Command Extraction**: Extracts available commands from package.json scripts and existing CLI configurations
- **CLI Generation**: Creates JavaScript CLI wrappers that can be executed by agents
- **Template System**: Uses templates to generate consistent CLI interfaces
- **Multi-Platform Support**: Works with various project structures and frameworks

### Usage
```bash
# Generate CLI for a repository
node src/cli-anything.mjs ./my-project

# With options
node src/cli-anything.mjs ./my-project --output-dir ./tools --verbose
```

### API Usage
```javascript
import CLIAnything from './src/cli-anything.mjs';

const cliAnything = new CLIAnything({ outputDir: './generated-clis' });
const result = await cliAnything.generateCLI('./my-repo');
console.log(`CLI generated: ${result.outputPath}`);
```

### Output
- Generates executable JavaScript files with CLI interfaces
- Includes command descriptions, categories, and execution logic
- Creates structured command groups for better organization

## 2. Compound Engineering

**Purpose**: Introduces an iterative process (brainstorming → planning → working → reviewing) and documents learnings to prevent repeating past mistakes.

### Features
- **Session Management**: Tracks engineering sessions with phases and artifacts
- **Iterative Phases**:
  - **Brainstorming**: Generate ideas, constraints, assumptions, risks, opportunities
  - **Planning**: Create structured plans with steps, timelines, and success criteria
  - **Working**: Execute plan steps with issue tracking and solution application
  - **Reviewing**: Comprehensive review with insights and learning extraction
- **Learning System**: Captures and reuses learnings across sessions
- **Progress Tracking**: Monitors phase completion and metrics

### Usage
```bash
# Start a new session
node src/compound-engineering.mjs start "MyProject" "Build user management system"

# View learnings
node src/compound-engineering.mjs learnings

# Search learnings
node src/compound-engineering.mjs search "performance"
```

### API Usage
```javascript
import CompoundEngineering from './src/compound-engineering.mjs';

const ce = new CompoundEngineering({ workspace: './workspace' });

// Start session
const session = await ce.startSession('Project', 'Objective');

// Run phases
const brainstorm = await ce.brainstorm(context);
const plan = await ce.plan(brainstorm);
const work = await ce.work(plan);
const review = await ce.review(work);
```

### Learning System
- **Automatic Capture**: Extracts learnings from each session
- **Confidence Scoring**: Rates learnings by confidence (0.0-0.9)
- **Contextual Application**: Applies relevant learnings to new sessions
- **Knowledge Growth**: Builds institutional memory over time

## 3. PM-Skills Collection

**Purpose**: Eight product management plugins that help developers define their "what" and "why," covering growth loops, market research, and GTM strategies.

### Available Skills

1. **Growth Loops** (`growthLoops`)
   - Design sustainable growth loops (acquisition, activation, retention, referral, revenue)
   - Identify viral mechanisms and network effects
   - Define growth metrics and KPIs

2. **Market Research** (`marketResearch`)
   - Estimate market size (TAM, SAM, SOM)
   - Identify market trends and competitor landscape
   - Analyze customer needs and opportunities

3. **GTM Strategy** (`gtmStrategy`)
   - Develop positioning and messaging
   - Create pricing strategies and channel plans
   - Plan launch strategies and sales approaches

4. **User Personas** (`userPersonas`)
   - Create detailed user personas with demographics and behaviors
   - Map user journeys and touchpoints
   - Identify pain points and needs

5. **Competitive Analysis** (`competitiveAnalysis`)
   - Analyze direct and indirect competitors
   - Assess competitive positioning and advantages
   - Identify opportunities and threats

6. **Value Proposition** (`valueProposition`)
   - Define customer jobs, pains, and gains
   - Create value proposition canvas
   - Plan validation strategies

7. **Product Roadmap** (`productRoadmap`)
   - Create strategic roadmaps with initiatives and features
   - Define timelines and dependencies
   - Assess risks and success criteria

8. **Metrics Definition** (`metricsDefinition`)
   - Define comprehensive metrics (product, business, user, technical)
   - Create reporting systems and dashboards
   - Plan metrics implementation

### Usage
```bash
# List available skills
node src/pm-skills.mjs list

# Execute specific skill
node src/pm-skills.mjs execute growthLoops

# Run comprehensive analysis
node src/pm-skills.mjs analyze
```

### API Usage
```javascript
import PMSkills from './src/pm-skills.mjs';

const pmSkills = new PMSkills({ workspace: './pm-workspace' });

// Execute individual skill
const growthResult = await pmSkills.executeSkill('growthLoops', input);

// Run comprehensive analysis
const analysis = await pmSkills.runProductAnalysis(productInfo);
```

### Output Structure
Each skill generates structured output with:
- **Analysis Results**: Domain-specific insights and data
- **Insights**: Key takeaways and patterns
- **Recommendations**: Actionable suggestions
- **Timestamps**: For tracking and reference

## Integration with Continuous-Improvement

### Compatibility
- All tools follow the 7 Laws of AI Agent Discipline
- Results integrate with the existing instinct system
- Learning from Compound Engineering feeds into continuous improvement
- PM-Skills provide strategic context for technical decisions

### Workflow Integration
1. **Research Phase**: Use PM-Skills for market and user research
2. **Planning Phase**: Apply Compound Engineering for structured planning
3. **Execution Phase**: Use CLI-Anything to automate tool interactions
4. **Review Phase**: Compound Engineering captures learnings
5. **Learning Phase**: All tools contribute to institutional knowledge

### File Structure
```
src/
├── cli-anything.mjs          # CLI generation tool
├── compound-engineering.mjs  # Iterative development framework
└── pm-skills.mjs            # Product management skills collection

test/
├── cli-anything.test.mjs          # CLI-Anything tests
├── compound-engineering.test.mjs  # Compound Engineering tests
└── pm-skills.test.mjs            # PM-Skills tests
```

## Testing

All tools include comprehensive test suites:
- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end workflow testing
- **Mock Data**: Realistic test scenarios
- **Error Handling**: Robust error case testing

Run tests:
```bash
npm test
# Or individual test files
node test/cli-anything.test.mjs
node test/compound-engineering.test.mjs
node test/pm-skills.test.mjs
```

## Configuration

### Environment Variables
- `CI_WORKSPACE`: Default workspace directory
- `CI_VERBOSE`: Enable verbose logging
- `CI_OUTPUT_DIR`: Default output directory for generated files

### Customization
Each tool accepts configuration options:
- **Workspace paths**: Customize working directories
- **Output formats**: Choose different output formats
- **Templates**: Use custom templates for CLI generation
- **Learning storage**: Configure learning persistence

## Best Practices

1. **Start with PM-Skills**: Understand the "what" and "why" before building
2. **Use Compound Engineering**: Follow structured iterative process
3. **Automate with CLI-Anything**: Generate CLIs for frequently used tools
4. **Capture Learnings**: Let the system build institutional knowledge
5. **Review Regularly**: Use the review phase to improve processes

## Future Enhancements

- **Template Marketplace**: Share CLI templates
- **Integration Plugins**: Connect with external tools (Jira, GitHub, etc.)
- **AI-Powered Insights**: Enhanced analysis with ML
- **Collaborative Features**: Team-based learning sharing
- **Dashboard**: Visual interface for all tools
