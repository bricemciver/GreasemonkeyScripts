"use strict";
// ==UserScript==
// @name         Facebook Hide Marketplace Deals
// @namespace    bricemciver
// @description  Hide the sponsored deals that show up in marketplace searches
// @license      MIT
// @version      0.0.2
// @match        *://*.facebook.com/marketplace/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=facebook.com
// @grant        none
// ==/UserScript==
Object.defineProperty(exports, "__esModule", { value: true });
// Options for the observer (which mutations to observe)
const config = {
    childList: true,
    attributes: true,
    subtree: true,
};
const removeTracking = (node) => {
    var _a;
    if (node.nodeType === Node.ELEMENT_NODE) {
        const dealsLink = node.querySelector("a[href*='tracking']");
        if (dealsLink) {
            (_a = dealsLink.parentElement) === null || _a === void 0 ? void 0 : _a.remove();
        }
    }
};
// Callback function to execute when mutations are observed
const callback = mutationsList => {
    var _a;
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
            mutation.addedNodes.forEach(node => removeTracking(node));
        }
        if (mutation.type === 'attributes' && mutation.attributeName === 'href' && mutation.target.nodeType === Node.ELEMENT_NODE) {
            const link = mutation.target;
            if (link.href.includes('tracking')) {
                (_a = link.parentElement) === null || _a === void 0 ? void 0 : _a.remove();
            }
        }
    }
};
// Create an observer instance linked to the callback function and observe
new MutationObserver(callback).observe(document, config);
//# sourceMappingURL=facebook-hide-marketplace-deals.user.js.map