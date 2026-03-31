// ==UserScript==
// @name         Kansas City Star Anti-Annoy
// @namespace    https://github.com/bricemciver/GreasemonekeyScripts
// @version      1.0.1
// @author       Brice McIver <github@bricemciver.com>
// @description  Remove annoyances for non-paid users of kansascity.com
// @license      MIT
// @copyright    2024 Brice McIver
// @icon         https://icons.duckduckgo.com/ip3/kansascity.com.ico
// @match        https://www.kansascity.com/*
// @grant        none
// ==/UserScript==

(function() {
var hidePaywall = () => {
		new MutationObserver((records) => {
			for (const record of records) for (const addedNode of record.addedNodes) if (addedNode.nodeName === "MCC-PAYWALL") {
				if (addedNode.parentNode) addedNode.parentNode.removeChild(addedNode);
			}
		}).observe(document.body, {
			childList: true,
			subtree: true
		});
	};
	hidePaywall();
})();