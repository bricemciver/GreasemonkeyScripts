// ==UserScript==
// @name         Wirecutter Anti-modal
// @description  Stop modals asking you to register before viewing articles
// @version      0.0.1
// @author       Brice McIver
// @match        https://www.nytimes.com/wirecutter/*
// @license      MIT
// @grant        none
// ==/UserScript==
// keep track of actions so we can disable observer at some point
let modalRemoved = false;
let overflowFixed = false;
const config = {
    attributes: true,
    childList: true,
    subtree: true,
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
    if (!overflowFixed &&
        mutation.type === "attributes" &&
        mutation.attributeName === "class") {
        const element = mutation.target;
        if (element.tagName === "BODY") {
            element.className = "";
            overflowFixed = true;
        }
    }
};
const startObserver = () => {
    const callback = (mutationsList, observer) => {
        mutationsList.forEach((mutation) => {
            removePaywallModal(mutation);
            removeScrollLock(mutation);
            // if we've fixed the issues, stop observing
            if (modalRemoved && overflowFixed) {
                observer.disconnect();
            }
        });
    };
    // Create an observer instance linked to the callback function and start observing the target node for configured mutations
    if (elementToObserve) {
        new MutationObserver(callback).observe(elementToObserve, config);
    }
};
startObserver();
export {};
//# sourceMappingURL=wirecutter-anti-modal.user.js.map