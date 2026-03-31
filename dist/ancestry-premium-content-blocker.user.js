// ==UserScript==
// @name         Ancestry Premium Content Blocker
// @namespace    https://github.com/bricemciver/GreasemonekeyScripts
// @version      1.0.1
// @author       Brice McIver
// @description  Preload links and disable those that redirect to signup pages
// @license      ISC
// @match        https://*.ancestry.com/*
// @match        https://ancestry.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
var CACHE_NAME = "ancestry-link-cache";
	var CACHE_DURATION = 4320 * 60 * 1e3;
	var SIGNUP_INDICATORS = [
		"/account/signin",
		"/secure/login",
		"subscribe",
		"membership",
		"cs/offers"
	];
	var isSignupPage = (url, content) => {
		return SIGNUP_INDICATORS.some((indicator) => url.toLowerCase().includes(indicator) || content.toLowerCase().includes(indicator));
	};
	var getCachedResult = async (url) => {
		try {
			const cache = await caches.open(CACHE_NAME);
			const response = await cache.match(url);
			if (!response) return null;
			const data = await response.json();
			if (Date.now() - data.timestamp > CACHE_DURATION) {
				await cache.delete(url);
				return null;
			}
			return data;
		} catch (e) {
			console.error("Error reading cache:", e);
			return null;
		}
	};
	var cacheResult = async (url, isSignup) => {
		try {
			const cache = await caches.open(CACHE_NAME);
			const response = new Response(JSON.stringify({
				url,
				isSignupPage: isSignup,
				timestamp: Date.now()
			}), { headers: { "Content-Type": "application/json" } });
			await cache.put(url, response);
		} catch (e) {
			console.error("Error writing to cache:", e);
		}
	};
	var checkLink = async (link) => {
		const url = link.href;
		if (!url.startsWith("http") || !url.includes("ancestry.com")) return;
		const cached = await getCachedResult(url);
		if (cached) {
			if (cached.isSignupPage) disableLink(link);
			return;
		}
		try {
			const response = await fetch(url, {
				method: "HEAD",
				redirect: "follow",
				credentials: "include"
			});
			const finalUrl = response.url;
			const isSignup = isSignupPage(finalUrl, "");
			if (!isSignup && response.ok) {
				const fullResponse = await fetch(url, {
					redirect: "follow",
					credentials: "include"
				});
				const text = await fullResponse.text();
				const isSignupContent = isSignupPage(fullResponse.url, text);
				await cacheResult(url, isSignupContent);
				if (isSignupContent) disableLink(link);
			} else {
				await cacheResult(url, isSignup);
				if (isSignup) disableLink(link);
			}
		} catch (e) {
			console.error(`Error checking link ${url}:`, e);
		}
	};
	var disableLink = (link) => {
		link.style.opacity = "0.5";
		link.style.cursor = "not-allowed";
		link.style.textDecoration = "line-through";
		link.style.pointerEvents = "none";
		link.title = "This link requires a subscription";
		link.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
		}, true);
		if (!link.querySelector(".signup-indicator")) {
			const indicator = document.createElement("span");
			indicator.className = "signup-indicator";
			indicator.textContent = " 🔒";
			indicator.style.fontSize = "0.8em";
			link.appendChild(indicator);
		}
	};
	var processLinks = async () => {
		const links = document.querySelectorAll("a[href]");
		console.log(`Processing ${links.length} links on page`);
		const batchSize = 5;
		for (let i = 0; i < links.length; i += batchSize) {
			const batch = Array.from(links).slice(i, i + batchSize);
			await Promise.all(batch.map((link) => checkLink(link)));
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		console.log("Finished processing links");
	};
	var processNode = (node) => {
		if (node.nodeType === Node.ELEMENT_NODE) {
			const element = node;
			if (element.tagName === "A") checkLink(element);
			const links = element.querySelectorAll("a[href]");
			for (const link of links) checkLink(link);
		}
	};
	var observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) for (const node of mutation.addedNodes) processNode(node);
	});
	var init = async () => {
		console.log("Ancestry Link Checker initialized");
		await processLinks();
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	};
	init();
})();