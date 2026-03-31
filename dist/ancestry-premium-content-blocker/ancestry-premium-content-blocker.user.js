// ==UserScript==
// @name Ancestry Premium Content Blocker
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @version 1.0.0
// @description Preload links and disable those that redirect to signup pages
// @match https://*.ancestry.com/*
// @match https://ancestry.com/*
// @grant none
// @run-at document-idle
// ==/UserScript==

"use strict";
(() => {
  // src/main/ancestry-premium-content-blocker/ancestry-premium-content-blocker.user.ts
  var AncestryPremiumContentBlocker;
  ((AncestryPremiumContentBlocker2) => {
    const CACHE_NAME = "ancestry-link-cache";
    const CACHE_DURATION = 3 * 24 * 60 * 60 * 1e3;
    const SIGNUP_INDICATORS = ["/account/signin", "/secure/login", "subscribe", "membership", "cs/offers"];
    const isSignupPage = (url, content) => {
      return SIGNUP_INDICATORS.some(
        (indicator) => url.toLowerCase().includes(indicator) || content.toLowerCase().includes(indicator)
      );
    };
    const getCachedResult = async (url) => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(url);
        if (!response) {
          return null;
        }
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
    const cacheResult = async (url, isSignup) => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const data = {
          url,
          isSignupPage: isSignup,
          timestamp: Date.now()
        };
        const response = new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" }
        });
        await cache.put(url, response);
      } catch (e) {
        console.error("Error writing to cache:", e);
      }
    };
    const checkLink = async (link) => {
      const url = link.href;
      if (!url.startsWith("http") || !url.includes("ancestry.com")) {
        return;
      }
      const cached = await getCachedResult(url);
      if (cached) {
        if (cached.isSignupPage) {
          disableLink(link);
        }
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
          if (isSignupContent) {
            disableLink(link);
          }
        } else {
          await cacheResult(url, isSignup);
          if (isSignup) {
            disableLink(link);
          }
        }
      } catch (e) {
        console.error(`Error checking link ${url}:`, e);
      }
    };
    const disableLink = (link) => {
      link.style.opacity = "0.5";
      link.style.cursor = "not-allowed";
      link.style.textDecoration = "line-through";
      link.style.pointerEvents = "none";
      link.title = "This link requires a subscription";
      link.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        true
      );
      if (!link.querySelector(".signup-indicator")) {
        const indicator = document.createElement("span");
        indicator.className = "signup-indicator";
        indicator.textContent = " 🔒";
        indicator.style.fontSize = "0.8em";
        link.appendChild(indicator);
      }
    };
    const processLinks = async () => {
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
    const processNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node;
        if (element.tagName === "A") {
          checkLink(element);
        }
        const links = element.querySelectorAll("a[href]");
        for (const link of links) {
          checkLink(link);
        }
      }
    };
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          processNode(node);
        }
      }
    });
    AncestryPremiumContentBlocker2.init = async () => {
      console.log("Ancestry Link Checker initialized");
      await processLinks();
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    };
  })(AncestryPremiumContentBlocker || (AncestryPremiumContentBlocker = {}));
  AncestryPremiumContentBlocker.init();
})();
//# sourceMappingURL=ancestry-premium-content-blocker.user.js.map
