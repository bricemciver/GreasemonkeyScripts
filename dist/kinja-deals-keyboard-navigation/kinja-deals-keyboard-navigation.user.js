"use strict";
// ==UserScript==
// @name         Kinja Deals Keyboard Navigation
// @namespace    bricemciver
// @description  Use 'j' and 'k' keys for navigation of post content
// @author       Brice McIver
// @license      MIT
// @version      0.0.8
// @match        *://*.theinventory.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=theinventory.com
// @grant        none
// ==/UserScript==
{
    var headTags_1 = [];
    var pos_1 = -1;
    var addGlobalStyle = function (css) {
        var head = document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.innerHTML = css;
        head.appendChild(style);
    };
    var keyPressed_1 = function (event) {
        if (event.code === 'KeyK' || event.code === 'KeyJ') {
            if (headTags_1[pos_1]) {
                headTags_1[pos_1].className = headTags_1[pos_1].className.replace(' selected', '');
            }
            if ('KeyK' === event.code) {
                pos_1--;
            }
            if ('KeyJ' === event.code) {
                pos_1++;
            }
            // wrap around
            if (pos_1 >= headTags_1.length) {
                pos_1 = 0;
            }
            if (pos_1 < 0) {
                pos_1 = headTags_1.length - 1;
            }
            headTags_1[pos_1].className = headTags_1[pos_1].className + ' selected';
            headTags_1[pos_1].scrollIntoView();
        }
    };
    var removeCruft = function () {
        document.querySelectorAll('.js_movable_ad_slot').forEach(function (element) { return element.remove(); });
        document.querySelectorAll('.connatix-container').forEach(function (element) { return element.remove(); });
        Array.from(document.getElementsByTagName('span'))
            .filter(function (item) { return item.textContent === 'G/O Media may get a commission'; })
            .forEach(function (element) { var _a; return (_a = element.closest('aside')) === null || _a === void 0 ? void 0 : _a.remove(); });
        document.querySelectorAll('#sidebar_wrapper').forEach(function (element) { var _a; return (_a = element.closest('aside')) === null || _a === void 0 ? void 0 : _a.remove(); });
    };
    var createEntries = function (containerDiv) {
        var newElement = null;
        Array.from(containerDiv.children).forEach(function (element) {
            var _a;
            // this is the beginning or end or a section
            if (element.tagName === 'H2' && ((_a = element.textContent) === null || _a === void 0 ? void 0 : _a.length) && element.textContent.length > 0) {
                newElement = document.createElement('div');
                newElement.className = 'inlineFrame';
                element.insertAdjacentElement('beforebegin', newElement);
                newElement.append(element);
            }
            else if (newElement) {
                newElement.append(element);
            }
        });
    };
    var addListeners = function (containerDiv) {
        // get all section headers
        headTags_1.push(containerDiv);
        headTags_1.push.apply(headTags_1, Array.from(containerDiv.querySelectorAll('div.inlineFrame, h3, h4')));
        document.addEventListener('keydown', keyPressed_1);
    };
    // remove unneeded content
    removeCruft();
    // find main content
    var mainDiv = document.querySelector('.js_post-content .js_commerce-inset-grid');
    if (mainDiv) {
        // add necessary styles
        addGlobalStyle('div.inlineFrame { margin-top:17px; margin-bottom:17px; padding:33px; border-radius:3px; border: 1px solid rgba(0,0,0,0.05) }');
        addGlobalStyle('div.inlineFrame.selected { border: 1px solid rgba(0, 0, 0, 0.15) }');
        addGlobalStyle('main { width:100% !important }');
        if (mainDiv.parentElement) {
            // create entries
            createEntries(mainDiv.parentElement);
            // add keyboard navigation
            addListeners(mainDiv.parentElement);
        }
    }
}
