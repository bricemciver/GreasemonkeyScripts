// ==UserScript==
// @name         Kinja Deals Keyboard Navigation
// @namespace    https://github.com/bricemciver/GreasemonekeyScripts
// @version      1.0.1
// @author       Brice McIver
// @description  Use 'j' and 'k' keys for navigation of post content
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=theinventory.com
// @match        *://*.theinventory.com/*
// @grant        none
// ==/UserScript==

(function() {
var headTags = [];
	var pos = -1;
	var addGlobalStyle = (css) => {
		const head = document.getElementsByTagName("head")[0];
		const style = document.createElement("style");
		style.innerHTML = css;
		head.appendChild(style);
	};
	var keyPressed = (event) => {
		if (event.code === "KeyK" || event.code === "KeyJ") {
			if (headTags[pos]) headTags[pos].className = headTags[pos].className.replace(" selected", "");
			if ("KeyK" === event.code) pos--;
			if ("KeyJ" === event.code) pos++;
			if (pos >= headTags.length) pos = 0;
			if (pos < 0) pos = headTags.length - 1;
			headTags[pos].className = `${headTags[pos].className} selected`;
			headTags[pos].scrollIntoView();
		}
	};
	var removeCruft = () => {
		for (const element of document.querySelectorAll(".js_movable_ad_slot")) element.remove();
		for (const element of document.querySelectorAll(".connatix-container")) element.remove();
		for (const element of Array.from(document.getElementsByTagName("span")).filter((item) => item.textContent === "G/O Media may get a commission")) element.closest("aside")?.remove();
		for (const element of document.querySelectorAll("#sidebar_wrapper")) element.closest("aside")?.remove();
	};
	var createEntries = (containerDiv) => {
		let newElement = null;
		for (const element of Array.from(containerDiv.children)) if (element.tagName === "H2" && element.textContent?.length && element.textContent.length > 0) {
			newElement = document.createElement("div");
			newElement.className = "inlineFrame";
			element.insertAdjacentElement("beforebegin", newElement);
			newElement.append(element);
		} else if (newElement) newElement.append(element);
	};
	var addListeners = (containerDiv) => {
		headTags.push(containerDiv);
		headTags.push(...Array.from(containerDiv.querySelectorAll("div.inlineFrame, h3, h4")));
		document.addEventListener("keydown", keyPressed);
	};
	var main = () => {
		const mainDiv = document.querySelector(".js_post-content .js_commerce-inset-grid");
		if (mainDiv) {
			addGlobalStyle("div.inlineFrame { margin-top:17px; margin-bottom:17px; padding:33px; border-radius:3px; border: 1px solid rgba(0,0,0,0.05) }");
			addGlobalStyle("div.inlineFrame.selected { border: 1px solid rgba(0, 0, 0, 0.15) }");
			addGlobalStyle("main { width:100% !important }");
			if (mainDiv.parentElement) {
				createEntries(mainDiv.parentElement);
				addListeners(mainDiv.parentElement);
			}
		}
	};
	removeCruft();
	main();
})();