"use strict";
// ==UserScript==
// @name         Shawnee Mission Post Paywall Remover
// @namespace    bricemciver
// @description  Removes paywall restrictions from Shawnee Mission Post website
// @author       Brice McIver
// @license      MIT
// @version      0.1
// @match        https://shawneemissionpost.com/*
// @match        https://johnsoncountypost.com/*
// @match        https://bluevalleypost.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=johnsoncountypost.com
// @grant        none
// ==/UserScript==
{
    // Select the node that should be monitored
    var targetNode = document.documentElement;
    // Options for the observer (which mutations to observe)
    var config = { childList: true, subtree: true, attributes: true };
    // Callback function to execute when mutations are observed
    var callback = function (mutationsList, observer) {
        for (var _i = 0, mutationsList_1 = mutationsList; _i < mutationsList_1.length; _i++) {
            var mutation = mutationsList_1[_i];
            if (mutation.type === 'childList') {
                for (var _a = 0, _b = Array.from(mutation.addedNodes); _a < _b.length; _a++) {
                    var node = _b[_a];
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        var element = node;
                        if (element.classList.contains('wkwp-paywall')) {
                            element.setAttribute('style', 'display: none');
                        }
                    }
                }
            }
            if (mutation.type === 'attributes') {
                if (mutation.target.nodeType === Node.ELEMENT_NODE) {
                    var element = mutation.target;
                    if (element.classList.contains('wkwp-blur')) {
                        element.classList.remove('wkwp-blur');
                    }
                }
            }
        }
    };
    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
}
