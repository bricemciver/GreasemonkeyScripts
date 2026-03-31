// ==UserScript==
// @name Facebook Hide Marketplace Deals
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Hide the sponsored deals that show up in marketplace searches
// @license MIT
// @version 0.0.2
// @match *://*.facebook.com/marketplace/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=facebook.com
// @grant none
// ==/UserScript==

"use strict";
(() => {
  // src/main/facebook-hide-marketplace-deals/facebook-hide-marketplace-deals.user.ts
  var FacebookHideMarketplaceDeals;
  ((FacebookHideMarketplaceDeals2) => {
    const config = {
      childList: true,
      attributes: true,
      subtree: true
    };
    const removeTracking = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const dealsLink = node.querySelector("a[href*='tracking']");
        if (dealsLink) {
          dealsLink.parentElement?.remove();
        }
      }
    };
    const callback = (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            removeTracking(node);
          }
        }
        if (mutation.type === "attributes" && mutation.attributeName === "href" && mutation.target.nodeType === Node.ELEMENT_NODE) {
          const link = mutation.target;
          if (link.href.includes("tracking")) {
            link.parentElement?.remove();
          }
        }
      }
    };
    FacebookHideMarketplaceDeals2.main = () => {
      new MutationObserver(callback).observe(document, config);
    };
  })(FacebookHideMarketplaceDeals || (FacebookHideMarketplaceDeals = {}));
  FacebookHideMarketplaceDeals.main();
})();
