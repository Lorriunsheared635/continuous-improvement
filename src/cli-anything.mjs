#!/usr/bin/env node

/**
 * CLI-Anything: Turn open-source software into agent-native CLIs
 * 
 * This tool analyzes open-source repositories and generates CLI interfaces
 * that language models can interact with automatically.
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

class CLIAnything {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || './generated-clis',
      verbose: options.verbose || false,
      ...options
    };
  }

  /**
   * Analyze a repository and generate CLI interface
   */
  async generateCLI(repoPath, options = {}) {
    try {
      this.log(`Analyzing repository: ${repoPath}`);
      
      // 1. Detect repository type and structure
      const repoInfo = await this.analyzeRepository(repoPath);
      
      // 2. Extract command-line interfaces
      const commands = await this.extractCommands(repoPath, repoInfo);
      
      // 3. Generate agent-native CLI wrapper
      const cliWrapper = await this.generateCLIWrapper(repoInfo, commands, options);
      
      // 4. Save generated CLI
      const outputPath = await this.saveCLI(repoInfo, cliWrapper);
      
      this.log(`✅ CLI generated: ${outputPath}`);
      return { outputPath, repoInfo, commands };
      
    } catch (error) {
      throw new Error(`Failed to generate CLI: ${error.message}`);
    }
  }

  /**
   * Analyze repository structure and metadata
   */
  async analyzeRepository(repoPath) {
    const packageJsonPath = join(repoPath, 'package.json');
    const readmePath = join(repoPath, 'README.md');
    
    let packageJson = {};
    let readme = '';
    
    try {
      const packageContent = await readFile(packageJsonPath, 'utf8');
      packageJson = JSON.parse(packageContent);
    } catch (error) {
      // Not a Node.js project or no package.json
    }
    
    try {
      readme = await readFile(readmePath, 'utf8');
    } catch (error) {
      // No README
    }
    
    // Detect project type
    const projectType = this.detectProjectType(repoPath, packageJson);
    
    // Extract existing CLI commands
    const existingCLI = this.extractExistingCLI(packageJson);
    
    return {
      name: packageJson.name || this.extractRepoName(repoPath),
      version: packageJson.version || '1.0.0',
      description: packageJson.description || '',
      projectType,
      existingCLI,
      hasBin: !!(packageJson.bin && Object.keys(packageJson.bin).length > 0),
      scripts: packageJson.scripts || {},
      dependencies: packageJson.dependencies || {},
      readme
    };
  }

  /**
   * Detect project type based on files and dependencies
   */
  detectProjectType(repoPath, packageJson) {
    const { dependencies = {}, devDependencies = {} } = packageJson;
    const allDeps = { ...dependencies, ...devDependencies };
    
    // Check for common frameworks
    if (allDeps.express || allDeps.koa || allDeps.fastify) return 'node-server';
    if (allDeps.react || allDeps['react-dom']) return 'react-app';
    if (allDeps.vue) return 'vue-app';
    if (allDeps.angular) return 'angular-app';
    if (allDeps.next) return 'next-app';
    if (allDeps.gatsby) return 'gatsby-app';
    if (allDeps.python || allDeps['python-shell']) return 'python-wrapper';
    if (allDeps.docker || allDeps['dockerode']) return 'docker-tool';
    
    // Check by file structure
    try {
      const files = execSync('ls -la', { cwd: repoPath, encoding: 'utf8' });
      if (files.includes('Dockerfile')) return 'docker-project';
      if (files.includes('requirements.txt') || files.includes('setup.py')) return 'python-project';
      if (files.includes('Cargo.toml')) return 'rust-project';
      if (files.includes('go.mod')) return 'go-project';
    } catch (error) {
      // Ignore
    }
    
    return 'generic';
  }

  /**
   * Extract existing CLI configuration
   */
  extractExistingCLI(packageJson) {
    const cli = {
      bin: packageJson.bin || {},
      scripts: {},
      mainCommand: null
    };
    
    // Extract CLI-related scripts
    if (packageJson.scripts) {
      Object.entries(packageJson.scripts).forEach(([name, script]) => {
        if (name.includes('start') || name.includes('build') || 
            name.includes('test') || name.includes('dev') ||
            name.includes('serve') || name.includes('run')) {
          cli.scripts[name] = script;
        }
      });
    }
    
    // Determine main command
    if (cli.bin && typeof cli.bin === 'object') {
      cli.mainCommand = Object.keys(cli.bin)[0];
    } else if (typeof cli.bin === 'string') {
      cli.mainCommand = 'main';
    }
    
    return cli;
  }

  /**
   * Extract available commands from the repository
   */
  async extractCommands(repoPath, repoInfo) {
    const commands = [];
    
    // Extract from package.json scripts
    if (repoInfo.scripts) {
      Object.entries(repoInfo.scripts).forEach(([name, script]) => {
        commands.push({
          type: 'script',
          name,
          command: script,
          description: this.generateScriptDescription(name, script),
          category: this.categorizeScript(name)
        });
      });
    }
    
    // Extract from existing CLI
    if (repoInfo.existingCLI.bin) {
      if (typeof repoInfo.existingCLI.bin === 'object') {
        Object.entries(repoInfo.existingCLI.bin).forEach(([name, path]) => {
          commands.push({
            type: 'binary',
            name,
            path,
            description: `Execute ${name} command`,
            category: 'core'
          });
        });
      }
    }
    
    // Add common commands based on project type
    commands.push(...this.generateProjectTypeCommands(repoInfo));
    
    return commands;
  }

  /**
   * Generate commands based on project type
   */
  generateProjectTypeCommands(repoInfo) {
    const commands = [];
    const { projectType } = repoInfo;
    
    switch (projectType) {
      case 'node-server':
        commands.push(
          { type: 'generated', name: 'start', command: 'npm start', description: 'Start the server', category: 'lifecycle' },
          { type: 'generated', name: 'dev', command: 'npm run dev', description: 'Start in development mode', category: 'development' },
          { type: 'generated', name: 'test', command: 'npm test', description: 'Run tests', category: 'testing' }
        );
        break;
        
      case 'react-app':
      case 'next-app':
        commands.push(
          { type: 'generated', name: 'dev', command: 'npm run dev', description: 'Start development server', category: 'development' },
          { type: 'generated', name: 'build', command: 'npm run build', description: 'Build for production', category: 'build' },
          { type: 'generated', name: 'test', command: 'npm test', description: 'Run tests', category: 'testing' },
          { type: 'generated', name: 'lint', command: 'npm run lint', description: 'Run linting', category: 'quality' }
        );
        break;
        
      case 'python-project':
        commands.push(
          { type: 'generated', name: 'install', command: 'pip install -r requirements.txt', description: 'Install dependencies', category: 'setup' },
          { type: 'generated', name: 'run', command: 'python main.py', description: 'Run main script', category: 'core' },
          { type: 'generated', name: 'test', command: 'python -m pytest', description: 'Run tests', category: 'testing' }
        );
        break;
        
      case 'docker-project':
        commands.push(
          { type: 'generated', name: 'build', command: 'docker build -t app .', description: 'Build Docker image', category: 'build' },
          { type: 'generated', name: 'run', command: 'docker run -p 3000:3000 app', description: 'Run Docker container', category: 'core' }
        );
        break;
    }
    
    return commands;
  }

  /**
   * Generate CLI wrapper script
   */
  async generateCLIWrapper(repoInfo, commands, options = {}) {
    const template = await this.getTemplate(options.template || 'default');
    
    const className = repoInfo.name.replace(/[^a-zA-Z0-9]/g, '');
    const wrapperCode = template
      .replace(/{{NAME}}/g, className)
      .replace(/{{VERSION}}/g, repoInfo.version)
      .replace(/{{DESCRIPTION}}/g, repoInfo.description)
      .replace(/{{COMMANDS}}/g, this.generateCommandsCode(commands))
      .replace(/{{PROJECT_TYPE}}/g, repoInfo.projectType)
      .replace(/{{REPO_INFO}}/g, JSON.stringify(repoInfo, null, 2));
    
    return wrapperCode;
  }

  /**
   * Generate JavaScript code for commands
   */
  generateCommandsCode(commands) {
    const commandGroups = this.groupCommands(commands);
    let code = '';
    
    Object.entries(commandGroups).forEach(([category, categoryCommands]) => {
      code += `  // ${category.toUpperCase()} COMMANDS\n`;
      categoryCommands.forEach(cmd => {
        const safeName = cmd.name.replace(/[^a-zA-Z0-9]/g, '_');
        code += `  ${safeName}: {
    description: '${cmd.description}',
    execute: async (args = []) => {
      return await this.runCommand('${cmd.command}', args);
    }
  },\n`;
      });
      code += '\n';
    });
    
    return code.trim();
  }

  /**
   * Group commands by category
   */
  groupCommands(commands) {
    return commands.reduce((groups, cmd) => {
      const category = cmd.category || 'general';
      if (!groups[category]) groups[category] = [];
      groups[category].push(cmd);
      return groups;
    }, {});
  }

  /**
   * Get template for CLI wrapper
   */
  async getTemplate(templateName) {
    const templates = {
      default: `#!/usr/bin/env node

/**
 * Auto-generated CLI wrapper for {{NAME}}
 * Generated by CLI-Anything tool
 */

import { spawn } from 'node:child_process';
import { promisify } from 'node:util';

const repoInfo = {{REPO_INFO}};

class {{NAME}}CLI {
  constructor() {
    this.commands = {
{{COMMANDS}}
    };
  }

  async runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: 'inherit',
        shell: true
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, code });
        } else {
          reject(new Error(\`Command failed with code \${code}\`));
        }
      });

      process.on('error', reject);
    });
  }

  async execute(commandName, args = []) {
    if (!this.commands[commandName]) {
      throw new Error(\`Unknown command: \${commandName}\`);
    }

    const command = this.commands[commandName];
    console.log(\`Executing: \${command.description}\`);
    
    try {
      const result = await command.execute(args);
      console.log(\`✅ \${command.description} completed successfully\`);
      return result;
    } catch (error) {
      console.error(\`❌ \${command.description} failed:\`, error.message);
      throw error;
    }
  }

  listCommands() {
    console.log('Available commands for {{NAME}}:');
    Object.entries(this.commands).forEach(([name, cmd]) => {
      console.log(\`  \${name.padEnd(15)} - \${cmd.description}\`);
    });
  }
}

// CLI interface
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const cli = new {{NAME}}CLI();
  
  const [,, command, ...args] = process.argv;
  
  if (!command || command === '--help' || command === '-h') {
    cli.listCommands();
    process.exit(0);
  }
  
  cli.execute(command, args).catch(error => {
    console.error(error);
    process.exit(1);
  });
}

export default {{NAME}}CLI;`
    };

    return templates[templateName] || templates.default;
  }

  /**
   * Save generated CLI to file
   */
  async saveCLI(repoInfo, cliWrapper) {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    
    const outputDir = this.options.outputDir;
    const fileName = `${repoInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-cli.mjs`;
    const outputPath = path.join(outputDir, fileName);
    
    // Ensure output directory exists
    try {
      await fs.access(outputDir);
    } catch {
      await fs.mkdir(outputDir, { recursive: true });
    }
    
    await fs.writeFile(outputPath, cliWrapper, 'utf8');
    
    // Make executable (on Unix systems)
    try {
      await fs.chmod(outputPath, 0o755);
    } catch (error) {
      // Ignore on Windows
    }
    
    return outputPath;
  }

  /**
   * Utility methods
   */
  extractRepoName(repoPath) {
    return repoPath.split('/').pop().replace(/[^a-zA-Z0-9]/g, '-');
  }

  generateScriptDescription(name, script) {
    const descriptions = {
      start: 'Start the application',
      dev: 'Start in development mode',
      build: 'Build the application',
      test: 'Run tests',
      lint: 'Run linting',
      serve: 'Start the server',
      deploy: 'Deploy the application'
    };
    
    return descriptions[name] || `Execute script: ${name}`;
  }

  categorizeScript(name) {
    if (['start', 'dev', 'serve'].includes(name)) return 'lifecycle';
    if (['build', 'compile'].includes(name)) return 'build';
    if (['test', 'spec'].includes(name)) return 'testing';
    if (['lint', 'format', 'type-check'].includes(name)) return 'quality';
    if (['deploy', 'publish'].includes(name)) return 'deployment';
    return 'general';
  }

  log(message) {
    if (this.options.verbose) {
      console.log(`[CLI-Anything] ${message}`);
    }
  }
}

// Export for use as module
export default CLIAnything;

// CLI interface for direct usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, repoPath, ...args] = process.argv;
  
  if (!repoPath || repoPath === '--help' || repoPath === '-h') {
    console.log(`
Usage: cli-anything <repository-path> [options]

Options:
  --output-dir <dir>    Output directory for generated CLIs (default: ./generated-clis)
  --verbose             Enable verbose logging
  --template <name>     Template to use (default: default)
  --help                Show this help

Examples:
  cli-anything ./my-project
  cli-anything ./my-project --output-dir ./tools --verbose
`);
    process.exit(0);
  }
  
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output-dir' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--verbose') {
      options.verbose = true;
    } else if (args[i] === '--template' && args[i + 1]) {
      options.template = args[i + 1];
      i++;
    }
  }
  
  const cliAnything = new CLIAnything(options);
  
  cliAnything.generateCLI(repoPath)
    .then(result => {
      console.log(`✅ CLI generated successfully!`);
      console.log(`📁 Output: ${result.outputPath}`);
      console.log(`📊 Commands found: ${result.commands.length}`);
    })
    .catch(error => {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    });
}
