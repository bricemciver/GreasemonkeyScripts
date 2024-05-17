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



"use strict";
(() => {
  // src/main/equip-bid-redesign/equip-bid-redesign.user.ts
  var currentIndex = 0;
  var addFocusStyling = () => {
    const styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
    styleEl.sheet?.insertRule("li.list-group-item.focused{outline: Highlight auto 1px; outline:-webkit-focus-ring-color auto 1px;}");
  };
  var retrieveNextPage = (href) => {
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
        const listGroupItem = document.createElement("li");
        listGroupItem.classList.add("list-group-item");
        if (entry.previousElementSibling?.previousElementSibling?.previousElementSibling) {
          listGroupItem.appendChild(entry.previousElementSibling?.previousElementSibling?.previousElementSibling);
        }
        if (entry.previousElementSibling?.previousElementSibling) {
          listGroupItem.appendChild(entry.previousElementSibling?.previousElementSibling);
        }
        if (entry.previousElementSibling) {
          listGroupItem.appendChild(entry.previousElementSibling);
        }
        entry.nextElementSibling?.remove();
        entry.remove();
        listGroup.appendChild(listGroupItem);
      });
      keyboardNavigation();
    });
  };
  var keyboardNavigation = () => {
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
  var processEntries = () => {
    const entries = document.querySelectorAll("div.lot-divider");
    if (!entries.length)
      return;
    const listGroup = document.createElement("ul");
    listGroup.classList.add("list-group");
    entries.forEach((entry) => {
      const listGroupItem = document.createElement("li");
      listGroupItem.classList.add("list-group-item");
      if (entry.previousElementSibling?.previousElementSibling?.previousElementSibling) {
        listGroupItem.appendChild(entry.previousElementSibling?.previousElementSibling?.previousElementSibling);
      }
      if (entry.previousElementSibling?.previousElementSibling) {
        listGroupItem.appendChild(entry.previousElementSibling?.previousElementSibling);
      }
      if (entry.previousElementSibling) {
        listGroupItem.appendChild(entry.previousElementSibling);
      }
      entry.nextElementSibling?.remove();
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
//# sourceMappingURL=equip-bid-redesign.user.js.map
