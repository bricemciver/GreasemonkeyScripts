"use strict";
// ==UserScript==
// @name         Breeze Sidebar Auto-size
// @namespace    bricemciver
// @description  Size the sidebar to fit the width of the content
// @license      MIT
// @version      0.2
// @match        https://*.breezechms.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=breezechms.com
// ==/UserScript==
{
    const replaceCss = () => {
        const head = document.getElementsByTagName('head')[0];
        const style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.textContent =
            '@media (min-width: 992px) { .mainsail-ui .mainsail-side-nav.extra-wide { flex-basis: fit-content; max-width: fit-content; }}';
        head.appendChild(style);
    };
    replaceCss();
}
