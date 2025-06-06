namespace WirecutterAntiModal {
  // keep track of actions so we can disable observer at some point
  let modalRemoved = false;
  let overflowFixed = false;

  const config: MutationObserverInit = {
    attributes: true,
    childList: true,
    subtree: true,
  };

  const elementToObserve = document.querySelector<HTMLBodyElement>('body');

  const removePaywallModal = (mutation: MutationRecord): void => {
    if (!modalRemoved && mutation.type === 'childList') {
      for (const item of mutation.addedNodes) {
        const element = item as Element;
        if (element.id === 'modal-portal-regiwall') {
          element.remove();
          modalRemoved = true;
        }
      }
    }
  };

  const removeScrollLock = (mutation: MutationRecord): void => {
    if (!overflowFixed && mutation.type === 'attributes' && mutation.attributeName === 'class') {
      const element = mutation.target as Element;
      if (element.tagName === 'BODY') {
        element.className = '';
        overflowFixed = true;
      }
    }
  };

  export const startObserver = (): void => {
    const callback: MutationCallback = (mutationsList, observer) => {
      for (const mutation of mutationsList) {
        removePaywallModal(mutation);
        removeScrollLock(mutation);
        // if we've fixed the issues, stop observing
        if (modalRemoved && overflowFixed) {
          observer.disconnect();
        }
      }
    };

    // Create an observer instance linked to the callback function and start observing the target node for configured mutations
    if (elementToObserve) {
      new MutationObserver(callback).observe(elementToObserve, config);
    }
  };
}
WirecutterAntiModal.startObserver();
