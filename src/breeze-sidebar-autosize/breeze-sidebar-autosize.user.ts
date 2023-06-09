// ==UserScript==
// @name         Breeze Sidebar Auto-size
// @namespace    http://bricemciver.com/
// @version      0.1
// @description  Size the sidebar to fit the width of the content
// @author       Brice McIver
// @match        https://*.breezechms.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=breezechms.com
// ==/UserScript==

const replaceCss = () => {
  const head = document.getElementsByTagName("head")[0];
  if (head) {
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.textContent =
      "@media (min-width: 992px) { .mainsail-ui .mainsail-side-nav.extra-wide { flex-basis: fit-content; max-width: fit-content; }}";
    head.appendChild(style);
  }
};

replaceCss();
