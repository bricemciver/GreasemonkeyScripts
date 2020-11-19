// ==UserScript==
// @name         Wirecutter Anti-modal
// @description  Stop modals asking you to register before viewing articles
// @namespace    bricem.scripts
// @version      0.0.1
// @author       bricem
// @match        https://www.nytimes.com/wirecutter/*
// @license MIT
// @grant        none
// ==/UserScript==

// keep track of actions so we can disable observer at some point
let modalRemoved = false
let overflowFixed = false

const startObserver = () => {
  const elementToObserve = document.querySelector("body")
  const config = { attributes: true, childList: true, subtree: true }
  const callback = (mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (!modalRemoved && mutation.type === 'childList') {
        mutation.addedNodes.forEach((item) => {
          if (item.id === 'modal-portal-regiwall') {
            item.remove()
              modalRemoved = true
          }
        })
      } else if (!overflowFixed && mutation.type === 'attributes' && mutation.attributeName === 'class' && mutation.target.tagName === 'BODY') {
        mutation.target.className = ''
        overflowFixed = true
      }
      // if we've fixed the issues, stop observing
      if (modalRemoved && overflowFixed) {
        observer.disconnect()
      }
    })
  }

  // Create an observer instance linked to the callback function and start observing the target node for configured mutations
  new MutationObserver(callback).observe(elementToObserve, config)
}

startObserver()
