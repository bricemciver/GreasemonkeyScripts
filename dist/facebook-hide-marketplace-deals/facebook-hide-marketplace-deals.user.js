"use strict";
// ==UserScript==
// @name         Facebook Hide Marketplace Deals
// @namespace    bricemciver
// @description  Hide the sponsored deals that show up in marketplace searches
// @author       Brice McIver
// @license      MIT
// @version      0.0.2
// @match        *://*.facebook.com/marketplace/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=facebook.com
// @grant        none
// ==/UserScript==
{
    // Options for the observer (which mutations to observe)
    var config = {
        childList: true,
        attributes: true,
        subtree: true,
    };
    var removeTracking_1 = function (node) {
        var _a;
        if (node.nodeType === Node.ELEMENT_NODE) {
            var dealsLink = node.querySelector("a[href*='tracking']");
            if (dealsLink) {
                (_a = dealsLink.parentElement) === null || _a === void 0 ? void 0 : _a.remove();
            }
        }
    };
    // Callback function to execute when mutations are observed
    var callback = function (mutationsList) {
        var _a;
        for (var _i = 0, mutationsList_1 = mutationsList; _i < mutationsList_1.length; _i++) {
            var mutation = mutationsList_1[_i];
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function (node) { return removeTracking_1(node); });
            }
            if (mutation.type === 'attributes' && mutation.attributeName === 'href' && mutation.target.nodeType === Node.ELEMENT_NODE) {
                var link = mutation.target;
                if (link.href.includes('tracking')) {
                    (_a = link.parentElement) === null || _a === void 0 ? void 0 : _a.remove();
                }
            }
        }
    };
    // Create an observer instance linked to the callback function and observe
    new MutationObserver(callback).observe(document, config);
}
