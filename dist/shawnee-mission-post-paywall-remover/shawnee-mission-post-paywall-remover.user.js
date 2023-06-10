// ==UserScript==
// @name         Shawnee Mission Post Paywall Remover
// @namespace    bricemciver
// @description  Removes paywall restrictions from Shawnee Mission Post website
// @license      MIT
// @version      0.1
// @match        https://shawneemissionpost.com/*
// @match        https://bluevalleypost.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shawneemissionpost.com
// @grant        none
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
    Array.from(document.getElementsByClassName('not-logged-in')).forEach(element => element.classList.remove('not-logged-in'));
});
//# sourceMappingURL=shawnee-mission-post-paywall-remover.user.js.map