// ==UserScript==
// @name         Kinja Deals Keyboard Navigation
// @namespace    bricemciver
// @description  Use 'j' and 'k' keys for navigation of post content
// @license      MIT
// @version      0.0.8
// @match        *://*.theinventory.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=theinventory.com
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
    const headTags = [];
    let pos = -1;
    const addGlobalStyle = (css) => {
        const head = document.getElementsByTagName('head')[0];
        const style = document.createElement('style');
        style.innerHTML = css;
        head.appendChild(style);
    };
    const keyPressed = (event) => {
        if (event.code === 'KeyK' || event.code === 'KeyJ') {
            if (headTags[pos]) {
                headTags[pos].className = headTags[pos].className.replace(' selected', '');
            }
            if ('KeyK' === event.code) {
                pos--;
            }
            if ('KeyJ' === event.code) {
                pos++;
            }
            // wrap around
            if (pos >= headTags.length) {
                pos = 0;
            }
            if (pos < 0) {
                pos = headTags.length - 1;
            }
            headTags[pos].className = headTags[pos].className + ' selected';
            headTags[pos].scrollIntoView();
            window.scrollBy(0, -17);
        }
    };
    const removeCruft = () => {
        document.querySelectorAll('.js_movable_ad_slot').forEach(element => element.remove());
        document.querySelectorAll('.connatix-container').forEach(element => element.remove());
        document.querySelectorAll(":contains('G/O Media may get a commission')").forEach(element => { var _a; return (_a = element.closest('aside')) === null || _a === void 0 ? void 0 : _a.remove(); });
        document.querySelectorAll('#sidebar_wrapper').forEach(element => { var _a; return (_a = element.closest('aside')) === null || _a === void 0 ? void 0 : _a.remove(); });
    };
    const createEntries = (containerDiv) => {
        let newElement = null;
        Array.from(containerDiv.children).forEach(element => {
            // this is the beginning or end or a section
            if (element.tagName === 'HR' || element.tagName === 'H3') {
                if (newElement) {
                    element.insertAdjacentElement('beforebegin', newElement);
                }
                newElement = document.createElement('div');
                newElement.className = 'inlineFrame';
            }
            else if (newElement) {
                newElement.append(element);
            }
        });
    };
    const addListeners = (containerDiv) => {
        // get all section headers
        headTags.push(containerDiv);
        headTags.push(...Array.from(containerDiv.querySelectorAll('div.inlineFrame, h3, h4')));
        document.addEventListener('keydown', keyPressed);
    };
    // remove unneeded content
    removeCruft();
    // find main content
    const mainDiv = document.querySelector('.js_post-content #js_movable-ads-post-contents');
    if (mainDiv) {
        // add necessary styles
        addGlobalStyle('div.inlineFrame { margin-top:17px; margin-bottom:17px; padding:33px; border-radius:3px; border: 1px solid rgba(0,0,0,0.05) }');
        addGlobalStyle('div.inlineFrame.selected { border: 1px solid rgba(0, 0, 0, 0.15) }');
        addGlobalStyle('main { width:100% !important }');
        // create entries
        createEntries(mainDiv);
        // add keyboard navigation
        addListeners(mainDiv);
    }
});
//# sourceMappingURL=kinja-deals-keyboard-navigation.user.js.map