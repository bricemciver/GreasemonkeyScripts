// ==UserScript==
// @name Equip-Bid Redesign
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @description Enhancements to the Equip Bid auction website
// @license MIT
// @version 0.1
// @match https://www.equip-bid.com/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=equip-bid.com
// @grant GM_xmlhttpRequest
// @grant GM.xmlHttpRequest
// @connect equip-bid.com
// ==/UserScript==



/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/equip-bid-redesign/equip-bid-redesign.user.ts
  (() => {
    let currentIndex = 0;
    const addFocusStyling = () => {
      var _a;
      const styleEl = document.createElement("style");
      document.head.appendChild(styleEl);
      (_a = styleEl.sheet) == null ? void 0 : _a.insertRule("li.list-group-item.focused{outline: Highlight auto 1px; outline:-webkit-focus-ring-color auto 1px;}");
    };
    const retrieveNextPage = (href) => {
      fetch(href).then((response) => response.text()).then((data) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");
        const entries = doc.querySelectorAll("div.lot-divider");
        if (!entries.length)
          return;
        const listGroup = document.querySelector("div.lot-list > ul.list-group");
        if (!listGroup)
          return;
        entries.forEach((entry) => {
          var _a, _b, _c, _d, _e, _f, _g;
          const listGroupItem = document.createElement("li");
          listGroupItem.classList.add("list-group-item");
          if ((_b = (_a = entry.previousElementSibling) == null ? void 0 : _a.previousElementSibling) == null ? void 0 : _b.previousElementSibling) {
            listGroupItem.appendChild((_d = (_c = entry.previousElementSibling) == null ? void 0 : _c.previousElementSibling) == null ? void 0 : _d.previousElementSibling);
          }
          if ((_e = entry.previousElementSibling) == null ? void 0 : _e.previousElementSibling) {
            listGroupItem.appendChild((_f = entry.previousElementSibling) == null ? void 0 : _f.previousElementSibling);
          }
          if (entry.previousElementSibling) {
            listGroupItem.appendChild(entry.previousElementSibling);
          }
          (_g = entry.nextElementSibling) == null ? void 0 : _g.remove();
          entry.remove();
          listGroup.appendChild(listGroupItem);
        });
        keyboardNavigation();
      });
    };
    const keyboardNavigation = () => {
      const listGroup = document.querySelector("div.lot-list > ul.list-group");
      if (!listGroup)
        return;
      const listGroupItems = Array.from(listGroup.querySelectorAll("li.list-group-item"));
      const next = document.querySelector("li.next > a");
      const handleKeyDown = (event) => {
        if (event.key === "k") {
          event.preventDefault();
          listGroupItems[currentIndex].classList.remove("focused");
          currentIndex = currentIndex - 1;
          if (currentIndex < 0) {
            currentIndex = 0;
          } else {
            listGroupItems[currentIndex].scrollIntoView({ block: "center" });
            listGroupItems[currentIndex].classList.add("focused");
          }
        }
        if (event.key === "j") {
          event.preventDefault();
          listGroupItems[currentIndex].classList.remove("focused");
          currentIndex = currentIndex + 1;
          if (currentIndex >= listGroupItems.length) {
            if (next) {
              retrieveNextPage(next.href);
            } else {
              currentIndex = listGroupItems.length - 1;
            }
          } else {
            listGroupItems[currentIndex].scrollIntoView({ block: "center" });
            listGroupItems[currentIndex].classList.add("focused");
          }
        }
      };
      document.documentElement.addEventListener("keydown", handleKeyDown);
      listGroupItems[currentIndex].scrollIntoView({ block: "center" });
      listGroupItems[currentIndex].classList.add("focused");
    };
    const processEntries = () => {
      const entries = document.querySelectorAll("div.lot-divider");
      if (!entries.length)
        return;
      const listGroup = document.createElement("ul");
      listGroup.classList.add("list-group");
      entries.forEach((entry) => {
        var _a, _b, _c, _d, _e, _f, _g;
        const listGroupItem = document.createElement("li");
        listGroupItem.classList.add("list-group-item");
        if ((_b = (_a = entry.previousElementSibling) == null ? void 0 : _a.previousElementSibling) == null ? void 0 : _b.previousElementSibling) {
          listGroupItem.appendChild((_d = (_c = entry.previousElementSibling) == null ? void 0 : _c.previousElementSibling) == null ? void 0 : _d.previousElementSibling);
        }
        if ((_e = entry.previousElementSibling) == null ? void 0 : _e.previousElementSibling) {
          listGroupItem.appendChild((_f = entry.previousElementSibling) == null ? void 0 : _f.previousElementSibling);
        }
        if (entry.previousElementSibling) {
          listGroupItem.appendChild(entry.previousElementSibling);
        }
        (_g = entry.nextElementSibling) == null ? void 0 : _g.remove();
        entry.remove();
        listGroup.appendChild(listGroupItem);
      });
      const lotList = document.querySelector("div.lot-list > hr");
      if (!lotList)
        return;
      lotList.insertAdjacentElement("afterend", listGroup);
      keyboardNavigation();
    };
    addFocusStyling();
    processEntries();
  })();
})();
//# sourceMappingURL=equip-bid-redesign.user.js.map
