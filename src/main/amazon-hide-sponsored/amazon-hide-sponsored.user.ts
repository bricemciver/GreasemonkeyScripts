namespace AmazonHideSponsored {
  export const findAndRemoveSponsoredItems = () => {
    const sponsoredItems = document.evaluate("//span[text()='Sponsored']", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    for (let i = 0; i < sponsoredItems.snapshotLength; i++) {
      const node = sponsoredItems.snapshotItem(i);
      if (node && node.nodeType === Node.ELEMENT_NODE) {
        // get the parent with a non-empty data-asin attribute
        let parent: HTMLElement = node as HTMLElement;
        while (parent && !parent.hasAttribute('data-asin') && parent.parentElement) {
          parent = parent.parentElement;
        }
        // hide the parent if it has a non-empty data-asin attribute
        if (parent && parent.hasAttribute('data-asin')) {
          parent.style.display = 'none';
        }
      }
    }
  };
}
AmazonHideSponsored.findAndRemoveSponsoredItems();
