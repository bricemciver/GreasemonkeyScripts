"use strict";
(() => {
  // src/main/facebook-hide-marketplace-deals/facebook-hide-marketplace-deals.user.ts
  var config = {
    childList: true,
    attributes: true,
    subtree: true
  };
  var removeTracking = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const dealsLink = node.querySelector("a[href*='tracking']");
      if (dealsLink) {
        dealsLink.parentElement?.remove();
      }
    }
  };
  var callback = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => removeTracking(node));
      }
      if (mutation.type === "attributes" && mutation.attributeName === "href" && mutation.target.nodeType === Node.ELEMENT_NODE) {
        const link = mutation.target;
        if (link.href.includes("tracking")) {
          link.parentElement?.remove();
        }
      }
    }
  };
  new MutationObserver(callback).observe(document, config);
})();
//# sourceMappingURL=facebook-hide-marketplace-deals.user.js.map
