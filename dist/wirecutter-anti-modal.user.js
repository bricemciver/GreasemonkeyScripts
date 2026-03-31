// ==UserScript==
// @name         Wirecutter Anti-modal
// @namespace    https://github.com/bricemciver/GreasemonekeyScripts
// @version      1.0.1
// @author       Brice McIver
// @description  Stop modals asking you to register before viewing articles
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nytimes.com
// @match        https://www.nytimes.com/wirecutter/*
// @grant        none
// ==/UserScript==

;(function () {
  var modalRemoved = false
  var overflowFixed = false
  var config = {
    attributes: true,
    childList: true,
    subtree: true,
  }
  var elementToObserve = document.querySelector('body')
  var removePaywallModal = (mutation) => {
    if (!modalRemoved && mutation.type === 'childList')
      for (const item of mutation.addedNodes) {
        const element = item
        if (element.id === 'modal-portal-regiwall') {
          element.remove()
          modalRemoved = true
        }
      }
  }
  var removeScrollLock = (mutation) => {
    if (!overflowFixed && mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const element = mutation.target
      if (element.tagName === 'BODY') {
        element.className = ''
        overflowFixed = true
      }
    }
  }
  var startObserver = () => {
    const callback = (mutationsList, observer) => {
      for (const mutation of mutationsList) {
        removePaywallModal(mutation)
        removeScrollLock(mutation)
        if (modalRemoved && overflowFixed) observer.disconnect()
      }
    }
    if (elementToObserve) new MutationObserver(callback).observe(elementToObserve, config)
  }
  startObserver()
})()
