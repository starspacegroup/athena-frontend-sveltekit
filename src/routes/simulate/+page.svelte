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
		sybilAgentCount: 50
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
		ownerTrust: 100 // 0-100, decreases with vetoes
	});

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
	}[]>([]);

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
				sentiment: 100 // Start with full trust
			});
		}
	}

	function simulateDay(day: number) {
		// SpaceTime ($PACETIME) decay
		for (const agent of agents) {
			agent.spaceTime *= Math.exp(-config.stDecayRate);
		}
		
		// Participation and $PACETIME minting
		let dailyParticipants = 0;
		for (const agent of agents) {
			// Participation affected by sentiment
			const effectiveParticipation = agent.participationRate * (agent.sentiment / 100);
			if (Math.random() < effectiveParticipation) {
				const stEarned = config.stMintRate * (0.5 + Math.random());
				agent.spaceTime += stEarned;
				dailyParticipants++;
			}
		}
		
		// Proposal voting (every proposalFrequency days)
		if (day % config.proposalFrequency === 0 && day > 0) {
			simulateProposal(day);
		}
		
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
					sentiment: 100
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
		const stValues = agents.map(a => a.spaceTime);
		const smValues = agents.map(a => a.spaceMoney);
		
		metrics.totalSpaceTime = stValues.reduce((a, b) => a + b, 0);
		metrics.totalSpaceMoney = smValues.reduce((a, b) => a + b, 0);
		metrics.giniCoefficient = calculateGini(stValues);
		metrics.activeVoters = agents.filter(a => a.spaceTime >= config.proposalThreshold * 0.1).length;
		
		// Calculate sunset progress (simplified)
		const uniqueEarners = agents.filter(a => a.spaceTime > 0).length;
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
			sunsetProgress: metrics.sunsetProgress
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
			ownerTrust: 100
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
	let chartMaxVoters = $derived(Math.max(...history.map(h => h.activeVoters), 1));
	let chartMaxProposals = $derived(Math.max(
		...history.map(h => h.proposalsPassed + h.proposalsFailed + h.proposalsVetoed), 
		1
	));
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
			<div class="panel-content" class:hidden={!configExpanded}>

			<!-- Presets -->
			<section class="config-section">
				<h3>Quick Presets</h3>
				<div class="presets-grid">
					{#each presets as preset}
						<button 
							class="preset-card" 
							onclick={() => applyPreset(preset)}
							disabled={isRunning}
						>
							<div class="preset-name">{preset.name}</div>
							<div class="preset-desc">{preset.description}</div>
						</button>
					{/each}
				</div>
			</section>

			<!-- Agent Configuration -->
			<section class="config-section">
				<h3>Agent Configuration</h3>
				<div class="config-grid">
					<label class="config-item">
						<span class="config-label">Total Agents</span>
						<input 
							type="number" 
							bind:value={config.totalAgents} 
							min="10" 
							max="1000"
							disabled={isRunning}
						/>
					</label>
					<label class="config-item">
						<span class="config-label">Whale %</span>
						<input 
							type="number" 
							bind:value={config.whalePercentage} 
							min="0" 
							max="50"
							disabled={isRunning}
						/>
					</label>
					<label class="config-item">
						<span class="config-label">Participation Rate %</span>
						<input 
							type="number" 
							bind:value={config.activeParticipationRate} 
							min="10" 
							max="100"
							disabled={isRunning}
						/>
					</label>
					<label class="config-item">
						<span class="config-label">Avg Wealth (SM)</span>
						<input 
							type="number" 
							bind:value={config.averageWealth} 
							min="100" 
							max="100000"
							disabled={isRunning}
						/>
					</label>
					<label class="config-item full-width">
						<span class="config-label">Wealth Distribution</span>
						<select bind:value={config.wealthDistribution} disabled={isRunning}>
							<option value="uniform">Uniform</option>
							<option value="normal">Normal (Gaussian)</option>
							<option value="pareto">Pareto (Power Law)</option>
						</select>
					</label>
				</div>
			</section>

			<!-- Token Parameters -->
			<section class="config-section">
				<h3>Token Parameters</h3>
				<div class="config-grid">
					<label class="config-item">
						<span class="config-label">ST Decay Rate</span>
						<input 
							type="number" 
							bind:value={config.stDecayRate} 
							min="0" 
							max="0.01"
							step="0.0001"
							disabled={isRunning}
						/>
					</label>
					<label class="config-item">
						<span class="config-label">ST Mint Rate</span>
						<input 
							type="number" 
							bind:value={config.stMintRate} 
							min="1" 
							max="100"
							disabled={isRunning}
						/>
					</label>
				</div>
			</section>

			<!-- Governance Parameters -->
			<section class="config-section">
				<h3>Governance Parameters</h3>
				<div class="config-grid">
					<label class="config-item">
						<span class="config-label">Proposal Threshold</span>
						<input 
							type="number" 
							bind:value={config.proposalThreshold} 
							min="10" 
							max="10000"
							disabled={isRunning}
						/>
					</label>
					<label class="config-item">
						<span class="config-label">Quorum %</span>
						<input 
							type="number" 
							bind:value={config.quorumPercentage} 
							min="1" 
							max="100"
							disabled={isRunning}
						/>
					</label>
				</div>
			</section>

			<!-- Owner/Founder Settings -->
			<section class="config-section">
				<h3>Owner Veto Settings</h3>
				<div class="config-grid">
					<label class="config-item">
						<span class="config-label">Veto Probability %</span>
						<input 
							type="number" 
							bind:value={config.ownerVetoProbability} 
							min="0" 
							max="100"
							disabled={isRunning}
						/>
					</label>
					<label class="config-item">
						<span class="config-label">Veto Threshold %</span>
						<input 
							type="number" 
							bind:value={config.ownerVetoThreshold} 
							min="50" 
							max="100"
							disabled={isRunning}
						/>
					</label>
				</div>
				<p class="config-hint-text">Higher veto probability = more vetoes. Owner more likely to veto proposals below threshold.</p>
			</section>

			<!-- Simulation Settings -->
			<section class="config-section">
				<h3>Simulation Settings</h3>
				<div class="config-grid">
					<label class="config-item">
						<span class="config-label">Days to Simulate</span>
						<input 
							type="number" 
							bind:value={config.simulationDays} 
							min="30" 
							max="3650"
							disabled={isRunning}
						/>
					</label>
					<label class="config-item">
						<span class="config-label">Speed (steps/sec)</span>
						<input 
							type="range" 
							bind:value={config.simulationSpeed} 
							min="10" 
							max="500"
						/>
						<span class="range-value">{config.simulationSpeed}</span>
					</label>
				</div>
			</section>

			<!-- Attack Scenarios -->
			<section class="config-section">
				<h3>Attack Scenarios</h3>
				<div class="config-grid">
					<label class="config-item toggle-item">
						<span class="config-label">Enable Whale Attack</span>
						<input 
							type="checkbox" 
							bind:checked={config.enableWhaleAttack}
							disabled={isRunning}
						/>
					</label>
					{#if config.enableWhaleAttack}
						<label class="config-item">
							<span class="config-label">Attack Day</span>
							<input 
								type="number" 
								bind:value={config.whaleAttackDay} 
								min="1" 
								max={config.simulationDays}
								disabled={isRunning}
							/>
						</label>
					{/if}
					<label class="config-item toggle-item">
						<span class="config-label">Enable Sybil Attack</span>
						<input 
							type="checkbox" 
							bind:checked={config.enableSybilAttack}
							disabled={isRunning}
						/>
					</label>
					{#if config.enableSybilAttack}
						<label class="config-item">
							<span class="config-label">Sybil Agents</span>
							<input 
								type="number" 
								bind:value={config.sybilAgentCount} 
								min="10" 
								max="500"
								disabled={isRunning}
							/>
						</label>
					{/if}
				</div>
			</section>
			</div>
		</aside>

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
							<div class="metric-label">$PACETIME Total</div>
							<div class="metric-hint">Earned through participation</div>
						</div>
					</div>
					<div class="metric-card cyan">
						<div class="metric-icon">💵</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.totalSpaceMoney.toLocaleString()}</div>
							<div class="metric-label">$PACEMONEY Total</div>
							<div class="metric-hint">Purchasable tokens</div>
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
					<div class="metric-card amber">
						<div class="metric-icon">👥</div>
						<div class="metric-content">
							<div class="metric-value">{metrics.activeVoters}</div>
							<div class="metric-label">Active Voters</div>
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
				</div>
			</section>

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

			<!-- Charts Section -->
			<section class="charts-section">
				<h2>
					<span class="section-icon">📈</span>
					Time Series
				</h2>
				<div class="charts-grid">
					<!-- $PACETIME Supply Chart -->
					<div class="chart-card">
						<h3>$PACETIME Total</h3>
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
						<h3>$PACEMONEY Total</h3>
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

					<!-- Sunset Progress Chart -->
					<div class="chart-card">
						<h3>Sunset Progress</h3>
						<div class="chart-container">
							{#if history.length > 1}
								<svg viewBox="0 0 400 150" class="chart-svg">
									{#each [0, 25, 50, 75, 100] as y}
										<line x1="40" y1={130 - y * 1.2} x2="390" y2={130 - y * 1.2} class="grid-line" />
									{/each}
									<!-- Target line at 100% -->
									<line x1="40" y1={130 - 100 * 1.2} x2="390" y2={130 - 100 * 1.2} class="threshold-line success" />
									<path
										d="M 40 130 {history.map((h, i) => `L ${40 + (i / (history.length - 1)) * 350} ${130 - (h.sunsetProgress / 100) * 120}`).join(' ')} L 390 130 Z"
										class="chart-area gradient"
									/>
									<path
										d="M {history.map((h, i) => `${40 + (i / (history.length - 1)) * 350} ${130 - (h.sunsetProgress / 100) * 120}`).join(' L ')}"
										class="chart-line gradient" fill="none"
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

	.panel-content {
		margin-top: var(--space-lg);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-lg);
	}

	.panel-content.hidden {
		display: none;
	}

	.config-section {
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
	}

	.config-section h3 {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-md);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		opacity: 0.9;
	}

	/* Presets */
	.presets-grid {
		display: grid;
		gap: var(--space-sm);
	}

	.preset-card {
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		text-align: left;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.preset-card:hover:not(:disabled) {
		border-color: var(--color-accent-primary);
		background: var(--color-bg-card-hover);
	}

	.preset-card:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.preset-name {
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--color-text-primary);
		margin-bottom: 4px;
	}

	.preset-desc {
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	/* Config Grid */
	.config-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-sm);
	}

	.config-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.config-item.full-width {
		grid-column: 1 / -1;
	}

	.config-item.toggle-item {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		grid-column: 1 / -1;
	}

	.config-label {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.config-item input[type="number"],
	.config-item input[type="text"],
	.config-item select {
		padding: var(--space-sm);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-size: 0.9rem;
		width: 100%;
	}

	.config-item input:focus,
	.config-item select:focus {
		outline: none;
		border-color: var(--color-accent-primary);
	}

	.config-item input:disabled,
	.config-item select:disabled {
		opacity: 0.5;
	}

	.config-item input[type="checkbox"] {
		width: 20px;
		height: 20px;
		accent-color: var(--color-accent-primary);
	}

	.config-item input[type="range"] {
		width: 100%;
		accent-color: var(--color-accent-primary);
	}

	.range-value {
		font-size: 0.8rem;
		color: var(--color-accent-primary);
		text-align: center;
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
</style>
