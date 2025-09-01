// ==UserScript==
// @name FMHY Base64 Auto Decoder
// @version 2.4
// @author Rust1667
// @description Decode base64-encoded links in some pastebins and make URLs clickable
// @match *://rentry.co/*
// @match *://rentry.org/*
// @match *://pastes.fmhy.net/*
// @match *://bin.disroot.org/?*#*
// @match *://privatebin.net/?*#*
// @match *://textbin.xyz/?*#*
// @match *://bin.idrix.fr/?*#*
// @match *://privatebin.rinuploads.org/?*#*
// @match *://pastebin.com/*
// @grant none
// @icon https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://fmhy.net&size=64
// @namespace https://greasyfork.org/users/980489
// @downloadURL https://update.greasyfork.org/scripts/485772/FMHY%20Base64%20Auto%20Decoder.user.js
// @updateURL https://update.greasyfork.org/scripts/485772/FMHY%20Base64%20Auto%20Decoder.meta.js
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/base64-auto-decoder/base64-auto-decoder.user.ts
  var Base64AutoDecoder;
  ((Base64AutoDecoder2) => {
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    const decodeBase64 = (encodedString) => {
      return atob(encodedString);
    };
    const isURL = (str) => {
      const pattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
      return pattern.test(str);
    };
    const pasteBinReplace = () => {
      const elements = document.querySelectorAll(".de1");
      elements.forEach((element) => {
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
    const rentryReplace = () => {
      const elementsToCheck = FMHYmainBase64PageRegex.test(currentUrl) ? document.querySelectorAll("code") : document.querySelectorAll("code, p");
      elementsToCheck.forEach((element) => {
        const content = element.textContent.trim();
        if (base64Regex.test(content)) {
          const decodedString = decodeBase64(content).trim();
          if (isURL(decodedString) || decodedString.includes("http") && decodedString.includes("\n")) {
            if (!decodedString.includes("\n")) {
              const link = document.createElement("a");
              link.href = decodedString;
              link.textContent = decodedString;
              link.target = "_self";
              element.textContent = "";
              element.appendChild(link);
            } else {
              const lines = decodedString.split("\n");
              const links = lines.map((line) => isURL(line.trim()) ? `<a href='${line.trim()}'>${line.trim()}</a>` : line.trim());
              element.innerHTML = links.join("<br>");
            }
          }
        }
      });
    };
    const rawRentryReplace = () => {
      const lines = document.body.innerText.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes("`")) {
          const startIndex = line.indexOf("`");
          const endIndex = line.lastIndexOf("`");
          const encodedText = line.substring(startIndex + 1, endIndex).trim();
          const decodedText = atob(encodedText);
          const newLine = line.substring(0, startIndex) + decodedText + line.substring(endIndex + 1);
          lines[i] = newLine;
        }
      }
      document.body.innerText = lines.join("\n");
    };
    const privateBinReplace = () => {
      const waitForDecryption = () => {
        const prettyPrintElement = document.getElementById("prettyprint");
        if (prettyPrintElement && prettyPrintElement.textContent.trim() !== "") {
          let decryptedText = prettyPrintElement.innerHTML.trim();
          const lines = decryptedText.split("\n");
          let modified = false;
          lines.forEach((line) => {
            if (base64Regex.test(line)) {
              try {
                const decodedText = decodeBase64(line);
                const trimmedText = decodedText.trim();
                if (isURL(trimmedText)) {
                  decryptedText = decryptedText.replace(line, `<a href="${trimmedText}">${trimmedText}</a>`);
                  modified = true;
                }
              } catch (_error) {
                alert(`Unable to decode the string: ${line}`);
              }
            } else if (line.startsWith("`") && line.endsWith("`")) {
              const textInsideBackticks = line.slice(1, -1);
              if (base64Regex.test(textInsideBackticks)) {
                try {
                  const decodedText = decodeBase64(textInsideBackticks);
                  const trimmedText = decodedText.trim();
                  if (isURL(trimmedText)) {
                    decryptedText = decryptedText.replace(line, `<a href="${trimmedText}">${trimmedText}</a>`);
                    modified = true;
                  }
                } catch (_error) {
                  alert(`Unable to decode the string: ${textInsideBackticks}`);
                }
              }
            }
          });
          if (modified) {
            prettyPrintElement.innerHTML = decryptedText;
          }
        } else {
          setTimeout(waitForDecryption, 500);
        }
      };
      waitForDecryption();
    };
    const currentUrl = window.location.href;
    const rentryOrSnowbinRegex = /^(https?:\/\/(?:rentry\.co|rentry\.org|pastes\.fmhy\.net)\/[\w\W]+)/;
    const FMHYmainBase64PageRegex = /^https:\/\/rentry\.(?:co|org)\/fmhybase64(?:#.*)?/i;
    const fmhyBase64RawRentryPageRegex = /^https:\/\/rentry\.(co|org)\/FMHYBase64\/raw$/i;
    const privatebinDomainsRegex = /^(https?:\/\/(?:bin\.disroot\.org|privatebin\.net|textbin\.xyz|bin\.idrix\.fr|privatebin\.rinuploads\.org)\/[\w\W]+)/;
    const pastebinComRegex = /^https:\/\/pastebin\.com\/.*/;
    Base64AutoDecoder2.main = () => {
      if (pastebinComRegex.test(currentUrl)) {
        pasteBinReplace();
      } else if (rentryOrSnowbinRegex.test(currentUrl) && !fmhyBase64RawRentryPageRegex.test(currentUrl)) {
        rentryReplace();
      } else if (fmhyBase64RawRentryPageRegex.test(currentUrl)) {
        rawRentryReplace();
      } else if (privatebinDomainsRegex.test(currentUrl)) {
        privateBinReplace();
      }
    };
  })(Base64AutoDecoder || (Base64AutoDecoder = {}));
  Base64AutoDecoder.main();
})();
//# sourceMappingURL=base64-auto-decoder.user.js.map
