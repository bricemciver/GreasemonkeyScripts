"use strict";
// ==UserScript==
// @name         Facebook Hide Marketplace Deals
// @version      0.0.1
// @description  Hide the sponsored deals that show up in marketplace searches
// @match        *://*.facebook.com/marketplace/*
// @grant        none
// @author       Brice McIver
// @license      MIT
// ==/UserScript==
Object.defineProperty(exports, "__esModule", { value: true });
// Options for the observer (which mutations to observe)
const config = {
    childList: true,
    attributes: true,
    subtree: true,
};
// Callback function to execute when mutations are observed
const callback = (mutationsList, observer) => {
    var _a, _b;
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
            for (const node of Array.from(mutation.addedNodes)) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const dealsLink = node.querySelector("a[href*='tracking']");
                    if (dealsLink) {
                        (_a = dealsLink.parentElement) === null || _a === void 0 ? void 0 : _a.remove();
                    }
                }
            }
        }
        else if (mutation.type === "attributes" &&
            mutation.attributeName === "href" &&
            mutation.target.nodeType === Node.ELEMENT_NODE) {
            const link = mutation.target;
            if (link.href.includes("tracking")) {
                (_b = link.parentElement) === null || _b === void 0 ? void 0 : _b.remove();
            }
        }
    }
};
// Create an observer instance linked to the callback function and observe
new MutationObserver(callback).observe(document, config);
//# sourceMappingURL=facebook-hide-marketplace-deals.user.js.map