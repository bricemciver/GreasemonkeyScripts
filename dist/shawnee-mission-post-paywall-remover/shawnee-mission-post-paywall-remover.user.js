"use strict";
// ==UserScript==
// @name         Shawnee Mission Post Paywall Remover
// @namespace    bricemciver
// @description  Removes paywall restrictions from Shawnee Mission Post website
// @author       Brice McIver
// @license      MIT
// @version      0.1
// @match        https://shawneemissionpost.com/*
// @match        https://bluevalleypost.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shawneemissionpost.com
// @grant        none
// ==/UserScript==
{
    // Callback function to handle mutations
    var mutationCallback_1 = function (mutationsList, _observer) {
        for (var _i = 0, mutationsList_1 = mutationsList; _i < mutationsList_1.length; _i++) {
            var mutation = mutationsList_1[_i];
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (addedNode) {
                    if (addedNode.nodeType === Node.ELEMENT_NODE && addedNode.id === 'content-paywall-block') {
                        addedNode.remove();
                    }
                });
            }
            if (mutation.type === 'attributes' &&
                mutation.target.nodeType === Node.ELEMENT_NODE &&
                mutation.target.classList.contains('not-logged-in')) {
                mutation.target.classList.remove('not-logged-in');
            }
        }
    };
    var initObserver = function () {
        // Create a new observer instance with the callback function
        var observer = new MutationObserver(mutationCallback_1);
        // Target a specific node
        var entry = document.querySelector('div.entry-content');
        if (entry) {
            // Start observing the target node for specified mutations
            observer.observe(entry, {
                childList: true,
                subtree: true,
                attributeFilter: ['class'],
            });
        }
    };
    initObserver();
}
