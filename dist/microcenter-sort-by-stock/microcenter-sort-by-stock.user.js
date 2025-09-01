// ==UserScript==
// @name Microcenter sort by stock
// @namespace https://github.com/bricemciver/GreasemonekeyScripts
// @author Brice McIver <github@bricemciver.com>
// @copyright 2024 Brice McIver
// @description Adds an option to sort the search results by number in stock at the selected store
// @license MIT
// @version 0.0.1
// @match *://www.microcenter.com/*
// @icon https://icons.duckduckgo.com/ip3/microcenter.com.ico
// @grant none
// ==/UserScript==

/* jshint esversion: 6 */
"use strict";
(() => {
  // src/main/microcenter-sort-by-stock/microcenter-sort-by-stock.user.ts
  var MicrocenterSortByStock;
  ((MicrocenterSortByStock2) => {
    MicrocenterSortByStock2.addOptionToMenu = () => {
      const menu = document.querySelector("div.searchActions > div.sorting ul.dropdown-menu");
      if (menu) {
        const firstEntry = menu.querySelector("li a");
        const stockSort = document.createElement("li");
        stockSort.classList.add("dropdown-itemLI");
        const stockSortLink = document.createElement("a");
        stockSortLink.classList.add("dropdown-item");
        if (firstEntry == null ? void 0 : firstEntry.href.includes("sortby")) {
          const sortByIndex = firstEntry.href.indexOf("sortby");
          stockSortLink.href = `${firstEntry.href.substring(0, sortByIndex)}sortby=stock`;
        } else {
          stockSortLink.href = `${firstEntry == null ? void 0 : firstEntry.href}&sortby=stock`;
        }
        stockSortLink.textContent = "Stock";
        stockSort.appendChild(stockSortLink);
        menu.appendChild(stockSort);
      }
    };
    MicrocenterSortByStock2.isSortByStock = () => {
      return window.location.search.includes("sortby=stock");
    };
    MicrocenterSortByStock2.sortByStock = () => {
      const selectedItem = document.querySelector("span.sortByText");
      if (selectedItem) {
        selectedItem.textContent = "Stock";
      }
      const entries = document.querySelectorAll("li.product_wrapper");
      const sortedEntries = Array.from(entries).sort(stockSortFunc);
      const menu = document.querySelector("#productGrid > ul");
      menu == null ? void 0 : menu.replaceChildren(...sortedEntries);
    };
    const stockSortFunc = (entry1, entry2) => {
      var _a, _b;
      let entry1Stock = 0;
      let entry2Stock = 0;
      let entry1StockLi = (_a = entry1.querySelector("span.inventoryCnt")) == null ? void 0 : _a.textContent;
      if (entry1StockLi) {
        entry1StockLi = entry1StockLi.replace(" IN STOCK", "");
        entry1Stock = entry1StockLi.includes("25+") ? 26 : Number.parseInt(entry1StockLi);
      }
      let entry2StockLi = (_b = entry2.querySelector("span.inventoryCnt")) == null ? void 0 : _b.textContent;
      if (entry2StockLi) {
        entry2StockLi = entry2StockLi.replace(" IN STOCK", "");
        entry2Stock = entry2StockLi.includes("25+") ? 26 : Number.parseInt(entry2StockLi);
      }
      return entry2Stock - entry1Stock;
    };
  })(MicrocenterSortByStock || (MicrocenterSortByStock = {}));
  MicrocenterSortByStock.addOptionToMenu();
  if (MicrocenterSortByStock.isSortByStock()) {
    MicrocenterSortByStock.sortByStock();
  }
})();
//# sourceMappingURL=microcenter-sort-by-stock.user.js.map
