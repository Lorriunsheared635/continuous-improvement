#!/usr/bin/env node

/**
 * PM-Skills: Collection of 8 product management plugins
 * 
 * Helps developers define their "what" and "why" with product management tools
 * covering growth loops, market research, and GTM strategies.
 */

import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class PMSkills {
  constructor(options = {}) {
    this.options = {
      workspace: options.workspace || './pm-workspace',
      verbose: options.verbose || false,
      ...options
    };
    this.skills = {
      growthLoops: new GrowthLoopsSkill(options),
      marketResearch: new MarketResearchSkill(options),
      gtmStrategy: new GTMStrategySkill(options),
      userPersonas: new UserPersonasSkill(options),
      competitiveAnalysis: new CompetitiveAnalysisSkill(options),
      valueProposition: new ValuePropositionSkill(options),
      productRoadmap: new ProductRoadmapSkill(options),
      metricsDefinition: new MetricsDefinitionSkill(options)
    };
  }

  /**
   * Execute a specific PM skill
   */
  async executeSkill(skillName, input) {
    if (!this.skills[skillName]) {
      throw new Error(`Unknown skill: ${skillName}. Available skills: ${Object.keys(this.skills).join(', ')}`);
    }

    await this.ensureWorkspace();
    
    this.log(`🎯 Executing PM skill: ${skillName}`);
    
    const result = await this.skills[skillName].execute(input);
    
    // Save result
    const resultPath = await this.saveResult(skillName, result);
    this.log(`✅ Skill ${skillName} completed. Result saved to: ${resultPath}`);
    
    return { ...result, savedTo: resultPath };
  }

  /**
   * Get available skills
   */
  getAvailableSkills() {
    return Object.entries(this.skills).map(([name, skill]) => ({
      name,
      description: skill.description,
      category: skill.category
    }));
  }

  /**
   * Run comprehensive product analysis
   */
  async runProductAnalysis(productInfo) {
    this.log(`🚀 Running comprehensive product analysis`);
    
    const results = {};
    
    // Execute all skills in logical order
    const skillOrder = [
      'marketResearch',
      'userPersonas', 
      'competitiveAnalysis',
      'valueProposition',
      'growthLoops',
      'gtmStrategy',
      'productRoadmap',
      'metricsDefinition'
    ];

    for (const skillName of skillOrder) {
      try {
        this.log(`📊 Running ${skillName}...`);
        results[skillName] = await this.executeSkill(skillName, productInfo);
      } catch (error) {
        this.log(`⚠️  Skill ${skillName} failed: ${error.message}`);
        results[skillName] = { error: error.message };
      }
    }

    // Generate summary
    const summary = this.generateAnalysisSummary(results);
    
    // Save comprehensive analysis
    const analysisPath = await this.saveComprehensiveAnalysis(results, summary);
    
    this.log(`🎉 Product analysis completed. Saved to: ${analysisPath}`);
    
    return { results, summary, savedTo: analysisPath };
  }

  /**
   * Generate analysis summary
   */
  generateAnalysisSummary(results) {
    const summary = {
      totalSkills: Object.keys(results).length,
      completedSkills: Object.values(results).filter(r => !r.error).length,
      keyInsights: [],
      recommendations: [],
      risks: [],
      opportunities: []
    };

    // Extract insights from each skill
    Object.entries(results).forEach(([skillName, result]) => {
      if (result.error) return;
      
      if (result.insights) {
        summary.keyInsights.push(...result.insights);
      }
      if (result.recommendations) {
        summary.recommendations.push(...result.recommendations);
      }
      if (result.risks) {
        summary.risks.push(...result.risks);
      }
      if (result.opportunities) {
        summary.opportunities.push(...result.opportunities);
      }
    });

    return summary;
  }

  /**
   * Save result to file
   */
  async saveResult(skillName, result) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${skillName}_${timestamp}.json`;
    const filepath = join(this.options.workspace, filename);
    
    await writeFile(filepath, JSON.stringify(result, null, 2));
    return filepath;
  }

  /**
   * Save comprehensive analysis
   */
  async saveComprehensiveAnalysis(results, summary) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `product_analysis_${timestamp}.json`;
    const filepath = join(this.options.workspace, filename);
    
    const analysis = {
      timestamp: new Date().toISOString(),
      summary,
      results
    };
    
    await writeFile(filepath, JSON.stringify(analysis, null, 2));
    return filepath;
  }

  async ensureWorkspace() {
    try {
      await mkdir(this.options.workspace, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  log(message) {
    if (this.options.verbose) {
      console.log(`[PM-Skills] ${message}`);
    }
  }
}

/**
 * Growth Loops Skill
 */
class GrowthLoopsSkill {
  constructor(options = {}) {
    this.description = "Design and analyze sustainable growth loops for your product";
    this.category = "growth";
  }

  async execute(input) {
    const { product, users, metrics } = input;
    
    const growthLoops = {
      acquisition: this.identifyAcquisitionLoops(product, users),
      activation: this.identifyActivationLoops(product, users),
      retention: this.identifyRetentionLoops(product, users),
      referral: this.identifyReferralLoops(product, users),
      revenue: this.identifyRevenueLoops(product, metrics)
    };

    const analysis = {
      loops: growthLoops,
      insights: this.extractGrowthInsights(growthLoops),
      recommendations: this.generateGrowthRecommendations(growthLoops),
      kpis: this.defineGrowthKPIs(growthLoops),
      timestamp: new Date().toISOString()
    };

    return analysis;
  }

  identifyAcquisitionLoops(product, users) {
    return [
      {
        name: "Content-Driven Acquisition",
        description: "Create valuable content that attracts target users",
        steps: ["Create content", "Users discover content", "Users sign up", "Users become advocates"],
        metrics: ["content_views", "signup_rate", "sharing_rate"]
      },
      {
        name: "Viral Product Features",
        description: "Build features that naturally encourage sharing",
        steps: ["User uses feature", "Feature invites others", "New users join", "Loop continues"],
        metrics: ["viral_coefficient", "conversion_rate", "time_to_viral"]
      }
    ];
  }

  identifyActivationLoops(product, users) {
    return [
      {
        name: "Onboarding Experience",
        description: "Guide users to value realization quickly",
        steps: ["User signs up", "Complete onboarding", "Experience core value", "Become active user"],
        metrics: ["onboarding_completion", "time_to_value", "activation_rate"]
      }
    ];
  }

  identifyRetentionLoops(product, users) {
    return [
      {
        name: "Habit Formation",
        description: "Create daily/weekly usage patterns",
        steps: ["User uses product", "Receives value", "Forms habit", "Returns regularly"],
        metrics: ["daily_active_users", "retention_rate", "engagement_frequency"]
      }
    ];
  }

  identifyReferralLoops(product, users) {
    return [
      {
        name: "Network Effects",
        description: "Product becomes more valuable as more users join",
        steps: ["User invites others", "Network grows", "Value increases", "More invitations sent"],
        metrics: ["invitation_rate", "network_value", "growth_rate"]
      }
    ];
  }

  identifyRevenueLoops(product, metrics) {
    return [
      {
        name: "Value-Based Pricing",
        description: "Increase revenue as users realize more value",
        steps: ["User gets value", "Willingness to pay increases", "Upgrade to paid", "More value delivered"],
        metrics: ["conversion_to_paid", "customer_lifetime_value", "expansion_revenue"]
      }
    ];
  }

  extractGrowthInsights(loops) {
    return [
      "Focus on 1-2 core growth loops before expanding",
      "Measure each step of the funnel to identify bottlenecks",
      "Product-led growth often has the highest LTV/CAC ratio"
    ];
  }

  generateGrowthRecommendations(loops) {
    return [
      "Implement referral program with clear incentives",
      "Optimize onboarding to reduce time-to-value",
      "Create content strategy aligned with user acquisition"
    ];
  }

  defineGrowthKPIs(loops) {
    return {
      acquisition: ["monthly_new_users", "cac", "conversion_rates"],
      activation: ["activation_rate", "time_to_value", "onboarding_completion"],
      retention: ["retention_rate", "churn_rate", "engagement_score"],
      referral: ["viral_coefficient", "referral_rate", "network_effects"],
      revenue: ["arr", "ltv", "expansion_revenue"]
    };
  }
}

/**
 * Market Research Skill
 */
class MarketResearchSkill {
  constructor(options = {}) {
    this.description = "Conduct comprehensive market research and analysis";
    this.category = "research";
  }

  async execute(input) {
    const { product, industry, targetMarket } = input;
    
    const research = {
      marketSize: this.estimateMarketSize(industry, targetMarket),
      trends: this.identifyMarketTrends(industry),
      competitors: this.analyzeCompetitorLandscape(product, industry),
      opportunities: this.identifyMarketOpportunities(industry, targetMarket),
      threats: this.identifyMarketThreats(industry),
      customerNeeds: this.analyzeCustomerNeeds(targetMarket)
    };

    const analysis = {
      research,
      insights: this.extractMarketInsights(research),
      recommendations: this.generateMarketRecommendations(research),
      risks: this.assessMarketRisks(research),
      opportunities: this.highlightOpportunities(research),
      timestamp: new Date().toISOString()
    };

    return analysis;
  }

  estimateMarketSize(industry, targetMarket) {
    return {
      tam: "Total Addressable Market estimation",
      sam: "Serviceable Addressable Market", 
      som: "Serviceable Obtainable Market",
      methodology: "Top-down and bottom-up analysis",
      sources: ["Industry reports", "Government data", "Company financials"]
    };
  }

  identifyMarketTrends(industry) {
    return [
      {
        trend: "AI/ML Integration",
        impact: "High",
        timeline: "1-2 years",
        description: "Increasing adoption of AI in products"
      },
      {
        trend: "Remote Work Tools",
        impact: "Medium", 
        timeline: "Ongoing",
        description: "Continued demand for remote collaboration"
      }
    ];
  }

  analyzeCompetitorLandscape(product, industry) {
    return {
      directCompetitors: [
        {
          name: "Competitor A",
          strengths: ["Market leader", "Large user base"],
          weaknesses: ["Slow innovation", "High pricing"]
        }
      ],
      indirectCompetitors: [],
      marketShare: "Competitive market share analysis",
      positioning: "Where your product fits in the landscape"
    };
  }

  identifyMarketOpportunities(industry, targetMarket) {
    return [
      "Underserved customer segments",
      "Technological gaps in current solutions",
      "Changing customer behaviors"
    ];
  }

  identifyMarketThreats(industry) {
    return [
      "New market entrants",
      "Regulatory changes",
      "Economic downturns"
    ];
  }

  analyzeCustomerNeeds(targetMarket) {
    return {
      painPoints: ["Current solutions are expensive", "Poor user experience"],
      gains: ["Increased efficiency", "Cost savings"],
      jobsToBeDone: ["Manage daily tasks", "Collaborate with team"]
    };
  }

  extractMarketInsights(research) {
    return [
      "Market is growing but becoming saturated",
      "Customer needs are evolving with technology",
      "Differentiation is key to success"
    ];
  }

  generateMarketRecommendations(research) {
    return [
      "Focus on underserved market segments",
      "Develop clear differentiation strategy",
      "Monitor competitive landscape continuously"
    ];
  }

  assessMarketRisks(research) {
    return [
      "High competition may impact market share",
      "Regulatory changes could affect business model",
      "Economic factors may impact customer spending"
    ];
  }

  highlightOpportunities(research) {
    return [
      "Growing market segment with few competitors",
      "Technology creating new possibilities",
      "Changing customer needs opening new markets"
    ];
  }
}

/**
 * GTM Strategy Skill  
 */
class GTMStrategySkill {
  constructor(options = {}) {
    this.description = "Develop go-to-market strategy and execution plan";
    this.category = "strategy";
  }

  async execute(input) {
    const { product, market, budget, timeline } = input;
    
    const strategy = {
      positioning: this.definePositioning(product, market),
      pricing: this.developPricingStrategy(product, market),
      channels: this.selectGoToMarketChannels(product, market),
      launch: this.planLaunchStrategy(product, timeline),
      sales: this.designSalesStrategy(product, market),
      marketing: this.createMarketingStrategy(product, market)
    };

    const analysis = {
      strategy,
      insights: this.extractGTMInsights(strategy),
      recommendations: this.generateGTMRecommendations(strategy),
      timeline: this.createExecutionTimeline(strategy, timeline),
      budget: this.allocateBudget(strategy, budget),
      kpis: this.defineGTMKPIs(strategy),
      timestamp: new Date().toISOString()
    };

    return analysis;
  }

  definePositioning(product, market) {
    return {
      statement: "For [target customer] who [need], [product] is a [category] that [benefit]",
      differentiation: "Key differentiators from competitors",
      valueProposition: "Core value proposition",
      messaging: "Key messaging pillars"
    };
  }

  developPricingStrategy(product, market) {
    return {
      model: "Subscription-based pricing",
      tiers: [
        { name: "Basic", price: "$9/month", features: ["Core features"] },
        { name: "Pro", price: "$29/month", features: ["Advanced features"] }
      ],
      strategy: "Value-based pricing with competitive analysis",
      revenue: "Projected revenue based on conversion rates"
    };
  }

  selectGoToMarketChannels(product, market) {
    return {
      primary: ["Direct sales", "Online marketing"],
      secondary: ["Partnerships", "Content marketing"],
      channels: [
        {
          name: "Direct Website",
          cost: "Medium",
          reach: "Global",
          conversion: "High"
        }
      ]
    };
  }

  planLaunchStrategy(product, timeline) {
    return {
      phases: [
        { phase: "Pre-launch", duration: "2 weeks", activities: ["Beta testing"] },
        { phase: "Launch", duration: "1 week", activities: ["Public announcement"] },
        { phase: "Post-launch", duration: "4 weeks", activities: ["Gather feedback"] }
      ],
      activities: "Detailed launch activities",
      success: "Launch success criteria"
    };
  }

  designSalesStrategy(product, market) {
    return {
      approach: "Product-led growth with sales assistance",
      team: "Sales team structure and roles",
      process: "Sales process from lead to close",
      tools: "Sales tools and technology"
    };
  }

  createMarketingStrategy(product, market) {
    return {
      awareness: ["Content marketing", "Social media", "PR"],
      consideration: ["Product demos", "Case studies", "Webinars"],
      conversion: ["Free trials", "Pricing page", "Sales calls"],
      retention: ["Email marketing", "Customer success", "Community"]
    };
  }

  extractGTMInsights(strategy) {
    return [
      "Multi-channel approach reduces dependency on single channel",
      "Product-led growth scales better than sales-led",
      "Clear positioning is critical for market entry"
    ];
  }

  generateGTMRecommendations(strategy) {
    return [
      "Start with focused channel strategy before expanding",
      "Invest in product-led growth for long-term scalability",
      "Test messaging with target audience before full launch"
    ];
  }

  createExecutionTimeline(strategy, timeline) {
    return {
      totalDuration: timeline || "12 weeks",
      phases: {
        preparation: "2 weeks",
        launch: "1 week", 
        growth: "9 weeks"
      },
      milestones: "Key milestones and dependencies"
    };
  }

  allocateBudget(strategy, budget) {
    return {
      total: budget || "$50,000",
      allocation: {
        marketing: "40%",
        sales: "30%",
        product: "20%",
        operations: "10%"
      }
    };
  }

  defineGTMKPIs(strategy) {
    return {
      acquisition: ["leads", "cac", "conversion_rate"],
      revenue: ["mrr", "arr", "ltv"],
      engagement: ["activation_rate", "retention_rate"],
      brand: ["brand_awareness", "market_share"]
    };
  }
}

/**
 * User Personas Skill
 */
class UserPersonasSkill {
  constructor(options = {}) {
    this.description = "Create detailed user personas and journey maps";
    this.category = "users";
  }

  async execute(input) {
    const { targetUsers, researchData } = input;
    
    const personas = this.createUserPersonas(targetUsers, researchData);
    const journeys = this.createUserJourneys(personas);
    
    const analysis = {
      personas,
      journeys,
      insights: this.extractPersonaInsights(personas),
      recommendations: this.generatePersonaRecommendations(personas),
      timestamp: new Date().toISOString()
    };

    return analysis;
  }

  createUserPersonas(targetUsers, researchData) {
    return [
      {
        name: "Alex Manager",
        role: "Product Manager",
        demographics: {
          age: "32",
          experience: "8 years",
          company: "Mid-size tech company"
        },
        goals: ["Ship products faster", "Improve team collaboration"],
        painPoints: ["Poor communication", "Missed deadlines"],
        behaviors: ["Uses multiple tools", "Values efficiency"],
        needs: ["Better visibility", "Simplified workflows"]
      },
      {
        name: "Sam Developer",
        role: "Software Engineer", 
        demographics: {
          age: "28",
          experience: "5 years",
          company: "Startup"
        },
        goals: ["Write clean code", "Learn new technologies"],
        painPoints: ["Technical debt", "Unclear requirements"],
        behaviors: ["Prefers automation", "Values documentation"],
        needs: ["Clear specifications", "Good tools"]
      }
    ];
  }

  createUserJourneys(personas) {
    return personas.map(persona => ({
      persona: persona.name,
      stages: [
        {
          stage: "Awareness",
          actions: ["Discovers problem", "Searches for solutions"],
          emotions: ["Frustrated", "Hopeful"],
          touchpoints: ["Google search", "Colleagues"]
        },
        {
          stage: "Consideration",
          actions: ["Evaluates options", "Tries demos"],
          emotions: ["Curious", "Skeptical"],
          touchpoints: ["Website", "Product demo"]
        },
        {
          stage: "Decision",
          actions: ["Compares features", "Makes purchase"],
          emotions: ["Confident", "Excited"],
          touchpoints: ["Sales call", "Pricing page"]
        }
      ]
    }));
  }

  extractPersonaInsights(personas) {
    return [
      "Users have different needs based on their roles",
      "Pain points drive purchasing decisions",
      "User experience varies by technical proficiency"
    ];
  }

  generatePersonaRecommendations(personas) {
    return [
      "Design features for primary persona first",
      "Create onboarding paths for different user types",
      "Address pain points in marketing messaging"
    ];
  }
}

/**
 * Competitive Analysis Skill
 */
class CompetitiveAnalysisSkill {
  constructor(options = {}) {
    this.description = "Analyze competitors and competitive positioning";
    this.category = "competition";
  }

  async execute(input) {
    const { product, competitors, market } = input;
    
    const analysis = {
      directCompetitors: this.analyzeDirectCompetitors(competitors),
      indirectCompetitors: this.analyzeIndirectCompetitors(market),
      positioning: this.analyzeCompetitivePositioning(product, competitors),
      strengths: this.identifyCompetitiveStrengths(product, competitors),
      weaknesses: this.identifyCompetitiveWeaknesses(product, competitors),
      opportunities: this.findCompetitiveOpportunities(competitors),
      threats: this.assessCompetitiveThreats(competitors)
    };

    const result = {
      analysis,
      insights: this.extractCompetitiveInsights(analysis),
      recommendations: this.generateCompetitiveRecommendations(analysis),
      timestamp: new Date().toISOString()
    };

    return result;
  }

  analyzeDirectCompetitors(competitors) {
    return [
      {
        name: "Competitor A",
        product: "Similar product offering",
        strengths: ["Market leader", "Large user base"],
        weaknesses: ["Expensive", "Poor support"],
        marketShare: "40%",
        pricing: "$50-100/month"
      }
    ];
  }

  analyzeIndirectCompetitors(market) {
    return [
      {
        name: "Alternative Solution",
        type: "Different approach to same problem",
        threat: "Medium",
        description: "Solves same problem differently"
      }
    ];
  }

  analyzeCompetitivePositioning(product, competitors) {
    return {
      position: "Where product fits in competitive landscape",
      differentiation: "Key differentiators",
      advantages: "Competitive advantages",
      disadvantages: "Competitive disadvantages"
    };
  }

  identifyCompetitiveStrengths(product, competitors) {
    return [
      "Better user experience",
      "Lower pricing",
      "More features"
    ];
  }

  identifyCompetitiveWeaknesses(product, competitors) {
    return [
      "Smaller market presence",
      "Limited resources",
      "Newer product"
    ];
  }

  findCompetitiveOpportunities(competitors) {
    return [
      "Gaps in competitor offerings",
      "Underserved market segments",
      "Areas where competitors are weak"
    ];
  }

  assessCompetitiveThreats(competitors) {
    return [
      "New competitor entry",
      "Price wars",
      "Feature copying"
    ];
  }

  extractCompetitiveInsights(analysis) {
    return [
      "Market is crowded but has room for differentiation",
      "Price competition is intense",
      "Customer experience is key differentiator"
    ];
  }

  generateCompetitiveRecommendations(analysis) {
    return [
      "Focus on unique value proposition",
      "Monitor competitor moves closely",
      "Build competitive moats through network effects"
    ];
  }
}

/**
 * Value Proposition Skill
 */
class ValuePropositionSkill {
  constructor(options = {}) {
    this.description = "Define and refine value proposition";
    this.category = "value";
  }

  async execute(input) {
    const { product, customers, market } = input;
    
    const analysis = {
      customerJobs: this.identifyCustomerJobs(customers),
      pains: this.identifyCustomerPains(customers),
      gains: this.identifyCustomerGains(customers),
      products: this.mapProductsToNeeds(product),
      valueProposition: this.createValueProposition(product, customers),
      validation: this.planValuePropositionValidation()
    };

    const result = {
      analysis,
      insights: this.extractValueInsights(analysis),
      recommendations: this.generateValueRecommendations(analysis),
      timestamp: new Date().toISOString()
    };

    return result;
  }

  identifyCustomerJobs(customers) {
    return [
      "Manage daily tasks efficiently",
      "Collaborate with team members",
      "Track progress and results"
    ];
  }

  identifyCustomerPains(customers) {
    return [
      "Wasting time on manual processes",
      "Poor communication with team",
      "Lack of visibility into progress"
    ];
  }

  identifyCustomerGains(customers) {
    return [
      "Increased productivity",
      "Better team collaboration",
      "Data-driven decisions"
    ];
  }

  mapProductsToNeeds(product) {
    return {
      painRelievers: [
        "Automates manual tasks",
        "Improves communication",
        "Provides visibility"
      ],
      gainCreators: [
        "Increases efficiency",
        "Enables collaboration",
        "Delivers insights"
      ]
    };
  }

  createValueProposition(product, customers) {
    return {
      headline: "The most efficient way to manage your team's work",
      subheading: "Save time and improve collaboration with our all-in-one platform",
      benefits: [
        "Save 10+ hours per week",
        "Improve team productivity by 30%",
        "Make data-driven decisions"
      ],
      features: [
        "Automated workflows",
        "Real-time collaboration",
        "Advanced analytics"
      ]
    };
  }

  planValuePropositionValidation() {
    return {
      methods: ["Customer interviews", "A/B testing", "Surveys"],
      metrics: ["Message resonance", "Conversion rates", "Customer feedback"],
      timeline: "4-6 weeks"
    };
  }

  extractValueInsights(analysis) {
    return [
      "Customers value time savings above all",
      "Team collaboration is major pain point",
      "Data insights drive purchasing decisions"
    ];
  }

  generateValueRecommendations(analysis) {
    return [
      "Emphasize time savings in messaging",
      "Highlight collaboration features",
      "Showcase data and analytics capabilities"
    ];
  }
}

/**
 * Product Roadmap Skill
 */
class ProductRoadmapSkill {
  constructor(options = {}) {
    this.description = "Create strategic product roadmap";
    this.category = "planning";
  }

  async execute(input) {
    const { product, vision, goals, resources } = input;
    
    const initiatives = this.defineStrategicInitiatives(goals);
    const roadmap = {
      vision: this.defineProductVision(vision),
      strategy: this.defineProductStrategy(product, goals),
      initiatives,
      features: this.prioritizeFeatures(product, goals),
      timeline: this.createRoadmapTimeline(initiatives, resources),
      dependencies: this.identifyDependencies(initiatives),
      risks: this.assessRoadmapRisks(initiatives)
    };

    const analysis = {
      roadmap,
      insights: this.extractRoadmapInsights(roadmap),
      recommendations: this.generateRoadmapRecommendations(roadmap),
      kpis: this.defineRoadmapKPIs(roadmap),
      timestamp: new Date().toISOString()
    };

    return analysis;
  }

  defineProductVision(vision) {
    return {
      statement: "Become the leading platform for team productivity",
      timeline: "3-5 years",
      impact: "Transform how teams work together",
      metrics: ["Market leadership", "Customer satisfaction", "Revenue growth"]
    };
  }

  defineProductStrategy(product, goals) {
    return {
      approach: "Product-led growth with enterprise expansion",
      focus: "User experience and automation",
      differentiation: "AI-powered insights and workflows",
      markets: ["Start with SMB, expand to enterprise"]
    };
  }

  defineStrategicInitiatives(goals) {
    return [
      {
        name: "Mobile App Launch",
        priority: "High",
        impact: "Expand user access",
        effort: "High",
        timeline: "Q2 2024"
      },
      {
        name: "AI Integration",
        priority: "Medium",
        impact: "Enhanced functionality",
        effort: "High",
        timeline: "Q3 2024"
      }
    ];
  }

  prioritizeFeatures(product, goals) {
    return {
      now: [
        { feature: "Performance improvements", priority: "High" },
        { feature: "UI enhancements", priority: "Medium" }
      ],
      next: [
        { feature: "Mobile app", priority: "High" },
        { feature: "AI features", priority: "Medium" }
      ],
      later: [
        { feature: "Advanced analytics", priority: "Low" }
      ]
    };
  }

  createRoadmapTimeline(initiatives, resources) {
    return {
      quarters: {
        "Q1 2024": ["Performance improvements", "UI enhancements"],
        "Q2 2024": ["Mobile app launch"],
        "Q3 2024": ["AI integration"],
        "Q4 2024": ["Advanced analytics"]
      },
      resources: "Resource allocation plan",
      milestones: "Key milestones and deliverables"
    };
  }

  identifyDependencies(initiatives) {
    return [
      "Mobile app depends on API development",
      "AI features depend on data infrastructure",
      "Analytics depend on user data collection"
    ];
  }

  assessRoadmapRisks(initiatives) {
    return [
      "Technical complexity may delay timeline",
      "Resource constraints may impact quality",
      "Market changes may require pivots"
    ];
  }

  extractRoadmapInsights(roadmap) {
    return [
      "Mobile expansion is critical for growth",
      "AI integration provides competitive advantage",
      "Phased approach reduces risk"
    ];
  }

  generateRoadmapRecommendations(roadmap) {
    return [
      "Focus on core features before expanding",
      "Validate market demand for new initiatives",
      "Build flexibility into roadmap for changes"
    ];
  }

  defineRoadmapKPIs(roadmap) {
    return {
      product: ["Feature adoption", "User satisfaction", "Performance metrics"],
      business: ["Revenue growth", "Market share", "Customer acquisition"],
      development: ["Velocity", "Quality", "Innovation rate"]
    };
  }
}

/**
 * Metrics Definition Skill
 */
class MetricsDefinitionSkill {
  constructor(options = {}) {
    this.description = "Define comprehensive product and business metrics";
    this.category = "metrics";
  }

  async execute(input) {
    const { product, business, goals } = input;
    
    const productMetrics = this.defineProductMetrics(product);
    const businessMetrics = this.defineBusinessMetrics(business);
    const userMetrics = this.defineUserMetrics(product);
    const technicalMetrics = this.defineTechnicalMetrics(product);
    const kpis = this.defineKPIs(goals);
    const reporting = this.designReportingSystem({ productMetrics, businessMetrics, userMetrics, technicalMetrics, kpis });
    
    const metrics = {
      productMetrics,
      businessMetrics,
      userMetrics,
      technicalMetrics,
      kpis,
      reporting
    };

    const analysis = {
      metrics,
      insights: this.extractMetricsInsights(metrics),
      recommendations: this.generateMetricsRecommendations(metrics),
      implementation: this.planMetricsImplementation(metrics),
      timestamp: new Date().toISOString()
    };

    return analysis;
  }

  defineProductMetrics(product) {
    return {
      acquisition: ["signups", "activation_rate", "time_to_value"],
      engagement: ["daily_active_users", "session_duration", "feature_adoption"],
      retention: ["retention_rate", "churn_rate", "resurrection_rate"],
      satisfaction: ["nps", "csat", "user_feedback"]
    };
  }

  defineBusinessMetrics(business) {
    return {
      revenue: ["mrr", "arr", "revenue_growth_rate"],
      profitability: ["gross_margin", "net_margin", "unit_economics"],
      efficiency: ["cac", "ltv", "ltv_cac_ratio"],
      market: ["market_share", "penetration_rate", "competitive_position"]
    };
  }

  defineUserMetrics(product) {
    return {
      behavior: ["user_journey_completion", "feature_usage", "workflow_efficiency"],
      outcomes: ["productivity_gain", "time_saved", "error_reduction"],
      satisfaction: ["user_effort_score", "task_success_rate", "user_delight"]
    };
  }

  defineTechnicalMetrics(product) {
    return {
      performance: ["load_time", "uptime", "error_rate"],
      quality: ["bug_rate", "test_coverage", "code_quality"],
      scalability: ["concurrent_users", "data_volume", "response_time"],
      security: ["vulnerabilities", "incidents", "compliance"]
    };
  }

  defineKPIs(goals) {
    return {
      primary: [
        { metric: "monthly_recurring_growth", target: "20%", timeframe: "monthly" },
        { metric: "user_retention_rate", target: "85%", timeframe: "monthly" }
      ],
      secondary: [
        { metric: "customer_satisfaction", target: "4.5/5", timeframe: "quarterly" },
        { metric: "feature_adoption_rate", target: "60%", timeframe: "monthly" }
      ]
    };
  }

  designReportingSystem(metrics) {
    return {
      dashboards: [
        { name: "Executive Dashboard", audience: "Leadership", metrics: ["revenue", "growth", "retention"] },
        { name: "Product Dashboard", audience: "Product Team", metrics: ["usage", "satisfaction", "features"] }
      ],
      frequency: {
        real_time: ["active_users", "system_status"],
        daily: ["signups", "revenue"],
        weekly: ["retention", "satisfaction"],
        monthly: ["growth", "market_share"]
      },
      alerts: [
        { metric: "downtime", threshold: ">5 minutes", action: "immediate_notification" },
        { metric: "churn_rate", threshold: ">10%", action: "weekly_review" }
      ]
    };
  }

  extractMetricsInsights(metrics) {
    return [
      "Focus on leading indicators, not just lagging",
      "Connect product metrics to business outcomes",
      "Different metrics for different stakeholders"
    ];
  }

  generateMetricsRecommendations(metrics) {
    return [
      "Implement tracking before you need the data",
      "Create single source of truth for metrics",
      "Review and adjust metrics regularly"
    ];
  }

  planMetricsImplementation(metrics) {
    return {
      phases: [
        { phase: "Infrastructure", duration: "2 weeks", deliverables: ["Tracking setup", "Data pipeline"] },
        { phase: "Dashboard Creation", duration: "3 weeks", deliverables: ["Executive dashboard", "Product dashboard"] },
        { phase: "Process Integration", duration: "2 weeks", deliverables: ["Reporting process", "Alert system"] }
      ],
      tools: ["Analytics platform", "Dashboard tool", "Alert system"],
      governance: "Metrics governance and ownership"
    };
  }
}

// Export for use as module
export default PMSkills;

// CLI interface for direct usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, command, skillName, ...args] = process.argv;
  
  if (!command || command === '--help' || command === '-h') {
    console.log(`
Usage: pm-skills <command> [skill-name] [options]

Commands:
  list                          List all available PM skills
  execute <skill-name>          Execute a specific skill
  analyze                       Run comprehensive product analysis

Available Skills:
  growthLoops           - Design sustainable growth loops
  marketResearch        - Conduct market research
  gtmStrategy          - Develop go-to-market strategy
  userPersonas         - Create user personas
  competitiveAnalysis  - Analyze competition
  valueProposition     - Define value proposition
  productRoadmap       - Create product roadmap
  metricsDefinition    - Define product metrics

Options:
  --workspace <dir>     Workspace directory (default: ./pm-workspace)
  --verbose             Enable verbose logging
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
    }
  }
  
  const pmSkills = new PMSkills(options);
  
  switch (command) {
    case 'list':
      const skills = pmSkills.getAvailableSkills();
      console.log('🎯 Available PM Skills:');
      skills.forEach(skill => {
        console.log(`  ${skill.name.padEnd(20)} - ${skill.description} [${skill.category}]`);
      });
      break;
      
    case 'execute':
      if (!skillName) {
        console.error('Error: Skill name required');
        process.exit(1);
      }
      // In real usage, this would read input from file or stdin
      const mockInput = { product: "Sample Product", market: "Technology" };
      pmSkills.executeSkill(skillName, mockInput)
        .then(result => {
          console.log(`✅ Skill ${skillName} completed successfully`);
          console.log(`📁 Result saved to: ${result.savedTo}`);
        })
        .catch(error => {
          console.error(`❌ Error: ${error.message}`);
          process.exit(1);
        });
      break;
      
    case 'analyze':
      const mockProductInfo = { 
        product: "Sample Product", 
        industry: "Technology",
        targetMarket: "SMB"
      };
      pmSkills.runProductAnalysis(mockProductInfo)
        .then(result => {
          console.log(`🎉 Product analysis completed`);
          console.log(`📁 Results saved to: ${result.savedTo}`);
          console.log(`📊 Summary: ${result.summary.completedSkills}/${result.summary.totalSkills} skills completed`);
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
