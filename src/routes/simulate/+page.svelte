<script lang="ts">
	import { onMount } from 'svelte';

	// Simulation Configuration State
	let config = $state({
		// Agent Configuration
		totalAgents: 100,
		whalePercentage: 5,
		activeParticipationRate: 60,
		averageWealth: 1000,
		wealthDistribution: 'pareto', // 'uniform', 'normal', 'pareto'
		
		// Token Parameters
		initialSpaceMoney: 1000000,
		initialSpaceTime: 0,
		stDecayRate: 0.0001,
		stMintRate: 10,
		pricePerPacemoney: 0.01, // USD per $PACEMONEY token
		
		// Governance Parameters
		proposalThreshold: 100,
		quorumPercentage: 20,
		proposalFrequency: 5, // days between proposals
		
		// Owner/Founder Settings
		ownerVetoProbability: 15, // % chance owner vetoes a passing proposal
		ownerVetoThreshold: 70, // Owner more likely to veto if approval < this %
		
		// Simulation Settings
		simulationDays: 9001,
		simulationSpeed: 100, // steps per second
		
		// Attack Scenarios
		enableWhaleAttack: false,
		whaleAttackDay: 180,
		enableSybilAttack: false,
		sybilAgentCount: 50,
		
		// Dynamic Voter Settings
		sentimentDecayRate: 0.1, // Natural sentiment decay per day without engagement
		disengagementThreshold: 25, // Sentiment below this = agent disengages
		reengagementThreshold: 60, // Sentiment must reach this to re-engage
		newAgentAttractionRate: 0.5, // Base rate of new agent attraction per day
		maxAgentGrowth: 500, // Maximum total agents from organic growth
		
		// Sentiment Shock Events
		enableSentimentShocks: true,
		shockProbability: 2, // % chance of random shock event per day
		
		// Asset Investment Settings
		enableAssetInvestments: true,
		assetProposalFrequency: 20, // days between asset proposals
		maxAssetAllocation: 30, // max % of treasury for single asset
		assetVolatility: 0.15, // annual volatility (0.15 = 15%)
		assetAppreciationBias: 0.05 // slight positive bias (5% annual)
	});

	// Simulation State
	let isRunning = $state(false);
	let isPaused = $state(false);
	let currentDay = $state(0);
	let simulationComplete = $state(false);
	let simulationProgress = $state(0);
	let configExpanded = $state(false);
	
	// Metrics State
	let metrics = $state({
		totalSpaceMoney: 0,
		totalSpaceTime: 0,
		giniCoefficient: 0,
		voterTurnout: 0,
		proposalsPassed: 0,
		proposalsFailed: 0,
		proposalsVetoed: 0,
		activeVoters: 0,
		sunsetProgress: 0,
		communitySentiment: 100, // 0-100, decreases with vetoes
		ownerTrust: 100, // 0-100, decreases with vetoes
		
		// Enhanced voter tracking
		eligibleVoters: 0, // Agents meeting SpaceTime threshold
		disengagedAgents: 0, // Agents who have "left" due to low sentiment
		newAgentsAttracted: 0, // Cumulative new agents attracted
		communityHealth: 100, // Combined sentiment + trust indicator
		
		// Asset Investment metrics
		totalAssetValue: 0, // Current market value of all assets
		totalAssetCost: 0, // Total purchase cost of all assets
		totalAssetPnL: 0, // Total profit/loss (unrealized)
		totalAssetPnLPercent: 0, // P&L as percentage
		assetCount: 0 // Number of assets held
	});

	// Asset Portfolio
	let assets = $state<{
		id: number;
		name: string;
		type: 'real-estate' | 'equipment' | 'intellectual-property' | 'infrastructure' | 'art-collectibles';
		purchaseDay: number;
		purchasePrice: number; // in $PACEMONEY
		purchasePriceUSD: number;
		currentValue: number; // current value in $PACEMONEY
		currentValueUSD: number;
		pnl: number; // profit/loss in $PACEMONEY
		pnlPercent: number;
		volatility: number; // individual asset volatility
		appreciationRate: number; // base annual appreciation
		status: 'held' | 'sold';
		soldDay?: number;
		soldPrice?: number;
	}[]>([]);

	// Proposal tracking
	let proposals = $state<{
		id: number;
		day: number;
		title: string;
		type: 'time-heavy' | 'money-heavy' | 'balanced';
		timeWeight: number; // 0-1, how much $PACETIME matters
		moneyWeight: number; // 0-1, how much $PACEMONEY matters
		votesFor: number;
		votesAgainst: number;
		passed: boolean;
		vetoed: boolean;
		approvalRate: number;
	}[]>([]);

	// Historical Data for Charts
	let history = $state<{
		day: number;
		totalST: number;
		totalSM: number;
		gini: number;
		turnout: number;
		activeVoters: number;
		sentiment: number;
		ownerTrust: number;
		proposalsPassed: number;
		proposalsFailed: number;
		proposalsVetoed: number;
		sunsetProgress: number;
		eligibleVoters: number;
		disengagedAgents: number;
		totalAgents: number;
		communityHealth: number;
		// Asset tracking
		totalAssetValue: number;
		totalAssetCost: number;
		totalAssetPnL: number;
		assetCount: number;
	}[]>([]);

	// Agent Data
	let agents = $state<{
		id: number;
		spaceMoney: number;
		spaceTime: number;
		isWhale: boolean;
		participationRate: number;
		votingAccuracy: number;
		sentiment: number; // Individual sentiment toward DAO (affected by vetoes)
		isDisengaged: boolean; // Agent has "left" due to low sentiment
		disengagedDay: number; // Day they disengaged (for hysteresis)
		joinDay: number; // Day agent joined (0 = original, >0 = attracted later)
	}[]>([]);

	// Track new agent attraction for logging
	let agentsAttractedToday = $state(0);

	// Simulation Logs
	let logs = $state<{
		day: number;
		type: 'info' | 'success' | 'warning' | 'danger' | 'veto';
		message: string;
	}[]>([]);

	// Recent Proposals for display
	let recentProposals = $state<{
		day: number;
		title: string;
		type: 'time-heavy' | 'money-heavy' | 'balanced';
		status: 'passed' | 'failed' | 'vetoed';
		votesFor: number;
		votesAgainst: number;
		timeWeight: number;
		moneyWeight: number;
	}[]>([]);

	// Proposal type templates
	const proposalTemplates = [
		{ title: 'Community Event Funding', type: 'money-heavy' as const, timeWeight: 0.2, moneyWeight: 0.8 },
		{ title: 'Protocol Development Sprint', type: 'time-heavy' as const, timeWeight: 0.85, moneyWeight: 0.15 },
		{ title: 'Marketing Campaign', type: 'money-heavy' as const, timeWeight: 0.3, moneyWeight: 0.7 },
		{ title: 'Governance Documentation', type: 'time-heavy' as const, timeWeight: 0.9, moneyWeight: 0.1 },
		{ title: 'Treasury Diversification', type: 'balanced' as const, timeWeight: 0.5, moneyWeight: 0.5 },
		{ title: 'New Feature Development', type: 'time-heavy' as const, timeWeight: 0.75, moneyWeight: 0.25 },
		{ title: 'Partnership Grant', type: 'money-heavy' as const, timeWeight: 0.25, moneyWeight: 0.75 },
		{ title: 'Bug Bounty Program', type: 'balanced' as const, timeWeight: 0.45, moneyWeight: 0.55 },
		{ title: 'Community Rewards Update', type: 'balanced' as const, timeWeight: 0.55, moneyWeight: 0.45 },
		{ title: 'Infrastructure Upgrade', type: 'time-heavy' as const, timeWeight: 0.8, moneyWeight: 0.2 },
		{ title: 'Ecosystem Fund Allocation', type: 'money-heavy' as const, timeWeight: 0.15, moneyWeight: 0.85 },
		{ title: 'Contributor Compensation', type: 'balanced' as const, timeWeight: 0.6, moneyWeight: 0.4 },
	];

	// Asset purchase proposal templates
	const assetProposalTemplates = [
		{ name: 'Downtown Commercial Property', type: 'real-estate' as const, basePrice: 50000, volatility: 0.12, appreciation: 0.06 },
		{ name: 'Suburban Office Complex', type: 'real-estate' as const, basePrice: 35000, volatility: 0.10, appreciation: 0.04 },
		{ name: 'Mixed-Use Development Land', type: 'real-estate' as const, basePrice: 80000, volatility: 0.18, appreciation: 0.08 },
		{ name: 'Industrial Warehouse', type: 'real-estate' as const, basePrice: 25000, volatility: 0.08, appreciation: 0.03 },
		{ name: 'Co-Working Space Building', type: 'real-estate' as const, basePrice: 40000, volatility: 0.15, appreciation: 0.05 },
		{ name: 'Residential Rental Portfolio', type: 'real-estate' as const, basePrice: 60000, volatility: 0.10, appreciation: 0.05 },
		{ name: 'High-Performance Computing Cluster', type: 'equipment' as const, basePrice: 15000, volatility: 0.25, appreciation: -0.15 },
		{ name: 'Mining/Staking Infrastructure', type: 'equipment' as const, basePrice: 20000, volatility: 0.30, appreciation: -0.10 },
		{ name: '3D Printing Farm', type: 'equipment' as const, basePrice: 8000, volatility: 0.20, appreciation: -0.12 },
		{ name: 'Broadcasting Equipment Suite', type: 'equipment' as const, basePrice: 12000, volatility: 0.15, appreciation: -0.08 },
		{ name: 'Patent Portfolio Acquisition', type: 'intellectual-property' as const, basePrice: 30000, volatility: 0.35, appreciation: 0.10 },
		{ name: 'Software IP Licensing Rights', type: 'intellectual-property' as const, basePrice: 25000, volatility: 0.40, appreciation: 0.15 },
		{ name: 'Trademark Bundle', type: 'intellectual-property' as const, basePrice: 10000, volatility: 0.20, appreciation: 0.02 },
		{ name: 'Community Data Center', type: 'infrastructure' as const, basePrice: 45000, volatility: 0.12, appreciation: 0.02 },
		{ name: 'Fiber Network Stake', type: 'infrastructure' as const, basePrice: 35000, volatility: 0.15, appreciation: 0.04 },
		{ name: 'Renewable Energy Farm Share', type: 'infrastructure' as const, basePrice: 55000, volatility: 0.18, appreciation: 0.06 },
		{ name: 'Digital Art Collection (NFTs)', type: 'art-collectibles' as const, basePrice: 5000, volatility: 0.60, appreciation: 0.0 },
		{ name: 'Rare Collectible Acquisition', type: 'art-collectibles' as const, basePrice: 15000, volatility: 0.45, appreciation: 0.08 },
		{ name: 'Fine Art Investment', type: 'art-collectibles' as const, basePrice: 25000, volatility: 0.30, appreciation: 0.07 },
	];

	// Animation frame ID for cleanup
	let animationId: number | null = null;
	let lastUpdate = 0;

	// Preset Configurations
	const presets = [
		{
			name: 'Healthy Community',
			description: 'Balanced participation, low veto rate',
			config: {
				totalAgents: 200,
				whalePercentage: 2,
				activeParticipationRate: 70,
				averageWealth: 500,
				wealthDistribution: 'normal',
				ownerVetoProbability: 5,
				enableWhaleAttack: false,
				enableSybilAttack: false
			}
		},
		{
			name: 'Authoritarian Owner',
			description: 'High veto rate, community frustration',
			config: {
				totalAgents: 150,
				whalePercentage: 5,
				activeParticipationRate: 60,
				averageWealth: 800,
				wealthDistribution: 'normal',
				ownerVetoProbability: 40,
				ownerVetoThreshold: 85,
				enableWhaleAttack: false,
				enableSybilAttack: false
			}
		},
		{
			name: 'Whale Dominated',
			description: '$PACEMONEY concentration scenario',
			config: {
				totalAgents: 100,
				whalePercentage: 10,
				activeParticipationRate: 40,
				averageWealth: 2000,
				wealthDistribution: 'pareto',
				ownerVetoProbability: 20,
				enableWhaleAttack: true,
				whaleAttackDay: 90,
				enableSybilAttack: false
			}
		},
		{
			name: 'Sybil Attack',
			description: 'Test $PACETIME resistance to identity attacks',
			config: {
				totalAgents: 150,
				whalePercentage: 3,
				activeParticipationRate: 55,
				averageWealth: 800,
				wealthDistribution: 'uniform',
				ownerVetoProbability: 10,
				enableWhaleAttack: false,
				enableSybilAttack: true,
				sybilAgentCount: 100
			}
		},
		{
			name: 'Community Exodus',
			description: 'Test mass disengagement & recovery',
			config: {
				totalAgents: 200,
				whalePercentage: 5,
				activeParticipationRate: 65,
				averageWealth: 600,
				wealthDistribution: 'normal',
				ownerVetoProbability: 50,
				ownerVetoThreshold: 95,
				sentimentDecayRate: 0.3,
				disengagementThreshold: 35,
				reengagementThreshold: 65,
				enableSentimentShocks: true,
				shockProbability: 5,
				enableWhaleAttack: false,
				enableSybilAttack: false
			}
		},
		{
			name: 'Thriving Ecosystem',
			description: 'Organic growth through community health',
			config: {
				totalAgents: 100,
				whalePercentage: 1,
				activeParticipationRate: 80,
				averageWealth: 400,
				wealthDistribution: 'normal',
				ownerVetoProbability: 2,
				sentimentDecayRate: 0.05,
				newAgentAttractionRate: 1.5,
				maxAgentGrowth: 800,
				enableSentimentShocks: true,
				shockProbability: 3,
				enableWhaleAttack: false,
				enableSybilAttack: false
			}
		},
		{
			name: 'Volatile Market',
			description: 'High frequency sentiment shocks',
			config: {
				totalAgents: 150,
				whalePercentage: 8,
				activeParticipationRate: 50,
				averageWealth: 1200,
				wealthDistribution: 'pareto',
				ownerVetoProbability: 15,
				sentimentDecayRate: 0.2,
				enableSentimentShocks: true,
				shockProbability: 10,
				newAgentAttractionRate: 0.8,
				enableWhaleAttack: false,
				enableSybilAttack: false
			}
		},
		{
			name: 'Asset Investor DAO',
			description: 'Active real estate & asset portfolio',
			config: {
				totalAgents: 200,
				whalePercentage: 5,
				activeParticipationRate: 70,
				averageWealth: 2000,
				wealthDistribution: 'normal',
				ownerVetoProbability: 8,
				sentimentDecayRate: 0.1,
				enableSentimentShocks: true,
				shockProbability: 5,
				enableAssetInvestments: true,
				assetProposalFrequency: 15,
				maxAssetAllocation: 25,
				assetVolatility: 0.12,
				assetAppreciationBias: 0.06,
				enableWhaleAttack: false,
				enableSybilAttack: false
			}
		}
	];

	// Utility Functions
	function generateParetoRandom(alpha: number = 1.5): number {
		const u = Math.random();
		return 1 / Math.pow(1 - u, 1 / alpha);
	}

	function generateNormalRandom(mean: number, stdDev: number): number {
		const u1 = Math.random();
		const u2 = Math.random();
		const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
		return Math.max(0, mean + z * stdDev);
	}

	function calculateGini(values: number[]): number {
		if (values.length === 0) return 0;
		const sorted = [...values].sort((a, b) => a - b);
		const n = sorted.length;
		const sum = sorted.reduce((a, b) => a + b, 0);
		if (sum === 0) return 0;
		
		let cumulativeSum = 0;
		let weightedSum = 0;
		for (let i = 0; i < n; i++) {
			cumulativeSum += sorted[i];
			weightedSum += cumulativeSum;
		}
		return (2 * weightedSum) / (n * sum) - (n + 1) / n;
	}

	// Calculate voting power for an agent on a specific proposal
	function calculateVotingPower(agent: typeof agents[0], timeWeight: number, moneyWeight: number): number {
		// Normalize weights
		const totalWeight = timeWeight + moneyWeight;
		const normalizedTimeWeight = timeWeight / totalWeight;
		const normalizedMoneyWeight = moneyWeight / totalWeight;
		
		// Calculate weighted voting power
		// $PACETIME contribution (earned through participation)
		const timeContribution = agent.spaceTime * normalizedTimeWeight;
		// $PACEMONEY contribution (purchased/held)
		const moneyContribution = Math.sqrt(agent.spaceMoney) * normalizedMoneyWeight; // sqrt to reduce whale dominance
		
		return timeContribution + moneyContribution;
	}

	function initializeAgents() {
		agents = [];
		const whaleCount = Math.floor(config.totalAgents * config.whalePercentage / 100);
		
		for (let i = 0; i < config.totalAgents; i++) {
			const isWhale = i < whaleCount;
			let wealth: number;
			
			switch (config.wealthDistribution) {
				case 'pareto':
					wealth = config.averageWealth * generateParetoRandom(1.2);
					break;
				case 'normal':
					wealth = generateNormalRandom(config.averageWealth, config.averageWealth * 0.3);
					break;
				default: // uniform
					wealth = config.averageWealth * (0.5 + Math.random());
			}
			
			if (isWhale) {
				wealth *= 10 + Math.random() * 20; // Whales have 10-30x average wealth
			}
			
			agents.push({
				id: i,
				spaceMoney: Math.floor(wealth),
				spaceTime: 0,
				isWhale,
				participationRate: isWhale 
					? 0.9 + Math.random() * 0.1 // Whales are highly active
					: config.activeParticipationRate / 100 * (0.5 + Math.random()),
				votingAccuracy: 0.5 + Math.random() * 0.4, // 50-90% accuracy
				sentiment: 100, // Start with full trust
				isDisengaged: false,
				disengagedDay: 0,
				joinDay: 0 // Original agents
			});
		}
	}

	// Calculate dynamic active voters based on sentiment and trust
	function calculateActiveVoters(): number {
		// Get eligible agents (meet SpaceTime threshold and not disengaged)
		const eligibleAgents = agents.filter(a => 
			a.spaceTime >= config.proposalThreshold * 0.1 && !a.isDisengaged
		);
		
		// Calculate expected active voters based on probability weighting
		let expectedActiveVoters = 0;
		for (const agent of eligibleAgents) {
			// Individual sentiment factor (0-1)
			const sentimentFactor = agent.sentiment / 100;
			
			// Community sentiment modifier (0.5-1.0) - low sentiment = fewer active
			const communityFactor = 0.5 + (metrics.communitySentiment / 200);
			
			// Owner trust modifier (0.5-1.0) - low trust = people disengage
			const trustFactor = 0.5 + (metrics.ownerTrust / 200);
			
			// Combined probability this agent is "actively voting"
			const activeProbability = agent.participationRate 
				* sentimentFactor 
				* communityFactor 
				* trustFactor;
			
			expectedActiveVoters += activeProbability;
		}
		
		return Math.round(expectedActiveVoters);
	}

	// Process agent disengagement and re-engagement
	function processAgentEngagement(day: number) {
		for (const agent of agents) {
			if (agent.isDisengaged) {
				// Check for re-engagement (requires higher sentiment threshold + time)
				const daysSinceDisengaged = day - agent.disengagedDay;
				const cooldownPassed = daysSinceDisengaged >= 30; // 30 day cooldown
				
				if (cooldownPassed && agent.sentiment >= config.reengagementThreshold) {
					// Probability of re-engagement scales with community health
					const reengageChance = (metrics.communityHealth / 100) * 0.1; // Max 10% per day
					if (Math.random() < reengageChance) {
						agent.isDisengaged = false;
						addLog(day, 'success', `🔄 Agent #${agent.id} re-engaged with the community`);
					}
				}
			} else {
				// Check for disengagement
				if (agent.sentiment <= config.disengagementThreshold) {
					// Low sentiment agents have chance to disengage
					const disengageChance = (config.disengagementThreshold - agent.sentiment) / 100;
					if (Math.random() < disengageChance) {
						agent.isDisengaged = true;
						agent.disengagedDay = day;
						addLog(day, 'warning', `😞 Agent #${agent.id} disengaged (sentiment: ${agent.sentiment.toFixed(0)}%)`);
					}
				}
			}
		}
	}

	// Attract new agents based on community health
	function attractNewAgents(day: number) {
		agentsAttractedToday = 0;
		
		// Only attract if community is healthy and below max
		if (agents.length >= config.maxAgentGrowth) return;
		if (metrics.communityHealth < 50) return; // Unhealthy communities don't attract
		
		// Attraction rate scales with community health
		const attractionMultiplier = (metrics.communityHealth - 50) / 50; // 0-1 based on health 50-100
		const expectedNewAgents = config.newAgentAttractionRate * attractionMultiplier;
		
		// Poisson-like arrival (simplified)
		const actualNew = Math.random() < expectedNewAgents ? 1 : 0;
		
		for (let i = 0; i < actualNew && agents.length < config.maxAgentGrowth; i++) {
			const wealth = generateNormalRandom(config.averageWealth, config.averageWealth * 0.4);
			agents.push({
				id: agents.length,
				spaceMoney: Math.floor(wealth),
				spaceTime: 0, // New agents start fresh
				isWhale: false,
				participationRate: config.activeParticipationRate / 100 * (0.6 + Math.random() * 0.4),
				votingAccuracy: 0.5 + Math.random() * 0.4,
				sentiment: 70 + Math.random() * 30, // New agents are somewhat optimistic
				isDisengaged: false,
				disengagedDay: 0,
				joinDay: day
			});
			agentsAttractedToday++;
			metrics.newAgentsAttracted++;
		}
		
		if (agentsAttractedToday > 0 && day % 50 === 0) {
			addLog(day, 'info', `🌟 ${agentsAttractedToday} new agent(s) attracted to thriving community (total: ${agents.length})`);
		}
	}

	// Random sentiment shock events
	function processSentimentShock(day: number) {
		if (!config.enableSentimentShocks) return;
		if (Math.random() * 100 > config.shockProbability) return;
		
		const shockTypes = [
			{ type: 'positive', name: 'Major Partnership Announced', impact: 15, trust: 10 },
			{ type: 'positive', name: 'Community Achievement Unlocked', impact: 10, trust: 5 },
			{ type: 'positive', name: 'Successful Security Audit', impact: 8, trust: 15 },
			{ type: 'negative', name: 'Competitor Scandal Spillover', impact: -5, trust: -3 },
			{ type: 'negative', name: 'Market Downturn Fears', impact: -10, trust: -5 },
			{ type: 'negative', name: 'Social Media Controversy', impact: -12, trust: -8 },
			{ type: 'negative', name: 'Key Contributor Departure', impact: -8, trust: -10 },
			{ type: 'positive', name: 'Token Listing on Major Exchange', impact: 20, trust: 5 },
		];
		
		const shock = shockTypes[Math.floor(Math.random() * shockTypes.length)];
		
		metrics.communitySentiment = Math.max(0, Math.min(100, metrics.communitySentiment + shock.impact));
		metrics.ownerTrust = Math.max(0, Math.min(100, metrics.ownerTrust + shock.trust));
		
		// Affect individual agents too
		for (const agent of agents) {
			agent.sentiment = Math.max(10, Math.min(100, agent.sentiment + shock.impact * (0.5 + Math.random() * 0.5)));
		}
		
		const emoji = shock.type === 'positive' ? '📈' : '📉';
		const logType = shock.type === 'positive' ? 'success' : 'warning';
		addLog(day, logType, `${emoji} SHOCK EVENT: ${shock.name} (Sentiment ${shock.impact > 0 ? '+' : ''}${shock.impact}%)`);
	}

	// Simulate daily asset value changes
	function updateAssetValues(day: number) {
		if (!config.enableAssetInvestments) return;
		
		for (const asset of assets) {
			if (asset.status !== 'held') continue;
			
			// Calculate daily volatility (annual / sqrt(365))
			const dailyVol = asset.volatility / Math.sqrt(365);
			// Calculate daily appreciation rate
			const dailyAppreciation = asset.appreciationRate / 365;
			
			// Generate random return with appreciation bias
			// Using geometric Brownian motion approximation
			const randomShock = (Math.random() - 0.5) * 2 * dailyVol;
			const dailyReturn = dailyAppreciation + randomShock;
			
			// Apply return to current value
			asset.currentValue = asset.currentValue * (1 + dailyReturn);
			asset.currentValueUSD = asset.currentValue * config.pricePerPacemoney;
			
			// Update P&L
			asset.pnl = asset.currentValue - asset.purchasePrice;
			asset.pnlPercent = ((asset.currentValue / asset.purchasePrice) - 1) * 100;
		}
		
		// Update aggregate metrics
		updateAssetMetrics();
	}

	// Update aggregate asset metrics
	function updateAssetMetrics() {
		const heldAssets = assets.filter(a => a.status === 'held');
		
		metrics.assetCount = heldAssets.length;
		metrics.totalAssetCost = heldAssets.reduce((sum, a) => sum + a.purchasePrice, 0);
		metrics.totalAssetValue = heldAssets.reduce((sum, a) => sum + a.currentValue, 0);
		metrics.totalAssetPnL = metrics.totalAssetValue - metrics.totalAssetCost;
		metrics.totalAssetPnLPercent = metrics.totalAssetCost > 0 
			? ((metrics.totalAssetValue / metrics.totalAssetCost) - 1) * 100 
			: 0;
	}

	// Simulate asset purchase proposal
	function simulateAssetProposal(day: number) {
		if (!config.enableAssetInvestments) return;
		
		// Pick a random asset template
		const template = assetProposalTemplates[Math.floor(Math.random() * assetProposalTemplates.length)];
		
		// Randomize price within 70-130% of base
		const priceMultiplier = 0.7 + Math.random() * 0.6;
		const purchasePrice = Math.floor(template.basePrice * priceMultiplier);
		const purchasePriceUSD = purchasePrice * config.pricePerPacemoney;
		
		// Check if this exceeds max allocation
		const currentTreasuryValue = metrics.totalSpaceMoney;
		const allocationPercent = (purchasePrice / currentTreasuryValue) * 100;
		
		if (allocationPercent > config.maxAssetAllocation) {
			addLog(day, 'info', `🏠 Asset proposal "${template.name}" skipped - exceeds ${config.maxAssetAllocation}% allocation limit`);
			return;
		}
		
		// Asset proposals use balanced voting (50/50 time/money)
		const timeWeight = 0.5;
		const moneyWeight = 0.5;
		
		// Calculate total voting power for quorum
		const totalVotingPower = agents.reduce((sum, a) => 
			sum + calculateVotingPower(a, timeWeight, moneyWeight), 0);
		const quorumNeeded = totalVotingPower * config.quorumPercentage / 100;
		
		let votesFor = 0;
		let votesAgainst = 0;
		let votersCount = 0;
		
		for (const agent of agents) {
			const votingPower = calculateVotingPower(agent, timeWeight, moneyWeight);
			
			const effectiveParticipation = agent.participationRate * (agent.sentiment / 100);
			if (votingPower >= config.proposalThreshold * 0.1 && Math.random() < effectiveParticipation) {
				votersCount++;
				
				// Agent voting based on risk tolerance (whales more cautious, newer agents more optimistic)
				const riskAppetite = agent.isWhale ? 0.4 : 0.6;
				const sentimentBonus = (agent.sentiment - 50) / 100;
				const voteYes = Math.random() < (riskAppetite + sentimentBonus);
				
				if (voteYes) {
					votesFor += votingPower;
				} else {
					votesAgainst += votingPower;
				}
			}
		}
		
		const totalVotes = votesFor + votesAgainst;
		const approvalRate = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
		const reachedQuorum = totalVotes >= quorumNeeded;
		const wouldPass = votesFor > votesAgainst && reachedQuorum;
		
		// Owner veto logic (owners may be cautious about large purchases)
		let vetoed = false;
		if (wouldPass) {
			const vetoChance = config.ownerVetoProbability * (1 + (config.ownerVetoThreshold - approvalRate) / 100);
			vetoed = Math.random() * 100 < vetoChance * 1.2; // Slightly higher veto rate for assets
		}
		
		const passed = wouldPass && !vetoed;
		const assetTypeEmoji = {
			'real-estate': '🏢',
			'equipment': '⚙️',
			'intellectual-property': '📜',
			'infrastructure': '🌐',
			'art-collectibles': '🎨'
		}[template.type];
		
		if (passed) {
			// Create the asset
			assets.push({
				id: assets.length + 1,
				name: template.name,
				type: template.type,
				purchaseDay: day,
				purchasePrice,
				purchasePriceUSD,
				currentValue: purchasePrice,
				currentValueUSD: purchasePriceUSD,
				pnl: 0,
				pnlPercent: 0,
				volatility: template.volatility * (0.8 + Math.random() * 0.4), // Some variance
				appreciationRate: template.appreciation + config.assetAppreciationBias,
				status: 'held'
			});
			
			metrics.proposalsPassed++;
			addLog(day, 'success', `${assetTypeEmoji} ASSET ACQUIRED: "${template.name}" for ${purchasePrice.toLocaleString()} $PACEMONEY ($${purchasePriceUSD.toLocaleString()})`);
			
			// Asset acquisitions boost community confidence
			metrics.communitySentiment = Math.min(100, metrics.communitySentiment + 2);
			updateAssetMetrics();
		} else if (vetoed) {
			metrics.proposalsVetoed++;
			addLog(day, 'veto', `${assetTypeEmoji} VETO: Asset purchase "${template.name}" blocked by owner (${approvalRate.toFixed(1)}% approved)`);
			
			// Vetoes hurt sentiment
			const sentimentDrop = 5 + Math.random() * 10;
			metrics.communitySentiment = Math.max(0, metrics.communitySentiment - sentimentDrop);
			metrics.ownerTrust = Math.max(0, metrics.ownerTrust - sentimentDrop * 1.5);
		} else {
			metrics.proposalsFailed++;
			if (!reachedQuorum) {
				addLog(day, 'warning', `${assetTypeEmoji} Asset "${template.name}" proposal failed - quorum not reached`);
			} else {
				addLog(day, 'warning', `${assetTypeEmoji} Asset "${template.name}" proposal rejected (${approvalRate.toFixed(1)}% approval)`);
			}
		}
		
		metrics.voterTurnout = votersCount / agents.length * 100;
	}

	function simulateDay(day: number) {
		// SpaceTime ($PACETIME) decay
		for (const agent of agents) {
			agent.spaceTime *= Math.exp(-config.stDecayRate);
		}
		
		// Natural sentiment decay (requires continuous healthy governance)
		if (day % 10 === 0) { // Every 10 days
			for (const agent of agents) {
				if (!agent.isDisengaged) {
					// Slow natural decay
					agent.sentiment = Math.max(20, agent.sentiment - config.sentimentDecayRate);
				}
			}
			// Global sentiment also decays slightly
			metrics.communitySentiment = Math.max(10, metrics.communitySentiment - config.sentimentDecayRate * 0.5);
		}
		
		// Process sentiment shock events
		processSentimentShock(day);
		
		// Process agent engagement/disengagement
		processAgentEngagement(day);
		
		// Attract new agents to healthy communities
		attractNewAgents(day);
		
		// Participation and $PACETIME minting
		let dailyParticipants = 0;
		for (const agent of agents) {
			// Disengaged agents don't participate
			if (agent.isDisengaged) continue;
			
			// Participation affected by sentiment
			const effectiveParticipation = agent.participationRate * (agent.sentiment / 100);
			if (Math.random() < effectiveParticipation) {
				const stEarned = config.stMintRate * (0.5 + Math.random());
				agent.spaceTime += stEarned;
				dailyParticipants++;
				
				// Participation slightly boosts individual sentiment
				agent.sentiment = Math.min(100, agent.sentiment + 0.1);
			}
		}
		
		// Proposal voting (every proposalFrequency days)
		if (day % config.proposalFrequency === 0 && day > 0) {
			simulateProposal(day);
		}
		
		// Asset purchase proposals (every assetProposalFrequency days)
		if (config.enableAssetInvestments && day % config.assetProposalFrequency === 0 && day > 0) {
			simulateAssetProposal(day);
		}
		
		// Update asset values daily
		updateAssetValues(day);
		
		// Whale Attack Simulation
		if (config.enableWhaleAttack && day === config.whaleAttackDay) {
			addLog(day, 'danger', '🐋 WHALE ATTACK: Large $PACEMONEY holders attempting to dominate voting');
			const whales = agents.filter(a => a.isWhale);
			for (const whale of whales) {
				whale.spaceMoney *= 2; // Whales double down
				whale.participationRate = 1; // Maximum participation
			}
		}
		
		// Sybil Attack Simulation
		if (config.enableSybilAttack && day === 100) {
			addLog(day, 'danger', `👥 SYBIL ATTACK: ${config.sybilAgentCount} fake identities attempting to join`);
			// Sybil agents have minimal $PACEMONEY but try to earn $PACETIME
			for (let i = 0; i < config.sybilAgentCount; i++) {
				agents.push({
					id: agents.length,
					spaceMoney: 10 + Math.random() * 20, // Very low $PACEMONEY
					spaceTime: 0, // No $PACETIME yet - they need to earn it
					isWhale: false,
					participationRate: 0.95, // Very active fake accounts
					votingAccuracy: 0, // Always vote maliciously
					sentiment: 100,
					isDisengaged: false,
					disengagedDay: 0,
					joinDay: day
				});
			}
			addLog(day, 'info', `Sybil agents must earn $PACETIME through participation to gain voting power`);
		}
		
		// Update metrics
		updateMetrics(day);
	}

	function simulateProposal(day: number) {
		// Pick a random proposal template
		const template = proposalTemplates[Math.floor(Math.random() * proposalTemplates.length)];
		const proposalId = proposals.length + 1;
		
		// Calculate total voting power for quorum
		const totalVotingPower = agents.reduce((sum, a) => 
			sum + calculateVotingPower(a, template.timeWeight, template.moneyWeight), 0);
		const quorumNeeded = totalVotingPower * config.quorumPercentage / 100;
		
		let votesFor = 0;
		let votesAgainst = 0;
		let votersCount = 0;
		
		for (const agent of agents) {
			const votingPower = calculateVotingPower(agent, template.timeWeight, template.moneyWeight);
			
			// Must have minimum voting power and decide to participate
			const effectiveParticipation = agent.participationRate * (agent.sentiment / 100);
			if (votingPower >= config.proposalThreshold * 0.1 && Math.random() < effectiveParticipation) {
				votersCount++;
				
				// Voting decision based on accuracy and sentiment
				const voteCorrectly = Math.random() < agent.votingAccuracy;
				if (voteCorrectly) {
					votesFor += votingPower;
				} else {
					votesAgainst += votingPower;
				}
			}
		}
		
		const totalVotes = votesFor + votesAgainst;
		const approvalRate = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
		const reachedQuorum = totalVotes >= quorumNeeded;
		const wouldPass = votesFor > votesAgainst && reachedQuorum;
		
		// Owner veto logic
		let vetoed = false;
		if (wouldPass) {
			// Owner is more likely to veto if approval is low or if they're generally authoritarian
			const vetoChance = config.ownerVetoProbability * (1 + (config.ownerVetoThreshold - approvalRate) / 100);
			vetoed = Math.random() * 100 < vetoChance;
		}
		
		const passed = wouldPass && !vetoed;
		
		// Record proposal
		proposals.push({
			id: proposalId,
			day,
			title: template.title,
			type: template.type,
			timeWeight: template.timeWeight,
			moneyWeight: template.moneyWeight,
			votesFor,
			votesAgainst,
			passed,
			vetoed,
			approvalRate
		});
		
		// Add to recent proposals for UI display (keep last 10)
		const status = vetoed ? 'vetoed' : passed ? 'passed' : 'failed';
		recentProposals = [...recentProposals.slice(-9), {
			day,
			title: template.title,
			type: template.type,
			status,
			votesFor,
			votesAgainst,
			timeWeight: template.timeWeight,
			moneyWeight: template.moneyWeight
		}];
		
		// Log and update metrics
		const typeLabel = template.type === 'time-heavy' ? '⏰' : template.type === 'money-heavy' ? '💵' : '⚖️';
		
		if (vetoed) {
			metrics.proposalsVetoed++;
			addLog(day, 'veto', `🚫 VETO: "${template.title}" ${typeLabel} blocked by owner (${approvalRate.toFixed(1)}% approved)`);
			
			// Vetoes reduce community sentiment and owner trust
			const sentimentDrop = 5 + Math.random() * 10; // 5-15% drop
			metrics.communitySentiment = Math.max(0, metrics.communitySentiment - sentimentDrop);
			metrics.ownerTrust = Math.max(0, metrics.ownerTrust - sentimentDrop * 1.5);
			
			// Individual agents also lose sentiment
			for (const agent of agents) {
				agent.sentiment = Math.max(20, agent.sentiment - (2 + Math.random() * 5));
			}
			
			addLog(day, 'warning', `😤 Community sentiment dropped to ${metrics.communitySentiment.toFixed(0)}%`);
		} else if (passed) {
			metrics.proposalsPassed++;
			addLog(day, 'success', `✅ "${template.title}" ${typeLabel} passed (${approvalRate.toFixed(1)}% approval, ${votersCount} voters)`);
			
			// Successful proposals slightly boost sentiment
			metrics.communitySentiment = Math.min(100, metrics.communitySentiment + 1);
			for (const agent of agents) {
				agent.sentiment = Math.min(100, agent.sentiment + 0.5);
			}
		} else {
			metrics.proposalsFailed++;
			if (!reachedQuorum) {
				addLog(day, 'warning', `❌ "${template.title}" ${typeLabel} failed - quorum not reached (${((totalVotes / quorumNeeded) * 100).toFixed(0)}%)`);
			} else {
				addLog(day, 'warning', `❌ "${template.title}" ${typeLabel} rejected (${approvalRate.toFixed(1)}% approval)`);
			}
		}
		
		metrics.voterTurnout = votersCount / agents.length * 100;
	}

	function updateMetrics(day: number) {
		// Filter to active (non-disengaged) agents for core metrics
		const activeAgents = agents.filter(a => !a.isDisengaged);
		const stValues = activeAgents.map(a => a.spaceTime);
		const smValues = activeAgents.map(a => a.spaceMoney);
		
		metrics.totalSpaceTime = stValues.reduce((a, b) => a + b, 0);
		metrics.totalSpaceMoney = smValues.reduce((a, b) => a + b, 0);
		metrics.giniCoefficient = calculateGini(stValues);
		
		// Dynamic active voters calculation based on sentiment and trust
		metrics.eligibleVoters = agents.filter(a => 
			a.spaceTime >= config.proposalThreshold * 0.1 && !a.isDisengaged
		).length;
		metrics.activeVoters = calculateActiveVoters();
		metrics.disengagedAgents = agents.filter(a => a.isDisengaged).length;
		
		// Calculate community health (combined sentiment + trust)
		metrics.communityHealth = (metrics.communitySentiment * 0.6 + metrics.ownerTrust * 0.4);
		
		// Calculate sunset progress (simplified)
		const uniqueEarners = activeAgents.filter(a => a.spaceTime > 0).length;
		const acceptanceRate = proposals.length > 0 
			? (metrics.proposalsPassed / proposals.length) * 100 
			: 0;
		// Sunset requires: 99.9% acceptance rate, 10k earners, low founder concentration
		const earnerProgress = Math.min(100, uniqueEarners / 100 * 100);
		const acceptanceProgress = Math.min(100, acceptanceRate / 99.9 * 100);
		metrics.sunsetProgress = (earnerProgress + acceptanceProgress) / 2;
		
		// Record history for all metrics
		history.push({
			day,
			totalST: metrics.totalSpaceTime,
			totalSM: metrics.totalSpaceMoney,
			gini: metrics.giniCoefficient,
			turnout: metrics.voterTurnout,
			activeVoters: metrics.activeVoters,
			sentiment: metrics.communitySentiment,
			ownerTrust: metrics.ownerTrust,
			proposalsPassed: metrics.proposalsPassed,
			proposalsFailed: metrics.proposalsFailed,
			proposalsVetoed: metrics.proposalsVetoed,
			sunsetProgress: metrics.sunsetProgress,
			eligibleVoters: metrics.eligibleVoters,
			disengagedAgents: metrics.disengagedAgents,
			totalAgents: agents.length,
			communityHealth: metrics.communityHealth,
			// Asset tracking
			totalAssetValue: metrics.totalAssetValue,
			totalAssetCost: metrics.totalAssetCost,
			totalAssetPnL: metrics.totalAssetPnL,
			assetCount: metrics.assetCount
		});
	}

	function addLog(day: number, type: 'info' | 'success' | 'warning' | 'danger' | 'veto', message: string) {
		logs = [...logs.slice(-49), { day, type, message }];
	}

	// Simulation Control Functions
	function startSimulation() {
		if (simulationComplete) {
			resetSimulation();
		}
		
		isRunning = true;
		isPaused = false;
		
		if (currentDay === 0) {
			initializeAgents();
			addLog(0, 'info', `Simulation started with ${config.totalAgents} agents`);
			updateMetrics(0);
		}
		
		runSimulationLoop();
	}

	function runSimulationLoop() {
		if (!isRunning || isPaused) return;
		
		const now = performance.now();
		const elapsed = now - lastUpdate;
		const stepInterval = 1000 / config.simulationSpeed;
		
		if (elapsed >= stepInterval) {
			if (currentDay < config.simulationDays) {
				currentDay++;
				simulationProgress = (currentDay / config.simulationDays) * 100;
				simulateDay(currentDay);
				lastUpdate = now;
			} else {
				completeSimulation();
				return;
			}
		}
		
		animationId = requestAnimationFrame(runSimulationLoop);
	}

	function pauseSimulation() {
		isPaused = true;
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
	}

	function resumeSimulation() {
		isPaused = false;
		lastUpdate = performance.now();
		runSimulationLoop();
	}

	function stopSimulation() {
		isRunning = false;
		isPaused = false;
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
	}

	function resetSimulation() {
		stopSimulation();
		currentDay = 0;
		simulationProgress = 0;
		simulationComplete = false;
		agents = [];
		history = [];
		logs = [];
		proposals = [];
		recentProposals = [];
		assets = [];
		agentsAttractedToday = 0;
		metrics = {
			totalSpaceMoney: 0,
			totalSpaceTime: 0,
			giniCoefficient: 0,
			voterTurnout: 0,
			proposalsPassed: 0,
			proposalsFailed: 0,
			proposalsVetoed: 0,
			activeVoters: 0,
			sunsetProgress: 0,
			communitySentiment: 100,
			ownerTrust: 100,
			eligibleVoters: 0,
			disengagedAgents: 0,
			newAgentsAttracted: 0,
			communityHealth: 100,
			totalAssetValue: 0,
			totalAssetCost: 0,
			totalAssetPnL: 0,
			totalAssetPnLPercent: 0,
			assetCount: 0
		};
	}

	function completeSimulation() {
		isRunning = false;
		simulationComplete = true;
		addLog(currentDay, 'success', `Simulation complete! ${config.simulationDays} days simulated.`);
	}

	function applyPreset(preset: typeof presets[0]) {
		config = { ...config, ...preset.config };
		addLog(0, 'info', `Applied preset: ${preset.name}`);
	}

	// Export simulation data
	function exportData() {
		const data = {
			config,
			metrics,
			history,
			proposals,
			assets,
			agents: agents.map(a => ({
				id: a.id,
				spaceMoney: Math.round(a.spaceMoney),
				spaceTime: Math.round(a.spaceTime * 100) / 100,
				isWhale: a.isWhale,
				sentiment: Math.round(a.sentiment)
			}))
		};
		
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `simulation-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	// Cleanup on unmount
	onMount(() => {
		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});

	// Computed values for chart rendering
	let chartMaxST = $derived(Math.max(...history.map(h => h.totalST), 1));
	let chartMaxSM = $derived(Math.max(...history.map(h => h.totalSM), 1));
	let chartMaxUSD = $derived(Math.max(...history.map(h => h.totalSM * config.pricePerPacemoney), 1));
	let chartMaxVoters = $derived(Math.max(...history.map(h => h.activeVoters), 1));
	let chartMaxProposals = $derived(Math.max(
		...history.map(h => h.proposalsPassed + h.proposalsFailed + h.proposalsVetoed), 
		1
	));
	let chartMaxAssetValue = $derived(Math.max(...history.map(h => h.totalAssetValue), 1));
	let chartMaxAssetPnL = $derived(Math.max(...history.map(h => Math.abs(h.totalAssetPnL)), 1));
</script>

<svelte:head>
	<title>Simulation Testing | *Space DAO</title>
	<meta name="description" content="Test and validate *Space DAO governance mechanisms through comprehensive simulations" />
</svelte:head>

<div class="simulate-page">
	<!-- Header -->
	<header class="page-header">
		<div class="header-content">
			<div class="header-text">
				<h1>
					<span class="icon">🧪</span>
					Simulation Testing Framework
				</h1>
				<p>Model governance scenarios, test attack vectors, and validate mechanism design</p>
			</div>
			<div class="header-actions">
				{#if !isRunning && !simulationComplete}
					<button class="btn btn-primary btn-lg" onclick={startSimulation}>
						<span class="btn-icon">▶️</span>
						Start Simulation
					</button>
				{:else if isRunning && !isPaused}
					<button class="btn btn-warning" onclick={pauseSimulation}>
						<span class="btn-icon">⏸️</span>
						Pause
					</button>
				{:else if isPaused}
					<button class="btn btn-success" onclick={resumeSimulation}>
						<span class="btn-icon">▶️</span>
						Resume
					</button>
				{/if}
				{#if isRunning || simulationComplete}
					<button class="btn btn-secondary" onclick={resetSimulation}>
						<span class="btn-icon">🔄</span>
						Reset
					</button>
				{/if}
				{#if simulationComplete}
					<button class="btn btn-accent" onclick={exportData}>
						<span class="btn-icon">📥</span>
						Export Data
					</button>
				{/if}
			</div>
		</div>
		
		<!-- Progress Bar -->
		{#if isRunning || simulationComplete}
			<div class="progress-section">
				<div class="progress-header">
					<span>Day {currentDay} of {config.simulationDays}</span>
					<span class="progress-percent">{simulationProgress.toFixed(1)}%</span>
				</div>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {simulationProgress}%"></div>
				</div>
			</div>
		{/if}
	</header>

	<div class="main-content">
		<!-- Configuration Panel -->
		<aside class="config-panel" class:collapsed={!configExpanded}>
			<button class="panel-header" onclick={() => configExpanded = !configExpanded}>
				<h2>
					<span class="panel-icon">⚙️</span>
					Configuration
				</h2>
				<span class="toggle-icon">{configExpanded ? '▲' : '▼'}</span>
			</button>
			
			{#if configExpanded}
			<div class="panel-content-redesign">
				<!-- Quick Presets - Always visible at top -->
				<section class="presets-hero">
					<div class="presets-header">
						<h3>🚀 Quick Start Scenarios</h3>
						<p>Select a preset to instantly configure the simulation for different social dynamics</p>
					</div>
					<div class="presets-carousel">
						{#each presets as preset, i}
							<button 
								class="preset-chip" 
								class:preset-healthy={preset.name === 'Healthy Community' || preset.name === 'Thriving Ecosystem'}
								class:preset-danger={preset.name === 'Authoritarian Owner' || preset.name === 'Community Exodus'}
								class:preset-warning={preset.name === 'Whale Dominated' || preset.name === 'Volatile Market'}
								class:preset-attack={preset.name === 'Sybil Attack'}
								class:preset-asset={preset.name === 'Asset Investor DAO'}
								onclick={() => applyPreset(preset)}
								disabled={isRunning}
							>
								<span class="preset-emoji">
									{#if preset.name === 'Healthy Community'}💚
									{:else if preset.name === 'Authoritarian Owner'}👑
									{:else if preset.name === 'Whale Dominated'}🐋
									{:else if preset.name === 'Sybil Attack'}👥
									{:else if preset.name === 'Community Exodus'}🚪
									{:else if preset.name === 'Thriving Ecosystem'}🌱
									{:else if preset.name === 'Volatile Market'}📈
									{:else if preset.name === 'Asset Investor DAO'}🏢
									{:else}🎯
									{/if}
								</span>
								<span class="preset-chip-name">{preset.name}</span>
								<span class="preset-chip-desc">{preset.description}</span>
							</button>
						{/each}
					</div>
				</section>

				<!-- Advanced Configuration Accordion -->
				<div class="config-accordion">
					<details class="config-details" open>
						<summary class="config-summary">
							<span class="summary-icon">👥</span>
							<span class="summary-text">Agents & Economy</span>
							<span class="summary-arrow">▼</span>
						</summary>
						<div class="config-details-content">
							<div class="config-grid-compact">
								<label class="config-item-compact">
									<span class="config-label-compact">Total Agents</span>
									<input type="number" bind:value={config.totalAgents} min="10" max="1000" disabled={isRunning} />
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">Whale %</span>
									<input type="number" bind:value={config.whalePercentage} min="0" max="50" disabled={isRunning} />
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">Participation %</span>
									<input type="number" bind:value={config.activeParticipationRate} min="10" max="100" disabled={isRunning} />
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">Avg Wealth</span>
									<input type="number" bind:value={config.averageWealth} min="100" max="100000" disabled={isRunning} />
								</label>
							</div>
							<label class="config-item-compact full-width">
								<span class="config-label-compact">Wealth Distribution</span>
								<select bind:value={config.wealthDistribution} disabled={isRunning}>
									<option value="uniform">Uniform - Equal distribution</option>
									<option value="normal">Normal - Bell curve</option>
									<option value="pareto">Pareto - 80/20 power law</option>
								</select>
							</label>
						</div>
					</details>

					<details class="config-details">
						<summary class="config-summary">
							<span class="summary-icon">🪙</span>
							<span class="summary-text">Token Mechanics</span>
							<span class="summary-arrow">▼</span>
						</summary>
						<div class="config-details-content">
							<div class="config-grid-compact">
								<label class="config-item-compact">
									<span class="config-label-compact">$PACETIME Decay</span>
									<input type="number" bind:value={config.stDecayRate} min="0" max="0.01" step="0.0001" disabled={isRunning} />
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">$PACETIME Mint Rate</span>
									<input type="number" bind:value={config.stMintRate} min="1" max="100" disabled={isRunning} />
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">$PACEMONEY Price (USD)</span>
									<input type="number" bind:value={config.pricePerPacemoney} min="0.001" max="1000" step="0.001" disabled={isRunning} />
								</label>
							</div>
						</div>
					</details>

					<details class="config-details">
						<summary class="config-summary">
							<span class="summary-icon">🗳️</span>
							<span class="summary-text">Governance Rules</span>
							<span class="summary-arrow">▼</span>
						</summary>
						<div class="config-details-content">
							<div class="config-grid-compact">
								<label class="config-item-compact">
									<span class="config-label-compact">Proposal Threshold</span>
									<input type="number" bind:value={config.proposalThreshold} min="10" max="10000" disabled={isRunning} />
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">Quorum %</span>
									<input type="number" bind:value={config.quorumPercentage} min="1" max="100" disabled={isRunning} />
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">Proposal Frequency</span>
									<input type="number" bind:value={config.proposalFrequency} min="1" max="30" disabled={isRunning} />
									<span class="input-hint">days</span>
								</label>
							</div>
						</div>
					</details>

					<details class="config-details">
						<summary class="config-summary">
							<span class="summary-icon">👑</span>
							<span class="summary-text">Owner Power</span>
							<span class="summary-arrow">▼</span>
						</summary>
						<div class="config-details-content">
							<div class="config-grid-compact">
								<label class="config-item-compact">
									<span class="config-label-compact">Veto Probability %</span>
									<input type="number" bind:value={config.ownerVetoProbability} min="0" max="100" disabled={isRunning} />
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">Veto Threshold %</span>
									<input type="number" bind:value={config.ownerVetoThreshold} min="50" max="100" disabled={isRunning} />
								</label>
							</div>
							<p class="config-note">Higher veto probability = more vetoes. Owner vetoes proposals with approval below threshold.</p>
						</div>
					</details>

					<details class="config-details">
						<summary class="config-summary">
							<span class="summary-icon">🧠</span>
							<span class="summary-text">Social Dynamics</span>
							<span class="summary-arrow">▼</span>
						</summary>
						<div class="config-details-content">
							<div class="config-grid-compact">
								<label class="config-item-compact">
									<span class="config-label-compact">Sentiment Decay</span>
									<input type="number" bind:value={config.sentimentDecayRate} min="0" max="2" step="0.1" disabled={isRunning} />
									<span class="input-hint">per 10 days</span>
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">Disengage At</span>
									<input type="number" bind:value={config.disengagementThreshold} min="5" max="50" disabled={isRunning} />
									<span class="input-hint">% sentiment</span>
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">Re-engage At</span>
									<input type="number" bind:value={config.reengagementThreshold} min="30" max="90" disabled={isRunning} />
									<span class="input-hint">% sentiment</span>
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">New Agent Rate</span>
									<input type="number" bind:value={config.newAgentAttractionRate} min="0" max="5" step="0.1" disabled={isRunning} />
									<span class="input-hint">per day</span>
								</label>
								<label class="config-item-compact">
									<span class="config-label-compact">Max Agents</span>
									<input type="number" bind:value={config.maxAgentGrowth} min="100" max="2000" disabled={isRunning} />
								</label>
							</div>
							<div class="config-toggle-row">
								<label class="toggle-label">
									<input type="checkbox" bind:checked={config.enableSentimentShocks} disabled={isRunning} />
									<span>Enable Random Events</span>
								</label>
								{#if config.enableSentimentShocks}
									<label class="config-item-inline">
										<span>Probability:</span>
										<input type="number" bind:value={config.shockProbability} min="0" max="20" disabled={isRunning} />
										<span>%/day</span>
									</label>
								{/if}
							</div>
						</div>
					</details>

					<details class="config-details config-details-danger">
						<summary class="config-summary">
							<span class="summary-icon">⚔️</span>
							<span class="summary-text">Attack Scenarios</span>
							<span class="summary-arrow">▼</span>
						</summary>
						<div class="config-details-content">
							<div class="attack-toggles">
								<div class="attack-option">
									<label class="toggle-label">
										<input type="checkbox" bind:checked={config.enableWhaleAttack} disabled={isRunning} />
										<span>🐋 Whale Attack</span>
									</label>
									{#if config.enableWhaleAttack}
										<label class="config-item-inline">
											<span>On day:</span>
											<input type="number" bind:value={config.whaleAttackDay} min="1" max={config.simulationDays} disabled={isRunning} />
										</label>
									{/if}
								</div>
								<div class="attack-option">
									<label class="toggle-label">
										<input type="checkbox" bind:checked={config.enableSybilAttack} disabled={isRunning} />
										<span>👥 Sybil Attack</span>
									</label>
									{#if config.enableSybilAttack}
										<label class="config-item-inline">
											<span>Agents:</span>
											<input type="number" bind:value={config.sybilAgentCount} min="10" max="500" disabled={isRunning} />
										</label>
									{/if}
								</div>
							</div>
						</div>
					</details>

					<details class="config-details">
						<summary class="config-summary">
							<span class="summary-icon">🏢</span>
							<span class="summary-text">Asset Investments</span>
							<span class="summary-arrow">▼</span>
						</summary>
						<div class="config-details-content">
							<div class="config-toggle-row">
								<label class="toggle-label">
									<input type="checkbox" bind:checked={config.enableAssetInvestments} disabled={isRunning} />
									<span>Enable Asset Purchases</span>
								</label>
							</div>
							{#if config.enableAssetInvestments}
								<div class="config-grid-compact">
									<label class="config-item-compact">
										<span class="config-label-compact">Proposal Frequency</span>
										<input type="number" bind:value={config.assetProposalFrequency} min="5" max="100" disabled={isRunning} />
										<span class="input-hint">days</span>
									</label>
									<label class="config-item-compact">
										<span class="config-label-compact">Max Allocation</span>
										<input type="number" bind:value={config.maxAssetAllocation} min="5" max="50" disabled={isRunning} />
										<span class="input-hint">% of treasury</span>
									</label>
									<label class="config-item-compact">
										<span class="config-label-compact">Volatility</span>
										<input type="number" bind:value={config.assetVolatility} min="0.05" max="0.5" step="0.05" disabled={isRunning} />
										<span class="input-hint">annual</span>
									</label>
									<label class="config-item-compact">
										<span class="config-label-compact">Appreciation Bias</span>
										<input type="number" bind:value={config.assetAppreciationBias} min="-0.1" max="0.2" step="0.01" disabled={isRunning} />
										<span class="input-hint">annual</span>
									</label>
								</div>
							{/if}
						</div>
					</details>

					<details class="config-details">
						<summary class="config-summary">
							<span class="summary-icon">⏱️</span>
							<span class="summary-text">Simulation Settings</span>
							<span class="summary-arrow">▼</span>
						</summary>
						<div class="config-details-content">
							<div class="config-grid-compact">
								<label class="config-item-compact">
									<span class="config-label-compact">Days to Simulate</span>
									<input type="number" bind:value={config.simulationDays} min="30" max="3650" disabled={isRunning} />
								</label>
							</div>
							<label class="speed-slider">
								<span class="config-label-compact">Speed: {config.simulationSpeed} steps/sec</span>
								<input type="range" bind:value={config.simulationSpeed} min="10" max="500" />
							</label>
						</div>
					</details>
				</div>
			</div>
			{/if}
		</aside>

		<!-- Charts Section -->
		<section class="charts-section">
			<h2>
				<span class="section-icon">📈</span>
				Time Series
			</h2>
			
			<!-- Sunset Progress - Full Width at Top -->
			<div class="sunset-progress-bar">
				<div class="sunset-header">
					<h3>🌅 Sunset Progress</h3>
					<span class="sunset-value">{(history.length > 0 ? history[history.length - 1].sunsetProgress : 0).toFixed(1)}%</span>
				</div>
				<div class="sunset-track">
					<div class="sunset-fill" style="width: {history.length > 0 ? Math.min(100, history[history.length - 1].sunsetProgress) : 0}%"></div>
					<div class="sunset-target"></div>
				</div>
				{#if history.length > 1}
					<div class="sunset-mini-chart">
						<svg viewBox="0 0 800 60" class="sunset-svg" preserveAspectRatio="none">
							<!-- Target line at 100% -->
							<line x1="0" y1="5" x2="800" y2="5" class="sunset-target-line" />
							<path
								d="M 0 55 {history.map((h, i) => `L ${(i / (history.length - 1)) * 800} ${55 - (h.sunsetProgress / 100) * 50}`).join(' ')} L 800 55 Z"
								class="sunset-area"
							/>
							<path
								d="M {history.map((h, i) => `${(i / (history.length - 1)) * 800} ${55 - (h.sunsetProgress / 100) * 50}`).join(' L ')}"
								class="sunset-line" fill="none"
							/>
						</svg>
					</div>
				{/if}
			</div>

			<div class="charts-grid">
				<!-- $PACETIME Supply Chart -->
				<div class="chart-card">
					<h3>$PACETIME Supply</h3>
					<div class="chart-container">
						{#if history.length > 1}
							<svg viewBox="0 0 400 150" class="chart-svg">
								{#each [0, 25, 50, 75, 100] as y}
									<line x1="40" y1={130 - y * 1.2} x2="390" y2={130 - y * 1.2} class="grid-line" />
								{/each}
								<path
									d="M 40 130 {history.map((h, i) => `L ${40 + (i / (history.length - 1)) * 350} ${130 - (h.totalST / chartMaxST) * 120}`).join(' ')} L 390 130 Z"
									class="chart-area purple"
								/>
								<path
									d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.totalST / chartMaxST) * 120}`).join(' L ')}"
									class="chart-line purple" fill="none"
								/>
							</svg>
						{:else}
							<div class="chart-empty"><span>Start simulation to see data</span></div>
						{/if}
					</div>
				</div>

				<!-- $PACEMONEY Supply Chart -->
				<div class="chart-card">
					<h3>$PACEMONEY Supply</h3>
					<div class="chart-container">
						{#if history.length > 1}
							<svg viewBox="0 0 400 150" class="chart-svg">
								{#each [0, 25, 50, 75, 100] as y}
									<line x1="40" y1={130 - y * 1.2} x2="390" y2={130 - y * 1.2} class="grid-line" />
								{/each}
								<path
									d="M 40 130 {history.map((h, i) => `L ${40 + (i / (history.length - 1)) * 350} ${130 - (h.totalSM / chartMaxSM) * 120}`).join(' ')} L 390 130 Z"
									class="chart-area cyan"
								/>
								<path
									d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.totalSM / chartMaxSM) * 120}`).join(' L ')}"
									class="chart-line cyan" fill="none"
								/>
							</svg>
						{:else}
							<div class="chart-empty"><span>Start simulation to see data</span></div>
						{/if}
					</div>
				</div>

				<!-- $PACEMONEY USD Value Chart -->
				<div class="chart-card">
					<h3>$PACEMONEY Market Cap (USD)</h3>
					<div class="chart-container">
						{#if history.length > 1}
							<svg viewBox="0 0 400 150" class="chart-svg">
								{#each [0, 25, 50, 75, 100] as y}
									<line x1="40" y1={130 - y * 1.2} x2="390" y2={130 - y * 1.2} class="grid-line" />
								{/each}
								<path
									d="M 40 130 {history.map((h, i) => `L ${40 + (i / (history.length - 1)) * 350} ${130 - ((h.totalSM * config.pricePerPacemoney) / chartMaxUSD) * 120}`).join(' ')} L 390 130 Z"
									class="chart-area green"
								/>
								<path
									d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - ((h.totalSM * config.pricePerPacemoney) / chartMaxUSD) * 120}`).join(' L ')}"
									class="chart-line green" fill="none"
								/>
							</svg>
							<div class="chart-value-label">${(history[history.length - 1]?.totalSM * config.pricePerPacemoney || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
						{:else}
							<div class="chart-empty"><span>Start simulation to see data</span></div>
						{/if}
					</div>
				</div>

				<!-- Proposals Chart (Stacked: Passed, Failed, Vetoed) -->
				<div class="chart-card">
					<h3>Proposals (Passed / Failed / Vetoed)</h3>
					<div class="chart-container">
						{#if history.length > 1}
							<svg viewBox="0 0 400 150" class="chart-svg">
								{#each [0, 25, 50, 75, 100] as y}
									<line x1="40" y1={130 - y * 1.2} x2="390" y2={130 - y * 1.2} class="grid-line" />
								{/each}
								<!-- Passed (green) -->
								<path
									d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.proposalsPassed / chartMaxProposals) * 120}`).join(' L ')}"
									class="chart-line green" fill="none"
								/>
								<!-- Failed (red) -->
								<path
									d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.proposalsFailed / chartMaxProposals) * 120}`).join(' L ')}"
									class="chart-line red" fill="none"
								/>
								<!-- Vetoed (orange) -->
								<path
									d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.proposalsVetoed / chartMaxProposals) * 120}`).join(' L ')}"
									class="chart-line orange" fill="none"
								/>
							</svg>
							<div class="chart-legend">
								<span class="legend-item green">✅ Passed</span>
								<span class="legend-item red">❌ Failed</span>
								<span class="legend-item orange">🚫 Vetoed</span>
							</div>
						{:else}
							<div class="chart-empty"><span>Start simulation to see data</span></div>
						{/if}
					</div>
				</div>

				<!-- Community Sentiment Chart -->
				<div class="chart-card">
					<h3>Community Sentiment</h3>
					<div class="chart-container">
						{#if history.length > 1}
							<svg viewBox="0 0 400 150" class="chart-svg">
								{#each [0, 25, 50, 75, 100] as y}
									<line x1="40" y1={130 - y * 1.2} x2="390" y2={130 - y * 1.2} class="grid-line" />
								{/each}
								<line x1="40" y1={130 - 50 * 1.2} x2="390" y2={130 - 50 * 1.2} class="threshold-line warning" />
								<path
									d="M 40 130 {history.map((h, i) => `L ${40 + (i / (history.length - 1)) * 350} ${130 - (h.sentiment / 100) * 120}`).join(' ')} L 390 130 Z"
									class="chart-area green"
								/>
								<path
									d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.sentiment / 100) * 120}`).join(' L ')}"
									class="chart-line green" fill="none"
								/>
							</svg>
						{:else}
							<div class="chart-empty"><span>Start simulation to see data</span></div>
						{/if}
					</div>
				</div>

				<!-- Gini Coefficient Chart -->
				<div class="chart-card">
					<h3>Inequality (Gini)</h3>
					<div class="chart-container">
						{#if history.length > 1}
							<svg viewBox="0 0 400 150" class="chart-svg">
								{#each [0, 25, 50, 75, 100] as y}
									<line x1="40" y1={130 - y * 1.2} x2="390" y2={130 - y * 1.2} class="grid-line" />
								{/each}
								<line x1="40" y1={130 - 0.5 * 120} x2="390" y2={130 - 0.5 * 120} class="threshold-line" />
								<path
									d="M 40 130 {history.map((h, i) => `L ${40 + (i / (history.length - 1)) * 350} ${130 - Math.min(h.gini, 1) * 120}`).join(' ')} L 390 130 Z"
									class="chart-area pink"
								/>
								<path
									d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - Math.min(h.gini, 1) * 120}`).join(' L ')}"
									class="chart-line pink" fill="none"
								/>
							</svg>
						{:else}
							<div class="chart-empty"><span>Start simulation to see data</span></div>
						{/if}
					</div>
				</div>

				<!-- Voter Turnout Chart -->
				<div class="chart-card">
					<h3>Voter Turnout</h3>
					<div class="chart-container">
						{#if history.length > 1}
							<svg viewBox="0 0 400 150" class="chart-svg">
								{#each [0, 25, 50, 75, 100] as y}
									<line x1="40" y1={130 - y * 1.2} x2="390" y2={130 - y * 1.2} class="grid-line" />
								{/each}
								<path
									d="M 40 130 {history.map((h, i) => `L ${40 + (i / (history.length - 1)) * 350} ${130 - (h.turnout / 100) * 120}`).join(' ')} L 390 130 Z"
									class="chart-area blue"
								/>
								<path
									d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.turnout / 100) * 120}`).join(' L ')}"
									class="chart-line blue" fill="none"
								/>
							</svg>
						{:else}
							<div class="chart-empty"><span>Start simulation to see data</span></div>
						{/if}
					</div>
				</div>

				<!-- Active Voters Chart -->
				<div class="chart-card">
					<h3>Active Voters</h3>
					<div class="chart-container">
						{#if history.length > 1}
							<svg viewBox="0 0 400 150" class="chart-svg">
								{#each [0, 25, 50, 75, 100] as y}
									<line x1="40" y1={130 - y * 1.2} x2="390" y2={130 - y * 1.2} class="grid-line" />
								{/each}
								<path
									d="M 40 130 {history.map((h, i) => `L ${40 + (i / (history.length - 1)) * 350} ${130 - (h.activeVoters / chartMaxVoters) * 120}`).join(' ')} L 390 130 Z"
									class="chart-area amber"
								/>
								<path
									d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.activeVoters / chartMaxVoters) * 120}`).join(' L ')}"
									class="chart-line amber" fill="none"
								/>
							</svg>
						{:else}
							<div class="chart-empty"><span>Start simulation to see data</span></div>
						{/if}
					</div>
				</div>

				<!-- Owner Trust Chart -->
				<div class="chart-card">
					<h3>Owner Trust</h3>
					<div class="chart-container">
						{#if history.length > 1}
							<svg viewBox="0 0 400 150" class="chart-svg">
								{#each [0, 25, 50, 75, 100] as y}
									<line x1="40" y1={130 - y * 1.2} x2="390" y2={130 - y * 1.2} class="grid-line" />
								{/each}
								<line x1="40" y1={130 - 50 * 1.2} x2="390" y2={130 - 50 * 1.2} class="threshold-line warning" />
								<path
									d="M 40 130 {history.map((h, i) => `L ${40 + (i / (history.length - 1)) * 350} ${130 - (h.ownerTrust / 100) * 120}`).join(' ')} L 390 130 Z"
									class="chart-area orange"
								/>
								<path
									d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.ownerTrust / 100) * 120}`).join(' L ')}"
									class="chart-line orange" fill="none"
								/>
							</svg>
						{:else}
							<div class="chart-empty"><span>Start simulation to see data</span></div>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<!-- Agent Distribution -->
		{#if agents.length > 0}
			<section class="distribution-section">
				<h2>
					<span class="section-icon">👥</span>
					Agent Distribution
				</h2>
				<div class="distribution-stats">
					<div class="dist-stat">
						<span class="dist-label">Total Agents</span>
						<span class="dist-value">{agents.length}</span>
					</div>
					<div class="dist-stat">
						<span class="dist-label">Whales</span>
						<span class="dist-value whale">{agents.filter(a => a.isWhale).length}</span>
					</div>
					<div class="dist-stat">
						<span class="dist-label">Regular Users</span>
						<span class="dist-value">{agents.filter(a => !a.isWhale).length}</span>
					</div>
					<div class="dist-stat">
						<span class="dist-label">Avg ST per Agent</span>
						<span class="dist-value">{(metrics.totalSpaceTime / agents.length).toFixed(1)}</span>
					</div>
				</div>
				
				<!-- Visual distribution -->
				<div class="agent-visualization">
					{#each agents.slice(0, 100) as agent}
						<div 
							class="agent-dot" 
							class:whale={agent.isWhale}
							style="--size: {Math.min(20, 4 + agent.spaceTime / 50)}px; --opacity: {0.3 + agent.participationRate * 0.7}"
							title="Agent #{agent.id}: ST={agent.spaceTime.toFixed(1)}, SM={agent.spaceMoney}"
						></div>
					{/each}
					{#if agents.length > 100}
						<div class="more-agents">+{agents.length - 100} more</div>
					{/if}
				</div>
			</section>
		{/if}

		<!-- Results Panel -->
		<div class="results-panel">
			<!-- Real-time Metrics -->
			<section class="metrics-section">
				<h2>
					<span class="section-icon">📊</span>
					Real-time Metrics
				</h2>
				<div class="metrics-grid">
					<div class="metric-card purple">
						<div class="metric-icon">⏰</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.totalSpaceTime.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
							<div class="metric-label">$PACETIME Supply</div>
							<div class="metric-hint">Earned through participation</div>
						</div>
					</div>
					<div class="metric-card cyan">
						<div class="metric-icon">💵</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.totalSpaceMoney.toLocaleString()}</div>
							<div class="metric-label">$PACEMONEY Supply</div>
							<div class="metric-usd">${(metrics.totalSpaceMoney * config.pricePerPacemoney).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</div>
							<div class="metric-hint">@ ${config.pricePerPacemoney}/token</div>
						</div>
					</div>
					<div class="metric-card green">
						<div class="metric-icon">✅</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.proposalsPassed}</div>
							<div class="metric-label">Proposals Passed</div>
						</div>
					</div>
					<div class="metric-card red">
						<div class="metric-icon">❌</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.proposalsFailed}</div>
							<div class="metric-label">Proposals Failed</div>
						</div>
					</div>
					<div class="metric-card orange">
						<div class="metric-icon">🚫</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.proposalsVetoed}</div>
							<div class="metric-label">Owner Vetoes</div>
							<div class="metric-hint">{metrics.proposalsVetoed > 3 ? '⚠️ High veto rate!' : 'Within limits'}</div>
						</div>
					</div>
					<div class="metric-card" class:sentiment-good={metrics.communitySentiment >= 70} class:sentiment-warn={metrics.communitySentiment >= 40 && metrics.communitySentiment < 70} class:sentiment-bad={metrics.communitySentiment < 40}>
						<div class="metric-icon">😊</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.communitySentiment.toFixed(0)}%</div>
							<div class="metric-label">Community Sentiment</div>
							<div class="sentiment-bar">
								<div class="sentiment-fill" style="width: {metrics.communitySentiment}%"></div>
							</div>
						</div>
					</div>
					<div class="metric-card pink">
						<div class="metric-icon">⚖️</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.giniCoefficient.toFixed(3)}</div>
							<div class="metric-label">Gini (Inequality)</div>
							<div class="metric-hint">{metrics.giniCoefficient < 0.3 ? 'Healthy' : metrics.giniCoefficient < 0.5 ? 'Moderate' : 'High'}</div>
						</div>
					</div>
					<div class="metric-card blue">
						<div class="metric-icon">🗳️</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.voterTurnout.toFixed(1)}%</div>
							<div class="metric-label">Voter Turnout</div>
						</div>
					</div>
					<div class="metric-card" class:voter-healthy={metrics.activeVoters >= metrics.eligibleVoters * 0.6} class:voter-declining={metrics.activeVoters < metrics.eligibleVoters * 0.6 && metrics.activeVoters >= metrics.eligibleVoters * 0.3} class:voter-critical={metrics.activeVoters < metrics.eligibleVoters * 0.3}>
						<div class="metric-icon">👥</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.activeVoters}<span class="metric-subvalue">/{metrics.eligibleVoters}</span></div>
							<div class="metric-label">Active Voters</div>
							<div class="voter-breakdown">
								<span class="voter-stat" title="Disengaged agents who left due to low sentiment">😞 {metrics.disengagedAgents}</span>
								<span class="voter-stat" title="New agents attracted to healthy community">🌟 +{metrics.newAgentsAttracted}</span>
							</div>
							<div class="voter-bar">
								<div class="voter-fill eligible" style="width: {metrics.eligibleVoters / agents.length * 100}%"></div>
								<div class="voter-fill active" style="width: {metrics.activeVoters / agents.length * 100}%"></div>
							</div>
						</div>
					</div>
					<div class="metric-card" class:health-good={metrics.communityHealth >= 70} class:health-warn={metrics.communityHealth >= 40 && metrics.communityHealth < 70} class:health-bad={metrics.communityHealth < 40}>
						<div class="metric-icon">💚</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.communityHealth.toFixed(0)}%</div>
							<div class="metric-label">Community Health</div>
							<div class="health-breakdown">
								<span title="Sentiment contributes 60%">😊 {metrics.communitySentiment.toFixed(0)}%</span>
								<span title="Trust contributes 40%">🤝 {metrics.ownerTrust.toFixed(0)}%</span>
							</div>
						</div>
					</div>
					<div class="metric-card gradient">
						<div class="metric-icon">🌅</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.sunsetProgress.toFixed(1)}%</div>
							<div class="metric-label">Sunset Progress</div>
							<div class="sunset-bar">
								<div class="sunset-fill" style="width: {metrics.sunsetProgress}%"></div>
							</div>
						</div>
					</div>
					<div class="metric-card cyan">
						<div class="metric-icon">📊</div>
						<div class="metric-content">
							<div class="metric-value">{agents.length}</div>
							<div class="metric-label">Total Agents</div>
							<div class="metric-hint">{agents.length > config.totalAgents ? `+${agents.length - config.totalAgents} grown` : 'Original'}</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Asset Portfolio Section -->
			{#if config.enableAssetInvestments}
				<section class="assets-section">
					<h2>
						<span class="section-icon">🏢</span>
						Asset Portfolio
					</h2>
					
					<!-- Portfolio Summary -->
					<div class="portfolio-summary">
						<div class="portfolio-stat">
							<span class="portfolio-label">Total Assets</span>
							<span class="portfolio-value">{metrics.assetCount}</span>
						</div>
						<div class="portfolio-stat">
							<span class="portfolio-label">Total Cost</span>
							<span class="portfolio-value">{metrics.totalAssetCost.toLocaleString()} $PM</span>
							<span class="portfolio-usd">${(metrics.totalAssetCost * config.pricePerPacemoney).toLocaleString()}</span>
						</div>
						<div class="portfolio-stat">
							<span class="portfolio-label">Current Value</span>
							<span class="portfolio-value">{metrics.totalAssetValue.toLocaleString()} $PM</span>
							<span class="portfolio-usd">${(metrics.totalAssetValue * config.pricePerPacemoney).toLocaleString()}</span>
						</div>
						<div class="portfolio-stat" class:profit={metrics.totalAssetPnL >= 0} class:loss={metrics.totalAssetPnL < 0}>
							<span class="portfolio-label">Total P&L</span>
							<span class="portfolio-value pnl">
								{metrics.totalAssetPnL >= 0 ? '+' : ''}{metrics.totalAssetPnL.toLocaleString()} $PM
							</span>
							<span class="portfolio-percent">
								({metrics.totalAssetPnLPercent >= 0 ? '+' : ''}{metrics.totalAssetPnLPercent.toFixed(2)}%)
							</span>
						</div>
					</div>

					<!-- Asset Portfolio Chart -->
					{#if history.length > 1 && assets.length > 0}
						<div class="chart-card asset-chart">
							<h3>📈 Portfolio Value Over Time</h3>
							<div class="chart-container">
								<svg viewBox="0 0 400 150" class="chart-svg">
									{#each [0, 25, 50, 75, 100] as y}
										<line x1="40" y1={130 - y * 1.2} x2="390" y2={130 - y * 1.2} class="grid-line" />
									{/each}
									<!-- Cost baseline -->
									<path
										d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.totalAssetCost / chartMaxAssetValue) * 120}`).join(' L ')}"
										class="chart-line orange" fill="none" stroke-dasharray="5,5"
									/>
									<!-- Current value -->
									<path
										d="M 40 130 {history.map((h, i) => `L ${40 + (i / (history.length - 1)) * 350} ${130 - (h.totalAssetValue / chartMaxAssetValue) * 120}`).join(' ')} L 390 130 Z"
										class="chart-area green"
									/>
									<path
										d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.totalAssetValue / chartMaxAssetValue) * 120}`).join(' L ')}"
										class="chart-line green" fill="none"
									/>
								</svg>
								<div class="chart-legend">
									<span class="legend-item green">📈 Value</span>
									<span class="legend-item orange">📉 Cost Basis</span>
								</div>
							</div>
						</div>
					{/if}

					<!-- Individual Assets -->
					{#if assets.length > 0}
						<div class="assets-list">
							{#each assets.filter(a => a.status === 'held').slice(-8).reverse() as asset}
								<div class="asset-card" class:profit={asset.pnl >= 0} class:loss={asset.pnl < 0}>
									<div class="asset-header">
										<span class="asset-type-icon">
											{#if asset.type === 'real-estate'}🏢
											{:else if asset.type === 'equipment'}⚙️
											{:else if asset.type === 'intellectual-property'}📜
											{:else if asset.type === 'infrastructure'}🌐
											{:else if asset.type === 'art-collectibles'}🎨
											{/if}
										</span>
										<span class="asset-name">{asset.name}</span>
										<span class="asset-day">Day {asset.purchaseDay}</span>
									</div>
									<div class="asset-values">
										<div class="asset-value-item">
											<span class="asset-value-label">Cost</span>
											<span class="asset-value-amount">{asset.purchasePrice.toLocaleString()} $PM</span>
										</div>
										<div class="asset-value-item">
											<span class="asset-value-label">Current</span>
											<span class="asset-value-amount">{asset.currentValue.toLocaleString()} $PM</span>
										</div>
										<div class="asset-value-item pnl-item">
											<span class="asset-value-label">P&L</span>
											<span class="asset-value-amount" class:positive={asset.pnl >= 0} class:negative={asset.pnl < 0}>
												{asset.pnl >= 0 ? '+' : ''}{asset.pnl.toLocaleString()} ({asset.pnlPercent >= 0 ? '+' : ''}{asset.pnlPercent.toFixed(1)}%)
											</span>
										</div>
									</div>
									<div class="asset-pnl-bar">
										{#if asset.pnl >= 0}
											<div class="pnl-fill profit" style="width: {Math.min(100, asset.pnlPercent)}%"></div>
										{:else}
											<div class="pnl-fill loss" style="width: {Math.min(100, Math.abs(asset.pnlPercent))}%"></div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="assets-empty">
							<span>🏗️ No assets acquired yet. Asset purchase proposals will appear during simulation.</span>
						</div>
					{/if}
				</section>
			{/if}

			<!-- Recent Proposals -->
			{#if proposals.length > 0}
				<section class="proposals-section">
					<h2>
						<span class="section-icon">📋</span>
						Recent Proposals
					</h2>
					<div class="proposals-list">
						{#each [...proposals].reverse().slice(0, 6) as proposal}
							<div class="proposal-card" class:passed={proposal.passed} class:failed={!proposal.passed && !proposal.vetoed} class:vetoed={proposal.vetoed}>
								<div class="proposal-header">
									<span class="proposal-id">#{proposal.id}</span>
									<span class="proposal-type" class:time-heavy={proposal.type === 'time-heavy'} class:money-heavy={proposal.type === 'money-heavy'} class:balanced={proposal.type === 'balanced'}>
										{proposal.type === 'time-heavy' ? '⏰ Time-Heavy' : proposal.type === 'money-heavy' ? '💵 Money-Heavy' : '⚖️ Balanced'}
									</span>
									<span class="proposal-status">
										{#if proposal.vetoed}
											🚫 VETOED
										{:else if proposal.passed}
											✅ PASSED
										{:else}
											❌ FAILED
										{/if}
									</span>
								</div>
								<div class="proposal-title">{proposal.title}</div>
								<div class="proposal-stats">
									<span class="proposal-approval">
										{proposal.approvalRate.toFixed(1)}% approval
									</span>
									<span class="proposal-weights">
										$PACETIME: {(proposal.timeWeight * 100).toFixed(0)}% | $PACEMONEY: {(proposal.moneyWeight * 100).toFixed(0)}%
									</span>
								</div>
								<div class="proposal-bar">
									<div class="proposal-for" style="width: {proposal.approvalRate}%"></div>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Recent Proposals -->
			<section class="proposals-section">
				<h2>
					<span class="section-icon">📜</span>
					Recent Proposals
				</h2>
				<div class="proposals-list">
					{#if recentProposals.length === 0}
						<div class="proposals-empty">
							<span>Proposals will appear here during simulation</span>
						</div>
					{:else}
						{#each [...recentProposals].reverse() as proposal}
							<div class="proposal-card {proposal.status}">
								<div class="proposal-header">
									<span class="proposal-title">{proposal.title}</span>
									<span class="proposal-status {proposal.status}">
										{proposal.status === 'vetoed' ? '🚫 Vetoed' : proposal.status === 'passed' ? '✅ Passed' : '❌ Failed'}
									</span>
								</div>
								<div class="proposal-meta">
									<span>Day {proposal.day}</span>
									<span class="proposal-type {proposal.type}">
										{proposal.type === 'time-heavy' ? '⏰ Time-Heavy' : proposal.type === 'money-heavy' ? '💵 Money-Heavy' : '⚖️ Balanced'}
									</span>
									<span class="proposal-weights">
										T:{(proposal.timeWeight * 100).toFixed(0)}% M:{(proposal.moneyWeight * 100).toFixed(0)}%
									</span>
								</div>
								<div class="proposal-votes">
									<span class="votes-for">👍 {proposal.votesFor.toFixed(0)}</span>
									<span class="votes-against">👎 {proposal.votesAgainst.toFixed(0)}</span>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</section>

			<!-- Event Log -->
			<section class="log-section">
				<h2>
					<span class="section-icon">📋</span>
					Event Log
				</h2>
				<div class="log-container">
					{#if logs.length === 0}
						<div class="log-empty">
							<span>Events will appear here during simulation</span>
						</div>
					{:else}
						{#each [...logs].reverse() as log}
							<div class="log-entry {log.type}">
								<span class="log-day">Day {log.day}</span>
								<span class="log-message">{log.message}</span>
							</div>
						{/each}
					{/if}
				</div>
			</section>
		</div>
	</div>
</div>

<style>
	.simulate-page {
		max-width: 1600px;
		margin: 0 auto;
		padding: var(--space-lg);
	}

	/* Page Header */
	.page-header {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		margin-bottom: var(--space-xl);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: var(--space-lg);
	}

	.header-text h1 {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 4vw, 2rem);
		margin: 0 0 var(--space-sm);
	}

	.header-text h1 .icon {
		font-size: 1.5em;
	}

	.header-text p {
		color: var(--color-text-muted);
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	/* Buttons */
	.btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		border: none;
		border-radius: var(--radius-full);
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--gradient-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: var(--shadow-glow);
	}

	.btn-lg {
		padding: var(--space-md) var(--space-xl);
		font-size: 1rem;
	}

	.btn-secondary {
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-bg-card-hover);
	}

	.btn-warning {
		background: var(--color-warning);
		color: #000;
	}

	.btn-success {
		background: var(--color-success);
		color: white;
	}

	.btn-accent {
		background: var(--color-accent-secondary);
		color: white;
	}

	/* Progress */
	.progress-section {
		margin-top: var(--space-lg);
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: var(--space-sm);
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.progress-percent {
		font-weight: 600;
		color: var(--color-accent-primary);
	}

	.progress-bar {
		height: 8px;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--gradient-primary);
		border-radius: var(--radius-full);
		transition: width 0.1s linear;
	}

	/* Main Layout */
	.main-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	/* Config Panel */
	.config-panel {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		overflow: hidden;
	}

	.config-panel.collapsed {
		padding-bottom: var(--space-sm);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: inherit;
		text-align: left;
	}

	.panel-header:hover {
		opacity: 0.8;
	}

	.panel-header h2 {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin: 0;
	}

	.toggle-icon {
		font-size: 0.9rem;
		color: var(--color-text-muted);
		transition: transform 0.2s ease;
	}

	/* Redesigned Panel Content */
	.panel-content-redesign {
		margin-top: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	/* Presets Hero Section */
	.presets-hero {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
		border: 1px solid rgba(99, 102, 241, 0.2);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	.presets-header {
		margin-bottom: var(--space-md);
	}

	.presets-header h3 {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 4px;
	}

	.presets-header p {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.presets-carousel {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.preset-chip {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		flex: 1 1 calc(33.333% - var(--space-sm));
		min-width: 180px;
		max-width: 280px;
	}

	.preset-chip:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.preset-chip:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.preset-chip.preset-healthy {
		border-color: rgba(34, 197, 94, 0.4);
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, transparent 100%);
	}
	.preset-chip.preset-healthy:hover:not(:disabled) {
		border-color: #22c55e;
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
	}

	.preset-chip.preset-danger {
		border-color: rgba(239, 68, 68, 0.4);
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, transparent 100%);
	}
	.preset-chip.preset-danger:hover:not(:disabled) {
		border-color: #ef4444;
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
	}

	.preset-chip.preset-warning {
		border-color: rgba(234, 179, 8, 0.4);
		background: linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, transparent 100%);
	}
	.preset-chip.preset-warning:hover:not(:disabled) {
		border-color: #eab308;
		box-shadow: 0 4px 12px rgba(234, 179, 8, 0.2);
	}

	.preset-chip.preset-attack {
		border-color: rgba(168, 85, 247, 0.4);
		background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, transparent 100%);
	}
	.preset-chip.preset-attack:hover:not(:disabled) {
		border-color: #a855f7;
		box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
	}

	.preset-chip.preset-asset {
		border-color: rgba(6, 182, 212, 0.4);
		background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, transparent 100%);
	}
	.preset-chip.preset-asset:hover:not(:disabled) {
		border-color: #06b6d4;
		box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
	}

	.preset-emoji {
		font-size: 1.2rem;
	}

	.preset-chip-name {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--color-text-primary);
	}

	.preset-chip-desc {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		line-height: 1.3;
	}

	/* Config Accordion */
	.config-accordion {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.config-details {
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.config-details[open] {
		border-color: rgba(99, 102, 241, 0.3);
	}

	.config-details-danger {
		border-color: rgba(239, 68, 68, 0.3);
	}

	.config-summary {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		cursor: pointer;
		user-select: none;
		list-style: none;
		transition: background 0.2s ease;
	}

	.config-summary::-webkit-details-marker {
		display: none;
	}

	.config-summary:hover {
		background: var(--color-bg-card-hover);
	}

	.summary-icon {
		font-size: 1rem;
	}

	.summary-text {
		flex: 1;
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--color-text-primary);
	}

	.summary-arrow {
		font-size: 0.7rem;
		color: var(--color-text-muted);
		transition: transform 0.2s ease;
	}

	.config-details[open] .summary-arrow {
		transform: rotate(180deg);
	}

	.config-details-content {
		padding: var(--space-md);
		padding-top: var(--space-sm);
		border-top: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	/* Compact Config Grid */
	.config-grid-compact {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: var(--space-sm);
	}

	.config-item-compact {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.config-item-compact.full-width {
		grid-column: 1 / -1;
	}

	.config-label-compact {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.config-item-compact input[type="number"],
	.config-item-compact select {
		padding: 6px 8px;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: 0.85rem;
		width: 100%;
	}

	.config-item-compact input:focus,
	.config-item-compact select:focus {
		outline: none;
		border-color: var(--color-accent-primary);
	}

	.config-item-compact input:disabled,
	.config-item-compact select:disabled {
		opacity: 0.5;
	}

	.input-hint {
		font-size: 0.7rem;
		color: var(--color-text-muted);
		margin-top: 1px;
	}

	.config-note {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin: 0;
		padding: var(--space-xs) var(--space-sm);
		background: rgba(99, 102, 241, 0.05);
		border-radius: var(--radius-sm);
		line-height: 1.4;
	}

	/* Toggle Rows */
	.config-toggle-row {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex-wrap: wrap;
		padding-top: var(--space-xs);
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.toggle-label input[type="checkbox"] {
		width: 18px;
		height: 18px;
		accent-color: var(--color-accent-primary);
	}

	.config-item-inline {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8rem;
		color: var(--color-text-muted);
	}

	.config-item-inline input[type="number"] {
		width: 60px;
		padding: 4px 6px;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: 0.8rem;
	}

	/* Attack Options */
	.attack-toggles {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.attack-option {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	/* Speed Slider */
	.speed-slider {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.speed-slider input[type="range"] {
		width: 100%;
		height: 6px;
		background: var(--color-bg-primary);
		border-radius: var(--radius-full);
		appearance: none;
		cursor: pointer;
	}

	.speed-slider input[type="range"]::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		background: var(--color-accent-primary);
		border-radius: 50%;
		cursor: pointer;
	}

	/* Keep old styles for backward compatibility */
	.panel-content {
		margin-top: var(--space-lg);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-lg);
	}

	.panel-content.hidden {
		display: none;
	}

	/* Results Panel */
	.results-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.results-panel section {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	.results-panel h2 {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin: 0 0 var(--space-lg);
		color: var(--color-text-primary);
	}

/* Metrics Grid */
	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-md);
	}

	.metric-card {
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		transition: all var(--transition-fast);
	}

	.metric-card:hover {
		border-color: var(--color-border-hover);
		background: var(--color-bg-card-hover);
	}

	.metric-icon {
		font-size: 1.75rem;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-card);
		border-radius: var(--radius-md);
		flex-shrink: 0;
	}

	.metric-card.purple .metric-icon { background: rgba(139, 92, 246, 0.15); }
	.metric-card.cyan .metric-icon { background: rgba(6, 182, 212, 0.15); }
	.metric-card.pink .metric-icon { background: rgba(236, 72, 153, 0.15); }
	.metric-card.green .metric-icon { background: rgba(16, 185, 129, 0.15); }
	.metric-card.amber .metric-icon { background: rgba(245, 158, 11, 0.15); }
	.metric-card.red .metric-icon { background: rgba(239, 68, 68, 0.15); }
	.metric-card.blue .metric-icon { background: rgba(59, 130, 246, 0.15); }
	.metric-card.gradient .metric-icon { background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15)); }

	.metric-content {
		flex: 1;
		min-width: 0;
	}

	.metric-value {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.2;
		margin-bottom: 4px;
	}

	.metric-card.purple .metric-value { color: var(--color-accent-primary); }
	.metric-card.cyan .metric-value { color: var(--color-accent-secondary); }
	.metric-card.pink .metric-value { color: var(--color-accent-tertiary); }
	.metric-card.green .metric-value { color: var(--color-success); }
	.metric-card.amber .metric-value { color: var(--color-warning); }
	.metric-card.red .metric-value { color: var(--color-error); }
	.metric-card.blue .metric-value { color: #3b82f6; }
	.metric-card.gradient .metric-value {
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.metric-label {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		font-weight: 500;
		margin-top: 2px;
	}

	.metric-usd {
		font-size: 1rem;
		font-weight: 600;
		color: #10b981;
		margin-top: 4px;
	}

	.metric-hint {
		font-size: 0.75rem;
		color: var(--color-text-primary);
		margin-top: 6px;
		padding: 4px 8px;
		background: var(--color-bg-card);
		border-radius: var(--radius-sm);
		display: inline-block;
		border: 1px solid var(--color-border);
	}

	.sunset-bar {
		height: 4px;
		background: var(--color-bg-primary);
		border-radius: var(--radius-full);
		margin-top: 8px;
		overflow: hidden;
	}

	.sunset-fill {
		height: 100%;
		background: var(--gradient-primary);
		border-radius: var(--radius-full);
		transition: width 0.3s ease;
	}

	/* Full-width Sunset Progress Bar */
	.sunset-progress-bar {
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.sunset-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-sm);
	}

	.sunset-header h3 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		color: var(--color-text-primary);
	}

	.sunset-value {
		font-size: 1.25rem;
		font-weight: 700;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.sunset-track {
		position: relative;
		height: 12px;
		background: var(--color-bg-primary);
		border-radius: var(--radius-full);
		overflow: hidden;
		margin-bottom: var(--space-sm);
	}

	.sunset-progress-bar .sunset-fill {
		height: 100%;
		background: var(--gradient-primary);
		border-radius: var(--radius-full);
		transition: width 0.3s ease;
	}

	.sunset-target {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--color-success);
		box-shadow: 0 0 8px var(--color-success);
	}

	.sunset-mini-chart {
		height: 60px;
		margin-top: var(--space-xs);
	}

	.sunset-svg {
		width: 100%;
		height: 100%;
	}

	.sunset-target-line {
		stroke: var(--color-success);
		stroke-width: 1;
		stroke-dasharray: 4 4;
		opacity: 0.5;
	}

	.sunset-area {
		fill: url(#gradientFill);
		opacity: 0.3;
	}

	.sunset-line {
		stroke: var(--color-accent-primary);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* Charts */
	.charts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-md);
	}

	.chart-card {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		padding: var(--space-md);
	}

	.chart-card h3 {
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0 0 var(--space-md);
		color: var(--color-text-primary);
	}

	.chart-container {
		height: 150px;
		position: relative;
	}

	.chart-value-label {
		position: absolute;
		bottom: 8px;
		right: 12px;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-success);
		background: rgba(0, 0, 0, 0.6);
		padding: 4px 8px;
		border-radius: var(--radius-sm);
	}

	.chart-svg {
		width: 100%;
		height: 100%;
	}

	.grid-line {
		stroke: var(--color-border);
		stroke-width: 0.5;
	}

	.threshold-line {
		stroke: var(--color-error);
		stroke-width: 1;
		stroke-dasharray: 4 4;
		opacity: 0.5;
	}

	.chart-area {
		opacity: 0.2;
	}

	.chart-area.purple { fill: var(--color-accent-primary); }
	.chart-area.cyan { fill: var(--color-accent-secondary); }
	.chart-area.pink { fill: var(--color-accent-tertiary); }
	.chart-area.green { fill: var(--color-success); }
	.chart-area.blue { fill: #3b82f6; }
	.chart-area.amber { fill: var(--color-warning); }
	.chart-area.red { fill: var(--color-error); }
	.chart-area.orange { fill: #f97316; }
	.chart-area.gradient { fill: url(#gradientFill); }

	.chart-line {
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.chart-line.purple { stroke: var(--color-accent-primary); }
	.chart-line.cyan { stroke: var(--color-accent-secondary); }
	.chart-line.pink { stroke: var(--color-accent-tertiary); }
	.chart-line.green { stroke: var(--color-success); }
	.chart-line.blue { stroke: #3b82f6; }
	.chart-line.amber { stroke: var(--color-warning); }
	.chart-line.red { stroke: var(--color-error); }
	.chart-line.orange { stroke: #f97316; }
	.chart-line.gradient { stroke: var(--color-accent-primary); }

	.threshold-line.success { stroke: var(--color-success); }

	.chart-legend {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
		margin-top: var(--space-sm);
		font-size: 0.75rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.legend-item.green { color: var(--color-success); }
	.legend-item.red { color: var(--color-error); }
	.legend-item.orange { color: #f97316; }

	.chart-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	/* Agent Distribution */
	.distribution-stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xl);
		margin-bottom: var(--space-lg);
		padding: var(--space-md);
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
	}

	.dist-stat {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.dist-label {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.dist-value {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.dist-value.whale {
		color: var(--color-warning);
	}

	.agent-visualization {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		padding: var(--space-md);
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		min-height: 60px;
		align-items: center;
	}

	.agent-dot {
		width: var(--size, 8px);
		height: var(--size, 8px);
		border-radius: 50%;
		background: var(--color-accent-primary);
		opacity: var(--opacity, 0.5);
		transition: transform 0.1s ease;
	}

	.agent-dot:hover {
		transform: scale(1.5);
	}

	.agent-dot.whale {
		background: var(--color-warning);
	}

	.more-agents {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		margin-left: var(--space-sm);
	}

	/* Event Log */
	.log-container {
		max-height: 300px;
		overflow-y: auto;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		padding: var(--space-sm);
	}

	.log-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 80px;
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.log-entry {
		display: flex;
		gap: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-sm);
		font-size: 0.9rem;
		margin-bottom: 4px;
		border-left: 3px solid transparent;
	}

	.log-entry:last-child {
		margin-bottom: 0;
	}

	.log-entry.info { background: rgba(59, 130, 246, 0.1); border-left-color: #3b82f6; }
	.log-entry.success { background: rgba(16, 185, 129, 0.1); border-left-color: var(--color-success); }
	.log-entry.warning { background: rgba(245, 158, 11, 0.1); border-left-color: var(--color-warning); }
	.log-entry.danger { background: rgba(239, 68, 68, 0.1); border-left-color: var(--color-error); }

	.log-day {
		font-weight: 700;
		color: var(--color-text-secondary);
		min-width: 65px;
	}

	.log-message {
		color: var(--color-text-primary);
		flex: 1;
	}

	.log-entry.info .log-message { color: #60a5fa; }
	.log-entry.success .log-message { color: #34d399; }
	.log-entry.warning .log-message { color: #fbbf24; }
	.log-entry.danger .log-message { color: #f87171; }
	.log-entry.veto { background: rgba(249, 115, 22, 0.15); border-left-color: #f97316; }
	.log-entry.veto .log-message { color: #fb923c; }

	/* Orange metric card for vetoes */
	.metric-card.orange .metric-icon { background: rgba(249, 115, 22, 0.15); }
	.metric-card.orange .metric-value { color: #f97316; }

	/* Sentiment indicator */
	.sentiment-good { color: var(--color-success) !important; }
	.sentiment-warn { color: var(--color-warning) !important; }
	.sentiment-bad { color: var(--color-error) !important; }

	.sentiment-bar {
		height: 6px;
		background: var(--color-bg-primary);
		border-radius: var(--radius-full);
		margin-top: 8px;
		overflow: hidden;
	}

	.sentiment-fill {
		height: 100%;
		border-radius: var(--radius-full);
		transition: width 0.3s ease, background 0.3s ease;
	}

	.sentiment-fill.good { background: var(--color-success); }
	.sentiment-fill.warn { background: var(--color-warning); }
	.sentiment-fill.bad { background: var(--color-error); }

	/* Dynamic Active Voters Styles */
	.metric-card.voter-healthy .metric-icon { background: rgba(34, 197, 94, 0.15); }
	.metric-card.voter-healthy .metric-value { color: #22c55e; }
	.metric-card.voter-declining .metric-icon { background: rgba(234, 179, 8, 0.15); }
	.metric-card.voter-declining .metric-value { color: #eab308; }
	.metric-card.voter-critical .metric-icon { background: rgba(239, 68, 68, 0.15); }
	.metric-card.voter-critical .metric-value { color: #ef4444; }

	.metric-subvalue {
		font-size: 0.6em;
		color: var(--color-text-muted);
		font-weight: 400;
	}

	.voter-breakdown {
		display: flex;
		gap: var(--space-sm);
		margin-top: 4px;
		font-size: 0.7rem;
	}

	.voter-stat {
		color: var(--color-text-muted);
		cursor: help;
	}

	.voter-bar {
		height: 6px;
		background: var(--color-bg-primary);
		border-radius: var(--radius-full);
		margin-top: 8px;
		overflow: hidden;
		position: relative;
	}

	.voter-fill {
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
		border-radius: var(--radius-full);
		transition: width 0.3s ease;
	}

	.voter-fill.eligible {
		background: rgba(99, 102, 241, 0.3);
		z-index: 1;
	}

	.voter-fill.active {
		background: linear-gradient(90deg, #6366f1, #8b5cf6);
		z-index: 2;
	}

	/* Community Health Styles */
	.metric-card.health-good .metric-icon { background: rgba(34, 197, 94, 0.15); }
	.metric-card.health-good .metric-value { color: #22c55e; }
	.metric-card.health-warn .metric-icon { background: rgba(234, 179, 8, 0.15); }
	.metric-card.health-warn .metric-value { color: #eab308; }
	.metric-card.health-bad .metric-icon { background: rgba(239, 68, 68, 0.15); }
	.metric-card.health-bad .metric-value { color: #ef4444; }

	.health-breakdown {
		display: flex;
		gap: var(--space-md);
		margin-top: 4px;
		font-size: 0.7rem;
		color: var(--color-text-muted);
	}

	/* Cyan metric card for total agents */
	.metric-card.cyan .metric-icon { background: rgba(6, 182, 212, 0.15); }
	.metric-card.cyan .metric-value { color: #06b6d4; }

	/* Config hint text */
	.config-hint-text {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-top: 4px;
		font-style: italic;
	}

	/* Chart green color for sentiment */
	.chart-area.green { fill: var(--color-success); }
	.chart-line.green { stroke: var(--color-success); }
	.threshold-line.warning { stroke: var(--color-warning); }

	/* Recent Proposals Section */
	.proposals-section {
		margin-top: var(--space-lg);
	}

	.proposals-section h2 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: var(--space-md);
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.proposals-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		max-height: 280px;
		overflow-y: auto;
	}

	.proposal-card {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		border-left: 3px solid var(--color-border);
	}

	.proposal-card.passed { border-left-color: var(--color-success); }
	.proposal-card.failed { border-left-color: var(--color-error); }
	.proposal-card.vetoed { border-left-color: #f97316; }

	.proposal-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.proposal-title {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--color-text-primary);
	}

	.proposal-status {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		text-transform: uppercase;
	}

	.proposal-status.passed { background: rgba(16, 185, 129, 0.2); color: var(--color-success); }
	.proposal-status.failed { background: rgba(239, 68, 68, 0.2); color: var(--color-error); }
	.proposal-status.vetoed { background: rgba(249, 115, 22, 0.2); color: #f97316; }

	.proposal-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		font-size: 0.8rem;
		color: var(--color-text-secondary);
	}

	.proposal-type {
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		font-size: 0.7rem;
		font-weight: 600;
	}

	.proposal-type.time-heavy { background: rgba(139, 92, 246, 0.2); color: var(--color-accent-primary); }
	.proposal-type.money-heavy { background: rgba(6, 182, 212, 0.2); color: var(--color-accent-secondary); }
	.proposal-type.balanced { background: rgba(236, 72, 153, 0.2); color: var(--color-accent-tertiary); }

	.proposal-votes {
		display: flex;
		gap: var(--space-md);
		margin-top: var(--space-sm);
	}

	.proposal-votes span {
		font-size: 0.8rem;
	}

	.votes-for { color: var(--color-success); }
	.votes-against { color: var(--color-error); }

	.proposals-empty {
		text-align: center;
		padding: var(--space-lg);
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.simulate-page {
			padding: var(--space-md);
		}

		.header-content {
			flex-direction: column;
		}

		.config-panel {
			position: static;
			max-height: none;
		}

		.metrics-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.charts-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Asset Portfolio Styles */
	.assets-section {
		margin-top: var(--space-xl);
		padding: var(--space-lg);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
	}

	.assets-section h2 {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: 1.25rem;
		margin-bottom: var(--space-lg);
	}

	.portfolio-summary {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
		padding: var(--space-md);
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-lg);
	}

	.portfolio-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--space-sm);
	}

	.portfolio-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-xs);
	}

	.portfolio-value {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.portfolio-value.pnl {
		font-size: 1.2rem;
	}

	.portfolio-stat.profit .portfolio-value {
		color: var(--color-success);
	}

	.portfolio-stat.loss .portfolio-value {
		color: var(--color-error);
	}

	.portfolio-usd {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
	}

	.portfolio-percent {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
	}

	.portfolio-stat.profit .portfolio-percent {
		color: var(--color-success);
	}

	.portfolio-stat.loss .portfolio-percent {
		color: var(--color-error);
	}

	.asset-chart {
		margin-bottom: var(--space-lg);
	}

	.assets-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-md);
	}

	.asset-card {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-lg);
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		transition: all var(--transition-fast);
	}

	.asset-card:hover {
		border-color: var(--color-accent-primary);
		transform: translateY(-2px);
	}

	.asset-card.profit {
		border-left: 3px solid var(--color-success);
	}

	.asset-card.loss {
		border-left: 3px solid var(--color-error);
	}

	.asset-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-md);
	}

	.asset-type-icon {
		font-size: 1.5rem;
	}

	.asset-name {
		flex: 1;
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--color-text-primary);
	}

	.asset-day {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		padding: 2px 8px;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-full);
	}

	.asset-values {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.asset-value-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.asset-value-label {
		font-size: 0.7rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.asset-value-amount {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.asset-value-amount.positive {
		color: var(--color-success);
	}

	.asset-value-amount.negative {
		color: var(--color-error);
	}

	.pnl-item .asset-value-amount {
		font-weight: 700;
	}

	.asset-pnl-bar {
		height: 4px;
		background: var(--color-bg-secondary);
		border-radius: 2px;
		overflow: hidden;
	}

	.pnl-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	.pnl-fill.profit {
		background: linear-gradient(90deg, var(--color-success), #34d399);
	}

	.pnl-fill.loss {
		background: linear-gradient(90deg, var(--color-error), #f87171);
	}

	.assets-empty {
		text-align: center;
		padding: var(--space-xl);
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	@media (max-width: 768px) {
		.portfolio-summary {
			grid-template-columns: repeat(2, 1fr);
		}

		.assets-list {
			grid-template-columns: 1fr;
		}

		.asset-values {
			grid-template-columns: 1fr;
			gap: var(--space-xs);
		}

		.asset-value-item {
			flex-direction: row;
			justify-content: space-between;
		}
	}
</style>
