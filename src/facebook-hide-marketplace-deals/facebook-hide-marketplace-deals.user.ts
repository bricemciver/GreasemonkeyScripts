// ==UserScript==
// @name         Facebook Hide Marketplace Deals
// @version      0.0.1
// @description  Hide the sponsored deals that show up in marketplace searches
// @match        *://*.facebook.com/marketplace/*
// @grant        none
// @author       Brice McIver
// @license      MIT
// ==/UserScript==

// Options for the observer (which mutations to observe)
const config: MutationObserverInit = {
  childList: true,
  attributes: true,
  subtree: true,
};

// Callback function to execute when mutations are observed
const callback: MutationCallback = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList" && mutation.addedNodes.length) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const dealsLink = (
            node as HTMLElement
          ).querySelector<HTMLAnchorElement>("a[href*='tracking']");
          if (dealsLink) {
            dealsLink.parentElement?.remove();
          }
        }
      }
    } else if (
      mutation.type === "attributes" &&
      mutation.attributeName === "href" &&
      mutation.target.nodeType === Node.ELEMENT_NODE
    ) {
      const link = mutation.target as HTMLAnchorElement;
      if (link.href.includes("tracking")) {
        link.parentElement?.remove();
      }
    }
  }
};

// Create an observer instance linked to the callback function and observe
new MutationObserver(callback).observe(document, config);
