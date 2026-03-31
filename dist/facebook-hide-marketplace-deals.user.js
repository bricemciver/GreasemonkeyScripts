// ==UserScript==
// @name         Facebook Hide Marketplace Deals
// @namespace    https://github.com/bricemciver/GreasemonekeyScripts
// @version      1.0.1
// @author       Brice McIver
// @description  Hide the sponsored deals that show up in marketplace searches
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=facebook.com
// @match        *://*.facebook.com/marketplace/*
// @grant        none
// ==/UserScript==

;(function () {
  var config = {
    childList: true,
    attributes: true,
    subtree: true,
  }
  var removeTracking = (node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const dealsLink = node.querySelector("a[href*='tracking']")
      if (dealsLink) dealsLink.parentElement?.remove()
    }
  }
  var callback = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length)
        for (const node of mutation.addedNodes) removeTracking(node)
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'href' &&
        mutation.target.nodeType === Node.ELEMENT_NODE
      ) {
        const link = mutation.target
        if (link.href.includes('tracking')) link.parentElement?.remove()
      }
    }
  }
  var main = () => {
    new MutationObserver(callback).observe(document, config)
  }
  main()
})()
