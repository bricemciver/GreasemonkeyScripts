// ==UserScript==
// @name         Breeze Sidebar Auto-size
// @namespace    bricemciver
// @description  Size the sidebar to fit the width of the content
// @license      MIT
// @version      0.2
// @match        https://*.breezechms.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=breezechms.com
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
    const replaceCss = () => {
        const head = document.getElementsByTagName('head')[0];
        const style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.textContent =
            '@media (min-width: 992px) { .mainsail-ui .mainsail-side-nav.extra-wide { flex-basis: fit-content; max-width: fit-content; }}';
        head.appendChild(style);
    };
    replaceCss();
});
//# sourceMappingURL=breeze-sidebar-autosize.user.js.map