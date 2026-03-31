// ==UserScript==
// @name         Microcenter sort by stock
// @namespace    https://github.com/bricemciver/GreasemonekeyScripts
// @version      1.0.1
// @author       Brice McIver <github@bricemciver.com>
// @description  Adds an option to sort the search results by number in stock at the selected store
// @license      MIT
// @copyright    2024 Brice McIver
// @icon         https://icons.duckduckgo.com/ip3/microcenter.com.ico
// @match        *://www.microcenter.com/*
// @grant        none
// ==/UserScript==

;(function () {
  var addOptionToMenu = () => {
    const menu = document.querySelector('div.searchActions > div.sorting ul.dropdown-menu')
    if (menu) {
      const firstEntry = menu.querySelector('li a')
      const stockSort = document.createElement('li')
      stockSort.classList.add('dropdown-itemLI')
      const stockSortLink = document.createElement('a')
      stockSortLink.classList.add('dropdown-item')
      if (firstEntry?.href.includes('sortby')) {
        const sortByIndex = firstEntry.href.indexOf('sortby')
        stockSortLink.href = `${firstEntry.href.substring(0, sortByIndex)}sortby=stock`
      } else stockSortLink.href = `${firstEntry?.href}&sortby=stock`
      stockSortLink.textContent = 'Stock'
      stockSort.appendChild(stockSortLink)
      menu.appendChild(stockSort)
    }
  }
  var isSortByStock = () => {
    return window.location.search.includes('sortby=stock')
  }
  var sortByStock = () => {
    const selectedItem = document.querySelector('span.sortByText')
    if (selectedItem) selectedItem.textContent = 'Stock'
    const entries = document.querySelectorAll('li.product_wrapper')
    const sortedEntries = Array.from(entries).sort(stockSortFunc)
    document.querySelector('#productGrid > ul')?.replaceChildren(...sortedEntries)
  }
  var stockSortFunc = (entry1, entry2) => {
    let entry1Stock = 0
    let entry2Stock = 0
    let entry1StockLi = entry1.querySelector('span.inventoryCnt')?.textContent
    if (entry1StockLi) {
      entry1StockLi = entry1StockLi.replace(' IN STOCK', '')
      entry1Stock = entry1StockLi.includes('25+') ? 26 : Number.parseInt(entry1StockLi)
    }
    let entry2StockLi = entry2.querySelector('span.inventoryCnt')?.textContent
    if (entry2StockLi) {
      entry2StockLi = entry2StockLi.replace(' IN STOCK', '')
      entry2Stock = entry2StockLi.includes('25+') ? 26 : Number.parseInt(entry2StockLi)
    }
    return entry2Stock - entry1Stock
  }
  addOptionToMenu()
  if (isSortByStock()) sortByStock()
})()
