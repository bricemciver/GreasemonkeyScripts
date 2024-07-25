// ==UserScript==
// @name Wirecutter Anti-modal
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Stop modals asking you to register before viewing articles
// @license MIT
// @version 0.0.2
// @match https://www.nytimes.com/wirecutter/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=nytimes.com
// @grant none
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/wirecutter-anti-modal/wirecutter-anti-modal.user.ts
  var WirecutterAntiModal;
  ((WirecutterAntiModal2) => {
    let modalRemoved = false;
    let overflowFixed = false;
    const config = {
      attributes: true,
      childList: true,
      subtree: true
    };
    const elementToObserve = document.querySelector("body");
    const removePaywallModal = (mutation) => {
      if (!modalRemoved && mutation.type === "childList") {
        mutation.addedNodes.forEach((item) => {
          const element = item;
          if (element.id === "modal-portal-regiwall") {
            element.remove();
            modalRemoved = true;
          }
        });
      }
    };
    const removeScrollLock = (mutation) => {
      if (!overflowFixed && mutation.type === "attributes" && mutation.attributeName === "class") {
        const element = mutation.target;
        if (element.tagName === "BODY") {
          element.className = "";
          overflowFixed = true;
        }
      }
    };
    WirecutterAntiModal2.startObserver = () => {
      const callback = (mutationsList, observer) => {
        mutationsList.forEach((mutation) => {
          removePaywallModal(mutation);
          removeScrollLock(mutation);
          if (modalRemoved && overflowFixed) {
            observer.disconnect();
          }
        });
      };
      if (elementToObserve) {
        new MutationObserver(callback).observe(elementToObserve, config);
      }
    };
  })(WirecutterAntiModal || (WirecutterAntiModal = {}));
  WirecutterAntiModal.startObserver();
})();
//# sourceMappingURL=wirecutter-anti-modal.user.js.map
