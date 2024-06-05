(() => {
  // Options for the observer (which mutations to observe)
  const config: MutationObserverInit = {
    childList: true,
    attributes: true,
    subtree: true,
  };

  const removeTracking = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const dealsLink = (node as HTMLElement).querySelector<HTMLAnchorElement>("a[href*='tracking']");
      if (dealsLink) {
        dealsLink.parentElement?.remove();
      }
    }
  };

  // Callback function to execute when mutations are observed
  const callback: MutationCallback = mutationsList => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => removeTracking(node));
      }
      if (mutation.type === 'attributes' && mutation.attributeName === 'href' && mutation.target.nodeType === Node.ELEMENT_NODE) {
        const link = mutation.target as HTMLAnchorElement;
        if (link.href.includes('tracking')) {
          link.parentElement?.remove();
        }
      }
    }
  };

  // Create an observer instance linked to the callback function and observe
  new MutationObserver(callback).observe(document, config);
})();
