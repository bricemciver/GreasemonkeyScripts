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



"use strict";
(() => {
  // src/main/shawnee-mission-post-paywall-remover/shawnee-mission-post-paywall-remover.user.ts
  var targetNode = document.documentElement;
  var config = { childList: true, subtree: true, attributes: true };
  var callback = function(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.classList.contains("wkwp-paywall")) {
              element.setAttribute("style", "display: none");
            }
          }
        }
      }
      if (mutation.type === "attributes") {
        if (mutation.target.nodeType === Node.ELEMENT_NODE) {
          const element = mutation.target;
          if (element.classList.contains("wkwp-blur")) {
            element.classList.remove("wkwp-blur");
          }
        }
      }
    }
  };
  var observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
})();
//# sourceMappingURL=shawnee-mission-post-paywall-remover.user.js.map
