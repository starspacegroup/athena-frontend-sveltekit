<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/auth';
	import { page } from '$app/stores';

	let { children } = $props();
	let scrolled = $state(false);
	let mobileMenuOpen = $state(false);
	let savedScrollY = 0;

	// Close mobile menu on navigation
	$effect(() => {
		$page.url.pathname;
		mobileMenuOpen = false;
	});

	// Lock body scroll when mobile menu is open
	$effect(() => {
		if (typeof document === 'undefined') return;
		
		if (mobileMenuOpen) {
			// Save scroll position and scroll to top for iOS fixed positioning
			savedScrollY = window.scrollY;
			
			// iOS-compatible scroll lock - freeze the body at current position
			document.body.style.position = 'fixed';
			document.body.style.top = `-${savedScrollY}px`;
			document.body.style.left = '0';
			document.body.style.right = '0';
			document.body.style.overflow = 'hidden';
		} else {
			// Restore scroll position
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.left = '';
			document.body.style.right = '';
			document.body.style.overflow = '';
			
			if (savedScrollY > 0) {
				window.scrollTo(0, savedScrollY);
			}
		}
		
		return () => {
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.left = '';
			document.body.style.right = '';
			document.body.style.overflow = '';
		};
	});

	// Close on escape key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && mobileMenuOpen) {
			mobileMenuOpen = false;
		}
	}


	onMount(() => {
		// Check if user is logged in on mount
		fetch('/api/auth/me').then(async (response) => {
			if (response.ok) {
				const data = await response.json() as { user: typeof $user };
				user.set(data.user);
			}
		});

		// Handle scroll for header effect
		const handleScroll = () => {
			scrolled = window.scrollY > 20;
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('keydown', handleKeydown);
		
		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	// iOS-specific touch handler for hamburger
	function handleHamburgerTouch(e: TouchEvent) {
		e.preventDefault();
		e.stopPropagation();
		mobileMenuOpen = !mobileMenuOpen;
	}

	// iOS-specific touch handler for close button
	function handleCloseTouch(e: TouchEvent) {
		e.preventDefault();
		e.stopPropagation();
		mobileMenuOpen = false;
	}
</script>

<div class="app">
	<!-- Alpha Preview Banner -->
	<div class="alpha-banner">
		<span class="alpha-badge">⚠️ ALPHA</span>
		<span class="alpha-text">This is a non-working preview build. Features are under active development.</span>
	</div>

	<!-- Animated background -->
	<div class="bg-gradient"></div>
	<div class="bg-grid"></div>
	<div class="bg-glow glow-1"></div>
	<div class="bg-glow glow-2"></div>

	<header class:scrolled>
		<div class="header-content">
			<a href="/" class="logo">
				<img src="/space-logo.png" alt="Athena" class="logo-icon" />
				<span class="logo-text">Athena</span>
			</a>
			
			<button 
				class="mobile-menu-toggle" 
				onclick={toggleMobileMenu}
				ontouchend={handleHamburgerTouch}
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileMenuOpen}
				type="button"
			>
				<span class="hamburger" class:open={mobileMenuOpen}>
					<span class="hamburger-line"></span>
					<span class="hamburger-line"></span>
					<span class="hamburger-line"></span>
				</span>
			</button>

			<nav class:open={mobileMenuOpen}>
				<button 
					class="mobile-close-btn" 
					onclick={closeMobileMenu}
					ontouchend={handleCloseTouch}
					aria-label="Close menu"
					type="button"
				>
					<span>✕</span>
				</button>
				<a href="/" class:active={$page.url.pathname === '/'}>
					<span class="nav-icon">🏠</span>
					Home
				</a>
				<a href="/whitepaper" class:active={$page.url.pathname === '/whitepaper'}>
					<span class="nav-icon">📄</span>
					Whitepaper
				</a>
				<a href="/simulate" class:active={$page.url.pathname === '/simulate'}>
					<span class="nav-icon">🧪</span>
					Simulate
				</a>
				{#if $user}
					<a href="/dashboard" class:active={$page.url.pathname === '/dashboard'}>
						<span class="nav-icon">📊</span>
						Dashboard
					</a>
					<a href="/tokens/purchase" class:active={$page.url.pathname.includes('/tokens')}>
						<span class="nav-icon">💎</span>
						Tokens
					</a>
				{/if}
				{#if $user}
					<a href="/profile" class="user-pill" class:active={$page.url.pathname === '/profile'}>
						<div class="user-avatar">
							{#if $user.discordAvatar && $user.discordId}
								<img 
									src="https://cdn.discordapp.com/avatars/{$user.discordId}/{$user.discordAvatar}.png?size=64" 
									alt="{$user.discordUsername}'s avatar"
									class="avatar-img"
								/>
							{:else if $user.discordUsername}
								{$user.discordUsername.charAt(0).toUpperCase()}
							{:else}
								<img src="/space-logo.png" alt="" class="avatar-logo" />
							{/if}
						</div>
						<span class="user-name">{$user.discordUsername || 'Connected'}</span>
					</a>
				{/if}
			</nav>
		</div>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>
		<div class="footer-content">
			<div class="footer-brand">
				<img src="/space-logo.png" alt="*Space" class="logo-icon" />
				<span>*Space DAO</span>
			</div>
			<p>Decentralized governance for the future</p>
			<div class="footer-links">
				<a href="/">Home</a>
				<span class="divider">•</span>
				<a href="/whitepaper">Whitepaper</a>
				<span class="divider">•</span>
				<a href="/simulate">Simulate</a>
				<span class="divider">•</span>
				<a href="/dashboard">Dashboard</a>
				<span class="divider">•</span>
				<a href="/tokens/purchase">Tokens</a>
			</div>
		</div>
	</footer>
</div>

<style>
	:global(:root) {
		/* Color System */
		--color-bg-primary: #0a0a0f;
		--color-bg-secondary: #12121a;
		--color-bg-tertiary: #1a1a25;
		--color-bg-card: rgba(26, 26, 37, 0.8);
		--color-bg-card-hover: rgba(35, 35, 50, 0.9);
		
		--color-border: rgba(255, 255, 255, 0.08);
		--color-border-hover: rgba(255, 255, 255, 0.15);
		
		--color-text-primary: #ffffff;
		--color-text-secondary: rgba(255, 255, 255, 0.7);
		--color-text-muted: rgba(255, 255, 255, 0.5);
		
		--color-accent-primary: #8b5cf6;
		--color-accent-secondary: #06b6d4;
		--color-accent-tertiary: #ec4899;
		
		--gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #ec4899 100%);
		--gradient-secondary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		--gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
		
		--color-success: #10b981;
		--color-warning: #f59e0b;
		--color-error: #ef4444;
		
		/* Spacing */
		--space-xs: 0.25rem;
		--space-sm: 0.5rem;
		--space-md: 1rem;
		--space-lg: 1.5rem;
		--space-xl: 2rem;
		--space-2xl: 3rem;
		--space-3xl: 4rem;
		
		/* Border Radius */
		--radius-sm: 6px;
		--radius-md: 12px;
		--radius-lg: 16px;
		--radius-xl: 24px;
		--radius-full: 9999px;
		
		/* Shadows */
		--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
		--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
		--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
		--shadow-glow: 0 0 40px rgba(139, 92, 246, 0.3);
		
		/* Transitions */
		--transition-fast: 0.15s ease;
		--transition-base: 0.25s ease;
		--transition-slow: 0.4s ease;

		/* Typography */
		--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
		--font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
		font-family: var(--font-sans);
		line-height: 1.6;
		overflow-x: hidden;
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		overflow-x: hidden;
	}

	/* Desktop font scaling - 120% larger */
	@media (min-width: 1024px) {
		:global(html) {
			font-size: 120%;
		}
	}

	:global(code) {
		word-break: break-all;
		overflow-wrap: break-word;
	}

	:global(img) {
		max-width: 100%;
		height: auto;
	}

	:global(::selection) {
		background: var(--color-accent-primary);
		color: white;
	}

	:global(::-webkit-scrollbar) {
		width: 8px;
	}

	:global(::-webkit-scrollbar-track) {
		background: var(--color-bg-secondary);
	}

	:global(::-webkit-scrollbar-thumb) {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-full);
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: rgba(139, 92, 246, 0.5);
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		position: relative;
	}

	/* Animated Background */
	.bg-gradient {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
					radial-gradient(ellipse at 100% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 40%),
					radial-gradient(ellipse at 0% 100%, rgba(236, 72, 153, 0.1) 0%, transparent 40%);
		pointer-events: none;
		z-index: 0;
	}

	.bg-grid {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: 
			linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
		background-size: 60px 60px;
		pointer-events: none;
		z-index: 0;
	}

	.bg-glow {
		position: fixed;
		width: 600px;
		height: 600px;
		border-radius: 50%;
		filter: blur(120px);
		opacity: 0.4;
		pointer-events: none;
		z-index: 0;
		animation: float 20s ease-in-out infinite;
	}

	.glow-1 {
		top: -200px;
		right: -100px;
		background: var(--color-accent-primary);
	}

	.glow-2 {
		bottom: -200px;
		left: -100px;
		background: var(--color-accent-secondary);
		animation-delay: -10s;
	}

	@keyframes float {
		0%, 100% { transform: translate(0, 0) scale(1); }
		33% { transform: translate(30px, -30px) scale(1.05); }
		66% { transform: translate(-20px, 20px) scale(0.95); }
	}

	/* Alpha Preview Banner */
	.alpha-banner {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-md);
		background: linear-gradient(90deg, #f59e0b 0%, #ea580c 50%, #f59e0b 100%);
		background-size: 200% 100%;
		animation: shimmer 3s ease-in-out infinite;
		color: #000;
		font-size: 0.85rem;
		font-weight: 600;
		text-align: center;
		box-shadow: 0 2px 10px rgba(245, 158, 11, 0.4);
	}

	@keyframes shimmer {
		0%, 100% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
	}

	.alpha-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: rgba(0, 0, 0, 0.2);
		padding: 2px 8px;
		border-radius: var(--radius-sm);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.alpha-text {
		opacity: 0.9;
	}

	@media (max-width: 600px) {
		.alpha-banner {
			flex-direction: column;
			gap: 2px;
			padding: var(--space-xs);
		}
		
		.alpha-text {
			font-size: 0.75rem;
		}
	}

	/* Header */
	header {
		position: fixed;
		top: 32px;
		left: 0;
		right: 0;
		z-index: 100;
		padding: var(--space-md) var(--space-xl);
		transition: all var(--transition-base);
		background: transparent;
	}

	@media (max-width: 600px) {
		header {
			top: 60px;
		}
	}

	header.scrolled {
		background: rgba(10, 10, 15, 0.85);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid var(--color-border);
		box-shadow: var(--shadow-md);
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		text-decoration: none;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.5rem;
		color: var(--color-text-primary);
		transition: transform var(--transition-fast);
	}

	.logo:hover {
		transform: scale(1.02);
	}

	.logo-icon {
		width: 32px;
		height: 32px;
		object-fit: contain;
		animation: pulse 3s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	.logo-text {
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* Mobile Menu Toggle - Hidden on desktop */
	.mobile-menu-toggle {
		display: none;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 12px;
		z-index: 1001;
		position: relative;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		-webkit-touch-callout: none;
		user-select: none;
		-webkit-user-select: none;
		/* Ensure iOS recognizes as clickable */
		-webkit-appearance: none;
		appearance: none;
		outline: none;
	}

	.hamburger {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: 28px;
		height: 28px;
		position: relative;
		pointer-events: none;
	}

	.hamburger-line {
		display: block;
		width: 24px;
		height: 2px;
		background: var(--color-text-primary);
		pointer-events: none;
		border-radius: 2px;
		transition: transform 0.3s ease, opacity 0.3s ease;
		position: absolute;
	}

	.hamburger-line:nth-child(1) {
		top: 6px;
	}

	.hamburger-line:nth-child(2) {
		top: 13px;
	}

	.hamburger-line:nth-child(3) {
		top: 20px;
	}

	.hamburger.open .hamburger-line:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}

	.hamburger.open .hamburger-line:nth-child(2) {
		opacity: 0;
	}

	.hamburger.open .hamburger-line:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}

	/* Close button inside mobile nav */
	.mobile-close-btn {
		display: none;
	}

	nav {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	nav a {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text-secondary);
		text-decoration: none;
		font-weight: 500;
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		position: relative;
	}

	nav a .nav-icon {
		font-size: 1rem;
		opacity: 0.8;
	}

	nav a:hover {
		color: var(--color-text-primary);
		background: rgba(255, 255, 255, 0.05);
	}

	nav a.active {
		color: var(--color-text-primary);
		background: rgba(139, 92, 246, 0.15);
	}

	nav a.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 20px;
		height: 2px;
		background: var(--gradient-primary);
		border-radius: var(--radius-full);
	}

	.user-pill {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-md) var(--space-xs) var(--space-xs);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		margin-left: var(--space-md);
		text-decoration: none;
		transition: all var(--transition-base);
		cursor: pointer;
	}

	.user-pill:hover {
		background: var(--color-bg-card-hover);
		border-color: var(--color-border-hover);
	}

	.user-pill.active {
		border-color: var(--color-accent-primary);
		background: rgba(139, 92, 246, 0.1);
	}

	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--gradient-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.875rem;
		overflow: hidden;
	}

	.user-avatar .avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.user-avatar .avatar-logo {
		width: 20px;
		height: 20px;
		object-fit: contain;
	}

	.user-name {
		font-weight: 500;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	/* Main Content */
	main {
		flex: 1;
		padding: calc(112px + var(--space-2xl)) var(--space-xl) var(--space-2xl);
		max-width: 1400px;
		width: 100%;
		margin: 0 auto;
		position: relative;
		z-index: 1;
		overflow-x: hidden;
	}

	@media (max-width: 600px) {
		main {
			padding-top: calc(128px + var(--space-2xl));
			padding-left: var(--space-md);
			padding-right: var(--space-md);
		}
	}

	/* Footer */
	footer {
		position: relative;
		z-index: 1;
		border-top: 1px solid var(--color-border);
		background: rgba(10, 10, 15, 0.8);
		backdrop-filter: blur(20px);
		padding: var(--space-2xl) var(--space-xl);
	}

	.footer-content {
		max-width: 1400px;
		margin: 0 auto;
		text-align: center;
	}

	.footer-brand {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.25rem;
		margin-bottom: var(--space-sm);
	}

	.footer-brand .logo-icon {
		width: 24px;
		height: 24px;
	}

	footer p {
		color: var(--color-text-muted);
		margin: 0 0 var(--space-md);
		font-size: 0.875rem;
	}

	.footer-links {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.footer-links a {
		color: var(--color-text-secondary);
		text-decoration: none;
		font-size: 0.875rem;
		transition: color var(--transition-fast);
	}

	.footer-links a:hover {
		color: var(--color-accent-primary);
	}

	.footer-links .divider {
		color: var(--color-text-muted);
	}

	@media (max-width: 480px) {
		.footer-links .divider {
			display: none;
		}

		.footer-links {
			gap: var(--space-sm) var(--space-md);
		}
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.mobile-menu-toggle {
			display: flex;
			align-items: center;
			justify-content: center;
			/* Minimum 44x44 touch target for accessibility */
			min-width: 44px;
			min-height: 44px;
		}

		/* Mobile nav overlay */
		nav {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 1000;
			background: var(--color-bg-primary);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 8px;
			padding: 80px 20px 40px;
			padding-top: max(80px, env(safe-area-inset-top, 0px) + 60px);
			padding-bottom: max(40px, env(safe-area-inset-bottom, 0px) + 20px);
			padding-left: max(20px, env(safe-area-inset-left, 0px));
			padding-right: max(20px, env(safe-area-inset-right, 0px));
			opacity: 0;
			visibility: hidden;
			pointer-events: none;
			transition: opacity 0.25s ease, visibility 0.25s ease;
			overflow-y: auto;
			overscroll-behavior: contain;
			-webkit-overflow-scrolling: touch;
		}

		nav.open {
			opacity: 1;
			visibility: visible;
			pointer-events: auto;
		}

		/* Close button in mobile menu */
		.mobile-close-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			position: absolute;
			top: max(20px, env(safe-area-inset-top, 0px) + 10px);
			right: max(20px, env(safe-area-inset-right, 0px) + 10px);
			width: 44px;
			height: 44px;
			background: rgba(255, 255, 255, 0.1);
			border: 1px solid rgba(255, 255, 255, 0.15);
			border-radius: 50%;
			color: var(--color-text-primary);
			font-size: 20px;
			cursor: pointer;
			z-index: 1002;
			-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
			-webkit-appearance: none;
			appearance: none;
			transition: background 0.2s ease, transform 0.2s ease;
		}

		.mobile-close-btn span {
			pointer-events: none;
		}

		.mobile-close-btn:hover,
		.mobile-close-btn:active {
			background: rgba(255, 255, 255, 0.2);
			transform: scale(1.05);
		}

		nav a {
			font-size: 1.5rem;
			padding: 16px 32px;
			width: 100%;
			max-width: 300px;
			text-align: center;
			border-radius: var(--radius-lg);
			-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		}

		nav a:hover,
		nav a:active {
			background: rgba(255, 255, 255, 0.08);
		}

		nav a.active {
			background: rgba(139, 92, 246, 0.2);
		}

		nav a.active::after {
			display: none;
		}

		.user-pill {
			margin-top: 24px;
			padding: 12px 24px 12px 12px;
			-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		}

		main {
			padding: calc(80px + var(--space-xl)) var(--space-md) var(--space-xl);
		}

		header {
			padding: var(--space-md);
		}

		footer {
			padding: var(--space-xl) var(--space-md);
		}
	}

	/* Extra small screens */
	@media (max-width: 400px) {
		nav a {
			font-size: 1.25rem;
			padding: 14px 24px;
		}
	}

	/* Print styles - hide navigation and decorative elements */
	@media print {
		header,
		footer,
		.alpha-banner,
		.bg-gradient,
		.bg-grid,
		.bg-glow {
			display: none !important;
		}

		.app {
			background: white !important;
		}

		main {
			padding: 0 !important;
			margin: 0 !important;
		}

		:global(body) {
			background: white !important;
			color: black !important;
		}
	}
</style>
