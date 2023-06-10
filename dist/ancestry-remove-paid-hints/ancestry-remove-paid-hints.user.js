// ==UserScript==
// @name         Ancestry.com - Remove paid hints
// @namespace    bricemcvier
// @description  Removes paid hints on the "All Hints" page and on individual person pages
// @license      MIT
// @version      0.0.3
// @match        *://*.ancestry.com/*
// @match        *://*.ancestry.de/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ancestry.com
// @run-at       document-end
// ==/UserScript==
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const findId = (href) => {
        let id = '';
        let dbid = RegExp(/dbid=(\d*)&/).exec(href);
        if (dbid && dbid.length > 1) {
            id = dbid[1];
        }
        if (!dbid) {
            dbid = RegExp(/otid=(\d*)&/).exec(href);
            if (dbid && dbid.length > 1) {
                id = dbid[1];
            }
        }
        if (!dbid) {
            id = href;
        }
        return id;
    };
    const removeTreeByClass = (targetNode, className1, className2) => {
        let pNode = targetNode.parentElement;
        while (pNode && (!pNode.className || (pNode.className.indexOf(className1) === -1 && pNode.className.indexOf(className2) === -1))) {
            pNode = pNode.parentElement;
        }
        if (pNode) {
            pNode.remove();
        }
    };
    const addDbidFromJoinPage = () => {
        // If we do end up on join page, add that dbid to the list of paid databases
        if (window.location.pathname.indexOf('join') !== -1) {
            const dbid = findId(window.location.href);
            localStorage.setItem(dbid, 'true');
        }
    };
    const removeFromLocalStorage = (response) => {
        var _a;
        const link = (_a = response.context) === null || _a === void 0 ? void 0 : _a.href;
        if (link) {
            localStorage.removeItem(findId(link));
        }
    };
    const addLinkToDb = (response) => {
        var _a;
        const link = (_a = response.context) === null || _a === void 0 ? void 0 : _a.href;
        if (link) {
            const dbid = findId(link);
            if (response.finalUrl.includes('join')) {
                removeTreeByClass(response.context, 'typeContent', 'hntTabHintCard');
                localStorage.setItem(dbid, 'true');
            }
            else {
                localStorage.setItem(dbid, 'false');
            }
        }
    };
    const removePaidHints = () => {
        // Options for the observer (which mutations to observe)
        const config = { attributes: true, subtree: true };
        // Callback function to execute when mutations are observed
        const callback = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.attributeName === 'href') {
                    const element = mutation.target;
                    if (element.href.includes('phstart=default&usePUBJs=true') && element.className.includes('ancBtn')) {
                        // check if we have seen this database before before trying network call
                        const dbid = findId(element.href);
                        const paidInd = localStorage.getItem(dbid);
                        if ('true' === paidInd) {
                            removeTreeByClass(element, 'typeContent', 'hntTabHintCard');
                        }
                        else if (paidInd == null) {
                            const req = {
                                method: 'GET',
                                url: element.href,
                                context: element,
                                onload: response => addLinkToDb(response),
                                ontimeout: response => removeFromLocalStorage(response),
                                onerror: response => removeFromLocalStorage(response),
                                onabort: response => removeFromLocalStorage(response),
                            };
                            GM.xmlHttpRequest(req);
                        }
                    }
                }
            }
        };
        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);
        observer.observe(document.body, config);
    };
    addDbidFromJoinPage();
    removePaidHints();
});
//# sourceMappingURL=ancestry-remove-paid-hints.user.js.map