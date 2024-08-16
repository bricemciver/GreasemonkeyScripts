// ==UserScript==
// @name Kansas City Star Anti-Annoy
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Remove annoyances for non-paid users of kansascity.com
// @license MIT
// @version 0.0.1
// @author Brice McIver <github@bricemciver.com>
// @copyright 2024 Brice McIver
// @match https://www.kansascity.com/*
// @icon https://icons.duckduckgo.com/ip3/kansascity.com.ico
// @grant none
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/kansas-city-star-anti-annoy/kansas-city-star-anti-annoy.user.ts
  var KansasCityStarAntiAnnoy;
  ((KansasCityStarAntiAnnoy2) => {
    KansasCityStarAntiAnnoy2.hidePaywall = () => {
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          record.addedNodes.forEach((addedNode) => {
            if (addedNode.nodeName === "MCC-PAYWALL") {
              if (addedNode.parentNode) {
                addedNode.parentNode.removeChild(addedNode);
              }
            }
          });
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    };
  })(KansasCityStarAntiAnnoy || (KansasCityStarAntiAnnoy = {}));
  KansasCityStarAntiAnnoy.hidePaywall();
})();
//# sourceMappingURL=kansas-city-star-anti-annoy.user.js.map
