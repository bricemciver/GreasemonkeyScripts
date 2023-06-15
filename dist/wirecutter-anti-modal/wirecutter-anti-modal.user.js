"use strict";
// ==UserScript==
// @name         Wirecutter Anti-modal
// @namespace    bricemciver
// @description  Stop modals asking you to register before viewing articles
// @author       Brice McIver
// @license      MIT
// @version      0.0.2
// @match        https://www.nytimes.com/wirecutter/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nytimes.com
// @grant        none
// ==/UserScript==
{
    // keep track of actions so we can disable observer at some point
    var modalRemoved_1 = false;
    var overflowFixed_1 = false;
    var config_1 = {
        attributes: true,
        childList: true,
        subtree: true,
    };
    var elementToObserve_1 = document.querySelector('body');
    var removePaywallModal_1 = function (mutation) {
        if (!modalRemoved_1 && mutation.type === 'childList') {
            mutation.addedNodes.forEach(function (item) {
                var element = item;
                if (element.id === 'modal-portal-regiwall') {
                    element.remove();
                    modalRemoved_1 = true;
                }
            });
        }
    };
    var removeScrollLock_1 = function (mutation) {
        if (!overflowFixed_1 && mutation.type === 'attributes' && mutation.attributeName === 'class') {
            var element = mutation.target;
            if (element.tagName === 'BODY') {
                element.className = '';
                overflowFixed_1 = true;
            }
        }
    };
    var startObserver = function () {
        var callback = function (mutationsList, observer) {
            mutationsList.forEach(function (mutation) {
                removePaywallModal_1(mutation);
                removeScrollLock_1(mutation);
                // if we've fixed the issues, stop observing
                if (modalRemoved_1 && overflowFixed_1) {
                    observer.disconnect();
                }
            });
        };
        // Create an observer instance linked to the callback function and start observing the target node for configured mutations
        if (elementToObserve_1) {
            new MutationObserver(callback).observe(elementToObserve_1, config_1);
        }
    };
    startObserver();
}
