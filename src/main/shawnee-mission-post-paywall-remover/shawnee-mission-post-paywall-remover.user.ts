// ==UserScript==
// @name         Shawnee Mission Post Paywall Remover
// @namespace    bricemciver
// @description  Removes paywall restrictions from Shawnee Mission Post website
// @author       Brice McIver
// @license      MIT
// @version      0.1
// @match        https://shawneemissionpost.com/*
// @match        https://bluevalleypost.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shawneemissionpost.com
// @grant        none
// ==/UserScript==
{
  // Callback function to handle mutations
  const mutationCallback: MutationCallback = (mutationsList, _observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(addedNode => {
          if (addedNode.nodeType === Node.ELEMENT_NODE && (addedNode as Element).id === 'content-paywall-block') {
            (addedNode as Element).remove();
          }
        });
      }
      if (
        mutation.type === 'attributes' &&
        mutation.target.nodeType === Node.ELEMENT_NODE &&
        (mutation.target as Element).classList.contains('not-logged-in')
      ) {
        (mutation.target as Element).classList.remove('not-logged-in');
      }
    }
  };

  const initObserver = () => {
    // Create a new observer instance with the callback function
    const observer = new MutationObserver(mutationCallback);

    // Target a specific node
    const entry = document.querySelector<HTMLDivElement>('div.entry-content');

    if (entry) {
      // Start observing the target node for specified mutations
      observer.observe(entry, {
        childList: true, // Watch for changes in the child nodes
        subtree: true, // Watch all nested nodes as well
        attributeFilter: ['class'],
      });
    }
  };

  initObserver();
}
