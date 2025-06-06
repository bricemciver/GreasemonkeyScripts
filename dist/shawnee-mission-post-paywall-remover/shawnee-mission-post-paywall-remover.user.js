// ==UserScript==
// @name Shawnee Mission Post Paywall Remover
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Removes paywall restrictions from Shawnee Mission Post website
// @license MIT
// @version 0.1
// @match https://shawneemissionpost.com/*
// @match https://johnsoncountypost.com/*
// @match https://bluevalleypost.com/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=johnsoncountypost.com
// @grant none
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/shawnee-mission-post-paywall-remover/shawnee-mission-post-paywall-remover.user.ts
  var ShawneeMissionPostPaywallRemover;
  ((ShawneeMissionPostPaywallRemover2) => {
    const targetNode = document.documentElement;
    const config = { childList: true, subtree: true, attributes: true };
    const callback = (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          hidePaywallElement(mutation);
        }
        if (mutation.type === "attributes") {
          unblurElement(mutation);
        }
      }
    };
    const unblurElement = (mutation) => {
      if (mutation.target.nodeType === Node.ELEMENT_NODE) {
        const element = mutation.target;
        if (element.classList.contains("wkwp-blur")) {
          element.classList.remove("wkwp-blur");
        }
      }
    };
    const hidePaywallElement = (mutation) => {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node;
          if (element.classList.contains("wkwp-paywall")) {
            element.setAttribute("style", "display: none");
          }
        }
      }
    };
    ShawneeMissionPostPaywallRemover2.main = () => {
      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);
    };
  })(ShawneeMissionPostPaywallRemover || (ShawneeMissionPostPaywallRemover = {}));
  ShawneeMissionPostPaywallRemover.main();
})();
//# sourceMappingURL=shawnee-mission-post-paywall-remover.user.js.map
