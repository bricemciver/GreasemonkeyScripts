// ==UserScript==
// @name Amazon - Hide Sponsored
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Hide sponsored items from search results
// @license MIT
// @version 0.0.1
// @match https://amazon.com/*
// @match https://*.amazon.com/*
// @match https://amazon.co.uk/*
// @match https://*.amazon.co.uk/*
// @match https://amazon.ca/*
// @match https://*.amazon.ca/*
// @match https://amazon.de/*
// @match https://*.amazon.de/*
// @match https://amazon.fr/*
// @match https://*.amazon.fr/*
// @match https://amazon.es/*
// @match https://*.amazon.es/*
// @match https://amazon.it/*
// @match https://*.amazon.it/*
// @match https://amazon.co.jp/*
// @match https://*.amazon.co.jp/*
// @match https://amazon.cn/*
// @match https://*.amazon.cn/*
// @match https://amazon.com.br/*
// @match https://*.amazon.com.br/*
// @match https://amazon.in/*
// @match https://*.amazon.in/*
// @match https://amazon.com.mx/*
// @match https://*.amazon.com.mx/*
// @match https://amazon.com.au/*
// @match https://*.amazon.com.au/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// ==/UserScript==



/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/amazon-hide-sponsored/amazon-hide-sponsored.user.ts
  (() => {
    const findAndRemoveSponsoredItems = () => {
      const sponsoredItems = document.evaluate("//span[text()='Sponsored']", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      for (let i = 0; i < sponsoredItems.snapshotLength; i++) {
        const node = sponsoredItems.snapshotItem(i);
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          let parent = node;
          while (parent && !parent.hasAttribute("data-asin") && parent.parentElement) {
            parent = parent.parentElement;
          }
          if (parent && parent.hasAttribute("data-asin")) {
            parent.style.display = "none";
          }
        }
      }
    };
    findAndRemoveSponsoredItems();
  })();
})();
//# sourceMappingURL=amazon-hide-sponsored.user.js.map
