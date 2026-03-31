// ==UserScript==
// @name         Breeze Sidebar Auto-size
// @namespace    https://github.com/bricemciver/GreasemonekeyScripts
// @version      1.0.1
// @author       Brice McIver
// @description  Size the sidebar to fit the width of the content
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=breezechms.com
// @match        https://*.breezechms.com/*
// ==/UserScript==

(function() {
var replaceCss = () => {
		const head = document.getElementsByTagName("head")[0];
		const style = document.createElement("style");
		style.setAttribute("type", "text/css");
		style.textContent = "@media (min-width: 992px) { .mainsail-ui .mainsail-side-nav.extra-wide { flex-basis: fit-content; max-width: fit-content; }}";
		head.appendChild(style);
	};
	replaceCss();
})();