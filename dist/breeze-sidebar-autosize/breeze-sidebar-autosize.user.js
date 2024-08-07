// ==UserScript==
// @name Breeze Sidebar Auto-size
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Size the sidebar to fit the width of the content
// @license MIT
// @version 0.2
// @match https://*.breezechms.com/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=breezechms.com
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/breeze-sidebar-autosize/breeze-sidebar-autosize.user.ts
  var BreezeSidebarAutosize;
  ((BreezeSidebarAutosize2) => {
    BreezeSidebarAutosize2.replaceCss = () => {
      const head = document.getElementsByTagName("head")[0];
      const style = document.createElement("style");
      style.setAttribute("type", "text/css");
      style.textContent = "@media (min-width: 992px) { .mainsail-ui .mainsail-side-nav.extra-wide { flex-basis: fit-content; max-width: fit-content; }}";
      head.appendChild(style);
    };
  })(BreezeSidebarAutosize || (BreezeSidebarAutosize = {}));
  BreezeSidebarAutosize.replaceCss();
})();
//# sourceMappingURL=breeze-sidebar-autosize.user.js.map
