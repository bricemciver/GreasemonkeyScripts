// ==UserScript==
// @name         Shawnee Mission Post Paywall Remover
// @namespace    https://github.com/bricemciver/GreasemonekeyScripts
// @version      1.0.1
// @author       Brice McIver
// @description  Removes paywall restrictions from Shawnee Mission Post website
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=johnsoncountypost.com
// @match        https://shawneemissionpost.com/*
// @match        https://johnsoncountypost.com/*
// @match        https://bluevalleypost.com/*
// @grant        none
// ==/UserScript==

;(function () {
  var targetNode = document.documentElement
  var config = {
    childList: true,
    subtree: true,
    attributes: true,
  }
  var callback = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') hidePaywallElement(mutation)
      if (mutation.type === 'attributes') unblurElement(mutation)
    }
  }
  var unblurElement = (mutation) => {
    if (mutation.target.nodeType === Node.ELEMENT_NODE) {
      const element = mutation.target
      if (element.classList.contains('wkwp-blur')) element.classList.remove('wkwp-blur')
    }
  }
  var hidePaywallElement = (mutation) => {
    for (const node of Array.from(mutation.addedNodes))
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node
        if (element.classList.contains('wkwp-paywall')) element.setAttribute('style', 'display: none')
      }
  }
  var main = () => {
    new MutationObserver(callback).observe(targetNode, config)
  }
  main()
})()
