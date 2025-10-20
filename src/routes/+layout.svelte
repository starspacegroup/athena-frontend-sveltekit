<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/auth';

	let { children } = $props();

	onMount(async () => {
		// Check if user is logged in on mount
		const response = await fetch('/api/auth/me');
		if (response.ok) {
			const data = await response.json();
			user.set(data.user);
		}
	});
</script>

<div class="app">
	<header>
		<h1>Athena DAO</h1>
		<nav>
			<a href="/">Home</a>
			{#if $user}
				<a href="/dashboard">Dashboard</a>
				<a href="/tokens">Tokens</a>
			{/if}
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>
		<p>Digital Autonomous Organization for *Space</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}

	header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1rem 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	header h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
	}

	nav {
		display: flex;
		gap: 1.5rem;
	}

	nav a {
		color: white;
		text-decoration: none;
		font-weight: 500;
		transition: opacity 0.2s;
	}

	nav a:hover {
		opacity: 0.8;
	}

	main {
		flex: 1;
		padding: 2rem;
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
	}

	footer {
		background: #f5f5f5;
		padding: 1rem 2rem;
		text-align: center;
		color: #666;
	}

	footer p {
		margin: 0;
	}

	:global(body) {
		margin: 0;
		padding: 0;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
