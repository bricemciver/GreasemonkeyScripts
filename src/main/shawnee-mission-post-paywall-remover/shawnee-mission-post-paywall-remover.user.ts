// Select the node that should be monitored
const targetNode = document.documentElement;

// Options for the observer (which mutations to observe)
const config = { childList: true, subtree: true, attributes: true };

// Callback function to execute when mutations are observed
const callback: MutationCallback = function (mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.classList.contains('wkwp-paywall')) {
            element.setAttribute('style', 'display: none');
          }
        }
      }
    }
    if (mutation.type === 'attributes') {
      if (mutation.target.nodeType === Node.ELEMENT_NODE) {
        const element = mutation.target as Element;
        if (element.classList.contains('wkwp-blur')) {
          element.classList.remove('wkwp-blur');
        }
      }
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);
