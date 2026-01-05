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

/* jshint esversion: 6 */
"use strict";
(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/main/ancestry-premium-content-blocker/ancestry-premium-content-blocker.user.ts
  var AncestryPremiumContentBlocker;
  ((AncestryPremiumContentBlocker2) => {
    const CACHE_NAME = "ancestry-link-cache";
    const CACHE_DURATION = 3 * 24 * 60 * 60 * 1e3;
    const SIGNUP_INDICATORS = [
      "/account/signin",
      "/secure/login",
      "subscribe",
      "membership",
      "cs/offers"
    ];
    const isSignupPage = (url, content) => {
      return SIGNUP_INDICATORS.some(
        (indicator) => url.toLowerCase().includes(indicator) || content.toLowerCase().includes(indicator)
      );
    };
    const getCachedResult = (url) => __async(null, null, function* () {
      try {
        const cache = yield caches.open(CACHE_NAME);
        const response = yield cache.match(url);
        if (!response) {
          return null;
        }
        const data = yield response.json();
        if (Date.now() - data.timestamp > CACHE_DURATION) {
          yield cache.delete(url);
          return null;
        }
        return data;
      } catch (e) {
        console.error("Error reading cache:", e);
        return null;
      }
    });
    const cacheResult = (url, isSignup) => __async(null, null, function* () {
      try {
        const cache = yield caches.open(CACHE_NAME);
        const data = {
          url,
          isSignupPage: isSignup,
          timestamp: Date.now()
        };
        const response = new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" }
        });
        yield cache.put(url, response);
      } catch (e) {
        console.error("Error writing to cache:", e);
      }
    });
    const checkLink = (link) => __async(null, null, function* () {
      const url = link.href;
      if (!url.startsWith("http") || !url.includes("ancestry.com")) {
        return;
      }
      const cached = yield getCachedResult(url);
      if (cached) {
        if (cached.isSignupPage) {
          disableLink(link);
        }
        return;
      }
      try {
        const response = yield fetch(url, {
          method: "HEAD",
          redirect: "follow",
          credentials: "include"
        });
        const finalUrl = response.url;
        const isSignup = isSignupPage(finalUrl, "");
        if (!isSignup && response.ok) {
          const fullResponse = yield fetch(url, {
            redirect: "follow",
            credentials: "include"
          });
          const text = yield fullResponse.text();
          const isSignupContent = isSignupPage(fullResponse.url, text);
          yield cacheResult(url, isSignupContent);
          if (isSignupContent) {
            disableLink(link);
          }
        } else {
          yield cacheResult(url, isSignup);
          if (isSignup) {
            disableLink(link);
          }
        }
      } catch (e) {
        console.error(`Error checking link ${url}:`, e);
      }
    });
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
    const processLinks = () => __async(null, null, function* () {
      const links = document.querySelectorAll("a[href]");
      console.log(`Processing ${links.length} links on page`);
      const batchSize = 5;
      for (let i = 0; i < links.length; i += batchSize) {
        const batch = Array.from(links).slice(i, i + batchSize);
        yield Promise.all(batch.map((link) => checkLink(link)));
        yield new Promise((resolve) => setTimeout(resolve, 100));
      }
      console.log("Finished processing links");
    });
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
    AncestryPremiumContentBlocker2.init = () => __async(null, null, function* () {
      console.log("Ancestry Link Checker initialized");
      yield processLinks();
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  })(AncestryPremiumContentBlocker || (AncestryPremiumContentBlocker = {}));
  AncestryPremiumContentBlocker.init();
})();
//# sourceMappingURL=ancestry-premium-content-blocker.user.js.map
