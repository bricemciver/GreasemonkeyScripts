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
