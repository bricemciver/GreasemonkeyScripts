// ==UserScript==
// @name         FMHY Base64 Auto Decoder
// @namespace    https://greasyfork.org/users/980489
// @version      1.0.1
// @author       Rust1667
// @description  Decode base64-encoded links in some pastebins and make URLs clickable
// @license      ISC
// @icon         https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://fmhy.net&size=64
// @downloadURL  https://update.greasyfork.org/scripts/485772/FMHY%20Base64%20Auto%20Decoder.user.js
// @updateURL    https://update.greasyfork.org/scripts/485772/FMHY%20Base64%20Auto%20Decoder.meta.js
// @match        *://rentry.co/*
// @match        *://rentry.org/*
// @match        *://pastes.fmhy.net/*
// @match        *://bin.disroot.org/?*#*
// @match        *://privatebin.net/?*#*
// @match        *://textbin.xyz/?*#*
// @match        *://bin.idrix.fr/?*#*
// @match        *://privatebin.rinuploads.org/?*#*
// @match        *://pastebin.com/*
// @grant        none
// ==/UserScript==

(function() {
var base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
	var decodeBase64 = (encodedString) => {
		return atob(encodedString);
	};
	var isURL = (str) => {
		return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(str);
	};
	var pasteBinReplace = () => {
		document.querySelectorAll(".de1").forEach((element) => {
			const text = element.textContent.trim();
			if (text.startsWith("aHR0")) {
				const decodedText = decodeBase64(text);
				const url = new URL(decodedText);
				const originalColor = window.getComputedStyle(element).color;
				const link = document.createElement("a");
				link.href = url.href;
				link.textContent = url.href;
				link.style.color = originalColor;
				element.textContent = "";
				element.appendChild(link);
			}
		});
	};
	var rentryReplace = () => {
		(FMHYmainBase64PageRegex.test(currentUrl) ? document.querySelectorAll("code") : document.querySelectorAll("code, p")).forEach((element) => {
			const content = element.textContent.trim();
			if (base64Regex.test(content)) {
				const decodedString = decodeBase64(content).trim();
				if (isURL(decodedString) || decodedString.includes("http") && decodedString.includes("\n")) if (!decodedString.includes("\n")) {
					const link = document.createElement("a");
					link.href = decodedString;
					link.textContent = decodedString;
					link.target = "_self";
					element.textContent = "";
					element.appendChild(link);
				} else element.innerHTML = decodedString.split("\n").map((line) => isURL(line.trim()) ? `<a href='${line.trim()}'>${line.trim()}</a>` : line.trim()).join("<br>");
			}
		});
	};
	var rawRentryReplace = () => {
		const lines = document.body.innerText.split("\n");
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.includes("`")) {
				const startIndex = line.indexOf("`");
				const endIndex = line.lastIndexOf("`");
				const encodedText = line.substring(startIndex + 1, endIndex).trim();
				const decodedText = atob(encodedText);
				lines[i] = line.substring(0, startIndex) + decodedText + line.substring(endIndex + 1);
			}
		}
		document.body.innerText = lines.join("\n");
	};
	var privateBinReplace = () => {
		const waitForDecryption = () => {
			const prettyPrintElement = document.getElementById("prettyprint");
			if (prettyPrintElement && prettyPrintElement.textContent.trim() !== "") {
				let decryptedText = prettyPrintElement.innerHTML.trim();
				const lines = decryptedText.split("\n");
				let modified = false;
				lines.forEach((line) => {
					if (base64Regex.test(line)) try {
						const trimmedText = decodeBase64(line).trim();
						if (isURL(trimmedText)) {
							decryptedText = decryptedText.replace(line, `<a href="${trimmedText}">${trimmedText}</a>`);
							modified = true;
						}
					} catch (_error) {
						alert(`Unable to decode the string: ${line}`);
					}
					else if (line.startsWith("`") && line.endsWith("`")) {
						const textInsideBackticks = line.slice(1, -1);
						if (base64Regex.test(textInsideBackticks)) try {
							const trimmedText = decodeBase64(textInsideBackticks).trim();
							if (isURL(trimmedText)) {
								decryptedText = decryptedText.replace(line, `<a href="${trimmedText}">${trimmedText}</a>`);
								modified = true;
							}
						} catch (_error) {
							alert(`Unable to decode the string: ${textInsideBackticks}`);
						}
					}
				});
				if (modified) prettyPrintElement.innerHTML = decryptedText;
			} else setTimeout(waitForDecryption, 500);
		};
		waitForDecryption();
	};
	var currentUrl = window.location.href;
	var rentryOrSnowbinRegex = /^(https?:\/\/(?:rentry\.co|rentry\.org|pastes\.fmhy\.net)\/[\w\W]+)/;
	var FMHYmainBase64PageRegex = /^https:\/\/rentry\.(?:co|org)\/fmhybase64(?:#.*)?/i;
	var fmhyBase64RawRentryPageRegex = /^https:\/\/rentry\.(co|org)\/FMHYBase64\/raw$/i;
	var privatebinDomainsRegex = /^(https?:\/\/(?:bin\.disroot\.org|privatebin\.net|textbin\.xyz|bin\.idrix\.fr|privatebin\.rinuploads\.org)\/[\w\W]+)/;
	var pastebinComRegex = /^https:\/\/pastebin\.com\/.*/;
	var main = () => {
		if (pastebinComRegex.test(currentUrl)) pasteBinReplace();
		else if (rentryOrSnowbinRegex.test(currentUrl) && !fmhyBase64RawRentryPageRegex.test(currentUrl)) rentryReplace();
		else if (fmhyBase64RawRentryPageRegex.test(currentUrl)) rawRentryReplace();
		else if (privatebinDomainsRegex.test(currentUrl)) privateBinReplace();
	};
	main();
})();